---
component: pagination
title: Pagination
summary: Lets people move between the pages of a long list, with the current page marked.
order: 26
---

## Overview

A pagination splits a long list into pages and lets people go to a page by its number or to
the previous and next ones. The pages are links with destinations, so the browser handles
history and focus; the current page is marked and is not a link. Which numbers to show (all
of them, a window around the current one, an ellipsis) is the application's decision: the
component renders the list it is given.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Lists of results too long for one page: search results, orders, logs.
- Any list where people need to reach a far page directly, or to come back to a page later.

## When not to use

- **Infinite scrolling or "Load more"** fits better when people read through a feed; it is
  another pattern.
- **A few pages of a flat sequence** (an onboarding): a step indicator or a page control.

## Sizes

| Size | Use for |
| --- | --- |
| Small | Under dense tables: 32 px links with 14 px text. |
| Medium | The default: 40 px links with 16 px text. |

## States

States belong to the items.

| State | How it happens | What changes |
| --- | --- | --- |
| Default | A page link. | Text on a transparent background. |
| Hover | A pointer rests over a link. Needs a pointing device: there is no hover on touch. | The subtle neutral tint. |
| Active | Pressed down. | The next tint. |
| Focus visible | Keyboard focus on a link. | The shared focus ring appears around it. Pointer focus shows no ring. |
| Current | The page's `current` property. | Filled with the accent neutral color, not a link, exposed as current. |
| Disabled | Previous or next without a destination. | Dimmed, not focusable, exposed as disabled. |

## Content

- Page labels are the numbers; an ellipsis stands for skipped pages and is not a link.
- **Previous** and **Next** are written out next to their chevrons.

## Accessibility

The Specification tab lists the full accessibility contract. Each statement there links the
source it comes from. This section explains the decisions behind it.

- **A labelled landmark of links.** Screen reader users move between landmarks and lists of
  links; the pagination is a navigation landmark named Pagination, distinct from the main
  navigation, holding a list
  ([WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [WAI-ARIA: navigation role](https://www.w3.org/TR/wai-aria-1.2/#navigation),
  [APG: navigation landmark](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html),
  [WCAG 2.4.1 Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html)).
- **Links, not buttons.** A page has a destination; a link gives history, focus and
  announcements without script. The current page is marked current and is not a link; a
  previous or next without destination is exposed as a disabled link
  ([WAI-ARIA: aria-current](https://www.w3.org/TR/wai-aria-1.2/#aria-current),
  [WAI-ARIA: aria-disabled](https://www.w3.org/TR/wai-aria-1.2/#aria-disabled),
  [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- **Link purpose and consistency.** A number is clear in the context of the landmark, and the
  pagination sits in the same place on every page
  ([WCAG 2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html),
  [WCAG 3.2.3 Consistent Navigation](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html)).
- **Contrast, focus and target.** Links are text; chevrons are hidden decoration backed by the
  words; keyboard focus shows the ring; links are at least 32 px square
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
  [WCAG 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html),
  [WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
  [WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html),
  [WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html),
  [WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html),
  [WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).

### Web

- The implementation renders `<nav aria-label="Pagination">` holding a `<ul>`; page links are
  `<a>` elements, the current page a `<span aria-current="page">`, and a previous or next link
  without destination a `<span role="link" aria-disabled="true">`; chevrons carry
  `aria-hidden="true"`
  ([ARIA in HTML: nav](https://www.w3.org/TR/html-aria/#el-nav),
  [HTML-AAM: nav](https://www.w3.org/TR/html-aam-1.0/#el-nav),
  [ARIA in HTML: a without href](https://www.w3.org/TR/html-aria/#el-a-no-href),
  [MDN: aria-current](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current),
  [ARIA6](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA6),
  [ARIA11](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA11),
  [WAI-ARIA: aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)).
- The focus ring uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible)).

### iOS

- A page control shows a row of indicators, the current one solid, for a few pages of a flat
  list; numbered links remain for long lists
  ([Apple HIG: Page controls](https://developer.apple.com/design/human-interface-guidelines/page-controls)).

## Related

- Breadcrumb (where a page sits in a hierarchy)
