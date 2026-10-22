---
component: badge
title: Badge
summary: "A short piece of text that qualifies the item next to it: a status, a count, a category."
order: 16
---

## Overview

A badge is a small, read-only label attached to something else: the status of an order, the
number of unread messages, a category. It is text first; its tint gives that text a meaning
(success, warning, error, info) and its emphasis says how loud it is. A badge is never
interactive and is never read on its own: it qualifies the row, the title or the item it sits
next to.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- The status of an item in a list or a table (Shipped, Failed, Draft).
- A count next to a label (12 unread).
- A category or a tag that people read but do not act on (Beta, New).

## When not to use

- **Something people can remove or toggle** (a filter, a selected tag). That is a different,
  interactive component.
- **A message with a sentence to read.** Use an Alert.
- **Decorating a heading.** A badge carries information; if removing it loses nothing, remove it.

## Emphasis

| Emphasis | Use for |
| --- | --- |
| Subtle | Most statuses and tags: a tinted fill with a light border and colored text. The default. |
| Accent | Counts, and the one status in a view that must stand out: a strong fill with a contrasting label. |

## Intent

| Intent | Use for |
| --- | --- |
| Neutral | Categories, counts, tags with no status meaning. The default. |
| Brand | Something new or highlighted by the product (New, Beta). |
| Success | Done, active, passing (Shipped, Online). |
| Warning | Needs attention soon (Expiring, Pending). |
| Error | Failed, blocked, overdue. |
| Info | Informative or in progress (Draft, Scheduled). |

The intent colors the badge; the label says the status. Someone who cannot see the color must
read the same information: **Failed**, never **Red**.

## Sizes

| Size | Use for |
| --- | --- |
| Small | Inline in dense text and table cells: 20 px high, 12 px text. |
| Medium | Next to titles and in lists, the default: 24 px high, 14 px text. |

## Content

- One or two words in sentence case, or a number: **Shipped**, **Needs review**, **12**.
- Use the same words for the same status everywhere in a product.

## Accessibility

The Specification tab lists the full accessibility contract. Each statement there links the
source it comes from. This section explains the decisions behind it.

- **Text, not a widget.** A badge has no role, no name and no state of its own: it is a span
  whose text is read in the flow of the content it qualifies. That is why its position matters:
  it must come where a sentence would put it, after or inside the item
  ([WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WAI-ARIA: generic role](https://www.w3.org/TR/wai-aria-1.2/#generic)).
- **Color never alone.** The label says the status in words, so the badge still reads without
  its tint ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- **Contrast.** The label is text and needs 4.5:1 against the fill in every emphasis and intent,
  in both modes. All pairs pass except the accent error fill (4.46:1), a limit of the Figma library's
  error colors tracked as a known issue
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
  The border is decoration and needs no contrast of its own
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)).
- **Changes are announced by the page, not the badge.** A count that increments or a status
  that flips as the result of an action is a status message; the product wraps it in a live
  region ([WCAG 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)).

### Web

- The implementation renders a `<span>` with no ARIA role and no `aria-label`: the generic role
  prohibits naming, and the text is the content
  ([ARIA in HTML: span](https://www.w3.org/TR/html-aria/#el-span)).

### iOS

- Avoid relying solely on different colors to communicate meaning
  ([Apple HIG: Toggles, best practices](https://developer.apple.com/design/human-interface-guidelines/toggles#Best-practices)).

## Related

- Alert (a message with a sentence to read)
