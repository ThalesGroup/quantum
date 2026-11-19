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
text under, and a message that says what to do when validation finds something.

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
| Small | Dense forms, toolbars and table rows: 28 px high with 14 px text. |
| Medium | Forms, the default: 36 px high with 16 px text. |
| Large | A prominent single field, such as a search page or a sign-in form: 44 px high with 16 px text. |

Height, text size and inline padding are those of the Button of the same size, so a field and a
button side by side line up and start their text at the same inset. The label is the size of the text in the box (14, 16 and 16 px), and the description and the message are smaller (12, 12 and 14 px), so the help never competes with what it describes. The exact values are tokens (Tokens tab). Keep one size per form.

## Rows

The `rows` property sets how many lines are visible before the box scrolls; three by default.
Choose it from the expected length of the answer, and let people resize the box vertically
when they write more. The box never resizes horizontally: it fills the width the layout gives it.

## States

| State | How it happens | What changes |
| --- | --- | --- |
| Default | Resting. | An outlined box on the default surface. |
| Hover | A pointer rests over the box. Needs a pointing device: there is no hover on touch. | The box takes the surface hover tint; the border does not change. |
| Focus visible | The box has focus, from the keyboard or a pointer. | The focus color as a 2.4 px outline drawn flush over the border, which keeps its width, so the text does not move. An editable field shows it however it was focused. |
| Error | `severity` property set to error, after validation. | An outline in the error color is drawn flush over the border, 1.2 px at rest and 2.4 px with focus, and the message appears under the box, in the error color. The control is exposed as in error. |
| Warning | `severity` property set to warning. | An outline in the warning color is drawn flush over the border, 1.2 px at rest and 2.4 px with focus, and the message appears under the box, in the warning color. No web state: the message says it. |
| Success | `severity` property set to success. | An outline in the success color is drawn flush over the border, 1.2 px at rest and 2.4 px with focus, and the message appears under the box, in the success color. No web state: the message says it. |
| Read-only | `readonly` property. | The box takes the level 1 surface, which is close to the resting one, so say in the description that it is read-only; the text can still be focused, read and copied. |
| Disabled | `disabled` property. | Box, text, label and description drop to the shared disabled colors; the field leaves the keyboard order. |

## Content

- The label is a noun phrase: **Message**, **Description**, **Delivery notes**.
- The description says what to include or a length limit: **Up to 500 characters.**
- The message of an error says what is wrong and how to fix it: **Enter a message of at least 20
  characters.**

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **Native control first.** The platform's native multi-line text control exposes the role, the name, the value
  and the required, read-only, disabled and error states to assistive technology; a custom view has to
  rebuild all of it ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [WAI-ARIA: textbox role](https://www.w3.org/TR/wai-aria-1.2/#textbox)).
- **A visible label, always.** The label above the control is its accessible name; help text is
  the description, read after the name, and so is the message while the field shows a severity.
  The placeholder is exposed as a placeholder, not as the name
  ([WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WAI tutorial: Labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/),
  [WAI tutorial: Form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/),
  [APG: describing with aria-describedby](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#describing_with_aria-describedby)).
- **Severities are identified in text.** When validation finds something, the border turns to the
  severity's color and the message under the control says what is wrong and how to fix it (an
  error), what to check (a warning) or what was confirmed (a success). Color never carries a
  severity alone, and required fields are marked in words
  ([WCAG 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html),
  [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
  [WAI tutorial: User notifications](https://www.w3.org/WAI/tutorials/forms/notifications/),
  [H90](https://www.w3.org/WAI/WCAG22/Techniques/html/H90)).
- **The border is the boundary.** A field is identified by its box, so the border needs 3:1
  against the surface in both modes. That is why it is the mid-grey base neutral 5 border
  (`global.border.base.neutral.5`, 3.12:1 at the lowest in light mode and 4.80:1 in dark) rather
  than the Figma library's light neutral borders, which fall under 3:1, and why its dark value is
  lighter than the library's, which fell to 2.90:1 on the highest surface. It is lighter than the
  border of the Select, Checkbox, Radio group and Switch, which keep the accent neutral border for now
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries)).
  Text needs 4.5:1 ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html));
  the error text passes on every surface since the Figma library's POC2 export moved it to a
  darker step (5.79:1 on the level 1 surface in light mode, the lowest).
- **Text size.** The label and the help text are set from 12 to 16 px. WCAG sets no minimum text
  size: it asks that text can be resized up to 200 % without loss of content or functionality, and
  the box height is a minimum, so it grows with larger text
  ([WCAG 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text)). These sizes
  are under the large text size, so their colors keep the 4.5:1 above; the help text passes
  everywhere, at 5.30:1 or more.
- **Visible focus.** Focus shows a 2.4 px outline in the focus color, drawn flush over the border
  ([WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)),
  and Tab reaches the control ([WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)).
- **Target size.** Every size is at least 28 px high, above the 24 px minimum
  ([WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
- **Read-only before disabled.** A read-only textarea keeps its text reachable and copyable; a
  disabled one leaves the focus order
  ([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).
  Say that the textarea is read-only in its label or description: its fill barely differs from an
  editable one's ([Material 3: Read-only fields](https://m3.material.io/components/text-fields/guidelines#f572b53d-1a15-4ede-881a-80adbbdc24a5), [Windows: Make a text box read-only](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/text-box#make-a-text-box-read-only)).
- **Motion.** The color transition is dropped when people ask their system for less motion
  ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
  a AAA criterion adopted as extra quality).

### Web

- The implementation renders a `<textarea>` in a wrapper with a `<label for>`, a description and
  a message referenced by `aria-describedby` for every severity, `aria-invalid="true"` for an error only, and the
  native `required`, `readonly` and `rows` attributes
  ([ARIA in HTML: textarea](https://www.w3.org/TR/html-aria/#el-textarea),
  [HTML-AAM: textarea](https://www.w3.org/TR/html-aam-1.0/#el-textarea),
  [HTML: the textarea element](https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element),
  [ARIA1](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA1),
  [ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21)).
- The focus outline uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible));
  the transition is switched off under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

### iOS

- The recommended minimum text size is 11 pt; the help text at 12 pt is above it
  ([Apple HIG: Typography](https://developer.apple.com/design/human-interface-guidelines/typography#Specifications)).
- Show a hint to help communicate the purpose of a text field, and include a separate label
  because placeholder text disappears when people start typing
  ([Apple HIG: Text fields, best practices](https://developer.apple.com/design/human-interface-guidelines/text-fields#Best-practices)).
- A control needs a 44 by 44 pt hit region; the small and medium sizes fall under it today
 
  ([Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).

### Android

- Interactive elements need a 48 by 48 dp touch target; every size falls under it
  today. Expose an error with the error semantics so the message
  is announced with the field
  ([Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes),
  [Jetpack Compose: error semantics](https://developer.android.com/develop/ui/compose/accessibility/semantics#error-components)).

## Related

- Text field (one line of text)
