# apps/docs/ — the docs site (Astro viewer)

Astro 7 static site, the private pnpm package `docs` (`pnpm --filter docs dev`; not published).
**A viewer, not a source**: it renders the specs, docs, tokens and web
implementation from the packages (`@quantum-ds/tokens`, and `packages/components/`: its specs and
its unpublished web implementation `src/`, imported by relative path since `@quantum-ds/components`
exports only the specs) and from its own `content/` and `screens/` directories, and must never hold
design decisions.
**Built with the design system**: its own chrome is a product of the design system, made of its
semantic tokens and its components (see below), so every new token or component can change how
the docs look. `pnpm dev` and `pnpm build` at the repository root build the tokens first, then
run this package.

```
astro.config.mjs               base/site from env (SITE_BASE, SITE_URL); outDir ./dist; vite fs.allow ['../..'] (the whole monorepo); compressHTML false; Markdown Shiki theme imported as @quantum-ds/tokens/shiki-theme.json; optimizeDeps.include = every client-side dependency: @component-anatomy/core + the Shiki modules of src/lib/highlight.ts (keep in sync, see below)
integrations/repo-sources.mjs  dev only: watches the specs (packages/components/specs), the content (content/), the tokens package (packages/tokens), the screens (screens/), AGENTS.md and agents/ (paths from scripts/lib/paths.mjs) on the current Vite watcher; on change bumps the memo generation (Symbol quantum.docs.generation), re-syncs content, reloads the browser (see below); integration name quantum:repo-sources
src/content.config.ts          collections: docs (./content/components/*.md), specs (../../packages/components/specs/components/*.spec.json), foundationDocs (./content/foundations/*.md), foundations (../../packages/components/specs/foundations/*.spec.json)
src/lib/repo.ts                repoRoot (the directory holding pnpm-workspace.yaml and packages/tokens/tokens.config.json) / repoPath / readRepoFile (build-time fs access, repository-relative paths from scripts/lib/paths.mjs); memo(): cache of repository data, dropped when the dev server sees a source change
src/lib/tokens.ts              loads tokens through scripts/lib/dtcg.mjs; TokenRow with resolved value (+ every other mode's when it differs) + CSS names; getModes (modes + web context attribute), modeTokens, platformTokens
src/lib/a11y.ts                resolves accessibility refs through scripts/lib/a11y.mjs (citations, WCAG criteria, publishers)
src/lib/platforms.ts           reads packages/components/specs/platforms.json: names, inputs, onWeb/scopeLabel helpers for scoped items
src/lib/web.ts                 import.meta.glob of ../../../../packages/components/src/components/*/*.template.mjs; defaultProps(spec)
src/lib/matrix.ts              states matrix layout: one set of matrices per part taking states (state `parts`; the component as a whole otherwise); enum properties sharing a component token path are crossed (one table per combination of the others); cellProps forces a state on a part, through the entry of a list property for a repeated part
src/lib/inspector.ts           token inspector data: every component token read through scripts/lib/token-map.mjs (part, options, state, kind), its alias chain (semantic, then raw), resolved values and the decisions naming it or a token it aliases
src/lib/format-html.ts         formatHtml(html): pretty-prints the one-line template output (one element per line, text-only elements on one line, attributes one per line past 72 columns); server and client
src/lib/highlight.ts           Shiki (sync core, JS regex engine, fixed grammars): highlight(code, lang) -> inner HTML of <code>; server and client
src/lib/tabs.ts                component and foundation page tabs (slug + label), one static route each; FOUNDATION_TABS reuses the component slugs and labels that apply, the index being Overview (specimens, then examples)
src/lib/screens.ts             screens (screens/, i.e. apps/docs/screens): modules through import.meta.glob of ../../screens/*/*.screen.mjs, sections, sources and licence texts through fs (memo), originLinks (original and code at the recorded commit), componentsOf (through scripts/lib/screens.mjs)
src/lib/foundations.ts         foundation tokens (tokensOf), contrast in every platform x mode through scripts/lib/contrast.mjs (contrastOf), components aliasing its tokens (followersOf), specimens (specimenOf: each token's value, alias and inline style in every mode and on every platform overlay, through scripts/lib/specimens.mjs), icon names the component examples use (iconNamesOf)
src/layouts/Layout.astro       chrome + experimental banner (Alert, top of main) + sidebar (`sidebar` prop: `catalog` = foundations in their docs `order`, then components; `screens` = Overview, Sources and licences, then the sections of screens/sections.json with their screens) + Mode switch (sets the design system's data-theme on <html>, remembered in localStorage, applied before paint); imports src/styles/site.css AND the design system: @quantum-ds/tokens/css/index.css first, then packages/components/src/index.css (relative import)
src/pages/index.astro          summary strip + component list (filter appears past 6 components)
src/pages/components/[id]/[...tab].astro  one static page per tab: examples (index), states, playground, guidelines, spec (incl. cited accessibility contract), decisions (the spec's decision log), tokens, implementation
src/pages/tokens/[...tier].astro  one static page per tier (/tokens = first tier), tokens grouped by first path segment, filtered by TokenFilter
src/pages/platforms.astro      platform vocabulary + per-platform token overrides (platformTokens in lib/tokens.ts)
src/pages/modes.astro          mode vocabulary, web usage, every component's web examples once per mode context, per-mode token overrides (modeTokens)
src/pages/foundations/index.astro  foundation list in docs `order` (tokens, specimens, rules, lowest required contrast, followers)
src/pages/foundations/[id]/[...tab].astro  one static page per tab, like components: overview (index: specimens, then examples: code samples of `source` examples in an ExampleExplorer following the page mode with a Mode context select, then component renderings once per mode), guidelines, spec (rules with per-mode values, computed contrast, cited accessibility, changelog), decisions, tokens (owned tokens + components following it)
src/pages/screens/index.astro  screens overview: per section, a card per screen with a scaled-down, inert preview (iframe of its frame page)
src/pages/screens/sources.astro  every source: links, commit, licence, shared changes, the full licence text (anchor = source id)
src/pages/screens/[source]/[block]/index.astro  one screen: attribution (ScreenAttribution), preview iframe with Frame width and Mode context selects and a link to open it alone, components it renders, gaps (issue links when the gap names issues), changes, formatted HTML
src/pages/screens/[source]/[block]/frame.astro  the screen alone in a bare page: only @quantum-ds/tokens/css/index.css, packages/components/src/index.css (relative import) and ../../../../../screens/screens.css, mode from ?mode= or the remembered docs mode (follows the header switch through the storage event)
src/pages/about.astro          renders the root AGENTS.md, then each guide of agents/ (links to a guide jump to its section)
src/components/*.astro         ScreenAttribution (source, original, code at the commit, licence and copyright of a screen), DecisionLog and A11yStatements (shared by component and foundation pages), Specimen (one foundation specimen drawn by its display; Play button for motion, see below), Anatomy (spec tab: live rendering linked to the parts table by @component-anatomy/core), ExampleExplorer (examples tab: tabs + stage + props + playground link; with `samples`, a foundation's code examples: tabs + highlighted block + source, and the playground's Mode context select, shared by every block of the explorer), StateMatrix, Playground (client script, presets props from the query string; a mode context select sets data-theme on the stage; vision and text size simulations of the stage (see Rules); dispatches `playground:render` { props, state } after each render; the formatted HTML spans the bottom of the playground, scrolls inside 400px and has a Copy button), TokenInspector (playground panel, see below), TokenTable, TokenFilter (client script filtering the TokenTables of its section; ?q= keeps the query), Status (badge or compact dot)
src/styles/site.css            chrome only; every class is site-*; reads semantic tokens only (no literal color or font value); --site-* = layout constants
```

## Built with the design system

The docs consume the design system exactly like a product would. `pnpm validate` enforces both
rules (`scripts/lib/site-check.mjs`):

1. **Tokens.** Colors, typography, radii, border widths, the focus ring and motion in
   `src/styles/*.css` (and any `<style>` in a `.astro` file) read **semantic** tokens:
   `var(--color-*)`, `var(--text-<style>-<property>)`, `var(--radius-*)`,
   `var(--border-width-*)`, `var(--focus-ring-*)`, `var(--motion-*)`. No literal color (hex,
   `rgb()`, `light-dark()`, named), no literal font family, size, weight, line height or letter
   spacing, no literal border width, radius or outline width, no raw token, no component token.
   `--site-*` variables hold layout constants only. Layout lengths (padding, gap, widths) stay
   literal until the semantic tier has layout tokens. When the docs need a meaning the semantic
   tier lacks, read the Figma library's scales or ask for a decision (`packages/tokens/AGENTS.md`), never a site literal.
2. **Components.** A native control that a component covers (same element as the one carrying
   the component's role: `implementations.web.element`, or the `rolePart`'s element inside a
   wrapper root, such as a text field's `<input>`; same ARIA role, implicit or explicit) is that
   component, rendered by its template (`set:html={template.render(props)}`) or carrying its root
   class (or the role part's class). A site look-alike fails. So
   **a new component can require a site change**: when it lands, `pnpm validate` lists every
   control of the chrome it now covers, and `pnpm impact` adds `apps/docs/src/` to the checklist.
   Switch those controls to the component in the same piece of work and update the table below.
   A control only becomes a component when the semantics match: a link that navigates stays a
   link even if it looks like a button.

| Chrome element | Design system | Today |
| --- | --- | --- |
| Colors, text, radii, borders, focus ring, motion | Semantic tokens | Everywhere in `site.css`; the global focus ring follows the Focus ring foundation (`focus.ring.width`, `focus.ring.offset`, `color.focus.ring`) |
| Action buttons | Button, Icon button | Button: the playground's "Inspect tokens" toggle, its Copy button (rendered by the template, `content_copy` icon) and the inspector's kind filters (`aria-pressed`, accent when pressed, subtle otherwise). Use them for any new action (copy, reset, menu) |
| Menus of actions | Dropdown | None in the chrome yet: use it for any button opening a list of actions |
| Example list (`role="tab"`) | No Tabs component yet | `site-explorer__tab` |
| Disclosures of the chrome (`<details>`: token inspector details, superseded decisions, raw source files) | Accordion exists, but a single disclosure is not an accordion, and `summary` has no role the check can match: left native | `site-source`, `site-inspector__more` |
| Navigation landmarks (`<nav>`: header, tabs, tables of contents) | Breadcrumb and Pagination are navigation landmarks, but a landmark component does not cover every `nav` (`COVERING_ROLES` in `scripts/lib/site-check.mjs`) | `site-header__nav`, `site-tabs`, `site-toc` |
| Mode switch (header), mode context selects (explorer, playground), playground enum, icon, forced-state, vision and text size selects | Select | Rendered by the Select template (`size: "small"`, its own label; `attrs` carries `name`, `data-mode-switch`, `data-mode-context`) |
| Playground boolean props | Checkbox | Rendered by the Checkbox template (`attrs.name` = the prop) |
| Playground string props | Text field | Rendered by the Text field template |
| Playground list props (JSON) | Textarea | Rendered by the Textarea template (`attrs['data-json']`; the hint is its description; invalid JSON sets `aria-invalid` on the control, which the component's CSS shows) |
| Playground number props | Number field | Rendered by the Number field template (`attrs.name` = the prop) |
| Token filter, component filter (`type="search"`) | Search field | Rendered by the Search field template (`size: "small"`, its own label; `attrs` carries `data-filter`, `autocomplete`); the scripts find the input inside the bar |
| Experimental banner (top of every page's `main`) | Alert | Rendered by the Alert template in `Layout.astro` (`intent: "warning"`), in `site-banner`. It is in the page at load, so it is not announced as a live region (see the Alert docs); it stays until Quantum NextGen is no longer experimental |
| Status and tier badges | Semantic intents, no Badge in the chrome yet (the Badge component exists; the chrome's `site-status` and `site-tier` are spans with no role, so the rule does not force the switch) | `site-status`, `site-tier` |
| Links ("Open in playground", navigation) | No Link yet | Native `<a>`, semantic tokens |
| Code highlighting | Code foundation (`global.text.code.*`) | Shiki with the generated theme `@quantum-ds/tokens/shiki-theme.json`, in `src/lib/highlight.ts` and the Markdown docs |

## Rules

- Color modes: the chrome follows the design system's mode without knowing the mode ids. The
  header switch sets `data-theme` on `<html>`, the semantic tokens take that mode's values, and
  the chrome reads them. Stages read `--color-surface-level-0` directly (a `--site-*` variable
  holding it would resolve on the root, not in a nested mode context); the anatomy's `--ca-*`
  variables are declared on `:root, [data-theme]` for the same reason. Code blocks use the
  design system's single Shiki theme (`@quantum-ds/tokens/shiki-theme.json`), whose colors are CSS variables:
  they follow the `data-theme` of their context, in `src/lib/highlight.ts` and `astro.config.mjs`
  alike. `pre` sets `color: var(--global-text-on-base-neutral-primary)` so plain code follows a nested
  context too.

- Screens render in an iframe of their bare frame page, unlike components: a screen is a whole
  page (its own `main`, `nav`, `header` landmarks, `h1` and ids) that must not nest in the docs
  page, and the docs chrome must not reach it. Its layout reads container queries, so the Frame
  width select resizes the iframe to review it at other widths. Every screen page shows where it
  comes from and its licence (ScreenAttribution); the full licence text is on Screens → Sources
  and licences. In dev, a new `*.screen.mjs` file appears after the next edit of a site file
  (Astro caches `getStaticPaths`); touching `src/lib/screens.ts` is enough.
- Keep the `site-` / `--site-` prefixes so nothing collides with `ds-*` / `--<component>-*`.
  The components render in the same document as the chrome on purpose (no iframes): if the
  chrome leaks into a component, fix the chrome selector, never the component.
- Everything rendered comes from the collections, the tokens library or the templates. Adding
  a component needs no change here to *render* it; the chrome may still need to *use* it
  ("Built with the design system" above).
- Astro 7: close every tag, `compressHTML` is off, the native Markdown processor renders docs
  (no remark plugins). Client scripts are bundled; the playground loads templates via
  `import.meta.glob` on the client too.
- Every code block goes through `src/lib/highlight.ts` (Shiki, the design system's theme
  `@quantum-ds/tokens/shiki-theme.json`, the notation transformers of `@shikijs/transformers`); Markdown docs
  use the same theme and transformers through `markdown.shikiConfig`. Grammars: CSS, diff, HTML,
  JavaScript, JSON, Markdown, shell, YAML. Marked lines are drawn by
  `packages/components/src/foundations/code.css` (imported by `packages/components/src/index.css`).
  Never a third-party theme: syntax colors are a design decision (Code foundation).
  Add a grammar there when a new file type is displayed. The highlighter chunk is large (the
  HTML grammar embeds CSS and JS): import it dynamically in client scripts, as the playground does.
- The anatomy rendering finds parts through `implementations.web.partSelectors`, tags them with
  `data-part` (what @component-anatomy/core reads) and shows the web example exposing the most
  parts. It is `aria-hidden` and out of the tab order; keyboard users reach parts through the
  table rows. Overlay colours come from the `--ca-*` variables mapped to semantic tokens in site.css.
- Platform scopes are labels only: the site shows `inputs`/`platforms` from the spec, skips
  states and examples that exclude the web (it cannot render them), groups accessibility
  guidelines by platform, and never decides itself what applies where.
- The states matrix crosses enum properties whose options appear together in one component
  token path (`button.container.background.<emphasis>.<intent>.<state>`): the first in spec
  order gives the rows, every combination of the others its own table. Properties never
  combined in a path (`size`) keep a table of their own with the others at their default.
- When states name `parts` (Dropdown: `trigger`, `item`), each part gets its own matrices: rows
  from the enum properties affecting it (component properties, or the part's instance
  properties), columns from its states.
- Token inspector (playground only for now): "Inspect tokens" is a disclosure (`aria-expanded`,
  `aria-controls`) opening a panel next to the stage (under it below 1280 px). The playground's
  first row is at least 720 px tall; its side panels (props, inspector) take the height of the row
  without setting it (`contain: size`) and scroll inside it, so the stage decides the height. The
  code of the rendering is the last row, across every column, at most 400px tall with its own
  scroll; Copy writes it with the Clipboard API, falls back to the copy command, and failing both
  selects it, saying so in a `role="status"` next to the button. Below 900 px the single column is
  `minmax(0, 1fr)` so long code lines scroll inside the code block instead of widening the page.
  Under the stage the inspector scrolls inside 32rem; below 900 px the props keep their natural
  height. The panel renders
  every component token at build time and hides those the rule of `packages/tokens/AGENTS.md` "Which
  token applies" does not select for the current props and forced state; the client imports
  `activeTokens` from `scripts/lib/token-map.mjs`, the same code `pnpm validate` uses. Tokens
  are grouped by part and filtered by kind (`?kinds=color,border`; `?inspect=1` opens it). A row
  shows the property, the options and state of its path and the semantic alias; the raw chain,
  the values per mode, the CSS variable, the link to the Tokens tab and the decisions sit in a
  "Details" disclosure. Part groups are `data-anatomy-item`s of @component-anatomy/core on the
  stage: hovering or focusing inside a group outlines the part, hovering the stage marks the
  group. "from default" marks a slot without a token for the current state.
- Foundation specimens (`Specimen.astro`) draw token values as data: the value is set inline
  (`--_value`, `--swatch`, font declarations), never in `site.css`, and the chrome around it
  reads semantic tokens. One branch per display of `scripts/lib/specimens.mjs`; a new display
  needs its branch here, its `$type`s there and the schema enum (the validator compares them).
  Values that differ per mode are shown side by side (`color`) or listed; values an overlay
  changes are labelled with the platform (bars per platform for `length`). Motion specimens
  play on request with the design system's Button (`play_arrow`), at the token's duration and
  easing (easings over one second); under `prefers-reduced-motion: reduce` the dots jump and a
  note says why. Icons are drawn with the `--font-icon-*` variables (`site-icon`).
- Forced states use the template's `state` prop, which the CSS matches through
  `[data-state="…"]`. The disabled column also sets the real `disabled` prop. A repeated part
  (an item of a `list` property) is rendered as a single entry carrying the forced `state`, and
  the `visibleIn` state of the part or its ancestors (`expanded`) is forced on the component so
  the part shows.
- The anatomy renders every candidate in the `visibleIn` states first (the opened dropdown),
  so a part hidden at rest still shows and can be outlined.
- Playground simulations sit in the toolbar above the stage (they are not props) and apply to the stage only, never to the chrome (the controls stay usable)
  and never to the code shown. **Vision**: SVG filters copied as they are from Chromium's own
  "Emulate vision deficiencies" (`vision_deficiency.cc`: blurred vision, reduced contrast, and
  the Machado et al. 2009 color matrices for protanopia, deuteranopia, tritanopia,
  achromatopsia), with the default linearRGB `color-interpolation-filters` the matrices are
  derived for; an open popover is filtered on its own, the top layer escaping the stage's
  filter. A simulation shows what a reader may lose; it proves nothing passes. **Text size**
  (150%, 200%): after each render, every element of the stage gets its computed font size times
  the factor, like a browser's text-only zoom (one of the mechanisms the Understanding of
  WCAG 1.4.4 Resize Text names): px lengths stay, so clipped, truncated or overlapping text
  shows (failure F69). Icons keep their size: glyphs of the icon font (`--font-icon-family`)
  are sized by dimension tokens, not text sizes.
- The playground edits a `list` property as JSON in a textarea (invalid JSON keeps the last
  valid value and sets `aria-invalid`); examples pass list values to it as JSON in the query.
- For a build under a subpath, set `SITE_BASE=/<path>` at build time; links use
  `import.meta.env.BASE_URL`. The site is never deployed from this repository (`agents/git.md`
  "No deployment").

## Dev server: pre-bundled client dependencies

Vite discovers the dependencies of client scripts only when a page first requests them. It then
re-optimizes and leaves open pages requesting stale hashes (`504 Outdated Optimize Dep`): their
script never runs (the anatomy stops reacting to hover, the playground stops updating).
`astro.config.mjs` lists every client-side dependency in `vite.optimizeDeps.include` so they are
bundled at startup: `@component-anatomy/core` (Anatomy) and the Shiki modules of
`src/lib/highlight.ts` (transformers included) (imported dynamically by the playground). When a client script imports a
new package, or `highlight.ts` a new grammar or theme, add it there too.

## Dev server: reloading the sibling sources

The site reads its data outside Vite's module graph: the collections
(`../../packages/components/specs`, `./content`), and through `fs` the tokens, the accessibility
and platform registries, `AGENTS.md` and `agents/`. Two things kept `pnpm dev` from showing
edits to them:

- Astro's content layer keeps the watcher it was created with. An edit to `astro.config.mjs`
  restarts the Vite server in place with a new watcher, and the collections stopped reloading
  until `pnpm dev` was restarted.
- `src/lib` cached the tokens and the registries in module variables for the lifetime of the
  server.

`integrations/repo-sources.mjs` fixes both. `astro:server:setup` runs again on every restart,
so it watches the sources on the current watcher, and on any change bumps a generation that
`memo()` in `src/lib/repo.ts` compares against, re-syncs the content layer and reloads the
browser. Cache any value derived from repository files through `memo()`, never in a module
variable. When the site starts reading a new directory outside `apps/docs/` (not through an import),
add it to `SOURCES` in the integration (as a `PATHS` entry of `scripts/lib/paths.mjs`).
