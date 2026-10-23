# @quantum-ds/penpot

[![npm version](https://img.shields.io/npm/v/@quantum-ds/penpot)](https://www.npmjs.com/package/@quantum-ds/penpot)

> [!WARNING]
> **Experimental: Quantum NextGen.** This package belongs to Quantum NextGen, the next major version of the Quantum Design System, developed on the [`nextgen`](https://github.com/ThalesGroup/quantum/tree/nextgen) branch. It is experimental: what the plugin draws, and how, may change or break in any release, without notice. Do not use it in production.

The Quantum components in Penpot: a Penpot plugin that writes the design tokens of
[`@quantum-ds/tokens`](../tokens) as Penpot tokens (a theme per mode) and draws every component of
the design system as a Penpot component with variants bound to them, following the specifications
of [`@quantum-ds/components`](../components) and the blueprints of [`@quantum-ds/figma`](../figma).

## Usage

Penpot installs a plugin from the URL of its manifest. The published package can be installed
from a CDN that serves npm packages, such as unpkg:

```
https://unpkg.com/@quantum-ds/penpot@alpha/dist/manifest.json
```

In Penpot 2.18 or later, open a file, open the plugin manager (**Ctrl + Alt + P**), install that
URL and run **Quantum components**. Its window, built with the design system, shows the progress
of the run (the tokens, then each component, with its status) and the warnings at the end; close
it when it is done. It creates or updates the token sets `Foundation`, `Component`, `Mode/Light`
and `Mode/Dark` with the themes `Mode / Light` and `Mode / Dark`, and draws each component on its
own page. A component that already exists is kept: delete it to draw it again.

The package ships the plugin only: `dist/manifest.json`, `dist/plugin.js` (the plugin, with every
component and token it draws) and `dist/index.html` (its window). Served from anywhere else, the
three files stay together: Penpot looks for the plugin and its window next to the manifest.

Texts take Penpot's fonts, found by name: Inter comes from its Google Fonts catalog. Icons are
glyphs of Material Symbols Outlined: if Penpot does not find it, upload it as a team font first,
or icons are drawn as empty squares.

## Development

From the root of the monorepo, the plugin is built into `packages/penpot/dist/` from the
specifications, the tokens and the blueprints of `@quantum-ds/figma`, and served locally:

```sh
pnpm install
pnpm penpot:export            # every component
pnpm penpot:export button     # some of them (and the components their copies use)
pnpm penpot:serve             # serve packages/penpot/dist/ at http://localhost:4400
```

Then install `http://localhost:4400/manifest.json` in Penpot's plugin manager. `pnpm build` builds
it too, and `dist/plan.json` holds what the plugin draws, to read. The rules of the package are in
[AGENTS.md](AGENTS.md); the change workflow is in the root [AGENTS.md](../../AGENTS.md) and
[`agents/`](../../agents/).

## License

[MIT](LICENSE)
