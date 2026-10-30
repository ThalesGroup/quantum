---
name: framework-theme
description: Create a @quantum-ds/<framework>-theme theme package that brings the Quantum tokens to a UI framework (Bootstrap, shadcn/ui, another one) through that framework's own theming API, generated from a declarative mapping checked against the tokens and the specs, with a self-contained demo page; or regenerate an existing theme after a token or spec change. Use when the user asks for a theme, a skin or a preset of Quantum for a framework, or when a token or spec change breaks a theme's build or test.
---

# A Quantum theme for a framework

A theme package (`packages/<framework>-theme/`, published as `@quantum-ds/<framework>-theme`) is a
**mapping**, as data, from a framework's theming API to Quantum token paths, that a build turns
into what the framework consumes, in every mode. Nothing in it is hand-written design: the
tokens and the specs stay the source of truth, and the build **fails** when the mapping names a
token path, a component, a property, an option, a state or a part that no longer exists, so a
token or spec change surfaces at once. The two worked examples are `packages/bootstrap-theme/`
(Bootstrap 6) and `packages/shadcn-theme/` (shadcn/ui): read both before starting a third one.

Repository rules still apply: `AGENTS.md` (every change ends with `pnpm check`), `agents/git.md`
(branch, Conventional Commits with the package's scope, pull request), `agents/model.md` "In
Bootstrap and shadcn/ui".

## 1. Only the framework's theming API

A theme uses what the framework documents for theming and nothing else:

- **Bootstrap**: the root custom properties (`--bs-*` on `:root, :host`, `light-dark()` values
  that follow `data-bs-theme`), the Sass configuration (`@use "bootstrap" with (...)`: theme
  color maps, surfaces, radii, spacers, font sizes, per-component token maps) and the
  per-component custom properties a component declares (`--bs-btn-*`), set on the selectors
  Bootstrap uses.
- **shadcn/ui**: the CSS variables of its theme (`--background`, `--primary`, `--radius`, …) on
  `:root` and `.dark`, bridged to Tailwind in `@theme inline`, and the registry item
  (`registry:theme`, `cssVars.theme/light/dark`) that `shadcn add` applies.

Never restyle a framework selector with plain CSS properties, never add component CSS, never
patch the framework's component classes to look like Quantum. A Quantum decision the API cannot
express (a height, a hover computed by the framework, a border it draws at 1px) is left out and
listed in the README under "Not themable through <framework>'s API". That list is part of the
deliverable: it tells the team what a Quantum rendering in that framework will never get.

## 2. Tiers onto layers

Frameworks layer their theming like Quantum's tiers. Keep the layers aligned, so the framework's
own derivations keep working:

| Quantum tier | Framework layer | Examples |
| --- | --- | --- |
| **semantic** (`global.bg.*`, `global.text.*`, `global.border.*`, `global.icon.*`, scales `body.*`, `heading.*`, `mono.*`, `font.*`, `space.*`, `corner-radius.*`, `stroke-width.*`, `effect.shadow.*`, `focus.ring.*`, `color.focus.ring`, `duration.*`, `easing.*`) | the framework's semantic or root layer: surfaces, text, borders, theme colors (primary, danger…), type scale, radii, spacing, focus ring, elevation, motion | Bootstrap `$theme-colors`, `$theme-bgs`, `--bs-bg-body`, `--bs-radius-*`; shadcn `--background`, `--primary`, `--ring` |
| **component** (`button.container.*`, `text-field.control.*`, `card.container.*`…) | the framework's per-component layer, or a framework variable that is really one component's decision | Bootstrap `--bs-btn-input-*` sizes, `--bs-control-*`, card/badge/alert tokens; shadcn `--card`, `--popover`, `--input`, `--radius-md` (the control radius) |
| **raw** (`neutral.light.ash.*`, palettes) | nothing | the shared library refuses a raw path |

Semantic first: a framework variable that names a meaning (the page background, the brand fill,
the focus ring) takes the Quantum semantic token with that meaning. A framework variable that is
really one component's decision takes that component's token, and the mapping says so in its
`reason`, so the theme follows the component when the component changes. The generated output
writes the token path next to every value, and for a component token the semantic token it
aliases (`tokenTrace`).

Modes: Quantum's `light` (the default) and `dark` resolve every path; the build emits both the
way the framework switches (Bootstrap `light-dark()`, shadcn `.dark`). A mode-independent
variable (a radius) declares `modes: ['light']`.

## 3. Package layout

```
packages/<framework>-theme/
  package.json        @quantum-ds/<framework>-theme, "type": "module", files: CHANGELOG.md + dist, publishConfig public,
                      scripts build + prepack = node build.mjs, the framework as a peerDependency (and devDependency for the demo)
  LICENSE, README.md, AGENTS.md, CHANGELOG.md   modelled on packages/figma/
  src/mapping.mjs     THE MAPPING: plain exported objects, no logic (section 4)
  src/lib.mjs         the only module that reads the design system: re-exports scripts/lib/theme-mapping.mjs and adds
                      what is the framework's own (resolving the mapping into the framework's value shapes)
  build.mjs           writes dist/ from the mapping: the theme file(s), then the demo page; exits non-zero on a mapping problem
  demo/               the source of the demo page (section 6)
  test/theme.test.mjs node --test, zero dependencies (section 7)
  dist/               GENERATED, never committed (.gitignore): the theme and demo.html
```

Dependencies: the theme side is zero-dependency (plain Node and `scripts/lib/`), like
`scripts/build-tokens.mjs`. The framework itself and whatever the demo needs (a bundler, React…)
are `devDependencies`; the framework is also a `peerDependency` so consumers get a version check.
Install them once with `pnpm install` from the root, which updates `pnpm-lock.yaml` (pnpm 12
refuses a package published less than a day ago and a dependency with a build script nobody
ruled on: pin an older version, or rule on the script in `pnpm-workspace.yaml` → `allowBuilds`).

## 4. The mapping file

`src/mapping.mjs` exports plain objects that `scripts/lib/theme-mapping.mjs` knows how to check:

- **Token entries**, grouped by the framework's layers (Bootstrap: `ROOT`, `COMPONENTS` per
  selector; shadcn: `VARIABLES`, `THEME`): `name -> { token, reason?, modes?, … }` where
  `token` is a Quantum token path (semantic or component), `reason` says why when the choice is
  not obvious, `modes` limits the entry to some modes, and any other field is the framework's
  own (shadcn's `fallback` font stack, Bootstrap's unit conversion or selector).
- **Component equivalences** (`COMPONENTS`): which framework component or variant renders
  which Quantum configuration: `{ quantum: '<component id>', <framework>: '<its component>',
  configs: [{ set: { emphasis: 'accent', intent: 'brand' }, props: { variant: 'default' } },
  { set: { size: 'xsmall' }, props: { size: 'xs' } }, { state: 'current', props: … },
  { part: 'icon', props: … }, { set: …, props: null, note: 'no equivalent' }] }`. `set` names
  spec properties and option ids (or a boolean property and its value), `state` a spec state id,
  `part` an anatomy part id: all checked against `packages/components/specs/components/<id>.spec.json`.
  Every Quantum component has an entry, with `props: null` where the framework has nothing; the
  framework's components with no Quantum counterpart are listed too (`SHADCN_ONLY`, …). The demo
  prints these equivalences under each section, so they stay true.

Every value the build writes comes from a token through this file. A literal in the output is
either a framework fallback declared in the mapping (a font stack) or a bug.

## 5. The shared library and the build

`scripts/lib/theme-mapping.mjs` (test: `scripts/test/theme-mapping.test.mjs`):

- `loadQuantum()` → `{ light, dark, modes, specs }`: one `Map` per mode of token path →
  `{ path, type, tier, alias, value }` (`value` the resolved CSS value in that mode, through
  `scripts/lib/dtcg.mjs`; typography composites left out, a theme reads their members' scale
  tokens), the mode ids (default first) and the component specs. It reads the token sources and
  the specs, so no `pnpm tokens:build` is needed.
- `checkMapping(quantum, { tokens, components })` → the problems: an unknown or raw token
  path, an unknown mode, a component id without a spec, a property, option, state or part the
  spec does not declare. `tokens` is `{ GROUP: { name: entry } }` or `[where, entry]` pairs.
  `assertMapping` throws with them, one per line.
- `tokenTrace(t)` (the comment next to a value), `pxNumber`, `pxToRem` (frameworks in rem).

`build.mjs` loads the design system once, asserts the mapping, resolves every entry per mode,
writes the theme file(s) with a `/* token.path */` comment on each declaration, then builds the
demo (section 6). `pnpm build` and `prepack` run it; a `--no-demo` flag keeps the tests fast.

## 6. The demo page

`dist/demo.html` is ONE self-contained page (the framework's CSS and JS, the theme and the demo
inlined; only the Google Fonts link for Inter, Fragment Mono and Material Symbols stays
external) showing EVERY component of the framework with the theme, in every mode, built from
committed sources in `demo/`:

- a sticky toolbar: the mode switch (light / dark / system) the way the framework switches, and
  for a CSS-override theme a "theme on/off" toggle to compare with the stock framework;
- one section per framework component, with the Quantum equivalence line generated from the
  mapping's `COMPONENTS` (never typed by hand), every variant, size and state;
- a swatch grid of every theme variable with its token path, so a reviewer reads the mapping on
  the page.

Bootstrap: a static `demo/index.html` + `demo.css` (layout only) + `demo.js`, inlined by
`build.mjs`. shadcn: a Vite + React + Tailwind v4 app (`demo/`), the registry components fetched
once by `demo/scripts/fetch-ui.mjs` and committed, built with `vite-plugin-singlefile`.
`file://` blocks module scripts: serve `dist/` over HTTP to look at it (the in-app browser, a
`python3 -m http.server` in `dist/`).

Then LOOK at it, light and dark, against the reference rendering (`packages/components/src/`,
`pnpm dev`): the brand button, a text field, a card, the focus ring, the dark surfaces. A theme
that passes its tests and looks wrong is wrong: fix the mapping, not the demo.

## 7. Checks

- `node packages/<framework>-theme/build.mjs` exits non-zero on any mapping problem (and so do
  `pnpm build`, `pnpm --filter "./packages/*" pack --dry-run` and the release).
- `test/theme.test.mjs` (run by `pnpm test`, so by `pnpm check`): the mapping holds
  (`checkMapping` empty) and rejects bad entries; every variable the framework documents is
  mapped in every mode; the build writes the files; the output parses back to the mapped
  values; every framework custom property the mapping targets still exists in the framework's
  own CSS (catches a rename in the next framework release); the demo shows every mapped
  component.
- `pnpm check` and `pnpm --filter @quantum-ds/<framework>-theme pack --dry-run` pass.
- A Sass or TypeScript side (Bootstrap's `dist/quantum.scss`, the shadcn demo) compiles with
  the installed tool.

## 8. Registering the package in the repository

One edit each, modelled on the two existing packages: `.gitignore` (`packages/<framework>-theme/dist/`),
root `package.json` (`<framework>-theme:build` script = `pnpm run tokens:build && pnpm --filter
@quantum-ds/<framework>-theme build`, its test glob in `test`, its build in `build`),
`scripts/lib/paths.mjs` (`<framework>`, `<framework>Dist`), `scripts/lib/conventional-commits.mjs`
(`AREA_SCOPES`), `agents/git.md` (the scope list), `README.md` (packages table, commands),
`CONTRIBUTING.md` (structure table, commands), `AGENTS.md` (the package list, the commands
table rows for `<framework>-theme:build`, `test`, `build`), `agents/model.md` ("In Bootstrap and
shadcn/ui" and the repository map), `scripts/AGENTS.md` if the shared library changes. Dependabot
already covers `packages/*`. The first version of a new package is published by hand
(`CONTRIBUTING.md` "Releases").

## 9. Regenerating a theme after a token or spec change

1. `pnpm check` fails in the theme's test, or `pnpm build` in its build, naming the mapping
   entry and what no longer exists (`VARIABLES.primary: unknown Quantum token "…"`,
   `COMPONENTS[0] (button).configs[2]: button.size has no option "…"`).
2. Fix `src/mapping.mjs`: point the entry at the token or option that replaced it (the spec's
   decision log and changelog say what), or remove it with a line in the README's "Not themable"
   list when the decision no longer exists.
3. `pnpm <framework>-theme:build`, look at `dist/demo.html` where the change shows, `pnpm check`.
4. Update the README's mapping table (it is written by hand; the package's `AGENTS.md` asks to
   keep it in step with `src/mapping.mjs`) and `CHANGELOG.md`; the theme's version follows
   `CONTRIBUTING.md` "Releases".

A token or spec change in the design system is not done until every theme builds: `pnpm impact`
lists the theme packages among the consumers of a token or a spec.

## 10. The two worked examples

**Bootstrap 6** (`packages/bootstrap-theme/`): `src/mapping.mjs` maps Bootstrap's root tokens (theme
colors with their `base/fg/bg/bg-subtle/border/contrast/focus-ring` keys, `bg-*`, `fg-*`,
`border-*`, the body and mono families, font sizes, weights, line heights, radii, spacers,
border width, focus ring, shadows, transitions, `btn-input-*` per size, `control-*`) and the
per-component custom properties (`--bs-btn-*` on the button selectors, card, badge, alert,
accordion, progress, spinner, pagination, breadcrumb, avatar, placeholder, menu, form
controls) to Quantum tokens; `build.mjs` writes `dist/quantum.css` (a `:root, :host` block of
`--bs-*` with `light-dark()` values, loaded after `bootstrap.css`, plus the component
selectors), `dist/quantum.scss` (the same decisions as `@use "bootstrap" with (...)`
configuration, compiled with `sass` to prove it) and `dist/demo.html`. Button equivalence:
Quantum emphasis accent / subtle / ghost = `.btn-solid` / `.btn-subtle` / `.btn-text`, intent
brand / neutral / error = `.theme-primary` / `.theme-secondary` / `.theme-danger`, sizes
xsmall / small / medium / large = `.btn-xs` / `.btn-sm` / default / `.btn-lg`.

**shadcn/ui** (`packages/shadcn-theme/`): `src/mapping.mjs` maps the 33 theme variables
(`VARIABLES`), the fonts and the radius scale (`THEME`, written into `@theme inline` because
shadcn's multiplied radius scale cannot give Quantum's 2 / 4 / 8 / 8 px) and the component
equivalences of all 25 Quantum components (`COMPONENTS`); `build.mjs` writes `dist/quantum.css`
(`:root`, `.dark`, `@theme inline`), `dist/quantum.json` (the `registry:theme` item for
`npx shadcn add`) and `dist/demo.html` (Vite). Button equivalence: emphasis accent / subtle /
ghost = variant `default` / `secondary` / `ghost`, intent error = `destructive`, sizes = `xs` /
`sm` / `default` / `lg`, Icon button = `icon*`.
