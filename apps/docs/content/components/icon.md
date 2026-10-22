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

| Size | Use for |
| --- | --- |
| Small | Inline with small text: 16 px. |
| Medium | Default: 20 px. |
| Large | Headings and empty states: 24 px. |

By default the icon takes the color of the text around it. The other colors are the system's
icon roles: neutral (quieter than the text), brand, success, warning, error, info. A color
never carries the meaning alone.

## Content

- A named icon's label says its meaning (**Warning**, **Verified**), never the glyph's name.
- Use the same glyph for the same meaning everywhere in a product.

## Accessibility

The Specification tab lists the full accessibility contract. Each statement there links the
source it comes from. This section explains the decisions behind it.

- **Decorative unless named.** Next to text that says the same thing, the icon is pure
  decoration and is hidden; standing alone, it has a text alternative naming what it means,
  not what it looks like
  ([WCAG 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WAI tutorial: Decorative images](https://www.w3.org/WAI/tutorials/images/decorative/),
  [WAI tutorial: Informative images](https://www.w3.org/WAI/tutorials/images/informative/),
  [WAI tutorial: Functional images](https://www.w3.org/WAI/tutorials/images/functional/)).
- **Contrast for named icons.** A named icon is a graphical object and needs 3:1 against the
  surface. The system's icon roles pass, except the warning icon color in dark mode (2.14:1), a
  the Figma library limit tracked as a known issue; pair a warning icon with text
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#graphical-objects),
  [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).

### Web

- The implementation renders the glyph as its ligature name in a `<span>`: with
  `aria-hidden="true"` when decorative (the ligature name would otherwise be read as text),
  with `role="img"` and `aria-label` when named
  ([WAI-ARIA: aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden),
  [WAI-ARIA: img role](https://www.w3.org/TR/wai-aria-1.2/#img),
  [MDN: img role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/img_role),
  [WAI-ARIA: aria-label](https://www.w3.org/TR/wai-aria-1.2/#aria-label)).

### iOS

- Provide alternative text labels for custom interface icons; they let VoiceOver describe what
  is on screen ([Apple HIG: Icons](https://developer.apple.com/design/human-interface-guidelines/icons)).

### Android

- Pass `null` as the content description of a decorative icon; describe a meaningful one by its
  purpose ([Jetpack Compose: graphic elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#graphic-elements),
  [Android accessibility: describe each UI element](https://developer.android.com/guide/topics/ui/accessibility/apps#describe-ui-element)).

## Related

- Icon button (an icon that performs an action)
- Avatar (an identity image)
