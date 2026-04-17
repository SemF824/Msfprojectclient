/**
 * MSF CONGO - COLOR SHOWCASE COMPONENT
 *
 * This component demonstrates all colors in the design system
 * Use it as a reference or style guide page
 *
 * Usage:
 * import ColorShowcase from './design-system/ColorShowcase';
 * <ColorShowcase />
 */

import React from 'react';
import { Colors, Alert as AlertColors, getAlertColors } from './colors';
import type { AlertType } from './colors';

export default function ColorShowcase() {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-16">
          <h1
            className="text-5xl font-bold mb-4"
            style={{ color: Colors.Text.primary }}
          >
            MSF Congo Design System
          </h1>
          <p
            className="text-xl"
            style={{ color: Colors.Text.secondary }}
          >
            Palette de couleurs accessible WCAG 2.1 AA
          </p>
        </header>

        {/* Brand Colors */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: Colors.Text.primary }}
          >
            Couleurs de Marque
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Brand Dark */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Brand Dark</h3>
              <div className="space-y-2">
                {Object.entries(Colors.BrandDark).map(([shade, color]) => (
                  <div
                    key={shade}
                    className="flex items-center justify-between p-4 rounded-lg border"
                    style={{
                      backgroundColor: color,
                      borderColor: Colors.Border.primary,
                      color: parseInt(shade) >= 500 ? '#ffffff' : Colors.Text.primary,
                    }}
                  >
                    <span className="font-mono text-sm">{shade}</span>
                    <span className="font-mono text-xs">{color}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Gold */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Brand Gold</h3>
              <div className="space-y-2">
                {Object.entries(Colors.BrandGold).map(([shade, color]) => (
                  <div
                    key={shade}
                    className="flex items-center justify-between p-4 rounded-lg border"
                    style={{
                      backgroundColor: color,
                      borderColor: Colors.Border.primary,
                      color: parseInt(shade) >= 700 ? '#ffffff' : Colors.Text.primary,
                    }}
                  >
                    <span className="font-mono text-sm">{shade}</span>
                    <span className="font-mono text-xs">{color}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: Colors.Text.primary }}
          >
            Boutons
          </h2>

          <div className="flex flex-wrap gap-4">
            {/* Primary Button */}
            <button
              className="px-8 py-4 rounded-xl font-bold transition-all hover:shadow-lg"
              style={{
                background: Colors.Button.primaryBg,
                color: Colors.Button.primaryText,
                border: 'none',
              }}
            >
              Bouton Primaire
            </button>

            {/* Secondary Button */}
            <button
              className="px-8 py-4 rounded-xl font-medium transition-all hover:shadow-lg"
              style={{
                background: Colors.Button.secondaryBg,
                color: Colors.Button.secondaryText,
                border: `2px solid ${Colors.Button.secondaryBorder}`,
              }}
            >
              Bouton Secondaire
            </button>

            {/* Tertiary Button */}
            <button
              className="px-8 py-4 rounded-xl font-medium transition-all hover:shadow-lg"
              style={{
                background: Colors.Button.tertiaryBg,
                color: Colors.Button.tertiaryText,
                border: `1px solid ${Colors.Border.primary}`,
              }}
            >
              Bouton Tertiaire
            </button>

            {/* Dark Button */}
            <button
              className="px-8 py-4 rounded-xl font-bold transition-all hover:shadow-lg"
              style={{
                background: Colors.Button.darkBg,
                color: Colors.Button.darkText,
                border: 'none',
              }}
            >
              Bouton Sombre
            </button>

            {/* Disabled Button */}
            <button
              disabled
              className="px-8 py-4 rounded-xl font-medium cursor-not-allowed"
              style={{
                background: Colors.Button.disabledBg,
                color: Colors.Button.disabledText,
                border: 'none',
              }}
            >
              Bouton Désactivé
            </button>
          </div>
        </section>

        {/* Alerts */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: Colors.Text.primary }}
          >
            Alertes et États
          </h2>

          <div className="space-y-4">
            {(['success', 'warning', 'error', 'info'] as AlertType[]).map((type) => {
              const alertColors = getAlertColors(type);
              return (
                <div
                  key={type}
                  className="p-4 rounded-xl border-l-4"
                  style={{
                    backgroundColor: alertColors.bg,
                    borderLeftColor: alertColors.border,
                    color: alertColors.text,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: alertColors.icon,
                        color: '#ffffff',
                      }}
                    >
                      {type === 'success' && '✓'}
                      {type === 'warning' && '!'}
                      {type === 'error' && '✕'}
                      {type === 'info' && 'i'}
                    </div>
                    <div>
                      <h4 className="font-bold capitalize mb-1">{type}</h4>
                      <p>
                        Ceci est un exemple de message d'alerte de type {type}.
                        Le contraste texte/fond respecte WCAG 2.1 AA (≥ 4.5:1).
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Typography on Dark Background */}
        <section
          className="mb-16 p-8 rounded-2xl"
          style={{ backgroundColor: Colors.Background.primary }}
        >
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: Colors.Text.primaryOnDark }}
          >
            Texte sur Fond Sombre
          </h2>

          <div className="space-y-4">
            <p
              className="text-xl"
              style={{ color: Colors.Text.primaryOnDark }}
            >
              Texte principal sur fond sombre (21:1 contrast ratio)
            </p>
            <p
              className="text-lg"
              style={{ color: Colors.Text.secondaryOnDark }}
            >
              Texte secondaire sur fond sombre (18.5:1 contrast ratio)
            </p>
            <p
              className="text-base"
              style={{ color: Colors.Text.tertiaryOnDark }}
            >
              Texte tertiaire sur fond sombre (12:1 contrast ratio)
            </p>
            <p
              className="text-2xl font-bold"
              style={{
                background: Colors.Gradients.goldHorizontal,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Texte avec gradient doré (accent)
            </p>
          </div>
        </section>

        {/* Links */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: Colors.Text.primary }}
          >
            Liens
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Sur fond clair</h3>
              <p>
                Ceci est un texte avec{' '}
                <a
                  href="#"
                  className="underline hover:no-underline"
                  style={{ color: Colors.Link.primary }}
                >
                  un lien accessible
                </a>
                {' '}qui respecte les contrastes WCAG.
              </p>
            </div>

            <div
              className="p-6 rounded-xl"
              style={{ backgroundColor: Colors.Background.primary }}
            >
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: Colors.Text.primaryOnDark }}
              >
                Sur fond sombre
              </h3>
              <p style={{ color: Colors.Text.secondaryOnDark }}>
                Ceci est un texte avec{' '}
                <a
                  href="#"
                  className="underline hover:no-underline"
                  style={{ color: Colors.Link.primaryDark }}
                >
                  un lien accessible
                </a>
                {' '}qui respecte les contrastes WCAG.
              </p>
            </div>
          </div>
        </section>

        {/* Focus States */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: Colors.Text.primary }}
          >
            États de Focus (Accessibilité Clavier)
          </h2>

          <p className="mb-4" style={{ color: Colors.Text.secondary }}>
            Utilisez Tab pour naviguer et voir les anneaux de focus
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              className="px-6 py-3 rounded-lg"
              style={{
                background: Colors.Button.primaryBgSolid,
                color: Colors.Button.primaryText,
                border: 'none',
              }}
            >
              Bouton Focusable 1
            </button>
            <button
              className="px-6 py-3 rounded-lg"
              style={{
                background: Colors.Button.darkBg,
                color: Colors.Button.darkText,
                border: 'none',
              }}
            >
              Bouton Focusable 2
            </button>
            <input
              type="text"
              placeholder="Champ de texte"
              className="px-4 py-3 rounded-lg"
              style={{
                border: `2px solid ${Colors.Border.primary}`,
                color: Colors.Text.primary,
              }}
            />
          </div>
        </section>

        {/* Gradients */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: Colors.Text.primary }}
          >
            Gradients
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              className="h-32 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: Colors.Gradients.goldHorizontal }}
            >
              Gold Horizontal
            </div>
            <div
              className="h-32 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: Colors.Gradients.goldVertical }}
            >
              Gold Vertical
            </div>
            <div
              className="h-32 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: Colors.Gradients.darkToBlue }}
            >
              Dark to Blue
            </div>
          </div>
        </section>

        {/* Shadows */}
        <section className="mb-16">
          <h2
            className="text-3xl font-bold mb-6"
            style={{ color: Colors.Text.primary }}
          >
            Ombres
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(Colors.Shadows)
              .filter(([key]) => !key.includes('gold') && !key.includes('focus'))
              .map(([name, shadow]) => (
                <div
                  key={name}
                  className="h-32 rounded-xl bg-white flex items-center justify-center font-medium"
                  style={{
                    boxShadow: shadow,
                    border: `1px solid ${Colors.Border.primary}`,
                  }}
                >
                  {name}
                </div>
              ))}
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4">Ombres Dorées</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(Colors.Shadows)
              .filter(([key]) => key.includes('gold'))
              .map(([name, shadow]) => (
                <div
                  key={name}
                  className="h-32 rounded-xl flex items-center justify-center font-medium"
                  style={{
                    background: Colors.Button.primaryBgSolid,
                    color: Colors.Button.primaryText,
                    boxShadow: shadow,
                  }}
                >
                  {name}
                </div>
              ))}
          </div>
        </section>

        {/* Accessibility Note */}
        <section
          className="p-8 rounded-2xl border-2"
          style={{
            backgroundColor: Colors.Alert.info.bg,
            borderColor: Colors.Alert.info.border,
          }}
        >
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: Colors.Alert.info.text }}
          >
            ♿ Note d'Accessibilité
          </h2>
          <ul
            className="space-y-2"
            style={{ color: Colors.Alert.info.text }}
          >
            <li>✅ Tous les contrastes de texte respectent WCAG 2.1 AA minimum (4.5:1)</li>
            <li>✅ Les grands textes respectent un ratio minimum de 3:1</li>
            <li>✅ Les éléments interactifs ont des états focus visibles</li>
            <li>✅ Les couleurs ne sont pas le seul moyen de transmettre l'information</li>
            <li>✅ Testé avec simulateurs de daltonisme</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
