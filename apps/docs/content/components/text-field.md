---
component: text-field
title: Text field
summary: Lets people enter or edit a single line of text.
order: 13
---

## Overview

A text field collects one line of free text: a name, an email address, a search term. It is
the most common form control, and the one whose details matter most: a visible label above
the box, help text under it when the expected format is not obvious, and a message that says
what to do when validation finds something: how to fix an error, what to check in a warning,
what was confirmed in a success.

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
| Small | Dense forms, toolbars and table rows: 28 px high with 14 px text. |
| Medium | Forms, the default: 36 px high with 16 px text. |
| Large | A prominent single field, such as a search page or a sign-in form: 44 px high with 16 px text. |

Height, text size and inline padding are those of the Button of the same size, so a field and a
button side by side line up and start their text at the same inset. The label is the size of the text in the box (14, 16 and 16 px), the message that says what to fix takes that size too, and the description is smaller (12, 12 and 14 px), so the help never competes with what it describes. The exact values are tokens (Tokens tab). Keep one size per form.

## Label, description and placeholder

The label names the information asked for and is always visible, above the box. The
description, under the box, gives the format, an example or what the value is used for. The
placeholder is a hint inside the empty box, in a lighter color: it disappears as soon as people
type, so it never replaces the label and never carries an instruction people must remember.

## Leading icon

A field can show an icon before its value (**Leading icon**), but none is the default and regular
applications should not use one: a column of plain fields reads faster, and the label already says
what is asked. The icon is there for designs that want a more precise rendering, such as a
marketing page with a few fields. It is the Search field's glyph: the same size, 8 px from the border,
in the placeholder's color while the field is empty and the value's once people type.

The icon only illustrates. Whatever it suggests is said in text: the label reads **Amount in
euros**, not **Amount** next to a euro glyph. It is never a button; an action next to the value
(a location or a calendar picker) is an Icon button beside the field.

## States

| State | How it happens | What changes |
| --- | --- | --- |
| Default | Resting. | An outlined box on the default surface. |
| Hover | A pointer rests over the box. Needs a pointing device: there is no hover on touch. | The box takes the surface hover tint; the border does not change. |
| Focus visible | The box has focus, from the keyboard or a pointer. | The focus color as a 2.4 px outline drawn flush over the border, which keeps its width, so the text does not move. An editable field shows it however it was focused. |
| Error | `severity` property set to error, after validation. | The box takes the subtle error fill, on hover too; an outline in the error color is drawn flush over the border, 1.2 px at rest and 2.4 px with focus, and the message appears under the box, in the error color. The control is exposed as in error. |
| Warning | `severity` property set to warning. | The box takes the subtle warning fill, on hover too; an outline in the warning color is drawn flush over the border, 1.2 px at rest and 2.4 px with focus, and the message appears under the box, in the warning color. No web state: the message says it. |
| Success | `severity` property set to success. | The box takes the subtle success fill, on hover too; an outline in the success color is drawn flush over the border, 1.2 px at rest and 2.4 px with focus, and the message appears under the box, in the success color. No web state: the message says it. |
| Read-only | `readonly` property. | The box takes the level 1 surface, which is close to the resting one, so say in the description that it is read-only; the value can still be focused, read and copied. |
| Disabled | `disabled` property. | Box, value, label and description drop to the shared disabled colors; the field leaves the keyboard order. |

A severity and hover combine (the severity outline over the box; a severity keeps its fill on hover), and disabled wins over
every other state: the states matrix shows what the tokens decide.

### Severity icon

A severity can also show an icon, set by `severityIcon`, a choice the form makes once for all its
fields ([Forms foundation](/foundations/forms/guidelines)). By default (`message`) it starts the
message, 16 px, and the box keeps its full width. With `after-control` it follows the box, at
the size of the Button's icon of the same size (20, 24 and 24 px), and the box gives up the icon
and an 8 px gap, so it no longer lines up with a full-width field or Button. With `none` there is
no icon, and the message says the severity in words. The icon is never drawn inside the box,
where browsers add their own controls. It draws the Alert's glyph of the severity (`error`,
`warning`, `check_circle`), so the three differ by shape as well as color, in the on-base icon
color of the severity, the color of its message (for a warning, warning 600 in light mode, 6.16:1
at the lowest), and is named after it ("Error", "Warning", "Success"), so the description reads
the severity and then the message.

## Content

- The label is a noun phrase: **Email address**, **Company name**. Sentence case, no colon,
  no trailing punctuation.
- The description gives the format or an example when it is not obvious.
- The placeholder, when any, is a short example of a valid value (**name@example.com**).
- The message of an error says what is wrong and how to fix it: **Enter an email address with an @.** A warning says what to check and a success what was confirmed; say the severity in the words, since a warning and a success have no state to expose it.

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **Native control first.** The platform's native text input exposes the role, the name, the value
  and the required, read-only, disabled and error states to assistive technology; a custom view has to
  rebuild all of it ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [WAI-ARIA: textbox role](https://www.w3.org/TR/wai-aria-1.2/#textbox)).
- **A visible label, always.** The label above the control is its accessible name; help text is
  the description, read after the name, and so is the message while the field shows a severity.
  The placeholder is exposed as a placeholder, not as the name, which is one more reason it cannot stand in for the label
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
  With a severity the box is filled with the subtle background of that severity, a solid color,
  at rest and on hover alike: the value keeps at least 16.91:1 in light mode and 11.43:1 in dark
  on it, the placeholder 5.42:1 and 6.48:1. Every severity border keeps at least 5.14:1 against its
  fill (error 5.14:1, warning 5.86:1 since it reads warning 600 in light mode, success 6.16:1) and
  3:1 against the surface, which is what identifies the field. The error hover step would bring the placeholder to 4.33:1 in light mode, so no severity fill changes
  on hover.
- **The leading icon is decoration.** It is hidden from assistive technology on every platform
  and never names the field, so it needs no text alternative of its own; what it suggests must
  already be in the label or the description, as for any image whose information is given by the
  text next to it ([WCAG 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html),
  [WAI tutorial: Decorative images](https://www.w3.org/WAI/tutorials/images/decorative/)).
- **Text size.** The label and the help text are set from 12 to 16 px. WCAG sets no minimum text
  size: it asks that text can be resized up to 200 % without loss of content or functionality, and
  the box height is a minimum, so it grows with larger text
  ([WCAG 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text)). These sizes
  are under the large text size, so their colors keep the 4.5:1 above; the help text passes
  everywhere, at 5.30:1 or more.
- **Visible focus.** Focus shows a 2.4 px outline in the focus color, drawn flush over the border
  ([WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)),
  and Tab reaches the control ([WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)).
  The outline covers the border instead of sitting at a gap, so WCAG 2.4.13 Focus Appearance
  (AAA, extra quality) is not claimed: the part over the border changes contrast only 2.21:1 in
  light and 1.13:1 in dark. A field with a severity draws 1.2 px in the severity's color and,
  with focus, 2.4 px in the same color: width tells them apart, including in forced colors, and
  the message says why, never the color alone
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
  [F78](https://www.w3.org/WAI/WCAG22/Techniques/failures/F78)). The severity colors are the
  accent functional borders, at least 3:1 on every surface level in both modes
  ([WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#related-focus)).
- **Target size.** Every size is at least 28 px high, above the 24 px minimum
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
  Say that the field is read-only in its label or description: its fill barely differs from an
  editable one's ([Material 3: Read-only fields](https://m3.material.io/components/text-fields/guidelines#f572b53d-1a15-4ede-881a-80adbbdc24a5), [Windows: Make a text box read-only](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/text-box#make-a-text-box-read-only)).
- **Motion.** The color transition is dropped when people ask their system for less motion
  ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
  a AAA criterion adopted as extra quality).

### Web

- The implementation renders an `<input type="text">` in a wrapper with a `<label for>`, a
  description and a message referenced by `aria-describedby` for every severity, `aria-invalid="true"`
  for an error only (the web has no state for a warning or a success), and the native `required` and `readonly` attributes
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
- The focus outline uses `:focus-visible`, which browsers match whenever an editable field has
  focus ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible));
  the transition is switched off under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

### iOS

- The recommended minimum text size is 11 pt; the description at 12 pt and the message at 14 pt are above it
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

- Textarea (several lines of text)
- Select (a choice among known values)
