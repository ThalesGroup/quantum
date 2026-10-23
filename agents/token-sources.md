# Where the tokens come from

The Figma library, its local export, the additions, the Figma component exports, how to
plug another export, and how to draw a component in Figma. Part of the agent guide: start from the root `AGENTS.md`.

## The local export

The Figma library is private. Its export lives in `raw_content/` at the repository root, on the
machines that have it: git ignores the directory, so it is **never committed**, never quoted,
and never named in a spec, a token, the docs, the site or a commit message. Those say "the Figma
library". Nothing in `pnpm check` or CI reads it: `pnpm tokens:figma-library` and the tests that
read it skip without it. When the work needs it (a comparison with Figma, the origin of a token)
and it is missing, ask for it rather than guessing. A new worktree starts without it: copy it
from the main checkout.

## Where the tokens come from

The raw and semantic tokens have two origins, kept in separate directories so that the origin
of any token shows in its path:

- **The Figma library.** Its design tokens export (`raw_content/`: Colors / Base, Colors /
  Palette Switch, Colors / Mapped light and dark, Dimension, Effect, Typography) is **read-only**
  reference material: nothing reads it at build time. `scripts/figma-library.mjs --write`
  recreated it once as clean DTCG: Colors / Base and the Palette Switch in
  `packages/tokens/src/raw/` (hidden primitives), Colors / Mapped, Dimension, Effect and
  Typography in `packages/tokens/src/semantic/` (read by components and the site), the dark
  mapping in `packages/tokens/src/modes/dark/`: the same paths, made valid only where a path or a
  CSS variable cannot carry them (`⚠️ai` → `ai`, `semiBold` → `semi-bold`, `drop shadow` →
  `drop-shadow`; `brand.identity` → `brand.identity-base`, whose CSS variable would collide with
  the mapped `brand-identity`), the same values (lengths in px, opacity as 0-1), the same
  aliases, errors and limitations included (typos, aliases to colors it does not contain, kept
  as literals, contrast failures recorded as known issues of the Color foundation). Colors the
  library composes from a step and an opacity are written as the resulting color. The Palette
  Switch is in its Ash mode; Slate is not recreated yet.
- **Additions.** `packages/tokens/src/additions/{semantic,modes/dark}/` and `packages/tokens/src/platforms/` hold the few
  tokens the design system adds because the Figma library lacks them to render the components:
  line heights, letter spacing, motion, the icon font, `transparent`, the focus ring, and the iOS
  and Android font families. Each file says so in its `$description`. Nothing else is added: no
  semantic layer of sizes, radii or text styles over the library's scales. A new addition is a
  decision to ask for, never a convenience.
- **Component exports.** `raw_content/components/<id>-variants-raw.json` is the Figma export of
  a component set of the Figma library, made with figma-cli: its variant properties and their
  defaults, then every variant with its auto layout (padding, gap, radius, size), fills,
  strokes and children (label text, icon instances). It holds no tokens: `scripts/figma-library.mjs`
  does not read it and nothing reads it at build time. Like the rest of the export, it is
  read-only and local. It is a **candidate rendering** a component is compared with, one difference at a
  time, through the decision loop (`agents/workflow.md` "Compare a component with its Figma export").
  Cite what it shows (values, variant names) as "the Figma prototype", never its path.

These files are the starting point the system evolves from, by decisions (`agents/workflow.md`): edit them like
any token file. `pnpm tokens:figma-library` reports every token of the library that has since
been added, removed or changed; `--write` would undo that evolution, so it is not run again.

### Plugging another export

1. Drop the exported files into a tier directory (any file names, any nesting; every `*.json`
   under a tier's `sources` in `packages/tokens/tokens.config.json` is loaded and deep-merged). Delete the
   files they replace. Figma exports lengths as `$type: "number"` and opacity as a
   percentage: convert them to `dimension` (`{ "value", "unit": "px" }`) and to a 0-1 number,
   or the CSS gets unitless lengths. `scripts/figma-library.mjs` shows one way to do it.
2. If the export puts raw and semantic tokens in one file, split them by top-level group into
   the two directories, or point both tier `sources` in `packages/tokens/tokens.config.json` at distinct
   subfolders.
3. Run `pnpm tokens:build`. The only coupling between the tokens and the components is the set
   of semantic paths referenced by `packages/tokens/src/components/*.tokens.json`. The build lists every
   unresolved alias; repoint those aliases to the equivalent semantic tokens.
4. Supported value shapes: legacy strings (`"#2563eb"`, `"16px"`) and DTCG 2024+ objects
   (`{ "colorSpace", "components", "alpha", "hex" }`, `{ "value", "unit" }`), `$type`
   inherited from groups, composites `typography`, `shadow`, `border`, and aliases anywhere,
   including inside composites. Add a case to `scripts/test/dtcg.test.mjs` if you extend it.
5. Font families: `packages/components/src/fonts.css` loads every family the tokens name from Google Fonts. If the
   tokens name another family, update its URL (the validator checks it).
6. Platform values: anything that differs per platform (system font family, touch target
   heights) goes to `packages/tokens/src/platforms/<id>/` with the same paths as the base tokens. The build
   refuses an overlay that adds a path or touches a component token.
7. Modes: Figma exports one file per mode of a collection (`light.tokens.json`,
   `dark.tokens.json`). The default mode's file goes to `packages/tokens/src/semantic/`, every other one to
   `packages/tokens/src/modes/<id>/` with a `modes` entry in `packages/tokens/tokens.config.json` (`scheme`, `sources`).
   Keep only the semantic tokens whose value differs from the default mode; the build refuses a
   mode that adds a path, overrides a raw or component token, or overrides a token a platform
   overlay also overrides.

## Drawing a component in Figma

`pnpm figma:export [id…]` goes the other way: from the repository to a Figma file. It builds the
Figma development plugin of `@quantum-ds/figma` into `packages/figma/dist/` (not committed; `pnpm
build` builds it too; run it again after any change to a spec or a token). In the Figma desktop
app, **Plugins > Development > Import plugin from manifest…** with
`packages/figma/dist/manifest.json`, then run **Quantum components** in a design file: its window
(built with the design system) shows the progress of each component and the warnings, and stays
open until closed. The package's own rules are in `packages/figma/AGENTS.md`.
Without ids it draws every component; with ids, those and the components their instances use.

- **Variables.** One collection per token tier: `Quantum / Raw` (hidden from publishing, no
  scope), `Quantum / Semantic` (a `Light` and a `Dark` mode, from the token modes; a second mode
  needs a paid Figma plan) and `Quantum / Components`, holding only the tokens the drawn
  components reach. A variable is named after its token path (`button/container/gap/medium`), a
  typography token gives one variable per member (`button/label/typography/medium/font-size`),
  aliases stay aliases, and the web code syntax is the token's CSS variable. These are the
  repository's tokens, not the Figma library's own collections: the plugin never edits those.
  Running it again updates the values in place. The web values are exported: platform overlays
  are not.
- **Blueprints.** A component is drawn from its blueprint, `packages/figma/src/blueprints/<id>.mjs`:
  its Figma layer tree, read from the web implementation, naming the token slot that drives each
  field (format in `packages/figma/src/plan.mjs`). A blueprint holds no value: in each variant,
  the engine binds the token the slot makes active for that configuration (`activeTokens`,
  `scripts/lib/token-map.mjs`), the one the CSS reads. A new component needs a blueprint
  (`pnpm test` fails without one), and every token slot of a component is bound by its blueprint
  or listed in its `notDrawn` with the reason; a changed CSS structure changes the blueprint.
- **The component set.** On a page named after the component: one variant per option of every
  enum property and per state (a state a property sets, such as `disabled` or `checked`, is a
  value of State, as in the spec's state list), plus the axes a blueprint adds when the layout
  depends on something else (the button's icon slots, whose padding differs). The default
  variant is the top-left one. Text properties carry the texts and icon glyphs (ligatures of the
  icon font, as on the web), BOOLEAN properties show the optional parts, focus rings are frames
  outside the border in `focus-visible` only, and a part that is another component (the
  dropdown's trigger) is an instance of it. A component set that already exists is kept as it
  is: delete it to draw it again, so that no instance loses its main component unnoticed.
- **What Figma cannot hold** is set without a variable or left out, and listed in each
  blueprint's `notDrawn`: durations and easings (no variable type), a unitless line height
  (Figma reads a number variable as pixels, so it is set as a percentage), the icon font's fill,
  grade and optical size axes, values computed from a token (the outline radius, a check mark's
  size), and the widths the web takes from its container (a literal width).
- **Fonts.** The plugin loads every family the tokens name. The icon font, Material Symbols
  Outlined, is not among Figma's fonts: install it on the machine (the variable font of
  google/material-design-icons) or icons are drawn as empty squares.
