---
foundation: spacing
title: Spacing and sizing
summary: The spacing scale and the element sizes from the Figma library, which components pick their paddings, gaps, heights and icon sizes from.
order: 3
---

## Overview

Two scales from the Figma library (Dimension) measure everything in the system:

- **Space** is the room inside and between elements: paddings, gaps, margins. It sits on a
  4 px grid, with a few finer steps (1, 2, 3, 5, 6, 7, 10 and 14 px) for optical adjustments.
  Each key is its value in px, so `space.12` is 12 px.
- **Size** is the dimension of an element: an icon, an avatar, an app icon. Its steps are
  numbered (`size.1` is 8 px, `size.10` is 128 px).

There is no semantic layer on top of them: components and the docs site read these scales
directly.

## Building with the scales

Each component picks its dimensions from the scales, per size, in its own tokens. The Button,
from extra small to large:

| Dimension | Steps |
| --- | --- |
| Inner padding | `space.6`, `space.8`, `space.12`, `space.16` |
| Gap between icon and label | `space.4` |
| Minimum height | `space.24`, `space.32`, `space.40`, `space.48` |
| Icon size | `size.2`, `size.2`, `size.3`, `size.4` |

A control takes a minimum height, never a fixed one: it grows when its content needs more. A
new component with sizes should pick the same steps for the same sizes, so a small button and a
small field line up.

## Platforms

### iOS

Lengths are read as points. The control heights are the same as on the web: the Figma library has
no platform values, so the extra small, small and medium controls are under the 44 pt hit
region Apple recommends (see Accessibility).

### Android

Lengths are read as density-independent pixels. The control heights are the same as on the
web, so the extra small, small and medium controls are under the 48 dp touch target Android
recommends (see Accessibility).

## Layout

There are no page layout tokens yet (page margins, section spacing, grid columns). Until a
decision names them, layouts pick from the spacing scale. The docs site does the
same with literal layout lengths, and will switch when layout tokens exist.

## Accessibility

- **24 px minimum target.** Every pointer target is at least 24 by 24 CSS pixels
  ([WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
  The extra small control height is exactly that minimum: no control may go below it. A
  component that has to be smaller relies on one of the criterion's exceptions (enough spacing
  around the target, for instance), stated and cited in its spec.
- **Heights grow with text.** Minimum heights, not fixed ones, keep labels from being clipped
  when people enlarge text up to 200%
  ([WCAG 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html)).
- **44 pt on iOS.** Apple asks for a hit region of at least 44 by 44 pt
  ([Apple HIG: Buttons](https://developer.apple.com/design/human-interface-guidelines/buttons#Best-practices),
  [Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).
  The extra small, small and medium controls (24, 32 and 40 pt) fall under it today: the
  overlay that raised them belonged to a semantic layer the Figma library does not have
 .
- **48 dp on Android.** Android asks for touch targets of at least 48 by 48 dp
  ([Android: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls),
  [Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes)).
  The extra small, small and medium controls fall under it today, for the same reason
 .

## Related

- Typography: the label sizes that go with these heights.
- Iconography: the icons drawn at the control icon sizes.
- Platforms: the overlays (font families only today).
- Button, Icon button, Dropdown: the components built on these dimensions.
