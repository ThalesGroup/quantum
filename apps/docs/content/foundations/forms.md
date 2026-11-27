---
foundation: forms
title: Forms
summary: What a form control is, and how every form control is labelled, described, marked as required and validated, and how a form reports its errors, on every platform.
order: 10
---

## Overview

A form is a set of controls people fill in and submit. Each control has its own page. This
page says which components are form controls and holds what they share, so that a field looks
and behaves like its neighbours, on every platform: what a field is made of and where its label
sits, how fields are spaced, how a required field is marked, which severities a control can show
and how they look, how messages are written, when a value is checked, how errors are announced
and summarised, how the keyboard moves through a form, and the tokens every control starts from.

**A default, each platform's guidance, then the product.** The system sets a default for every
point. Each platform follows its own guidance where it has some and the default where it has
none, rather than borrowing another platform's rule. A product may still depart from the default
for its own specifics; until it does, the default is the rule. Only the web and Windows have a
forms guide of their own (the W3C forms tutorial,
[Windows: Forms](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/forms)).
Apple covers forms through its text field, data entry and writing guidance, Android through
Material's [text field guidelines](https://m3.material.io/components/text-fields/guidelines).
Where no platform page covers a point, this page says that its rule is the system's judgment.

Everything on this page holds on every platform, except what sits under a sub-heading named
after a platform.

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

**A form submitted with a button holds no Switch.** A switch acts at once, while a value saved
with the form waits for the button, so an on/off value saved with the form is a Checkbox. Material
asks that the effects of a switch start immediately, without needing to save, and to use
checkboxes for options people must save
([Material: switch](https://m3.material.io/components/switch/guidelines)); Windows asks for a
check box when people must click a submit or next button to apply changes
([Windows: toggle switch or check box](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/toggles#choosing-between-toggle-switch-and-check-box)).
Apple says nothing on it, and asks in general not to replace a checkbox with a switch
([HIG: Toggles](https://developer.apple.com/design/human-interface-guidelines/toggles#Switches)).
The Switch stays a form control, with its label rules, for settings that take effect at once
([Switch](/components/switch)).

Which rules a control follows is read from its specification, with no list of exceptions:

- **Every control** follows the anatomy and label rules.
- **A control that can be required** (it has a required property) also follows the rules on
  required fields.
- **A control that can show a severity** (it has a severity property, which sets the error state)
  also follows the rules on severities, errors and their announcement, and says its severity in
  text.

A control that can be required can also show a severity: a missing or wrong value is said in
text next to it. So the Search field, which a form can require
([MDN: making a search input required](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/search#making_input_required)),
has the Text field's severities, message and severity icon; it differs from the Text field only
by its search icon and its return key.

The components that follow this page are the ones whose role is marked as an input; the Tokens
tab lists them with the rules each follows.

A **button that submits is a form action**, not a form control: people activate it, they do not
enter or choose a value with it
([WCAG 3.2.2](https://www.w3.org/WAI/WCAG22/Understanding/on-input)). It does not follow this
page as a control; the rules on [spacing](#spacing) and on the [keyboard](#keyboard-in-a-form)
name it as the form's action.

**The guidelines every control follows are said once, here.** A control's own page keeps what
is its own (its role, its native control, its contrast, focus, targets and motion) and lists,
under it, "From the Forms foundation": the guidelines on labels, and on required fields and
severities when the control has them, read from its specification. The guidelines about the form
as a whole (its actions, its error summary, its announcements, its spacing, its keyboard) stay on
this page. The Specification tab lists every guideline with the tier it belongs to:
`presentation` for every control, `required` for the controls that can be required,
`validation` for those that can show a severity, and none for the form as a whole.

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

**Every control sets its name, help and message at the same sizes**, one per control size, so a
Select or a Radio group under a Text field does not look smaller. The label (or the legend) and
the message share a size and a medium weight, so the fix reads as easily as the name; the
description is smaller at every size. A control with two sizes takes the small and the medium
ones. Options and their labels keep their own styles: they are choices, not names. The sizes are
tokens of the Forms family, drawn on the Tokens tab
([Tokens every control starts from](#tokens-every-control-starts-from)): they are defaults, which
each control's own refinement may revisit.

**Every control that can show a severity has a message part**, after its description, so its
error is said in text next to it and associated with it. A form-wide summary may repeat the
error, never replace it. The standalone Checkbox has its message under its description, aligned
with its label, as its only severity is the error. A Switch shows no severity, so it has no
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
appears: the fields below move down by the height of the message, about 30 px for one line on a
medium Text field. A message appears after validation, not while people type
([When a value is checked](#when-a-value-is-checked)). The description is not replaced, not
moved above the control, and no line is reserved for the message
([Spacing](#spacing)).

Material's text field guidelines say to replace the supporting text with the error text, so the
layout does not shift ([Material: text fields guidelines](https://m3.material.io/components/text-fields/guidelines)),
but its accessibility page reads the supporting text first, then the error text, when a field
shows both ([Material: text fields accessibility](https://m3.material.io/components/text-fields/accessibility)).
WCAG does not mandate any place for an error
([Understanding 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification#intent)),
and Apple only asks to show it right next to the field
([HIG: Writing](https://developer.apple.com/design/human-interface-guidelines/writing#Best-practices)).

## Where the label sits

The anatomy fixes the order of the parts and the association between them, not where the label
sits: that is a layout choice. The generic rule:

- **Above** a field-like control (Text field, Number field, Search field, Textarea, Select), by
  default. Labels above the fields reduce horizontal scrolling for people who zoom and on small
  screens ([WAI forms tutorial: visual position](https://www.w3.org/WAI/tutorials/forms/labels/#visual-position-of-label-text)).
- **In a column at the start**, when the form asks for it: labels before the fields are as
  predictable as labels above them ([G162](https://www.w3.org/WAI/WCAG22/Techniques/general/G162)).
- **After the box** of a checkbox, a radio or a switch.
- **Never inside the box**, unless it is the platform's standard way. A floating label needs a
  taller box (Material's is 56 px, 20 px taller than a medium Button), and a raised label and the
  value do not fit in the 36 px a field shares with the Button.

Above and in a column, a field lines up with a Button of the same size, and a label in a column
is centred on the box.

**The form sets where its labels sit, never a field.** A form chooses once, with its
`labelPlacement` setting (`above`, the default, or `start`), and passes it to every field-like
control it holds, as it passes `markedFields`: a form never mixes labels above and labels at the
start, and with `start` it sizes one column for all its labels. A group's legend sits in that
column, as a field's label does; a checkbox, a radio or a switch keeps its label after the box
whatever the setting. In a design tool the setting is not one of the component's variants, as
`markedFields` is not.

**In the column, each label sits against its control.** Every label and every group legend aligns
to the end of the column, so it ends at the same distance from its control whatever the length of
the others: `form.gap.label-column`, with the other gaps of a form in [Spacing](#spacing). The
column is as wide as the longest label, at most 14 em, and a longer label wraps. A label's first
line is centred on the control's box, and the description and the message stay under the
control. In a right-to-left language the column mirrors: the labels sit to the right of their
fields.

**Why against the control.** What a label column must keep is the bond between each label and its
field:

- **Adjacency.** Every label stays immediately before its field, as G162 places labels, which also
  makes them easier to locate with a screen magnifier
  ([G162](https://www.w3.org/WAI/WCAG22/Techniques/general/G162)). With labels
  aligned to the start instead, one long label widens the column and pushes every short label away
  from its field.
- **RGAA.** Test 11.4.2 asks for a label "visuellement accolée immédiatement" to the left of its
  field, to the right in a right-to-left language
  ([RGAA 11.4](https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/#11.4)): every
  label at the same short distance from its field meets it, whatever the others' lengths.
- **Usability research.** In Matteo Penzo's eye-tracking study of short forms, right-aligned labels
  to the left of the fields cut the number of fixations and the completion time nearly in half compared
  with left-aligned ones, and the eye's jump from a label to its field fell from about 500 ms to
  about 170 to 240 ms ([Penzo, "Label Placement in Forms", UXmatters,
  2006](https://www.uxmatters.com/mt/archives/2006/07/label-placement-in-forms.php); a usability
  study, not an accessibility source, listed among G162's related resources).

**The trade-off: the labels no longer line up.** Their start edge is ragged, so they are harder to
read down as a list. Luke Wroblewski, whose form layouts that study tested, puts it this way: right
alignment makes the association between label and field clear, but the ragged edge weakens a quick
scan of what the form asks for ([Wroblewski, "Web Application Form
Design", 2005](https://www.lukew.com/ff/entry.asp?1502), also listed among G162's related
resources). G162 itself values labels that line up.

**When to keep the labels above.** The column is the form's choice, never the default: a form sets
`labelPlacement: start` to get it, and a narrow form stacks it anyway (below). Labels above, the
default, keep both strengths: each label sits right over its field and the labels read down in one
line. Penzo's study found them best, read with the field in a single eye movement, and advises
right-aligned labels only for forms that put them to the left. Keep them above for a long form or
one people do not know yet, where they first scan the labels to see what is asked; Wroblewski
recommends a left-justified column for unfamiliar data that people scan, which the ragged edge of a
label column would hamper. Choose the column for a short form of familiar fields, where each label
must sit next to its field and vertical space is tight. This is a recommendation: the product's
own constraints decide.

**A narrow form stacks its labels above its fields.** By default the column stacks when the form
itself is narrower than 30 rem (480 px), wherever it sits: a page, a dialog, a side panel. A label
and its input change "to a vertical alignment" when space is limited
([C38](https://www.w3.org/WAI/WCAG22/Techniques/css/C38)), and the form then reads at a width of
320 CSS px without scrolling in two dimensions
([WCAG 1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)). No source gives the
threshold: 30 rem leaves room for a 14 em column, its gap and a control of about 240 px. It is a
default: a product may keep the column at smaller widths, or move the threshold, when its labels
and controls still fit, as long as the form still reflows at 320 CSS px.

### Web

The rule applies as it is. The form is a size container, and a container query on its own width
stacks the labels, with no script, so they also stack when people zoom in.

### iOS

Apple gives no rule on where a text field's label sits; since a placeholder disappears when people
type, a separate label can be useful
([HIG: Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields#Best-practices)),
so the generic rule applies. At larger Dynamic Type sizes, horizontally adjacent views may need to
stack vertically
([HIG: Layout, adaptability](https://developer.apple.com/design/human-interface-guidelines/layout#Adaptability)):
a label column stacks at the largest text sizes, whatever the form's width.

### Android

Material's text field label sits inside the container, in the middle while the field is empty and
at its top once it is selected or filled, always visible; an adjacent label aligned to the
container's leading edge may take its place
([Material: text fields guidelines](https://m3.material.io/components/text-fields/guidelines)).
This floating label is the platform's standard way, so it is allowed on Android. A label column
stacks at the largest font sizes, where a label beside its control no longer fits.

### Desktop

On macOS, Apple gives no rule on where a text field's label sits, as on iOS; a checkbox has its
title on its trailing side, and a radio button is followed by its label
([HIG: Toggles](https://developer.apple.com/design/human-interface-guidelines/toggles#Checkboxes)).
On Windows, labels are left-aligned and placed above the input control; labels on the left are
shown as what not to do ([Windows: Forms](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/forms#labels)),
so a form's `labelPlacement` stays `above` on Windows, whatever the form sets.

## Spacing

**Two fields are 16 px apart, at every size.** The space runs from the bottom of a field's last
part (its control, its description or its message) to the next field's label, `space.16` on the
spacing scale. A Checkbox group or a Radio group is one field here: its options form one control,
so it stands 16 px from its neighbours like a Text field. The label then sits much closer to its own
control than to the field above it, so people see at once which control each label names: the WAI
forms tutorial asks for "a close and distinct visual relationship between the label and the form
control" ([WAI forms tutorial: visual position of label text](https://www.w3.org/WAI/tutorials/forms/labels/#visual-position-of-label-text)),
and Apple asks to leave enough space between text fields that people can see which field belongs
with each label ([HIG: text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields#Best-practices)).
Neither gives a value: 16 px is the system's choice. When a message appears under a field, the
field grows and the fields below move down; the space between fields stays the same.

**Groups of fields are 32 px apart, and a group's title sits 12 px above its first field.** A
group of fields is a section of the form with its own title, such as a delivery address. Two
groups stand twice as far apart as two fields (`space.32`), from the bottom of a group's last field
to the next group's title, so the space alone shows where a group ends. The title sits closer to
its first field (`space.12`) than the fields are to each other, so it reads as theirs and not as
the end of the group above. Apple groups related items with "negative space, container shapes, or
separator lines" ([HIG: layout, visual hierarchy](https://developer.apple.com/design/human-interface-guidelines/layout#Visual-hierarchy));
here the space does it. A Checkbox group or a Radio group is not a group of fields: it is one
control and keeps the field gap. The space is not the only sign: the grouping is also in the code,
a fieldset and its legend on the web, as the WAI forms tutorial asks
([WAI forms tutorial: grouping controls](https://www.w3.org/WAI/tutorials/forms/grouping/)).

**The actions take the gap of what precedes them.** A form's actions, its submit button and the
buttons next to it, sit at the field gap under the last field of a form without groups, and at the
group gap under the last group of a grouped form. They act on the whole form, not on its last
group: after groups they stand apart as a group does, and in a plain form they are one more row.
The buttons stand 8 px apart. No trusted page gives the space before a form's actions.

**The gaps are tokens.** The spaces of a form's layout are semantic tokens the design system
adds, since the Figma library has none for them: `form.gap.field` between two fields,
`form.gap.group` between two groups of fields, `form.gap.title` between a group's title and its
first field, and `form.gap.label-column` between a label column and its controls. The last two
share a value, not a meaning: a title introduces the fields under it, a label in the column names
the control beside it, so each has its own token. The actions take the field or the group gap,
whichever precedes them, and have no token of their own. A form's layout reads these tokens rather
than the scale steps behind them, so a platform can give them its own values, and Figma and Penpot
get them as variables. They are the same on every platform today; the Tokens tab draws them.

**Inside a field and a group, the parts are 6 px apart.** A field's label, control, description
and message stack 6 px apart, so the label sits nearer to its own control than to anything else. A
group takes the same 6 px from its legend to its options, from its description to its options and
from its options to its message. Its description sits right under the legend, with no space, so
the two read as one heading; its options stack 4 px apart (16 px in a row), closer than the parts
around them, so the list reads as one unit. The 6 px between a control's parts is a token of the
Forms family ([Tokens every control starts from](#tokens-every-control-starts-from)), which each
control's gap points to; a group's 4 px, 16 px and 0 are its own tokens. At these values a small
option is 21 px tall and 25 px from the next one, so the 24 px circles of the spacing exception
clear each other
([WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).

### iOS

Each option of a checkbox or radio group reaches Apple's 44 by 44 pt hit region as a row at least
44 pt tall, 4 pt from the next: options so close cannot share the room between them as a field's
hit region does ([Apple HIG: accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).
The other gaps stay as on the web and grow with Dynamic Type.

### Android

Material's Checkbox and RadioButton set a 48 dp minimum themselves when they can receive actions
([Compose: minimum target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes)):
each option row is at least 48 dp tall, 4 dp from the next. The other gaps stay as on the web.

### Desktop

Windows spaces individual input controls 24 px apart and groups of input controls 48 px apart
([Windows: Forms, spacing](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/forms#spacing)).
The design system keeps 16 px between fields and 32 px between groups on every platform, Windows
included: recorded differences, not platform values. Windows puts 8 epx between buttons
([Windows: spacing and gutters](https://learn.microsoft.com/en-us/windows/apps/design/style/spacing#spacing-and-gutters)),
the space between a form's actions. The same page gives 8 epx between a control and its header and
12 epx between a control and its label, where the design system keeps 6 px: a recorded difference,
which a Windows product may override.

On macOS, Apple's minimum control size is 20 by 20 pt
([Apple HIG: accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)):
an option row, 21 pt small and 24 pt medium, meets it, so the web's values apply as they are.

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
The note holds for every control of the form with no exception: none of them is a Switch, which
can be neither required nor marked, since an on/off value saved with the form is a Checkbox
([What a form control is](#what-a-form-control-is)).

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

**A required Checkbox group asks for at least one option.** No box carries `required`: on a
checkbox it requires that very box, so on one box the browser asks for that option and on every
box for all of them, never for one of several
([HTML: Checkbox state](https://html.spec.whatwg.org/multipage/input.html#checkbox-state-(type=checkbox))).
The product checks the group when the form is submitted and its message says "Choose at least
one". Its legend's "(required)" is not hidden: no state says that a group is required, since
`aria-required` is not supported on the `group` role of a fieldset
([WAI-ARIA 1.2: aria-required](https://www.w3.org/TR/wai-aria-1.2/#aria-required),
[HTML-AAM: fieldset](https://www.w3.org/TR/html-aam-1.0/#el-fieldset)), so the word is part of
the group's name. A set of consents that must all be accepted is a set of separate required
Checkboxes. A Radio group keeps `required` on its radios, which makes the whole group required
([HTML: Radio Button state](https://html.spec.whatwg.org/multipage/input.html#radio-button-state-(type=radio))),
and its legend's "(required)" stays hidden like a field's.

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
color of the error message and of the error icon, at the label's size and weight, a little after
the label; the asterisk of the note that explains it is the same red, as Material asks of the text
that explains it. Red is the most common rendering of a required field; the asterisk, not its
color, says what it means.

### Desktop

On Windows, required input is marked with an asterisk on its label
([Windows: Forms](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/forms#2-submitting-with-button)),
explained once before the first field, and drawn as on Android; the control sets
`AutomationProperties.IsRequiredForForm`
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
- **Success:** the value was checked and confirmed, by a check people cannot make themselves,
  and the message says what was confirmed ([When a value is checked](#when-a-value-is-checked)).

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
That is the system's judgment, not a source's.

**Never by color alone.** The border of the control takes the severity's accent border color,
and the message its text color. An error is always said in text, next to the control; a warning
and a success are said in text the same way, and color or an icon adds to the text, never
replaces it ([WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)).

**The border** reaches the 3:1 a border needs against its surface
([WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)), on every surface
level, in both modes, and against the severity's fill; the Color foundation changed the light
warning border and the dark error border for it, so that each severity's border reads its text's
step. The Specification tab measures every pair.

**The fill.** A control with a severity is also filled with a solid color, never translucent: the
subtle background of its severity, at rest and on hover alike. The value and the placeholder keep
their colors on it, above the 4.5:1 text needs. The fill does not darken on hover, whatever the
severity: the error hover step would bring the placeholder to 4.33:1 in light mode, under that
minimum ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)). The border,
not the fill, identifies the control.

**A choice control fills its empty boxes.** An unchecked checkbox or radio box in error takes the
same subtle error fill inside its error border, at rest and on hover, so every control in error
looks alike; a checked or indeterminate box keeps its brand fill, so checked still reads checked.
On a 16 to 24 px box the tint is barely seen (1.03 to 1.37:1 against the surface): the border and
the message carry the error
([WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast),
[WCAG 1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color)).

**The icon.** The severity icon is optional and appears in one place only, never inside the
area where people type: browsers add their own elements there (autofill, password managers,
reveal and clear buttons, spinners, pickers). It goes **after the control**, which then gives up
the icon and its gap, **at the start of the message**, the control keeping its full width, or
**nowhere**, and then the message's own words say the severity
([Writing messages](#writing-messages)).

The placement is a rule of the form: every control that can show a severity carries the same
property, `severityIcon` (`after-control`, `message`, `none`; `message` by default), and a form
sets it once, to the same value, for all its controls, so its fields never mix two placements. A
checkbox, a radio button or a group never draws the icon after its control, where its label or
its options sit: it offers `message` and `none`, and a form set to `after-control` shows its icon
in the message.

Its glyph says the severity, as the Alert's icons do: `error` for an error, `warning` for a
warning, `check_circle` for a success, so the three differ by shape as well as color. It is named
after its severity ("Error", "Warning", "Success"), in the form's language. After the control, the
icon is the size of the Button's icon at the same size, centred on the control (on the first line
of a Textarea), so a field and the Button next to it carry the same icon; in the message, it is
the icon size that goes with the message's text. Its color is the on-base icon color of its
severity, the color of the message text: it sits on the surface in both places, never on the
fill, and keeps more than the 3:1 a meaningful icon needs
([WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)).

**The message** keeps the text color of its severity, the icon's color, at 4.5:1 or more on every
surface level ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)). Its
color sets it apart from the description as well as its size, which matters most when there is no
icon. The Color foundation maps each severity's icon role to its text color, the warning's
included, so each severity reads one color.

### Web

An error is `aria-invalid="true"` on the control, and `:user-invalid` when the browser validates
([MDN: aria-invalid](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-invalid#values)).
That attribute has no value for a warning or a success, so on the web they are the message text
and the styling, and the component carries the severity as `data-severity`.

## Writing messages

- **The label** is a noun phrase naming the information asked for, in sentence case, without a
  colon.
- **The description** gives the format, an example or a limit, only when it is not obvious.
- **The message says the fix**, the same way for every control and every severity. An error is
  the instruction that fixes it: the control's verb, with the format or the limit when there is
  one, **Include an @, as in name@example.com**, **Enter a number between 1 and 99**, **Choose
  one**, not **Invalid email**. An empty required field reads like any other error, **Enter it as
  on your ID**, never **This field is required**: the form already said which fields are
  required. A warning says what to check, **Check the domain: did you mean example.com?**, and a
  success what was confirmed, **This one is available**.
- **The message relies on its label.** It sits under the label and does not repeat the field's
  name: under **Email address**, **Include an @, as in name@example.com**, not **Enter an email
  address with an @**. A screen reader reads the label first, as the control's name, then the
  message, so the name is not said twice. The WAI tutorial's inline messages rely on their label
  the same way, **Use the format MM/YYYY.**
  ([WAI forms tutorial: user notification](https://www.w3.org/WAI/tutorials/forms/notifications/#after-submit)).
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
- **Without an icon, the words say the severity.** When the form shows no icon, nothing but
  color tells an error from a warning or a success, so the message's own words do: the fix of an
  error, what to check for a warning, what was confirmed for a success. When an icon shows, its
  name says the severity, so a message does not start with **Warning:** next to it, which would
  be said twice, on screen and to a screen reader. This is a guideline: the component writes no
  severity word and checks nothing, since it cannot know where a message comes from. A project
  that cannot write its own messages, because they come from a backend it cannot change or do
  not say their severity, adapts them: it starts them with the severity's word and its
  language's colon, **Error: …**, **Erreur : …** in French, as the WAI tutorial shows it
  ([WAI forms tutorial: user notification](https://www.w3.org/WAI/tutorials/forms/notifications/#after-submit)),
  unless they already start with it.
- **One sentence, no period.** A message or a description is one sentence in sentence case, a
  second only when the fix needs it, about one line at the field's default width and two lines
  at most, so it does not push the next field down. A single sentence ends with no period,
  **Choose a country**, **We send the receipt to this address**; two sentences each end with
  their period, **Enter at least 20 characters. You have entered 10.**; a question keeps its
  mark, **Check the domain: did you mean example.com?** This is Material's rule, which asks to
  avoid periods on single sentences and to use them on multiple sentences
  ([Material: grammar and punctuation](https://m3.material.io/foundations/content-design/style-guide/grammar-and-punctuation)),
  and departs from Apple's examples and the WAI tutorial's, which end with a period
  ([HIG: Alerts](https://developer.apple.com/design/human-interface-guidelines/alerts#Content),
  [WAI forms tutorial: user notification](https://www.w3.org/WAI/tutorials/forms/notifications/#inline)).
  A screen reader gets the description and the message as one string joined by a space
  ([Accessible Name and Description Computation](https://www.w3.org/TR/accname-1.2/#mapping_additional_nd_description)),
  so without a period they run on when read, *…to this address Enter an email…*; with an icon,
  its name falls between them.
- **A summary entry adds the label.** In an [error summary](#error-summary), each entry is the
  field's label as it is written, without its required or optional mark, a colon, then the
  message as it is written, the whole entry a link to the field: **Country: Choose one**. An
  entry whose message is empty shows the label alone, still as a link. So the summary always says
  which field is in error, even when a backend sends no message, or the same bare code for several
  fields: the label is always there. The message is written once, and the summary composes the
  entry, so the two never disagree. The WAI tutorial's list of errors references each control's
  label and links to the control, and WCAG's techniques link each error to its field and name the
  fields left empty
  ([WAI forms tutorial: listing errors](https://www.w3.org/WAI/tutorials/forms/notifications/#listing-errors),
  [G139](https://www.w3.org/WAI/WCAG22/Techniques/general/G139),
  [G83](https://www.w3.org/WAI/WCAG22/Techniques/general/G83)). The message keeps its own casing
  after the colon: Microsoft's style guide lowercases the word after a colon in a sentence, Apple's
  capitalizes a complete sentence after it
  ([Microsoft Writing Style Guide: colons](https://learn.microsoft.com/en-us/style-guide/punctuation/colons),
  [Apple Style Guide: colons](https://support.apple.com/guide/applestyleguide/c-apsgb744e4a3/web)),
  and no source settles it for a summary, so the simpler choice holds: the summary changes
  nothing in the message, whatever its language or its source.

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

**A warning** follows the error's timing: it shows when people leave a field they changed, or on
submit, and clears as they type. No source gives a warning a timing of its own; it follows the
error because its value is checked the same way, and since the value is accepted, a warning never
blocks the submit.

**A success** shows only for a check people cannot make themselves, such as an available user
name or a verified code, when that check runs: the WAI tutorial confirms a user name as people
type it ([WAI: binary messages](https://www.w3.org/WAI/tutorials/forms/notifications/#binary-messages)).
A field whose value merely passes its checks, a name filled in or an email address well formed,
shows no success: people only need to know when something is wrong, and a mark on every field
would add noise to each one. The WAI tutorial's in-line example marks every valid field after a
submit ([WAI: in-line feedback](https://www.w3.org/WAI/tutorials/forms/notifications/#inline));
the system keeps that for the checks people could not make. A success or a warning that appears
without moving focus is a status message
([Understanding 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html#intent)),
announced as [How errors are announced](#how-errors-are-announced) says.

**The submit button stays enabled** while required fields are empty: people can always submit,
and submitting shows the error of every required field they left empty, so they learn what is
missing ([WAI: after submit](https://www.w3.org/WAI/tutorials/forms/notifications/#after-submit)).
This is the generic rule, applied as is on the web and on Android. iOS, macOS and Windows ask for
the opposite, and there the submit button is disabled until the required fields are filled; the
required marks tell people what keeps it disabled.

### Web

A control's user validity turns true when people commit a change, by leaving the field, or
submit the form ([HTML: user validity](https://html.spec.whatwg.org/multipage/input.html#common-input-element-events)),
and [`:user-invalid`](https://developer.mozilla.org/en-US/docs/Web/CSS/:user-invalid) then
follows the value as people type, both ways. Styled with `:user-invalid` alone, a field that was
checked shows an error again at the first keystroke of an edit; to follow the default, the
product keeps a cleared error hidden until people leave the field. A warning and a success have
no web state ([Severities](#severities)), so the browser never shows them: the product sets
`severity` itself, at the same moments.

The submit button stays enabled. A disabled button leaves the tab order
([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#focusabilityofdisabledcontrols)),
a form whose default button is disabled is not submitted with Enter
([HTML: implicit submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission)),
and an inactive button is exempt from contrast
([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)), whose
Understanding page gives this very button as its example: people would not find out what is
missing.

### iOS

Apple validates when it makes sense for the field: an email address when people move to
another field, a user name or a password before they leave it
([HIG: Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields#Best-practices)).
It gives feedback as soon as it detects a problem, so people can correct it right away
([HIG: Entering data](https://developer.apple.com/design/human-interface-guidelines/entering-data#Best-practices)):
the default checks a field when people leave it and clears its error as soon as it is fixed.
Apple confirms that a task has completed only when it is significant, since people only need to know
when it does not ([HIG: Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback#Best-practices)):
a field confirms only a check people cannot make themselves. Apple makes a button such as Next
or Continue available only after people enter the data the app requires
([HIG: Entering data](https://developer.apple.com/design/human-interface-guidelines/entering-data#Best-practices)):
on iOS the submit button is disabled until the required fields are filled.

### Android

A field can be checked as people move on from it, in the action of the keyboard's Next key,
which keeps moving focus to the next field
([Compose: keyboard interaction logic](https://developer.android.com/develop/ui/compose/text/user-input#define-logic)).
Material's text field guidelines say nothing about when a value is checked, nor about a warning
or a success, nor about disabling the submit button; the generic rule applies, and the submit
button stays enabled.

### Desktop

macOS follows Apple's guidance above: the submit button is disabled until the required fields are
filled. On Windows, a number box evaluates its value on loss of focus or Enter
([Number box](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/number-box#enabling-input-validation)),
a password box is validated as people type or once they finish
([Password box](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/password-box#create-a-password-box)),
and a submitted form marks the controls whose input is invalid
([Forms](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/forms#2-submitting-with-button)).
Windows says nothing about when a warning or a success shows; the default applies. Windows
disables the submit button until all required information is filled in
([Forms](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/forms#2-submitting-with-button)).

## How errors are announced

When an error appears as people leave a field, focus is already on the next one: the message
appears where they no longer are. The form announces it, politely, as the field's label, a
colon and the message ("Email address: Include an @, as in name@example.com"), the same string
as the field's entry in the [error summary](#error-summary). The message relies on its label
([Writing messages](#writing-messages)), so announced alone it would not say which field it
concerns; with the label, the field in error is identified
([WCAG 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification)) and the
announcement is a status message, reaching people without moving their focus
([WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages),
[situation B and ARIA19](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html#techniques)).

**Politely, not assertively.** An assertive announcement interrupts people and may clear what
the screen reader was about to say, here the name of the field they just reached; WAI-ARIA asks
authors not to use it unless the interruption is imperative
([WAI-ARIA 1.2: aria-live](https://www.w3.org/TR/wai-aria-1.2/#aria-live)), and Android asks for
polite in most cases
([Compose semantics: alerts and pop-ups](https://developer.android.com/develop/ui/compose/accessibility/semantics#alerts-pop-ups)).
A polite announcement waits for the field's name, and the error is checked again when people
submit. This departs from two sources: the WAI tutorial's on-focus-change example uses an
assertive live region
([WAI: on focus change](https://www.w3.org/WAI/tutorials/forms/notifications/#on-focus-change)),
and Material gives a text field's error text an alert role. The system follows the sources'
general rule over their examples, as screen reader best practice rather than from its own use of
screen readers.

**The form owns the announcement**, as it owns the summary: the controls render nothing for it.

**A warning and a success are announced the same way.** A warning shown as people leave a
field and a success from a check people cannot make themselves
([When a value is checked](#when-a-value-is-checked)) also appear where people no longer look,
or while they type. Both are status messages: a warning is situation B of 4.1.3
([ARIA19](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19)), a success the result of an
action, situation A
([ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22),
[Understanding 4.1.3: techniques](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html#techniques)).
The form announces them politely, through the same means, with the same string: "Email
address: Check the domain: did you mean example.com?", "Username: This one is available". One
rule and one string for every severity; the WAI tutorial announces an available user name
politely as people type
([WAI: binary messages](https://www.w3.org/WAI/tutorials/forms/notifications/#binary-messages)).

**A cleared error is silent.** When an error clears as people type, nothing is announced. No
source asks for it: a live region ignores removals by default and keeps them, sparingly, for
important changes
([WAI-ARIA 1.2: aria-relevant](https://www.w3.org/TR/wai-aria-1.2/#aria-relevant)). People hear
their own keystrokes, the field no longer reads as in error when they come back to it, and the
submit checks every field again. Announcing "no error" would talk over their typing.

**After a failed submit, focus moves to the errors.** When the form has an
[error summary](#error-summary), its title takes focus: people hear how many errors it lists
("There are 2 errors in this form"), then every entry, "Label: message", each a link to its
field. This is what
[G139](https://www.w3.org/WAI/WCAG22/Techniques/general/G139#example-3-client-side-error-checking-with-no-popup)
(example 3) and [SCR32](https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR32) do.
When it has none, the first field in error takes focus and reads its label and its error, as the
WAI tutorial advises after submit
([WAI: after submit](https://www.w3.org/WAI/tutorials/forms/notifications/#after-submit)) and as
browsers do when their own validation stops a submit
([HTML: interactively validate the constraints](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#interactively-validate-the-constraints),
[Understanding 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification#user-agent-native-html-form-validation)).
Focus moves once per submit, and the move itself announces the summary or the field: a message
that takes focus is a change of context, not a status message
([Understanding 4.1.3: excepted examples](https://www.w3.org/WAI/WCAG22/Understanding/status-messages#excepted-examples)),
so nothing else is announced. Leaving focus on the submit button would leave people at the
bottom of the form with a polite message they can miss; moving it to the first field while a
summary is shown would skip the summary.

Each platform follows its own guidance where it has some (when to check a value on Apple,
Material's error semantics on Android, the marked fields of Windows), and the behaviour above
where it has none, through the means named below. No Apple, Android or Windows page says how a
form's errors reach the screen reader or where focus goes after a failed submit, nor covers
announcing a warning, a success or a cleared error: the means below are the system's judgment,
and every platform keeps for a warning and a success the means it uses for an error.

### Web

One hidden live region per form, `aria-live="polite"`, present in the initial markup, since a
region added along with its content may not be announced
([MDN: ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)),
filled with "Label: message" when an error or a warning appears on leaving a field, or a
success when its check runs
([ARIA19](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19)). Not `role="alert"`, which is
assertive ([WAI-ARIA 1.2: alert](https://www.w3.org/TR/wai-aria-1.2/#alert)). A second region
with `role="status"` for successes is not needed: that role is itself a polite live region
([WAI-ARIA 1.2: status](https://www.w3.org/TR/wai-aria-1.2/#status)). When an error clears, the
region is not filled or emptied to say so. The message is also referenced by the control's
`aria-describedby` for every severity, and a control in error carries `aria-invalid="true"`, so
the message is read with the field when people come back to it.

After a failed submit, the summary's title takes focus with `focus()`; `tabindex="-1"` makes it
focusable without adding it to the tab order
([MDN: tabindex](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/tabindex)).
Without a summary, the first field in error takes focus. On a page the server sends back, the
`autofocus` attribute does it without script ([Error summary](#error-summary)).

### iOS

Apple asks apps to tell VoiceOver when visible content changes
([HIG: VoiceOver](https://developer.apple.com/design/human-interface-guidelines/voiceover#Navigation)).
The form posts an announcement of "Label: message" for an error or a warning that appears on
leaving a field and for a success when its check runs
([AccessibilityNotification.Announcement](https://developer.apple.com/documentation/accessibility/accessibilitynotification/announcement),
iOS 17) at low priority. A high priority interrupts other speech and cannot be interrupted;
Apple's accessibility references do not define low and default, so low is the system's choice
for a message that must not cut off the field people reached. Apple asks that all feedback be
accessible, VoiceOver included
([HIG: Feedback](https://developer.apple.com/design/human-interface-guidelines/feedback#Best-practices)),
which a warning and a success announced like an error satisfy.

After a failed submit, the form posts a layout-changed notification with the error summary as
the element VoiceOver moves to
([AccessibilityNotification.LayoutChanged](https://developer.apple.com/documentation/accessibility/accessibilitynotification/layoutchanged),
iOS 17; [layoutChanged](https://developer.apple.com/documentation/uikit/uiaccessibility/notification/layoutchanged)
on UIKit), or sets an
[accessibility focus state](https://developer.apple.com/documentation/swiftui/accessibilityfocusstate)
on it. Without a summary, it moves focus to the first field in error with its
[focus state](https://developer.apple.com/documentation/swiftui/focusstate), as Apple's own
example does when people sign in with a field left empty, and posts the layout-changed
notification with that field.

### Android

A polite live region holds "Label: message" when an error or a warning appears on leaving a
field, or a success when its check runs
([Compose semantics: alerts and pop-ups](https://developer.android.com/develop/ui/compose/accessibility/semantics#alerts-pop-ups)),
and the field exposes its error with the error semantics, so TalkBack reads the error with the
field when people come back to it. Material gives the error text an alert role, so it is also
announced when it appears, on its own, without the label
([Material: text fields, accessibility](https://m3.material.io/components/text-fields/accessibility)):
a message that relies on its label then does not say which field it concerns. Focused, the field
reads its error with its label, and the error summary names the field; no source gives a way to
add the label to Material's announcement itself.

After a failed submit, a
[FocusRequester](https://developer.android.com/develop/ui/compose/touch-input/focus/change-focus-behavior#use-focus-requester)
requests focus for the error summary, or for the first field in error, from the submit's
callback. No Android page says that TalkBack follows a requested focus, or how to move TalkBack
to an element that is not a control.

### Desktop

On macOS, the form posts the same low-priority announcement as on iOS (macOS 14, or
[announcementRequested](https://developer.apple.com/documentation/appkit/nsaccessibility-swift.struct/notification/announcementrequested)
on AppKit). On Windows, an element whose `LiveSetting` is `Polite`, non-interruptive
([AutomationProperties.LiveSetting](https://learn.microsoft.com/en-us/windows/windows-app-sdk/api/winrt/microsoft.ui.xaml.automation.automationproperties.livesetting),
[AutomationLiveSetting](https://learn.microsoft.com/en-us/windows/windows-app-sdk/api/winrt/microsoft.ui.xaml.automation.peers.automationlivesetting)),
is named "Label: message", for an error, a warning or a success: the WinUI API for content
that changes.

After a failed submit, macOS moves focus as iOS does. On Windows, the error summary, or the
first field in error, takes focus through its `Focus` method with the focus state
`Programmatic`
([Programmatic focus navigation](https://learn.microsoft.com/en-us/windows/apps/develop/input/focus-navigation-programmatic)).
Windows' Forms page asks only to mark the fields with invalid input and to require a resubmit
([Windows: Forms](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/forms#2-submitting-with-button)).

## Error summary

**A summary is optional, never mandatory.** It lists the form's errors above its fields, each
entry a link to its field. By default, a form shows one after a failed submit when two fields or
more are in error. With a single error, it shows none: focus moves to that field, which reads its
label and its message ([How errors are announced](#how-errors-are-announced)), and a list of one
would only repeat it. A product may decide never to show a summary: a short form such as a
sign-in, an email and a password, gains nothing from one.

**No source gives a number.** The WAI tutorial lists the errors when errors occur, and WCAG's
techniques list any number of them
([WAI forms tutorial: listing errors](https://www.w3.org/WAI/tutorials/forms/notifications/#listing-errors),
[G139](https://www.w3.org/WAI/WCAG22/Techniques/general/G139),
[SCR32](https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR32)). WCAG 3.3.1 mandates
no particular way of showing errors: at the start of the form, inline next to each field, in an
alert or in a dialog
([Understanding 3.3.1](https://www.w3.org/WAI/WCAG22/Understanding/error-identification#intent)).
So a form meets it with or without a summary; from two errors is the system's choice.

**When there is one, the rules already set apply.** Its title takes focus after a failed submit,
each entry is the field's label, a colon, then its message, as a link to the field
([Writing messages](#writing-messages)), and the announcements stay the same. After people fix
one of two errors and submit again, one error is left: the summary goes, and focus moves to the
remaining field.

**A component of its own renders it, not the Alert.** An alert must not affect keyboard focus
([APG: Alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)), and when focus moves to a
message, WAI-ARIA asks for an alertdialog instead of an alert
([WAI-ARIA 1.2: alert](https://www.w3.org/TR/wai-aria-1.2/#alert)). The summary's title takes
focus after a failed submit, so the summary carries no alert role: the focus move announces it.
An Error summary component renders it, a title that takes focus and a list of links to the
fields. The design system does not have it yet
([#129](https://github.com/ThalesGroup/quantum/issues/129)); this page sets its behaviour.

**Its title states the count.** "There are 3 errors in this form": a statement of how many errors
the form has, the heading the WAI tutorial gives as its example
([WAI forms tutorial: listing errors](https://www.w3.org/WAI/tutorials/forms/notifications/#listing-errors)),
counted as SCR32's heading counts them
([SCR32](https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR32)). The number is the
number of entries, one per field in error, and the title is one sentence with no period, like a
message ([Writing messages](#writing-messages)). The title states; the entries say the fix. The
title is not a message, so "a message says the fix" applies to each entry, "Label: message",
never to the title.

The Error summary component holds this English title as its default, and the product passes its
own, translated and pluralised. A number joined to a word does not translate: English has two
plural forms (one, other), other languages up to six (Arabic: zero, one, two, few, many, other),
and the language's plural rules pick the form from the number
([MDN: Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules)).
So the title is one plural string per language, with every form of that language, even though a
summary lists two errors or more by default.

**Its entries are the errors, in the form's order.** One entry per field in error, in the order
the fields appear in the form, as SCR32 builds its list by walking the form's fields. A warning
never blocks the submit ([When a value is checked](#when-a-value-is-checked)), so it stays under
its field and the summary leaves it out: the list holds what stops the submit, and the title
counts exactly its entries.

**It sits at the top of the form.** The summary is the first thing inside the form, after its
heading and introduction, above the first field. It comes before the fields it lists, so what
people see, what a screen reader reads and where focus goes next agree: from the title, people
move through the entries, then to the first field
([Understanding 1.3.2](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence#intent),
[Understanding 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html#intent)). On a
page that is only the form, that is the top of the page, before the form, where the WAI tutorial
and G139 put it
([WAI forms tutorial: listing errors](https://www.w3.org/WAI/tutorials/forms/notifications/#listing-errors),
[G139](https://www.w3.org/WAI/WCAG22/Techniques/general/G139)); SCR32 puts it at the top of the
form ([SCR32](https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR32)). The top of the
form still holds where the top of the page does not: a form in a dialog or a side panel shows it at
the top of that form, never behind it on the page, and a page with several forms shows each one's
summary above its own fields. Its title is a heading one level below the form's heading, or below
the page's when the form has none.

**It shows the errors of the last submit.** Fixing a field clears that field's error
([When a value is checked](#when-a-value-is-checked)), but the summary stays as it is: its title
and its entries are those of the last submit. Each submit checks every field and rebuilds it, its
count and its entries, and its title takes focus again; with one error left, the summary goes and
focus moves to that field; with none, the form is sent. SCR32 builds its list in the form's submit
handler and replaces the existing list with the new one
([SCR32](https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR32)), and the WAI tutorial
gives its feedback when a form is submitted
([WAI forms tutorial: overall feedback](https://www.w3.org/WAI/tutorials/forms/notifications/#overall-feedback)).
This holds whoever checks the values, the browser, the app or the server, and needs no script
beyond the submit's own. The cost: until people submit again, the summary can list a field they
already fixed.

**A product may update it live, when every check runs in the browser or the app.** An entry then
leaves the summary as soon as its field is fixed, the title's count follows, and the summary goes
when no entry is left. A status text that stays on the page and changes is usually a new status
message
([Understanding 4.1.3: modification of status text](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html#modification-of-status-text)),
so the new title is announced politely, through the form's announcement
([How errors are announced](#how-errors-are-announced)), without moving focus. It costs script on
every field. Never when a check waits for the server: only a new submit tells whether such a field
is fixed, and a summary that is live for some fields and stale for others says the wrong count.

**When the server answers, focus moves the same way.** A server that checks the form and finds
errors leads to the same focus move as any failed submit: to the summary's title, or to the only
field in error.

No Apple, Android or Windows page says whether a form lists its errors, where the list goes, how
its entries reach their fields or what a screen's title says after a failed submit: on every
platform the default holds, and what each platform part below adds is the system's judgment,
drawn from when that platform checks a value.

### Web

**Each entry is a plain link, no script.** The system uses the platform's native means first:
where the browser gives the same result, the web needs no JavaScript. An entry is an in-page link
to the field's control, `<a href="#email">`, as the WAI tutorial and G139 describe
([WAI forms tutorial: listing errors](https://www.w3.org/WAI/tutorials/forms/notifications/#listing-errors),
[G139](https://www.w3.org/WAI/WCAG22/Techniques/general/G139)). Following it, the browser scrolls
the control to the top of the view and focuses it
([HTML: scrolling to a fragment](https://html.spec.whatwg.org/multipage/browsing-the-web.html#scrolling-to-a-fragment)).
Two details make it work:

- **The label stays in view.** At the top edge, the control would hide its own label above it.
  Each field's control carries a top scroll margin, `scroll-margin-top`, at least as tall as its
  label (or its group's legend) and the gap above the control, so the browser stops that much
  higher and the label shows above the focused field
  ([MDN: scroll-margin-top](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-margin-top)).
  It comes with the Error summary component, on the field controls.
- **A group's entry names its first option.** A fieldset cannot take focus, so a link to it
  scrolls but focuses nothing: the entry for a radio or checkbox group links to its first option,
  and the legend shows above it.

Two trade-offs come with plain links. Each entry followed adds a fragment to the URL and an entry
to the history
([HTML: navigate to a fragment](https://html.spec.whatwg.org/multipage/browsing-the-web.html#navigate-fragid)),
so Back walks through the fields before it leaves the page. And a single-page app whose router
takes over `#` links may need its own handling: that is the product's choice.

**A page the server sends back focuses it with `autofocus`, no script.** When the server checks
the form and sends the page back with errors, the summary's title carries the `autofocus`
attribute next to its `tabindex="-1"`, or, with one error, that field's control does. The
attribute applies to every element, not only to form controls, and one element per page carries
it ([HTML: the autofocus attribute](https://html.spec.whatwg.org/multipage/interaction.html#the-autofocus-attribute)):
the browser focuses the title as the page loads, with no script, as the native-first rule asks.
Screen readers then take people straight to it without reading what comes before
([MDN: autofocus](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/autofocus)),
and the title says how many errors there are. One limit: when the page's URL holds a fragment that
names an element, the browser skips autofocus, so the URL of that page, the form's action or a
redirect, carries no fragment. A browser may also skip it when people have already started typing.

**That page's title starts with the count.** A page the server sends back with errors starts its
`<title>` with the number of errors, then the page's own title: "3 errors – Delivery details –
Checkout", and "1 error – Delivery details – Checkout" with one. Screen reader users receive the
page's title as soon as the page loads, even when the main heading sits deep in the content
([WAI forms tutorial: using the page title](https://www.w3.org/WAI/tutorials/forms/notifications/#using-the-page-title)),
and the tab and the history show it too. The page's own title follows the count, so the title
still describes the page's topic or purpose
([Understanding 2.4.2](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html#intent)). The
count is one plural string per language held by the product, as the summary's title is. After a
check the browser runs, or a live update of the summary, no page is loaded: the title stays as it
is, and the focused summary gives the count.

### iOS

There are no in-page links: activating an entry moves focus to its field with the means a failed
submit uses ([How errors are announced](#how-errors-are-announced)), and brings the field and its
label into view. The summary is the first element of the form's scrolling content, above the first
field, and scrolls with it; it is never pinned. The server's answer reaches the same screen, with
no page sent back: when it brings errors, focus moves as after any failed submit.

Apple asks to verify values as soon as people enter them and to give feedback as soon as a problem
is detected
([HIG: Entering data](https://developer.apple.com/design/human-interface-guidelines/entering-data#Best-practices)):
a form whose every check runs in the app may follow it with the live summary, its new title
announced at low priority. A check the server makes keeps the summary of the last submit. The
submit button stays disabled until the required fields are filled, so a summary lists values to
fix, never empty required fields.

The screen keeps its title, which tells people where they are, and the focused summary gives the
count: a useful title for each window helps people confirm their location, and stays concise
([HIG: Toolbars, titles](https://developer.apple.com/design/human-interface-guidelines/toolbars#Titles)).

### Android

There are no in-page links: activating an entry moves focus to its field with the means a failed
submit uses, and brings the field and its label into view. The summary is the first element of the
form's scrolling content and scrolls with it, never pinned; the server's answer reaches the same
screen, and focus moves as after any failed submit.

Android Developers validates a field as people type
([Validate input as the user types](https://developer.android.com/develop/ui/compose/quick-guides/content/validate-input))
and when people move to the next field
([Compose: keyboard interaction logic](https://developer.android.com/develop/ui/compose/text/user-input#define-logic)):
a form whose every check runs in the app may update the summary live, its new title in a polite
live region.

The screen keeps its title, and the focused summary gives the count: a window-like pane is named
with `paneTitle`, so accessibility services can represent its changes
([Compose semantics: window-like components](https://developer.android.com/develop/ui/compose/accessibility/semantics#window-like)).

### Desktop

macOS follows iOS: an entry moves focus to its field, the summary opens the form's scrolling
content, a form whose every check runs in the app may update it live, and the submit button stays
disabled until the required fields are filled.

Windows asks to mark the controls with invalid input on submission and to require a resubmit
([Windows: Forms](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/forms#2-submitting-with-button)):
the default, the summary of the last submit, its entries moving focus with the `Focus` method. A
form that applies each value at once, such as a settings page, has no submit, so no summary. The
submit button stays disabled until the required fields are filled, so a summary lists values to
fix. The window keeps its title: the title bar identifies the app with its icon and title, and may
show a document's title
([Windows: Title bar](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/title-bar)).

## Keyboard in a form

People move through the fields in their reading order, the order that keeps their meaning, from a
physical or an assistive keyboard on every platform
([WCAG 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html#intent)).
A form that is submitted has a submit button, and Enter in a single-line field submits it; the
Textarea takes Enter as a new line. Where the submit button is disabled until the required fields
are filled (iOS, macOS and Windows, see [When a value is checked](#when-a-value-is-checked)),
Enter (Return) does not submit the form while it is disabled. Each field says what Enter does in
it; the form sets the label of the on-screen keyboard's return key, because only the form knows
which field comes last.

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

## Tokens every control starts from

**A form control starts from the Forms family.** The colors, text sizes and part gap that every
form control shares are tokens of their own, `form.*`, which this foundation owns: the control's
fill at rest, on hover, read-only and in each severity, its border, its value and its placeholder;
the label, the description, the message and the severity icon; the required mark and the
asterisk; the label's, description's and message's sizes per control size; and the space between a
control's parts. Each control's own tokens point to them, so a decision taken for every form,
such as the error fill or the message's size, is one token to change, and a new form control gets
the form's look by pointing its tokens to the family before it decides anything of its own. Each
family token stands for a role of the color, typography or spacing scales, so it has that role's
value in both modes and on every platform; the Tokens tab draws them, and lists the tokens each
control points to the family.

**The names follow a control's anatomy.** A family token has the path a control's token would
have, with `form` in place of the control's name: `form.control.background.error` is the fill of
a control in error, and the Select's `select.control.background.error` points to it. The four
gaps of a form's layout keep their own names, `form.gap.*` ([Spacing](#spacing)), since they space
the controls, not the parts inside one.

**A control overrides the family where its case differs.** The family is a default, not a lock:
a control keeps a value of its own when its use needs one, and that is a decision of its own
refinement, recorded with it. Today the Select, the Checkbox, the Checkbox group and the Radio
group keep their earlier, darker border at rest until they are refined, and the Checkbox keeps
its larger medium description. What belongs to one control never comes from the family: its
disabled colors, its heights, paddings and radii, a box's checked colors, and the gaps a group
puts between its options and under its legend.

**The family includes sizes, by exception.** The design system otherwise adds no layer of sizes
over the Figma library's scales: a component picks scale steps in its own tokens. Forms is the
exception, approved with the family, because a form behaves like one component spread over many
controls: its text sizes and its part gap are defaults every control shares, like its colors.

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
- **A hidden mark leaves the name as shown.** A parenthetical such as "(required)" may stay
  out of the accessible name when the required state is exposed another way
  ([WCAG 2.5.3](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name)).
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
- **Status messages are announced.** An error shown as people leave a field, a warning, a count
  of errors or a confirmation that appears without moving focus is exposed as a status message
  ([WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages)).
- **Focus follows the reading order.** People move through the fields in the order that keeps
  their meaning ([WCAG 2.4.3](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html#intent)),
  and after a failed submit focus moves to the errors
  ([G139](https://www.w3.org/WAI/WCAG22/Techniques/general/G139),
  [SCR32](https://www.w3.org/WAI/WCAG22/Techniques/client-side-script/SCR32)).
- **A label column reflows.** A narrow form stacks its labels above its fields, so it reads at
  320 CSS px without scrolling in two dimensions
  ([WCAG 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)).
- **Contrast.** The message text needs 4.5:1 against its surface
  ([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)) and a border that
  identifies a control in error 3:1
  ([WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)); the
  Specification tab measures every pair, in both modes.

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

- Every component whose role is an input follows this page; the Tokens tab lists them.
- [Button](/components/button): a form's actions, its submit button among them.
- [Alert](/components/alert): a brief message that never moves focus, so not the error summary,
  which a component of its own renders.
- [Color](/foundations/color): the error, warning and success colors.
- [Spacing](/foundations/spacing): the scale the spacing between fields uses.
