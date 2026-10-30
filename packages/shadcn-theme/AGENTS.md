# packages/shadcn-theme — the shadcn/ui theme

`@quantum-ds/shadcn-theme` builds, and publishes, a theme for [shadcn/ui](https://ui.shadcn.com) made
from the Quantum tokens through shadcn's own theming API: its documented CSS variables on `:root`
and `.dark`, the `@theme inline` bridge to Tailwind CSS v4, and the same values as a registry theme
item. Part of the agent guide: start from the root `AGENTS.md`. Like the docs site and the screens,
it is a **consumer** of the design system: it holds no design decision of its own, only which
Quantum token feeds which shadcn variable.

| Path | Role |
| --- | --- |
| `src/mapping.mjs` | The theme, as plain data (no logic): `VARIABLES` (shadcn variable -> Quantum token, with the reason when it is not obvious), `THEME` (the `@theme inline` extras: fonts and the radius scale), `COMPONENTS` (which shadcn component and props render each Quantum component configuration, naming the spec's component id, property and option ids, state ids, part ids), `SHADCN_ONLY`. Everything the package writes comes from it. |
| `src/lib.mjs` | The only module that reads the design system, on the shared theme library `scripts/lib/theme-mapping.mjs` (`loadQuantum()`: `{ light, dark, modes, specs }`, every token resolved per mode, keyed by path, with its type, tier and alias, and the component specs; `checkMapping(mapping, quantum)`: the unknown token paths, raw tokens, unknown component ids, properties, options, states and parts; `tokenTrace`, `pxNumber`), plus what is shadcn's own: `assertMapping`, `resolveMapping` (the value of every variable per mode), `isColorVariable`. Zero dependencies. |
| `build.mjs` | `pnpm --filter @quantum-ds/shadcn-theme build` (also `prepack`, `pnpm shadcn-theme:build`, `pnpm build`): writes `dist/` (not committed): `quantum.css` (`:root`, `.dark`, `@theme inline`, each value followed by its token path), `quantum.json` (the `registry:theme` item, `cssVars.theme/light/dark`, `meta.tokens`), then `demo.html` through the package's own Vite. `--no-demo` writes the theme files only. Exports `buildTheme`, `renderCss`, `renderRegistryItem` for the test. Throws on any `checkMapping` problem. |
| `demo/` | The demo page: Vite + React + Tailwind CSS v4 (`vite.config.ts`, `index.html`, `components.json`, `src/`). `src/App.tsx` shows every component of `src/components/ui/` in every variant, size and state, with a light / dark / system switch; the note under each heading is generated from `COMPONENTS`. `src/index.css` is a shadcn `globals.css` importing `../../dist/quantum.css`. |
| `demo/src/components/ui/`, `demo/src/shadcn-tailwind.css` | shadcn's `new-york-v4` components and its `shadcn/tailwind.css`, **as the registry ships them**, committed so the build is offline. Written only by `demo/scripts/fetch-ui.mjs`. |
| `demo/scripts/fetch-ui.mjs` | Refreshes the files above from `https://ui.shadcn.com/r/styles/new-york-v4/<name>.json` (and their `registryDependencies`) and the pinned `shadcn` npm package. Run it by hand to take a newer shadcn, then review the diff. |
| `test/theme.test.mjs` | Run by `pnpm test`: the mapping holds against the tokens and the specs (and the check refuses bad entries), every documented shadcn variable has a light and a dark value, the build writes both files, the registry item has the schema's fields and its `cssVars` equal the CSS, every mapped shadcn component is in the demo, every Quantum component has an entry in `COMPONENTS`. |

## Rules

- **Theming API only.** The theme is shadcn's documented variables (https://ui.shadcn.com/docs/theming)
  and Tailwind theme variables shadcn's components read (`--font-*`, `--radius-*`). Never change a
  component's class strings, never add component CSS, never add a variable the components do not
  read. A Quantum decision the variables cannot carry is listed in the README under "Not themable
  through shadcn's API", with the reason.
- **Tiers.** A shadcn variable that is a semantic decision takes a Quantum semantic token; one that
  is really a component decision (`--card`, `--popover`, `--input`, `--border`, the radii) takes the
  component token of the matching Quantum component. Never a raw token: `checkMapping` refuses it.
- **Every value traces to a token.** The CSS writes the path next to each value and the registry
  item lists them in `meta.tokens`. The only literals are the generic font fallbacks of `THEME`.
- **A token or spec change is caught, not silently followed.** When a mapped token path or a
  spec property, option, state or part is renamed or removed, `build.mjs` and `pnpm test` fail and
  name the entry. Fix it by editing `src/mapping.mjs` (and the README tables when a row changes),
  then `pnpm shadcn-theme:build`. A changed token value needs nothing: the next build carries it.
- **The demo shows everything.** A new shadcn component in `fetch-ui.mjs`, a new variant or a new
  `COMPONENTS` entry is shown in `demo/src/App.tsx`. Open `dist/demo.html` in light and dark and
  compare with the Quantum reference (`packages/components/src/components/`) before relying on a
  mapping change.
- **Dependencies.** The theme side (`src/`, `build.mjs`, the test) is plain Node with no
  dependency, like `scripts/build-tokens.mjs`. Vite, React, Tailwind and the shadcn runtime
  packages are devDependencies of the demo only.
