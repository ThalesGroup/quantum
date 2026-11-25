---
component: search-field
title: Search field
summary: Lets people type what they are looking for.
order: 22
---

## Overview

A search field collects a search term: a query for a whole site, a filter for a list. It is a
Text field with a search glyph at its start, announced as a search box, whose clear control the
platform provides. It has a visible label, even when that label is just **Search**, and an
optional description. It has no error state: a search that finds nothing is reported by the
results.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Searching a site, a product or a long list.
- Filtering a list as people type (the docs' token filter is one).

## When not to use

- **Collecting a value that is not a query.** Use a Text field.
- **Choosing among known values.** Use a Select or a Radio group.

## Sizes and states

Sizes follow the Text field (small, medium, large), their touch targets on iOS and Android included. States are default, hover, focus visible
and disabled: no invalid, no read-only. When people raise the text size the box grows as the
Text field's does, keeping the Button's minimum space above and below the text.

The search glyph follows the text beside it: as light as the placeholder while the field is
empty, as dark as the value once people type. It never stands out from the text it introduces.

## Content

- The label says what is searched: **Search**, **Search projects**, **Filter by name**.
- The placeholder gives an example or the scope (**Name, email or role**), never the label.
- An empty result is reported next to the results, with what to try next.
- A search field usually stands alone, so it carries no required mark by default. Inside a form
  that marks its fields, it takes the form's **Marked fields**, as the Text field does.

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **A search box, by name.** The native search control exposes the searchbox role, so
  assistive technology announces what the field is for before people type
  ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [WAI-ARIA: searchbox role](https://www.w3.org/TR/wai-aria-1.2/#searchbox)).
- **A visible label, even a short one.** The glyph is decoration; the label is the name, and
  the placeholder disappears when people type
  ([WCAG 3.3.2 Labels or Instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WCAG 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html),
  [WAI tutorial: Labeling controls](https://www.w3.org/WAI/tutorials/forms/labels/),
  [WAI tutorial: placeholder text](https://www.w3.org/WAI/tutorials/forms/instructions/#placeholder-text)).
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
- **Enter and the return key.** Enter runs the search on every platform. A search field's action
  is always search, so it labels its own return key for search wherever it sits: the template writes
  `enterkeyhint="search"` (`attrs` can replace it), iOS uses the search return key type, as Apple
  suggests when an app starts a search, and Windows the Search input scope, whose touch keyboard shows
  a Search key instead of Enter
  ([HTML: enterkeyhint](https://html.spec.whatwg.org/multipage/interaction.html#attr-enterkeyhint),
  [UIKit: UIReturnKeyType](https://developer.apple.com/documentation/uikit/uireturnkeytype),
  [Apple HIG: Virtual keyboards](https://developer.apple.com/design/human-interface-guidelines/virtual-keyboards#Best-practices),
  [UIKit: searchBarSearchButtonClicked](https://developer.apple.com/documentation/uikit/uisearchbardelegate/searchbarsearchbuttonclicked(_:)),
  [Windows: AutoSuggestBox, query submitted](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/auto-suggest-box#query-submitted),
  [Windows: input scope Search](https://learn.microsoft.com/en-us/windows/apps/develop/input/use-input-scope-to-change-the-touch-keyboard#search)).
  Alone in its search form, as in a header or a sidebar, it needs no submit button: a form whose
  only field is this one submits on Enter
  ([HTML: implicit submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission)).
- **Escape.** Chrome clears the term on Escape, as the clear cross some browsers draw does; other
  browsers keep it. The component leaves the browser's behaviour as it is
  ([MDN: input type=search](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/search#differences_between_search_and_text_types)).

### Web

- The implementation renders an `<input type="search">` with a `<label for>`, a description
  referenced by `aria-describedby`, and the search glyph in `aria-hidden="true"`. The clear
  control is the browser's: the component neither styles nor removes it
  ([ARIA in HTML: input type=search](https://www.w3.org/TR/html-aria/#el-input-search),
  [HTML-AAM: input type=search](https://www.w3.org/TR/html-aam-1.0/#el-input-search),
  [HTML: the Search state](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)),
  [MDN: input type=search, labels and accessibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/search#search_form_labels_and_accessibility),
  [WAI-ARIA: aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)).
- The focus outline uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible));
  a disabled field leaves the focus order
  ([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).
- The color transitions of the control are switched off under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
- Text sizes are px lengths today, so a browser's text-only size setting does not enlarge the
  field's text, while zoom enlarges the text and the box together, which meets Resize Text
  ([Technique G142](https://www.w3.org/WAI/WCAG22/Techniques/general/G142),
  [MDN: absolute length units](https://developer.mozilla.org/en-US/docs/Web/CSS/length#absolute_length_units)).

### iOS

- The recommended minimum text size is 11 pt; the help text at 12 pt is above it
  ([Apple HIG: Typography](https://developer.apple.com/design/human-interface-guidelines/typography#Specifications)).
- A search field displays a search icon, a clear button and placeholder text; use the
  placeholder to help people know what they can search for
  ([Apple HIG: Search fields](https://developer.apple.com/design/human-interface-guidelines/search-fields)).
  Every size reaches a 44 by 44 pt hit region as on the Text field: it extends above and below the
  box, over the field's own label and help text, which keep their 6 pt
  ([Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).
- With a hardware keyboard on iPadOS 15 and later, Tab moves focus among focus groups, and
  iPadOS supports keyboard navigation in text fields and text views, unlike buttons. On iPhone,
  Full Keyboard Access reaches the field: use the native text field and test with it on
  ([Apple HIG: Focus and selection, iPadOS](https://developer.apple.com/design/human-interface-guidelines/focus-and-selection#iPadOS), [Apple HIG: Keyboards, best practices](https://developer.apple.com/design/human-interface-guidelines/keyboards#Best-practices), [Apple HIG: Accessibility, speech](https://developer.apple.com/design/human-interface-guidelines/accessibility#Speech)).
- The text grows with Dynamic Type, up to the larger accessibility sizes, and the box grows with it and keeps its block padding:
  Apple asks that layouts adapt to all font sizes
  ([Apple HIG: Typography, supporting Dynamic Type](https://developer.apple.com/design/human-interface-guidelines/typography#Supporting-Dynamic-Type)).

### Android

- Interactive elements need a 48 by 48 dp touch target, and every size reaches it as on the Text
  field: the touch target extends above and below the box, over the field's own label and help text,
  and the box does not take `minimumInteractiveComponentSize`, which would move the label
  ([Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes)).
- With a hardware keyboard, a D-pad or Switch Access, focus navigation reaches the field in a
  logical order and can always leave it. Tab moves focus to the next focus target; Shift+Tab moves back; the arrow keys and the
  D-pad move the caret, then move focus at the start or end of the text; Shift with the arrows
  selects, Ctrl+A selects all ([Orange: Android keyboard navigation](https://a11y-guidelines.orange.com/en/mobile/android/development/focus-navigation/#keyboard-navigation-order), [Jetpack Compose: focus in text fields](https://developer.android.com/develop/ui/compose/touch-input/focus/focus-in-text-fields#one-dimensional-focus-traversal),
  [two-dimensional traversal](https://developer.android.com/develop/ui/compose/touch-input/focus/focus-in-text-fields#two-dimensional-focus-traversal), [Jetpack Compose: keyboard commands](https://developer.android.com/develop/ui/compose/touch-input/keyboard-input/commands)).

### Desktop

- On macOS, Full Keyboard Access lets people navigate to the field and use it with the keyboard
  alone; Tab and Shift-Tab move through the key view loop and Command-A selects all the text.
  Use the native control and keep the standard keyboard shortcuts ([Apple HIG: Keyboards, best practices](https://developer.apple.com/design/human-interface-guidelines/keyboards#Best-practices),
  [Apple HIG: standard keyboard shortcuts](https://developer.apple.com/design/human-interface-guidelines/keyboards#Standard-keyboard-shortcuts), [AppKit: nextKeyView](https://developer.apple.com/documentation/appkit/nsview/nextkeyview)).
- On Windows, Tab follows the tab order, the order the controls are added, and skips a disabled
  field; Shift+Tab goes back; in the field the arrow keys move the caret, since every key goes to
  the text first ([Windows: keyboard accessibility](https://learn.microsoft.com/en-us/windows/apps/design/accessibility/keyboard-accessibility#keyboard-navigation-among-ui-elements), [Windows: keyboard interactions, navigation](https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions#navigation), [text entry](https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions#text-entry)).
- On macOS, Option-Command-F moves focus to the product's main search field, a standard shortcut
  ([Apple HIG: standard keyboard shortcuts](https://developer.apple.com/design/human-interface-guidelines/keyboards#Standard-keyboard-shortcuts)).
- macOS does not support Dynamic Type: there the field keeps its size, as text does
  ([Apple HIG: Typography, macOS](https://developer.apple.com/design/human-interface-guidelines/typography#macOS)).
- On Windows, people can enlarge text alone up to 225 %, and controls and containers must resize
  with it: the box grows with it and keeps its block padding ([Windows: text scaling](https://learn.microsoft.com/en-us/windows/apps/develop/input/text-scaling#ux-guidance)).

## Related

- Text field (free text)
- Select (a choice among known values)
