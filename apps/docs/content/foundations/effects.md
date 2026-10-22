---
foundation: effects
title: Elevation and effects
summary: Opacity, blur, drop shadow and shadow colors from the Figma library, and why no component uses them yet.
order: 5
---

## Overview

The Figma library brings three kinds of effect: **opacity** steps, **blur** radii and a
**drop shadow** number, all raw primitives, and five **shadow colors** (`effect.shadow.1` to
`5`), mapped roles with a light and a dark value. No component uses an effect yet: this page
shows what is available and the rules any future effect follows.

The current components (button, icon button, dropdown) are flat: their states are color
changes and their edges are borders.

## What the system uses instead

- **Translucency is color.** The subtle neutral fills and the disabled colors are translucent
  neutral steps, composed by the Figma library from a palette step and an opacity step and written
  as the resulting color (Color foundation). They are color tokens with an alpha
  channel, measured for contrast over each surface, rather than an opacity applied to a whole
  element, which would fade its text too.
- **Elevation is surface and border.** A panel stands apart from the page by its surface level
  (Color foundation) and a divider-width border, not by a shadow.
- **Muted is a color.** Secondary and disabled text use the secondary, tertiary and disabled
  text colors, never an opacity.

## When an effect becomes necessary

A dialog over a backdrop, a toast, a menu that should look raised: the first component that needs
an effect adds a semantic token (for example an elevation level, or a backdrop blur), aliasing
these primitives, and this foundation owns it from then on. The decision states what the level
means and where it applies; the contrast and forced-colors rules below still hold.

The Figma library gives the shadow colors but no geometry: the drop shadow is a single number (0). A
real shadow needs a `shadow` composite (offset, blur, spread) built on those colors first.

## Accessibility

- **A shadow is not an edge.** WCAG treats a drop shadow as part of the adjacent color closest in
  brightness
  ([Understanding 1.4.11: adjacent colors](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#adjacent-colors)).
  A surface or a component that needs a visible boundary gets a border contrasting 3:1
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)).
- **Shadows vanish in forced colors.** On the web, forced colors mode sets box shadows to none
  ([MDN: forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors#properties_affected_by_forced-color_mode)),
  so nothing may depend on one being visible.
- **Measure what people see.** Contrast is measured against the background text is rendered
  over ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)):
  text over a translucent or blurred layer is measured against the layer composited over what
  lies behind it, and text is never faded with opacity to look secondary.

## Related

- Color: the composed translucent colors and the secondary, tertiary and disabled text colors.
- Shape: borders, the edges the system uses instead of shadows.
