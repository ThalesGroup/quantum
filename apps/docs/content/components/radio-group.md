---
component: radio-group
title: Radio group
summary: Lets people choose exactly one option from a short, visible set.
order: 11
---

## Overview

A radio group shows every option at once under a legend that names the choice, and lets
people check exactly one of them. Checking an option unchecks the previous one, so the group
always has at most one answer. The group is the component: the options are its repeated part,
each with a label, an optional description, a value and its own disabled state.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Exactly one choice among two to about six options that people should read side by side
  (delivery method, plan, frequency).
- The options carry a short explanation each (price, delay) that a dropdown would hide.
- A yes / no / not sure question in a form.

## When not to use

- **Several options can be chosen.** Use Checkboxes.
- **Many options**, or options people already know. Use a Select: it saves space and shows
  the current choice.
- **An on / off setting that applies immediately.** Use a Switch.
- **A single option.** A radio button cannot be unchecked: use a Checkbox.

## Orientation

| Orientation | Use for |
| --- | --- |
| Vertical | The default: one option per line, easy to scan, with room for descriptions. |
| Horizontal | Two or three short options on one line (Yes / No / Not sure). Avoid it when options have descriptions or wrap to several lines. |

## Sizes

| Size | Use for |
| --- | --- |
| Small | Dense panels and tables, with a 14 px label. |
| Medium | Forms and settings, the default, with a 16 px label. |

The radio, the option label and its description scale together; the legend keeps one size.
The exact values are tokens (Tokens tab).

## Legend, descriptions and error

The legend names the choice and is announced first. A description under the legend helps for
the whole choice; a description under an option explains that option. When the group is
invalid, the error message appears last and says what to do; every radio is described by it.

## States

States belong to the options; the group as a whole only passes its disabled and invalid
properties down to them.

| State | How it happens | What changes |
| --- | --- | --- |
| Default | Resting, unchecked. | An outlined, empty circle. |
| Hover | A pointer rests over a radio or its label. Needs a pointing device: there is no hover on touch. | The empty circle takes a light tint. A checked radio does not change. |
| Focus visible | Keyboard focus on a radio. | The shared focus ring appears outside it. Pointer focus shows no ring. |
| Checked | The option's `checked` property, or activation. | The circle fills with the brand color and shows a dot. |
| Invalid | The group's `invalid` property, after validation. | Every radio border takes the error color; the error message is shown. |
| Disabled | The group's `disabled` property, or an option's. | Radio, label and description drop to the shared disabled colors. |

## Content

- The legend is the question or the thing chosen: **Delivery method**, **How often should
  we email you?**
- Option labels are short, parallel and mutually exclusive: **Standard**, **Express**,
  **Pickup**. Sentence case, no trailing punctuation.
- Costs, delays and consequences go to the option's description.
- Order options logically, and offer a neutral option (**None**, **Not sure**) when people
  may have no preference. Pre-check the most common option only when a default is safe.
- The error message says what to do: **Choose a delivery method.**

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **Native radios in a named group.** The platform's radio controls expose each option's role
  and checked state, and the group exposes its name, so the first thing people hear is the
  question, then the options
  ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [APG Radio group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/),
  [WAI tutorial: Grouping controls](https://www.w3.org/WAI/tutorials/forms/grouping/)).
- **Labels and instructions.** The visible legend and the visible option labels are the
  labels the group needs; descriptions and the error message are read as descriptions after an
  option's name, not as part of it
  ([WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WAI tutorial: Labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/),
  [APG: describing with aria-describedby](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#describing_with_aria-describedby)).
- **The radio is the boundary.** Its border, fill and dot need 3:1 against adjacent colors in
  both modes, which is why the unchecked border is the dark accent neutral border and not a
  light grey ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries)).
  Text needs 4.5:1 ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html));
  the error text passes on the default surface but falls under 4.5:1 on the level 1 surface
  (4.26:1 in light mode), a limit of the Figma library's error color tracked as a known issue.
- **Never color alone.** The dot shows the choice; the error is text, not only red borders
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
  [WCAG 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html),
  [WAI tutorial: User notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)).
- **Keyboard.** Tab enters the group on the checked option (or the first), Space checks the
  focused option, and the arrow keys move the check through the options, wrapping around
  ([WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html),
  [APG keyboard interaction](https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction)).
  Keyboard focus shows the shared ring
  ([WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
  [WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)).
- **Target size.** A radio alone is under 24 px; the label is part of the target, and options
  are spaced so the spacing exception applies
  ([WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
- **Motion.** The color transition is dropped when people ask for less motion
  ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
  a AAA criterion adopted as extra quality).

### Web

- The implementation renders a `<fieldset>` with a `<legend>`, and `<input type="radio">`
  elements sharing one `name`, each with a `<label for>`
  ([ARIA in HTML: fieldset](https://www.w3.org/TR/html-aria/#el-fieldset),
  [ARIA in HTML: input type=radio](https://www.w3.org/TR/html-aria/#el-input-radio),
  [HTML: radio button group](https://html.spec.whatwg.org/multipage/input.html#radio-button-group)).
  The browser keeps one option checked and moves the check with the arrow keys. It never sets
  `aria-checked`, which ARIA in HTML forbids on a native radio.
- Help text and the error message are referenced by `aria-describedby` from every radio
  ([ARIA1](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA1)); an invalid group sets
  `aria-invalid="true"` on them ([ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21)).
- Disabling the group uses the fieldset's `disabled` attribute, which disables every radio
  ([HTML: fieldset disabled](https://html.spec.whatwg.org/multipage/form-elements.html#attr-fieldset-disabled)).
- The focus ring uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible)),
  and the transition is switched off under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

### iOS

- Each option (radio and label) must reach the 44 by 44 pt hit region, and the state is never
  shown by color alone
  ([Apple HIG: Toggles, best practices](https://developer.apple.com/design/human-interface-guidelines/toggles#Best-practices),
  [Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).

### Android

- Lift the selection to the row with the `selectable` modifier and the `RadioButton` role, so
  the label and the radio form one element whose state is announced; Material's RadioButton
  enforces the 48 dp target when it can receive actions
  ([Jetpack Compose: interactive elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#interactive-elements),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes),
  [Jetpack Compose: state description](https://developer.android.com/develop/ui/compose/accessibility/semantics#state-description),
  [Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls)).

## Related

- Checkbox (any number of options)
- Select (one option among many)
- Switch (an on / off setting applied immediately)
