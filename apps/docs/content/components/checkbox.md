---
component: checkbox
title: Checkbox
summary: Lets people turn one option on or off, or pick any number of options from a list.
order: 10
---

## Overview

A checkbox is a binary choice with a visible label. Alone, it confirms a statement (accepting
terms, remembering a device). In a list, several checkboxes let people pick any number of
options, including none. The box shows the state with a mark, never with color alone: a check
when the option is on, a bar when the box stands for a group whose options disagree.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Choosing any number of options from a short list (filters, permissions, notification topics).
- Confirming a statement before continuing (terms of service, consent).
- A setting that is saved with the rest of a form, when people submit it.

## When not to use

- **Exactly one choice among several.** Use a Radio group: it says that the options exclude each
  other.
- **A setting that takes effect immediately**, without a Save button. Use a Switch.
- **A long list of options.** Use a Select with multiple selection, or a searchable list.

## Sizes

| Size | Use for |
| --- | --- |
| Small | Dense lists, tables and filter panels, with a 14 px label. |
| Medium | Forms and settings, the default, with a 16 px label. |

The box, its corner radius, the label and the description scale together. The exact values
are tokens (Tokens tab). Never mix sizes within one list.

## Label and description

The label names the option and is the accessible name of the control. Activating it toggles
the box, so the whole row is the target. The description adds help under the label: what
checking the box does, or why it cannot change. It is read by assistive technology as the
control's description, after the name.

## States

| State | How it happens | What changes |
| --- | --- | --- |
| Default | Resting, unchecked. | An outlined, empty box. |
| Hover | A pointer rests over the box or the label. Needs a pointing device: there is no hover on touch. | The empty box takes a light tint. A checked box does not change. |
| Focus visible | Keyboard focus on the box. | The shared focus ring appears outside the box. Pointer focus shows no ring. |
| Checked | `checked` property. | The box fills with the brand color and shows a check mark. |
| Indeterminate | Set by the application when the box stands for a group of options of which some are on. | The box fills and shows a bar instead of a check. Toggling it checks or unchecks the whole group. |
| Invalid | `invalid` property, after validation. | The box border takes the error color; the form states the error in text. |
| Disabled | `disabled` property. | Box, label and description drop to the shared disabled colors, checked or not. |

A checkbox cannot be in two states at once from the tokens' point of view: a checked box keeps
its checked colors on hover, and a disabled box keeps its disabled colors whether it is
checked or not. The states matrix shows every combination the design decides.

### Web

The indeterminate state has no HTML attribute: it is the `indeterminate` property of the
input, set by script. The reference implementation styles the state; the application sets it.

## Content

- State the option positively, as what happens when the box is checked: **Send me a weekly
  summary**, never **Do not send me a summary**.
- Sentence case, no trailing punctuation. Keep the label to one line; details go to the
  description.
- A required checkbox says what is agreed to in its label (**I accept the terms of service**),
  and its error message says what to do (**Check the box to continue**).

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **Native control first.** Every platform has a native checkbox that exposes the role, the
  name and the checked state to assistive technology; a custom view has to rebuild all of it
  ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [APG Checkbox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)).
- **A visible, associated label.** The label is the name of the control, and activating it
  toggles the box, which makes the target larger than the box alone. The association is
  programmatic, not just visual, so the name is announced with the state
  ([WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WAI tutorial: Labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/)).
  Help text is a description, not part of the name: it is announced after the name, and it
  does not make the name longer for speech-input users
  ([APG: describing with aria-describedby](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#describing_with_aria-describedby)).
- **Groups have a name.** Related checkboxes sit under a visible group name, so people hear
  what the set is about before the first option
  ([WAI tutorial: Grouping controls](https://www.w3.org/WAI/tutorials/forms/grouping/)).
- **The box is the boundary.** Unlike a button, a checkbox is identified by its box, so the box
  border, its fill and its mark need 3:1 against the colors next to them, in both modes. That
  is why the unchecked border is the dark accent neutral border rather than a light grey: it is
  the lightest neutral border of the system that keeps 3:1 in dark mode
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries)).
  Label and description need 4.5:1 as text
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
- **State and errors are never color alone.** The check and the bar show the state; an error is
  stated in text next to the box or at the top of the form, not only by a red border
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
  [WCAG 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html),
  [WAI tutorial: User notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)).
- **Visible focus.** Keyboard focus shows the shared ring outside the box; pointer focus shows
  none ([WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
  [WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)).
- **Target size.** The box alone (16 or 20 px) is under the 24 px minimum; the label is part of
  the target and brings the row above it. Keep 24 px between the rows of a list
  ([WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
- **Keyboard.** Space toggles the box; Tab moves to and from it
  ([WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html),
  [APG keyboard interaction](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/#keyboardinteraction)).
- **Motion.** The color transition is dropped when people ask their system for less motion
  ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
  a AAA criterion adopted as extra quality).

### Web

- The implementation renders an `<input type="checkbox">` in a wrapper, with a `<label for>`
  pointing at it and an optional description referenced by `aria-describedby`. It never sets
  `aria-checked`, which ARIA in HTML forbids on a native checkbox
  ([ARIA in HTML: input type=checkbox](https://www.w3.org/TR/html-aria/#el-input-checkbox),
  [HTML-AAM: input type=checkbox](https://www.w3.org/TR/html-aam-1.0/#el-input-checkbox)).
- The partially checked state is the `indeterminate` property, which the browser exposes as the
  mixed checked state
  ([MDN: indeterminate state](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox#indeterminate_state_checkboxes)).
- An invalid box carries `aria-invalid="true"`
  ([ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21)); a required box the
  `required` attribute, with a label or description that says so
  ([H90](https://www.w3.org/WAI/WCAG22/Techniques/html/H90)).
- The focus ring uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible)),
  and the transition is switched off under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
- The native `disabled` attribute removes the box from the focus order
  ([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).

### iOS

- Apple's guidance on toggles asks to identify clearly what the control affects and never to
  rely on color alone for the state; the row must reach the 44 by 44 pt hit region
  ([Apple HIG: Toggles, best practices](https://developer.apple.com/design/human-interface-guidelines/toggles#Best-practices),
  [Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).

### Android

- Lift the toggle to the row with the `toggleable` modifier and the `Checkbox` role, so the
  label and the box form one element whose state is announced; Material's Checkbox enforces the
  48 dp target when it can receive actions
  ([Jetpack Compose: interactive elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#interactive-elements),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes),
  [Jetpack Compose: state description](https://developer.android.com/develop/ui/compose/accessibility/semantics#state-description),
  [Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls)).

## Related

- Switch (a setting that takes effect immediately)
- Radio group (exactly one choice)
- Select (one choice among many options)
