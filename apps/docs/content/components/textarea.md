---
component: textarea
title: Textarea
summary: Lets people enter or edit several lines of text.
order: 14
---

## Overview

A textarea collects free text that may run over several lines: a message, a description, a
comment, a postal address. It shows a chosen number of lines, scrolls beyond them and can be
resized vertically. Everything else works like the Text field: a visible label above, help
text under, and an error message that says how to fix the value.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Text longer than a short phrase, or where line breaks matter: messages, descriptions, notes.
- Pasted content people may want to review in full (a key, an address).

## When not to use

- **One line of text.** Use a Text field: a tall box invites long answers.
- **Formatted text** (headings, lists). That is a rich text editor, not a textarea.

## Sizes

| Size | Use for |
| --- | --- |
| Small | Dense forms, toolbars and table rows: 32 px high with 14 px text. |
| Medium | Forms, the default: 40 px high with 16 px text. |
| Large | A prominent single field, such as a search page or a sign-in form: 48 px high with 20 px text. |

Height, inline padding and text size scale together; the label, the description and the error
message keep one size. The exact values are tokens (Tokens tab). Keep one size per form.

## Rows

The `rows` property sets how many lines are visible before the box scrolls; three by default.
Choose it from the expected length of the answer, and let people resize the box vertically
when they write more. The box never resizes horizontally: it fills the width the layout gives it.

## States

| State | How it happens | What changes |
| --- | --- | --- |
| Default | Resting. | An outlined box on the default surface. |
| Hover | A pointer rests over the box. Needs a pointing device: there is no hover on touch. | The box takes the surface hover tint; the border does not change. |
| Focus visible | The box has focus, from the keyboard or a pointer. | The shared focus ring appears outside the border. |
| Invalid | `invalid` property, after validation. | The border takes the error color and the error message appears under the box. |
| Read-only | `readonly` property. | The box takes the level 1 surface; the text can still be focused, read and copied. |
| Disabled | `disabled` property. | Box, text, label and description drop to the shared disabled colors; the field leaves the keyboard order. |

## Content

- The label is a noun phrase: **Message**, **Description**, **Delivery notes**.
- The description says what to include or a length limit: **Up to 500 characters.**
- The error message says what is wrong and how to fix it: **Enter a message of at least 20
  characters.**

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **Native control first.** The platform's native multi-line text control exposes the role, the name, the value
  and the required, read-only, disabled and invalid states to assistive technology; a custom view has to
  rebuild all of it ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [WAI-ARIA: textbox role](https://www.w3.org/TR/wai-aria-1.2/#textbox)).
- **A visible label, always.** The label above the control is its accessible name; help text is
  the description, read after the name, and so is the error message while the field is invalid.
  The placeholder is exposed as a placeholder, not as the name
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
- **Read-only before disabled.** A read-only textarea keeps its text reachable and copyable; a
  disabled one leaves the focus order
  ([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).
- **Motion.** The color transition is dropped when people ask their system for less motion
  ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
  a AAA criterion adopted as extra quality).

### Web

- The implementation renders a `<textarea>` in a wrapper with a `<label for>`, a description and
  an error message referenced by `aria-describedby`, `aria-invalid="true"` when invalid, and the
  native `required`, `readonly` and `rows` attributes
  ([ARIA in HTML: textarea](https://www.w3.org/TR/html-aria/#el-textarea),
  [HTML-AAM: textarea](https://www.w3.org/TR/html-aam-1.0/#el-textarea),
  [HTML: the textarea element](https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element),
  [ARIA1](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA1),
  [ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21)).
- The focus ring uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible));
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

- Text field (one line of text)
