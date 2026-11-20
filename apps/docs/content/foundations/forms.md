---
foundation: forms
title: Forms
summary: What a form control is, and how every form control is labelled, described, marked as required and validated, and how a form reports its errors, on every platform.
order: 10
---

> **Draft.** This page shows how the Forms foundation will read once it is decided. What it says
> today is what the form controls already do and what every trusted source agrees on; each
> point marked **Not decided yet** is a step of the Forms foundation pull request, decided with
> the team one at a time. Feedback on the shape of the page is welcome now.

## Overview

A form is a set of controls people fill in and submit. Each control has its own page. This
page says which components are form controls and holds what they share, so that a field
behaves like its neighbours and the same way on every platform: what a field is made of, how a required field is marked, which severities a control can show and how they
look, when a value is checked, how errors are announced and summarised, how fields are spaced
and how messages are written.

Only the web and Windows have a forms guide of their own (the W3C forms tutorial,
[Windows: Forms](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/forms)).
Apple covers forms through its text field, data entry and writing guidance, Android through
Material's [text field guidelines](https://m3.material.io/components/text-fields/guidelines);
this page follows each platform's own guidance and says so where a platform is silent, rather
than borrowing another platform's rule.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it; everything else holds everywhere.

## What a form control is

A form control is a component through which people **enter or choose a value the product
keeps**: text, a number, one or several options, on or off, a point in a range. It has a visible
label and may have a description. When its value can be missing or wrong, it can be marked
required and report an error.

A control is defined by what people do with it, not by where it sits. A label is owed to every
input, also outside a form
([WCAG 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions)). Whether the
value applies at once or with the rest of the form depends on how the control is used, not on
the component: a settings page applies each change as it is made, a sign-up form collects the
values and applies them when people submit.

Which rules a control follows is read from its specification, with no list of exceptions:

- **Every control** follows the anatomy and label rules.
- **A control that can be required** (it has a required property) also follows the rules on
  required fields.
- **A control that can show a severity** (it has a severity property, which sets the error state)
  also follows the rules on severities, errors and their announcement, and says its severity in
  text.

The components that follow this page are the ones whose role is marked as an input; the
foundation's Tokens tab lists them with the rules each follows.

A **button that submits is a form action**, not a form control: people activate it, they do not
enter or choose a value with it
([WCAG 3.2.2](https://www.w3.org/WAI/WCAG22/Understanding/on-input)). It does not follow this
page as a control; the rules about the actions of a form, when they are decided, name it.

> **Not decided yet (step 2b).** Whether the Search field, which can be required but has no
> severity, gets one; and whether the label, required and message guidelines the controls
> repeat move into this page.

### Web

A button contributes to the submitted data only when it is the one that submitted the form
([HTML Standard: constructing the entry list](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constructing-form-data-set)).

### Desktop

On Windows, a form either applies each value at once, as on a settings page, or collects the
values and applies them when people choose to submit; the same input controls serve both
([Windows: Forms](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/forms)).
On macOS, a switch can sit in a grouped form, where a mini switch controls the setting of a
single row
([HIG: Toggles](https://developer.apple.com/design/human-interface-guidelines/toggles#Switches)).

## Anatomy of a field

A field stacks four parts, top to bottom:

- **Label.** Names the information asked for. Always visible, also while people type.
- **Control.** The box, the list or the set of options people act on.
- **Description.** Optional help people need to fill the field: a format, an example, a limit.
- **Message.** Shown with a severity: what is wrong and how to fix it, what to check, or what
  was confirmed.

A group of checkboxes or radios has the same parts around its options, with a legend as its
label, and the message after the options.

**Every control that can show a severity has a message part**, after its description, so its
error is said in text next to it and associated with it. A form-wide summary may repeat the
error, never replace it. The standalone Checkbox has the error severity but no message part
yet: it gets one with the complex controls (step 2b). A Switch shows no severity, so it has no
message; a Slider gets one only if it is given a severity. WCAG asks that an error be indicated
in text ([Understanding 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification#intent)),
and WAI-ARIA lets a checkbox reference its error message
([WAI-ARIA 1.2: aria-errormessage](https://www.w3.org/TR/wai-aria-1.2/#aria-errormessage)).
Material gives the checkbox error states but no error text
([Material: checkbox](https://m3.material.io/components/checkbox/overview)).

**The message sits under the description, for every severity.** The help and the message are
both visible, and the control's `aria-describedby` lists the description, then the message, so a
screen reader reads the name, the help, then the message. The help stays where people need it
most: a format or a limit is what they need to fix an error. The cost is a shift when a message
appears: the next field moves down 24 px for a one-line message and 42 px for a two-line one on
a medium Text field (85 px at rest), and 29 px under a Radio group. A message appears after
validation, not while people type (step 7 decides when). The description is not replaced, not
moved above the control, and no line is reserved for the message, which may come back as a
choice of the form's layout in step 10.

Material's text field guidelines say to replace the supporting text with the error text, so the
layout does not shift ([Material: text fields guidelines](https://m3.material.io/components/text-fields/guidelines)),
but its accessibility page reads the supporting text first, then the error text, when a field
shows both ([Material: text fields accessibility](https://m3.material.io/components/text-fields/accessibility)).
WCAG does not mandate any place for an error
([Understanding 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification#intent)),
and Apple only asks to show it right next to the field
([HIG: Writing](https://developer.apple.com/design/human-interface-guidelines/writing#Best-practices)).

## Required fields

A required field tells people before they submit, in a way that does not rely on color, and
tells assistive technology that the field is required.

> **Not decided yet (step 4).** How the mark looks: the word "required" in the label, an
> asterisk explained once at the top of the form, or marking the optional fields instead; the
> asterisk's color; whether assistive technology reads the asterisk or only the required state.
> Today no mark is drawn: the words are left to the author.

### iOS

Apple's guidance draws no required mark: it asks that people understand what is required before
they can go on, for instance by enabling the Next or Continue button only once the required
fields are filled in.

## Severities

A form control can show one of three **severities**, none by default:

- **Error:** the value is not accepted, and the message says how to fix it.
- **Warning:** the value is accepted but deserves attention, and the message says what to check.
- **Success:** the value was checked and confirmed, and the message says what was confirmed.

The word is **error**, not invalid. Every platform's guidance speaks of errors: WCAG calls the
criterion Error Identification
([WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)), Compose has
error semantics, Material writes error text. Invalid is the web's technical term (`aria-invalid`,
`:invalid`, `:user-invalid`), and it stays there. There is no information severity: information
that holds before any check is the description's job, and no source gives a field an information
status. The property is `severity`, and one message carries every severity. It is named after
what component libraries and developers call success, warning and danger alerts, even if the
word is odd for success; status would clash with a specification's own status and with the
WCAG status messages, and intent already means a destructive action on the Button.

The Text field, Number field, Textarea and Select take all three. The Checkbox, the Checkbox
group and the Radio group take the error only: a choice has nothing to confirm or to warn about.
That is our judgment, not a source's.

The border of the control takes the severity's accent functional border color, and the message
its functional text color. An error is always said in text, next to the control; a warning and a
success are said in text the same way, and color or an icon adds to the text, never replaces it.

> **Border contrast.** The accent borders reach the 3:1 a border needs against its surface
> ([WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)) on every surface
> level, in both modes: the Color foundation changed the light warning border and the dark error
> border for it. One shortfall is accepted knowingly: the light warning border is 2.95:1 on the
> subtle warning fill that step 6 may use as the fill (issue #119). The table below measures them.

> **Validated, rendered in step 6.** The severity is also shown in the control's fill, in a solid
> color, never translucent. The severity icon is never drawn inside the area where people type,
> because browsers add their own elements there (autofill, password managers, reveal and clear
> buttons, spinners, pickers). It goes after the control, or at the start of the message, or
> nowhere, and then the message says the severity (**Error: …**); it appears in one place only.
> Without an icon after it, the control keeps its default width and takes the whole width.

### Web

An error is `aria-invalid="true"` on the control, and `:user-invalid` when the browser validates
([MDN: aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid#values)).
That attribute has no value for a warning or a success, so on the web they are the message text
and the styling, and the component carries the severity as `data-severity`.

## When a value is checked

A control is never shown as in error before people used it.

> **Not decided yet (step 7).** When a value is checked by default: when people submit the
> form, when they leave the field, or as they type; and whether the submit action stays
> available while required fields are empty.

### iOS

Apple validates when it makes sense for the field: an email address when people move to
another field, a user name or a password before they leave it.

## How errors are announced

> **Not decided yet (step 8).** Where focus goes after a failed submit (the first field in error
> or the error summary), and how an error that appears without a submit reaches assistive
> technology, on each platform.

### Web

The message is referenced by the control's `aria-describedby` for every severity, and a control
in error carries `aria-invalid="true"`, so the message is read with the field when people reach
it.

### Android

The field exposes its error with the error semantics, so TalkBack reads the error with the field.

## Error summary

> **Not decided yet (step 9).** Whether a form lists its errors above the fields, each naming
> the field, what is wrong and how to fix it, with a link to the field; from how many errors;
> whether it uses the Alert component and receives focus.

## Spacing

> **Not decided yet (step 10).** The space between fields, between groups of fields and before
> the form's actions, and whether they become tokens. Today each control spaces only its own
> parts: a field by its container gap, a group by its row gap.

## Writing messages

- **The label** is a noun phrase naming the information asked for, in sentence case, without a
  colon.
- **The description** gives the format, an example or a limit, only when it is not obvious.
- **The message of an error** says what is wrong and how to fix it, in plain words and without
  blame: **Enter an email address with an @**, not **Invalid email**. A warning says what to
  check, and a success what was confirmed.

> **Not decided yet (step 11).** One set of writing rules for every control: how a message
> names the field in the summary, and whether messages end with a period.

## Accessibility

- **Every control has a visible label, tied to it.** People need to know what to enter, and
  assistive technology announces the label as the control's name
  ([WCAG 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions),
  [WCAG 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships),
  [WAI forms tutorial: labels](https://www.w3.org/WAI/tutorials/forms/labels/)). Related
  controls are grouped under a name, a set of radios always
  ([WAI forms tutorial: grouping](https://www.w3.org/WAI/tutorials/forms/grouping/)).
- **Every input is labelled, in a form or not.** Labels or instructions are owed to the controls
  people enter or choose a value with, not only to the ones inside a form; a button that
  submits a form is activating a control, not changing a setting
  ([WCAG 3.3.2](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions),
  [WCAG 3.2.2](https://www.w3.org/WAI/WCAG22/Understanding/on-input)).
- **Required is visible, not only programmatic.** A required state only exposed to assistive
  technology is not perceivable on screen, and a symbol must be explained before its first use
  ([H90](https://www.w3.org/WAI/WCAG22/Techniques/html/H90),
  [ARIA2](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA2),
  [WAI forms tutorial: validation](https://www.w3.org/WAI/tutorials/forms/validation/#validating-required-input)).
- **Errors are said in text, never by color alone.** The field in error is identified and the
  error described in text; red borders and icons add to it. A warning and a success are said in
  text too
  ([WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification),
  [WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color),
  [WAI forms tutorial: user notification](https://www.w3.org/WAI/tutorials/forms/notifications/)).
  When a fix is known, the message suggests it
  ([WCAG 3.3.3](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion)).
- **In error only after validation.** Marking an untouched field as in error announces an error
  people have not made ([ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21)).
- **Status messages are announced.** A count of errors or a confirmation that appears without
  moving focus is exposed as a status message
  ([WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)).
- **Contrast.** The message text needs 4.5:1 against its surface
  ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)) and a border that
  identifies a control in error 3:1
  ([WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)); the table
  measures them while the severities are rendered.

### iOS

Show errors right next to the field and say how to fix them
([HIG: Writing](https://developer.apple.com/design/human-interface-guidelines/writing#Best-practices));
validate when it makes sense for the field
([HIG: Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields#Best-practices));
make sure people know what is required before they continue
([HIG: Entering data](https://developer.apple.com/design/human-interface-guidelines/entering-data#Best-practices)).

### Android

Expose an error with the error semantics, and announce content that changes without focus with
a polite live region
([Compose semantics: error components](https://developer.android.com/develop/ui/compose/accessibility/semantics#error-components),
[alerts and pop-ups](https://developer.android.com/develop/ui/compose/accessibility/semantics#alerts-pop-ups)).

### Desktop

EN 301 549 applies error identification, labels or instructions and error suggestion to non-web
software as to web content
([EN 301 549, clause 11.3.3](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=76)).
On macOS, Apple's guidance above applies.

## Related

- Every component whose role is an input follows this page; the Tokens tab of the foundation
  lists them.
- [Alert](/components/alert): the candidate for an error summary (step 9).
- [Color](/foundations/color): the error, warning and success colors.
- [Spacing](/foundations/spacing): the scale the spacing between fields will use.
