# Where the tokens come from

The Figma library, its local export, the additions, the Figma component exports, and how to
plug another export. Part of the agent guide: start from the root `AGENTS.md`.

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
