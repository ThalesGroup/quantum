---
component: skeleton
title: Skeleton
summary: A placeholder shape that stands in for content while it loads.
order: 27
---

## Overview

A skeleton draws the outline of content that is not there yet: a line of text, an avatar, a
card. Several skeletons laid out like the content they stand for tell people what is coming
and where, with less jump than a spinner followed by the real content. A skeleton is invisible
to assistive technology; the region that loads says so itself.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Content whose layout is known before it arrives: a list of cards, a profile, a table.
- Waits of a second or two, where a spinner would flash.

## When not to use

- **A wait of unknown shape** (a search): use a Spinner.
- **A measurable wait**: use a Progress bar.
- **Decoration.** A skeleton that never turns into content misleads.

## Shapes

| Shape | Use for |
| --- | --- |
| Text | A line of text: full width by default, 16 px high. Stack several, the last one shorter, for a paragraph. |
| Circle | An avatar or an icon: a 40 px disc. |
| Rectangle | A block, an image, a card: full width, 96 px high, 8 px corners. |

Width and height are the content's: pass them as lengths or percentages.

## Accessibility

The Specification tab lists the full accessibility contract. Each statement there links the
source it comes from. This section explains the decisions behind it.

- **Hidden, by design.** A skeleton is pure decoration standing in for content: assistive
  technology ignores it, and nothing people need is in it
  ([WCAG 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WAI-ARIA: aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)).
- **The region says it is loading.** Mark the region busy while the skeletons show, and announce
  the loading and the arrival of the content with a status message when the wait is long
  ([WAI-ARIA: aria-busy](https://www.w3.org/TR/wai-aria-1.2/#aria-busy),
  [MDN: aria-busy](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy),
  [WCAG 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)).
- **No contrast requirement.** The shapes convey nothing by their color (about 1.1:1 against the
  page); their layout does
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
  [WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)).
- **Motion.** The pulse is a gentle opacity change, stopped under reduced motion, and skeletons
  disappear as soon as the content arrives
  ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html),
  [WCAG 2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html)).

### Web

- The implementation renders a `<span aria-hidden="true">` with the shape as a data attribute
  and the width and height as custom properties in its style; the animation is switched off
  under [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

### iOS

- Reduce automatic animations when Reduce Motion is on
  ([Apple HIG: Accessibility, cognitive](https://developer.apple.com/design/human-interface-guidelines/accessibility#Cognitive)).

### Android

- Pass `null` as the content description of placeholder graphics
  ([Jetpack Compose: graphic elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#graphic-elements)).

## Related

- Spinner (a wait of unknown shape)
- Progress bar (a measurable wait)
