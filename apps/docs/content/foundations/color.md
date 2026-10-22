---
foundation: color
title: Color
summary: The palettes the system draws from and the mapped color roles every component paints with, in every mode.
order: 1
---

## Overview

Color in the system works in three layers, all recreated from the Figma library as they are. The
**palettes** are raw material: ramps of hues going from 25 (almost white) to 950 (almost
black). They say nothing about where a color goes. The **palette switch** is the neutral ramp
the roles read, so the whole neutral palette can change in one place. The **mapped roles**
are decisions: "the page", "a strong brand fill", "text on that fill", "a divider". Each role
picks a palette step, and picks again in dark mode.

Components only ever use roles. A button does not know it is painted in brand 600; it knows it
uses the brand accent fill, `global.bg.accent.brand.default`. That is what lets dark mode work
without touching a component, and what will let another neutral palette replace ash in a
single place.

The Figma library is kept with its errors and limitations on purpose: it is the starting point the
system evolves from, one decision at a time. Its error colors miss the contrast minimum in a
few places (see Accessibility). The few colors the design system adds live apart, in
`tokens/additions/`.

## Palettes

- **Neutral.** Ash and slate, a warm and a cool grey, each in a light ramp (light mode) and a
  dark ramp (dark mode).
- **Palette switch.** `light-switch.base.<step>` and `dark-switch.base.<step>` point to one
  neutral palette: ash today. Every neutral role reads them, never a neutral ramp directly.
  Slate will switch every neutral role at once when the system supports a second palette.
- **Brand.** The brand ramps, light and dark, plus the brand identity colors.
- **Functional.** Error, warning, success, info and severe: hues that carry a status.
- **AI, extended, branded extended.** Hues for AI-assisted features, categories, illustrations
  and data.

## Roles

Every role path reads the same way: what is painted, where, which family, which state.

| Role | Meaning | When to use it |
| --- | --- | --- |
| `global.bg.level` | The page (level 0), the surfaces raised above it (levels 1 to 3) and the plane recessed below it (sunken), with hover and active steps for surfaces people interact with. | Behind content. See Surface levels. |
| `global.bg.accent` / `subtle` / `sunken` | The fill of an emphasized element: a strong fill, a tint, a deeper tint, per family, with hover and active steps. | Accent for the one strong action of an area, subtle for secondary actions; a ghost element has no fill at rest. |
| `global.text` | On-base text on surfaces (neutral primary, secondary, tertiary, and one color per family), text on each fill (`on-accent`, `on-subtle`, `on-sunken`), code colors, disabled and skeleton. | Always pair a fill with its own text color, never with the on-base text. |
| `global.icon` | The same contexts as text. Each icon role aliases the text role next to it. | Icons, so they can diverge from text later without touching a component. |
| `global.border` | Level borders for surfaces (see Surface levels), base borders, and borders following the accent and subtle fills. | Never as the only edge of a component that has nothing else showing it is there (see Accessibility). |
| `global.bg.state` and friends | Disabled and skeleton. | Disabled is a state, not a family: an inactive component takes the disabled fill, border, text and icon whatever its emphasis and family. |
| `global.bg.transparency` | Fade (lightens what it covers) and overlay (darkens it), from none to blackout. | Behind a dialog, at the edge of a scrolling area. |
| Focus | The focus ring color. | Owned by the Focus ring foundation. |

**Families** say what the color means: neutral for most things, brand to draw the eye to the
main path, a functional hue for a status (error for destructive or failed things), an extended
hue for categories. **Emphasis** is how loud it is: accent, subtle or sunken. Pick the family
from the meaning, then the emphasis from the hierarchy of the area, never the other way round.

Some roles are **composed**: the Figma library builds them from a palette step and an opacity (the
subtle neutral fills, disabled and skeleton, transparency, the shadow colors). DTCG cannot
compose two tokens, so they are written as the resulting translucent color; their description
names the step and the opacity.

The Figma library marks its **AI** (`ai.bg`, `ai.text`, `ai.icon`, `ai.border`) and **data
visualization** (`dataviz`) roles as unfinished. They are kept as they are, typos and aliases to
colors the Figma library does not contain included, until a component needs them.

## Surface levels

Surfaces are numbered by how far they sit from the page, not by what they are for. Level 0 is
the page. A panel or a card placed on the page is level 1; a surface placed on level 1 is
level 2; level 3 is the highest. To pick a level, ask one question: what does this surface sit
on? Then take the next level up. A level is a distance from the page, not a stacking order:
it says nothing about which element is drawn on top.

- **Light mode alternates.** Raising a surface does not make it darker step after step: levels
  0 and 2 share the lightest step, levels 1 and 3 the next one. Each level differs from the one
  it sits on, and its border separates it.
- **Dark mode** follows the Figma library's dark mapping.
- **Level 3 is the ceiling.** Nothing goes above it. When a layout needs level 3, its hierarchy
  is usually too deep: try to flatten it first.
- **Sunken goes down, not up.** Sunken is a recess below the page, for wide areas such as a
  panel background or a canvas.

### Borders follow the level

A border takes the level of the surface it belongs to, in one of three families:

| Family | Where it sits | Use it for |
| --- | --- | --- |
| Edge (`global.border.level.edge.level.<n>`, `edge.sunken`) | Around a surface, its outer edge. | Separating a surface from what surrounds it: the outline of a card, a menu, a table. |
| On-level (`global.border.level.on-level.<n>`) | Painted on a surface. | Lines that belong to the surface: dividers, table rules, separators between groups. |
| Blend (`global.border.level.blend.<n>`) | The color of the surface itself. | Detaching elements stacked on each other, such as overlapping avatars. |

Keep edge and on-level apart: the line around a card is its edge, the lines inside it are
on-level, even when both happen to look alike. Edges are the only level borders with states:
an interactive surface (a clickable card) takes the edge hover and active colors, shared by
every level. The active color sits far from the level steps, so a press reads on any level;
the hover is subtler, and in dark mode barely shows, so it never carries meaning on its own.

## Modes

Every role has a value in light mode (the default) and in dark mode, the Figma library's two
mappings. The Overview shows both side by side, with the palette step each one aliases. A
component never mentions a mode: it asks for "the brand accent fill" and gets the right one.

### iOS

Each role gives the light and the dark value the system appearance selects. There is no
increased-contrast variant yet (see Accessibility).

## Building with color

- Use the role that describes the purpose, even if another role has the same value today:
  values move, purposes do not.
- Pair fills with their text: `global.text.on-accent.<family>` on `global.bg.accent.<family>`,
  `global.text.on-subtle.<family>` on `global.bg.subtle.<family>`. Those are the pairs the
  contrast checks cover.
- Never alias a palette step from a component. A meaning no role covers is a new decision:
  check first whether the Figma library already has the role.

## Accessibility

- **Text reaches 4.5:1.** On-base text on every surface level and on sunken, and every fill's
  text on that fill, in every mode, family and enabled state, must contrast at least 4.5:1
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
  The Specification section shows every ratio, computed from the tokens; the validator fails
  when one drops under the minimum.
- **Known failures.** the Figma library's error roles miss that minimum: error text on some levels,
  text on the error accent fill at rest, and text on the hover and active subtle error fills.
  They are kept as the Figma library defines them and tracked as a known issue; the validator
  reports them as warnings until they are fixed, then asks for the marker to be removed.
- **Measured as people see it.** Contrast is measured against the background the text is
  rendered over. The subtle neutral fill is translucent, so it is composited over each surface
  before measuring.
- **Disabled is exempt.** Text of an inactive component has no contrast requirement (same
  criterion), and inactive components are exempt from non-text contrast as well
  ([Understanding 1.4.11: inactive components](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#inactive-controls)).
  Disabled text is still measured, so the gap with enabled text stays visible in the review.
- **Light borders are fine where something else shows the component.** A component needs a 3:1
  edge only when nothing else shows it is there: a control whose text or icon identifies it
  needs no boundary
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
  [boundaries](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries)).
  The level borders are under 3:1 in both modes, so they must never be the only edge of an
  empty field or a checkbox: such a component needs a border role that reaches 3:1.
- **Never color alone.** Family and state are also carried by the label, an icon or a shape
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html);
  [Apple HIG: Accessibility, vision](https://developer.apple.com/design/human-interface-guidelines/accessibility#Vision)).
- **Forced colors.** On the web, forced colors mode replaces text, background, border and outline
  colors with system colors
  ([MDN: forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors#properties_affected_by_forced-color_mode)),
  which is one more reason never to rely on a hue.
- **Increased contrast on iOS.** Apple asks custom colors for light, dark and increased-contrast
  variants ([Apple HIG: Color](https://developer.apple.com/design/human-interface-guidelines/color#Best-practices)).
  The system has the first two; an increased-contrast mode is still to be designed.
- **Android text sizes.** Android asks for 4.5:1 under 18 sp (14 sp bold) and 3:1 above
  ([Android: increase text visibility](https://developer.android.com/guide/topics/ui/accessibility/apps#text-visibility));
  the system keeps 4.5:1 for every size, which covers both.

## Related

- Focus ring: the focus color is a role of its own, checked against the surfaces.
- Effects: the shadow colors (`effect.shadow.*`).
- Modes: every role in each mode, and how a mode is switched on each platform.
- Button, Icon button, Dropdown: the components painting with these roles.
