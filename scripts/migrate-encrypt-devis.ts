import { createClient } from "@supabase/supabase-js";
import CryptoJS from "crypto-js";
import * as fs from "node:fs";
import * as path from "node:path";

// 1. Chargement manuel des variables d'environnement depuis .env si présentes
const loadEnvFile = (): void => {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex !== -1) {
        const key = trimmed.slice(0, separatorIndex).trim();
        let value = trimmed.slice(separatorIndex + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
};

loadEnvFile();

// 2. Récupération des clés
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const encryptionKey = process.env.ENCRYPTION_KEY || process.env.VITE_ENCRYPTION_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Erreur: SUPABASE_URL (ou VITE_SUPABASE_URL) et SUPABASE_SERVICE_ROLE_KEY (ou VITE_SUPABASE_ANON_KEY) sont obligatoires.",
  );
  process.exit(1);
}

if (!encryptionKey) {
  console.error(
    "❌ Erreur: ENCRYPTION_KEY ou VITE_ENCRYPTION_KEY est obligatoire.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Utilitaires de chiffrement AES-256
const encryptAES = (text: string): string => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, encryptionKey).toString();
};

const SENSITIVE_FIELDS = [
  "client_phone",
  "client_address",
  "client_city",
  "client_country",
  "client_profession",
  "client_company",
  "message",
] as const;

type SensitiveFieldName = (typeof SENSITIVE_FIELDS)[number];

interface DevisRecord {
  id: string | number;
  [key: string]: unknown;
}

// 4. Exécution de la migration rétroactive
async function runMigration(): Promise<void> {
  console.log("==================================================");
  console.log("🔒 MIGRATION RÉTROACTIVE : CHIFFREMENT AES-256");
  console.log("==================================================");
  console.log(`🌐 Supabase URL    : ${supabaseUrl}`);
  console.log(
    `🔑 Clé utilisée    : ${supabaseKey.substring(0, 10)}... (masquée)`,
  );
  console.log("⏳ Récupération des demandes de devis...");

  const pageSize = 100;
  let page = 0;
  let totalProcessed = 0;
  let totalEncrypted = 0;
  let totalAlreadyEncrypted = 0;
  let totalErrors = 0;

  while (true) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data: rows, error } = await supabase
      .from("devis_requests")
      .select("*")
      .range(from, to);

    if (error) {
      console.error(
        `❌ Erreur lors de la lecture des devis (page ${page}) :`,
        error.message,
      );
      break;
    }

    if (!rows || rows.length === 0) {
      break;
    }

    for (const rawRow of rows) {
      const row = rawRow as DevisRecord;
      totalProcessed++;
      const updates: Record<string, string> = {};
      let needsUpdate = false;

      for (const field of SENSITIVE_FIELDS) {
        const val = row[field];
        if (typeof val === "string" && val.trim().length > 0) {
          // Vérifier si la valeur n'est pas déjà chiffrée
          if (!val.startsWith("U2FsdGVkX1")) {
            updates[field] = encryptAES(val);
            needsUpdate = true;
          }
        }
      }

      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from("devis_requests")
          .update(updates)
          .eq("id", row.id);

        if (updateError) {
          console.error(
            `❌ Échec de mise à jour pour ID ${row.id}: ${updateError.message}`,
          );
          totalErrors++;
        } else {
          console.log(
            `✅ Ligne ID ${row.id} chiffrée avec succès (${Object.keys(updates).join(", ")})`,
          );
          totalEncrypted++;
        }
      } else {
        totalAlreadyEncrypted++;
      }
    }

    if (rows.length < pageSize) {
      break;
    }

    page++;
  }

  console.log("\n==================================================");
  console.log("📊 RÉSUMÉ DE LA MIGRATION");
  console.log("==================================================");
  console.log(`Total analysé       : ${totalProcessed}`);
  console.log(`Lignes chiffrées    : ${totalEncrypted}`);
  console.log(`Déjà chiffrées/vide : ${totalAlreadyEncrypted}`);
  console.log(`Erreurs             : ${totalErrors}`);
  console.log("==================================================");

  if (totalErrors === 0) {
    console.log("🎉 Migration terminée avec succès.");
  } else {
    console.warn("⚠️ Migration terminée avec des avertissements/erreurs.");
  }
}

runMigration().catch((err: unknown) => {
  console.error("❌ Erreur fatale durant la migration :", err);
  process.exit(1);
});
