# packages/bootstrap-theme — Quantum for Bootstrap 6

`@quantum-ds/bootstrap-theme` builds, and publishes, a Bootstrap 6 theme generated from the Quantum
tokens through Bootstrap's own theming API: its root custom properties, its per-component custom
properties and the same decisions as Sass configuration. Part of the agent guide: start from the
root `AGENTS.md`; how themes fit the system is `agents/model.md` "In Bootstrap and shadcn/ui", and
the skill `.claude/skills/framework-theme/` walks through creating or regenerating a theme.

| Path | Role |
| --- | --- |
| `src/mapping.mjs` | **The theme, as plain data** (no logic, no import): `groups[]`, each a Bootstrap selector (as `bootstrap.css` writes it) with the custom properties the theme reassigns there and the Quantum token each takes (`'path'`, `['path', 'why']`, `{ token, member }` for one member of a typography token, `{ template }` to compose tokens, `{ literal, rule }` for a keyword a Quantum foundation rule decides), the tier its values come from and the Bootstrap Sass map receiving them; `units` (px to rem); `equivalences[]`, each Quantum component (spec id) with its options, states and parts mapped to Bootstrap classes; `bootstrapOnly`. Its header documents the format. |
| `src/lib.mjs` | The Quantum side, on the shared library of framework themes (`scripts/lib/theme-mapping.mjs`: token and spec loading, token-path and tier checks, spec option/state/part lookups, alias chain, px to rem): `loadQuantum()` (the shared loader's result as `{ tokens, light, dark, specs, foundations, modes, shared }`), `checkMapping(mapping, q)` (what is Bootstrap's own: entry forms, typography members, foundation-rule literals, the `--bs-` prefix, a tier or cross-component use without `why`, every option of a mapped property mapped, every component with an equivalence), `entryValues`/`entryCss` (an entry's CSS per mode; `light-dark()` for colors that differ), `pxToRem`. A change of the shared library is a change of this theme: `pnpm test` runs both. |
| `src/css-index.mjs` | The Bootstrap side, zero dependencies: a small CSS reader (`parseRules`, `indexCustomProperties`), `specificity`, `findRule`, `checkTargets(mapping, index)` (every property the mapping sets is declared or read by `bootstrap.css`, every selector is one of its rules) and `shadowedRules` (Bootstrap rules the theme's rules would override by mistake, restated by the build). |
| `build.mjs` | `pnpm --filter @quantum-ds/bootstrap-theme build` (also `prepack`, `pnpm bootstrap-theme:build`, `pnpm build`): checks the mapping (throws on any problem) and writes `dist/` (not committed): `quantum.css` (root block + rules in Bootstrap's layers, one token comment per declaration), `scss/_quantum.scss` (Bootstrap's maps + a `rules` mixin) and `quantum.scss` (ready entry), `demo.html` (`demo/` with Bootstrap, the theme and the demo files inlined, the section notes filled from `equivalences`). `--readme` also regenerates the tables of `README.md`. |
| `demo/` | The source of the demo page: `index.html` (every Bootstrap 6 component; `data-inline` on what the build inlines; an empty `<p class="demo-note" data-equivalence="<Quantum ids|none>">` under each heading), `demo.css` (page layout only, on Bootstrap's custom properties), `demo.js` (light/dark/auto, theme on/off, the few JavaScript inits). |
| `test/theme.test.mjs` | Run by `pnpm test`: the mapping against the tokens, specs and `bootstrap.css` (and that the checks catch errors), the build output (every mapped value in light and dark, custom properties only, a comment on each line, modifiers still overriding), the Sass entry compiling with `sass`, the demo self-contained, the README tables in sync. |

## Rules

- **Theming API only.** The theme reassigns Bootstrap's own custom properties (`--bs-*`), on
  `:root, :host` or on the exact selectors Bootstrap declares them on, and passes the same values
  to Bootstrap's Sass maps. Never a plain CSS property, never a selector Bootstrap does not have,
  never new component CSS. A Quantum decision the API cannot express goes to the README's "Not
  themable through Bootstrap's API", not into CSS.
- **Tiers.** Bootstrap's root layer (theme colors, surfaces, text, borders, type, radii, spacers,
  focus, shadow color, motion) reads Quantum semantic tokens; its per-component layer reads
  Quantum component tokens. Never a raw token. A value from the other tier, or from another
  component, carries a `why`. A literal is a keyword a foundation rule decides (`rule:
  'effects.shadow'`), never a value chosen here.
- **Every value is traced.** `dist/quantum.css` writes the token path (or foundation rule) next to
  each declaration; the README's mapping table is generated from `src/mapping.mjs`.
- **Bootstrap's cascade stays Bootstrap's.** Component rules go into Bootstrap's layers, after
  its own, in its order; a Bootstrap rule of the same specificity that Bootstrap wrote after the
  one the theme overrides (`.pagination-lg` after `.pagination`) is restated after the theme's
  rule (`shadowedRules`), with the theme's value when the theme configures it.
- **A token or spec change is caught, then fixed in the mapping.** The build and `pnpm test`
  fail when the mapping names a token path, a spec property, option, state or part that no longer
  exists, or a Bootstrap property or selector a new Bootstrap version renamed. Fix it by editing
  `src/mapping.mjs` (never `dist/`), then `pnpm bootstrap-theme:build` and `node build.mjs --readme`, and
  look at `dist/demo.html` in light and dark, with the theme on and off.
- **The demo shows every component.** A Bootstrap component added in a new version gets a
  section in `demo/index.html` with its `data-equivalence` note; `demo.css` styles `.demo-*`
  classes only, on Bootstrap's custom properties.
- **Zero dependencies** in `build.mjs`, `src/` and the test (plain Node, like
  `scripts/build-tokens.mjs`). Bootstrap and `sass` are dev dependencies: the build reads
  `node_modules/bootstrap/dist/css/bootstrap.css`, the test compiles the Sass entry when `sass`
  is installed.
- Bootstrap 6 is an alpha: when it moves, update the `bootstrap` dev and peer dependencies,
  rebuild, and let the test name what changed.
