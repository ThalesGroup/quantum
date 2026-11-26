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
| Small | Dense forms: at least 28 px high, with 14 px text. |
| Medium | Forms, the default: at least 36 px high, with 16 px text. |
| Large | A prominent form, such as a contact or feedback form: at least 44 px high, with 16 px text. |

Height, text size and inline padding are those of the Button of the same size, so a field and a
button side by side line up and start their text at the same inset. The label is the size of the text in the box (14, 16 and 16 px), the message that says what to fix takes that size too, and the description is smaller (12, 12 and 14 px), so the help never competes with what it describes. The exact values are tokens (Tokens tab). Keep one size per form. A field without a size is medium, like every control with sizes, so fields and buttons that set none line up.

When people raise the text size, the lines grow and the Textarea grows with them, keeping its own
space above and below the text (6, 8 and 12 px), larger than the Text field's minimum; the
severity icon grows with its text.

When people raise the text size, the label, description and message wrap onto as many lines as
they need, even inside a long word, and the value wraps onto the rows. Only the placeholder can be
cut, so keep it a short example.

On iOS and Android the sizes are drawn the same: each reaches the platform's touch target (44 by 44 pt,
48 by 48 dp) with a hit region centered on the box, which may cover the field's own label and help
text. The rows make the box taller than these minimums, so it lacks less: at the default three rows it
reaches both targets by itself. Below a Textarea of one or two rows without help text, keep the next
control or label as far away as the hit region extends, at most 8 pt or 10 dp at small, 4 pt or 6 dp
at medium, 2 dp at large (iOS and Android below).

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
| Error | `severity` property set to error, after validation. | The box takes the subtle error fill, on hover too; an outline in the error color is drawn flush over the border, 1.2 px at rest and 2.4 px with focus, and the message appears under the description (under the box when there is none), in the error color. The control is exposed as in error. |
| Warning | `severity` property set to warning. | The box takes the subtle warning fill, on hover too; an outline in the warning color is drawn flush over the border, 1.2 px at rest and 2.4 px with focus, and the message appears under the description (under the box when there is none), in the warning color. No web state: the message says it. |
| Success | `severity` property set to success. | The box takes the subtle success fill, on hover too; an outline in the success color is drawn flush over the border, 1.2 px at rest and 2.4 px with focus, and the message appears under the description (under the box when there is none), in the success color. No web state: the message says it. |
| Read-only | `readonly` property. | The box takes the level 1 surface, which is close to the resting one, so say in the description that it is read-only; the text can still be focused, read and copied. |
| Disabled | `disabled` property. | Box, text, label and description drop to the shared disabled colors; the field leaves the keyboard order. |

A severity can also show its icon (the Alert's `error`, `warning` or `check_circle`), chosen once per form by
`severityIcon`, as for the Text field: at the start of the message by default, or after the box, level with the first
line of text, or not at all.

## Content

- The label is a noun phrase: **Message**, **Description**, **Delivery notes**.
- The description says what to include or a length limit: **Up to 500 characters**
- The message of an error says what is wrong and how to fix it: **Enter a message of at least 20
  characters.** It goes under the description, which stays, so the limit is still in view while people fix the text.
- The required mark follows the Text field's: "(optional)" or "(required)" after the label, as
  the form marks its fields.

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
  With a severity the box is filled with the subtle background of that severity, a solid color,
  at rest and on hover alike: the value keeps at least 16.91:1 in light mode and 11.43:1 in dark
  on it, the placeholder 5.42:1 and 6.48:1. Every severity border keeps at least 5.14:1 against its
  fill (error 5.14:1, warning 5.86:1 since it reads warning 600 in light mode, success 6.16:1) and
  3:1 against the surface, which is what identifies the field. The error hover step would bring the placeholder to 4.33:1 in light mode, so no severity fill changes
  on hover.
- **Text size.** The label and the help text are set from 12 to 16 px. WCAG sets no minimum text
  size: it asks that text can be resized up to 200 % without loss of content or functionality, and
  the box height is a minimum, so it grows with larger text and keeps a space above and below it
  ([WCAG 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text)). These sizes
  are under the large text size, so their colors keep the 4.5:1 above; the help text passes
  everywhere, at 5.30:1 or more.
- **Visible focus.** Focus shows a 2.4 px outline in the focus color, drawn flush over the border
  ([WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)),
  and Tab reaches the control ([WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)).
- **Target size.** Every size is at least 28 px high, above the 24 px minimum
  ([WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
  On iOS and Android a hit region centered on the box reaches the platform's target (below).
- **Read-only before disabled.** A read-only textarea keeps its text reachable and copyable; a
  disabled one leaves the focus order
  ([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).
  Say that the textarea is read-only in its label or description: its fill barely differs from an
  editable one's ([Material 3: Read-only fields](https://m3.material.io/components/text-fields/guidelines#f572b53d-1a15-4ede-881a-80adbbdc24a5), [Windows: Make a text box read-only](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/text-box#make-a-text-box-read-only)).
- **Motion.** The color transition is dropped when people ask their system for less motion
  ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
  a AAA criterion adopted as extra quality).
- **Keyboard on every platform.** People reach, edit and leave the field from a keyboard,
  physical or assistive, on every platform, and focus is never trapped in it: the platform's native
  multi-line text control provides this, so the keys are the platform's
  ([WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), [WCAG 2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html#intent), [EN 301 549, 11.2.1.1.1](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=70) for native software).
  The keys are listed per platform below, from each platform's own documentation.
- **Enter and the return key.** Enter adds a line in the Textarea on every platform, so its return
  key keeps the platform's default label for a new line, and the form does not set it; a
  single-line field passes Enter to the form instead
  ([HTML: textarea](https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element),
  [HTML: enterkeyhint](https://html.spec.whatwg.org/multipage/interaction.html#attr-enterkeyhint),
  [SwiftUI: TextEditor](https://developer.apple.com/documentation/swiftui/texteditor),
  [Jetpack Compose: line limits](https://developer.android.com/develop/ui/compose/text/user-input#line-limits),
  [Windows: multi-line text box](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/text-box#enable-multi-line-input)).

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
- "(required)" is hidden from assistive technology with `aria-hidden="true"`, since the `required`
  attribute already says it; "(optional)" stays in the `<label>`, so the name ends with it, as no
  attribute says that a field is optional. The visible label still starts with the name
  ([WCAG 2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html),
  [AccName 1.2: hidden nodes](https://www.w3.org/TR/accname-1.2/#comp_hidden_not_referenced),
  [MDN: aria-required](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-required#examples)).
- Text sizes are px lengths today, so a browser's text-only size setting does not enlarge the
  field's text, while zoom enlarges the text and the box together, which meets Resize Text
  ([Technique G142](https://www.w3.org/WAI/WCAG22/Techniques/general/G142),
  [MDN: absolute length units](https://developer.mozilla.org/en-US/docs/Web/CSS/length#absolute_length_units)).

### iOS

- The recommended minimum text size is 11 pt; the description at 12 pt and the message at 14 pt are above it
  ([Apple HIG: Typography](https://developer.apple.com/design/human-interface-guidelines/typography#Specifications)).
- Show a hint to help communicate the purpose of a text field, and include a separate label
  because placeholder text disappears when people start typing
  ([Apple HIG: Text fields, best practices](https://developer.apple.com/design/human-interface-guidelines/text-fields#Best-practices)).
- Apple's default control size on iOS is 44 by 44 pt, and every size has a hit region of at least
  that: the box keeps its drawn size and the hit region extends above and below it by what it lacks,
  at most 8 and 4 pt at the small and medium minimum heights and nothing at the default three rows,
  over the field's own label and help text, which are not targets and keep their 6 pt;
  keep other controls and the next field's label out of it. The large box is the hit region
  ([Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).
- With a hardware keyboard on iPadOS 15 and later, Tab moves focus among focus groups, and
  iPadOS supports keyboard navigation in text fields and text views, unlike buttons. On iPhone,
  Full Keyboard Access reaches the field: use the native text view and test with it on
  ([Apple HIG: Focus and selection, iPadOS](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection#iPadOS), [Apple HIG: Keyboards, best practices](https://developer.apple.com/design/human-interface-guidelines/keyboards#Best-practices), [Apple HIG: Accessibility, speech](https://developer.apple.com/design/human-interface-guidelines/accessibility#Speech)).
- The text grows with Dynamic Type, up to the larger accessibility sizes, and the box grows with its lines and keeps its own block padding:
  Apple asks that layouts adapt to all font sizes
  ([Apple HIG: Typography, supporting Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography#Supporting-Dynamic-Type)).
- The severity icon grows with the text it goes with, as Apple asks of meaningful icons
  ([Apple HIG: Typography, supporting Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography#Supporting-Dynamic-Type)).

### Android

- Interactive elements need a 48 by 48 dp touch target, and every size reaches it without growing:
  the touch target extends above and below the box by what it lacks, at most 10, 6 or 2 dp at the
  minimum heights and nothing at the default three rows, over the field's own label and help
  text, which keep their 6 dp; keep other controls and the next field's label out of it. Compose
  extends a small clickable's touch target outside its bounds by itself: do not give the box
  `minimumInteractiveComponentSize`, which would reserve that space and move the label. Expose an
  error with the error semantics so the message is announced with the field
  ([Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes),
  [Jetpack Compose: error semantics](https://developer.android.com/develop/ui/compose/accessibility/semantics#error-components)).
- With a hardware keyboard, a D-pad or Switch Access, focus navigation reaches the field in a
  logical order and can always leave it. Tab inserts a tab character, the platform's default in a
  multi-line field, so people leave it with Shift+Tab, which moves back, or with the arrow keys and
  the D-pad, which move the caret, then move focus at the start or end of the text; Shift with the arrows
  selects, Ctrl+A selects all ([Orange: Android keyboard navigation](https://a11y-guidelines.orange.com/en/mobile/android/development/focus-navigation/#keyboard-navigation-order), [Jetpack Compose: focus in text fields](https://developer.android.com/develop/ui/compose/touch-input/focus/focus-in-text-fields#one-dimensional-focus-traversal),
  [two-dimensional traversal](https://developer.android.com/develop/ui/compose/touch-input/focus/focus-in-text-fields#two-dimensional-focus-traversal), [Jetpack Compose: keyboard commands](https://developer.android.com/develop/ui/compose/touch-input/keyboard-input/commands)).

### Desktop

- On macOS, Full Keyboard Access lets people navigate to the field and use it with the keyboard
  alone; Tab and Shift-Tab move through the key view loop and Command-A selects all the text.
  Use the native control and keep the standard keyboard shortcuts ([Apple HIG: Keyboards, best practices](https://developer.apple.com/design/human-interface-guidelines/keyboards#Best-practices),
  [Apple HIG: standard keyboard shortcuts](https://developer.apple.com/design/human-interface-guidelines/keyboards#Standard-keyboard-shortcuts), [AppKit: nextKeyView](https://developer.apple.com/documentation/appkit/nsview/nextkeyview)).
- On Windows, Tab follows the tab order, the order the controls are added, and skips a disabled
  field; Shift+Tab goes back; in the field the arrow keys move the caret, since every key goes to
  the text first ([Windows: keyboard accessibility](https://learn.microsoft.com/en-us/windows/apps/design/accessibility/keyboard-accessibility#keyboard-navigation-among-ui-elements), [Windows: keyboard interactions, navigation](https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions#navigation), [text entry](https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions#text-entry)).
- macOS does not support Dynamic Type: there the field keeps its size, as text does
  ([Apple HIG: Typography, macOS](https://developer.apple.com/design/human-interface-guidelines/typography#macOS)).
- On Windows, people can enlarge text alone up to 225 %, and controls and containers must resize
  with it: the box grows with its lines and keeps its own block padding ([Windows: text scaling](https://learn.microsoft.com/en-us/windows/apps/develop/input/text-scaling#ux-guidance)).

## Related

- Text field (one line of text)
