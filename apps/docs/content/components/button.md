---
component: button
title: Button
summary: Triggers an action or event when activated.
order: 1
---

## Overview

A button lets people perform an action with a single activation. It is the most common
interactive element in the system, so its emphasis levels form the backbone of visual
hierarchy on every screen: one **accent** action, supporting **subtle** actions, and
**ghost** buttons for low-stakes or repeated actions. Independently, its **intent** says what
kind of action it is: neutral, brand or error.

Buttons perform actions. They never navigate. When activation changes the location, use a
link, even if it is styled to look like a button.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Submitting a form or confirming a decision.
- Opening a dialog, menu or drawer.
- Starting or stopping a process (upload, export, sync).

## When not to use

- **Navigation between pages or views.** Use a link.
- **Toggling a setting on or off.** Use a switch or a toggle button, whose pressed state is announced.
- **Choosing between options.** Use radio buttons, a segmented control or a select.

## Emphasis

Emphasis is the visual weight of the button. It answers "how important is this action here?"

| Emphasis | Weight | Use for |
| --- | --- | --- |
| Accent | Highest | The single most important action on the view. Strong fill in the intent color with a contrasting label. The default. |
| Subtle | Medium | Actions that support the accent one (Cancel, Back, Save draft). Tinted fill and a light border in the intent color. |
| Ghost | Lowest | Repeated, tertiary or inline actions (table row actions, "Learn more"). Label only at rest; a tint and a light border appear on hover and press. |

Limit each view to one accent button. When two actions compete for attention, neither is
accent: demote both to subtle and let the layout order carry the hierarchy.

The neutral tint of subtle and ghost buttons is see-through: it darkens whatever it sits on, so
a neutral subtle button keeps a visible fill on a page, a card, a sidebar or an image, in light
and dark mode. A solid grey would vanish on a surface of the same grey.

## Intent

Intent says what kind of action the button performs. It is independent of emphasis: every
intent exists at every emphasis, so a destructive action can be the accent confirmation of a
dialog or a ghost action repeated in a list.

| Intent | Use for |
| --- | --- |
| Neutral | Generic actions with no brand or status meaning. The default. |
| Brand | The main path through a flow, where the brand color guides people (Continue, Get started). |
| Error | Destructive or irreversible actions: delete, remove, revoke. Pair it with a label that names the consequence. |

Intent never replaces the label. Someone who cannot perceive the red of an error button must
still understand from its words that the action destroys something.

## Sizes

| Size | Use for |
| --- | --- |
| Extra small | Very dense layouts where a small button would crowd the content: actions inside table cells, compact lists. On the web it sits exactly at the minimum target size, so keep space around it. |
| Small | Dense layouts: toolbars, table rows, filter bars. |
| Medium | Default everywhere else. A button without a size is medium, like every control with sizes, so controls placed together without a size get the same size step. |
| Large | Hero or marketing surfaces and the main call to action of a landing page. |

Text, inline padding, minimum height, corner radius, icon size and the gap between an icon and the label scale together with the size property: smaller buttons get tighter corners and a tighter gap.
Medium and large share the same text size: a large button stands out by its height, padding
and corners, not by a bigger label.
The minimum height sets the height at the default text size. When the content grows beyond it
(larger text, a larger icon), the button grows with it and keeps a minimum space above and
below the content, so the label never touches the edges.
The exact values are tokens (Tokens tab). Never mix sizes within one group of buttons.

### iOS

The sizes are the same as on the web: extra small, small and medium buttons are under the
44 pt hit region Apple recommends until the platform gets its own heights. Prefer large
buttons for touch.

### Android

The sizes are the same as on the web: every size, large included, is under the
48 dp touch target Android recommends until the platform gets its own heights.

## Icons

A leading icon reinforces the verb (a plus for **Add**, a trash can for **Delete**). A
trailing icon indicates direction or disclosure (arrow, chevron). Icons inherit the label
color and are hidden from assistive technology; the label alone must make sense.

Icons come from [Material Symbols](https://fonts.google.com/icons), the icon font of the
whole system, in its outlined style at a light weight (fill off, weight 300, grade 0, optical
size 20). An icon is named by its Material Symbols name (`add`, `delete`, `arrow_forward`).
The size property sets how large the glyph is drawn; the style never changes per button.
The optical size stays at 20 even where the icon is drawn at 24 px: one drawing of each glyph
for every size keeps buttons consistent and simpler to implement.

A button with an icon has a narrower inline padding than one without: a glyph carries its own
white space inside its box, so a full padding next to it would look wider than on the label
side. The side that holds the icon is the narrowest; the label side narrows less.

Icon-only buttons are a separate component (Icon button) because they need a tooltip and an
explicit accessible name.

## Color modes

The button exists in light and dark mode and takes the mode of where it is placed: a page, or
a region of it, decides the mode, never the button. Emphasis and intent keep their meaning in
both modes. In dark mode the neutral and brand accent fills turn light with dark labels, so an accent button
still stands out against the dark surfaces as the strongest action; nothing changes in how you
choose an emphasis or an intent.

### Web

The mode comes from the closest `data-theme` attribute (`light`, `dark`, or `auto` to follow
the system setting); without one, the page is light. Nest a `data-theme` context to show a
region in another mode.

## States

| State | How it happens | What changes |
| --- | --- | --- |
| Default | Resting. | Variant colors at rest. |
| Hover | A pointer rests over the button. Needs a pointing device: there is no hover on touch. | Fill and border move one step along the intent color ramp, so the border stays one step darker than the fill; the label keeps its color. A ghost button gains the subtle tint and border one step behind. |
| Active | Pointer, finger or key pressed down: the press state. | Fill and border move a second step. |
| Focus visible | Keyboard focus. | The shared focus ring appears outside the border. Pointer focus shows no ring. |
| Disabled | `disabled` property. | Colors switch to the shared disabled palette, whatever the emphasis and intent, so a disabled ghost button gets the same fill and border as the others; hover and active no longer apply. |

Prefer keeping actions enabled and explaining what is missing on activation. A disabled
button cannot tell people why it is disabled.

## Content

- Start with a verb: **Save**, **Send invitation**, **Delete project**.
- One to three words. Labels never wrap.
- No trailing punctuation.
- Avoid generic labels (**OK**, **Yes**) when a specific verb is possible.
- With the error intent, name the consequence: **Delete project**, **Remove member**, never
  **OK** or **Confirm**.

Capitalization follows the platform: sentence case (**Send invitation**) on the web, Android
and desktop.

### iOS

Apple's guidelines use title-style capitalization for button labels (**Add to Cart**), so
buttons in an iOS app follow the platform rather than the sentence case used elsewhere
([Apple HIG: Buttons, content](https://developer.apple.com/design/human-interface-guidelines/buttons#Content)).

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **Native control first.** Every platform has a native button control that exposes the role,
  the name and the disabled state to assistive technology; a custom view has to rebuild all of
  it ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)).
- **The label is the name.** The accessible name is computed from the label text, and the icons
  are hidden, so the visible words are exactly what screen reader and speech-input users get
  ([APG Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/),
  [WCAG 2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)).
  This is also why labels must make sense without their icon.
- **Visible focus.** Keyboard focus shows a ring that contrasts at least 3:1 with the adjacent
  colors; pointer focus shows none
  ([WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
  [WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)).
  The ring uses the strong focus width of the stroke scale rather than a thinner one, so it keeps the 2 CSS pixel thickness of the AAA focus appearance
  criterion, beyond what AA asks
  ([WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)).
- **Color is never the only signal.** Emphasis shows through fill and border, not hue alone,
  and intent is always backed by the label: an error button says what it destroys
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
  Label text needs 4.5:1 against the button background in every emphasis, intent and enabled
  state, in light and in dark mode; disabled buttons are exempt
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
  The error intent does not meet that minimum everywhere yet: the button uses the Figma library's
  error colors as they are, and the label falls under 4.5:1 on the accent error fill at rest
  (both modes), on the subtle error fill on hover and press, and on the ghost error press (light
  mode). The gap is tracked as a known issue and the Specification tab lists the ratios.
- **Borders are not the boundary.** A button is identified by its label, so the light border of
  subtle and ghost buttons (ghost buttons have none at rest) need no 3:1 contrast
  ([WCAG 1.4.11 Non-text Contrast, boundaries](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries)).
  This is also why the border can stay a hairline. The focus indicator still needs 3:1.
  Apple's guidelines ask for the same two things
  ([Apple HIG: Accessibility, vision](https://developer.apple.com/design/human-interface-guidelines/accessibility#Vision)).
- **Target size.** The floor everywhere is 24 by 24 CSS pixels, which extra small meets exactly
  ([WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
  Touch platforms ask for more; see below.
- **Disabled buttons** cannot explain themselves, which is why the recommendation above is to
  keep actions enabled and explain on activation.
- **Motion.** The color transition is dropped when people ask their system for less motion
  ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
  a AAA criterion adopted as extra quality).

### Web

- The implementation renders a `<button>`, so its role, name and disabled state reach assistive
  technology without any ARIA
  ([ARIA in HTML](https://www.w3.org/TR/html-aria/#el-button)).
- **Enter** and **Space** activate the button; **Tab** moves focus to and from it
  ([APG keyboard interaction](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)).
- The focus ring uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible)),
  icons carry `aria-hidden="true"`, and the transition is switched off under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
- The native `disabled` attribute removes the button from the focus order, so people using a
  keyboard or a screen reader may never learn the action exists. APG recommends keeping a
  control focusable when its presence matters
  ([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).

### iOS

- A button needs a hit region of at least 44 by 44 pt, and system buttons bring accessibility
  support with them
  ([Apple HIG: Buttons, best practices](https://developer.apple.com/design/human-interface-guidelines/buttons#Best-practices),
  [Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).
  The extra small, small and medium buttons fall under it today.
- A custom button always shows a press state, otherwise it feels unresponsive: the active state
  is that press state.
- When Reduce Motion is on, automatic and repetitive animations are reduced
  ([Apple HIG: Accessibility, cognitive](https://developer.apple.com/design/human-interface-guidelines/accessibility#Cognitive)).

### Android

- Interactive elements need a touch target of at least 48 by 48 dp
  ([Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes)).
  The extra small, small and medium buttons fall under it today.
- A Material `Button` merges its children into one entity with the button semantics
  ([Jetpack Compose: interactive elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#interactive-elements)).
  The icon passes `null` as `contentDescription`, or is hidden with `hideFromAccessibility`,
  so only the label is announced
  ([Jetpack Compose: graphic elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#graphic-elements),
  [Android accessibility: describe each UI element](https://developer.android.com/guide/topics/ui/accessibility/apps#describe-ui-element)).

## Related

- Link (navigation)
- Icon button (icon-only actions, named by a label for assistive technology)
- Toggle button (pressed state)
- Dropdown (a button opening a menu of related actions)
