---
component: number-field
title: Number field
summary: Lets people enter a number, by typing it or stepping it up and down.
order: 21
---

## Overview

A number field collects a numeric value within optional bounds and steps: a quantity, a number
of seats, a year. It looks like the Text field and adds the platform's stepping: arrow keys and
a spin control, which keeps its native look. The browser validates the bounds; the field shows
the message the form gives it.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- A quantity people count or step: items in a cart, seats, rows per page, a year.
- A value with meaningful bounds and increments.

## When not to use

- **A number that is really text**: a phone number, a postal code, a card number. Use a Text
  field; a spin control makes no sense there and assistive technology would announce a
  spinbutton.
- **A value whose position in a range matters more than its figure.** Use a Slider, alone or
  next to the number field.

## Sizes, states and content

Sizes (small, medium, large), states (default, hover, focus visible, error, warning, success, read-only,
disabled), the label, description and message, and the severity icon follow the Text field. The label names
the quantity and its unit when it has one (**Weight (kg)**); the description gives the bounds
(**Between 1 and 99**); the message of an error says how to fix the value. The optional leading icon follows the Text field too: decorative, not advised for regular
applications, and never the only place a unit or a currency is said. The required mark follows
the Text field too: "(optional)" or "(required)" after the label, as the form marks its fields.

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **A spinbutton, by name.** The platform's native numeric control exposes the spinbutton role,
  the name, the value and its bounds, and steps the value with the arrow keys; assistive
  technology announces it as such, which is why values that are not numbers must not use it
  ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [WAI-ARIA: spinbutton role](https://www.w3.org/TR/wai-aria-1.2/#spinbutton),
  [APG Spinbutton pattern](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/)).
- **Label, description and error** follow the Text field
  ([WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WCAG 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html),
  [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
  [WAI tutorial: Labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/)).
- **Contrast, text size, focus and target size** follow the Text field
  ([WCAG 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text),
  [WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries),
  [WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
  [WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html),
  [WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html),
  [WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).
- **Keyboard on every platform.** People reach, edit and leave the field from a keyboard,
  physical or assistive, on every platform, and focus is never trapped in it: the platform's native
  text control provides this, so the keys are the platform's
  ([WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html), [WCAG 2.1.2 No Keyboard Trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html#intent), [EN 301 549, 11.2.1.1.1](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=70) for native software).
  The keys are listed per platform below, from each platform's own documentation.
- **Enter and the return key.** Enter never adds a line to this single-line field: it goes to the
  form, which submits or runs the return key's action
  ([HTML: implicit submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission),
  [Jetpack Compose: line limits](https://developer.android.com/develop/ui/compose/text/user-input#line-limits),
  [Windows: multi-line text box](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/text-box#enable-multi-line-input)).
  The return key's label (next, done…) depends on the field's place in the form, so the form sets it
  through each platform's own setting: `enterkeyhint` on the web, passed through the template's
  `attrs`; `returnKeyType` or `submitLabel` on iOS; the IME action on Android, where Next moves focus
  by default ([HTML: enterkeyhint](https://html.spec.whatwg.org/multipage/interaction.html#attr-enterkeyhint),
  [UIKit: returnKeyType](https://developer.apple.com/documentation/uikit/uitextinputtraits/returnkeytype),
  [SwiftUI: onSubmit](https://developer.apple.com/documentation/swiftui/view/onsubmit(of:_:)),
  [Jetpack Compose: keyboard options](https://developer.android.com/develop/ui/compose/text/user-input#keyboard-options)).

### Web

- "(required)" is hidden from assistive technology with `aria-hidden="true"`, since the `required`
  attribute already says it; "(optional)" stays in the `<label>`, so the name ends with it, as no
  attribute says that a field is optional. The visible label still starts with the name
  ([WCAG 2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html),
  [AccName 1.2: hidden nodes](https://www.w3.org/TR/accname-1.2/#comp_hidden_not_referenced),
  [MDN: aria-required](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-required#examples)).
- The implementation renders an `<input type="number">` with `min`, `max` and `step`, a
  `<label for>`, a description and a message referenced by `aria-describedby`, and
  `aria-invalid="true"` for an error only. The spin control keeps its native look: there is no
  portable way to draw it from tokens
  ([ARIA in HTML: input type=number](https://www.w3.org/TR/html-aria/#el-input-number),
  [HTML-AAM: input type=number](https://www.w3.org/TR/html-aam-1.0/#el-input-number),
  [HTML: input type=number](https://html.spec.whatwg.org/multipage/input.html#number-state-(type=number)),
  [ARIA1](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA1),
  [ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21)).
- MDN's advice for non-numeric values: a text input with `inputmode="numeric"` and a pattern
  ([MDN: input type=number, accessibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number#accessibility)).
- The focus outline uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible));
  a read-only field keeps its value reachable, a disabled one leaves the focus order
  ([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).
- Say that a field is read-only in its label or description: its fill barely differs from an
  editable one's ([Material 3: Read-only fields](https://m3.material.io/components/text-fields/guidelines#f572b53d-1a15-4ede-881a-80adbbdc24a5), [Windows: Make a text box read-only](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/text-box#make-a-text-box-read-only)).
- The color transitions of the control are switched off under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
- Up and Down step the value within its bounds: the native number input gives the increment and
  decrement, which a spin button offers on the arrow keys. APG's Home and End (to the minimum and
  the maximum) and Page Up and Page Down (a larger step) are not promised: the native input does not
  document them and the template adds no script, so they keep the browser's behaviour
  ([MDN: spinbutton role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/spinbutton_role#description),
  [APG: spinbutton keyboard](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/#keyboardinteraction)).

### iOS

- The recommended minimum text size is 11 pt; the description at 12 pt and the message at 14 pt are above it
  ([Apple HIG: Typography](https://developer.apple.com/design/human-interface-guidelines/typography#Specifications)).
- A stepper is a two-segment control that increases or decreases an incremental value, next to
  a field that shows it: the iOS counterpart of the spin control
  ([Apple HIG: Steppers](https://developer.apple.com/design/human-interface-guidelines/steppers)).
  Every size reaches a 44 by 44 pt hit region as on the Text field: it extends above and below the
  box, over the field's own label and help text, which keep their 6 pt
  ([Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).
- With a hardware keyboard on iPadOS 15 and later, Tab moves focus among focus groups, and
  iPadOS supports keyboard navigation in text fields and text views, unlike buttons. On iPhone,
  Full Keyboard Access reaches the field: use the native text field and test with it on
  ([Apple HIG: Focus and selection, iPadOS](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection#iPadOS), [Apple HIG: Keyboards, best practices](https://developer.apple.com/design/human-interface-guidelines/keyboards#Best-practices), [Apple HIG: Accessibility, speech](https://developer.apple.com/design/human-interface-guidelines/accessibility#Speech)).
- Show a number pad, or a decimal pad when the value has decimals, the keyboard type that matches
  the content; no key steps the value, the stepper beside the field does
  ([UIKit: UIKeyboardType](https://developer.apple.com/documentation/uikit/uikeyboardtype),
  [Apple HIG: Text fields](https://developer.apple.com/design/human-interface-guidelines/text-fields#Best-practices)).

### Android

- Interactive elements need a 48 by 48 dp touch target, and every size reaches it as on the Text
  field: the touch target extends above and below the box, over the field's own label and help text,
  and the box does not take `minimumInteractiveComponentSize`, which would move the label. Expose an error with the error semantics
  ([Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes),
  [Jetpack Compose: error semantics](https://developer.android.com/develop/ui/compose/accessibility/semantics#error-components)).
- With a hardware keyboard, a D-pad or Switch Access, focus navigation reaches the field in a
  logical order and can always leave it. Tab moves focus to the next focus target; Shift+Tab moves back; the arrow keys and the
  D-pad move the caret, then move focus at the start or end of the text; Shift with the arrows
  selects, Ctrl+A selects all ([Orange: Android keyboard navigation](https://a11y-guidelines.orange.com/en/mobile/android/development/focus-navigation/#keyboard-navigation-order), [Jetpack Compose: focus in text fields](https://developer.android.com/develop/ui/compose/touch-input/focus/focus-in-text-fields#one-dimensional-focus-traversal),
  [two-dimensional traversal](https://developer.android.com/develop/ui/compose/touch-input/focus/focus-in-text-fields#two-dimensional-focus-traversal), [Jetpack Compose: keyboard commands](https://developer.android.com/develop/ui/compose/touch-input/keyboard-input/commands)).
- Set a number keyboard type through the field's keyboard options; the arrow keys and the D-pad
  move the caret, and no key steps the value
  ([Jetpack Compose: keyboard options](https://developer.android.com/develop/ui/compose/text/user-input#keyboard-options)).

### Desktop

- On macOS, Full Keyboard Access lets people navigate to the field and use it with the keyboard
  alone; Tab and Shift-Tab move through the key view loop and Command-A selects all the text.
  Use the native control and keep the standard keyboard shortcuts ([Apple HIG: Keyboards, best practices](https://developer.apple.com/design/human-interface-guidelines/keyboards#Best-practices),
  [Apple HIG: standard keyboard shortcuts](https://developer.apple.com/design/human-interface-guidelines/keyboards#Standard-keyboard-shortcuts), [AppKit: nextKeyView](https://developer.apple.com/documentation/appkit/nsview/nextkeyview)).
- On Windows, Tab follows the tab order, the order the controls are added, and skips a disabled
  field; Shift+Tab goes back; in the field Left and Right move the caret, since every key goes to
  the text first ([Windows: keyboard accessibility](https://learn.microsoft.com/en-us/windows/apps/design/accessibility/keyboard-accessibility#keyboard-navigation-among-ui-elements), [Windows: keyboard interactions, navigation](https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions#navigation), [text entry](https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions#text-entry)).
- On Windows, as in a NumberBox, Up and Down step the value by its small change, Page Up and Page
  Down by its large one, and Enter evaluates and validates what was typed, as leaving the field does
  ([Windows: NumberBox, stepping](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/number-box#increment-and-decrement-stepping),
  [calculation](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/number-box#enable-calculation-support)).
  On macOS a stepper beside the field changes the value
  ([Apple HIG: Steppers](https://developer.apple.com/design/human-interface-guidelines/steppers)).

## Related

- Text field (text, including numbers that are text)
- Slider (a value in a range)
