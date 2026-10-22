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
