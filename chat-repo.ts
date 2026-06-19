/**
 * chat-repo.ts
 * Mode conversation interactive avec contexte de ta codebase.
 * Le modèle "connaît" ton code et tu peux lui poser des questions en boucle.
 *
 * Usage:
 *   npx tsx chat-repo.ts ./src/app/pages
 *   npx tsx chat-repo.ts ./src/app/pages/ClientAppointments.tsx   ← fichier unique
 *
 * Commandes spéciales dans le chat :
 *   /quit ou /exit  → quitter
 *   /clear          → effacer l'historique (garde le contexte du code)
 *   /files          → afficher les fichiers chargés
 */

import Groq from "groq-sdk";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

// ─── Config ───────────────────────────────────────────────────────────────────

const MODEL = "qwen/qwen3-32b";

const IGNORED_DIRS = new Set([
  ".git", "node_modules", "dist", "build", ".next", ".nuxt",
  "__pycache__", ".venv", "vendor", "coverage", ".turbo", ".cache",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".json", ".env.example",
  ".css", ".scss", ".yaml", ".yml", ".prisma",
]);

const MAX_FILE_SIZE_BYTES = 40 * 1024;
const MAX_TOTAL_CHARS = 18_000; // Plan gratuit Groq

// ─── Collecte fichiers ────────────────────────────────────────────────────────

function collectFiles(target: string): string[] {
  // Si c'est un fichier unique, on le charge directement
  if (fs.statSync(target).isFile()) return [target];

  const results: string[] = [];
  function walk(dir: string) {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }

    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) {
        const ext = path.extname(entry.name) || entry.name;
        if (ALLOWED_EXTENSIONS.has(ext)) results.push(full);
      }
    }
  }
  walk(target);
  return results;
}

function buildContext(targetPath: string): {
  context: string;
  loadedFiles: string[];
  skipped: number;
} {
  const all = collectFiles(targetPath);

  // Priorité : package.json > tsconfig > le reste
  all.sort((a, b) => {
    const prio = (f: string) => {
      const base = path.basename(f);
      if (base === "package.json") return 0;
      if (base === "tsconfig.json") return 1;
      return 2;
    };
    return prio(a) - prio(b);
  });

  let context = "";
  let totalChars = 0;
  const loadedFiles: string[] = [];
  let skipped = 0;

  for (const filePath of all) {
    const stat = fs.statSync(filePath);
    if (stat.size > MAX_FILE_SIZE_BYTES) { skipped++; continue; }

    let content: string;
    try { content = fs.readFileSync(filePath, "utf-8"); }
    catch { skipped++; continue; }

    const rel = path.relative(targetPath, filePath);
    const block = `\n\n### 📄 ${rel}\n\`\`\`${path.extname(filePath).slice(1)}\n${content}\n\`\`\``;

    if (totalChars + block.length > MAX_TOTAL_CHARS) { skipped++; continue; }

    context += block;
    totalChars += block.length;
    loadedFiles.push(rel);
  }

  return { context, loadedFiles, skipped };
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
Tu es un Architecte Logiciel Senior spécialisé en TypeScript, React, Node.js et Supabase.
Tu as accès au code source du projet de l'utilisateur (fourni dans le premier message).

### DIRECTIVES STRICTES :
1. **Langue** : TOUJOURS en français, y compris tes pensées internes (<think>).
2. **Format** : Markdown, direct, sans intro inutile.
3. **Code** : Quand tu corriges, fournis TOUJOURS le code corrigé complet, prêt à copier-coller.
4. **Précision** : Cite le nom du fichier et la ligne concernée à chaque fois.
5. **Proactivité** : Si tu détectes un problème connexe non demandé, signale-le en bas sous "⚠️ Aussi détecté".
`.trim();

// ─── Appel API avec historique ────────────────────────────────────────────────

type Message = { role: "user" | "assistant" | "system"; content: string };

async function askGroq(groq: Groq, messages: Message[]): Promise<string> {
  const stream = await groq.chat.completions.create({
    model: MODEL,
    messages,
    stream: true,
    temperature: 0.3,
    max_tokens: 1200,
  });

  let fullResponse = "";
  process.stdout.write("\n🤖 ");

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    process.stdout.write(delta);
    fullResponse += delta;
  }

  console.log("\n");
  return fullResponse;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("❌ GROQ_API_KEY manquant. Exécute : export GROQ_API_KEY='gsk_...'");
    process.exit(1);
  }

  const targetPath = path.resolve(process.argv[2] ?? ".");
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Chemin introuvable : ${targetPath}`);
    process.exit(1);
  }

  const groq = new Groq({ apiKey });

  console.log(`\n🔍 Chargement du contexte : ${targetPath}`);
  const { context, loadedFiles, skipped } = buildContext(targetPath);

  if (loadedFiles.length === 0) {
    console.error("❌ Aucun fichier lisible dans les limites du quota.");
    process.exit(1);
  }

  console.log(`📦 ${loadedFiles.length} fichier(s) chargé(s), ${skipped} ignoré(s)`);
  console.log(`📂 Fichiers : ${loadedFiles.join(", ")}`);
  console.log(`🤖 Modèle : ${MODEL}`);
  console.log('\n💡 Tape ta question. Commandes : /quit, /clear, /files');
  console.log("─".repeat(60));

  // Historique de conversation — le contexte est injecté une seule fois
  const history: Message[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Voici la codebase sur laquelle on va travailler :\n${context}\n\n---\nJe vais te poser des questions sur ce code. Confirme que tu l'as bien analysé en 2-3 lignes max.`,
    },
  ];

  // Premier message : le modèle prend connaissance du code
  const intro = await askGroq(groq, history);
  history.push({ role: "assistant", content: intro });

  // ─── Boucle interactive ───────────────────────────────────────────────────

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askUser = () =>
    new Promise<string>((resolve) => rl.question("🧑 Toi → ", resolve));

  while (true) {
    const input = (await askUser()).trim();

    if (!input) continue;

    // Commandes spéciales
    if (input === "/quit" || input === "/exit") {
      console.log("\n👋 Session terminée.\n");
      rl.close();
      break;
    }

    if (input === "/files") {
      console.log(`\n📂 Fichiers en contexte :\n${loadedFiles.map(f => `  • ${f}`).join("\n")}\n`);
      continue;
    }

    if (input === "/clear") {
      // Efface l'historique de chat MAIS garde le contexte initial du code
      history.splice(2); // conserve system + premier échange
      console.log("🧹 Historique effacé (contexte du code conservé).\n");
      continue;
    }

    // Question normale
    history.push({ role: "user", content: input });

    try {
      const response = await askGroq(groq, history);
      history.push({ role: "assistant", content: response });
    } catch (err: any) {
      const msg = err.message ?? String(err);
      if (msg.includes("rate_limit")) {
        console.error("⏳ Rate limit atteint. Attends 60 secondes et réessaie.\n");
      } else {
        console.error("❌ Erreur API :", msg, "\n");
      }
      // On retire le dernier message user pour pouvoir réessayer
      history.pop();
    }
  }
}

main().catch((err) => {
  console.error("❌ Erreur critique :", err.message ?? err);
  process.exit(1);
});
