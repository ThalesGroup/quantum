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

**Where the label sits is a layout choice.** The anatomy fixes the order and the association,
not the placement. The generic rule, applied as is on the web:

- **Above** a field-like control (Text field, Number field, Search field, Textarea, Select), by
  default. Labels above the fields reduce horizontal scrolling for people who zoom and on small
  screens ([WAI forms tutorial: visual position](https://www.w3.org/WAI/tutorials/forms/labels/#visual-position-of-label-text)).
- **In a column at the start**, when the form's layout asks for it: labels before the fields are
  as predictable as labels above them ([G162](https://www.w3.org/WAI/WCAG22/Techniques/general/G162)).
  The column, its width and whether a field exposes the placement are the form's layout (step 10).
- **After the box** of a checkbox, a radio or a switch.
- **Never inside the box.** No floating label on the web: it needs a taller box (Material's is
  56 px, 20 px taller than a medium Button), and a raised label and the value do not fit in the
  36 px a field shares with the Button.

Above and in a column, a field lines up with a Button of the same size (28, 36 or 44 px), and a
label in a column is centred on the box.

The other platforms follow their own requirements and constraints where they have some, and
the generic rule where they have none. A floating label is allowed where it is the platform's
standard way.

- **Android.** Material's text field label sits inside the container, in the middle while the
  field is empty and at its top once it is selected or filled, always visible; an adjacent label
  aligned to the container's leading edge may take its place
  ([Material: text fields guidelines](https://m3.material.io/components/text-fields/guidelines)).
- **iOS and macOS.** Apple gives no rule on where a text field's label sits; since a placeholder
  disappears when people type, a separate label can be useful
  ([HIG: Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields#Best-practices)).
  On macOS a checkbox has its title on its trailing side, and a radio button is followed by its
  label ([HIG: Toggles](https://developer.apple.com/design/human-interface-guidelines/toggles#Checkboxes)).
- **Windows.** Labels are left-aligned and placed above the input control; labels on the left
  are shown as what not to do ([Windows: Forms](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/forms#labels)).

## Required fields

A required field tells people before they submit, in a way that does not rely on color, and
tells assistive technology that the field is required.

**A form marks the fewer fields, in words.** Most forms ask for more than they leave optional,
so by default required fields carry no mark: each optional field ends its label, or its group's
legend, with "(optional)", and a note before the first field says "All fields are required
unless marked optional." When most fields of a form are optional, it is the other way round:
each required field ends its label or legend with "(required)", and no note is needed, since the
word explains itself. Either way the required control keeps its required state for assistive
technology, and nothing relies on color
([WAI forms tutorial: instructions](https://www.w3.org/WAI/tutorials/forms/instructions/#overall-instructions),
[WAI forms tutorial: validation](https://www.w3.org/WAI/tutorials/forms/validation/#validating-required-input),
[H90](https://www.w3.org/WAI/WCAG22/Techniques/html/H90),
[F81](https://www.w3.org/WAI/WCAG22/Techniques/failures/F81)).

**The form says which fields it marks, once.** Every control that can be marked required carries
the same property, `markedFields` (`optional`, `required`, `none`; `optional` by default), and a
form sets it once, to the same value, for all its controls. Each control then draws its own mark
from its `required` state: "(optional)" when the form marks optional fields and the control is
not required, "(required)" when the form marks required fields and the control is required, so
a mark never contradicts the state. A form that sets nothing follows the default rule; its
author only writes the note. `none` is for a control outside a form, such as a table's filter or
a setting applied at once, and it is the Search field's default, since a search box usually
stands alone.

**The mark is a qualifier of the name.** It follows the label, or the legend, after a word space,
at the label's size, in the regular weight and the description's color, so the name stays the
strongest text of the field; a disabled control draws it in the disabled text color, as its
label. It keeps the label's size on purpose: a smaller mark, the only text of another size next
to the name, draws the eye before the name does. The word says what it means, so neither its
color nor its weight carries meaning
([WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)).

The generic rule has no asterisk. An asterisk is a symbol that must be explained before its
first use ([H90](https://www.w3.org/WAI/WCAG22/Techniques/html/H90)); a word needs no key, and
marking the fewer fields keeps a long form free of repeated marks.

Each platform follows its own guidance where it has some, and the generic rule where it has
none. Android and Windows ask for an asterisk, so required fields carry one there; iOS and macOS
give no mark, so they use the words. Each fact is said once: where the platform has a required
state, the state tells assistive technology and a visible "(required)" is hidden from it.

### Web

"(required)" is hidden from assistive technology: the required attribute already makes screen
readers say "required", and a parenthetical like this may stay out of the accessible name when
the state is exposed another way
([Understanding 2.5.3](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name),
[MDN: aria-required](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-required#examples)).
"(optional)" stays part of the label's text, so it is read with the name: no attribute says that
a field is optional.

### iOS

Apple's guidance draws no required mark: it asks that people understand what is required before
they can go on, for instance by enabling the Next or Continue button only once the required
fields are filled in
([HIG: Entering data](https://developer.apple.com/design/human-interface-guidelines/entering-data#Best-practices)).
The generic words apply. No accessibility trait says that a field is required
([UIKit: UIAccessibilityTraits](https://developer.apple.com/documentation/uikit/uiaccessibilitytraits),
[SwiftUI: AccessibilityTraits](https://developer.apple.com/documentation/swiftui/accessibilitytraits)),
so "(required)" stays in the accessibility label and VoiceOver reads it.

### Android

Material marks each required field with an asterisk after its label, explained once, in
supporting text or in a note before the first field, and asks that the accessibility label
include the asterisk
([Material: text fields, required text indicator](https://m3.material.io/components/text-fields/guidelines#6c36a812-273d-4f5d-9102-2f00386c9145),
[Material: text fields, accessibility](https://m3.material.io/components/text-fields/accessibility#101b7337-c788-41c8-8027-7884da77bc89)).
Quantum follows it on Android, whatever the share of optional fields. The asterisk is red, the
color of the error message and of the error icon, at the label's size and weight, 4 px after the
label (2 px in the small size); the asterisk of the note that explains it is the same red, as
Material asks of the text that explains it. Red is the most common rendering of a required field;
the asterisk, not its color, says what it means.

### Desktop

On Windows, required input is marked with an asterisk on its label
([Windows: Forms](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/forms#2-submitting-with-button)),
explained once before the first field, and drawn as on Android (red, the label's size and weight,
4 px after it); the control sets `AutomationProperties.IsRequiredForForm`
([IsRequiredForForm](https://learn.microsoft.com/en-us/windows/windows-app-sdk/api/winrt/microsoft.ui.xaml.automation.automationproperties.isrequiredforform)).
The asterisk stays in the control's accessible name: Microsoft asks that the UI Automation name
be the label as shown, not a modified version of it
([UI Automation: UIA_NamePropertyId](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-automation-element-propids),
[Windows: accessible name](https://learn.microsoft.com/en-us/windows/apps/design/accessibility/basic-accessibility-information#accessible-name)),
and no page says that Narrator announces `IsRequiredForForm`, so hiding the asterisk could leave
"required" unsaid.
On macOS, Apple gives no mark, so the generic words apply, as on iOS. A required control sets
`accessibilityRequired`
([AppKit: isAccessibilityRequired()](https://developer.apple.com/documentation/appkit/nsaccessibilityprotocol/isaccessibilityrequired())),
so "(required)" is hidden from VoiceOver, as on the web.

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
> border for it, and the light warning border reads the warning text's step, warning 600, as the
> error and success borders read theirs: 6.16:1 at the lowest on the surfaces and 5.86:1 on the
> subtle warning fill. The table below measures them.

**The fill.** A control with a severity is also filled with a solid color, never translucent: the
subtle functional background of its severity, `global.bg.subtle.functional.<severity>.default`
(#FEECEA, #FFF1C7 and #DBFAE6 for an error, a warning and a success in light mode), at rest and on
hover alike. The value and the placeholder keep their colors on it: at the lowest, the placeholder
is 5.42:1 in light mode and 6.48:1 in dark mode, the value 16.91:1 and 11.43:1. The fill does not
darken on hover, whatever the severity: the error hover step would bring the placeholder to 4.33:1
in light mode, under the 4.5:1 text needs
([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)). The error and success
borders keep at least 5.14:1 and 6.16:1 against their fill, the warning border 5.86:1. The border,
not the fill, identifies the control.

**The icon.** The severity icon is optional and appears in one place only, never inside the
area where people type: browsers add their own elements there (autofill, password managers,
reveal and clear buttons, spinners, pickers). It goes **after the control**, which then gives up
the icon and its gap, **at the start of the message**, the control keeping its full width, or
**nowhere**, and then the message says the severity (**Error: …**). The placement is a rule of
the form: every control that can show a severity carries the same property, `severityIcon`
(`after-control`, `message`, `none`; `message` by default), and a form sets it once, to the same
value, for all its controls, so its fields never mix two placements. A checkbox, a radio button
or a group never draws the icon after its control, where its label or its options sit: it offers
`message` and `none`, and a form set to `after-control` shows its icon in the message.
Its glyph says the severity, as the Alert's icons do: `error` for an error, `warning` for a
warning, `check_circle` for a success, so the three differ by shape as well as color. It is named
after its severity ("Error", "Warning", "Success"), in the form's language.
After the control, the icon is the size of the Button's icon at the same size (20, 24 and 24 px
for small, medium and large), 8 px after the control and centred on it, so a field and the
Button next to it carry the same icon. In the message, it is 16 px, the icon size next to the
message's 14 and 16 px text, 4 px before the text.
Its color is the on-base icon color of its severity, the color of the message text (for an
error #C01619 in light mode and #F88275 in dark mode): it sits on the surface in both places,
never on the fill, and keeps at least 5.81:1 in light mode and 5.30:1 in dark mode for an error,
6.16:1 and 8.38:1 for a warning, 7.44:1 and 5.92:1 for a success, over the 3:1 a meaningful icon
needs ([WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)).

**The message** keeps the text color of its severity, the icon's color: for an error #C01619 in
light mode and #F88275 in dark mode, at least 5.81:1 and 5.30:1 on every surface level
([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)). Its color sets it
apart from the description as well as its size, which matters most when there is no icon.

For a warning, the icon and the message read warning 600 (#765818) in light mode and warning 300
(#FFC61C) in dark mode: the Color foundation maps the warning icon role to the warning text, as
it does for the error and the success, so each severity reads one color.

### Web

An error is `aria-invalid="true"` on the control, and `:user-invalid` when the browser validates
([MDN: aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid#values)).
That attribute has no value for a warning or a success, so on the web they are the message text
and the styling, and the component carries the severity as `data-severity`.

## When a value is checked

A control is never shown as in error before people used it.

The recommended default is **late to show, early to clear**:

- A field shows an error when people **leave it after changing it**, and every field is checked
  when people **submit** the form, so a required field people skipped shows its error only then.
- A field never shows a new error **while people type** in it: an email address or a date is
  wrong until it is complete, and checking it on every keystroke "would display error messages
  most of the time" ([WAI: on focus change](https://www.w3.org/WAI/tutorials/forms/notifications/#on-focus-change)).
- An error **clears as people type**, as soon as the value is right; a new error then waits
  until they leave the field again.
- A choice (a checkbox, a radio, an option in a list) is checked when people make it, since
  choosing commits the value.
- A check people try values against, such as an available user name or password rules, may run
  as they type ([WAI: during typing](https://www.w3.org/WAI/tutorials/forms/notifications/#during-typing)).

This is the experience the system recommends, not an obligation: some use cases cannot follow it
(a check only the server can make, a value checked as it is entered by its nature). They choose
another timing, and still never mark a control as in error before people used it
([ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21)).

> **Not decided yet (step 7).** When a warning or a success shows, and whether the submit action
> stays available while required fields are empty.

### Web

A control's user validity turns true when people commit a change, by leaving the field, or
submit the form ([HTML: user validity](https://html.spec.whatwg.org/multipage/input.html#common-input-element-events)),
and [`:user-invalid`](https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid) then
follows the value as people type, both ways. Styled with `:user-invalid` alone, a field that was
checked shows an error again at the first keystroke of an edit; to follow the default, the
product keeps a cleared error hidden until people leave the field.

### iOS

Apple validates when it makes sense for the field: an email address when people move to
another field, a user name or a password before they leave it
([HIG: Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields#Best-practices)).
It gives feedback as soon as it detects a problem, so people can correct it right away
([HIG: Entering data](https://developer.apple.com/design/human-interface-guidelines/entering-data#Best-practices)):
the default checks a field when people leave it and clears its error as soon as it is fixed.

### Android

A field can be checked as people move on from it, in the action of the keyboard's Next key,
which keeps moving focus to the next field
([Compose: keyboard interaction logic](https://developer.android.com/develop/ui/compose/text/user-input#define-logic)).
Material's text field guidelines say nothing about when a value is checked.

### Desktop

macOS follows Apple's guidance above. On Windows, a number box evaluates its value on loss of
focus or Enter ([Number box](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/number-box#enabling-input-validation)),
a password box is validated as people type or once they finish
([Password box](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/password-box#create-a-password-box)),
and a submitted form marks the controls whose input is invalid
([Forms](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/forms#2-submitting-with-button)).

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

## Keyboard in a form

People move through the fields in their reading order, the order that keeps their meaning, from a
physical or an assistive keyboard on every platform
([WCAG 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html#intent)).
A form that is submitted has a submit button, and Enter in a single-line field submits it; the
Textarea takes Enter as a new line. Each field says what Enter does in it; the form sets the label
of the on-screen keyboard's return key, because only the form knows which field comes last.

### Web

- Enter in a single-line field submits the form through its first submit button. A form without
  one and with two fields or more cannot be submitted with Enter, so a form that is submitted
  always has its submit button. A search field that stands alone, the only field of its search
  form, is the exception: Enter submits it, with or without a button
  ([HTML: implicit submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission),
  [H32: Providing submit buttons](https://www.w3.org/WAI/WCAG22/Techniques/html/H32)).
- `enterkeyhint` changes only the label of the key, and Enter submits from every single-line field,
  so a form that sets it names its action on every field (go, send, search, done), never next
  ([HTML: enterkeyhint](https://html.spec.whatwg.org/multipage/interaction.html#attr-enterkeyhint)).

### iOS

- Tabbing between fields moves in a logical sequence. Every field but the last shows the next
  return key and moves focus to the next field in its submit action, with a focus state; the last
  field names the form's action (done, go, send, search) and submits the form
  ([Apple HIG: Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields#Best-practices),
  [Apple HIG: Virtual keyboards](https://developer.apple.com/design/human-interface-guidelines/virtual-keyboards#Best-practices),
  [UIKit: returnKeyType](https://developer.apple.com/documentation/uikit/uitextinputtraits/returnkeytype),
  [SwiftUI: onSubmit](https://developer.apple.com/documentation/swiftui/view/onsubmit(of:_:)),
  [SwiftUI: FocusState](https://developer.apple.com/documentation/swiftui/focusstate)).

### Android

- Tab follows the order the fields appear in. Every field but the last sets the Next IME action,
  which moves focus to the next field by default; the last field sets the form's action (Done,
  Go, Send, Search) and submits the form
  ([Jetpack Compose: focus traversal](https://developer.android.com/develop/ui/compose/touch-input/focus/focus-traversal),
  [Jetpack Compose: keyboard options](https://developer.android.com/develop/ui/compose/text/user-input#keyboard-options)).

### Desktop

- On macOS, the key view loop follows the fields' reading order, and Return in a field sends its
  action ([AppKit: nextKeyView](https://developer.apple.com/documentation/appkit/nsview/nextkeyview),
  [AppKit: NSTextField](https://developer.apple.com/documentation/appkit/nstextfield)). On Windows,
  the tab order, by default the order the controls are added, follows the reading order
  ([Windows: keyboard accessibility](https://learn.microsoft.com/en-us/windows/apps/design/accessibility/keyboard-accessibility#keyboard-navigation-among-ui-elements)).

## Writing messages

- **The label** is a noun phrase naming the information asked for, in sentence case, without a
  colon.
- **The description** gives the format, an example or a limit, only when it is not obvious.
- **The message says the fix**, the same way for every control and every severity. An error is
  the instruction that fixes it: the control's verb and the thing asked for, with the format or
  the limit when there is one, **Enter an email address with an @**, **Enter a quantity between
  1 and 99**, **Choose a delivery method**, not **Invalid email**. An empty required field reads
  like any other error, **Enter your full name**, never **This field is required**: the form
  already said which fields are required. A warning says what to check, **Check the domain: did
  you mean example.com?**, and a success what was confirmed, **This username is available**.
- **Plain words, no blame.** A message speaks to people as you, without robotic words such as
  invalid, interjections, please or we. Apple asks to say how to fix an error, without blame,
  and to avoid robotic messages
  ([HIG: Writing](https://developer.apple.com/design/human-interface-guidelines/writing#Best-practices));
  Material's error text describes how to avoid the error
  ([Material: text fields](https://m3.material.io/components/text-fields/guidelines)); WCAG asks
  for the correction when it is known
  ([WCAG 3.3.3](https://www.w3.org/WAI/WCAG22/Understanding/error-suggestion)). A problem stated
  before the fix doubles the length and wraps most messages to a second line, which pushes the
  next field down; the value usually shows the problem already.

> **Not decided yet (step 11).** The severity word ("Error: …") and who writes it, whether
> messages end with a period and how long they may be, and how a message names its field in an
> error summary.

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
