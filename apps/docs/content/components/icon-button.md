---
component: icon-button
title: Icon button
summary: Triggers an action with an icon alone; its label is given to assistive technology.
order: 2
---

## Overview

An icon button performs an action, like a button, but shows only an
icon. It saves room where space is tight and the action is familiar enough to be recognized
from its symbol: toolbars, table rows, card headers, the close action of a dialog.

Because nothing in the button spells the action out, every icon button carries a **label**.
It is the name screen readers announce and speech-input users say, and the text of the tooltip
that appears when a pointer rests on the button or keyboard focus reaches it. An icon button
without a label is not an icon button.

Like every button, an icon button performs an action and never navigates.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Repeated actions in a dense layout: edit or delete in each table row, remove a filter chip.
- Toolbars and headers where the symbols are well known: search, share, more actions, close.
- Secondary actions next to a field or a title, where a text button would compete with the content.

## When not to use

- **The symbol is not obvious for the action.** Use a button with a text
  label, with or without an icon. A word is clearer than a symbol people have to guess.
- **The main action of a view.** Use a button: a primary action deserves words.
- **Navigation.** Use a link.
- **Toggling something on or off** (favorite, mute, bold). The icon button has no pressed state,
  so nothing would show or announce that the action stays on. The system has no toggle button
  yet; for a setting in a list or a form, use a switch.

## Emphasis

Emphasis works as on the button: it answers "how important is this action here?"

| Emphasis | Weight | Use for |
| --- | --- | --- |
| Accent | Highest | A standalone icon action that must stand out, such as a floating add action. Strong fill in the intent color. The default. |
| Subtle | Medium | Icon actions that need a visible shape, next to fields or in a toolbar. Tinted fill and a light border. |
| Ghost | Lowest | Repeated or inline actions: row actions, overflow menus, close. Glyph only; a tint and a light border appear on hover and press. |

Most icon buttons are ghost: they sit among content and should not outweigh it.

## Intent

| Intent | Use for |
| --- | --- |
| Neutral | Generic actions. The default. |
| Brand | An icon action on the main path of a flow. |
| Error | Destructive actions (delete, remove). Pair the color with a symbol that shows the consequence and a label that names it. |

## Sizes

The icon button is a square. Its side is the height of the button of the same size, and its
glyph the size of that button's icon, so an icon button lines up with buttons and other icon
buttons in a row and reads as one of them.

| Size | Use for |
| --- | --- |
| Extra small | Inside table cells, chips and compact lists. On the web it is exactly the minimum target size, so keep space around it. |
| Small | Toolbars, table rows, filter bars. |
| Medium | Default everywhere else. An icon button without a size is medium, like the button and every control with sizes. |
| Large | Hero surfaces, next to a large button. |

The glyph grows with the size; its style does not change. It sits centered in the square.

The sizes are those at the default text size. When people raise the text size, the glyph grows
with the text, as a button's icon does, and the square keeps the button's block padding around
it: at the default size nothing moves, and at larger sizes the icon button stays exactly as
high as a button of the same size with an icon, so a row of both still lines up.

### iOS

The sizes are drawn as on the web. Every size still reaches the 44 pt hit region Apple
recommends: the touch area extends around the square, centered, and the layout keeps that room
free, so icon buttons in a row sit at least 44 pt apart, center to center.

### Android

The sizes are drawn as on the web. Every size still reaches the 48 dp touch target Android
recommends: the square is centered in 48 dp of reserved space, which takes the touch, so icon
buttons in a row sit at least 48 dp apart, center to center.

## Icon

Icons come from [Material Symbols](https://fonts.google.com/icons), the icon font of the whole
system, in the same outlined, light style as the button's icons. The icon property takes the
Material Symbols name of the glyph (`delete`, `more_vert`, `close`).

Choose a symbol people already associate with the action: a trash can for delete, a pencil for
edit, three dots for more actions. When no symbol is obvious, use a button with a text label
instead of explaining the icon elsewhere.

## Same rendering as the button

An icon button is a button without a label: it always looks like the button of the same
emphasis, intent, size and state, with the same fills, borders, corners and focus ring, and a
glyph in the button's label color. Put them side by side and only the label tells them apart.
A change to how the button looks is a change to the icon button too.

## Color modes

Like the button, the icon button exists in light and dark mode and takes the mode of where it
is placed; emphasis and intent mean the same in both. Next to a button, it always matches it.

### Web

The mode comes from the closest `data-theme` attribute (`light`, `dark`, or `auto` to follow
the system setting); without one, the page is light.

## States

| State | How it happens | What changes |
| --- | --- | --- |
| Default | Resting. | Emphasis and intent colors at rest. |
| Hover | A pointer rests over the icon button. Needs a pointing device: there is no hover on touch. | Fill and border move one step along the intent color ramp; the glyph keeps its color. A ghost icon button gains a tint and a light border. |
| Active | Pointer, finger or key pressed down: the press state. | Fill and border move a second step. |
| Focus visible | Keyboard focus. | The shared focus ring appears outside the border. Pointer focus shows no ring. |
| Disabled | `disabled` property. | Colors switch to the shared disabled palette, whatever the emphasis and intent, ghost included; hover and active no longer apply. |

## Content

The label is the only text of the component. Most people never see it: write it for people
who hear it, say it, or read it in a tooltip.

- Name the action, starting with a verb: **Delete row**, **Close dialog**, **More actions**.
- Name the action, not the symbol: **Delete row**, never **Trash** or **Bin icon**.
- One to three words, sentence case, no trailing punctuation.
- With the error intent, name the consequence: **Delete project**, **Remove member**.
- When several icon buttons share a symbol in one view (a delete in every row), make each label
  say what it acts on when the context allows it: **Delete invoice 1042**.

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **A name is mandatory.** The icon is the only visible content, and a control made of non-text
  content must have a name that describes its purpose
  ([WCAG 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html),
  [WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)).
  That is why the label property is required, and why the button carries it rather than the
  icon ([APG Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/)).
- **Show the name where people can hover or focus.** The label is also shown as a tooltip
  when a pointer rests on the icon button and when keyboard focus reaches it, so sighted people
  who do not recognize the symbol can read the action. A tooltip that appears on hover or focus
  must be dismissible, hoverable and persistent
  ([WCAG 1.4.13 Content on Hover or Focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)).
  On touch there is no hover, so the symbol alone carries the action: when it does not, use a
  button with a text label. The system has no Tooltip component yet, so the reference
  implementation draws no tooltip for now.
- **Name the function, not the symbol.** Without visible text, the Label in Name criterion does
  not apply, and its Understanding document recommends a name that reflects the function
  ([WCAG 2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)).
- **The glyph must be visible.** A symbol counts as non-text content even when it is drawn with
  a font, so it needs 3:1 against the button background
  ([WCAG 1.4.11 Non-text Contrast, symbolic characters](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#symbolic-or-graphical-text-characters)).
  The glyph takes the icon colors of the mapped roles, the same values as the button's label
  colors, and clears 3:1 in every emphasis, intent and enabled state, in light and in dark mode.
  Since the Figma library's POC2 export it also reaches the 4.5:1 asked of text everywhere
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)),
  which the glyph does not need but its label colors on the Button do.
- **Borders are not the boundary.** The glyph identifies the control, so the light borders of
  subtle and ghost icon buttons, and the absent border of a ghost one at rest, need no contrast
  of their own
  ([WCAG 1.4.11, boundaries](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries)).
- **Color is never the only signal.** An error icon button is red, but its symbol and its label
  carry the meaning
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- **Visible focus.** As on the button, keyboard focus shows a ring of at least 3:1 drawn outside
  the border, thick enough for the AAA focus appearance criterion
  ([WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
  [WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)).
- **Text size.** Resize Text covers text, not icons, but people who need larger text also
  need to read the symbol that names the action, so the glyph grows with the text on every
  platform that lets people raise it, and the square with it
  ([WCAG 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html#intent)).
- **Target size.** The square is never smaller than 24 by 24 CSS pixels; extra small sits
  exactly there
  ([WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
- **Keyboard, on every platform.** People who use a physical or assistive keyboard reach the
  icon button and activate it like any button
  ([WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)). Native
  apps owe the same: EN 301 549 asks it of any software with a user interface, and accepts
  software that relies on the platform's own keyboard services
  ([EN 301 549 V3.2.1, clause 11.2.1.1.1](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf#page=70)).
  The native button control gets it from those services, so it needs no keyboard handling of
  its own; the keys are each platform's.
- **Motion.** The color transition is dropped when people ask their system for less motion
  ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
  a AAA criterion adopted as extra quality).

### Web

- The implementation renders a `<button>` with the label in `aria-label`
  ([ARIA in HTML](https://www.w3.org/TR/html-aria/#el-button),
  [Technique ARIA6](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA6)). `aria-label` wins
  over the button's content in the accessible name computation
  ([AccName: aria-label](https://www.w3.org/TR/accname-1.2/#comp_label)).
- The glyph is text: the ligature name (`delete`) that the font draws as a symbol. It carries
  `aria-hidden="true"`, so that word is never read
  ([AccName: hidden nodes](https://www.w3.org/TR/accname-1.2/#comp_hidden_not_referenced)).
- **Enter** and **Space** activate it; **Tab** moves focus to and from it
  ([APG keyboard interaction](https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction)).
  The focus ring uses
  [`:focus-visible`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible),
  and the transition is switched off under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
- The tooltip opens on hover and on keyboard focus, closes with **Escape** without moving the
  pointer or focus, and stays while the pointer moves over it
  ([APG Tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/),
  [MDN: tooltip role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/tooltip_role)).
  Never use the `title` attribute: browsers show it on hover only, never on keyboard focus or
  touch ([MDN: title, accessibility concerns](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/title#accessibility_concerns)).
- The native `disabled` attribute removes the button from the focus order
  ([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).
- Text sizes are px lengths today, so a browser's text-only size setting enlarges neither the
  labels nor the glyph, while zoom enlarges both, which meets Resize Text
  ([Technique G142](https://www.w3.org/WAI/WCAG22/Techniques/general/G142),
  [MDN: absolute length units](https://developer.mozilla.org/en-US/docs/Web/CSS/length#absolute_length_units)).
  When text follows that setting, the glyph follows it with it.

### iOS

- VoiceOver needs an alternative label for every key element of the interface: set the label
  as the button's accessibility label
  ([Apple HIG: VoiceOver, descriptions](https://developer.apple.com/design/human-interface-guidelines/voiceover#Descriptions)).
- The hit region must be at least 44 by 44 pt and a custom button always shows a press state
  ([Apple HIG: Buttons, best practices](https://developer.apple.com/design/human-interface-guidelines/buttons#Best-practices),
  [Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).
  Every size reaches it: the hit region extends around the drawn square and the layout
  reserves it, so the hit regions of neighbouring controls never overlap.
- Full Keyboard Access lets people reach and activate controls with the keyboard alone: use
  the native button, test with Full Keyboard Access on, and on iPadOS add no keyboard
  navigation of your own to the button
  ([Apple HIG: Keyboards, best practices](https://developer.apple.com/design/human-interface-guidelines/keyboards#Best-practices),
  [Apple HIG: Accessibility, speech](https://developer.apple.com/design/human-interface-guidelines/accessibility#Speech)).
- iPhone and iPad apps that run on a Mac show tooltips when the pointer rests on an element:
  give the icon button one there. On touch there is none, so the symbol carries the action
  ([Apple HIG: Offering help](https://developer.apple.com/design/human-interface-guidelines/offering-help#macOS-visionOS)).
- Apple asks for meaningful interface icons to grow as the font size increases: the glyph grows
  with Dynamic Type, up to the larger accessibility sizes, and the square with it
  ([Apple HIG: Typography, supporting Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography#Supporting-Dynamic-Type)).

### Android

- In Compose, the label is the `contentDescription` of the `Icon` inside the `IconButton`: the
  framework cannot describe the graphic on its own
  ([Jetpack Compose: graphic elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#graphic-elements)).
- The touch target must be at least 48 by 48 dp
  ([Android: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes)).
  Every size reaches it while keeping its drawn size: `minimumInteractiveComponentSize`
  reserves 48 dp around the square and the touch target fills it, as in Material's `IconButton`.
- With a hardware keyboard or Switch Access, focus navigation reaches the icon button and
  highlights it, in a logical order, and focus can always move on
  ([Orange guidelines: access to interactive elements](https://a11y-guidelines.orange.com/en/mobile/android/development/focus-navigation/#access-to-interactive-elements),
  [keyboard navigation order](https://a11y-guidelines.orange.com/en/mobile/android/development/focus-navigation/#keyboard-navigation-order)).

### Desktop

- On macOS, Full Keyboard Access lets people navigate to the icon button and activate it with
  the keyboard alone; use the native control and keep the standard keyboard shortcuts
  ([Apple HIG: Keyboards, best practices](https://developer.apple.com/design/human-interface-guidelines/keyboards#Best-practices)).
- On macOS the system shows a tooltip after people hover over a button for a moment: give the
  icon button one, a brief phrase that says what it does, like its label
  ([Apple HIG: Buttons, content](https://developer.apple.com/design/human-interface-guidelines/buttons#Content),
  [Apple HIG: Offering help](https://developer.apple.com/design/human-interface-guidelines/offering-help#macOS-visionOS)).
  On Windows and Linux, the native button gets keyboard access from the platform, as EN 301 549
  asks of any native software.
- macOS does not support Dynamic Type: there the icon button keeps its size, as text does
  ([Apple HIG: Typography, macOS](https://developer.apple.com/design/human-interface-guidelines/typography#macOS)).

## Related

- Button (actions with a text label)
- Switch (a setting turned on or off)
- Link (navigation)
