---
component: select
title: Select
summary: Lets people choose one option from a list that opens on demand.
order: 15
---

## Overview

A select shows the current choice in a closed box with a chevron, and opens a list of options
when activated. The list belongs to the platform: the browser or the operating system draws
it, moves through it with the keyboard and announces it. The component owns the closed box,
its label, its help text and its error message, so a select looks like the other fields of a
form.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- One choice among many known values: a country, a time zone, a currency, a sort order.
- A short list of options that people already know, when the space for a Radio group is not
  worth it.

## When not to use

- **Two to about six options worth reading side by side**, especially with explanations. Use a
  Radio group.
- **A list of actions.** Use a Dropdown: a select chooses a value, it does not perform an action.
- **Free text, or thousands of values.** Use a Text field, or a searchable list.

## Sizes

| Size | Use for |
| --- | --- |
| Small | Dense forms, toolbars and table rows: 32 px high with 14 px text. |
| Medium | Forms, the default: 40 px high with 16 px text. |
| Large | A prominent single field, such as a search page or a sign-in form: 48 px high with 20 px text. |

Height, inline padding and text size scale together; the label, the description and the error
message keep one size. The exact values are tokens (Tokens tab). Keep one size per form.

## Options and placeholder

Options are the repeated part of the component: each has a label, a value, and can be selected
or disabled. The browser renders them, so the component gives them no style. A placeholder
(**Choose a country**) is shown until a choice is made; it is a disabled first option that can
never be chosen again and is not a valid value.

## States

| State | How it happens | What changes |
| --- | --- | --- |
| Default | Resting, closed. | An outlined box with the chosen option and a chevron. |
| Hover | A pointer rests over the box. Needs a pointing device: there is no hover on touch. | The box takes the surface hover tint; the border does not change. |
| Focus visible | Keyboard focus on the closed box. | The shared focus ring appears outside the border. Pointer focus shows no ring. |
| Invalid | `invalid` property, after validation. | The border takes the error color and the error message appears under the box. |
| Disabled | `disabled` property. | Box, value, chevron, label and description drop to the shared disabled colors; the select leaves the keyboard order. |

The opened list is not a state of the component: the platform draws it.

## Content

- The label is a noun phrase naming the choice: **Country**, **Time zone**, **Sort by**.
- Option labels are short and parallel; order them logically (alphabetical for long lists,
  most common first for short ones).
- The placeholder is an invitation to choose (**Choose a country**), never a value.
- The error message says what to do: **Choose a country.**

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **Native control first.** The platform's native select exposes the role, the name, the value
  and the required, disabled and invalid states to assistive technology; a custom view has to
  rebuild all of it ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [WAI-ARIA: combobox role](https://www.w3.org/TR/wai-aria-1.2/#combobox)).
- **A visible label, always.** The label above the control is its accessible name; help text is
  the description, read after the name, and so is the error message while the field is invalid.
  The chevron is decorative and hidden, so it adds nothing to the name
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
- **The list is the platform's.** A custom list would need script to be accessible (focus
  management, arrow keys, type-ahead), and the web implementation ships none; the native list
  already has it all, on every platform and with every assistive technology
  ([WCAG 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)
  for the hidden chevron).
- **Motion.** The color transition is dropped when people ask their system for less motion
  ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
  a AAA criterion adopted as extra quality).

### Web

- The implementation renders a `<select>` in a wrapper with a `<label for>`, a description and an
  error message referenced by `aria-describedby`, `aria-invalid="true"` when invalid, and the
  native `required` attribute. A select rendered as a drop-down box has the implicit combobox
  role ([ARIA in HTML: select](https://www.w3.org/TR/html-aria/#el-select),
  [HTML-AAM: select as a drop-down box](https://www.w3.org/TR/html-aam-1.0/#el-select-combobox),
  [HTML: the select element](https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element),
  [MDN: select, accessibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select#accessibility),
  [ARIA1](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA1),
  [ARIA21](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA21)).
- The chevron carries `aria-hidden="true"`
  ([WAI-ARIA: aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)).
- The focus ring uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible));
  the transition is switched off under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
- A disabled select leaves the focus order
  ([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).

### iOS

- A pop-up button presents a flat list of mutually exclusive options or states: the iOS
  counterpart of a select
  ([Apple HIG: Pop-up buttons, best practices](https://developer.apple.com/design/human-interface-guidelines/pop-up-buttons#Best-practices)).
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

- Radio group (a few options, all visible)
- Dropdown (a menu of actions)
- Text field (free text)
