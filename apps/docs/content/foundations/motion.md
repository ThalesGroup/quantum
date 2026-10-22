---
foundation: motion
title: Motion
summary: Durations and easing curves, the state transitions of controls, and how motion gives way when people ask for less of it.
order: 6
---

## Overview

Motion in the system is small on purpose. There are two durations (`duration.fast`,
`duration.normal`) and one easing curve (`easing.standard`); the Figma library has no motion
values, so these are the design system's additions, kept apart in `tokens/additions/`.

Components read them directly for a single use, the **control transition**: when a control
changes state (hovered, pressed, released), its fill, border and text colors move to the new
state's colors over `duration.fast`, along `easing.standard`. The Overview plays each duration and curve
on request.

## Rules

- **Color, not movement.** A transition changes colors. Nothing slides, scales or bounces when
  a control changes state.
- **Never the only cue.** Every state reads the same without its transition: motion confirms,
  it does not inform.
- **Off when asked.** When people ask their system for reduced motion, components drop their
  transitions and change state instantly.

A component that needs real movement (a panel opening, a toast arriving) picks a duration and
an easing for that use, states what moves and why, and follows the same rules: it stops under
reduced motion unless the movement is essential.

### Web

Each component declares `transition` on the colors that change, reading its own transition
tokens (which alias `duration.fast` and `easing.standard`), and a `@media (prefers-reduced-motion: reduce)` rule
that sets `transition: none`. The validator refuses component CSS that transitions or animates
without that rule.

### iOS

Custom motion follows the system's Reduce Motion setting (see Accessibility).

## Accessibility

- **Motion from interactions can be turned off.** Animations triggered by an interaction can be
  disabled unless they are essential
  ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).
  The criterion is AAA, beyond the AA target; the system adopts it as extra quality.
- **On the web, the media query.** The `prefers-reduced-motion` media feature tells a page the
  user asked for less motion
  ([MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion));
  using it to prevent motion is a WCAG technique
  ([C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)).
- **Motion is optional.** Apple asks to avoid using motion as the only way to communicate
  important information
  ([Apple HIG: Motion, best practices](https://developer.apple.com/design/human-interface-guidelines/motion#Best-practices)).
- **Reduce Motion on iOS.** When the setting is on, automatic and repetitive animations are
  reduced ([Apple HIG: Accessibility, cognitive](https://developer.apple.com/design/human-interface-guidelines/accessibility#Cognitive)).

## Related

- Button, Icon button, Dropdown: the components using the control transition.
- Color: the state colors the transition moves between.
