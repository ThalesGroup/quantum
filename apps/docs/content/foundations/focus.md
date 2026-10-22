---
foundation: focus
title: Focus ring
summary: The one visible focus indicator every focusable component shows on keyboard focus.
order: 8
---

## Overview

Keyboard users, switch users and people using other assistive inputs move focus from component
to component and act on the one that has it. They cannot hover or point: the only way to know
where the next key press will land is to see it. The focus ring is that sign.

The system has **one** focus ring. A button, an icon button and every focusable component that
comes next show the same ring, in the same color, at the same distance from their edge. People
learn it once and find it everywhere, and a component team never has to design, review or test
a focus indicator again: it aliases the focus tokens and inherits every decision on this page.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it; everything else holds everywhere.

## What it looks like

- **A solid ring around the whole component.** It follows the corner radius, so a rounded
  control gets a rounded ring. Never dashed, never partial, never inside the component.
- **Outside, with a gap.** The ring sits a few pixels away from the component's edge. The surface
  shows through the gap, which separates the ring from the component's own border and fill:
  the ring reads the same on an accent fill, a tinted fill or a borderless ghost.
- **Strong.** It uses the strong focus width of the stroke scale, at every component size,
  rather than a thinner one (see Accessibility).
- **One color.** The focus color is the brand accent of each mode. It does not change with the
  component's emphasis or intent, so it never looks like a variant or a state of the component
  itself.

## When it appears

The ring appears when focus arrives from the keyboard, and only then. Clicking or tapping a
component also focuses it, but people who point already know where they are, so pointer and
touch focus show no ring. It disappears when focus leaves the component.

### Web

The reference CSS draws the ring with `outline` and `outline-offset` on `:focus-visible`, the
browser's own heuristic for "focus that should be shown". Each component's `:focus` rule
removes the browser default outline so that only this ring remains, and the forced
`[data-state="focus-visible"]` selector lets the site show the ring without a keyboard.

### iOS

Native controls keep the system focus effect. On iPadOS with a keyboard, the system draws a
halo, its own focus ring, around the focused item. Custom views adopt the halo rather than this
ring, and refine its shape when the default one does not fit the view's corners.

### Android

Material shows keyboard focus as a ring-like indicator around the element reached with the Tab
key. Components built for Android draw this ring in that situation, from the platform's resolved
tokens.

## On every surface

The ring sits on the surface around the component, not on the component. Its contrast is
therefore checked against every surface of the system (every level and sunken), in every mode and on
every platform, and the validator fails when one pair drops under the minimum. The computed
ratios are shown on the Specification section of this page. A new surface token is checked
automatically.

A product placing components on a surface of its own (an image, a brand color band) must check
the ring against that surface too, and pick a surface token that keeps it visible.

## Building a component

- Give the root part three tokens on the `focus-visible` state: `outline-width`,
  `outline-offset` and `outline-color`, aliasing `focus.ring.width`, `focus.ring.offset` and
  `color.focus.ring`. The validator requires them for every focusable role.
- Do not tint the fill or change the border on focus to replace the ring. Hover and press
  styles may still apply while the component is focused.
- Leave room for the ring. A parent that clips its content (scroll areas, cards with hidden
  overflow) can cut the ring off; give it padding of at least the offset plus the width.

## Accessibility

- **A visible indicator is required.** Every keyboard-operable component must show where focus
  is ([WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)).
  A single ring makes that guarantee once for the whole system.
- **3:1 against what is around it.** An indicator drawn outside the component must contrast at
  least 3:1 with the background the component sits on
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
  [relationship with Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#related-focus)).
  The offset is what makes this the only pair to check: the ring never touches the component's
  own colors.
- **Big enough to notice.** At 2.4 px, the solid ring covers more than a 2 CSS pixel perimeter of
  the component and changes those pixels by more than 3:1, which is what the AAA focus
  appearance criterion asks. The system adopts it as extra quality, beyond the AA target
  ([WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)).
- **Never hidden.** A visible ring is useless under a sticky header, a cookie banner or a
  floating toolbar: a focused component must never be entirely covered by content the product
  adds ([WCAG 2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)).
  On the web, reserving the sticky area with `scroll-padding` makes the browser scroll the focused
  component into the visible part
  ([technique C43](https://www.w3.org/WAI/WCAG22/Techniques/css/C43)).
- **Keyboard only, on the web.** `:focus-visible` shows the ring for keyboard focus and not for
  a mouse click ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible)).
- **Survives forced colors.** In forced colors mode the browser
  replaces outline colors with system colors but removes box shadows entirely, so the ring is an
  outline, never a shadow
  ([MDN: forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/forced-colors#properties_affected_by_forced-color_mode)).
- **Platform focus systems first.** Apple asks apps to rely on the system-provided focus effects
  and to customize the iPadOS halo only when necessary
  ([Apple HIG: Focus and selection](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection#Best-practices),
  [iPadOS](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection#iPadOS)).
  Material describes the focused state reached with the Tab key as a ring-like keyboard focus
  indicator, which this ring is
  ([Material Design 3: States](https://m3.material.io/foundations/interaction/states/applying-states#bc6d6853-48ef-490e-8076-448e89e69f0f)).

## Related

- Button and Icon button draw this ring on their `focus-visible` state.
- Modes: the focus color takes another value in dark mode; the same tokens, another context.
