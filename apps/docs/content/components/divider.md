---
component: divider
title: Divider
summary: A thin line that separates two groups of content.
order: 19
---

## Overview

A divider is a hairline between two sections of content or two groups of controls: between
the items of a list, between a header and a body, between the actions of a toolbar. It says
that a topic or a group changes. Spacing alone often says it as well; use a divider when the
separation must be seen.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Between groups of related items in a list or a menu.
- Between the sections of a settings page or a card.
- Between the groups of actions of a toolbar (vertical).

## When not to use

- **Spacing already separates the groups.** Lines add noise; try space first.
- **Under every item of a list.** Rows separated by lines read as a table; prefer spacing or a
  surface change.
- **As decoration under a heading.** A divider marks a thematic break; a decorative line is
  not this component.

## Orientation

| Orientation | Use for |
| --- | --- |
| Horizontal | Between stacked content: a full-width line with 16 px above and below. The default. |
| Vertical | Between the items of a row: a line stretched to the row's height, with 16 px before and after. At least 24 px high when the row does not stretch it. |

## Accessibility

The Specification tab lists the full accessibility contract. Each statement there links the
source it comes from. This section explains the decisions behind it.

- **A separator, when it means something.** A divider that marks a change of topic or group is
  a thematic break, and that structure is exposed to assistive technology as a separator, which
  screen readers announce or skip according to their settings. A line that is pure decoration
  should not be this component
  ([WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WAI-ARIA: separator role](https://www.w3.org/TR/wai-aria-1.2/#separator)).
- **No contrast requirement.** Nothing depends on seeing the line: a separation that must be
  perceived is also conveyed by spacing or structure, so the hairline needs no 3:1 against the
  surface ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
  [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- A divider is never a target and never receives focus.

### Web

- The implementation renders an `<hr>`, a paragraph-level thematic break with the implicit
  separator role; a vertical divider adds `aria-orientation="vertical"`, a property of the
  separator role ([HTML: the hr element](https://html.spec.whatwg.org/multipage/grouping-content.html#the-hr-element),
  [ARIA in HTML: hr](https://www.w3.org/TR/html-aria/#el-hr),
  [HTML-AAM: hr](https://www.w3.org/TR/html-aam-1.0/#el-hr),
  [MDN: hr](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/hr),
  [WAI-ARIA: aria-orientation](https://www.w3.org/TR/wai-aria-1.2/#aria-orientation)).

## Related

- Dropdown (its menu separates groups of items with this line)
