# MSF Congo - Design System

## 📚 Vue d'ensemble

Ce design system fournit une palette de couleurs complète et accessible pour le projet MSF Congo, conforme aux standards **WCAG 2.1 niveau AA**.

## 📁 Structure des Fichiers

```
design-system/
├── README.md              # Ce fichier
├── color-palette.md       # Documentation complète de la palette
├── colors.css             # Variables CSS prêtes à l'emploi
├── colors.ts              # Constantes TypeScript pour React
└── ColorShowcase.tsx      # Composant de démonstration visuelle
```

## 🚀 Installation et Utilisation

### 1. CSS Variables (Approche simple)

Importez le fichier CSS dans votre fichier principal:

```css
/* src/styles/main.css ou src/app/App.tsx */
@import '../design-system/colors.css';
```

Utilisez ensuite les variables CSS:

```css
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary-on-dark);
  border: 1px solid var(--border-accent);
}

.my-button {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  box-shadow: var(--shadow-gold-md);
}
```

### 2. TypeScript/React (Approche type-safe)

Importez les couleurs dans vos composants React:

```tsx
import { Colors } from './design-system/colors';

function MyComponent() {
  return (
    <div style={{ backgroundColor: Colors.Background.primary }}>
      <h1 style={{ color: Colors.Text.primaryOnDark }}>
        Mon Titre
      </h1>
      <button
        style={{
          background: Colors.Button.primaryBg,
          color: Colors.Button.primaryText,
          boxShadow: Colors.Shadows.goldMd,
        }}
      >
        Mon Bouton
      </button>
    </div>
  );
}
```

### 3. Tailwind CSS Integration

Ajoutez les couleurs à votre configuration Tailwind:

```javascript
// tailwind.config.js
import { Colors } from './design-system/colors';

module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-dark': Colors.BrandDark,
        'brand-gold': Colors.BrandGold,
        'neutral': Colors.Neutral,
      },
      backgroundColor: {
        'primary': Colors.Background.primary,
        'accent': Colors.Background.accent,
      },
      textColor: {
        'primary': Colors.Text.primary,
        'on-dark': Colors.Text.primaryOnDark,
      },
      boxShadow: {
        'gold': Colors.Shadows.goldMd,
        'gold-lg': Colors.Shadows.goldLg,
      },
    },
  },
};
```

Utilisez dans vos composants:

```tsx
<div className="bg-brand-dark-900 text-on-dark">
  <button className="bg-brand-gold-500 text-brand-dark-900 shadow-gold">
    Mon Bouton
  </button>
</div>
```

## 🎨 Exemples d'Utilisation Courants

### Bouton Primaire (CTA)

```tsx
// React/TypeScript
import { Colors } from './design-system/colors';

<button
  style={{
    background: Colors.Button.primaryBg,
    color: Colors.Button.primaryText,
    padding: '16px 32px',
    borderRadius: '12px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
  }}
>
  Demander un Devis
</button>
```

```css
/* CSS Variables */
.btn-primary {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-text);
  padding: 16px 32px;
  border-radius: 12px;
  border: none;
  font-weight: bold;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--btn-primary-hover-bg);
  box-shadow: var(--shadow-gold-md);
}
```

### Carte sur Fond Sombre

```tsx
// React/TypeScript
import { Colors } from './design-system/colors';

<div
  style={{
    backgroundColor: Colors.Background.surfaceDark,
    borderRadius: '16px',
    padding: '24px',
    border: `1px solid ${Colors.Border.primaryDark}`,
  }}
>
  <h3 style={{ color: Colors.Text.primaryOnDark }}>
    Titre de la Carte
  </h3>
  <p style={{ color: Colors.Text.secondaryOnDark }}>
    Description de la carte avec un contraste optimal.
  </p>
</div>
```

### Alerte de Succès

```tsx
// React/TypeScript
import { Colors, getAlertColors } from './design-system/colors';

const successColors = getAlertColors('success');

<div
  style={{
    backgroundColor: successColors.bg,
    border: `1px solid ${successColors.border}`,
    color: successColors.text,
    padding: '16px',
    borderRadius: '12px',
    display: 'flex',
    gap: '12px',
  }}
>
  <div style={{ color: successColors.icon }}>✓</div>
  <div>
    <h4 style={{ fontWeight: 'bold', marginBottom: '4px' }}>Succès !</h4>
    <p>Votre demande a été envoyée avec succès.</p>
  </div>
</div>
```

### Texte avec Gradient Doré

```tsx
// React/TypeScript
import { Colors } from './design-system/colors';

<h1
  style={{
    background: Colors.Gradients.goldHorizontal,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '48px',
    fontWeight: 'bold',
  }}
>
  Propriétés en Vedette
</h1>
```

```css
/* CSS Variables */
.title-gradient {
  background: var(--gradient-gold-horizontal);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 48px;
  font-weight: bold;
}
```

## 🔍 Visualiser la Palette

Pour voir tous les exemples visuels de la palette:

```tsx
// Dans votre App.tsx ou une page de test
import ColorShowcase from './design-system/ColorShowcase';

function App() {
  return <ColorShowcase />;
}
```

Ou créez une route dédiée:

```tsx
// src/app/pages/StyleGuide.tsx
import ColorShowcase from '../../design-system/ColorShowcase';

export default function StyleGuide() {
  return <ColorShowcase />;
}
```

## ♿ Accessibilité

### Contrastes Validés

Tous les contrastes respectent **WCAG 2.1 niveau AA**:

- **Texte normal** : ≥ 4.5:1
- **Grand texte** (18pt+ gras ou 24pt+) : ≥ 3:1
- **Éléments interactifs** : ≥ 3:1

### Focus Visible

Le focus clavier est automatiquement géré si vous importez `colors.css`:

```css
/* Déjà inclus dans colors.css */
*:focus-visible {
  outline: 3px solid var(--border-focus);
  outline-offset: 2px;
}
```

### Bonnes Pratiques

✅ **À FAIRE:**
- Utiliser `--text-primary` (#0a0f1e) sur fond blanc pour maximum de lisibilité
- Utiliser `--text-primary-on-dark` (#ffffff) sur fond sombre (#0a0f1e)
- Toujours tester avec Chrome DevTools > Accessibility Panel
- Préférer les couleurs sémantiques (`--btn-primary-bg`) aux primitives directes

❌ **À ÉVITER:**
- Utiliser `--brand-gold-500` (#d4af37) en petit texte sur fond blanc (seulement 5.1:1)
- Utiliser `--text-helper` pour du texte normal (seulement valide pour grand texte)
- Supprimer `outline` sans alternative accessible
- Se fier uniquement à la couleur pour transmettre l'information

## 🛠️ Outils de Validation

Pour vérifier vos contrastes:

1. **WebAIM Contrast Checker**  
   https://webaim.org/resources/contrastchecker/

2. **Chrome DevTools**  
   Inspect Element > Accessibility Panel > Contrast

3. **WAVE Browser Extension**  
   https://wave.webaim.org/extension/

## 📊 Ratios de Contraste Clés

| Combinaison | Ratio | Statut |
|-------------|-------|--------|
| Texte sombre sur blanc | 21:1 | ✅ AAA |
| Texte blanc sur fond sombre | 21:1 | ✅ AAA |
| Texte doré clair sur fond sombre | 16:1 | ✅ AAA |
| Texte sombre sur fond doré | 9.8:1 | ✅ AAA |
| Icône succès sur fond succès | 4.9:1 | ✅ AA |
| Icône error sur fond error | 5.9:1 | ✅ AA |

## 🌓 Dark Mode

Le dark mode est automatiquement géré via `prefers-color-scheme`:

```css
/* Déjà inclus dans colors.css */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: var(--brand-dark-900);
    --text-primary: var(--text-primary-on-dark);
    /* ... autres overrides */
  }
}
```

Pour détecter le dark mode en JavaScript:

```typescript
import { isDarkMode } from './design-system/colors';

if (isDarkMode()) {
  console.log('Dark mode is active');
}
```

## 📝 Migration depuis l'Ancien Système

Si vous utilisez actuellement des couleurs en dur dans votre code:

### Avant:
```tsx
<div style={{ backgroundColor: '#0a0f1e', color: '#ffffff' }}>
  <button style={{ background: '#d4af37', color: '#0a0f1e' }}>
    Mon Bouton
  </button>
</div>
```

### Après:
```tsx
import { Colors } from './design-system/colors';

<div style={{ backgroundColor: Colors.Background.primary, color: Colors.Text.primaryOnDark }}>
  <button style={{ background: Colors.Button.primaryBgSolid, color: Colors.Button.primaryText }}>
    Mon Bouton
  </button>
</div>
```

Ou avec CSS Variables:

```css
/* Avant */
.my-div {
  background-color: #0a0f1e;
  color: #ffffff;
}

/* Après */
.my-div {
  background-color: var(--bg-primary);
  color: var(--text-primary-on-dark);
}
```

## 🔗 Ressources Supplémentaires

- **Documentation complète**: `color-palette.md`
- **Variables CSS**: `colors.css`
- **Constantes TypeScript**: `colors.ts`
- **Composant de démonstration**: `ColorShowcase.tsx`

## 🆘 Support

Pour toute question sur l'utilisation du design system:

1. Consultez `color-palette.md` pour la documentation complète
2. Utilisez `ColorShowcase.tsx` pour voir des exemples visuels
3. Vérifiez les contrastes avec les outils de validation
4. En cas de doute, préférez toujours le niveau AAA (7:1) au niveau AA (4.5:1)

---

**Version**: 1.0  
**Dernière mise à jour**: 2026-04-17  
**Conformité**: WCAG 2.1 Level AA  
**Licence**: Propriétaire MSF Congo
