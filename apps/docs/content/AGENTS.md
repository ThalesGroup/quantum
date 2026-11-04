# apps/docs/content/ — component and foundation guidelines

One Markdown file per component: `components/<id>.md`. Rendered on the component page of the
site under "Guidelines", after the live examples and before the generated specification.

One Markdown file per foundation: `foundations/<id>.md`, frontmatter `foundation: <id>` (must
equal the foundation spec id) and `title`. Rendered on the foundation page. Same content rules
as below: platform sub-headings, a required sourced `## Accessibility` section whose WCAG links
are cited by the foundation spec. Recommended sections: Overview, what it looks like, when it
applies, platform differences, building a component that follows it, Accessibility, Related.
`order` sorts the foundations in the sidebar and the Foundations list. The page draws the
tokens itself (the spec's `specimens`): explain the scales and roles, do not list their values.
Quote any frontmatter value that contains `: `.

## Blueprint

Each component also has `components/<id>.blueprint.json`: the sketch the site draws in the head
of its platform pages and as its thumbnail in the component list, on blueprint paper. It tells
the component apart at a glance ("oh, it's this one"), it never shows how the component looks:
no tokens, no real sizes, no words.

```json
{
  "size": [13, 2],
  "parts": [
    {"box": [0, 0, 6, 2], "fill": true},
    {"text": [1, 1, 4], "strong": true},
    {"box": [7, 0, 6, 2]},
    {"text": [8, 1, 4]}
  ]
}
```

- It is drawn like a circuit board: parts placed on a grid of cells, flat (no shadow, no depth).
  `size` is the drawing in whole cells; each part names one piece and its place in cells, from the
  top left corner, in whole or half cells. `scripts/lib/blueprint.mjs` draws it as one SVG in
  screen pixels (10 px a cell in a thumbnail, 20 px in a page head), every outline a one-pixel
  hairline on a grid line, a label a thin solid bar; a part inside a solid box is drawn in white
  on the brand blue (the box itself edged in a darker blue), one on the paper (no box holds it, or a dashed one) in blue and neutral ink;
  `PIECES` there lists the pieces and their options, and `pnpm validate` checks every blueprint
  against it (and that every component has one).
- The pieces: `box` [x, y, width, height] (`fill`: hatched, the emphasised one; `dashed`: a
  placeholder; `radius`: `xs`, `pill`, `round`; `edge`: an accent bar; `outline: false`: a
  highlighted row), `text` [x, y of its middle, length] (a trace from a pad; `strong`: a label or
  a title; `soft`: a placeholder), `glyph` [x, y] (`name`, `size` in cells), `check` and `radio` [x, y]
  (a case of the grid, its outline the cell's; `on`), `switch` [x, y] (two cells; `on`), `track` [x, y, length] (`value`, `knob`), `ring` [x, y, size], `rule`
  [x, y, length], `media` [x, y, width, height], `via` [x, y].
- Use the grid: boxes two cells high with their text on the middle line (`"text": [x + 1, y + 1,
  …]`), a cell between parts in a row and between the rows of a group (the cases never touch), a
  label's text half a cell above its field. Show what makes
  the component recognisable: a filled and an outlined button, a label above a field, a checked
  and an unchecked box.
- Keep it within 15 × 8 cells, the thumbnail's room. Look at it on the component list and on a
  component page.
- When the shape of the component changes (a part added or removed, a new layout), redraw it.
  `pnpm new:component` writes a starter (a box with a line of text) to redraw.

## Frontmatter

```yaml
---
component: button      # must equal the spec id (validated)
title: Button
summary: One sentence.  # optional
order: 10               # optional, for future grouping
---
```

## Content rules

- Write for designers and developers deciding *whether* and *how* to use the component.
  Explain intent, hierarchy, trade-offs. Start at `##` (the page supplies the `h1`).
- Recommended sections: Overview, When to use, When not to use, Variants, Sizes (if any),
  States, Content, Accessibility, Related.
- Tables for variants/sizes/states are welcome, but describe **meaning and usage**; the exact
  option list, defaults and tokens are rendered from the spec automatically. When you add an
  option to the spec, add its row here too.
- Write for every platform. When a platform genuinely differs, put the difference under a
  `### Web`, `### iOS`, `### Android` or `### Desktop` sub-heading (exact names from
  `packages/components/specs/platforms.json`, validated) inside the section it belongs to; everything outside those
  sub-headings must hold everywhere. Do not create a platform section when nothing differs.
- The decision log lives in the spec (`decisions[]`) and is rendered on the Decisions tab. Do
  not copy it here: explain what a decision means for people using the component.
- Plain Markdown only (no MDX, no components). Astro 7 renders it with its native processor.
- Do not embed HTML examples; the site renders the spec's `examples[]` live.
- The `## Accessibility` section is required. It explains the decisions behind the spec's
  accessibility contract and links, inline, the trusted sources behind each explanation
  (`packages/components/specs/a11y/sources.json`; prefer WCAG Understanding pages and APG). Every WCAG criterion
  linked here must be cited in the spec. Never write an accessibility claim you have not read
  in a source.
- English, sentence case headings.
