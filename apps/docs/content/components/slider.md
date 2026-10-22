---
component: slider
title: Slider
summary: Lets people pick a value in a range by moving a thumb along a track.
order: 23
---

## Overview

A slider sets a value whose position in a range matters more than its exact figure: a volume,
a brightness, a price ceiling. People drag the thumb, activate a point of the track or press
the arrow keys; the value can be shown next to the label. When the figure matters, a Number
field is the better control, alone or next to the slider.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- A continuous or stepped setting people adjust by feel: volume, brightness, zoom.
- A ceiling or a floor in a range (maximum price), with the value shown.

## When not to use

- **An exact number.** Use a Number field.
- **A range between two values.** Two thumbs are not specified; use two Number fields.
- **A choice among a few named options.** Use a Radio group.

## Sizes

| Size | Use for |
| --- | --- |
| Small | Inline in panels and toolbars: a 4 px track with a 16 px thumb. |
| Medium | Forms and settings, the default: an 8 px track with a 20 px thumb. |

The control stays 24 px high at both sizes, so the whole track is a pointer target.

## States

| State | How it happens | What changes |
| --- | --- | --- |
| Default | Resting. | A neutral track with the brand thumb at the value's position. |
| Hover | A pointer rests over the control. Needs a pointing device: there is no hover on touch. | The thumb takes the brand hover color. |
| Active | The thumb is being dragged, or a key is held. | The thumb takes the brand press color. |
| Focus visible | Keyboard focus. | The shared focus ring appears around the whole track. Pointer focus shows no ring. |
| Disabled | `disabled` property. | Track, thumb, label and value drop to the shared disabled colors. |

The track has no filled portion before the thumb: browsers do not all offer one without
script. It is an open question.

## Content

- The label names the quantity, with its unit when the value is shown: **Volume**, **Maximum
  price (€)**.
- Show the value when the figure helps; hide it when the position says enough.
- Choose a step people can reason about: 1, 5, 10, 0.5.

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **A value, not a drawing.** The native slider exposes the slider role, the name, the value
  and its bounds, so assistive technology reports and changes the value as a number
  ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [WAI-ARIA: slider role](https://www.w3.org/TR/wai-aria-1.2/#slider),
  [APG Slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)).
- **A label, and the value when it helps.** The label is associated with the control; a value
  shown next to it helps people choose
  ([WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WAI tutorial: Labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/)).
- **Never dragging only.** People can activate a point of the track to move the thumb there,
  and the keyboard changes the value by steps; the keyboard alone would not satisfy the
  dragging criterion
  ([WCAG 2.5.7 Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html),
  [WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html),
  [APG keyboard interaction](https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction)).
- **Thumb and track are the boundary.** The brand thumb keeps 3:1 against the track and the
  page in both modes, with a light rim to separate it from the track
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries)).
  Label and value are text ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html));
  the position, not the color, shows the value
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- **Visible focus and target size.** The ring is drawn around the whole track, so it is seen
  whatever the thumb position; the control is 24 px high at every size
  ([WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
  [WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html),
  [WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
- **Motion.** The thumb's color transition is dropped under reduced motion
  ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).

### Web

- The implementation renders an `<input type="range">` with `min`, `max` and `step`, a
  `<label for>` and, when shown, an `<output for>` holding the value; without script the output
  shows the initial value. It never sets `aria-valuemin` or `aria-valuemax`
  ([ARIA in HTML: input type=range](https://www.w3.org/TR/html-aria/#el-input-range),
  [HTML-AAM: input type=range](https://www.w3.org/TR/html-aam-1.0/#el-input-range),
  [HTML: the Range state](https://html.spec.whatwg.org/multipage/input.html#range-state-(type=range)),
  [HTML: the output element](https://html.spec.whatwg.org/multipage/form-elements.html#the-output-element)).
- When the number is not meaningful by itself, pass `aria-valuetext` through the template's
  extra attributes ([WAI-ARIA: aria-valuetext](https://www.w3.org/TR/wai-aria-1.2/#aria-valuetext)).
- The thumb is styled through the vendor pseudo-elements, one rule per vendor
  ([MDN: ::-webkit-slider-thumb](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::-webkit-slider-thumb),
  [MDN: ::-moz-range-thumb](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::-moz-range-thumb));
  the focus ring uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible)).

### iOS

- A slider is a horizontal track with a thumb that people adjust between a minimum and a
  maximum; consider a label to introduce it and live feedback as the value changes
  ([Apple HIG: Sliders](https://developer.apple.com/design/human-interface-guidelines/sliders)).
  The 24 pt control falls under the 44 by 44 pt hit region today
  ([Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).

### Android

- Material's Slider enforces the 48 dp target; a custom slider exposes its value, range and
  step with the progress range semantics
  ([Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes),
  [Jetpack Compose: progress tracking](https://developer.android.com/develop/ui/compose/accessibility/semantics#progress-tracking)).

## Related

- Number field (an exact number)
- Progress bar (a value shown, not set)
