---
foundation: typography
title: Typography
summary: The font families and their size and weight scales from the Figma library, plus the line heights and letter spacing components set their text with.
order: 2
---

## Overview

Typography is a set of scales. The Figma library gives three families (heading, body, mono), with a
size and a weight scale for each. It has no line height or letter spacing: three line heights
(compact 1, tight 1.2, normal 1.5) and the letter spacings (normal 0, and tight steps for the
Button label) are the design system's additions, kept apart in `tokens/additions/`. There are no text styles on top of them.

## Setting text

A component writes its typography as one composite in its own tokens: a family, a size and a
weight from one family's scales, a line height and a letter spacing. The Accordion title,
for instance, is `body.family`, `body.size.md`, `body.weight.medium`, `font.line-height.tight`
and `font.letter-spacing.normal` at the medium size. Labels inside controls use the body family
at medium weight and the tight line height, one body size per control size; running text uses
the regular weight and the normal line height. Never mix two families in one composite.

The Button label is set as in its Figma prototype: the compact line height (1) and a slightly
negative letter spacing (`font.letter-spacing.tight.*`: −2 % of the text size at the two
smaller sizes, −3 % at 16 px), written in px since the token format has no unit relative to
the font size. Every other component keeps the tight line height and the normal letter spacing.

## Families

Inter sets headings and body text, Fragment Mono sets code. The Figma library names each family
alone, without a generic fallback, and the tokens keep it that way: if a font fails to load,
the platform's default font takes over.

### Web

A web implementation loads the families from Google Fonts, as the reference implementation's
`packages/components/src/fonts.css` does. Inter is variable, so every weight comes
from one file; Fragment Mono has a single regular weight.

### iOS

Headings and body text use the system font (SF Pro) through the iOS token overlay. Sizes,
weights and line heights do not change: only the family does, and every component follows
because it aliases the family.

### Android

Headings and body text use Roboto through the Android token overlay, with the same sizes,
weights and line heights.

## Scales

The Overview draws every raw size and weight in its own family, and every line height and
letter spacing. Not every step is used today: the larger heading sizes are there for display
text a product may need.

Sizes are written in px, the unit of the token format: iOS reads them as points and Android as
density-independent pixels.

## Accessibility

- **Text grows.** People must be able to resize text up to 200% without losing content or
  functionality ([WCAG 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)).
  Components therefore take a minimum height, never a fixed one: a larger label makes them
  taller instead of clipping it.
- **Spacing can be overridden.** People who need more space between lines, paragraphs, letters
  or words override the tokens' values; nothing may clip or overlap when they do
  ([WCAG 1.4.12 Text Spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)).
  The criterion does not ask authors to use those values, but running text already has the
  1.5 line height it names.
- **No light weights.** Thin weights are hard to read, especially small; the lightest text
  weight is regular
  ([Apple HIG: Typography, ensuring legibility](https://developer.apple.com/design/human-interface-guidelines/typography#Ensuring-legibility)).
- **Contrast does not depend on size.** Every text color must reach 4.5:1, the minimum for
  normal text, so no text relies on the large-text exception
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html));
  the Color foundation computes the ratios. The Figma library's error colors fall short in a few
  states.
- **Dynamic Type on iOS.** The system font supports Dynamic Type; layouts must adapt to every
  text size, including the larger accessibility sizes
  ([Apple HIG: Supporting Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography#Supporting-Dynamic-Type),
  [Accessibility, vision](https://developer.apple.com/design/human-interface-guidelines/accessibility#Vision)).
  A product that brings back a custom font on iOS must make it scale with Dynamic Type and
  respond to Bold Text like the system font
  ([Apple HIG: Using custom fonts](https://developer.apple.com/design/human-interface-guidelines/typography#Using-custom-fonts)).

## Related

- Color: the text colors and their contrast.
- Spacing and sizing: the control heights the label sizes go with.
- Iconography: the icon font, set apart from the text families.
- Platforms: the iOS and Android overlays that change the families.
