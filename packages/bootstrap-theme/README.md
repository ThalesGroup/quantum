# @quantum-ds/bootstrap-theme

[![npm version](https://img.shields.io/npm/v/@quantum-ds/bootstrap-theme)](https://www.npmjs.com/package/@quantum-ds/bootstrap-theme)

> [!WARNING]
> **Experimental: Quantum NextGen.** This package belongs to Quantum NextGen, the next major version of the Quantum Design System, developed on the [`nextgen`](https://github.com/ThalesGroup/quantum/tree/nextgen) branch. It targets Bootstrap 6, itself in alpha. It is experimental: what the theme sets, and how, may change or break in any release, without notice. Do not use it in production.

The Quantum Design System for [Bootstrap 6](https://getbootstrap.com/docs/6.0/): a theme built from
[`@quantum-ds/tokens`](../tokens) through Bootstrap's own theming API only, following the
specifications of [`@quantum-ds/components`](../components).

The theme reassigns Bootstrap's custom properties and nothing else: its root tokens (theme colors,
surfaces, text, borders, typography, radii, spacers, focus ring, shadow color, motion) from Quantum
**semantic** tokens, and the per-component tokens Bootstrap declares (`--bs-btn-*`, `--bs-control-*`,
`--bs-card-*`, …) from Quantum **component** tokens. It adds no selector of its own and restyles no
Bootstrap property: what Bootstrap's API cannot express is left out and listed below. Every value
names its token in a comment, and colors are `light-dark()` pairs, so the theme follows Bootstrap's
color modes by itself.

## Usage

### CSS

```sh
pnpm add bootstrap@6.0.0-alpha.1 @quantum-ds/bootstrap-theme@alpha
```

Load Bootstrap, then the theme, and the webfonts the tokens name (Inter, Fragment Mono, and
Material Symbols Outlined for icons):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fragment+Mono&family=Inter:wght@100..900&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20,300,0,0&display=block">
<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.css">
<link rel="stylesheet" href="node_modules/@quantum-ds/bootstrap-theme/dist/quantum.css">
```

`dist/quantum.css` must come after `bootstrap.css`. It writes its component rules into Bootstrap's
own cascade layers (`@layer forms`, `@layer components`), so Bootstrap's utilities still win over
it, as they win over Bootstrap's components.

**Color modes.** Bootstrap 6 switches `color-scheme`: `data-bs-theme="light"` or `"dark"` on
`<html>` (or on any element, for a subtree), or nothing to follow the system. Every color of the
theme is `light-dark(<Quantum light>, <Quantum dark>)`, so it follows the same switch, with no
`[data-bs-theme]` rule of its own. The Quantum light mode is Bootstrap's light scheme, the Quantum
dark mode its dark scheme.

**Classes.** Use Bootstrap's markup and classes: the table [Quantum components in
Bootstrap](#quantum-components-in-bootstrap) says which classes give each Quantum component and
option. For example, Quantum's Button emphasis accent, subtle and ghost are `.btn-solid`,
`.btn-subtle` and `.btn-text`; its intent brand, neutral and error are `.theme-primary`,
`.theme-secondary` and `.theme-danger` (accent + neutral is `.btn-solid.theme-inverse`); its sizes
xsmall, small, medium and large are `.btn-xs`, `.btn-sm`, the default and `.btn-lg`.

### Sass

The same decisions as Bootstrap Sass configuration. With `node_modules` on Sass's load path:

```scss
// Bootstrap configured with the Quantum maps, plus the few rules no map can hold.
@use "@quantum-ds/bootstrap-theme/dist/quantum";
```

or, to add your own configuration to Quantum's:

```scss
@use "sass:map";
@use "@quantum-ds/bootstrap-theme/dist/scss/quantum" as quantum;
@use "bootstrap/scss/bootstrap" with (
  $theme-colors: map.merge(quantum.$theme-colors, ("brand-2": (/* … */))),
  $root-tokens: quantum.$root-tokens,
  // …every map of dist/scss/_quantum.scss: $theme-bgs, $theme-fgs, $theme-borders, $type-tokens,
  // $font-sizes, $font-weights, $radii, $spacers and the component maps ($button-tokens, …)
);
@include quantum.rules;
```

`dist/scss/_quantum.scss` holds one variable per Bootstrap map it configures and a `rules` mixin
for what no map can hold (size and state rules such as `.form-control-sm` or `.btn-solid:disabled`,
and `--radius-pill`, which Bootstrap sets after its `$radii` loop). Bootstrap's Sass writes its
custom properties without the `--bs-` prefix (its `bootstrap.css` gets it from a PostCSS step):
the `rules` mixin is unprefixed too, so it matches whatever your build does. Sass prints colors
with an alpha channel as `rgba()` instead of eight-digit hex: the same colors.

## Mapping

Generated from [`src/mapping.mjs`](src/mapping.mjs) (`node build.mjs --readme`); values are the
resolved tokens of the web platform, light / dark when they differ. Lengths are converted from
px to rem (16px), like Bootstrap's, except hairlines and outlines (stroke widths, the focus ring)
and the full radius, which stay in px.

<!-- mapping:start (generated: node build.mjs --readme) -->
#### Theme colors

.theme-primary, on root; Sass `$theme-colors`. Quantum brand intent (Button and Badge intent brand).

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-primary-base` | `global.bg.accent.brand.default` | `#175DD6` / `#9EE7FA` |  |
| `--bs-primary-fg` | `global.text.on-base.brand.default` | `#175DD6` / `#9EE7FA` | Brand text on the page: the ghost button label and the link color. |
| `--bs-primary-fg-emphasis` | `global.text.on-subtle.brand.default` | `#1148A9` / `#9EE7FA` | The ghost button hover label and the subtle button label: the darker brand text step. |
| `--bs-primary-bg` | `global.bg.accent.brand.default` | `#175DD6` / `#9EE7FA` |  |
| `--bs-primary-bg-subtle` | `global.bg.subtle.brand.default` | `#EEF1F7` / `#09191D` |  |
| `--bs-primary-bg-muted` | `global.bg.subtle.brand.hover` | `#DDE6F5` / `#0D272E` | The next step of the subtle ramp, Quantum's hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum's hover. |
| `--bs-primary-border` | `global.border.accent.brand.default` | `#1148A9` / `#53D6F2` |  |
| `--bs-primary-focus-ring` | `color.focus.ring` | `#175DD6` / `#9EE7FA` | Quantum has one focus ring color for every intent (Focus foundation). |
| `--bs-primary-contrast` | `global.text.on-accent.brand.default` | `#FBFCFD` / `#09191D` |  |

.theme-accent, on root; Sass `$theme-colors`. Bootstrap's accent is a decorative second hue (indigo), not a status: it takes Quantum's extended lavender, the decorative palette closest to indigo. functional.severe is a status between warning and error and must not decorate.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-accent-base` | `global.bg.accent.extended.lavender.default` | `#7534A9` / `#B87BF5` |  |
| `--bs-accent-fg` | `global.text.on-base.extended.lavender.default` | `#7534A9` / `#B87BF5` |  |
| `--bs-accent-fg-emphasis` | `global.text.on-subtle.extended.lavender.default` | `#3F1A5C` / `#CA9EFA` |  |
| `--bs-accent-bg` | `global.bg.accent.extended.lavender.default` | `#7534A9` / `#B87BF5` |  |
| `--bs-accent-bg-subtle` | `global.bg.subtle.extended.lavender.default` | `#F4EBFE` / `#2D1543` |  |
| `--bs-accent-bg-muted` | `global.bg.subtle.extended.lavender.hover` | `#E6D2FE` / `#3F1A5C` | The next step of the subtle ramp, Quantum's hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum's hover. |
| `--bs-accent-border` | `global.border.accent.extended.lavender.default` | `#8D3BCD` / `#A653EA` |  |
| `--bs-accent-focus-ring` | `color.focus.ring` | `#175DD6` / `#9EE7FA` | Quantum has one focus ring color for every intent (Focus foundation). |
| `--bs-accent-contrast` | `global.text.on-accent.extended.lavender.default` | `#FDFBFF` / `#1D0E2C` |  |

.theme-success, on root; Sass `$theme-colors`. Quantum functional success.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-success-base` | `global.bg.accent.functional.success.default` | `#0B7742` / `#11C772` |  |
| `--bs-success-fg` | `global.text.on-subtle.functional.success.default` | `#075D33` / `#30F498` | Text in the intent color reads on the subtle fill (alert, subtle badge) and on the page: Quantum's on-subtle step, the alert title and subtle badge label. |
| `--bs-success-fg-emphasis` | `global.text.on-sunken.functional.success.default` | `#075D33` / `#129957` |  |
| `--bs-success-bg` | `global.bg.accent.functional.success.default` | `#0B7742` / `#11C772` |  |
| `--bs-success-bg-subtle` | `global.bg.subtle.functional.success.default` | `#DBFAE6` / `#011C16` |  |
| `--bs-success-bg-muted` | `global.bg.subtle.functional.success.hover` | `#AEF6C9` / `#022A23` | The next step of the subtle ramp, Quantum's hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum's hover. |
| `--bs-success-border` | `global.border.accent.functional.success.default` | `#075D33` / `#16AE64` | The alert and accent badge border. |
| `--bs-success-focus-ring` | `color.focus.ring` | `#175DD6` / `#9EE7FA` | Quantum has one focus ring color for every intent (Focus foundation). |
| `--bs-success-contrast` | `global.text.on-accent.functional.success.default` | `#F8FEFA` / `#011C16` |  |

.theme-danger, on root; Sass `$theme-colors`. Quantum functional error (Button intent error).

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-danger-base` | `global.bg.accent.functional.error.default` | `#E12A23` |  |
| `--bs-danger-fg` | `global.text.on-subtle.functional.error.default` | `#C01619` / `#FAA79D` | Text in the intent color reads on the subtle fill (alert, subtle badge) and on the page: Quantum's on-subtle step, the alert title and subtle badge label. |
| `--bs-danger-fg-emphasis` | `global.text.on-sunken.functional.error.default` | `#C01619` / `#EE5248` |  |
| `--bs-danger-bg` | `global.bg.accent.functional.error.default` | `#E12A23` |  |
| `--bs-danger-bg-subtle` | `global.bg.subtle.functional.error.default` | `#FEECEA` / `#2B0B08` |  |
| `--bs-danger-bg-muted` | `global.bg.subtle.functional.error.hover` | `#FCCDC6` / `#3E130F` | The next step of the subtle ramp, Quantum's hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum's hover. |
| `--bs-danger-border` | `global.border.accent.functional.error.default` | `#C01619` | The alert and accent badge border. |
| `--bs-danger-focus-ring` | `color.focus.ring` | `#175DD6` / `#9EE7FA` | Quantum has one focus ring color for every intent (Focus foundation). |
| `--bs-danger-contrast` | `global.text.on-accent.functional.error.default` | `#FEFBFA` |  |

.theme-warning, on root; Sass `$theme-colors`. Quantum functional warning.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-warning-base` | `global.bg.accent.functional.warning.default` | `#FFC61C` |  |
| `--bs-warning-fg` | `global.text.on-subtle.functional.warning.default` | `#644B16` / `#FFD654` | Text in the intent color reads on the subtle fill (alert, subtle badge) and on the page: Quantum's on-subtle step, the alert title and subtle badge label. |
| `--bs-warning-fg-emphasis` | `global.text.on-sunken.functional.warning.default` | `#2D2107` / `#C38401` |  |
| `--bs-warning-bg` | `global.bg.accent.functional.warning.default` | `#FFC61C` |  |
| `--bs-warning-bg-subtle` | `global.bg.subtle.functional.warning.default` | `#FFF1C7` / `#1F1504` |  |
| `--bs-warning-bg-muted` | `global.bg.subtle.functional.warning.hover` | `#FFE495` / `#2D2107` | The next step of the subtle ramp, Quantum's hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum's hover. |
| `--bs-warning-border` | `global.border.accent.functional.warning.default` | `#DFA700` | The alert and accent badge border. |
| `--bs-warning-focus-ring` | `color.focus.ring` | `#175DD6` / `#9EE7FA` | Quantum has one focus ring color for every intent (Focus foundation). |
| `--bs-warning-contrast` | `global.text.on-accent.functional.warning.default` | `#1F1504` |  |

.theme-info, on root; Sass `$theme-colors`. Quantum functional info.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-info-base` | `global.bg.accent.functional.info.default` | `#2B68E0` / `#94B6F4` |  |
| `--bs-info-fg` | `global.text.on-subtle.functional.info.default` | `#1A4CAD` / `#BBCFF3` | Text in the intent color reads on the subtle fill (alert, subtle badge) and on the page: Quantum's on-subtle step, the alert title and subtle badge label. |
| `--bs-info-fg-emphasis` | `global.text.on-sunken.functional.info.default` | `#0C2A68` / `#94B6F4` |  |
| `--bs-info-bg` | `global.bg.accent.functional.info.default` | `#2B68E0` / `#94B6F4` |  |
| `--bs-info-bg-subtle` | `global.bg.subtle.functional.info.default` | `#EDF1F9` / `#09162F` |  |
| `--bs-info-bg-muted` | `global.bg.subtle.functional.info.hover` | `#DEE7F6` / `#0B204B` | The next step of the subtle ramp, Quantum's hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum's hover. |
| `--bs-info-border` | `global.border.accent.functional.info.default` | `#1A4CAD` / `#709DF1` | The alert and accent badge border. |
| `--bs-info-focus-ring` | `color.focus.ring` | `#175DD6` / `#9EE7FA` | Quantum has one focus ring color for every intent (Focus foundation). |
| `--bs-info-contrast` | `global.text.on-accent.functional.info.default` | `#FBFCFD` / `#09162F` |  |

.theme-inverse, on root; Sass `$theme-colors`. Quantum neutral accent (Button and Badge accent/neutral).

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-inverse-base` | `global.bg.accent.neutral.default` | `#201E1F` / `#E8E3E4` |  |
| `--bs-inverse-fg` | `global.text.on-base.neutral.primary` | `#0E0D0D` / `#D2CECF` |  |
| `--bs-inverse-fg-emphasis` | `global.text.on-base.neutral.primary` | `#0E0D0D` / `#D2CECF` |  |
| `--bs-inverse-bg` | `global.bg.accent.neutral.default` | `#201E1F` / `#E8E3E4` | Quantum's neutral accent is the inverse surface (near black in light mode, near white in dark): Button accent/neutral. |
| `--bs-inverse-bg-subtle` | `global.bg.subtle.neutral.default` | `#B6B4B41a` / `#7676761a` |  |
| `--bs-inverse-bg-muted` | `global.bg.subtle.neutral.hover` | `#B6B4B426` / `#7676764d` | The next step of the subtle ramp, Quantum's hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum's hover. |
| `--bs-inverse-border` | `global.border.accent.neutral.default` | `#323031` / `#B9B7B7` |  |
| `--bs-inverse-focus-ring` | `color.focus.ring` | `#175DD6` / `#9EE7FA` | Quantum has one focus ring color for every intent (Focus foundation). |
| `--bs-inverse-contrast` | `global.text.on-accent.neutral.primary` | `#FDFDFD` / `#191919` |  |

.theme-secondary, on root; Sass `$theme-colors`. Quantum neutral subtle family (Button subtle/neutral and ghost/neutral).

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-secondary-base` | `global.bg.base.neutral.4` | `#DFDBDC` / `#303030` |  |
| `--bs-secondary-fg` | `global.text.on-base.neutral.primary` | `#0E0D0D` / `#D2CECF` | The subtle and ghost neutral button label. |
| `--bs-secondary-fg-emphasis` | `global.text.on-base.neutral.primary` | `#0E0D0D` / `#D2CECF` |  |
| `--bs-secondary-bg` | `global.bg.base.neutral.3` | `#ECE8E9` / `#282828` | An opaque neutral surface step for the solid secondary button, which Quantum has no emphasis for (its neutral accent is the inverse one). |
| `--bs-secondary-bg-subtle` | `global.bg.subtle.neutral.default` | `#B6B4B41a` / `#7676761a` |  |
| `--bs-secondary-bg-muted` | `global.bg.subtle.neutral.hover` | `#B6B4B426` / `#7676764d` | The next step of the subtle ramp, Quantum's hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum's hover. |
| `--bs-secondary-border` | `global.border.subtle.neutral.default` | `#DFDBDC` / `#36363680` |  |
| `--bs-secondary-focus-ring` | `color.focus.ring` | `#175DD6` / `#9EE7FA` | Quantum has one focus ring color for every intent (Focus foundation). |
| `--bs-secondary-contrast` | `global.text.on-base.neutral.primary` | `#0E0D0D` / `#D2CECF` |  |


#### Surfaces

Backgrounds, on root; Sass `$theme-bgs`. Bootstrap's bg-1..4 ladder steps away from the page; Quantum's neutral base ladder 1..5 is the same ramp (level.1 equals base.neutral.2).

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-bg-body` | `global.bg.level.0.default` | `#FDFDFD` / `#191919` |  |
| `--bs-bg-1` | `global.bg.level.1.default` | `#F7F6F6` / `#212121` |  |
| `--bs-bg-2` | `global.bg.base.neutral.3` | `#ECE8E9` / `#282828` |  |
| `--bs-bg-3` | `global.bg.base.neutral.4` | `#DFDBDC` / `#303030` |  |
| `--bs-bg-4` | `global.bg.base.neutral.5` | `#D7D3D4` / `#363636` |  |


#### Text

Foregrounds, on root; Sass `$theme-fgs`. Quantum has three text steps and a disabled color; Bootstrap reads fg-1 for hover text, so it stays at the primary step.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-fg-body` | `global.text.on-base.neutral.primary` | `#0E0D0D` / `#D2CECF` |  |
| `--bs-fg-1` | `global.text.on-base.neutral.primary` | `#0E0D0D` / `#D2CECF` |  |
| `--bs-fg-2` | `global.text.on-base.neutral.secondary` | `#323031` / `#B9B7B7` |  |
| `--bs-fg-3` | `global.text.on-base.neutral.tertiary` | `#616161` / `#9D9B9C` |  |
| `--bs-fg-4` | `global.text.state.disabled.default` | `#8C8C8C` / `#9D9B9Cb2` |  |


#### Borders

Border colors, on root; Sass `$theme-borders`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-border-body` | `global.border.base.neutral.3` | `#D7D3D4` / `#303030` |  |
| `--bs-border-muted` | `global.border.base.neutral.2` | `#DFDBDC` / `#282828` |  |
| `--bs-border-subtle` | `global.border.base.neutral.1` | `#ECE8E9` / `#212121` |  |
| `--bs-border-emphasized` | `global.border.base.neutral.4` | `#B6B4B4` / `#363636` |  |

Border width and default color, on root; Sass `$root-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-border-width` | `stroke-width.sm` | `0.6px` | The hairline every Quantum container and control border uses. |
| `--bs-border-color` | `global.border.base.neutral.3` | `#D7D3D4` / `#303030` | Bootstrap's default edge (tables, list groups, inputs before the text-field override): the neutral base step that stays visible in both modes. |
| `--bs-border-color-translucent` | `global.border.level.edge.level.2` | `#DFDBDC` / `#303030` | Bootstrap draws the edge of raised surfaces (menu, dialog, popover, toast) with it: Quantum's edge of a level-2 surface, the dropdown menu border. |


#### Typography

Body, monospace and links, on root; Sass `$root-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-body-font-family` | `{body.family}, …` | `Inter, -apple-system, BlinkMacSystemF…` | Inter first, Bootstrap's system stack as the fallback. |
| `--bs-body-font-size` | `body.size.md` | `1rem` |  |
| `--bs-body-font-weight` | `body.weight.regular` | `400` |  |
| `--bs-body-line-height` | `font.line-height.normal` | `1.5` |  |
| `--bs-font-mono` | `{mono.family}, …` | `"Fragment Mono", ui-monospace, 'SF Mo…` | Fragment Mono first, Bootstrap's monospace stack as the fallback. |
| `--bs-link-color` | `global.text.on-base.brand.default` | `#175DD6` / `#9EE7FA` | Quantum has no Link component: brand text on the page. |
| `--bs-link-hover-color` | `global.text.on-subtle.brand.default` | `#1148A9` / `#9EE7FA` | The darker brand text step (the ghost button hover label). |

Headings, on root; Sass `$type-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-heading-font-family` | `{heading.family}, …` | `Inter, -apple-system, BlinkMacSystemF…` |  |
| `--bs-heading-font-weight` | `heading.weight.semi-bold` | `600` | Read by Bootstrap's headings with a medium fallback; Quantum headings are semi-bold. |
| `--bs-heading-line-height` | `font.line-height.tight` | `1.2` |  |

Font sizes and line heights, on root; Sass `$font-sizes`. xs to lg are body sizes; xl and up are heading sizes (h3 = xl, h2 = 2xl, h1 = 3xl). Quantum sizes are fixed: Bootstrap's fluid clamp() steps become fixed rem values.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-font-size-xs` | `body.size.xs` | `0.75rem` |  |
| `--bs-line-height-xs` | `font.line-height.normal` | `1.5` |  |
| `--bs-font-size-sm` | `body.size.sm` | `0.875rem` |  |
| `--bs-line-height-sm` | `font.line-height.normal` | `1.5` |  |
| `--bs-font-size-md` | `body.size.md` | `1rem` |  |
| `--bs-line-height-md` | `font.line-height.normal` | `1.5` |  |
| `--bs-font-size-lg` | `body.size.lg` | `1.25rem` |  |
| `--bs-line-height-lg` | `font.line-height.normal` | `1.5` |  |
| `--bs-font-size-xl` | `heading.size.sm` | `1.5rem` |  |
| `--bs-line-height-xl` | `font.line-height.tight` | `1.2` |  |
| `--bs-font-size-2xl` | `heading.size.md` | `2rem` |  |
| `--bs-line-height-2xl` | `font.line-height.tight` | `1.2` |  |
| `--bs-font-size-3xl` | `heading.size.lg` | `2.625rem` |  |
| `--bs-line-height-3xl` | `font.line-height.tight` | `1.2` |  |
| `--bs-font-size-4xl` | `heading.size.xl` | `3rem` |  |
| `--bs-line-height-4xl` | `font.line-height.tight` | `1.2` |  |
| `--bs-font-size-5xl` | `heading.size.2xl` | `4rem` |  |
| `--bs-line-height-5xl` | `font.line-height.tight` | `1.2` |  |
| `--bs-font-size-6xl` | `heading.size.3xl` | `4rem` |  |
| `--bs-line-height-6xl` | `font.line-height.tight` | `1.2` |  |

Font weights, on root; Sass `$font-weights`. Quantum has regular, medium and semi-bold; Bootstrap's light, bold, lighter and bolder stay Bootstrap's.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-font-weight-normal` | `body.weight.regular` | `400` |  |
| `--bs-font-weight-medium` | `body.weight.medium` | `500` |  |
| `--bs-font-weight-semibold` | `heading.weight.semi-bold` | `600` |  |


#### Shape

Radii, on root; Sass `$radii`. Bootstrap rounds buttons and inputs with radius-5 and cards, alerts and menus with radius-7: they take Quantum's control radius (corner-radius.xs, 4px) and container radius (corner-radius.sm, 8px); the other steps fill the scale in order.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-radius-0` | `corner-radius.none` | `0rem` |  |
| `--bs-radius-1` | `corner-radius.3xs` | `0.0625rem` |  |
| `--bs-radius-2` | `corner-radius.2xs` | `0.125rem` |  |
| `--bs-radius-3` | `corner-radius.2xs` | `0.125rem` | Bootstrap's placeholder and kbd radius: the Skeleton text radius. |
| `--bs-radius-4` | `corner-radius.xs` | `0.25rem` |  |
| `--bs-radius-5` | `corner-radius.xs` | `0.25rem` | button.container.border-radius.medium and text-field.control.border-radius. |
| `--bs-radius-6` | `corner-radius.sm` | `0.5rem` |  |
| `--bs-radius-7` | `corner-radius.sm` | `0.5rem` | card.container.border-radius, alert.container.border-radius, dropdown.menu.border-radius. |
| `--bs-radius-8` | `corner-radius.md` | `0.75rem` |  |
| `--bs-radius-9` | `corner-radius.lg` | `1rem` |  |
| `--bs-radius-pill` | `corner-radius.full` | `9999px` | Bootstrap sets it after the $radii loop: not configurable in Sass, written after the @use. |


#### Spacing

Spacers, on root; Sass `$spacers`. Bootstrap's 0..12 steps (0, 4, 6, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48 px) all exist in Quantum's space scale: same values, now traced to it.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-spacer-0` | `space.none` | `0rem` |  |
| `--bs-spacer-1` | `space.4` | `0.25rem` |  |
| `--bs-spacer-2` | `space.6` | `0.375rem` |  |
| `--bs-spacer-3` | `space.8` | `0.5rem` |  |
| `--bs-spacer-4` | `space.12` | `0.75rem` |  |
| `--bs-spacer-5` | `space.16` | `1rem` |  |
| `--bs-spacer-6` | `space.20` | `1.25rem` |  |
| `--bs-spacer-7` | `space.24` | `1.5rem` |  |
| `--bs-spacer-8` | `space.28` | `1.75rem` |  |
| `--bs-spacer-9` | `space.32` | `2rem` |  |
| `--bs-spacer-10` | `space.36` | `2.25rem` |  |
| `--bs-spacer-11` | `space.40` | `2.5rem` |  |
| `--bs-spacer-12` | `space.48` | `3rem` |  |

Base spacer, on root; Sass `$root-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-spacer` | `space.16` | `1rem` |  |


#### Focus

Focus ring, on root; Sass `$root-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-focus-ring-width` | `focus.ring.width` | `2.4px` |  |
| `--bs-focus-ring-offset` | `focus.ring.offset` | `4px` |  |
| `--bs-focus-ring-color` | `color.focus.ring` | `#175DD6` / `#9EE7FA` |  |


#### Elevation

Shadow color, on root; Sass `$root-tokens`. Quantum has shadow colors but no shadow geometry (Effects foundation): Bootstrap's geometry stays, tinted with Quantum's shadow color. Bootstrap replaces its alpha with its own (oklch(from …)), times --bs-shadow-strength.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-shadow-color` | `effect.shadow.5` | `#201E1F0d` / `#141414cc` |  |


#### Motion

Overlay easing, on root; Sass `$root-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-transition-timing-overlay` | `easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Bootstrap's shared curve for menus, dialogs and drawers. |


#### Divider

<hr> and .vr, on root; Sass `$root-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-hr-border-color` | `divider.container.color` | `#B6B4B4` / `#363636` |  |
| `--bs-hr-margin-y` | `divider.container.margin-block.horizontal` | `1rem` |  |
| `--bs-vr-border-width` | `divider.container.border-width` | `0.6px` |  |


#### Button

Button and input sizes (root), on root; Sass `$root-tokens`. Bootstrap sizes buttons, inputs and pagination from one set of --btn-input-* tokens. They take the Button sizes (xsmall, small, medium, large = xs, sm, default, lg); the form controls, whose Quantum heights differ (32, 40, 48), get their own values on .form-control below.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-btn-input-fg` | `text-field.control.color.default` | `#0E0D0D` / `#D2CECF` | Bootstrap's shared control foreground (inputs, OTP, chip input): the Text field value color. |
| `--bs-btn-input-bg` | `text-field.control.background.default` | `#FDFDFD` / `#191919` | Bootstrap's shared control background (inputs, OTP, chip input, floating labels): the Text field background. |
| `--bs-btn-input-gap` | `button.container.gap.medium` | `0.25rem` |  |
| `--bs-btn-input-min-height` | `button.container.min-height.medium` | `2.25rem` |  |
| `--bs-btn-input-padding-y` | `button.container.padding-block.medium` | `0.3125rem` |  |
| `--bs-btn-input-padding-x` | `button.container.padding-inline.medium` | `0.75rem` |  |
| `--bs-btn-input-font-size` | `button.label.typography.medium` (fontSize) | `1rem` |  |
| `--bs-btn-input-font-weight` | `button.label.typography.medium` (fontWeight) | `500` |  |
| `--bs-btn-input-line-height` | `button.label.typography.medium` (lineHeight) | `1` |  |
| `--bs-btn-input-border-radius` | `button.container.border-radius.medium` | `0.25rem` |  |
| `--bs-btn-input-xs-gap` | `button.container.gap.xsmall` | `0.125rem` |  |
| `--bs-btn-input-xs-min-height` | `button.container.min-height.xsmall` | `1.5rem` |  |
| `--bs-btn-input-xs-padding-y` | `button.container.padding-block.xsmall` | `0.125rem` |  |
| `--bs-btn-input-xs-padding-x` | `button.container.padding-inline.xsmall` | `0.375rem` |  |
| `--bs-btn-input-xs-font-size` | `button.label.typography.xsmall` (fontSize) | `0.75rem` |  |
| `--bs-btn-input-xs-line-height` | `button.label.typography.xsmall` (lineHeight) | `1` |  |
| `--bs-btn-input-xs-border-radius` | `button.container.border-radius.xsmall` | `0.125rem` |  |
| `--bs-btn-input-sm-gap` | `button.container.gap.small` | `0.125rem` |  |
| `--bs-btn-input-sm-min-height` | `button.container.min-height.small` | `1.75rem` |  |
| `--bs-btn-input-sm-padding-y` | `button.container.padding-block.small` | `0.1875rem` |  |
| `--bs-btn-input-sm-padding-x` | `button.container.padding-inline.small` | `0.5rem` |  |
| `--bs-btn-input-sm-font-size` | `button.label.typography.small` (fontSize) | `0.875rem` |  |
| `--bs-btn-input-sm-line-height` | `button.label.typography.small` (lineHeight) | `1` |  |
| `--bs-btn-input-sm-border-radius` | `button.container.border-radius.small` | `0.125rem` |  |
| `--bs-btn-input-lg-gap` | `button.container.gap.large` | `0.25rem` |  |
| `--bs-btn-input-lg-min-height` | `button.container.min-height.large` | `2.75rem` |  |
| `--bs-btn-input-lg-padding-y` | `button.container.padding-block.large` | `0.5rem` |  |
| `--bs-btn-input-lg-padding-x` | `button.container.padding-inline.large` | `1rem` |  |
| `--bs-btn-input-lg-font-size` | `button.label.typography.large` (fontSize) | `1rem` |  |
| `--bs-btn-input-lg-line-height` | `button.label.typography.large` (lineHeight) | `1` |  |
| `--bs-btn-input-lg-border-radius` | `button.container.border-radius.large` | `0.25rem` |  |

Every button, on `.btn, .btn-link, .btn-icon, .btn-solid, .btn-outline, .btn-subtle, .btn-text`; Sass `$button-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-btn-border-width` | `button.container.border-width` | `0.6px` |  |
| `--bs-btn-transition-duration` | `button.container.transition.duration` | `150ms` |  |
| `--bs-btn-transition-timing` | `button.container.transition.easing` | `cubic-bezier(0.2, 0, 0, 1)` |  |
| `--bs-btn-disabled-opacity` | `1` (rule `effects.no-faded-text`) | `1` | Quantum shows disabled with its disabled colors (set per variant below), never by fading. |

Focus ring offset, on `.btn:focus-visible, .btn-link:focus-visible, .btn-icon:focus-visible, .btn-solid:focus-visible, .btn-outline:focus-visible, .btn-subtle:focus-visible, .btn-text:focus-visible`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-focus-ring-offset` | `button.container.outline-offset.focus-visible` | `4px` |  |

Solid disabled (accent), on `.btn-solid:disabled, .btn-solid.disabled, .btn-solid.btn-check:has(input:disabled)`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-btn-disabled-bg` | `button.container.background.accent.disabled` | `#B6B4B41a` / `#7676764d` |  |
| `--bs-btn-disabled-color` | `button.label.color.accent.disabled` | `#8C8C8C` / `#9D9B9Cb2` |  |
| `--bs-btn-disabled-border-color` | `button.container.border-color.accent.disabled` | `#B6B4B466` / `#363636b2` |  |

Outline disabled (subtle), on `.btn-outline:disabled, .btn-outline.disabled, .btn-outline.btn-check:has(input:disabled)`; Sass: written after the @use. Quantum has no outline emphasis: the bordered subtle emphasis is the nearest.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-btn-disabled-bg` | `button.container.background.subtle.disabled` | `#B6B4B41a` / `#7676764d` |  |
| `--bs-btn-disabled-color` | `button.label.color.subtle.disabled` | `#8C8C8C` / `#9D9B9Cb2` |  |
| `--bs-btn-disabled-border-color` | `button.container.border-color.subtle.disabled` | `#B6B4B466` / `#363636b2` |  |

Subtle disabled, on `.btn-subtle:disabled, .btn-subtle.disabled, .btn-subtle.btn-check:has(input:disabled)`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-btn-disabled-bg` | `button.container.background.subtle.disabled` | `#B6B4B41a` / `#7676764d` |  |
| `--bs-btn-disabled-color` | `button.label.color.subtle.disabled` | `#8C8C8C` / `#9D9B9Cb2` |  |
| `--bs-btn-disabled-border-color` | `button.container.border-color.subtle.disabled` | `#B6B4B466` / `#363636b2` |  |

Text disabled (ghost), on `.btn-text:disabled, .btn-text.disabled, .btn-text.btn-check:has(input:disabled)`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-btn-disabled-bg` | `button.container.background.ghost.disabled` | `#B6B4B41a` / `#7676764d` |  |
| `--bs-btn-disabled-color` | `button.label.color.ghost.disabled` | `#8C8C8C` / `#9D9B9Cb2` |  |
| `--bs-btn-disabled-border-color` | `button.container.border-color.ghost.disabled` | `#B6B4B466` / `#363636b2` |  |


#### Text field

.form-control (input, select, textarea), on `.form-control` (and `.form-control-plaintext`); Sass `$form-control-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-control-min-height` | `text-field.control.min-height.medium` | `2.5rem` |  |
| `--bs-control-padding-x` | `text-field.control.padding-inline.medium` | `0.75rem` |  |
| `--bs-control-padding-y` | `space.7` | `0.4375rem` | Bootstrap pads inputs and textareas alike; Quantum centers a field's line in its min-height (no block padding) and pads only the textarea. The largest space step that keeps a medium input at its 40px min-height (line 24px + 2 x 7px + borders). |
| `--bs-control-font-size` | `text-field.control.typography.medium` (fontSize) | `1rem` |  |
| `--bs-control-line-height` | `text-field.control.typography.medium` (lineHeight) | `1.5` |  |
| `--bs-control-fg` | `text-field.control.color.default` | `#0E0D0D` / `#D2CECF` |  |
| `--bs-control-bg` | `text-field.control.background.default` | `#FDFDFD` / `#191919` |  |
| `--bs-control-border-width` | `text-field.control.border-width` | `0.6px` |  |
| `--bs-control-border-color` | `text-field.control.border-color.default` | `#323031` / `#B9B7B7` |  |
| `--bs-control-border-radius` | `text-field.control.border-radius` | `0.25rem` |  |
| `--bs-control-box-shadow` | `none` (rule `effects.shadow`) | `none` | No shadow is drawn in Quantum: no inset shadow on fields. |
| `--bs-control-transition-duration` | `text-field.control.transition.duration` | `150ms` |  |
| `--bs-control-transition-timing` | `text-field.control.transition.easing` | `cubic-bezier(0.2, 0, 0, 1)` |  |
| `--bs-control-placeholder-color` | `text-field.control.placeholder-color.default` | `#616161` / `#9D9B9C` |  |
| `--bs-control-disabled-color` | `text-field.control.color.disabled` | `#8C8C8C` / `#9D9B9Cb2` |  |
| `--bs-control-disabled-bg` | `text-field.control.background.disabled` | `#B6B4B41a` / `#7676764d` |  |
| `--bs-control-disabled-border-color` | `text-field.control.border-color.disabled` | `#B6B4B466` / `#363636b2` |  |

.form-control-sm (small), on `.form-control-sm`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-control-min-height` | `text-field.control.min-height.small` | `2rem` |  |
| `--bs-control-padding-x` | `text-field.control.padding-inline.small` | `0.5rem` |  |
| `--bs-control-padding-y` | `space.4` | `0.25rem` | Keeps a small input at its 32px min-height (line 21px). |
| `--bs-control-font-size` | `text-field.control.typography.small` (fontSize) | `0.875rem` |  |
| `--bs-control-line-height` | `text-field.control.typography.small` (lineHeight) | `1.5` |  |
| `--bs-control-border-radius` | `text-field.control.border-radius` | `0.25rem` | Bootstrap gives small controls the small button radius; a Quantum field keeps one radius at every size. |

.form-control-lg (large), on `.form-control-lg`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-control-min-height` | `text-field.control.min-height.large` | `3rem` |  |
| `--bs-control-padding-x` | `text-field.control.padding-inline.large` | `1rem` |  |
| `--bs-control-padding-y` | `space.8` | `0.5rem` | Keeps a large input at its 48px min-height (line 30px). |
| `--bs-control-font-size` | `text-field.control.typography.large` (fontSize) | `1.25rem` |  |
| `--bs-control-line-height` | `text-field.control.typography.large` (lineHeight) | `1.5` |  |
| `--bs-control-border-radius` | `text-field.control.border-radius` | `0.25rem` |  |

Focus ring offset, on `.form-control:focus-visible, .form-control:focus-within`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-focus-ring-offset` | `text-field.control.outline-offset.focus-visible` | `4px` |  |

Invalid (.is-invalid), on `.form-control.is-invalid`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-control-border-color` | `text-field.control.border-color.invalid` | `#C01619` / `#E12A23` |  |

Invalid (:user-invalid), on `[data-bs-validate] .form-control:user-invalid`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-control-border-color` | `text-field.control.border-color.invalid` | `#C01619` / `#E12A23` |  |

.chip-input, on `.chip-input`; Sass `$chip-input-tokens`. Bootstrap's chip input is a field holding chips: it takes the Text field control.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-control-fg` | `text-field.control.color.default` | `#0E0D0D` / `#D2CECF` |  |
| `--bs-control-bg` | `text-field.control.background.default` | `#FDFDFD` / `#191919` |  |
| `--bs-control-border-width` | `text-field.control.border-width` | `0.6px` |  |
| `--bs-control-border-color` | `text-field.control.border-color.default` | `#323031` / `#B9B7B7` |  |
| `--bs-control-border-radius` | `text-field.control.border-radius` | `0.25rem` |  |

Labels (.form-label), on root; Sass `$root-tokens`. Bootstrap reads these with fallbacks on .form-label; declared on the root, they reach every label.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-label-color` | `text-field.label.color.default` | `#0E0D0D` / `#D2CECF` |  |
| `--bs-label-font-size` | `text-field.label.typography` (fontSize) | `0.875rem` |  |
| `--bs-label-font-weight` | `text-field.label.typography` (fontWeight) | `500` |  |

Description (.form-text), on `.form-text`; Sass `$form-text-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-form-text-margin-top` | `text-field.container.gap` | `0.25rem` |  |
| `--bs-form-text-font-size` | `text-field.description.typography` (fontSize) | `0.875rem` |  |
| `--bs-form-text-color` | `text-field.description.color.default` | `#323031` / `#B9B7B7` |  |


#### Checkbox

Selection controls (root), on root; Sass `$root-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-control-checked-bg` | `checkbox.control.background.checked` | `#175DD6` / `#9EE7FA` |  |
| `--bs-control-checked-border-color` | `checkbox.control.border-color.checked` | `#1148A9` / `#53D6F2` |  |
| `--bs-control-disabled-bg` | `checkbox.control.background.disabled` | `#B6B4B41a` / `#7676764d` |  |
| `--bs-control-transition-duration` | `checkbox.control.transition.duration` | `150ms` |  |
| `--bs-control-transition-timing` | `checkbox.control.transition.easing` | `cubic-bezier(0.2, 0, 0, 1)` |  |

.check, on `.check`; Sass `$check-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-check-size` | `checkbox.control.size.medium` | `1.25rem` |  |
| `--bs-check-bg` | `checkbox.control.background.default` | `#FDFDFD` / `#191919` |  |
| `--bs-check-border-color` | `checkbox.control.border-color.default` | `#323031` / `#B9B7B7` |  |
| `--bs-check-checked-bg` | `checkbox.control.background.checked` | `#175DD6` / `#9EE7FA` |  |
| `--bs-check-checked-border-color` | `checkbox.control.border-color.checked` | `#1148A9` / `#53D6F2` |  |
| `--bs-check-indeterminate-bg` | `checkbox.control.background.indeterminate` | `#175DD6` / `#9EE7FA` |  |
| `--bs-check-indeterminate-border-color` | `checkbox.control.border-color.indeterminate` | `#1148A9` / `#53D6F2` |  |
| `--bs-check-disabled-bg` | `checkbox.control.background.disabled` | `#B6B4B41a` / `#7676764d` |  |

.check-sm (small), on `.check-sm`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-check-size` | `checkbox.control.size.small` | `1rem` |  |

Invalid (.is-invalid), on `.check.is-invalid`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-check-border-color` | `checkbox.control.border-color.invalid` | `#C01619` / `#E12A23` |  |

Invalid (:user-invalid), on `[data-bs-validate] .check:user-invalid`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-check-border-color` | `checkbox.control.border-color.invalid` | `#C01619` / `#E12A23` |  |


#### Radio group

.radio, on `.radio`; Sass `$radio-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-radio-size` | `radio-group.control.size.medium` | `1.25rem` |  |
| `--bs-radio-bg` | `radio-group.control.background.default` | `#FDFDFD` / `#191919` |  |
| `--bs-radio-border-color` | `radio-group.control.border-color.default` | `#323031` / `#B9B7B7` |  |
| `--bs-radio-checked-bg` | `radio-group.control.background.checked` | `#175DD6` / `#9EE7FA` |  |
| `--bs-radio-checked-border-color` | `radio-group.control.border-color.checked` | `#1148A9` / `#53D6F2` |  |
| `--bs-radio-disabled-bg` | `radio-group.control.background.disabled` | `#B6B4B41a` / `#7676764d` |  |

.radio-sm (small), on `.radio-sm`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-radio-size` | `radio-group.control.size.small` | `1rem` |  |

Invalid (.is-invalid), on `.radio.is-invalid`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-radio-border-color` | `radio-group.control.border-color.invalid` | `#C01619` / `#E12A23` |  |

Invalid (:user-invalid), on `[data-bs-validate] .radio:user-invalid`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-radio-border-color` | `radio-group.control.border-color.invalid` | `#C01619` / `#E12A23` |  |


#### Switch

.switch, on `.switch`; Sass `$switch-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-switch-height` | `switch.control.height.medium` | `1.5rem` |  |
| `--bs-switch-width` | `switch.control.width.medium` | `2.5rem` |  |
| `--bs-switch-padding` | `switch.thumb.margin` | `0.125rem` |  |
| `--bs-switch-bg` | `switch.control.background.default` | `#FDFDFD` / `#191919` |  |
| `--bs-switch-border-width` | `switch.control.border-width` | `1.2px` |  |
| `--bs-switch-border-color` | `switch.control.border-color.default` | `#323031` / `#B9B7B7` |  |
| `--bs-switch-indicator-bg` | `switch.thumb.background.default` | `#201E1F` / `#E8E3E4` |  |
| `--bs-switch-indicator-width` | `switch.thumb.size.medium` | `1rem` |  |
| `--bs-switch-indicator-height` | `switch.thumb.size.medium` | `1rem` |  |
| `--bs-switch-checked-bg` | `switch.control.background.checked` | `#175DD6` / `#9EE7FA` |  |
| `--bs-switch-checked-border-color` | `switch.control.border-color.checked` | `#1148A9` / `#53D6F2` |  |
| `--bs-switch-checked-indicator-bg` | `switch.thumb.background.checked` | `#FBFCFD` / `#09191D` |  |
| `--bs-switch-disabled-bg` | `switch.control.background.disabled` | `#B6B4B41a` / `#7676764d` |  |
| `--bs-switch-disabled-indicator-bg` | `switch.thumb.background.disabled` | `#8C8C8C` / `#9D9B9Cb2` |  |

.switch-sm (small), on `.switch-sm`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-switch-height` | `switch.control.height.small` | `1.25rem` |  |
| `--bs-switch-width` | `switch.control.width.small` | `2rem` |  |
| `--bs-switch-indicator-width` | `switch.thumb.size.small` | `0.75rem` |  |
| `--bs-switch-indicator-height` | `switch.thumb.size.small` | `0.75rem` |  |


#### Slider

.form-range, on `.form-range`; Sass `$range-tokens`. The thumb color and the filled track keep Bootstrap's --theme-bg / --primary-base, so .theme-* still colors a slider; brand is Quantum's slider.thumb.background.default.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-range-track-height` | `slider.control.height.medium` | `0.5rem` |  |
| `--bs-range-track-bg` | `slider.control.background.default` | `#ECE8E9` / `#282828` |  |
| `--bs-range-track-border-radius` | `slider.control.border-radius` | `9999px` |  |
| `--bs-range-track-disabled-bg` | `slider.control.background.disabled` | `#B6B4B41a` / `#7676764d` |  |
| `--bs-range-thumb-width` | `slider.thumb.size.medium` | `1.25rem` |  |
| `--bs-range-thumb-border` | `{slider.thumb.border-width} solid {slider.thumb.border-color.default}` | `1.2px solid #FDFDFD` / `1.2px solid #191919` |  |
| `--bs-range-thumb-border-radius` | `slider.thumb.border-radius` | `9999px` |  |
| `--bs-range-thumb-disabled-bg` | `slider.thumb.background.disabled` | `#8C8C8C` / `#9D9B9Cb2` |  |
| `--bs-range-thumb-box-shadow` | `none` (rule `effects.shadow`) | `none` | No shadow is drawn in Quantum. |
| `--bs-range-thumb-transition-duration` | `slider.control.transition.duration` | `150ms` |  |
| `--bs-range-thumb-transition-timing` | `slider.control.transition.easing` | `cubic-bezier(0.2, 0, 0, 1)` |  |


#### Card

.card, on `.card`; Sass `$card-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-card-bg` | `card.container.background.level-1` | `#F7F6F6` / `#212121` |  |
| `--bs-card-border-color` | `card.container.border-color.level-1` | `#D7D3D4` / `#282828` |  |
| `--bs-card-border-width` | `card.container.border-width` | `0.6px` |  |
| `--bs-card-border-radius` | `card.container.border-radius` | `0.5rem` |  |
| `--bs-card-spacer-x` | `card.container.padding` | `1rem` |  |
| `--bs-card-spacer-y` | `card.container.padding` | `1rem` |  |
| `--bs-card-body-gap` | `card.container.gap` | `0.5rem` |  |
| `--bs-card-color` | `card.title.color` | `#0E0D0D` / `#D2CECF` | Bootstrap colors the whole card body (title included) with one color: the title color; the subtitle takes the description color. |
| `--bs-card-subtitle-color` | `card.description.color` | `#323031` / `#B9B7B7` |  |


#### Badge

.badge, on `.badge`; Sass `$badge-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-badge-padding-x` | `badge.container.padding-inline.medium` | `0.5rem` |  |
| `--bs-badge-font-size` | `badge.label.typography.medium` (fontSize) | `0.875rem` |  |
| `--bs-badge-font-weight` | `badge.label.typography.medium` (fontWeight) | `500` |  |
| `--bs-badge-border-width` | `badge.container.border-width` | `0.6px` |  |
| `--bs-badge-border-radius` | `badge.container.border-radius` | `9999px` |  |


#### Alert

.alert, on `.alert`; Sass `$alert-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-alert-gap` | `alert.container.gap` | `0.75rem` |  |
| `--bs-alert-padding-x` | `alert.container.padding` | `1rem` |  |
| `--bs-alert-padding-y` | `alert.container.padding` | `1rem` |  |
| `--bs-alert-border-radius` | `alert.container.border-radius` | `0.5rem` |  |
| `--bs-alert-color` | `alert.message.color` | `#0E0D0D` / `#D2CECF` | The color of an alert without a theme class; a themed alert takes the theme fg (Quantum's alert title color). |


#### Accordion

.accordion, on `.accordion`; Sass `$accordion-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-accordion-btn-padding-x` | `accordion.trigger.padding-inline` | `0.5rem` |  |
| `--bs-accordion-btn-padding-y` | `accordion.trigger.padding-block` | `0.5rem` |  |
| `--bs-accordion-body-padding-x` | `accordion.panel.padding-inline` | `0.5rem` |  |
| `--bs-accordion-body-padding-y` | `accordion.panel.padding-block` | `0.75rem` |  |
| `--bs-accordion-font-size` | `accordion.title.typography.medium` (fontSize) | `1rem` |  |
| `--bs-accordion-color` | `accordion.panel.color` | `#323031` / `#B9B7B7` |  |
| `--bs-accordion-bg` | `accordion.trigger.background.default` | `color(srgb 0 0 0 / 0)` | Quantum's accordion has no surface of its own. |
| `--bs-accordion-border-color` | `accordion.item.border-color` | `#ECE8E9` / `#303030` |  |
| `--bs-accordion-border-width` | `accordion.item.border-width` | `0.6px` |  |
| `--bs-accordion-border-radius` | `accordion.trigger.border-radius` | `0.25rem` | Quantum rounds the trigger; Bootstrap rounds the group box, the only radius it exposes. |
| `--bs-accordion-btn-color` | `accordion.title.color` | `#0E0D0D` / `#D2CECF` |  |
| `--bs-accordion-btn-bg` | `accordion.trigger.background.default` | `color(srgb 0 0 0 / 0)` |  |
| `--bs-accordion-active-color` | `accordion.title.color` | `#0E0D0D` / `#D2CECF` |  |
| `--bs-accordion-active-bg` | `accordion.trigger.background.default` | `color(srgb 0 0 0 / 0)` | An expanded trigger keeps its background in Quantum. |
| `--bs-accordion-btn-icon-width` | `accordion.indicator.size.medium` | `1.5rem` |  |
| `--bs-accordion-transition-duration` | `accordion.trigger.transition.duration` | `150ms` |  |
| `--bs-accordion-transition-timing` | `accordion.trigger.transition.easing` | `cubic-bezier(0.2, 0, 0, 1)` |  |
| `--bs-accordion-btn-icon-transition` | `transform {accordion.indicator.transition.duration} {accordion.indicator.transition.easing}` | `transform 150ms cubic-bezier(0.2, 0, …` |  |

.accordion-sm (small), on `.accordion-sm`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-accordion-font-size` | `accordion.title.typography.small` (fontSize) | `0.875rem` |  |
| `--bs-accordion-border-radius` | `accordion.trigger.border-radius` | `0.25rem` |  |
| `--bs-accordion-btn-icon-width` | `accordion.indicator.size.small` | `1.25rem` |  |


#### Progress bar

.progress, on `.progress, .progress-stacked`; Sass `$progress-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-progress-height` | `progress-bar.track.height.medium` | `0.5rem` |  |
| `--bs-progress-font-size` | `progress-bar.value.typography` (fontSize) | `0.875rem` |  |
| `--bs-progress-bg` | `progress-bar.track.background` | `#ECE8E9` / `#282828` |  |
| `--bs-progress-border-radius` | `progress-bar.track.border-radius` | `9999px` |  |
| `--bs-progress-box-shadow` | `none` (rule `effects.shadow`) | `none` | No shadow is drawn in Quantum. |
| `--bs-progress-bar-bg` | `progress-bar.indicator.background` | `#175DD6` / `#9EE7FA` |  |


#### Spinner

.spinner-border, on `.spinner-border`; Sass `$spinner-border-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-spinner-width` | `spinner.ring.size.medium` | `1.5rem` |  |
| `--bs-spinner-height` | `spinner.ring.size.medium` | `1.5rem` |  |
| `--bs-spinner-border-width` | `spinner.ring.border-width.medium` | `2.4px` |  |

.spinner-sm (small), on `.spinner-sm`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-spinner-width` | `spinner.ring.size.small` | `1rem` |  |
| `--bs-spinner-height` | `spinner.ring.size.small` | `1rem` |  |
| `--bs-spinner-border-width` | `spinner.ring.border-width.small` | `1.2px` |  |


#### Pagination

.pagination, on `.pagination`; Sass `$pagination-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-pagination-min-height` | `pagination.link.size.medium` | `2.5rem` |  |
| `--bs-pagination-padding-x` | `pagination.link.padding-inline.medium` | `0.5rem` |  |
| `--bs-pagination-font-size` | `pagination.link.typography.medium` (fontSize) | `1rem` |  |
| `--bs-pagination-color` | `pagination.link.color.default` | `#0E0D0D` / `#D2CECF` |  |
| `--bs-pagination-bg` | `pagination.link.background.default` | `color(srgb 0 0 0 / 0)` |  |
| `--bs-pagination-border-width` | `stroke-width.none` | `0px` | Quantum pagination links have no border. |
| `--bs-pagination-border-radius` | `pagination.link.border-radius` | `0.25rem` |  |
| `--bs-pagination-hover-color` | `pagination.link.color.default` | `#0E0D0D` / `#D2CECF` |  |
| `--bs-pagination-hover-bg` | `pagination.link.background.hover` | `#B6B4B41a` / `#7676761a` |  |
| `--bs-pagination-active-color` | `pagination.link.color.current` | `#FDFDFD` / `#191919` |  |
| `--bs-pagination-active-bg` | `pagination.link.background.current` | `#201E1F` / `#E8E3E4` |  |
| `--bs-pagination-active-border-color` | `pagination.link.background.current` | `#201E1F` / `#E8E3E4` |  |
| `--bs-pagination-disabled-color` | `pagination.link.color.disabled` | `#8C8C8C` / `#9D9B9Cb2` |  |
| `--bs-pagination-disabled-bg` | `pagination.link.background.disabled` | `color(srgb 0 0 0 / 0)` |  |

.pagination-sm (small), on `.pagination-sm`; Sass: written after the @use.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-pagination-min-height` | `pagination.link.size.small` | `2rem` |  |
| `--bs-pagination-padding-x` | `pagination.link.padding-inline.small` | `0.375rem` |  |
| `--bs-pagination-font-size` | `pagination.link.typography.small` (fontSize) | `0.875rem` |  |
| `--bs-pagination-border-radius` | `pagination.link.border-radius` | `0.25rem` |  |


#### Breadcrumb

.breadcrumb, on `.breadcrumb`; Sass `$breadcrumb-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-breadcrumb-font-size` | `breadcrumb.link.typography.medium` (fontSize) | `0.875rem` |  |
| `--bs-breadcrumb-divider-color` | `breadcrumb.separator.color` | `#616161` / `#9D9B9C` |  |
| `--bs-breadcrumb-link-padding-x` | `breadcrumb.container.gap` | `0.25rem` | Bootstrap spaces the items with the links' inline padding (and a divider margin derived from it): Quantum's gap between items goes there. |
| `--bs-breadcrumb-link-color` | `breadcrumb.link.color.default` | `#323031` / `#B9B7B7` |  |
| `--bs-breadcrumb-link-hover-color` | `breadcrumb.link.color.hover` | `#0E0D0D` / `#D2CECF` |  |
| `--bs-breadcrumb-link-hover-bg` | `color.transparent` | `color(srgb 0 0 0 / 0)` | A Quantum breadcrumb link has no hover fill. |
| `--bs-breadcrumb-link-active-color` | `breadcrumb.link.color.current` | `#0E0D0D` / `#D2CECF` |  |
| `--bs-breadcrumb-link-border-radius` | `breadcrumb.link.border-radius` | `0.125rem` |  |


#### Avatar

.avatar, on `.avatar`; Sass `$avatar-tokens`. Bootstrap's avatar sizes xs, sm and default (24, 32, 40px) already equal Quantum's small, medium and large: they are left as they are.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-avatar-border-radius` | `avatar.container.border-radius.circle` | `9999px` |  |
| `--bs-avatar-bg` | `avatar.container.background` | `#EEF1F7` / `#09191D` |  |
| `--bs-avatar-color` | `avatar.initials.color` | `#1148A9` / `#9EE7FA` |  |


#### Dropdown

.menu, on `.menu`; Sass `$menu-tokens`.

| Bootstrap | ← Quantum | Light / dark | Why |
| --- | --- | --- | --- |
| `--bs-menu-gap` | `dropdown.menu.offset` | `0.25rem` | The distance between the toggle and the menu. |
| `--bs-menu-padding-x` | `dropdown.menu.padding` | `0.5rem` |  |
| `--bs-menu-padding-y` | `dropdown.menu.padding` | `0.5rem` |  |
| `--bs-menu-font-size` | `dropdown.item-label.typography` (fontSize) | `0.875rem` |  |
| `--bs-menu-bg` | `dropdown.menu.background` | `#FDFDFD` / `#282828` |  |
| `--bs-menu-border-color` | `dropdown.menu.border-color` | `#DFDBDC` / `#303030` |  |
| `--bs-menu-border-width` | `dropdown.menu.border-width` | `0.6px` |  |
| `--bs-menu-border-radius` | `dropdown.menu.border-radius` | `0.5rem` |  |
| `--bs-menu-box-shadow` | `none` (rule `effects.elevation`) | `none` | A Quantum menu stands apart by its surface level and border, not by a shadow. |
| `--bs-menu-divider-bg` | `dropdown.separator.color` | `#ECE8E9` / `#767676` |  |
| `--bs-menu-divider-margin-y` | `dropdown.separator.margin-block` | `0.25rem` |  |
| `--bs-menu-item-color` | `dropdown.item-label.color.neutral.default` | `#323031` / `#E3DDDE` |  |
| `--bs-menu-item-font-weight` | `dropdown.item-label.typography` (fontWeight) | `500` |  |
| `--bs-menu-item-hover-color` | `dropdown.item-label.color.neutral.hover` | `#323031` / `#E3DDDE` |  |
| `--bs-menu-item-hover-bg` | `dropdown.item.background.neutral.hover` | `#B6B4B41a` / `#7676761a` |  |
| `--bs-menu-item-active-color` | `dropdown.item-label.color.neutral.active` | `#323031` / `#E3DDDE` |  |
| `--bs-menu-item-active-bg` | `dropdown.item.background.neutral.active` | `#B6B4B426` / `#7676764d` |  |
| `--bs-menu-item-disabled-color` | `dropdown.item-label.color.disabled` | `#8C8C8C` / `#9D9B9Cb2` |  |
| `--bs-menu-item-gap` | `dropdown.item.gap` | `0.5rem` |  |
| `--bs-menu-item-padding-x` | `dropdown.item.padding-inline` | `0.5rem` |  |
| `--bs-menu-item-border-radius` | `dropdown.item.border-radius` | `0.125rem` |  |
| `--bs-menu-icon-size` | `dropdown.item-icon.size` | `1rem` |  |
<!-- mapping:end -->

## Quantum components in Bootstrap

`default` is Bootstrap's base class with no modifier; `none` means Bootstrap has no class for it.

<!-- equivalences:start (generated: node build.mjs --readme) -->
| Quantum component | Bootstrap | Options, states and parts |
| --- | --- | --- |
| Button (`button`) | Buttons | emphasis: accent = `.btn-solid`, subtle = `.btn-subtle`, ghost = `.btn-text`; intent: neutral = `.theme-secondary`, brand = `.theme-primary`, error = `.theme-danger`; size: xsmall = `.btn-xs`, small = `.btn-sm`, medium = default, large = `.btn-lg`; emphasis accent + intent neutral = `.btn-solid.theme-inverse`; states: hover = `:hover`, active = `:active`, focus-visible = `:focus-visible`, disabled = `:disabled`; parts: icon = `.material-symbols-outlined (any inline icon)`; Bootstrap only: `.btn-outline`, `.btn-link`, `.btn-styled`, `.btn-group`, `.btn-check`, `.btn-close` |
| Icon button (`icon-button`) | Buttons (`.btn-icon`) | emphasis: accent = `.btn-solid`, subtle = `.btn-subtle`, ghost = `.btn-text`; intent: neutral = `.theme-secondary`, brand = `.theme-primary`, error = `.theme-danger`; size: xsmall = `.btn-xs`, small = `.btn-sm`, medium = default, large = `.btn-lg`; emphasis accent + intent neutral = `.btn-icon.btn-solid.theme-inverse`; states: disabled = `:disabled` |
| Badge (`badge`) | Badge (`.badge`) | emphasis: accent = default, subtle = `.badge-subtle`; intent: neutral = `.theme-secondary`, brand = `.theme-primary`, success = `.theme-success`, warning = `.theme-warning`, error = `.theme-danger`, info = `.theme-info`; size: small = none, medium = default; emphasis accent + intent neutral = `.badge.theme-inverse`; Bootstrap only: `.badge-outline`, `.badge-lg` |
| Alert (`alert`) | Alert (`.alert`) | intent: info = `.theme-info`, success = `.theme-success`, warning = `.theme-warning`, error = `.theme-danger`; parts: title = `.alert-heading`, message = `text after .alert-heading`; Bootstrap only: `dismissible alerts (.btn-close)`, `.alert-link` |
| Card (`card`) | Card (`.card`) | surface: level-1 = default, level-2 = none; parts: container = `.card`, title = `.card-body > h5 (a heading)`, description = `.card-subtitle or a paragraph`; Bootstrap only: `.card-header`, `.card-footer`, `.card-img-*`, `.card-group`, `.card-translucent` |
| Accordion (`accordion`) | Accordion (`.accordion`) | size: small = `.accordion-sm`, medium = default; states: expanded = `[open]`; parts: item = `.accordion-item (<details>)`, trigger = `.accordion-header (<summary>)`, indicator = `.accordion-icon`, panel = `.accordion-body` |
| Avatar (`avatar`) | Avatar (`.avatar`) | size: small = `.avatar-xs`, medium = `.avatar-sm`, large = default; shape: circle = default, square = none; parts: image = `.avatar-img`, initials = `text inside .avatar`; Bootstrap only: `.avatar-lg`, `.avatar-xl`, `.avatar-status`, `.avatar-stack` |
| Breadcrumb (`breadcrumb`) | Breadcrumb (`.breadcrumb`) | size: small = none, medium = default; parts: item = `.breadcrumb-item`, link = `.breadcrumb-link`, separator = `.breadcrumb-divider` |
| Checkbox (`checkbox`) | Checks (`input.check`) | size: small = `.check-sm`, medium = default; states: checked = `:checked`, indeterminate = `:indeterminate`, invalid = `.is-invalid`, disabled = `:disabled` |
| Checkbox group (`checkbox-group`) | Checks (`fieldset.form-group of input.check`) | orientation: vertical = default, horizontal = none; size: small = `.check-sm`, medium = default |
| Radio group (`radio-group`) | Radios (`fieldset.form-group of input.radio`) | orientation: vertical = default, horizontal = none; size: small = `.radio-sm`, medium = default; states: checked = `:checked`, invalid = `.is-invalid`, disabled = `:disabled` |
| Switch (`switch`) | Switch (`.switch`) | size: small = `.switch-sm`, medium = default; states: checked = `:has(input:checked)`, disabled = `:has(input:disabled)` |
| Slider (`slider`) | Range (`.form-range > .form-range-input`) | size: small = none, medium = default; states: disabled = `:disabled` |
| Text field (`text-field`) | Form control (`input.form-control`) | size: small = `.form-control-sm`, medium = default, large = `.form-control-lg`; states: invalid = `.is-invalid`, readonly = `[readonly]`, disabled = `:disabled`; parts: label = `.form-label`, control = `.form-control`, description = `.form-text`, error-message = `.invalid-feedback` |
| Textarea (`textarea`) | Form control (`textarea.form-control`) | size: small = `.form-control-sm`, medium = default, large = `.form-control-lg` |
| Select (`select`) | Form control (`select.form-control`) | size: small = `.form-control-sm`, medium = default, large = `.form-control-lg` |
| Number field (`number-field`) | Form control (`input[type=number].form-control`) | size: small = `.form-control-sm`, medium = default, large = `.form-control-lg` |
| Search field (`search-field`) | Form adorn (`label.form-control.form-adorn > .form-adorn-icon + input.form-ghost`) | size: small = `.form-control-sm`, medium = default, large = `.form-control-lg` |
| Progress bar (`progress-bar`) | Progress (`.progress > .progress-bar`) | size: small = none, medium = default; parts: track = `.progress`, indicator = `.progress-bar`; Bootstrap only: `.progress-stacked`, `.progress-bar-striped` |
| Spinner (`spinner`) | Spinners (`.spinner-border`) | size: small = `.spinner-sm`, medium = default, large = none; Bootstrap only: `.spinner-grow` |
| Pagination (`pagination`) | Pagination (`.pagination`) | size: small = `.pagination-sm`, medium = default; states: current = `.active`, disabled = `.disabled`; Bootstrap only: `.pagination-lg` |
| Skeleton (`skeleton`) | Placeholder (`.placeholder`) | shape: text = default, circle = none, rectangle = none; Bootstrap only: `.placeholder-glow`, `.placeholder-wave` |
| Dropdown (`dropdown`) | Menu (`[data-bs-toggle="menu"] + .menu`) | emphasis: accent = `.btn-solid`, subtle = `.btn-subtle`, ghost = `.btn-text`; intent: neutral = `.theme-secondary`, brand = `.theme-primary`, error = `.theme-danger`; size: xsmall = `.btn-xs`, small = `.btn-sm`, medium = default, large = `.btn-lg`; parts: menu = `.menu`, item = `.menu-item`, item-icon = `.menu-item-icon`, separator = `.menu-divider`, group = `.menu-header` |
| Divider (`divider`) | Reboot hr / .vr (`hr`) | orientation: horizontal = `hr`, vertical = `.vr` |
| Icon (`icon`) | none | Bootstrap has no icon component: use the Material Symbols Outlined font (.material-symbols-outlined) inside any component. |

Bootstrap components with no Quantum equivalent (themed by the root tokens only): Chip, Chip input, OTP input, Strength, Combobox, Datepicker, List group, Nav and tabs, Navbar, Dialog, Drawer, Toasts, Tooltip, Popover, Stepper, Table, Carousel, Close button.
<!-- equivalences:end -->

## Not themable through Bootstrap's API

These Quantum decisions are left out: Bootstrap exposes no custom property or Sass setting for
them, and the theme restyles nothing directly.

- **Button hover and press.** Bootstrap derives the solid and outline hover and active colors
  with `oklch(from var(--theme-bg) …)` (darker, more saturated), and the subtle hover as a 50/50
  mix of `bg-muted` and `bg-subtle`. Quantum's hover and active ramps
  (`button.container.background.accent.<intent>.hover`, `.active`, and the matching border and
  subtle steps) are close but not exact; `$theme-colors` has no hover key and `$button-variants`
  only passes `bg-subtle` through unchanged. The ghost (`.btn-text`) hover is exact.
- **Button borders.** Bootstrap draws a solid button's border in its fill color and gives subtle
  buttons none: Quantum's accent border (`global.border.accent.*`) and subtle border
  (`global.border.subtle.*`) are not drawn.
- **Button anatomy.** The icon-side and label-side inline paddings
  (`button.container.padding-inline.icon-side.*`, `.label-side.*`), the icon sizes
  (`button.icon.size.*`) and the label letter spacing (`font.letter-spacing.tight.*`): Bootstrap
  has one inline padding and no icon size or letter-spacing token.
- **Disabled selection controls.** A disabled checked checkbox, radio or switch keeps the brand
  fill at Bootstrap's opacity (`.65`, the switch indicator `0.4`, hard-coded): Quantum's disabled
  colors only reach the unchecked controls (`--bs-check-disabled-bg`, …).
- **Checkbox and radio shape.** Bootstrap draws them with a `1px` border and a `33%` (checkbox)
  radius written in the rule itself (it declares `--check-border-radius` but does not read it):
  Quantum's `stroke-width.md` border and `checkbox.control.border-radius.*` are not applied.
- **Field states.** Hover and read-only backgrounds (`text-field.control.background.hover`,
  `.readonly`, the controls' `background.hover`): Bootstrap has no hover or read-only token. The
  error message (`.invalid-feedback`) reads `--bs-danger-fg` (Quantum's on-subtle error text), not
  `text-field.error-message.color` (on-base error text).
- **Input group sizes.** `.input-group-sm` and `.input-group-lg` size their controls from the
  button sizes (28px, 44px), not from Quantum's small and large fields (32px, 48px).
- **Field padding.** Bootstrap pads inputs and textareas alike, where Quantum centers a field's
  line (no block padding) and pads only the textarea: the block padding is the space step that
  keeps each input at its Quantum height, so a textarea's first line sits a little higher.
- **Spinner.** Bootstrap's ring is `currentColor` with a transparent segment: Quantum's track
  color (`spinner.ring.border-color`), ring color and timing are not themable, and the large size
  has no class.
- **Skeleton.** Bootstrap paints placeholders with `currentColor` at an opacity: Quantum's
  skeleton color (`skeleton.container.background`), heights and shapes are not themable (the
  radius is, through `--bs-radius-3`).
- **Elevation.** Quantum has shadow colors but no shadow geometry: Bootstrap's shadows keep their
  geometry, tinted with `effect.shadow.5`; the menu, form control, progress and range thumb
  shadows are set to `none` (Effects foundation). The switch indicator's shadow is hard-coded.
- **Fixed type.** Bootstrap's fluid `clamp()` font sizes become Quantum's fixed sizes; bold (700)
  and the light, lighter and bolder weights stay Bootstrap's (Quantum has none).
- **Accordion.** The trigger's hover and press backgrounds, its minimum height and the indicator
  glyph; Bootstrap boxes the items where Quantum separates them with lines.
- **Avatar, badge, breadcrumb, pagination, menu sizes.** Heights Bootstrap writes as plain values
  or derives from padding: the badge minimum height (`1.375rem`), the breadcrumb link minimum
  height (`2.25rem`), the menu item height (`dropdown.item.min-height`), the pagination link width;
  the avatar's square shape and its stack ring; the breadcrumb separator glyph.
- **Menu error items.** `.menu-item.theme-danger` takes the danger text color, but not Quantum's
  error hover and press backgrounds (`dropdown.item.background.error.*`).
- **Alert parts.** Bootstrap colors the whole alert with the theme `fg`: Quantum's neutral message
  color and icon color are not separate.
- **Divider.** `.vr` is drawn with `--bs-border-color`, not `divider.container.color` (the `hr`
  takes it).
- **Card surface level-2** and the **slider's** hover thumb color have no Bootstrap class or token;
  the slider's filled track is Bootstrap's (`--theme-bg`, brand by default).

## Development

From the root of the monorepo (the tokens must be built: `pnpm tokens:build`):

```sh
pnpm --filter @quantum-ds/bootstrap-theme build   # node build.mjs: writes dist/ (also run by prepack)
node --test "packages/bootstrap-theme/test/**/*.test.mjs"
node packages/bootstrap-theme/build.mjs --readme  # after a mapping change: regenerate the tables above
```

The build writes `dist/quantum.css`, `dist/quantum.scss`, `dist/scss/_quantum.scss` and
`dist/demo.html`: one page with every Bootstrap 6 component, the theme, and a toolbar to switch
light, dark and auto and to turn the theme off to compare with stock Bootstrap. Its source is
`demo/` (`index.html`, `demo.css` for the page layout, `demo.js` for the toggles); the build
inlines Bootstrap, the theme and the demo files, and only the webfonts stay external. Bootstrap
6's JavaScript is an ES module: open `dist/demo.html` over HTTP (any static server), or straight
from the disk in browsers that run inline modules from `file://`.

The rules of the package are in [AGENTS.md](AGENTS.md); the change workflow is in the root
[AGENTS.md](../../AGENTS.md) and [`agents/`](../../agents/).

## License

[MIT](LICENSE)
