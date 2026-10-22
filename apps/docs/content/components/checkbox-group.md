---
component: checkbox-group
title: Checkbox group
summary: Lets people pick any number of options from a short, visible set, under one legend.
order: 20
---

## Overview

A checkbox group is the grouped form of the Checkbox: a legend names the set, each option has
its own label and can be checked independently, and the group carries the shared help text and
the error message. It is built like the Radio group, with one difference that matters: any
number of options can be on, including none.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Several options can be chosen at once from a short list (notification channels, columns to
  show, days of the week).
- The options need a common name that one checkbox alone would not carry.

## When not to use

- **Exactly one option.** Use a Radio group.
- **One option on its own.** Use a Checkbox.
- **Many options.** Use a Select with multiple selection, or a searchable list.

## Orientation and sizes

Orientation and sizes are the Radio group's: vertical by default, horizontal for two or three
short options; small (16 px boxes) or medium (20 px boxes, the default).

## States

States belong to the options; the group passes its disabled and invalid properties down to
them.

| State | How it happens | What changes |
| --- | --- | --- |
| Default | Resting, unchecked. | An outlined, empty box. |
| Hover | A pointer rests over a box or its label. Needs a pointing device: there is no hover on touch. | The empty box takes a light tint. A checked box does not change. |
| Focus visible | Keyboard focus on a box. | The shared focus ring appears outside it. Pointer focus shows no ring. |
| Checked | The option's `checked` property, or activation. | The box fills with the brand color and shows a check mark. |
| Invalid | The group's `invalid` property, after validation. | Every box border takes the error color; the error message is shown. |
| Disabled | The group's `disabled` property, or an option's. | Box, label and description drop to the shared disabled colors. |

## Content

- The legend names the set: **Notifications**, **Which days suit you?**
- Option labels are short, parallel and positive: **Email**, **Push**, **Text message**.
- Say when a choice is required or limited in the description: **Choose at least one**,
  **Choose up to three**. The error message says what to do.

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **Native checkboxes in a named group.** Each option exposes its role and checked state, and
  the group exposes its legend first
  ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [APG Checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/),
  [WAI tutorial: Grouping controls](https://www.w3.org/WAI/tutorials/forms/grouping/)).
- **Every box is a tab stop.** Unlike radios, checkboxes are independent: Tab visits each one,
  and Space toggles it
  ([WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html),
  [APG keyboard interaction](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction)).
- **Labels, descriptions and errors** work as in the Radio group: the visible legend and labels
  are the names, descriptions and the error message are read as descriptions
  ([WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WCAG 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html),
  [WAI tutorial: Labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/)).
- **The box is the boundary**, with the same contrast reasoning and ratios as the Checkbox
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries),
  [WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- **Focus, target size and motion** follow the Checkbox
  ([WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
  [WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html),
  [WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html),
  [WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).

### Web

- The implementation renders a `<fieldset>` with a `<legend>` and `<input type="checkbox">`
  elements sharing one `name`, each with a `<label for>`; help text and the error message are
  referenced by `aria-describedby`, an invalid group sets `aria-invalid="true"` on the boxes,
  and a required group puts `required` on the first box
  ([ARIA in HTML: fieldset](https://www.w3.org/TR/html-aria/#el-fieldset),
  [ARIA in HTML: input type=checkbox](https://www.w3.org/TR/html-aria/#el-input-checkbox),
  [ARIA1](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA1),
  [ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21)).
- Disabling the group uses the fieldset's `disabled` attribute
  ([HTML: fieldset disabled](https://html.spec.whatwg.org/multipage/form-elements.html#attr-fieldset-disabled));
  the focus ring uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible)).

### iOS

- Each option (box and label) must reach the 44 by 44 pt hit region; the state is never shown
  by color alone
  ([Apple HIG: Toggles, best practices](https://developer.apple.com/design/human-interface-guidelines/toggles#Best-practices),
  [Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).

### Android

- Lift the toggle to the row with the `toggleable` modifier and the `Checkbox` role; Material's
  Checkbox enforces the 48 dp target
  ([Jetpack Compose: interactive elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#interactive-elements),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes),
  [Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls)).

## Related

- Checkbox (one option on its own)
- Radio group (exactly one option)
