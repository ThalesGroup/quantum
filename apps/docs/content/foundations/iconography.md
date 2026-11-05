---
foundation: iconography
title: Iconography
summary: The icon font, the one style every icon is drawn in, its sizes and colors, and when an icon needs a name.
order: 7
---

## Overview

Icons are glyphs of **Material Symbols Outlined**, an icon font. A component names an icon by
its ligature name, `arrow_forward` or `delete`, and the font draws the glyph. Any name from the
Material Symbols set works; the Overview shows the ones the component examples use.

Material Symbols is a variable font with four axes: fill, weight, grade and optical size. The
system fixes them once, as the `font.icon.*` tokens (the design system's additions: the Figma library
has no icon tokens), so every icon in every component has the same style: outlined, light
weight, normal grade, drawn for 24 px. Components alias those tokens and never pick an axis
value of their own.

The optical size is the size a glyph's strokes and details are drawn for. The system keeps a
single one for every size, from 16 to 40 px: each glyph has one drawing, and the font is a
single file. Of the values with a file of their own, 24 draws every icon, simple or detailed,
slightly better than 20 for the same download; matching each size, or a single 32, would load
the whole variable font, twice as heavy.

## Size and color

- **Size** comes from the size scale (Spacing and sizing), and the glyph fills a square of
  that size. In a control, it goes with the label: each control size picks its icon size in
  the component's tokens. On its own, next to text, an icon takes the size of that text; the
  largest sizes stand alone, as the glyph of an empty state or in place of a picture.
- **Color** follows the text: an icon takes the color of the label next to it, or the icon role
  of its context (`global.icon.*`, which aliases that text color). It changes with the
  emphasis, the intent, the state and the mode.

## With or without a label

| Situation | What the icon is | What it needs |
| --- | --- | --- |
| Next to a visible label (button with an icon) | A decoration repeating the label | Hidden from assistive technology. The label alone must make sense. |
| Alone in a control (icon button) | The only visible content | The control carries a name describing the action ("Delete project", not "Trash"). Pick a symbol people recognise for that action. |

### Web

The glyph is written as its ligature name in the HTML, so the element carries
`aria-hidden="true"`; otherwise a screen reader reads "arrow_forward" with the label.
The reference implementation's `packages/components/src/fonts.css` requests only the instance
with the fixed axes, and loads it with
`display=block` so the ligature names never flash as text while the font loads.

### iOS

Icons that carry meaning grow with the text when people raise the text size.

### Android

A decorative icon gets a null content description; an icon that is the only content of an
action gets a description naming the action.

## Accessibility

- **Decorative or named.** Non-text content that is pure decoration is hidden from assistive
  technology, and a control made only of an icon has a name that describes its purpose
  ([WCAG 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html),
  [WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)).
- **3:1 when it carries meaning.** An icon is non-text content: when it is needed to understand
  the content, it contrasts 3:1 with its background
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
  [symbolic characters](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#symbolic-or-graphical-text-characters)).
  Icons take the icon role of their context, which has the value of the text next to them
  (Color foundation). Since the Figma library's POC2 export that text reaches 4.5:1 everywhere;
  the one icon role under 3:1 is the warning icon on the page in light mode (1.54:1, a known
  issue of the Color foundation).
- **Icons complement color.** Apple suggests distinct shapes or icons in addition to color to
  show differences in function and state
  ([Apple HIG: Accessibility, vision](https://developer.apple.com/design/human-interface-guidelines/accessibility#Vision));
  color alone never carries the meaning
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- **Hidden on the web.** `aria-hidden="true"` removes the glyph from the accessibility tree, and
  a hidden node adds nothing to the name of its control
  ([WAI-ARIA: aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden),
  [AccName: hidden, not referenced](https://www.w3.org/TR/accname-1.2/#comp_hidden_not_referenced)).
- **Larger with the text on iOS.** Meaningful icons should grow as the font size increases
  ([Apple HIG: Supporting Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography#Supporting-Dynamic-Type)).
- **Content descriptions on Android.** Graphic elements get a content description, or null when
  they have no meaning
  ([Compose: graphic elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#graphic-elements)).

## Related

- Spacing and sizing: the size scale icons take their sizes from.
- Typography: the text families, separate from the icon font.
- Icon: an icon on its own, in five sizes.
- Button, Icon button, Dropdown: the components drawing icons.
