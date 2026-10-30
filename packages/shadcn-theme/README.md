# @quantum-ds/shadcn-theme

[![npm version](https://img.shields.io/npm/v/@quantum-ds/shadcn-theme)](https://www.npmjs.com/package/@quantum-ds/shadcn-theme)

> [!WARNING]
> **Experimental: Quantum NextGen.** This package belongs to Quantum NextGen, the next major version of the Quantum Design System, developed on the [`nextgen`](https://github.com/ThalesGroup/quantum/tree/nextgen) branch. It is experimental: the theme's variables and values may change or break in any release, without notice. Do not use it in production.

Quantum for [shadcn/ui](https://ui.shadcn.com): a theme that makes shadcn's own components look
like the Quantum Design System, built from [`@quantum-ds/tokens`](../tokens) and following the
specifications of [`@quantum-ds/components`](../components).

It uses **shadcn's theming API only**: the CSS variables shadcn documents
([Theming](https://ui.shadcn.com/docs/theming)) on `:root` and `.dark`, bridged to Tailwind CSS v4
by `@theme inline`, and the same values as a registry theme item for `shadcn add`. The components
stay exactly as shadcn ships them: no class string is changed and no component CSS is added. What
Quantum decides that these variables cannot carry is listed under
[Not themable through shadcn's API](#not-themable-through-shadcns-api).

The package ships `dist/quantum.css` (the stylesheet), `dist/quantum.json` (the registry item) and
`dist/demo.html` (one self-contained page showing every shadcn component on the theme, in light and
dark).

## Usage

```sh
pnpm add -D @quantum-ds/shadcn-theme@alpha
```

**A. Import the stylesheet** in your `globals.css`, after `tailwindcss` (and after `shadcn/tailwind.css`
if your project imports it). It replaces the `:root`, `.dark` and `@theme inline` blocks `shadcn init`
wrote: delete those, or import it after them.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@quantum-ds/shadcn-theme/dist/quantum.css";

@custom-variant dark (&:is(.dark *));
```

**B. Or let the shadcn CLI write the variables** into your `globals.css` from the registry item:

```sh
npx shadcn@latest add ./node_modules/@quantum-ds/shadcn-theme/dist/quantum.json
```

It overwrites the variables of `:root` and `.dark` and writes the fonts and the radius scale into
`@theme inline`.

**Fonts.** The theme names Inter (`--font-sans`) and Fragment Mono (`--font-mono`), with system
fallbacks. Load them, for example from Google Fonts in your document `<head>`:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fragment+Mono&family=Inter:wght@100..900&display=swap" />
```

**Dark mode** is the Quantum dark mode, applied by the `dark` class on an ancestor (`<html class="dark">`),
as shadcn's own dark mode is; toggle it with your theme provider (`next-themes` and the like).

## Mapping

Every value comes from one Quantum token, written as a comment next to it in `dist/quantum.css`
and listed in `meta.tokens` of `dist/quantum.json`. A shadcn variable that is a semantic decision
takes a **semantic** token; one that is really a component decision takes the **component** token
of the matching Quantum component, so it follows that component's decisions. The table is
[`src/mapping.mjs`](src/mapping.mjs); values are light / dark.

| shadcn variable | Where | Quantum token | Value | Why |
| --- | --- | --- | --- | --- |
| `--background` | `:root`, `.dark` | `global.bg.level.0.default` | `#FDFDFD` / `#191919` | The page surface: level 0. |
| `--foreground` | `:root`, `.dark` | `global.text.on-base.neutral.primary` | `#0E0D0D` / `#D2CECF` | Running text. |
| `--card` | `:root`, `.dark` | `card.container.background.level-1` (component, = `global.bg.level.1.default`) | `#F7F6F6` / `#212121` | The Quantum Card surface at its default level. |
| `--card-foreground` | `:root`, `.dark` | `card.title.color` (component, = `global.text.on-base.neutral.primary`) | `#0E0D0D` / `#D2CECF` | The Card title color. |
| `--popover` | `:root`, `.dark` | `dropdown.menu.background` (component, = `global.bg.level.2.default`) | `#FDFDFD` / `#282828` | The Dropdown menu surface (level 2); shadcn uses it for every floating surface. |
| `--popover-foreground` | `:root`, `.dark` | `dropdown.item-label.color.neutral.default` (component, = `global.text.on-subtle.neutral.default`) | `#323031` / `#E3DDDE` | The menu item label. |
| `--primary` | `:root`, `.dark` | `global.bg.accent.brand.default` | `#175DD6` / `#9EE7FA` | Button emphasis accent, intent brand. |
| `--primary-foreground` | `:root`, `.dark` | `global.text.on-accent.brand.default` | `#FBFCFD` / `#09191D` | |
| `--secondary` | `:root`, `.dark` | `global.bg.subtle.neutral.default` | `#B6B4B41a` / `#7676761a` | Button emphasis subtle, intent neutral (translucent). |
| `--secondary-foreground` | `:root`, `.dark` | `global.text.on-subtle.neutral.default` | `#323031` / `#E3DDDE` | |
| `--muted` | `:root`, `.dark` | `global.bg.base.neutral.3` | `#ECE8E9` / `#282828` | The neutral step progress-bar and slider tracks read; `neutral.2` equals level 1 and would vanish on cards. |
| `--muted-foreground` | `:root`, `.dark` | `global.text.on-base.neutral.secondary` | `#323031` / `#B9B7B7` | Descriptions and helper texts. shadcn also uses it for placeholders, which Quantum draws tertiary. |
| `--accent` | `:root`, `.dark` | `global.bg.subtle.neutral.default` | `#B6B4B41a` / `#7676761a` | The hover surface of Quantum ghost buttons, accordion triggers and menu items; shadcn's ghost/outline hover, focused menu item, pressed toggle. |
| `--accent-foreground` | `:root`, `.dark` | `global.text.on-subtle.neutral.default` | `#323031` / `#E3DDDE` | |
| `--destructive` | `:root`, `.dark` | `global.bg.accent.functional.error.default` | `#E12A23` | Button emphasis accent, intent error; shadcn also colors error text and invalid borders with it. |
| `--destructive-foreground` | `:root`, `.dark` | `global.text.on-accent.functional.error.default` | `#FEFBFA` | No longer in shadcn's documented set (the v4 components write `text-white`); kept for blocks that read it. |
| `--border` | `:root`, `.dark` | `card.container.border-color.level-1` (component, = `global.border.level.edge.level.1`) | `#D7D3D4` / `#282828` | The edge of the Card at level 1: shadcn's `--border` is mostly card, popover and table edges. |
| `--input` | `:root`, `.dark` | `text-field.control.border-color.default` (component, = `global.border.accent.neutral.default`) | `#323031` / `#B9B7B7` | The border of a Quantum form control, also what checkboxes read. |
| `--ring` | `:root`, `.dark` | `color.focus.ring` | `#175DD6` / `#9EE7FA` | The focus ring color. |
| `--chart-1` … `--chart-5` | `:root`, `.dark` | `dataviz.role.brand.bg.accent.brand-1` … `brand-5` | `#0B2A69` … `#749DE5` / `#9EE7FA` … `#297B8C` | The brand data series. The categorical alternative is `dataviz.role.extended.sand.accent.extended-1..8`. |
| `--sidebar` | `:root`, `.dark` | `global.bg.level.1.default` | `#F7F6F6` / `#212121` | A sidebar is a level-1 surface beside the level-0 page. |
| `--sidebar-foreground` | `:root`, `.dark` | `global.text.on-base.neutral.primary` | `#0E0D0D` / `#D2CECF` | |
| `--sidebar-primary` | `:root`, `.dark` | `global.bg.accent.brand.default` | `#175DD6` / `#9EE7FA` | |
| `--sidebar-primary-foreground` | `:root`, `.dark` | `global.text.on-accent.brand.default` | `#FBFCFD` / `#09191D` | |
| `--sidebar-accent` | `:root`, `.dark` | `global.bg.subtle.neutral.default` | `#B6B4B41a` / `#7676761a` | Same as `--accent`. |
| `--sidebar-accent-foreground` | `:root`, `.dark` | `global.text.on-subtle.neutral.default` | `#323031` / `#E3DDDE` | |
| `--sidebar-border` | `:root`, `.dark` | `global.border.level.edge.level.1` | `#D7D3D4` / `#282828` | The edge of a level-1 surface. |
| `--sidebar-ring` | `:root`, `.dark` | `color.focus.ring` | `#175DD6` / `#9EE7FA` | |
| `--radius` | `:root` | `corner-radius.sm` | `8px` | shadcn's base radius, which it takes as `--radius-lg`: the step of Quantum's surfaces. |
| `--font-sans` | `@theme inline` | `body.family` | `Inter`, then `ui-sans-serif, system-ui, sans-serif` | Body text. |
| `--font-mono` | `@theme inline` | `mono.family` | `"Fragment Mono"`, then `ui-monospace, …, monospace` | Code. |
| `--radius-sm` | `@theme inline` | `dropdown.item.border-radius` (component, = `corner-radius.2xs`) | `2px` | `rounded-sm` is the menu and select item. |
| `--radius-md` | `@theme inline` | `button.container.border-radius.medium` (component, = `corner-radius.xs`) | `4px` | `rounded-md` is every control (button, input, select, toggle, textarea) and popover. |
| `--radius-lg` | `@theme inline` | `alert.container.border-radius` (component, = `corner-radius.sm`) | `8px` | `rounded-lg` is the alert, dialog and tabs list. |
| `--radius-xl` | `@theme inline` | `card.container.border-radius` (component, = `corner-radius.sm`) | `8px` | `rounded-xl` is the card. |
| `--radius-2xl` … `--radius-4xl` | `@theme inline` | `corner-radius.md`, `.lg`, `.xl` | `12px`, `16px`, `20px` | Not read by the components; the next steps of the scale. |

shadcn derives its radius scale by multiplying `--radius` (0.6, 0.8, 1, 1.4…), which cannot give
Quantum's 2 / 4 / 8 / 8 px for `sm` / `md` / `lg` / `xl`: the theme sets each step in `@theme inline`
(`cssVars.theme` of the registry item, which the CLI writes there too).

## Components

Which shadcn component and props render each Quantum component (the `COMPONENTS` data of
`src/mapping.mjs`, checked against the specs at build time; the demo prints it under each heading).

| Quantum component | shadcn | Equivalence |
| --- | --- | --- |
| Button | `button` | emphasis accent + intent brand = `default`, subtle + neutral = `secondary`, ghost + neutral = `ghost`, accent + error = `destructive`; size xsmall / small / medium / large = `xs` / `sm` / `default` / `lg`; `disabled`. No shadcn variant for accent + neutral (Quantum's default), subtle or ghost in brand or error. shadcn only: `outline`, `link`. |
| Icon button | `button` | size xsmall / small / medium / large = `icon-xs` / `icon-sm` / `icon` / `icon-lg`, same variants as Button. |
| Badge | `badge` | accent + brand = `default`, subtle + neutral = `secondary`, accent + error = `destructive`. No success, warning, info intents, one size. shadcn only: `outline`, `ghost`, `link`. |
| Alert | `alert` | intent info = `default` (an untinted card), error = `destructive`; no success, warning. |
| Card | `card` | surface level-1 = `Card`, title = `CardTitle`, description = `CardDescription`; no level-2 surface. |
| Accordion | `accordion` | item, trigger, panel = `AccordionItem`, `AccordionTrigger`, `AccordionContent`; one size. |
| Breadcrumb | `breadcrumb` | link = `BreadcrumbLink`, current = `BreadcrumbPage`, separator = `BreadcrumbSeparator`. |
| Pagination | `pagination` | link = `PaginationLink`, current = `isActive`, previous / next = `PaginationPrevious` / `PaginationNext`. |
| Progress bar | `progress` | no indeterminate state. |
| Skeleton, Spinner, Switch, Slider, Textarea | `skeleton`, `spinner`, `switch`, `slider`, `textarea` | one to one; invalid = `aria-invalid`, disabled = `disabled`. |
| Avatar | `avatar` | circle = `Avatar`, image = `AvatarImage`, initials = `AvatarFallback`; no square shape. |
| Checkbox | `checkbox` | checked, indeterminate (`checked="indeterminate"`), invalid (`aria-invalid`), disabled. |
| Checkbox group, Radio group | `field` + `checkbox`, `radio-group` | `FieldSet`, `FieldLegend`, `Field orientation="horizontal"`, `FieldError`; `RadioGroupItem`. |
| Text field | `input` (+ `label`, `field`) | control = `Input`, label = `Label`, description = `FieldDescription`, error message = `FieldError`, invalid = `aria-invalid`, readonly = `readOnly`; one size. |
| Number field | `input` | `type="number"`, no stepper buttons. |
| Search field | `input-group` | `InputGroupInput` with an `InputGroupAddon` icon. |
| Select | `native-select` | the Quantum Select is native; shadcn's `select` (a Radix listbox) is the custom alternative. |
| Dropdown | `dropdown-menu` | trigger = `DropdownMenuTrigger` + `Button`, menu = `DropdownMenuContent`, item = `DropdownMenuItem` (`variant="destructive"` for intent error), separator, group. |
| Divider | `separator` | orientation horizontal / vertical. |
| Icon | none | shadcn components take lucide-react SVG icons; Quantum icons are Material Symbols glyphs. |

shadcn components with no Quantum component yet: `dialog`, `tabs`, `table`, `tooltip`, `toggle`,
`toggle-group` (they take the theme's surfaces, borders and accent like the rest).

## Not themable through shadcn's API

These Quantum decisions live in shadcn's class strings, not in its variables, so the theme leaves
them out rather than restyle the components:

- **Sizes and spacing.** Control heights (Quantum buttons 24 / 28 / 36 / 44 px, text fields 32 / 40 /
  48 px), paddings, gaps, icon sizes and font sizes are Tailwind utilities in each component (`h-9`,
  `px-4`, `text-sm`). Quantum's medium button label is 16 px; shadcn's is 14 px.
- **Border widths.** Quantum draws 0.6 px borders (`stroke-width.sm`); shadcn's `border` is 1 px.
- **Hover and active colors.** Quantum has a token per state (`global.bg.accent.brand.hover`,
  `.active`); shadcn blends the rest color with opacity (`hover:bg-primary/90`, `bg-secondary/80`),
  so hovers are lighter, not darker, and there is no pressed state.
- **The focus ring.** The color is Quantum's, but shadcn draws a 3 px ring at 50 % opacity plus a
  `--ring` border, where Quantum draws a solid 2.4 px outline offset by 4 px (`focus.ring.width`,
  `focus.ring.offset`).
- **Disabled.** shadcn fades the whole control (`opacity-50`); Quantum swaps to the disabled
  tokens (`global.bg.state.disabled.default`, `global.text.state.disabled.default`).
- **Dark-mode blends.** In dark, shadcn fills inputs and outline buttons with `--input` at 30 %
  (`dark:bg-input/30`) and dims `destructive` to 60 %; with Quantum's strong control border
  (`#B9B7B7`) the fields get a grey fill Quantum does not have (its fields sit on level 0).
- **Per-component colors one variable carries for several components.** The Quantum menu is 8 px
  round, its controls 4 px, but shadcn rounds both with `rounded-md` (4 px here). The Divider's
  color (`global.border.base.neutral.4`) is darker than the card edge `--border` takes. The
  progress track is `--primary` at 20 % instead of `global.bg.base.neutral.3`; the skeleton is
  `--accent` instead of `global.bg.state.skeleton.default`; error text is `--destructive`
  (`#E12A23`) instead of `global.text.on-subtle.functional.error.default`.
- **The switch.** shadcn's off track is `--input` with a `--background` thumb (dark track, light
  thumb); Quantum's off switch is a level-0 track with a dark thumb.
- **Placeholders** read `--muted-foreground` (Quantum's secondary text); Quantum draws them tertiary.
- **Intents and levels shadcn lacks**: success, warning and info (badge, alert), neutral accent
  buttons, card level 2, component sizes, the indeterminate progress bar. Adding a variable for
  them would mean adding variants to the components.
- **Elevation and motion.** shadcn's shadows (`shadow-xs`, `shadow-md`) and durations are Tailwind's
  defaults, outside its documented variables.

## Development

From the root of the monorepo:

```sh
pnpm install
pnpm shadcn-theme:build                         # build the tokens, then this package
pnpm --filter @quantum-ds/shadcn-theme build    # this package only: dist/quantum.css, quantum.json, demo.html
node packages/shadcn-theme/build.mjs --no-demo  # the theme files only (no Vite)
node --test "packages/shadcn-theme/test/**/*.test.mjs"
```

The build reads the token sources and the component specs through the repository's
`scripts/lib/`, resolves `src/mapping.mjs` in light and dark, and **fails** when a mapped token
path or a spec property, option, state or part no longer exists: change the mapping, then build
again. The theme files need nothing but Node; Vite builds only the demo.

The demo (`demo/`) is a Vite + React + Tailwind CSS v4 app with shadcn's `new-york-v4` components,
fetched from the public registry and committed unmodified in `demo/src/components/ui/` (with
shadcn's `shadcn/tailwind.css` as `demo/src/shadcn-tailwind.css`), so the build is offline and
deterministic. To take newer components, run `node packages/shadcn-theme/demo/scripts/fetch-ui.mjs` and
review the diff. Open `dist/demo.html` in a browser to look at the theme in light and dark.

The rules of the package are in [AGENTS.md](AGENTS.md); the change workflow is in the root
[AGENTS.md](../../AGENTS.md) and [`agents/`](../../agents/).

## License

[MIT](LICENSE)
