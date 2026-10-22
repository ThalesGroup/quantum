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
