---
component: breadcrumb
title: Breadcrumb
summary: Shows where the current page sits in a hierarchy, with a link to each level above it.
order: 25
---

## Overview

A breadcrumb lists the pages above the current one, from the top of the hierarchy down, each
as a link, and ends with the current page, which is not a link. It tells people where they are
and lets them go up one or several levels in one activation. It is a navigation landmark of
its own, named Breadcrumb, separate from the main navigation.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Sites and products organised as a hierarchy at least three levels deep.
- Pages people reach from search or links, without passing through the levels above.

## When not to use

- **Flat structures** of one or two levels: the main navigation says it all.
- **A step indicator** in a flow: steps are not pages above the current one.
- **History** (where people came from): a breadcrumb shows the structure, not the path taken.

## Sizes

| Size | Use for |
| --- | --- |
| Small | Above dense content: 12 px text, 16 px separators. |
| Medium | Page headers, the default: 14 px text, 20 px separators. |

## States

States belong to the items.

| State | How it happens | What changes |
| --- | --- | --- |
| Default | A link to a level above. | Underlined, in the secondary text color. |
| Hover | A pointer rests over a link. Needs a pointing device: there is no hover on touch. | The primary text color. |
| Focus visible | Keyboard focus on a link. | The shared focus ring appears around it. Pointer focus shows no ring. |
| Current | The last item. | Plain text in the primary color, not underlined, exposed as the current page. |

## Content

- Each level is the title of its page, as short as the page allows.
- The first level is the root (**Home**, **Projects**), the last the current page. Never
  truncate the current page.

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **A labelled landmark with a list.** Screen reader users move between landmarks; a
  breadcrumb is a navigation landmark named Breadcrumb, distinct from the main navigation, and
  its levels are an ordered list, so the number of levels and their order are announced
  ([WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [APG Breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/),
  [APG: navigation landmark](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/navigation.html),
  [WCAG 2.4.1 Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html)).
- **Location.** A breadcrumb trail is WCAG's own example of telling people where they are
  within a set of pages
  ([WCAG 2.4.8 Location](https://www.w3.org/WAI/WCAG22/Understanding/location.html),
  [G65](https://www.w3.org/WAI/WCAG22/Techniques/general/G65)).
- **The current page is not a link.** It is marked current and distinguished by weight and
  position, not by color alone
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
  [WAI-ARIA: aria-current](https://www.w3.org/TR/wai-aria-1.2/#aria-current)).
- **Links say where they go** and the trail sits in the same place on every page
  ([WCAG 2.4.4 Link Purpose (In Context)](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-in-context.html),
  [WCAG 3.2.3 Consistent Navigation](https://www.w3.org/WAI/WCAG22/Understanding/consistent-navigation.html)).
- **Contrast, focus and target.** Links are underlined text; the separators are hidden
  decoration; keyboard focus shows the ring; links are at least 24 px high
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
  [WCAG 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html),
  [WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
  [WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html),
  [WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html),
  [WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html),
  [WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).

### Web

- The implementation renders `<nav aria-label="Breadcrumb">` holding an `<ol>`; each level is
  an `<li>` with an `<a>`, and the last one a `<span aria-current="page">`; separators carry
  `aria-hidden="true"`
  ([ARIA in HTML: nav](https://www.w3.org/TR/html-aria/#el-nav),
  [HTML-AAM: nav](https://www.w3.org/TR/html-aam-1.0/#el-nav),
  [HTML: the ol element](https://html.spec.whatwg.org/multipage/grouping-content.html#the-ol-element),
  [APG breadcrumb example](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/examples/breadcrumb/),
  [MDN: aria-current](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current),
  [ARIA6](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA6),
  [ARIA11](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA11),
  [WAI-ARIA: aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)).
- The focus ring uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible)).

## Related

- Pagination (moving between the pages of a list)
