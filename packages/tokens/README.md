# @quantum-ds/tokens

[![npm version](https://img.shields.io/npm/v/@quantum-ds/tokens)](https://www.npmjs.com/package/@quantum-ds/tokens)

> [!WARNING]
> **Experimental: Quantum NextGen.** This version of the package belongs to Quantum NextGen, the next major version of the Quantum Design System, developed on the [`nextgen`](https://github.com/ThalesGroup/quantum/tree/nextgen) branch. It is experimental: the tokens, their names and the outputs may change or break in any release, without notice. Do not use it in production.

The design tokens of the [Quantum Design System](https://github.com/ThalesGroup/quantum), defined in the [Design Tokens Format (DTCG)](https://www.designtokens.org/) and transformed into formats that products, design tools and other platforms consume.

> [!IMPORTANT]
> Version 2 is a rewrite of the tokens. They are organised in three tiers (raw, semantic, component) with per-platform and per-mode overlays, and every token path changes. The package still ships the formats of version 1, generated from the new tokens, plus CSS with mode contexts, one resolved DTCG tree per platform and mode, and a syntax highlighting theme. See the [changelog](CHANGELOG.md).

## Usage

```sh
pnpm add @quantum-ds/tokens@alpha
```

The DTCG tokens are the source of truth. Everything else under `node_modules/@quantum-ds/tokens/dist/` is built from them:

- **Design token definitions (source of truth):** `dist/dtcg/`, the DTCG files of every tier and overlay, with `dist/dtcg/quantum.resolver.json`, a [DTCG resolver](https://www.designtokens.org/) listing them by set (`raw`, `semantic`, `component`) and modifier (`platform`, `mode`)
- **Generated outputs:**
  - **Android:** `dist/resources*.xml`
  - **CSS:** `dist/tokens*.css`, and `dist/css/` (one file per tier and component, with mode contexts)
  - **Figma:** `dist/figma/*.json` (not yet packaged). To get the tokens in Figma as variables, with the components drawn on them, see [`@quantum-ds/figma`](../figma)
  - **JavaScript CSS variables:** `dist/variables-css.js`
  - **JavaScript/TypeScript ES modules:** `dist/tokens-es6*.js`, `dist/tokens-es6*.d.ts`
  - **Penpot:** `dist/penpot/tokens.json`
  - **Sass:** `dist/tokens*.scss`
  - **Tokens Studio:** `dist/tokens_studio/*.json` (not yet packaged)
  - **Other platforms:** `dist/platforms/<platform>/<mode>.tokens.json`
  - **Syntax highlighting:** `dist/shiki-theme.json`

A file ending in `-dark` (`tokens-dark.css`, `tokens-es6-dark.js`, `resources-dark.xml`, `figma/global-dark.tokens.json`…) holds the tokens whose value differs in the dark mode: load it after the default file (`tokens.css`, then `tokens-dark.css` for `.dark`), or put the dark Android resources in `values-night/`. Penpot gets one token set per mode and one theme per mode in a single file.

Names follow the token path: `global.bg.level.1.default` is `--global-bg-level-1-default` in CSS, `$global-bg-level-1-default` in Sass, `GlobalBgLevel1Default` in JavaScript and `global_bg_level_1_default` on Android. A typography token is split into one value per property (`…-font-family`, `…-font-size`, `…-font-weight`, `…-line-height`, `…-letter-spacing`). The Android resources keep the DTCG units (`px`) and apply the `android` platform overlay (Roboto); the design tools read lengths as pixels.

The package entry point (`@quantum-ds/tokens`) is `dist/tokens-es6.js`, with its types:

```js
import { GlobalBgLevel1Default } from '@quantum-ds/tokens';
```

### CSS custom properties

`@quantum-ds/tokens/css/index.css` declares every token as a CSS custom property, in cascade order: the raw tier, the semantic tier, then one file per component. Load it before any stylesheet reading the tokens:

```html
<link rel="stylesheet" href="node_modules/@quantum-ds/tokens/dist/css/index.css">
```

```css
@import "@quantum-ds/tokens/css/index.css";
```

The files are also available one by one: `css/raw.css`, `css/semantic.css` and `css/components/<component>.css`. A variable is the token path joined with `-`: `global.bg.level.1.default` is `--global-bg-level-1-default`, `button.container.background.accent.brand.hover` is `--button-container-background-accent-brand-hover`. Component CSS reads only its own component tokens; products read semantic tokens.

Color modes are contexts of the same variables. The default (light) values apply everywhere; `data-theme="dark"` on any element switches its subtree, `data-theme="auto"` follows `prefers-color-scheme`:

```html
<html data-theme="auto">
  <section data-theme="dark">…</section>
</html>
```

### Other platforms

`@quantum-ds/tokens/platforms/<platform>/<mode>.tokens.json` (`ios`, `android`; `light`, `dark`) is a resolved DTCG tree: every tier, with the platform's overrides applied, every alias followed, and `$extensions["io.quantum"]` recording the tier and the alias of each token. Any technology (Flutter, SwiftUI, Jetpack Compose, Qt, React Native) transforms the tree of the platform it targets, one per mode, selected by the system appearance named by the mode's `scheme`.

### Syntax highlighting

`@quantum-ds/tokens/shiki-theme.json` is a [Shiki](https://shiki.style) (TextMate) theme whose colors are the CSS variables of the code tokens, so highlighted code follows the page's mode as long as the token CSS is loaded. Pass the JSON to Shiki (`themes: [theme]`, then `theme: theme.name`) or to any tool built on it.

## Development

`dist/` is built, not committed. From the repository root, `pnpm tokens:build` runs both builds of the package: the monorepo's zero-dependency token pipeline, `scripts/build-tokens.mjs`, which checks the tiers, overlays and modes and writes `dist/css/`, `dist/platforms/` and `dist/shiki-theme.json` for the docs site and the reference implementation, then [Style Dictionary](https://styledictionary.com/) with [`style-dictionary.config.mjs`](style-dictionary.config.mjs) for every other format. `pnpm dev`, `pnpm build`, `pnpm check` and packing run it too. [AGENTS.md](AGENTS.md) describes the tiers, the overlays, the modes and the rules; [`agents/token-sources.md`](../../agents/token-sources.md) says where the tokens come from.

## License

[MIT](LICENSE).
