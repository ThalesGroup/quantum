# packages/figma — the components in Figma

`@quantum-ds/figma` builds, and publishes, a Figma development plugin that draws every
component as a Figma component set bound to Figma variables recreated from the tokens. Part of
the agent guide: start from the root `AGENTS.md`; how to run it and what it draws is
`agents/token-sources.md` "Drawing a component in Figma". The blueprints and the engine of
`src/plan.mjs` also draw the components in Penpot: `@quantum-ds/penpot` (`packages/penpot/`)
translates the Figma plan, so a change here is a change of both drawings.

| Path | Role |
| --- | --- |
| `build.mjs` | `pnpm figma:export [id…]` and the package's `build` (run by `pnpm build`): writes `dist/` (not committed): `manifest.json`, `code.js` (`src/plugin.js` with its plan prepended as `PLAN`), `ui.html` (the plugin window), `plan.json` (the same plan, to read). The package publishes `manifest.json`, `code.js` and `ui.html` (`files` in `package.json`; `prepack` builds them), not `plan.json`. Reads the token CSS of `packages/tokens/dist/`: `pnpm figma:export` builds the tokens first. Default: every component with a blueprint; given ids add the components their instances use (`uses`). Prints the slots a blueprint neither binds nor lists. |
| `src/plan.mjs` | Pure plan of the plugin: `figmaVariables` (the variables a set of tokens needs, one collection per tier), `figmaComponent(loaded, spec, blueprint)` (every enum option x blueprint axis x state is a variant whose node tree binds, by variable name, the tokens `activeTokens` makes active; refuses an unknown slot; `uncovered` lists the slots neither bound nor in `notDrawn`), `pluginPlan` (dependencies first), `MANIFEST`. **The blueprint format is documented above `FIELDS`.** Reads the tokens and the token map through `scripts/lib/`. |
| `src/blueprints/<id>.mjs` | One blueprint per component (default export): its Figma layer tree read from the web implementation, the token slot of each field, extra axes, BOOLEAN properties, `notDrawn`. `index.mjs` loads every module of the directory as `BLUEPRINTS`, so a helper shared by blueprints is a named export of one of them (`text-field.mjs`, `checkbox.mjs`, `checkbox-group.mjs`). `pnpm new:component` writes a starter one (`scripts/lib/scaffold.mjs`) that only draws the scaffolded CSS: rewrite it from the real CSS and template. |
| `src/plugin.js` | The plugin, run in Figma's sandbox: plain JavaScript, no optional chaining, no object spread. Opens its window, syncs the variables, then draws each component's variants on its page, sets every value and binds its variable, adds absolute positions and focus rings once laid out, lays the variants out in a grid, adds the text and boolean properties. Keeps an existing component set of the same name; a component that fails is reported and the others are drawn. Posts its progress to the window (`variables`, `component`, `finished` messages), yielding every few variants so the window repaints, and closes when the window's Close button is pressed. |
| `src/ui/` | The plugin window, built with the design system: `ui.mjs` renders it at build time from the plan with the components' own templates (progress bar, badge, button: `UI_COMPONENTS`) and inlines the webfonts, the token CSS and those components' CSS; `ui.js` updates it from the plugin's messages through attributes only (progress value, badge intent and label, the button's `disabled`) and follows Figma's light or dark theme (`figma-dark` -> `data-theme`); `ui.css` is its own layout, on semantic tokens only (checked like the docs site's CSS). |
| `test/plan.test.mjs` | Run by `pnpm test`: the plan (variables, the Button's bindings), every blueprint's coverage, the plugin run against a stand-in of the Figma plugin API (it fails on any plugin warning; its progress messages; a failing component), and the window's markup and CSS. |

## Rules

- A blueprint follows its component's CSS and template: the same parts (layer names are the
  spec's anatomy part ids), the same layout, the slot the CSS reads for each field. It holds no
  value: the engine binds the active token of each slot in each variant.
- Every token slot of the component is bound, or listed in `notDrawn` with the reason Figma
  cannot draw it (durations and easings, font variation axes, values computed from a token).
  A slot Figma can draw is drawn. `pnpm test` fails on an uncovered slot.
- A component, a part, a property, a state or a token slot added or changed in the four
  artifacts changes the blueprint in the same change (`pnpm impact` lists it).
- Literal values are layout only, and said in the blueprint's header comment: a width the web
  takes from its container, a value position of a slider or progress bar.
- A part that is another component is an `instance` of it, listed in `uses`.
- The window is built with the design system, like the docs site: the components' templates and
  CSS for every control it shows, semantic tokens only in `ui.css`. A change to the progress bar,
  badge or button is a change to the window: look at it (open `dist/ui.html` in a browser and
  post it `{ pluginMessage }` messages).
- A blueprint or plan change keeps the Penpot plugin's tests passing too (`packages/penpot/test/`,
  `pnpm test`): a new node type or Figma field needs its Penpot translation
  (`packages/penpot/AGENTS.md`).
- Code that works around a limit of Figma says so with an `upstream(figma): …` marker in its
  comment, which the review of Figma's releases reads (`agents/design-tools.md`).
- A new node type, bind key or plugin step comes with a test, and with the stand-in API taught
  the Figma behaviour it relies on. What the stand-in cannot prove (how Figma renders) is checked
  in the Figma desktop app before it is relied on.
