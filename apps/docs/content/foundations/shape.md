---
foundation: shape
title: Shape
summary: "Corner radii and stroke widths: how round components are and how thick their borders are."
order: 4
---

## Overview

Shape is two scales. **Corner radius** goes from sharp (`none`) to large rounded corners
(`2xl`), plus `full` for pill ends. **Stroke width** goes from no border to the strong stroke
of the focus ring. Both come from the Figma library (Dimension), as they are, and components and the
docs site read them directly: there is no semantic layer on top of them.

## Radius

Each component picks its radius from the scale in its own tokens:

| Where | Step | Why |
| --- | --- | --- |
| Controls, extra small and small | `corner-radius.2xs` (2 px) | Tighter corners at smaller sizes: the radius follows the control size. |
| Controls, medium and large | `corner-radius.xs` (4 px) | |
| Dropdown menu, panels | `corner-radius.sm` (8 px) | Surfaces are rounder than the controls on them. |
| Pills, badges | `corner-radius.full` | Fully round ends. |

A rounded component keeps the same radius in every emphasis and state. Its focus ring follows
that radius (Focus ring foundation).

## Stroke

Every border today, on controls, dividers and the outline of surfaces, is the hairline
`stroke-width.sm` (0.6 px), at every size.

The medium stroke (an emphasis border) is unused today; the strong
one is the focus ring's.

A component keeps the same border width in every variant. A variant that shows no border, such
as the ghost button, draws a transparent one: switching variants or states never moves the
content by a pixel.

### Web

Browsers snap border and outline widths to whole device pixels, so the sub-pixel strokes (0.6
and 1.2 px) look thinner or thicker than written depending on the screen density. Review
borders on both a standard and a high-density screen.

## Accessibility

- **Shape is not a name.** Instructions never point at a component by its shape ("press the
  round button"): people who cannot see it, or use a screen reader, need its name or label
  ([WCAG 1.3.3 Sensory Characteristics](https://www.w3.org/WAI/WCAG22/Understanding/sensory-characteristics.html)).
- **A border that identifies needs 3:1.** Whatever its width, a border that is the only thing
  showing where a component is must contrast 3:1 with the surface; a component identified by its
  label or icon needs no visible border
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
  [boundaries](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries)).
  The Color foundation measures the border colors.
- **Borders and outlines, not shadows.** On the web, forced colors mode repaints border and
  outline colors with system colors but removes box shadows
  ([MDN: forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors#properties_affected_by_forced-color_mode)):
  an edge or a focus indicator drawn with a shadow would disappear.

## Related

- Focus ring: the strong stroke and the ring that follows the component's radius.
- Color: the border colors and their contrast.
- Elevation and effects: why shadows never replace a border.
