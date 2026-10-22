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

Sizes follow the Text field (small, medium, large). States are default, hover, focus visible
and disabled: no invalid, no read-only.

## Content

- The label says what is searched: **Search**, **Search projects**, **Filter by name**.
- The placeholder gives an example or the scope (**Name, email or role**), never the label.
- An empty result is reported next to the results, with what to try next.

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
- **Contrast, focus and target size** follow the Text field
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#boundaries),
  [WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
  [WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html),
  [WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html),
  [WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html),
  [WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).

### Web

- The implementation renders an `<input type="search">` with a `<label for>`, a description
  referenced by `aria-describedby`, and the search glyph in `aria-hidden="true"`. The clear
  control is the browser's: the component neither styles nor removes it
  ([ARIA in HTML: input type=search](https://www.w3.org/TR/html-aria/#el-input-search),
  [HTML-AAM: input type=search](https://www.w3.org/TR/html-aam-1.0/#el-input-search),
  [HTML: the Search state](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)),
  [MDN: input type=search, labels and accessibility](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/search#search_form_labels_and_accessibility),
  [WAI-ARIA: aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)).
- The focus ring uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible));
  a disabled field leaves the focus order
  ([APG: focusability of disabled controls](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_disabled_controls)).

### iOS

- A search field displays a search icon, a clear button and placeholder text; use the
  placeholder to help people know what they can search for
  ([Apple HIG: Search fields](https://developer.apple.com/design/human-interface-guidelines/search-fields)).
  The small and medium sizes fall under the 44 by 44 pt hit region today
  ([Apple HIG: Accessibility, mobility](https://developer.apple.com/design/human-interface-guidelines/accessibility#Mobility)).

### Android

- Interactive elements need a 48 by 48 dp touch target; the small and medium sizes fall under
  it today
  ([Android accessibility: use large, simple controls](https://developer.android.com/guide/topics/ui/accessibility/apps#large-controls),
  [Jetpack Compose: minimum touch target sizes](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#minimum-target-sizes)).

## Related

- Text field (free text)
- Select (a choice among known values)
