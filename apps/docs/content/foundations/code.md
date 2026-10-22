---
foundation: code
title: Code
summary: The syntax highlighting colors of code, one per category, readable on every surface in every mode.
order: 9
---

## Overview

Documentation, token tables, playgrounds and developer tools show code. Highlighting helps
people scan it: keywords, names and values stand apart at a glance. Left to each tool, it would
come from a third-party theme with its own palette, which ignores the system's colors and modes
and is rarely checked for contrast.

This foundation makes highlighting a decision of the system. It names the **categories** of
code that get a color, gives each one a semantic color in every mode, and checks every color
against every surface. The type of code (the mono family and its sizes) belongs to the
Typography foundation; this page is about color only.

## Categories

Seven categories, the Figma library's code colors (`global.text.code`). Each one is a family of things a reader
looks for, not a grammar detail:

| Category | What it colors | Why it stands out |
| --- | --- | --- |
| Keyword | Language keywords, storage modifiers, markup tag names, CSS at-rules and pseudo-classes | The structure of the code: where a block, a declaration or an element starts. |
| Variable | Variables, parameters, properties and object keys, CSS properties and custom properties, markup attributes, YAML keys | The names the code reads and writes. |
| Function | Function and method names, CSS functions | What the code does. |
| Class and type | Classes, types, built-in objects, CSS class and id selectors | What things are. |
| String | Strings, regular expressions, attribute values | Literal content, often what a person edits. |
| Number | Numbers and language constants (`true`, `null`, CSS units and keywords) | Literal values. |
| Comment | Comments | Notes for people, set apart from what runs. |

Everything else keeps the primary on-base text color: identifiers a grammar does not classify,
operators and punctuation. Seven colors are enough to read structure; more would turn
highlighting into noise and make each color harder to keep readable.

### Beyond syntax

Some code is not about syntax. The design system adds five text colors for it, picked from colors
it already has (they are not in the Figma library yet):

| Color | What it colors | Hue |
| --- | --- | --- |
| Inserted, deleted, changed | The lines of a diff: added, removed, changed (context diffs) | Success, error, severe, as anywhere else in the system |
| Invalid | Code a grammar marks invalid or deprecated, such as a missing comma in JSON | Error |
| Link | URLs and links, in Markdown or in comments | Brand, like links in text |

A diff line still starts with its `+`, `-` or `!`, so the color repeats what the text says.

Markup reuses the seven categories instead of adding colors: a heading or a list marker is a
keyword, a quote a comment, inline code a string. Bold and italic stay plain: their `**` and `_`
already show them.

## Marked lines

An example can point at whole lines: a line to look at (highlighted), lines it adds or removes,
a line in error or with a warning. Each state has a background, a subtle fill of the matching
hue, and a **marker** that does not need color: a bar on the side of a highlighted line, `+` and
`-` before inserted and deleted lines, `×` and `!` before errors and warnings. The backgrounds
are faint on purpose, so every syntax color stays readable on them; the marker is what tells the
states apart.

A marker says *that* a line matters, not *why*. The text around the example says what changed or
what the error is, and the example's description does too.

## On every surface

A block of code is a surface like any other. By default it is a level 1 surface raised on the
page; inside a panel or a menu it takes the level of the area around it. Every color is checked
against every surface level and sunken, in every mode and on every platform, so a block can sit
anywhere. The computed ratios are on the Specification section of this page.

Where the Figma library picked a step that does not reach the minimum on a surface, the color moved
to the nearest step of the same hue that does: the hue, and with it the category, stays
recognizable. These are the only code colors that differ from the Figma library.

## Modes

Each category has a light and a dark value. Light mode uses the dark steps of each hue, dark
mode the light ones. Nothing that highlights code mentions a mode: it names a category, and the
mode picks the color. The colors are semantic tokens, so every platform receives them in every
mode; a highlighter of any platform maps its own categories to them.

### Web

`pnpm tokens:build` writes `@quantum-ds/tokens/shiki-theme.json`, a theme for
[Shiki](https://shiki.style) generated from the code tokens and the scope mapping in
`packages/tokens/tokens.config.json` (`syntax`). Its colors are the CSS variables of the tokens, so a single
theme follows the `data-theme` of every context, with no light and dark pair to switch. The page
must load the design system's token CSS (`@quantum-ds/tokens/css/index.css`).

```js
import { createHighlighter } from 'shiki';
import theme from '@quantum-ds/tokens/shiki-theme.json' with { type: 'json' };

const highlighter = await createHighlighter({ themes: [theme], langs: ['css', 'html', 'javascript'] });
const html = highlighter.codeToHtml(source, { lang: 'css', theme: theme.name });
```

Astro, VitePress and other tools built on Shiki accept the same theme object. The mapping is
written for CSS, HTML, JavaScript, JSON, shell, YAML, diff and Markdown; a new language may need
new scopes in `packages/tokens/tokens.config.json`, never a new color.

Marked lines use Shiki's notation transformers (`@shikijs/transformers`:
`transformerNotationHighlight`, `transformerNotationDiff`, `transformerNotationErrorLevel`): a
`[!code highlight]`, `[!code ++]`, `[!code --]`, `[!code error]` or `[!code warning]` comment at
the end of a line marks it and disappears from the output. A web implementation draws the marked
lines from the `global.bg.code.*` tokens, as the reference implementation's
`packages/components/src/foundations/code.css` does. Its markers carry alternative text (Added, Removed, Error, Warning) for assistive technologies.

## Building with it

- Highlight code with the system's colors, never with a third-party theme: on the web, with the
  generated Shiki theme.
- Set code in the mono family. Highlighting changes the color only, never the font.
- Put a block of code on a surface token, never on a color of its own: the contrast is only
  guaranteed on the surfaces and the line backgrounds.
- Inline code sits on the neutral subtle fill; line numbers, when a block shows them, use the
  tertiary text color. Neither needs a code color.
- Mark only the lines the explanation talks about, and say in the text why they are marked.
- Do not give a category a meaning beyond the code. An error in a code sample is said in words
  next to it, not by a color.

## Accessibility

- **Code is text.** Every code color, comments, diff and link colors included, reaches 4.5:1
  against every surface and every line background in every mode, like any other text
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
  Comments are not faded: people read them.
- **Color is a help, not the information.** The categories are already visible in the code
  itself (a keyword is a keyword in any color), so highlighting conveys nothing the text does not
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- **Marked lines have a marker.** A bar, `+`, `-`, `×` or `!` shows the state of a line without
  color, so it holds in forced colors mode too
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- **And the text says why.** Markers are generated content: they carry alternative text, but
  some assistive technologies do not announce generated content
  ([MDN: content, alternative text](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content#alternative_text_string_counter_attr),
  [accessibility](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content#accessibility)).
  What a marked line means is therefore also written in the text around the example
  ([WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)).
- **Forced colors.** In forced colors mode the browser replaces text and background colors with
  system colors, so code shows without highlighting and stays readable
  ([MDN: forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors#properties_affected_by_forced-color_mode)).

## Related

- Typography: the mono family and its sizes.
- Color: the surface levels code blocks sit on, and the primary text color of plain code. Its
  specimens list the code colors among the text roles; this page specifies them.
- Modes: the same tokens in another context.
