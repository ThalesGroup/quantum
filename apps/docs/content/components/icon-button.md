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

Because nothing on screen spells the action out, every icon button carries a **label**. It is
never shown: it is the name screen readers announce and speech-input users say. An icon button
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
- **Toggling something on or off** (favorite, mute, bold). Use a toggle button, whose pressed
  state is announced.

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

The glyph grows with the size; its style does not change. It sits centered in the square,
with no padding of its own.

### iOS

The sizes are the same as on the web: extra small, small and medium icon buttons are under the
44 pt hit region Apple recommends until the platform gets its own sizes.

### Android

The sizes are the same as on the web: every size, large included, is under the 48 dp touch
target Android recommends until the platform gets its own sizes.

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

The label is the only text of the component, and nobody sees it: write it for people who hear
or say it.

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
- **Name the function, not the symbol.** Without visible text, the Label in Name criterion does
  not apply, and its Understanding document recommends a name that reflects the function
  ([WCAG 2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)).
- **The glyph must be visible.** A symbol counts as non-text content even when it is drawn with
  a font, so it needs 3:1 against the button background
  ([WCAG 1.4.11 Non-text Contrast, symbolic characters](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#symbolic-or-graphical-text-characters)).
  The glyph takes the icon colors of the mapped roles, the same values as the button's label
  colors, and clears 3:1 in every emphasis, intent and enabled state, in light and in dark mode.
  With the Figma library's error colors it no longer reaches the 4.5:1 asked of text everywhere
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html);
  a known issue), which the glyph does not need but its label colors on the Button do.
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
- **Target size.** The square is never smaller than 24 by 24 CSS pixels; extra small sits
  exactly there
  ([WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
- **Keyboard.** The icon button is operable from the keyboard like any button
  ([WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)).
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
- The native `disabled` attribute removes the button from the focus order
  ([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).

### iOS

- VoiceOver needs an alternative label for every key element of the interface: set the label
  as the button's accessibility label
  ([Apple HIG: VoiceOver, descriptions](https://developer.apple.com/design/human-interface-guidelines/voiceover#Descriptions)).
- The hit region must be at least 44 by 44 pt and a custom button always shows a press state
  ([Apple HIG: Buttons, best practices](https://developer.apple.com/design/human-interface-guidelines/buttons#Best-practices),
  [Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).
  The extra small, small and medium icon buttons fall under it today.

### Android

- In Compose, the label is the `contentDescription` of the `Icon` inside the `IconButton`: the
  framework cannot describe the graphic on its own
  ([Jetpack Compose: graphic elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#graphic-elements)).
- The touch target must be at least 48 by 48 dp
  ([Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes)).
  Every size falls under it today.

## Related

- Button (actions with a text label)
- Toggle button (icon actions with a pressed state)
- Link (navigation)
