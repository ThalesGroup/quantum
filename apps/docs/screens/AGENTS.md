# apps/docs/screens/ — real-world screens built with the design system

A **screen** is a real-world page (a login page, an application shell, a dashboard) taken from an
open-source project whose licence allows it, and rebuilt **only with the components and tokens of
this design system**. Screens serve three purposes:

1. **Integration test.** Components that work alone can clash when combined: spacing, alignment
   of heights across controls, typography, density, focus order.
2. **Backlog.** Each screen lists the gaps it hit: what the system lacks to render the original
   as it is, with the issues tracking them when some exist.
3. **Showcase.** The site's **Screens** tab shows the system on pages people recognise.

```
apps/docs/screens/sections.json                    sections of the Screens sidebar, in order (id, name, description)
apps/docs/screens/<source>/source.json             where the screens of a source come from: project, url, repository,
                                                   commit, licence (id, name, url, copyright, file), changes shared by every screen
apps/docs/screens/<source>/LICENSE.md              the source's licence text, verbatim, from the recorded commit
apps/docs/screens/<source>/<block>.screen.mjs      export const meta + export function render() -> HTML string
apps/docs/screens/<source>/data/*.mjs              sample data several screens of the source share (navigation trees…)
apps/docs/screens/lib/ds.mjs                       the design system as screens consume it: every component template (imported from
                                                   packages/components/src/components/<id>/<id>.template.mjs) and the escaping helpers
                                                   (packages/components/src/lib/template-utils.mjs), screen(), slot(), el(), link()
apps/docs/screens/lib/auth.mjs                     authentication building blocks (brand, fields, separators, hints)
apps/docs/screens/lib/shell.mjs                    application shell building blocks (shell, sidebar, nav groups, identity rows, header)
apps/docs/screens/screens.css                      layout of every screen: semantic tokens only, scr-* classes, container queries
```

## A screen module

```js
import { ds, screen } from '../lib/ds.mjs';

export const meta = {
  block: 'login-03',                      // = the file name, = the block id in the source
  name: 'Login with a muted background',  // shown in the sidebar
  section: 'login',                       // an id of sections.json
  description: 'A login page with a muted background color.', // the source's own description
  changes: ['…'],                         // what this screen changes from the original (beyond source.json changes)
  gaps: [{ text: '…' }],                  // what the design system lacks to render it as the original ({ text, issues? }: issues = numbers of the repository's issue tracker, optional)
};

export function render() {
  return screen({ class: 'scr-auth', 'data-layout': 'centered' }, /* components and layout */);
}
```

- `render()` is a pure function (Node and browsers), returns `screen(…)` (the `scr-viewport`
  root whose container queries the layout reads) and renders **every component through its
  template** (`ds.button(…)`, `ds.textField(…)`…), which `lib/ds.mjs` imports by relative path from
  `packages/components/src/components/<id>/<id>.template.mjs` (not published). A `ds-*` class is never written by hand.
- Ids are explicit and unique in the page (`<block>-email`, `<block>-user`): templates number
  their instances otherwise, and a Dropdown needs an id for its popover.
- Content inside a component that has no part for it (a form inside a Card) goes through
  `slot(componentHtml, content)`, a shim listed as a gap until the component gets a content part.
- Patterns without a component yet (sidebar navigation, collapsible groups, tabs, tables,
  calendars, charts, links) are native HTML laid out by `screens.css` on semantic tokens, and
  listed in `meta.gaps` (with the issues tracking them when some exist). Never a look-alike of a control a component covers: a
  native button, input, select, checkbox… is that component (`pnpm validate` errors otherwise).
- No script. Native HTML for behaviour (`<details>`, `popover` through the Dropdown, forms with
  `required`). What needs script in the original (collapsing a sidebar, toasts, drag and drop,
  sorting, client-side pagination) is dropped or simplified and said in `meta.changes`.
- Structure and content come from the original; its visual design does not (no Tailwind classes,
  no Geist, no images or logos). Icons are remapped to Material Symbols ligature names.
- Accessibility follows the components' contracts and `agents/accessibility.md`: one `h1` per
  page where the original has a page heading (a visually hidden one, `scr-sr`, names a content
  region that only shows placeholders), landmarks (`nav` with an `aria-label`, `main`,
  `header`), labelled fields, unique ids, decorative pictures `aria-hidden`. Data drawn as a
  picture (charts) has a text alternative.

## screens.css

- **Semantic tokens only** for colors, typography, radii, border widths, spacing (`--space-*`),
  shadows (`--effect-shadow-*`), motion and the focus ring. No literal color or font value, no raw
  or component token. Layout lengths that no token expresses (column widths, `rem` breakpoints)
  stay literal. `--scr-*` variables hold layout constants or data passed through a `style`
  attribute (a chart value), nothing else.
- **Layout only.** No selector names a `ds-*` class: screens lay components out, they never
  restyle them. A look the components cannot give is a component or token decision (root
  `agents/workflow.md`), recorded as a gap meanwhile.
- **Container queries**, never media queries for layout: `@container screen (min-width: …)`, so a
  screen adapts to the frame the site shows it in. `prefers-reduced-motion` overrides any
  transition.
- Every `scr-*` class a screen renders is defined here (`pnpm validate` lists unknown ones).

## Provenance and licence

Every source directory has a `source.json` and its licence file, copied verbatim from the source
repository at the recorded commit. The site shows, on every screen, where it comes from (the
original, its code at the commit) and its licence and copyright, and renders the full licence
text on **Screens → Sources and licences**. A new source needs a licence that allows reuse and
adaptation (MIT, Apache 2.0, CC BY, CC0, OGL…): copy its notice and text as the licence requires.

## Screens follow the design system

Screens are consumers of the design system, like the docs site. **When a component or a token
changes, the screens using it are part of the change** (`agents/workflow.md` and `agents/impact.md`):

- `pnpm impact` lists every screen rendering a changed component, every screen whose components
  alias a changed token, and every screen when `screens.css`, `apps/docs/screens/lib/` or a template helper
  changes.
- A changed template API (a renamed or removed property, option or part) is applied to every
  screen calling it in the same change; `pnpm validate` renders every screen and fails when one
  breaks.
- A component that fills a gap (a new Link, Tabs, Table, a Card content part) replaces the
  screen's native stand-in in the same change, and the gap leaves `meta.gaps`. When the last gap
  of an issue disappears, say it in the issue.
- Look at the screens using what changed on the site (Screens tab, every frame width, every
  mode) before reporting the change.

## Checks (`pnpm validate`, `scripts/lib/screens.mjs`)

`sections.json` (unique kebab ids, names, descriptions); every source has `source.json` (id = its
directory, https links, the commit, the licence with its copyright and an existing licence file,
shared changes); every screen exports `meta` (block = file name, a known section, `changes`,
`gaps` as `{ text, issues? }` entries, the issue numbers optional) and `render()`, which renders without error; the HTML starts with the
screen root, has unique ids, no literal color in attributes, `style` attributes that only pass
`--scr-*` values, only `ds-*` and defined `scr-*` classes, and no native control a component
covers outside that component; no `ds-*` class written by hand in `apps/docs/screens/**/*.mjs`;
`screens.css` reads semantic tokens only and never selects a `ds-*` class. A section without a
screen warns.
