# packages/penpot — the components in Penpot

`@quantum-ds/penpot` builds, and publishes, a Penpot plugin that draws every component as
a Penpot component with variants bound to Penpot design tokens. It draws the blueprints of
`@quantum-ds/figma` with the same engine: read `packages/figma/AGENTS.md` for the blueprints. Part
of the agent guide: start from the root `AGENTS.md`; how to run it and what it draws is
`agents/token-sources.md` "Drawing a component in Penpot".

| Path | Role |
| --- | --- |
| `build.mjs` | `pnpm penpot:export [id…]` and the package's `build` (run by `pnpm build`): writes `dist/` (not committed): `manifest.json` (version 2), `plugin.js` (`src/plugin.js` with its plan prepended as `PLAN`), `index.html` (the plugin window, which the plugin opens next to the manifest) and `plan.json` (the same plan, to read). The package publishes `manifest.json`, `plugin.js` and `index.html` (`files` in `package.json`; `prepack` builds them), not `plan.json`. Reads `packages/tokens/dist/` (the Penpot token file, the token CSS): `pnpm penpot:export` builds the tokens first. Default: every component with a blueprint; given ids add the components their copies use (`uses`). Prints, per component, the tokens set to their value. |
| `serve.mjs` | `pnpm penpot:serve`: serves `dist/` on localhost:4400 with CORS, as Penpot installs a plugin from the URL of its manifest. |
| `src/plan.mjs` | Pure plan of the plugin: `penpotTokens` (the tokens of the Penpot token file that the components reach, with every reference, ordered so that a reference exists before a token reading it, each value as the plugin API takes it, `pluginValue`: a number as text but for a font weight, and the sets and themes), `penpotComponent` (one component of the Figma plan, `pluginPlan` of `packages/figma/src/plan.mjs`, translated: each Figma field to its Penpot token property, `PROPERTIES`; a field the token's type cannot drive, `APPLIES`, set to its value and listed in `unbound`; what is drawn otherwise in `approximations`), `penpotPlan`, `MANIFEST`. |
| `src/plugin.js` | The plugin, run in Penpot's plugin sandbox. Opens its window and waits for it to be ready, writes the token sets, tokens and themes, then on each component's page draws the first variant of each structure (`structure`: the same shapes, bind keys and parts; boards with a flex layout, texts, icon glyphs, ellipses, paths, copies) and applies its tokens, which set the values, then makes every other variant a clone of the first one of its structure and writes only what differs (`update`; a copy of another component it holds is swapped for a copy of the variant it needs): every write is a change Penpot commits, the cost of a run. A token waits in a queue until `applyTokens` applies it once, with `applyToShapes`, to all the shapes of the component that take it, leaving out those that have it already (Penpot 2.18 would take it off all of them), then waits until Penpot shows it. It waits for Penpot to lay it out, places absolute shapes, paths, focus rings and one-sided borders, lays the variants out in a grid, makes each a component and combines them into a component with variants, then names each variant's main component `Size=small, State=hover`, which gives it those properties in one change (or names the properties and sets each value where Penpot does not). Keeps an existing component of the same name; a component that fails is reported and the others are drawn. Posts its progress to the window (`tokens`, `component` with its `phase`, `finished`, `theme`) and closes when the window's Close button is pressed. |
| `src/ui/` | The plugin window, built with the design system as the Figma plugin's: `ui.mjs` renders it at build time with the components' templates and the Figma window's layout (`packages/figma/src/ui/ui.css`); `ui.js` follows the plugin's messages through attributes only and Penpot's theme (in the URL, `#/?theme=` for a version 2 manifest, then `theme` messages -> `data-theme`). |
| `test/plan.test.mjs` | Run by `pnpm test`: the tokens (reach, order, sets, themes), every component's plan (every bound token exists and its type can drive the property; every `unbound` and `approximations` reason is a known one), the Button's bindings, and the plugin run against a stand-in of the Penpot plugin API that refuses what Penpot refuses (a number value where Penpot's plugin API takes text, a token type on a property it cannot drive, a padding on a board without layout, a reference to a missing token, a variant from a shape that is not a main component, a change on another page), and a file whose tokens Penpot's Tokens panel imported, values as the token file has them. |

## Rules

- Nothing about a component is written here: the blueprints of `@quantum-ds/figma` are the layer
  trees, the tokens the values. A blueprint, a Figma plan or a node type change keeps
  `pnpm test` passing here too.
- A Figma field the translation does not know fails the plan. A new field comes with its Penpot
  property in `PROPERTIES`, a test, and the stand-in taught the Penpot rule it relies on.
- A field set to its value instead of bound is listed in `unbound` with its reason; a part drawn
  otherwise than in Figma in `approximations`. Both reasons come from `UNBOUND` and
  `APPROXIMATIONS`, which the docs (`agents/token-sources.md`) explain.
- Every write is a change Penpot commits: a run's cost is its number of changes, which the stand-in
  counts (`pnpm test` fails when the Button takes 12 or more per variant). Each token application
  also has Penpot resolve every token of the active sets, whatever the number of shapes: a token is
  applied once for all the shapes of a component, never shape by shape, and the stand-in counts the
  applications too (`pnpm test` fails at 200 for the Button). A token sets the values it
  drives, so a value is written only where Penpot refuses the token; a clone is only given what
  differs from its source.
- The plugin relies on Penpot behaviours the stand-in only imitates (layouts and token values
  applied a moment after the call, a token writing its value, a clone keeping its values and
  applied tokens, a token applied to many shapes showing in their `tokens` once applied, a variant's
  properties read from its name, path data in page coordinates): what
  it cannot prove is checked in Penpot before it is relied on.
- Code that works around a limit of Penpot says so with an `upstream(penpot): …` marker in its
  comment, which the review of Penpot's releases reads (`agents/design-tools.md`).
- The window is the Figma plugin's: a change to its layout is made in `packages/figma/src/ui/ui.css`
  and looked at in both.
