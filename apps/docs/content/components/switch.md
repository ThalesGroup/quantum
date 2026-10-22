---
component: switch
title: Switch
summary: Turns a setting on or off, with immediate effect.
order: 12
---

## Overview

A switch flips a setting between on and off, and the change applies as soon as it is made:
no Save button follows. The track and the thumb show the state together: outlined with the
thumb at the start when off, filled with the thumb at the end when on. Assistive technology
announces it as a switch, on or off, which is why it must only be used for settings that
really behave that way.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- A setting with two opposite states that takes effect immediately: notifications, dark mode,
  a feature flag, airplane mode.
- Lists of settings where each row is one independent on / off choice.

## When not to use

- **The value is saved with a form**, when people submit it. Use a Checkbox: people expect a
  switch to act at once.
- **The choice can be partially on**, or stands for a group of options. Use a Checkbox, which
  has an indeterminate state.
- **Choosing between several values.** Use a Radio group or a Select.

## Sizes

| Size | Use for |
| --- | --- |
| Small | Dense lists and table rows, with a 14 px label. The track is under the 24 px minimum target, so the label must stay part of the target. |
| Medium | Settings pages, the default, with a 16 px label and a 24 px high track. |

Track, thumb, label and description scale together. The exact values are tokens (Tokens tab).

## Label and description

The label names the setting as the thing that is on when the switch is on (**Email
notifications**, not **Enable notifications?**). It is the accessible name and activating it
flips the switch. The description adds what the setting does when the label is not enough.
Never write On or Off next to the switch: the state is announced and shown by the thumb.

## States

| State | How it happens | What changes |
| --- | --- | --- |
| Default | Resting, off. | An outlined track, thumb at the start edge. |
| Hover | A pointer rests over the track or the label. Needs a pointing device: there is no hover on touch. | The off track takes a light tint. An on switch does not change. |
| Focus visible | Keyboard focus on the track. | The shared focus ring appears outside the track. Pointer focus shows no ring. |
| Checked | `checked` property (on). | The track fills with the brand color and the thumb moves to the end edge. |
| Disabled | `disabled` property. | Track, thumb, label and description drop to the shared disabled colors, on or off. |

## Content

- Name the setting as what is on when the switch is on: **Email notifications**, **Dark mode**.
- Sentence case, no trailing punctuation, one line.
- Consequences go to the description: **Ask for a code from your authenticator app at sign-in.**

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **A switch, not a checkbox.** Assistive technology announces a switch as on or off, which
  matches a setting that applies immediately; a checkbox would be announced as checked or
  unchecked and leave people expecting a form to submit
  ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [APG Switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/),
  [WAI-ARIA: switch role](https://www.w3.org/TR/wai-aria-1.2/#switch)).
- **A visible, associated label.** The label is the name of the switch and part of its target;
  help text is a description read after the name
  ([WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WAI tutorial: Labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/),
  [APG: describing with aria-describedby](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/#describing_with_aria-describedby)).
- **Outlined when off.** A light grey track would fall under 3:1 against the page in both
  modes, so the off track is outlined in the dark accent neutral border with a dark thumb; on,
  the brand fill and the light thumb keep 3:1 against each other and against the page
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries)).
  Text needs 4.5:1 ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
- **Position, not only color.** The thumb moves, so the state does not depend on telling the
  brand fill from the outline ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- **Keyboard and focus.** Space flips the switch, Tab moves to and from it, and keyboard focus
  shows the shared ring
  ([WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html),
  [APG keyboard interaction](https://www.w3.org/WAI/ARIA/apg/patterns/switch/#keyboardinteraction),
  [WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
  [WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)).
- **Target size.** The medium track is exactly 24 px high; the small one relies on its label
  ([WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
- **Motion.** The thumb slide and the color transition are dropped when people ask for less
  motion ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
  a AAA criterion adopted as extra quality).

### Web

- The implementation renders an `<input type="checkbox" role="switch">`, the one case where
  ARIA in HTML allows a role on a native checkbox, with a `<label for>` and an optional
  description referenced by `aria-describedby`. The state is the input's checkedness; it never
  sets `aria-checked`
  ([ARIA in HTML: input type=checkbox](https://www.w3.org/TR/html-aria/#el-input-checkbox),
  [APG Switch: roles, states and properties](https://www.w3.org/WAI/ARIA/apg/patterns/switch/#roles_states_properties),
  [MDN: switch role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/switch_role)).
- The focus ring uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible));
  transitions are switched off under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
- The native `disabled` attribute removes the switch from the focus order
  ([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).

### iOS

- Apple's toggles help people choose between two opposing values that affect content or a
  view; in a list row the row content gives the context, so the switch style needs no label of
  its own there. Never rely on color alone for the state, and keep the 44 by 44 pt hit region
  ([Apple HIG: Toggles](https://developer.apple.com/design/human-interface-guidelines/toggles),
  [Apple HIG: Toggles, best practices](https://developer.apple.com/design/human-interface-guidelines/toggles#Best-practices),
  [Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).

### Android

- Lift the toggle to the row with the `toggleable` modifier and the `Switch` role, so the label
  and the switch form one element whose state is announced; Material's Switch enforces the
  48 dp target when it can receive actions
  ([Jetpack Compose: interactive elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#interactive-elements),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes),
  [Jetpack Compose: state description](https://developer.android.com/develop/ui/compose/accessibility/semantics#state-description),
  [Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls)).

## Related

- Checkbox (a value saved with a form, or a partially on group)
- Radio group (one choice among several)
