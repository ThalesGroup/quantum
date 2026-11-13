---
foundation: forms
title: Forms
summary: How every form control is labelled, described, marked as required and validated, and how a form reports its errors, on every platform.
order: 10
---

> **Draft.** This page shows how the Forms foundation will read once it is decided. What it says
> today is what the form controls already do and what every trusted source agrees on; each
> point marked **Not decided yet** is a step of the Forms foundation pull request, decided with
> the team one at a time. Feedback on the shape of the page is welcome now.

## Overview

A form is a set of controls people fill in and submit: text fields, number fields, text areas,
selects, checkboxes, radio groups. Each control has its own page. This page holds what they
share, so that a field behaves like its neighbours and the same way on every platform: what a
field is made of, how a required field is marked, which validation statuses exist and how they
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

## Anatomy of a field

A field stacks four parts, top to bottom:

- **Label.** Names the information asked for. Always visible, also while people type.
- **Control.** The box, the list or the set of options people act on.
- **Description.** Optional help people need to fill the field: a format, an example, a limit.
- **Message.** Shown after validation: what is wrong and how to fix it.

A group of checkboxes or radios has the same parts around its options, with a legend as its
label.

> **Not decided yet (step 3).** Today the message appears under the description, so both are
> visible at once. The Figma prototype shows the message in place of the description, which
> keeps the field's height. Which one do all fields follow, and do groups follow the same?

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

## Validation statuses

Today a control has one status after validation, **invalid**: its border takes the error color
and the error message appears. An error is always said in text, next to the control; the color
adds to the text, never replaces it.

> **Not decided yet (steps 5 and 6).** Whether a form shows **warnings** (the value is accepted
> but deserves a second look) and **successes** (the value is confirmed) as well as errors, and
> how each status renders: border, tinted fill, an icon at the end of the box, the message's
> color. The contrast table below measures today's error, warning and success colors on every
> surface level, in both modes; nothing is required of them yet.

## When a value is checked

A control is never shown as invalid before people used it.

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

The error message is referenced by the control's `aria-describedby` and the control carries
`aria-invalid`, so the message is read with the field when people reach it.

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
- **The error message** says what is wrong and how to fix it, in plain words and without
  blame: **Enter an email address with an @**, not **Invalid email**.

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
- **Required is visible, not only programmatic.** A required state only exposed to assistive
  technology is not perceivable on screen, and a symbol must be explained before its first use
  ([H90](https://www.w3.org/WAI/WCAG22/Techniques/html/H90),
  [ARIA2](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA2),
  [WAI forms tutorial: validation](https://www.w3.org/WAI/tutorials/forms/validation/#validating-required-input)).
- **Errors are said in text, never by color alone.** The field in error is identified and the
  error described in text; red borders and icons add to it
  ([WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification),
  [WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color),
  [WAI forms tutorial: user notification](https://www.w3.org/WAI/tutorials/forms/notifications/)).
  When a fix is known, the message suggests it
  ([WCAG 3.3.3](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion)).
- **Invalid only after validation.** Marking an untouched field invalid announces an error
  people have not made ([ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21)).
- **Status messages are announced.** A count of errors or a confirmation that appears without
  moving focus is exposed as a status message
  ([WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)).
- **Contrast.** The message text needs 4.5:1 against its surface
  ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)) and a border that
  identifies an invalid control 3:1
  ([WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)); the table
  measures them while the statuses are decided.

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

- Components: Text field, Number field, Textarea, Select, Search field, Checkbox, Checkbox
  group, Radio group, Switch, Slider.
- [Alert](/components/alert): the candidate for an error summary (step 9).
- [Color](/foundations/color): the error, warning and success colors.
- [Spacing](/foundations/spacing): the scale the spacing between fields will use.
