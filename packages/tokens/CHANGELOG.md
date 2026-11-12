# Changelog

All notable changes to this project will be documented in this file.

> [!NOTE]
> 1.10.0 is the first open source version of `@quantum-ds/tokens`. Previous versions were only released internally at Thales and are not publicly available.

## 2.0.0-alpha.0 (unreleased)

The tokens are rewritten for the next major version of Quantum. The package is built from the monorepo's token pipeline (`scripts/build-tokens.mjs`, which checks the tiers, overlays and modes and writes the CSS read by the docs site) and from Style Dictionary (`style-dictionary.config.mjs`, every other format). `dist/` is built, not committed.

### Breaking changes

- The tokens are reorganised in three tiers, raw (hidden primitives), semantic (what products and components read) and component (one file per component), with per-platform (`ios`, `android`) and per-mode (`light`, `dark`) overlays. Every token path, so every CSS variable, Sass variable, JavaScript export and Android resource name, changes.
- The outputs of version 1 are generated from the new tokens, with the same file names: `dist/tokens*.css`, `dist/tokens*.scss`, `dist/tokens-es6*.js` and `.d.ts`, `dist/variables-css.js`, `dist/resources*.xml`, `dist/figma/`, `dist/penpot/tokens.json`, `dist/tokens_studio/` and `dist/dtcg/` (the DTCG sources, with `quantum.resolver.json`). A `-dark` file holds every token whose value differs in the dark mode, a component token aliasing a changed semantic token included. Typography tokens are split into `font-family`, `font-size`, `font-weight`, `line-height` and `letter-spacing` everywhere, the CSS variable names of `dist/css/`. The Android resources apply the `android` platform overlay.
- New outputs: `dist/css/` (CSS custom properties per tier and component, with one rule per mode context and an `index.css` entry point), `dist/platforms/<platform>/<mode>.tokens.json` (resolved DTCG trees) and `dist/shiki-theme.json` (syntax highlighting theme).
- Removed: `dist/json/` (the Figma artboard exports) and `dist/tokens.js`, generated from them, both deprecated since 1.x. The package entry point is now `dist/tokens-es6.js` (with `dist/tokens-es6.d.ts`).
- Color modes are selected with `data-theme="light"`, `data-theme="dark"` or `data-theme="auto"` with `dist/css/`, or with the `-dark` files (`.dark` in `dist/tokens-dark.css`).
- The color tokens follow the Figma library's POC2 export (2026-11-05). Renamed: `brand.light.*` and `brand.dark.*` are `brand.palettes.core-colors.light.*` and `.dark.*`; `brand.identity-base.*` is `brand.identity.core-colors.*`, `brand.identity.neutral.*` and `brand.identity.tint-colors.*`; `branded-extended.*` is `brand.palettes.tint-colors.*`; `brand-identity.marine-blue` and `light-blue` are `brand-identity.logo.color.primary` and `secondary`; `dataviz.role.extended.sand.*` is `dataviz.role.extended.wood.*`. Removed: `extended.sand.*`, and the mapped roles of the extended hues amber, azure, orchid, sand, purple, yellow, green and beige (`global.*.extended.<hue>.*`). Added: `extended.wood.*` and its roles, hover and active steps for the accent and subtle borders of lavender, lime, coral and forest, `brand-identity.logo.black-and-white.accent`, `brand.identity.tint-colors.*`. Values: the neutral ash ramp is a pure grey, slate is retuned, forest, lavender and lime follow the brand tints, coral and error 500 are retuned, and several functional text and icon roles move to other steps in each mode (see the Color foundation 3.1.0 changelog).
- The data visualization tokens follow the Figma library's spelling: `subtile` is `subtle` in every `dataviz.role.*` path (`dataviz.role.brand.bg.subtile.*` is `dataviz.role.brand.bg.subtle.*`, `…on-subtile.*` is `…on-subtle.*`), and `dataviz.role.functionnal.*` is `dataviz.role.functional.*`. Values are unchanged.
- Every data visualization token aliases a color of the Figma library, so none is kept as a literal any more. Removed: `dataviz.role.extended.lavender.on-accent.*` and `dataviz.role.extended.lavender.on-subtle.*`. Values: the other `dataviz.role.extended.*`, `dataviz.role.functional.*` and `dataviz.structural.*` tokens that aliased colors the library no longer contains take the color of their new alias (see the Color foundation 5.0.0 changelog).

## 1.10.0

### Added

- Added Dataviz tokens to the DTCG source:
  - `color.extended.tokens.json`, including Dataviz raw colors.
  - Dataviz semantic tokens for light and dark themes:
    - `dtcg/component/dataviz.tokens.json`
    - `dtcg/component/dataviz-dark.tokens.json`
  - Registered Dataviz tokens in the build configuration and Quantum resolver.

### Fixes

- Fixed token JSON generation for nested paths with repeated segment names.

### Deprecated

The following legacy outputs, deprecated since 1.8.0, are still available for backward compatibility and will be removed in a future major version:

- `dist/json/`, the original JSON tokens exported from Figma, previously used as the source of truth.
- `dist/tokens.js`, the JavaScript module still generated from `dist/json/`.

For new integrations, use the DTCG tokens in `dist/dtcg/` or the formats generated from them.
