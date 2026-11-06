---
component: icon
title: Icon
summary: A glyph of the system's icon set, decorative or named.
order: 31
---

## Overview

An icon draws one glyph of the icon set (Material Symbols, the Iconography foundation) at a
size and in a color of the system. Next to text it is decoration and says nothing to assistive
technology; alone, it must be named by what it means, and is then exposed as an image. Icons
inside other components (buttons, alerts, selects) are those components' parts; this
component is for icons a product places in its own content.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Reinforcing a label or a heading with a glyph (decorative).
- Showing a status or a type in a table cell or a list, named by its meaning.

## When not to use

- **An icon that performs an action.** Use an Icon button.
- **An icon that replaces a label people must read.** Write the label.

## Sizes and colors

Next to text, an icon takes the size of that text, so the glyph and the letters read as one
line. The two largest sizes stand alone: above the heading of an empty state, or in place of a
picture that is not there.

| Size | Use for |
| --- | --- |
| Small | Next to body text: 16 px (also with 14 px text). |
| Medium | Default. Next to large body text and extra small headings: 20 px. |
| Large | Next to small headings: 24 px. |
| Xlarge | Next to medium headings, and the glyph of an empty state: 32 px. |
| Xxlarge | A glyph standing in for a picture, a cover or a placeholder: 40 px. |

Every size draws the same glyph, made for 24 px (the Iconography foundation's single optical
size), so an icon keeps one look from 16 to 40 px.

The sizes are those at the default text size. When people raise the text size, the icon grows
with it: next to text it keeps the size of that text, and a named icon standing alone grows
with the text around it.

By default the icon takes the color of the text around it. The other colors are the system's
icon roles: neutral (quieter than the text), brand, success, warning, error, info. A color
never carries the meaning alone.

## On a colored fill

The colors are made for the surface levels: the page, a card, a popover. When the icon sits on
a colored fill of the system, an accent, subtle or sunken fill, set the surface to that fill
and pick the color of the fill's hue: a success icon on a subtle success fill, a neutral icon
on the neutral accent fill. The icon then takes the icon color the system made for that fill,
which can differ from the color of the text on it (the warning icon on a light sunken fill).
There is no neutral sunken fill.

An icon of another hue than its fill (a success icon on a brand fill) has no color of its own:
the system does not pair them. Use the fill's hue, or the current color, which takes the text
color of the fill.

## Content

- A named icon's label says its meaning (**Warning**, **Verified**), never the glyph's name.
- Use the same glyph for the same meaning everywhere in a product.
- Pick the glyph for what it means. In a right-to-left language a directional glyph flips, as the
  Iconography foundation lists them: `arrow_back` for going back points to where the reading
  started. For a real direction, which never flips, take `east` or `format_align_right`.

## Accessibility

The Specification tab lists the full accessibility contract. Each statement there links the
source it comes from. This section explains the decisions behind it.

- **Decorative unless named, on every platform.** Next to text that says the same thing, the
  icon is pure decoration and is hidden; standing alone, it has a text alternative naming what
  it means, not what it looks like, and is exposed as an image. Every platform carries this
  through its own accessibility services, so the contract names no platform API: outside the
  web, the platforms' guidelines say to name or hide an image, but not which trait or role it
  takes
  ([WCAG 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WAI tutorial: Decorative images](https://www.w3.org/WAI/tutorials/images/decorative/),
  [WAI tutorial: Informative images](https://www.w3.org/WAI/tutorials/images/informative/),
  [WAI tutorial: Functional images](https://www.w3.org/WAI/tutorials/images/functional/)).
- **Contrast for named icons.** A named icon is a graphical object and needs 3:1 against the
  surface. Every color option passes on every surface level and on its own colored fill, hover
  and active fills included, in both modes, except warning in light mode: the Figma library's
  POC2 export set the warning icon role to warning 300, the step that fixed dark mode (1.54:1 on
  the page, 1.26:1 on the sunken warning fill), a known issue of the Color foundation. The Icon
  keeps the library's value until the library fixes it, rather than departing from it; until
  then, pair a warning icon with text. `current` inherits the contrast of the text around it:
  every text role of the system reaches 3:1 on the surface levels (4.24:1 at the lowest, and
  3.13:1 for disabled text), so a named icon in `current` does too
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#graphical-objects),
  [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- **Larger with the text.** Resize Text covers text, not icons, but people who need larger text
  need the icons that carry meaning just as much, so the icon grows with the text
  ([WCAG 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html#intent)).

### Web

- The implementation renders the glyph as its ligature name in a `<span>`: with
  `aria-hidden="true"` when decorative (the ligature name would otherwise be read as text),
  with `role="img"` and `aria-label` when named
  ([WAI-ARIA: aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden),
  [WAI-ARIA: img role](https://www.w3.org/TR/wai-aria-1.2/#img),
  [MDN: img role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/img_role),
  [WAI-ARIA: aria-label](https://www.w3.org/TR/wai-aria-1.2/#aria-label)).
- Text and icons are px lengths today: zoom enlarges both together, which meets Resize Text,
  and a browser's text-only size setting changes neither. When the text follows that setting,
  the icon follows it too
  ([G142](https://www.w3.org/WAI/WCAG22/Techniques/general/G142),
  [MDN: absolute length units](https://developer.mozilla.org/en-US/docs/Web/CSS/length#absolute_length_units)).

### iOS

- Give a meaningful icon an alternative text label for VoiceOver, describing only the
  information it conveys; exclude a purely decorative icon from VoiceOver
  ([Apple HIG: Icons](https://developer.apple.com/design/human-interface-guidelines/icons),
  [Apple HIG: VoiceOver, descriptions](https://developer.apple.com/design/human-interface-guidelines/voiceover#Descriptions)).
- A meaningful icon grows with Dynamic Type, up to the larger accessibility sizes; where an
  icon in a row crowds its text, stack the text above it
  ([Apple HIG: Supporting Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography#Supporting-Dynamic-Type)).

### Android

- Pass `null` as the content description of a decorative icon, or hide it with
  `hideFromAccessibility`; describe a meaningful one by its purpose
  ([Jetpack Compose: graphic elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#graphic-elements),
  [Jetpack Compose: hide semantics](https://developer.android.com/develop/ui/compose/accessibility/merging-clearing#hide-semantics),
  [Android accessibility: describe each UI element](https://developer.android.com/guide/topics/ui/accessibility/apps#describe-ui-element)).

### Desktop

- On macOS, VoiceOver asks the same as on iOS: label a meaningful icon with the information it
  conveys, exclude a purely decorative one
  ([Apple HIG: VoiceOver, descriptions](https://developer.apple.com/design/human-interface-guidelines/voiceover#Descriptions),
  [platform considerations](https://developer.apple.com/design/human-interface-guidelines/voiceover#Platform-considerations)).
- On Windows and Linux, a native app exposes a named icon's role and name through the
  platform's accessibility services and leaves a decorative one out, as EN 301 549 asks of
  any native software with a user interface
  ([EN 301 549 V3.2.1, clauses 11.1.1.1.1, 11.5.2.3 and 11.5.2.5](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=79)).
- macOS has no Dynamic Type: the icon keeps its size there, like the text
  ([Apple HIG: Typography, macOS](https://developer.apple.com/design/human-interface-guidelines/typography#macOS)).

## Related

- Icon button (an icon that performs an action)
- Avatar (an identity image)
