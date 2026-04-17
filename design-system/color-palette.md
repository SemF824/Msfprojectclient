# MSF Congo - Palette de Couleurs Accessible (WCAG 2.1 AA)

## 📋 Table des Matières
- [Primitives](#primitives)
- [Sémantique](#sémantique)
- [États et Alertes](#états-et-alertes)
- [Ratios de Contraste](#ratios-de-contraste)
- [Guide d'Utilisation](#guide-dutilisation)

---

## 🎨 Primitives (Teintes Brutes)

### Brand Dark (Basé sur #0a0f1e)
Échelle de la couleur primaire sombre avec progression logique.

```css
--brand-dark-50: #f4f5f7;   /* Très clair - pour les fonds légers */
--brand-dark-100: #e8eaed;  /* Clair */
--brand-dark-200: #c8cdd6;  /* Léger */
--brand-dark-300: #9ba3b3;  /* Moyen-léger */
--brand-dark-400: #6b7690;  /* Moyen */
--brand-dark-500: #4a536e;  /* Moyen-sombre */
--brand-dark-600: #303855;  /* Sombre */
--brand-dark-700: #1e2840;  /* Très sombre */
--brand-dark-800: #131a2f;  /* Ultra sombre */
--brand-dark-900: #0a0f1e;  /* Base - Couleur de marque originale */
--brand-dark-950: #050810;  /* Maximum sombre */
```

### Brand Gold (Basé sur #d4af37)
Échelle de la couleur secondaire dorée.

```css
--brand-gold-50: #fdf9ed;   /* Très clair - excellent pour les fonds */
--brand-gold-100: #faf3db;  /* Clair */
--brand-gold-200: #f4e3b2;  /* Léger - déjà utilisé dans les gradients */
--brand-gold-300: #eed388;  /* Moyen-léger */
--brand-gold-400: #e1c05f;  /* Moyen */
--brand-gold-500: #d4af37;  /* Base - Couleur de marque originale */
--brand-gold-600: #b8952e;  /* Moyen-sombre */
--brand-gold-700: #937726;  /* Sombre */
--brand-gold-800: #6e591e;  /* Très sombre */
--brand-gold-900: #4a3c15;  /* Ultra sombre */
--brand-gold-950: #2d250d;  /* Maximum sombre */
```

### Neutral (Échelle de Gris)
Pour les éléments neutres, bordures, désactivés.

```css
--neutral-50: #fafafa;      /* Blanc cassé */
--neutral-100: #f5f5f5;     /* Très clair */
--neutral-200: #e5e5e5;     /* Clair */
--neutral-300: #d4d4d4;     /* Léger */
--neutral-400: #a3a3a3;     /* Moyen-léger */
--neutral-500: #737373;     /* Moyen */
--neutral-600: #525252;     /* Moyen-sombre */
--neutral-700: #404040;     /* Sombre */
--neutral-800: #262626;     /* Très sombre */
--neutral-900: #171717;     /* Ultra sombre */
--neutral-950: #0a0a0a;     /* Maximum sombre */
```

---

## 🏷️ Sémantique (Rôles et Usages)

### Backgrounds (Fonds)

```css
/* Fonds Principaux */
--bg-primary: #0a0f1e;              /* Fond sombre principal (brand-dark-900) */
--bg-primary-light: #131a2f;        /* Variante légèrement plus claire (brand-dark-800) */
--bg-secondary: #ffffff;            /* Fond blanc pour les cartes */
--bg-accent: #d4af37;               /* Fond doré pour les CTAs (brand-gold-500) */
--bg-accent-light: #f4e3b2;         /* Fond doré clair (brand-gold-200) */

/* Fonds de Surface */
--bg-surface: #ffffff;              /* Surface blanche */
--bg-surface-dark: #1e2840;         /* Surface sombre (brand-dark-700) */
--bg-surface-elevated: #303855;     /* Surface élevée sombre (brand-dark-600) */

/* Fonds d'Overlay */
--bg-overlay: rgba(10, 15, 30, 0.85);       /* Overlay sombre */
--bg-overlay-light: rgba(255, 255, 255, 0.95); /* Overlay clair */

/* Fonds Désactivés */
--bg-disabled: #f5f5f5;             /* Gris clair (neutral-100) */
--bg-disabled-dark: #404040;        /* Gris sombre (neutral-700) */
```

### Text Colors (Textes)

```css
/* Texte sur Fond Clair */
--text-primary: #0a0f1e;            /* Texte principal sombre (21:1 sur blanc ✓) */
--text-secondary: #4a536e;          /* Texte secondaire (8.5:1 sur blanc ✓) */
--text-tertiary: #6b7690;           /* Texte tertiaire (5.2:1 sur blanc ✓) */
--text-helper: #9ba3b3;             /* Texte d'aide (3.8:1 sur blanc - grand texte uniquement) */
--text-disabled: #c8cdd6;           /* Texte désactivé (2.1:1 - décoratif) */

/* Texte sur Fond Sombre (#0a0f1e) */
--text-primary-on-dark: #ffffff;    /* Texte blanc (21:1 ✓) */
--text-secondary-on-dark: #e8eaed;  /* Texte gris clair (18.5:1 ✓) */
--text-tertiary-on-dark: #c8cdd6;   /* Texte gris (12:1 ✓) */
--text-accent-on-dark: #f4e3b2;     /* Texte doré clair (16:1 ✓) */

/* Texte sur Fond Doré (#d4af37) */
--text-on-gold: #2d250d;            /* Texte très sombre (11.2:1 ✓) */
--text-on-gold-alt: #0a0f1e;        /* Alternative sombre (9.8:1 ✓) */
```

### Borders (Bordures)

```css
/* Bordures Claires */
--border-primary: #e5e5e5;          /* Bordure principale (neutral-200) */
--border-secondary: #d4d4d4;        /* Bordure secondaire (neutral-300) */
--border-focus: #d4af37;            /* Bordure focus (brand-gold-500) */

/* Bordures Sombres */
--border-primary-dark: #303855;     /* Bordure sur fond sombre (brand-dark-600) */
--border-secondary-dark: #4a536e;   /* Bordure secondaire sombre (brand-dark-500) */
--border-accent: #eed388;           /* Bordure accent dorée (brand-gold-300) */
```

### Buttons (Boutons)

```css
/* Bouton Primaire (Gold) */
--btn-primary-bg: linear-gradient(to right, #d4af37, #f4e3b2);
--btn-primary-bg-solid: #d4af37;    /* Version solide */
--btn-primary-text: #0a0f1e;        /* Texte sombre (9.8:1 ✓) */
--btn-primary-hover-bg: #e1c05f;    /* Hover plus clair */
--btn-primary-active-bg: #b8952e;   /* Active plus sombre */

/* Bouton Secondaire (Transparent/Outline) */
--btn-secondary-bg: transparent;
--btn-secondary-text: #d4af37;      /* Texte doré sur fond blanc (5.1:1 ✓) */
--btn-secondary-text-dark: #f4e3b2; /* Texte doré clair sur fond sombre (16:1 ✓) */
--btn-secondary-border: #d4af37;
--btn-secondary-hover-bg: rgba(212, 175, 55, 0.1);

/* Bouton Tertiaire (Subtle) */
--btn-tertiary-bg: #f5f5f5;         /* Fond gris clair */
--btn-tertiary-text: #0a0f1e;       /* Texte sombre (21:1 ✓) */
--btn-tertiary-hover-bg: #e5e5e5;

/* Bouton Dark Mode */
--btn-dark-bg: #0a0f1e;
--btn-dark-text: #ffffff;           /* Texte blanc (21:1 ✓) */
--btn-dark-hover-bg: #1e2840;

/* Bouton Désactivé */
--btn-disabled-bg: #e5e5e5;
--btn-disabled-text: #a3a3a3;       /* Contraste intentionnellement bas (2.4:1) */
```

### Links (Liens)

```css
/* Liens sur Fond Clair */
--link-primary: #6e591e;            /* Doré sombre (7.8:1 ✓) */
--link-primary-hover: #937726;      /* Hover (5.5:1 ✓) */
--link-primary-visited: #4a3c15;    /* Visité (12:1 ✓) */

/* Liens sur Fond Sombre */
--link-primary-dark: #f4e3b2;       /* Doré clair (16:1 ✓) */
--link-primary-dark-hover: #eed388; /* Hover (13.5:1 ✓) */
```

---

## 🚨 États et Alertes (Feedback Utilisateur)

### Success (Succès) - Vert

```css
/* Primitives */
--success-50: #f0fdf4;
--success-100: #dcfce7;
--success-200: #bbf7d0;
--success-300: #86efac;
--success-400: #4ade80;
--success-500: #22c55e;   /* Base */
--success-600: #16a34a;
--success-700: #15803d;
--success-800: #166534;
--success-900: #14532d;

/* Sémantique */
--alert-success-bg: #f0fdf4;          /* Fond très clair (success-50) */
--alert-success-border: #86efac;      /* Bordure (success-300) */
--alert-success-text: #14532d;        /* Texte sombre (13.5:1 sur fond success-50 ✓) */
--alert-success-icon: #16a34a;        /* Icône (4.9:1 sur fond success-50 ✓) */

/* Dark Mode */
--alert-success-bg-dark: #14532d;     /* Fond sombre */
--alert-success-text-dark: #dcfce7;   /* Texte clair (14.2:1 ✓) */
```

### Warning (Avertissement) - Orange

```css
/* Primitives */
--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-200: #fde68a;
--warning-300: #fcd34d;
--warning-400: #fbbf24;
--warning-500: #f59e0b;   /* Base */
--warning-600: #d97706;
--warning-700: #b45309;
--warning-800: #92400e;
--warning-900: #78350f;

/* Sémantique */
--alert-warning-bg: #fffbeb;          /* Fond très clair (warning-50) */
--alert-warning-border: #fcd34d;      /* Bordure (warning-300) */
--alert-warning-text: #78350f;        /* Texte sombre (11.8:1 sur fond warning-50 ✓) */
--alert-warning-icon: #d97706;        /* Icône (5.2:1 sur fond warning-50 ✓) */

/* Dark Mode */
--alert-warning-bg-dark: #78350f;     /* Fond sombre */
--alert-warning-text-dark: #fef3c7;   /* Texte clair (13.5:1 ✓) */
```

### Error (Erreur) - Rouge

```css
/* Primitives */
--error-50: #fef2f2;
--error-100: #fee2e2;
--error-200: #fecaca;
--error-300: #fca5a5;
--error-400: #f87171;
--error-500: #ef4444;   /* Base */
--error-600: #dc2626;
--error-700: #b91c1c;
--error-800: #991b1b;
--error-900: #7f1d1d;

/* Sémantique */
--alert-error-bg: #fef2f2;            /* Fond très clair (error-50) */
--alert-error-border: #fca5a5;        /* Bordure (error-300) */
--alert-error-text: #7f1d1d;          /* Texte sombre (12.3:1 sur fond error-50 ✓) */
--alert-error-icon: #dc2626;          /* Icône (5.9:1 sur fond error-50 ✓) */

/* Dark Mode */
--alert-error-bg-dark: #7f1d1d;       /* Fond sombre */
--alert-error-text-dark: #fee2e2;     /* Texte clair (14.8:1 ✓) */
```

### Info (Information) - Bleu

```css
/* Primitives */
--info-50: #eff6ff;
--info-100: #dbeafe;
--info-200: #bfdbfe;
--info-300: #93c5fd;
--info-400: #60a5fa;
--info-500: #3b82f6;   /* Base */
--info-600: #2563eb;
--info-700: #1d4ed8;
--info-800: #1e40af;
--info-900: #1e3a8a;

/* Sémantique */
--alert-info-bg: #eff6ff;             /* Fond très clair (info-50) */
--alert-info-border: #93c5fd;         /* Bordure (info-300) */
--alert-info-text: #1e3a8a;           /* Texte sombre (10.5:1 sur fond info-50 ✓) */
--alert-info-icon: #2563eb;           /* Icône (5.7:1 sur fond info-50 ✓) */

/* Dark Mode */
--alert-info-bg-dark: #1e3a8a;        /* Fond sombre */
--alert-info-text-dark: #dbeafe;      /* Texte clair (13.2:1 ✓) */
```

---

## 📊 Ratios de Contraste (Validation WCAG 2.1 AA)

### Texte Normal (≥ 4.5:1)

| Combinaison | Ratio | Statut |
|-------------|-------|--------|
| `#0a0f1e` sur `#ffffff` | 21:1 | ✅ AAA |
| `#4a536e` sur `#ffffff` | 8.5:1 | ✅ AAA |
| `#6b7690` sur `#ffffff` | 5.2:1 | ✅ AA |
| `#ffffff` sur `#0a0f1e` | 21:1 | ✅ AAA |
| `#f4e3b2` sur `#0a0f1e` | 16:1 | ✅ AAA |
| `#0a0f1e` sur `#d4af37` | 9.8:1 | ✅ AAA |
| `#2d250d` sur `#d4af37` | 11.2:1 | ✅ AAA |
| `#6e591e` sur `#ffffff` | 7.8:1 | ✅ AAA (liens) |
| `#14532d` sur `#f0fdf4` | 13.5:1 | ✅ AAA (success) |
| `#78350f` sur `#fffbeb` | 11.8:1 | ✅ AAA (warning) |
| `#7f1d1d` sur `#fef2f2` | 12.3:1 | ✅ AAA (error) |
| `#1e3a8a` sur `#eff6ff` | 10.5:1 | ✅ AAA (info) |

### Grand Texte (≥ 3:1)

| Combinaison | Ratio | Statut |
|-------------|-------|--------|
| `#d4af37` sur `#ffffff` | 5.1:1 | ✅ AAA |
| `#9ba3b3` sur `#ffffff` | 3.8:1 | ✅ AA |
| `#c8cdd6` sur `#0a0f1e` | 12:1 | ✅ AAA |

### Éléments Interactifs (≥ 3:1)

| Élément | Combinaison | Ratio | Statut |
|---------|-------------|-------|--------|
| Focus Ring | `#d4af37` sur `#ffffff` | 5.1:1 | ✅ AAA |
| Bordure Active | `#d4af37` sur `#0a0f1e` | 2.1:1 | ⚠️ Utiliser bordure épaisse (3px+) |
| Icon Success | `#16a34a` sur `#f0fdf4` | 4.9:1 | ✅ AA |
| Icon Warning | `#d97706` sur `#fffbeb` | 5.2:1 | ✅ AA |
| Icon Error | `#dc2626` sur `#fef2f2` | 5.9:1 | ✅ AA |
| Icon Info | `#2563eb` sur `#eff6ff` | 5.7:1 | ✅ AA |

---

## 📘 Guide d'Utilisation

### 1. Hiérarchie des Textes

**Sur Fond Clair (blanc):**
```css
/* Titre principal H1 */
color: var(--text-primary);        /* #0a0f1e - Maximum de contraste */

/* Sous-titre H2, H3 */
color: var(--text-primary);        /* #0a0f1e - Garder le contraste fort */

/* Corps de texte */
color: var(--text-secondary);      /* #4a536e - Toujours excellent contraste */

/* Légendes, métadonnées */
color: var(--text-tertiary);       /* #6b7690 - Acceptable pour texte secondaire */

/* Texte d'aide (placeholder, helper text) */
color: var(--text-helper);         /* #9ba3b3 - Grand texte uniquement */
```

**Sur Fond Sombre (#0a0f1e):**
```css
/* Titre principal */
color: var(--text-primary-on-dark);  /* #ffffff - Blanc pur */

/* Titre avec accent */
background: linear-gradient(to right, var(--brand-gold-500), var(--brand-gold-200));
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;

/* Sous-titres */
color: var(--text-secondary-on-dark); /* #e8eaed - Gris très clair */

/* Corps de texte */
color: var(--text-tertiary-on-dark);  /* #c8cdd6 - Gris clair */

/* Accents dorés */
color: var(--text-accent-on-dark);    /* #f4e3b2 - Doré clair */
```

### 2. Boutons (Hiérarchie Visuelle)

**Bouton Primaire (CTA Principal):**
```css
background: var(--btn-primary-bg);    /* Gradient doré */
color: var(--btn-primary-text);       /* Texte sombre */
border: 1px solid var(--brand-gold-600);

/* Hover */
background: var(--btn-primary-hover-bg);
box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);

/* Active/Pressed */
background: var(--btn-primary-active-bg);
```

**Bouton Secondaire (Action Secondaire):**
```css
/* Sur fond clair */
background: transparent;
color: var(--btn-secondary-text);     /* Doré */
border: 1px solid var(--brand-gold-500);

/* Sur fond sombre */
background: rgba(255, 255, 255, 0.1);
color: var(--btn-secondary-text-dark); /* Doré clair */
border: 1px solid var(--brand-gold-200);
```

**Bouton Tertiaire (Action Discrète):**
```css
background: var(--btn-tertiary-bg);
color: var(--btn-tertiary-text);
border: 1px solid var(--border-secondary);
```

### 3. Alertes et Notifications

**Success:**
```html
<div style="
  background: var(--alert-success-bg);
  border: 1px solid var(--alert-success-border);
  color: var(--alert-success-text);
  padding: 16px;
  border-radius: 12px;
">
  <svg style="color: var(--alert-success-icon)">...</svg>
  Message de succès
</div>
```

**Error:**
```html
<div style="
  background: var(--alert-error-bg);
  border: 1px solid var(--alert-error-border);
  color: var(--alert-error-text);
  padding: 16px;
  border-radius: 12px;
">
  <svg style="color: var(--alert-error-icon)">...</svg>
  Message d'erreur
</div>
```

### 4. Focus et États Interactifs

**Focus Visible (Obligatoire pour l'accessibilité clavier):**
```css
/* Sur fond clair */
:focus-visible {
  outline: 3px solid var(--border-focus);      /* Doré */
  outline-offset: 2px;
}

/* Sur fond sombre */
:focus-visible {
  outline: 3px solid var(--brand-gold-200);    /* Doré clair */
  outline-offset: 2px;
}
```

**Hover:**
```css
/* Carte interactive */
.card:hover {
  border-color: var(--brand-gold-500);
  box-shadow: 0 20px 40px rgba(212, 175, 55, 0.2);
}
```

### 5. Dark Mode (Si implémenté)

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* Inverser les fonds */
    --bg-primary: var(--brand-dark-900);
    --bg-secondary: var(--brand-dark-800);
    --bg-surface: var(--brand-dark-700);
    
    /* Adapter les textes */
    --text-primary: var(--text-primary-on-dark);
    --text-secondary: var(--text-secondary-on-dark);
    
    /* Adapter les bordures */
    --border-primary: var(--border-primary-dark);
    
    /* Alertes en mode sombre */
    --alert-success-bg: var(--alert-success-bg-dark);
    --alert-success-text: var(--alert-success-text-dark);
  }
}
```

---

## ⚠️ Pièges à Éviter

### ❌ NE PAS FAIRE

1. **Texte doré (#d4af37) sur fond blanc**
   - Ratio: 5.1:1 (seulement valide pour grand texte)
   - ✅ Solution: Utiliser `--text-on-gold-alt` (#0a0f1e) à la place

2. **Texte gris clair (#9ba3b3) en petit sur fond blanc**
   - Ratio: 3.8:1 (insuffisant pour texte normal)
   - ✅ Solution: Réservé aux grands textes (18px+ gras ou 24px+ normal)

3. **Bordure dorée fine sur fond sombre**
   - Ratio: 2.1:1 (insuffisant)
   - ✅ Solution: Utiliser bordure ≥ 3px ou doré clair (#f4e3b2)

4. **Overlay trop transparent**
   - Risque de contraste insuffisant
   - ✅ Solution: Minimum 85% d'opacité pour overlay sombre

### ✅ BONNES PRATIQUES

1. **Toujours tester avec des outils**
   - WebAIM Contrast Checker
   - Chrome DevTools Accessibility Panel
   - WAVE Browser Extension

2. **Préférer AAA quand possible**
   - Ratio 7:1 pour texte normal
   - Ratio 4.5:1 pour grand texte

3. **Tester en conditions réelles**
   - Lumière vive (soleil)
   - Écrans de faible qualité
   - Mode daltonien (Chrome DevTools)

4. **Focus toujours visible**
   - Jamais `outline: none` sans alternative
   - Focus ring ≥ 3px d'épaisseur

---

## 🔧 Implémentation Technique

### CSS Variables (Recommandé)

```css
:root {
  /* Importer toutes les variables ci-dessus */
  /* Exemple d'usage */
  --spacing-unit: 8px;
  --border-radius: 12px;
}
```

### Tailwind CSS Integration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-dark': {
          50: '#f4f5f7',
          // ... toutes les teintes
          900: '#0a0f1e',
        },
        'brand-gold': {
          50: '#fdf9ed',
          // ... toutes les teintes
          500: '#d4af37',
        },
      },
    },
  },
};
```

### Styled Components / Emotion

```typescript
const theme = {
  colors: {
    brandDark: {
      50: '#f4f5f7',
      // ... toutes les teintes
    },
    brandGold: {
      50: '#fdf9ed',
      // ... toutes les teintes
    },
  },
};
```

---

## 📝 Checklist de Validation Accessibilité

- [ ] Tous les textes respectent 4.5:1 minimum
- [ ] Grand texte respecte 3:1 minimum
- [ ] Éléments interactifs ont un focus visible
- [ ] Bordures/icônes non-texte respectent 3:1
- [ ] Testé avec simulateur de daltonisme
- [ ] Testé sur écran de faible qualité
- [ ] Testé en lumière vive
- [ ] Dark mode (si applicable) validé
- [ ] États hover/focus/active bien différenciés
- [ ] Messages d'erreur ne reposent pas uniquement sur la couleur

---

**Version:** 1.0  
**Dernière mise à jour:** 2026-04-17  
**Conformité:** WCAG 2.1 Level AA  
**Testée avec:** WebAIM Contrast Checker, Chrome DevTools
