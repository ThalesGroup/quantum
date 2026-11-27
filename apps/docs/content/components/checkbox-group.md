---
component: checkbox-group
title: Checkbox group
summary: Lets people pick any number of options from a short, visible set, under one legend.
order: 20
---

## Overview

A checkbox group is the grouped form of the Checkbox: a legend names the set, each option has
its own label and can be checked independently, and the group carries the shared help text and
the message. It is built like the Radio group, with one difference that matters: any
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
short options; small (16 px boxes) or medium (20 px boxes, the default). So is the spacing: the
description right under the legend, 6 px between the legend (or its description), the options and
the message, and 4 px between options in a column
([Forms: spacing](/foundations/forms#spacing)).

By default the message starts with the severity icon, the Alert's `error` glyph at 16 px, named
"Error", in the message's color: `severityIcon`, a choice the form makes once for all its controls
([Forms foundation](/foundations/forms/guidelines)). With `none` there is no icon and the message's
own words say the error. A checkbox group never draws the icon after its box, where its options follow it: a
form set to `after-control` shows it in the message.

## Required mark

A form says once which of its fields carry a mark (**Marked fields**), the same for all its
controls, and the group draws its own from **Required**, as the Text field does. By default the form
marks the optional ones: a group that is not required ends its legend with "(optional)", a required one carries nothing, and the form says once, before its
first field, "All fields are required unless marked optional." When most fields are optional, the
form marks the required ones with "(required)" instead. A group outside a submitted form, such as a filter applied at once, carries no mark (**Marked fields** none). The rule is the
[Forms foundation](/foundations/forms/guidelines)'s.

The mark follows the legend after a word space, at its size but regular and in the description's
color. On the web its "(required)" stays in the group's name: no state says that a group is required, so the word is the only way to say it. Android and Windows mark a required group with an asterisk instead, in the error
message's red; the web, iOS and macOS keep the words. In Figma the component draws the web's mark:
**Mark** shows it and **Mark text** holds its words.

## States

States belong to the options; the group passes its disabled and severity properties down to
them.

| State | How it happens | What changes |
| --- | --- | --- |
| Default | Resting, unchecked. | An outlined, empty box. |
| Hover | A pointer rests over a box or its label. Needs a pointing device: there is no hover on touch. | The empty box takes a light tint. A checked box does not change. |
| Focus visible | Keyboard focus on a box. | The shared focus ring appears outside it. Pointer focus shows no ring. |
| Checked | The option's `checked` property, or activation. | The box fills with the brand color and shows a check mark. |
| Error | The group's `severity` property set to error, after validation. | Every box border takes the error color, every unchecked box the subtle error fill (a checked box keeps its brand fill); the message is shown, in the error color. A group of choices has no warning or success. |
| Disabled | The group's `disabled` property, or an option's. | Box, label and description drop to the shared disabled colors. |

## Content

- The legend names the set: **Notifications**, **Which days suit you?**
- Option labels are short, parallel and positive: **Email**, **Push**, **Text message**.
- Say when a choice is required or limited in the description: **Choose at least one**,
  **Choose up to three**. The message of an error says what to do.
- A required group asks for at least one option, never all of them. A set of consents that must
  all be accepted (**I accept the terms**, **I accept the privacy policy**) is not a group: each
  is a separate required Checkbox.

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
  are the names, descriptions and the message are read as descriptions
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
  elements sharing one `name`, each with a `<label for>`; help text and the message are
  referenced by `aria-describedby`, and a group in error sets `aria-invalid="true"` on the boxes
  ([ARIA in HTML: fieldset](https://www.w3.org/TR/html-aria/#el-fieldset),
  [ARIA in HTML: input type=checkbox](https://www.w3.org/TR/html-aria/#el-input-checkbox),
  [ARIA1](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA1),
  [ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21)).
- A required group puts `required` on no box: on a checkbox it requires that very box, so the
  browser would ask for one given option, or for all of them, never for one of several
  ([HTML: Checkbox state](https://html.spec.whatwg.org/multipage/input.html#checkbox-state-(type=checkbox))).
  The product checks the group when the form is submitted and says "Choose at least one" in its
  message. A "(required)" in the legend stays in the group's name: no state says that a group is
  required, since `aria-required` is not supported on the `group` role of a fieldset
  ([WAI-ARIA 1.2: aria-required](https://www.w3.org/TR/wai-aria-1.2/#aria-required),
  [HTML-AAM: fieldset](https://www.w3.org/TR/html-aam-1.0/#el-fieldset)).
- Disabling the group uses the fieldset's `disabled` attribute
  ([HTML: fieldset disabled](https://html.spec.whatwg.org/multipage/form-elements.html#attr-fieldset-disabled));
  the focus ring uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible)).
- The color transitions of the boxes are switched off under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

### iOS

- Each option (box and label) must reach the 44 by 44 pt hit region; the state is never shown
  by color alone. Options 4 pt apart cannot share the room between them, so each option row is
  at least 44 pt tall, the box and its label centred in it, 4 pt from the next
  ([Apple HIG: Toggles, best practices](https://developer.apple.com/design/human-interface-guidelines/toggles#Best-practices),
  [Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).

### Android

- Lift the toggle to the row with the `toggleable` modifier and the `Checkbox` role; Material's
  Checkbox enforces the 48 dp target, so each option row is at least 48 dp tall, 4 dp from the
  next
  ([Jetpack Compose: interactive elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#interactive-elements),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes),
  [Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls)).

### Desktop

- On macOS, an option row (21 pt small, 24 pt medium) meets Apple's 20 by 20 pt minimum control
  size, so the options keep their 4 pt
  ([Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).

## Related

- Checkbox (one option on its own)
- Radio group (exactly one option)
