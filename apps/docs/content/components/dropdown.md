---
component: dropdown
title: Dropdown
summary: A button that opens a menu of related actions.
order: 3
---

## Overview

A dropdown gathers actions that belong together (sharing, exporting, the less frequent
actions of a row) behind one button, and shows them in a menu when the button is activated.
Choosing an action performs it and closes the menu.

The trigger **is** a Button: it takes the same emphasis, intent, size and
leading icon, with a chevron after its label to say that it opens something. Everything the
Button guidelines say about choosing an emphasis or an intent applies to the trigger.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Several related actions compete for space, and none of them is the obvious main action.
- Secondary actions of a row, a card or a toolbar ("More actions").
- Variants of one action (Export as PDF, CSV, image).

## When not to use

- **Choosing a value** that stays visible afterwards (a sort order, a country). Use a select:
  it shows the current choice and announces it as a value.
- **One main action with alternatives** (Save, with Save as… next to it). Use a split button,
  so the main action stays one click away.
- **Navigation of a site.** Use navigation links; a dropdown holds actions of the current view.
- **Two or three actions with enough room.** Show them as buttons: hidden actions are found
  less often.

## Trigger

The trigger label names the set of actions: **Share**, **Export**, **More actions**. It never
repeats the first item. Choose its emphasis like a button's: a dropdown is rarely the single
most important action of a view, so subtle and ghost are the usual choices. Keep the error
intent for a trigger whose every item is destructive.

The chevron is part of the trigger and cannot be removed: it is what tells people the button
opens a menu rather than performing an action.

## Menu

The menu opens below the trigger, aligned with its start edge, and is at least as wide as the
trigger. When there is not enough room, it opens above or towards the other side. It floats
above the page and never pushes content around.

The menu is a level 2 surface (Color foundation, surface levels), wherever it opens. In dark
mode it is lighter than the page and than a level 1 panel it may open over, so it reads as
raised; in light mode it has the page color and its outline separates it.

### Items

| Item | Use for |
| --- | --- |
| Neutral | Every ordinary action. The default. |
| Error | Destructive or irreversible actions: delete, remove, revoke. The label and icon turn to the error color; the label names the consequence. |
| Disabled | An action that exists but does not apply right now (Paste with an empty clipboard). It stays in place, dimmed. Remove an action that never applies instead. |
| Link | An item with a destination navigates instead of performing an action. Use it for destinations outside the current view. |

An item can start with an icon that reinforces its verb. Give icons to every item of a group,
or to none, so the labels stay aligned.

### Groups and separators

A separator splits the menu into groups of related items. Put destructive items last, in a
group of their own, so they are never the item people hit by habit.

## States

The trigger takes every state of the Button; the menu items have states of their own.

| State | Part | How it happens | What changes |
| --- | --- | --- | --- |
| Default | Trigger, item | Resting. The menu is closed. | Trigger as a button; items without fill. |
| Hover | Trigger, item | A pointer rests over it. Needs a pointing device: there is no hover on touch. | The trigger follows the Button. An item gains the light tint of its intent. |
| Active | Trigger, item | Pressed down. | The trigger follows the Button. An item takes the next tint. |
| Focus visible | Trigger, item | Keyboard focus. | The shared focus ring appears outside it. Pointer focus shows no ring. |
| Disabled | Trigger, item | The `disabled` property of the dropdown, or of an item. | A disabled trigger cannot open the menu; a disabled item is dimmed and cannot be activated. |
| Expanded | Trigger | The menu is open. | The menu is shown. The trigger keeps its look. |

## Content

- The trigger label is a noun or a verb naming the whole set: **Share**, **Export**, **More
  actions**.
- Item labels start with a verb: **Duplicate**, **Rename**, **Delete project**.
- One to three words per item. Items never wrap.
- With the error intent, name the consequence: **Delete project**, **Remove member**.

Capitalization follows the platform, as for buttons: sentence case on the web, Android and
desktop.

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **A disclosure, not an ARIA menu.** The trigger is a button that shows and hides the menu,
  and exposes whether it is expanded
  ([APG Disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/),
  [WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html)).
  The menu is deliberately not given the ARIA menu role: that role promises arrow-key
  navigation and focus handled by script
  ([APG Menu pattern, keyboard interaction](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/#keyboard_interaction)),
  and a role whose promise is not kept is worse than no role at all
  ([APG: no ARIA is better than bad ARIA](https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/#no_aria_better_bad_aria)).
  The design system ships no script, so its items are plain buttons and links that everyone
  already knows how to use, as in APG's own
  [disclosure navigation example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/#aboutthisexample).
- **The right element for each item.** An item that does something is a button; an item that
  goes somewhere is a link. Screen readers announce what will happen.
- **The labels are the names.** The trigger is named by its label and every item by its own;
  icons and the chevron are hidden. Speech-input users say what they see
  ([WCAG 2.5.3 Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html)).
- **Focus order.** The menu comes right after the trigger, so its items are the next stops
  after the trigger in the focus and reading order
  ([WCAG 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html)).
  Activating an item from the keyboard closes the menu and puts focus back on the trigger.
- **Escape always closes.** The menu also closes on a click or tap outside it. It stays open
  when keyboard focus moves past its last item, where it may cover the next control; Escape
  then hides it without moving focus, which keeps the focused control revealable
  ([WCAG 2.4.11 Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html#success-criterion)).
- **Color is never the only signal.** A destructive item names what it destroys
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
  Item labels contrast at least 4.5:1 with the item in every intent and enabled state, in light
  and dark mode
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)),
  except a pressed error item in light mode (4.35:1), which keeps the Figma library's error colors as
  they are.
  Items are identified by their labels, so the menu border and the separators need no 3:1
  contrast; the focus ring does
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)).
- **Visible focus everywhere.** The trigger and every item show the shared focus ring on
  keyboard focus; the menu leaves room around its items so the ring is never cut
  ([WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)).
- **Targets.** Items are at least 32 CSS pixels high and as wide as the menu, above the
  24-pixel floor
  ([WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
- **Disabled items** cannot explain themselves. Keep an action enabled and explain on
  activation when people need to know why it is unavailable.

### Web

- The trigger is a native `<button>` with `popovertarget`, and the menu a popover: the browser
  exposes the expanded state, places the menu right after the trigger in the focus order,
  closes it on Escape or a click outside, and returns focus to the trigger, with no script and
  no ARIA state to keep in sync
  ([HTML-AAM: popovertarget](https://www.w3.org/TR/html-aam-1.0/#att-popovertarget),
  [MDN: popover accessibility features](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using#popover_accessibility_features)).
- The popover is exposed as a group, named by the trigger, so entering it announces which
  actions it holds
  ([HTML-AAM: popover](https://www.w3.org/TR/html-aam-1.0/#att-popover)).
- Each group is a `<ul>` and each separator an `<hr>`: screen readers announce how many items
  a group holds and where groups end
  ([ARIA in HTML: hr](https://www.w3.org/TR/html-aria/#el-hr),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)).
- Action items carry `popovertargetaction="hide"` to close the menu
  ([HTML: popover target attributes](https://html.spec.whatwg.org/multipage/popover.html#the-popover-target-attributes)).
  Links cannot, which is one more reason to keep link items for other pages.
- A disabled action item uses `disabled` and leaves the Tab order; a disabled link item loses
  its `href` and says it is disabled with `aria-disabled`
  ([WAI-ARIA: aria-disabled](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled),
  [APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).
- On macOS, browsers may leave links out of the Tab sequence until people turn on the system
  keyboard setting that reaches every control
  ([APG: the tab sequence](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_general_between)):
  prefer action items in a menu.
- The menu is placed with CSS anchor positioning, the trigger being its implicit anchor.
  Browsers without anchor positioning show the menu in their default popover position, centered
  in the viewport; it keeps working.

### iOS

- Use a pull-down button: its menu offers commands directly related to the button's action,
  shows destructive items in red and dims unavailable ones, and separators distinguish groups
  ([Apple HIG: Pull-down buttons](https://developer.apple.com/design/human-interface-guidelines/pull-down-buttons#Best-practices),
  [Apple HIG: Menus, organization](https://developer.apple.com/design/human-interface-guidelines/menus#Organization),
  [Apple HIG: Menus, labels](https://developer.apple.com/design/human-interface-guidelines/menus#Labels)).
- The trigger and the items must reach the 44 by 44 pt hit region
  ([Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility));
  the items (32 pt) and the smaller triggers fall under it today.

### Android

- The trigger and the items must reach the 48 by 48 dp touch target
  ([Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls));
  the items (32 dp) and the smaller triggers fall under it today.

## Related

- Button (the trigger, and single actions)
- Select (choosing a value; planned)
- Split button (a main action next to its menu; planned)
