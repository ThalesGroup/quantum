# packages/tokens/ — `@quantum-ds/tokens`, DTCG design tokens

The tokens package: three tiers of DTCG sources under `src/`, configured in `tokens.config.json`
(its paths are relative to this package: sources under `src/`, outputs under `dist/`), and the
outputs built from them under `dist/`, published as `@quantum-ds/tokens`. `dist/` is not committed:
`pnpm tokens:build` writes it (`pnpm dev`, `pnpm build`, `pnpm check` and `prepack` run it). Two builds
write it: `scripts/build-tokens.mjs` (zero dependencies) checks the tiers, overlays and modes and writes
what the repository reads (`dist/css/` with its `index.css` entry point, `dist/platforms/<id>/<mode>.tokens.json`,
`dist/shiki-theme.json`); `style-dictionary.config.mjs` writes the distribution formats (see below).
Every `*.json` file under a tier directory is loaded, deep-merged and flattened; file names and nesting are free.

| Tier | Directory | May reference | Purpose |
| --- | --- | --- | --- |
| raw | `src/raw/` | other raw tokens | Hidden primitives from the Figma library: the color palettes (Colors / Base) and the palette switch. Never read by a component or the site. |
| semantic | `src/semantic/`, `src/additions/semantic/` | raw, other semantic tokens | What components and the site read: the Figma library's mapped colors (`global.bg.accent.brand.hover`) and its Dimension, Effect and Typography scales (`space.12`, `corner-radius.xs`, `body.size.md`) in `src/semantic/`; the design system's few additions (`font.line-height.tight`, `duration.fast`, `font.icon.family`, `color.transparent`, `focus.ring.width`, `color.focus.ring`) in `src/additions/semantic/`. |
| component | `src/components/<id>.tokens.json` | semantic | One file per component. Root group = component id. Never overridden per platform. |
| overlay | `src/platforms/<id>/` | as the tier it overrides | Platform values of raw or semantic tokens (see below). |
| mode | `src/modes/<id>/`, `src/additions/modes/<id>/` | raw | Values of semantic tokens in a mode other than the default (`dark`; see below). |

## Rules

- DTCG format: tokens are objects with `$value`; `$type` may sit on a group and is inherited;
  `$description` is encouraged on groups that carry meaning. Aliases are `"{path.to.token}"`.
- A token path is unique across all tiers (the build fails otherwise). Semantic and raw tokens
  may share a top-level group (`color`) as long as full paths differ.
- Component token path grammar: `<component>.<part>.<property>[.<option>][.<state>]`.
  `<part>` must be an anatomy part id of the spec, `<option>` an enum option value, `<state>` a
  declared state. `pnpm validate` enforces it. Which token applies to a given configuration
  follows from the path alone (see "Which token applies" below).
- Component tokens alias semantic tokens **only**: a mapped color, a step of a Figma library scale
  or an addition. There is no intermediate layer of sizes, radii or text styles: a component
  picks scale steps in its own tokens. If nothing fits, that is a decision to ask for (a new
  addition in `src/additions/semantic/`), never a token created for convenience.
- The documentation site (`apps/docs/`) is a consumer of the design system like any product: its
  CSS reads **semantic** tokens only (never raw, never another component's tokens). When the
  docs need a meaning the semantic tier lacks, it reads the scales directly (a heading is
  `heading.size.sm` at `heading.weight.semi-bold`), or asks for a decision. See `apps/docs/AGENTS.md`.
- When two parts share a value, still give each part its own token if they could diverge
  later (label color vs icon color). If they never diverge (icons use `currentColor`), document
  it in the token file `$description` and skip the token.
- Typography is a composite (`$type: "typography"`) with `fontFamily`, `fontSize`,
  `fontWeight`, `lineHeight`, `letterSpacing`. A component token holds the composite, each
  member aliasing a scale step (`{"fontFamily": "{body.family}", "fontSize": "{body.size.md}",
  …}`); the build expands it into five CSS variables.
- After any change: `pnpm tokens:build` (the site and `pnpm validate` read `dist/`). Never commit
  `dist/` nor edit it by hand.
- Every raw and semantic token reaches a Foundations page: a foundation owns it or one of its
  specimens matches it (`packages/components/specs/foundations/*.spec.json`). A token added to an existing group
  appears there by itself; a new group needs a specimen (`pnpm validate` warns until it has one).

## Distribution formats

`style-dictionary.config.mjs` builds, with [Style Dictionary](https://styledictionary.com/), the formats
the 1.x package shipped, from the same sources and `tokens.config.json` (tiers, platforms, modes):
`dist/tokens.css` (`:root`), `dist/tokens.scss`, `dist/tokens-es6.js` and `.d.ts` (the package entry
point), `dist/variables-css.js` (CommonJS, so the package has no `"type": "module"`),
`dist/resources.xml` (Android, with the `android` overlay), `dist/figma/` and `dist/tokens_studio/`
(one file per top-level group, plus `tokens.json`), `dist/penpot/tokens.json` and `dist/dtcg/` (the
sources, with `quantum.resolver.json`: a DTCG resolver whose sets are the tiers and whose modifiers
are the platforms and modes).

- Names are the token path: kebab-case for CSS, Sass and the design tools (the same CSS variables as
  `dist/css/`), PascalCase for the ES module exports, snake_case for Android. A typography token
  splits into its five members, as in `dist/css/`.
- Aliases stay references wherever the format has them (`var()`, Sass variables, `@color/…` and
  `@string/…`, `{path}` in the design tools); JavaScript gets resolved values.
- Every mode other than the default gets `-<mode>` files (`tokens-dark.css` under `.dark`,
  `tokens-dark.scss`, `tokens-es6-dark.js`, `resources-dark.xml`): every token whose resolved value
  differs in the mode, the component tokens aliasing a changed semantic token included, so that a
  `.dark` subtree and a Sass build see them change. The design tools get, per mode, the groups the
  mode overlay touches with their mode values (`figma/global-dark.tokens.json`, `tokens-dark.json`);
  Penpot gets one set and one theme per mode (`Mode/Dark` holds the overlay's tokens).
- Design tools: Figma reads lengths as pixel numbers; Tokens Studio and Penpot get their own types,
  taken from the DTCG type and the property the path names (`designToolType`: `corner-radius` and
  `border-radius` are `borderRadius`, `space`, `gap`, `padding` are `spacing`, `size`, `width`,
  `height` are `sizing`, `body.size` is `fontSizes`, `line-height` is `lineHeights` for Tokens Studio
  and `number` for Penpot, which skips a `lineHeights` token outside a typography…). A duration or an easing, which they have no type
  for, is left out, with every alias to it. A rule that works around a tool's limit carries an
  `upstream(<tool>): …` marker, read by the review of the tools' releases (`agents/design-tools.md`).
- `package.json` → `files` leaves out `dist/figma/` and `dist/tokens_studio/` (not yet packaged, as in 1.x).
- `dist/figma/` is a token export for Figma's own import. The Figma plugin of `@quantum-ds/figma`
  (`packages/figma/`) does not read it: it creates the variables from the DTCG sources through
  `scripts/lib/dtcg.mjs`, one collection per tier with aliases kept, and draws the components on them.
- `dist/penpot/tokens.json` is what the Penpot plugin of `@quantum-ds/penpot` (`packages/penpot/`)
  writes into a Penpot file, kept to the tokens the components reach: a change of its sets, themes,
  types or values changes what the plugin draws (`pnpm test` runs it against that file).
- A new DTCG type needs a branch in `scalar` (and `designToolToken` for the design tools); a new
  property name may need a rule in `designToolType`.

## Syntax highlighting theme

`tokens.config.json` → `syntax` maps TextMate scopes to color tokens (the Code foundation's
`global.text.code.*`, the Figma library's seven categories plus the additions in
`src/additions/semantic/code.tokens.json`, and `global.text.on-base.neutral.primary` for operators and punctuation). `pnpm tokens:build`
writes it as one Shiki theme named `quantum` (display name `Quantum`), `dist/shiki-theme.json`, exposed as
`@quantum-ds/tokens/shiki-theme.json` (`scripts/lib/syntax-theme.mjs`), whose
colors are the CSS variables of the tokens, so it follows every mode. The build fails when a
rule names an unknown, non-color or non-semantic token, when a scope is mapped twice, or when a
token matching `covers` (`global.text.code.*`) has no rule: a new code color needs its scopes here.
TextMate applies the most specific matching scope, whatever the order of the rules.

## Platform overlays

`src/platforms/<id>/**/*.json` (ids from `packages/components/specs/platforms.json`, declared under `platforms`
in `tokens.config.json`) override **raw or semantic** tokens for one platform: same paths, same
reference rules as the tier they override. An overlay cannot add a path or touch a component
token, so every platform resolves exactly the same set of tokens and the component decisions
stay identical everywhere. The build writes one resolved DTCG tree per platform and mode to
`dist/platforms/<id>/<mode>.tokens.json` (`{mode}` in the configured `output`; aliases followed;
`$extensions["io.quantum"]` records tier, alias and whether the overlay or the mode applied). Lengths keep the DTCG unit (`px`): iOS reads pt, Android dp;
the consuming technology converts. Today: `ios` (system font) and `android` (Roboto), both
placeholders; the 44 pt and 48 dp control heights went with the invented control height tokens
(an earlier decision removed them). Add a platform by adding its entry in
`tokens.config.json` and its directory; delete both to remove it.

## Modes

`tokens.config.json` → `modes` declares the modes: exactly one `default: true` (light), whose values
are the base tiers and which has no `sources`, and the others (dark), each an overlay
`src/modes/<id>/**/*.json` of the tiers marked `modal` (semantic only). A mode overlay follows the
platform overlay rules: same paths as `src/semantic/`, aliases to raw tokens, no new path, never a
component token. Write only the tokens whose value differs from the default mode. Each mode has
a `scheme` (`light` or `dark`): the system appearance that selects it on every platform.

- A raw primitive a mode needs (a dark step at an opacity) goes to `src/raw/` like any primitive;
  raw tokens are context-free and never vary per mode.
- A token may vary per platform or per mode, not both (the build refuses it): the winner would
  be arbitrary.
- Outputs: the web CSS declares the semantic tier on `:root, [data-theme]` with the default
  values, then one `[data-theme="<mode>"]` rule per other mode and a
  `@media (prefers-color-scheme: <scheme>)` rule for `[data-theme="auto"]` (`tokens.config.json` →
  `css.modes`); the component tier is declared on `:root, [data-theme]` too, so its `var()`
  aliases resolve again in every context. Every platform gets one resolved tree per mode.
- `src/modes/dark/` is the Figma library's Colors / Mapped (dark) as it is, keeping only the tokens whose
  value differs from the light mapping; `src/additions/modes/dark/` holds the dark values of the
  design system's additions (the focus ring). Every dark choice is checked for contrast in
  every component that aliases it.

## Which token applies

The path says when a component token applies; nothing else does. `scripts/lib/token-map.mjs`
implements the rule, `pnpm validate` checks every component against it, and the playground's
token inspector shows its result. The web CSS follows the same rule by convention.

1. **Reading a path.** After `<property>`, segments are read in order: an option of an enum
   property that affects the part (and has no option yet in the path), else the state (the
   first declared state id), else a key of the property (`transition.duration`). So an option
   value equal to a state id (`default`) reads as the state once its property is set. The
   instance enum properties of a repeated part (a menu item's `intent`) count as enum
   properties of the parts they affect (`dropdown.item.background.error.hover`); each instance
   matches with its own value.
2. **Slots.** Tokens with the same part, property and keys form a slot: one CSS declaration.
3. **Matching.** In a slot, a token applies when every option it names equals the prop. An
   option it does not name matches any value: `button.container.background.accent.disabled`
   holds for every intent.
4. **States.** The states that hold are the forced state and every state set through a boolean
   property that is on (`disabled`); when several hold, the one declared last in the spec wins
   (as the CSS orders its rules). The slot takes a token of the winning state if it has one,
   else of the next state that holds, else its `default` token, else a token without state.
   A slot with none of them is inactive (`outline-width.focus-visible` at rest).
5. **Specificity.** Among the tokens chosen that way, the one naming the most options wins.
   Two tokens that tie for one configuration are an **error** (`pnpm validate`): name one more
   option or state in one of them. A token that never wins is a **warning** (dead token).

Each component token also has a **kind**, from its property (`PROPERTY_KINDS` in
`token-map.mjs`): color (every `$type: color` token, `border-color` included, and `opacity`,
which modulates a color), spacing, size, border, typography (icon font axes too) or motion. The inspector filters by kind; a property
without one is a warning: add it to the table.

## Adding a state or option to a component

Add a sibling under the existing property group, aliasing a semantic token. Do it for every
property that varies by that option/state (background, border-color, label color…). The
validator warns when an option or state declared in the spec never appears in any token path.

## Origin: the Figma library and additions

Every raw and semantic token comes from one of two places, and its directory says which:

| Directory | Origin |
| --- | --- |
| `src/raw/colors-base`, `src/raw/palette-switch`, `src/semantic/colors-mapped`, `src/semantic/dimension`, `src/semantic/effect`, `src/semantic/typography`, `src/modes/dark/colors-mapped` | Recreated from the Figma library (its local export, `agents/token-sources.md`) by `scripts/figma-library.mjs`, one file per collection and mode. |
| `src/additions/**`, `src/platforms/**` | Added by the design system. Each file says so in its `$description`. |

The recreation keeps the Figma library as it is: its paths, made valid only where a DTCG path or a CSS
variable cannot carry them (kebab-case, no emoji or space; `brand.identity` becomes
`brand.identity-base` because its CSS variable would collide with the mapped `brand-identity`),
its values (lengths as px dimensions, opacity as 0-1, families as a single name), its aliases
(`global.bg.level.0.default` → `global.bg.base.neutral.1` → `light-switch.base.25` →
`neutral.light.ash.25`), its typos and its errors. Where the library composes a color from a
palette step and an opacity, or aliases a color it does not contain, the token holds the literal
color and its `$description` says why. The Palette Switch is recreated in its Ash mode only.

These files evolve by decisions like any token file. `pnpm tokens:figma-library` lists every path
added, removed or changed since the library export (it needs the local export); never run `--write` again, it would undo them.

The component exports (`raw_content/components/`, local) are not a token source: they are the Figma exports of component sets
(`<id>-variants-raw.json`), compared with the components (`agents/token-sources.md`). No token is recreated
from it. The values it shows map to existing semantic tokens; a comparison that finds no
semantic token for a value records the departure rather than adding one, unless an addition is
decided.

## Plugging another export

See `agents/token-sources.md`. In short: drop files in `src/raw/` and `src/semantic/`, delete the
files they replace, run `pnpm tokens:build`, repoint any alias the build reports as unresolved.
