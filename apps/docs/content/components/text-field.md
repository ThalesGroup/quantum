---
component: text-field
title: Text field
summary: Lets people enter or edit a single line of text.
order: 13
---

## Overview

A text field collects one line of free text: a name, an email address, a search term. It is
the most common form control, and the one whose details matter most: a visible label above
the box, help text under it when the expected format is not obvious, and an error message
that says how to fix the value when validation fails.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Free text that fits on one line: names, email addresses, identifiers, short answers.
- A value that people type rather than choose, even when a format is expected (a phone number).

## When not to use

- **Several lines of text.** Use a Textarea.
- **A choice among known values.** Use a Select, or a Radio group for a few options.
- **A yes / no value.** Use a Checkbox or a Switch.

## Sizes

| Size | Use for |
| --- | --- |
| Small | Dense forms, toolbars and table rows: 32 px high with 14 px text. |
| Medium | Forms, the default: 40 px high with 16 px text. |
| Large | A prominent single field, such as a search page or a sign-in form: 48 px high with 20 px text. |

Height, inline padding and text size scale together; the label, the description and the error
message keep one size. The exact values are tokens (Tokens tab). Keep one size per form.

## Label, description and placeholder

The label names the information asked for and is always visible, above the box. The
description, under the box, gives the format, an example or what the value is used for. The
placeholder is a hint inside the empty box, in a lighter color: it disappears as soon as people
type, so it never replaces the label and never carries an instruction people must remember.

## States

| State | How it happens | What changes |
| --- | --- | --- |
| Default | Resting. | An outlined box on the default surface. |
| Hover | A pointer rests over the box. Needs a pointing device: there is no hover on touch. | The box takes the surface hover tint; the border does not change. |
| Focus visible | The box has focus, from the keyboard or a pointer. | The shared focus ring appears outside the border. An editable field shows it however it was focused. |
| Invalid | `invalid` property, after validation. | The border takes the error color and the error message appears under the box. |
| Read-only | `readonly` property. | The box takes the level 1 surface; the value can still be focused, read and copied. |
| Disabled | `disabled` property. | Box, value, label and description drop to the shared disabled colors; the field leaves the keyboard order. |

Invalid and hover combine (the hover tint under the error border), and disabled wins over
every other state: the states matrix shows what the tokens decide.

## Content

- The label is a noun phrase: **Email address**, **Company name**. Sentence case, no colon,
  no trailing punctuation.
- The description gives the format or an example when it is not obvious.
- The placeholder, when any, is a short example of a valid value (**name@example.com**).
- The error message says what is wrong and how to fix it: **Enter an email address with an @.**

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **Native control first.** The platform's native text input exposes the role, the name, the value
  and the required, read-only, disabled and invalid states to assistive technology; a custom view has to
  rebuild all of it ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [WAI-ARIA: textbox role](https://www.w3.org/TR/wai-aria-1.2/#textbox)).
- **A visible label, always.** The label above the control is its accessible name; help text is
  the description, read after the name, and so is the error message while the field is invalid.
  The placeholder is exposed as a placeholder, not as the name, which is one more reason it cannot stand in for the label
  ([WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WAI tutorial: Labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/),
  [WAI tutorial: Form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/),
  [APG: describing with aria-describedby](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#describing_with_aria-describedby)).
- **Errors are identified in text.** When validation fails, the border turns to the error color
  and the error message under the control says what is wrong and how to fix it. Color never
  carries the error alone, and required fields are marked in words
  ([WCAG 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html),
  [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
  [WAI tutorial: User notifications](https://www.w3.org/WAI/tutorials/forms/notifications/),
  [H90](https://www.w3.org/WAI/WCAG22/Techniques/html/H90)).
- **The border is the boundary.** A field is identified by its box, so the border needs 3:1
  against the surface in both modes. That is why it is the dark accent neutral border rather than
  a light grey: the Figma library's light neutral borders fall under 3:1 in dark mode
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries)).
  Text needs 4.5:1 ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html));
  the error text passes on the default surface but falls to 4.26:1 on the level 1 surface in
  light mode, a limit of the Figma library's error color tracked as a known issue.
- **Visible focus.** Focus shows the shared ring outside the border
  ([WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
  [WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)),
  and Tab reaches the control ([WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)).
- **Target size.** Every size is at least 32 px high, above the 24 px minimum
  ([WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
- **Input purpose.** A field collecting information about the person (name, email, phone,
  address) carries the matching autocomplete token, so browsers and assistive technology can
  identify its purpose and fill it
  ([WCAG 1.3.5 Identify Input Purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html),
  [H98](https://www.w3.org/WAI/WCAG22/Techniques/html/H98)).
- **Read-only before disabled.** A read-only field keeps its value reachable and copyable; a
  disabled field leaves the focus order and cannot be read by everyone. Prefer read-only when
  people may need the value
  ([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).
- **Motion.** The color transition is dropped when people ask their system for less motion
  ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
  a AAA criterion adopted as extra quality).

### Web

- The implementation renders an `<input type="text">` in a wrapper with a `<label for>`, a
  description and an error message referenced by `aria-describedby`, `aria-invalid="true"` when
  invalid, and the native `required` and `readonly` attributes
  ([ARIA in HTML: input type=text](https://www.w3.org/TR/html-aria/#el-input-text),
  [HTML-AAM: input type=text](https://www.w3.org/TR/html-aam-1.0/#el-input-text),
  [ARIA1](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA1),
  [ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21),
  [HTML: readonly](https://html.spec.whatwg.org/multipage/input.html#attr-input-readonly)).
- The HTML standard says the placeholder is not an alternative to a label, and the WAI tutorial
  explains why: it disappears when people start typing
  ([HTML: placeholder](https://html.spec.whatwg.org/multipage/input.html#attr-input-placeholder),
  [WAI tutorial: placeholder text](https://www.w3.org/WAI/tutorials/forms/instructions/#placeholder-text)).
- The input type (`email`, `tel`, `url`) and the `autocomplete` token are passed through the
  template's extra attributes; they change the keyboard and the browser's help, not the look.
- The focus ring uses `:focus-visible`, which browsers match whenever an editable field has
  focus ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible));
  the transition is switched off under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

### iOS

- Show a hint to help communicate the purpose of a text field, and include a separate label
  because placeholder text disappears when people start typing
  ([Apple HIG: Text fields, best practices](https://developer.apple.com/design/human-interface-guidelines/text-fields#Best-practices)).
- A control needs a 44 by 44 pt hit region; the small and medium sizes fall under it today
 
  ([Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).

### Android

- Interactive elements need a 48 by 48 dp touch target; the small and medium sizes fall under it
  today. Expose an invalid value with the error semantics so the message
  is announced with the field
  ([Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes),
  [Jetpack Compose: error semantics](https://developer.android.com/develop/ui/compose/accessibility/semantics#error-components)).

## Related

- Textarea (several lines of text)
- Select (a choice among known values)
