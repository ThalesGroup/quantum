---
component: number-field
title: Number field
summary: Lets people enter a number, by typing it or stepping it up and down.
order: 21
---

## Overview

A number field collects a numeric value within optional bounds and steps: a quantity, a number
of seats, a year. It looks like the Text field and adds the platform's stepping: arrow keys and
a spin control, which keeps its native look. The browser validates the bounds; the field shows
the error message the form gives it.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- A quantity people count or step: items in a cart, seats, rows per page, a year.
- A value with meaningful bounds and increments.

## When not to use

- **A number that is really text**: a phone number, a postal code, a card number. Use a Text
  field; a spin control makes no sense there and assistive technology would announce a
  spinbutton.
- **A value whose position in a range matters more than its figure.** Use a Slider, alone or
  next to the number field.

## Sizes, states and content

Sizes (small, medium, large), states (default, hover, focus visible, invalid, read-only,
disabled) and the label, description and error message follow the Text field. The label names
the quantity and its unit when it has one (**Weight (kg)**); the description gives the bounds
(**Between 1 and 99**); the error message says how to fix the value.

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **A spinbutton, by name.** The platform's native numeric control exposes the spinbutton role,
  the name, the value and its bounds, and steps the value with the arrow keys; assistive
  technology announces it as such, which is why values that are not numbers must not use it
  ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [WAI-ARIA: spinbutton role](https://www.w3.org/TR/wai-aria-1.2/#spinbutton),
  [APG Spinbutton pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/)).
- **Label, description and error** follow the Text field
  ([WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WCAG 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html),
  [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
  [WAI tutorial: Labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/)).
- **Contrast, focus and target size** follow the Text field
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries),
  [WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
  [WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html),
  [WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html),
  [WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html),
  [WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).

### Web

- The implementation renders an `<input type="number">` with `min`, `max` and `step`, a
  `<label for>`, a description and an error message referenced by `aria-describedby`, and
  `aria-invalid="true"` when invalid. The spin control keeps its native look: there is no
  portable way to draw it from tokens
  ([ARIA in HTML: input type=number](https://www.w3.org/TR/html-aria/#el-input-number),
  [HTML-AAM: input type=number](https://www.w3.org/TR/html-aam-1.0/#el-input-number),
  [HTML: input type=number](https://html.spec.whatwg.org/multipage/input.html#number-state-(type=number)),
  [ARIA1](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA1),
  [ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21)).
- MDN's advice for non-numeric values: a text input with `inputmode="numeric"` and a pattern
  ([MDN: input type=number, accessibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number#accessibility)).
- The focus ring uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible));
  a read-only field keeps its value reachable, a disabled one leaves the focus order
  ([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).

### iOS

- A stepper is a two-segment control that increases or decreases an incremental value, next to
  a field that shows it: the iOS counterpart of the spin control
  ([Apple HIG: Steppers](https://developer.apple.com/design/human-interface-guidelines/steppers)).
  The small and medium sizes fall under the 44 by 44 pt hit region today
  ([Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).

### Android

- Interactive elements need a 48 by 48 dp touch target; the small and medium sizes fall under
  it today. Expose an invalid value with the error semantics
  ([Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes),
  [Jetpack Compose: error semantics](https://developer.android.com/develop/ui/compose/accessibility/semantics#error-components)).

## Related

- Text field (text, including numbers that are text)
- Slider (a value in a range)
