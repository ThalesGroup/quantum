---
component: card
title: Card
summary: A surface that groups a title and related content as one unit.
order: 30
---

## Overview

A card gathers what belongs together, a title and its content, on a raised surface with its
own edge, so a page of many things reads as a grid of units: a project in a list of projects,
a plan in a pricing page, a group of settings. It is a surface, not a control: a card that
opens something holds a link or a button, and is never itself clickable. Its surface level
follows the Color foundation.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Grids and lists of comparable units: projects, plans, articles, members.
- Grouping a title and a few lines of content on a page with several such groups.

## When not to use

- **One block of content on a page.** A section with a heading needs no card.
- **A clickable unit.** Put a link or a button inside the card; do not make the card the control.
- **Collapsible sections.** Use an Accordion.

## Surface

| Surface | Use for |
| --- | --- |
| Level 1 | Cards on the page (level 0): the default. |
| Level 2 | Cards on a level 1 panel, or that must read as raised above their neighbours. |

The fill and the edge come from the Color foundation's surface levels; the card defines no
color of its own.

## Title and content

The title is a heading at the level the page gives it (the `headingLevel` property), so cards
in a list share one level under the list's heading. The content is text in the reference
rendering; a product puts its own content there. Media, footers and actions as parts are open
questions.

## Accessibility

The Specification tab lists the full accessibility contract. Each statement there links the
source it comes from. This section explains the decisions behind it.

- **Structure through the heading.** A card has no role of its own: it is a generic container.
  What makes it a unit for assistive technology is its heading, at a level that fits the page's
  outline, followed by its content in the reading order
  ([WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WAI tutorial: Headings](https://www.w3.org/WAI/tutorials/page-structure/headings/),
  [H42](https://www.w3.org/WAI/WCAG22/Techniques/html/H42),
  [WAI-ARIA: heading role](https://www.w3.org/TR/wai-aria-1.2/#heading)).
- **The title describes the unit**, so people scanning headings can find it
  ([WCAG 2.4.6 Headings and Labels](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html)).
- **Contrast.** Title and content are text on the surface level; the edge is decoration
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)).

### Web

- The implementation renders a `<div>` with no role and an `<h2>` to `<h6>` for the title. It
  never adds `role="article"`, `"region"` or `"group"` to a plain card, and never makes the
  card a link or a button
  ([ARIA in HTML: div](https://www.w3.org/TR/html-aria/#el-div),
  [WAI-ARIA: generic role](https://www.w3.org/TR/wai-aria-1.2/#generic),
  [ARIA in HTML: h1 to h6](https://www.w3.org/TR/html-aria/#el-h1-h6),
  [HTML: the h1 to h6 elements](https://html.spec.whatwg.org/multipage/sections.html#the-h1,-h2,-h3,-h4,-h5,-and-h6-elements)).

### Android

- Mark the title with the heading semantics so services can navigate by heading
  ([Jetpack Compose: headings](https://developer.android.com/develop/ui/compose/accessibility/semantics#headings)).

## Related

- Accordion (collapsible sections)
- Divider (separating content without a surface)
