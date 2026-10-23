# @quantum-ds/figma

[![npm version](https://img.shields.io/npm/v/@quantum-ds/figma)](https://www.npmjs.com/package/@quantum-ds/figma)

> [!WARNING]
> **Experimental: Quantum NextGen.** This package belongs to Quantum NextGen, the next major version of the Quantum Design System, developed on the [`nextgen`](https://github.com/ThalesGroup/quantum/tree/nextgen) branch. It is experimental: what the plugin draws, and how, may change or break in any release, without notice. Do not use it in production.

The Quantum components in Figma: a Figma plugin that draws every component of the design system
as a Figma component set bound to Figma variables recreated from
[`@quantum-ds/tokens`](../tokens), following the specifications of
[`@quantum-ds/components`](../components).

## Usage

```sh
pnpm add @quantum-ds/figma@alpha
```

Then, in the Figma desktop app: **Plugins > Development > Import plugin from manifest…**, pick
`node_modules/@quantum-ds/figma/dist/manifest.json`, open a design file and run **Quantum
components**. Its window, built with the design system, shows the progress of the run (the
variables, then each component, with its status) and the warnings at the end; close it when it
is done. It creates or updates three variable collections (`Quantum / Raw`, `Quantum / Semantic`
with a Light and a Dark mode, `Quantum / Components`) and draws each component on its own page.
A component set that already exists is kept: delete it to draw it again.

The package ships the plugin only: `dist/manifest.json`, `dist/code.js` (the plugin, with every
component and variable it draws) and `dist/ui.html` (its window).

Icons are glyphs of Material Symbols Outlined: install the font on your machine first (the
variable font of [google/material-design-icons](https://github.com/google/material-design-icons/tree/master/variablefont)),
or icons are drawn as empty squares. The Dark mode needs a Figma plan that allows several modes
per collection.

## Development

From the root of the monorepo, the plugin is built into `packages/figma/dist/` from the
specifications, the tokens and one blueprint per component (`src/blueprints/`):

```sh
pnpm install
pnpm figma:export            # every component
pnpm figma:export button     # some of them (and the components their instances use)
```

`pnpm build` builds it too, and `dist/plan.json` holds what the plugin draws, to read. The
rules of the package are in [AGENTS.md](AGENTS.md); the change workflow is in the root
[AGENTS.md](../../AGENTS.md) and [`agents/`](../../agents/).

## License

[MIT](LICENSE)
