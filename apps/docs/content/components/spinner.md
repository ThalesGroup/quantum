---
component: spinner
title: Spinner
summary: Says that something is loading when its length is unknown, as a turning ring with a label.
order: 28
---

## Overview

A spinner is the indeterminate loading indicator: a ring turns while something loads, and a
label names what loads, shown next to the ring or kept for assistive technology only. Use it
for short waits in a small area; for a long or measurable wait, a Progress bar; for content
whose layout is known, Skeletons. Other systems call it an activity indicator, a loading
indicator or a progress circle; the system calls it a spinner because that is what most people
and libraries say.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- A request of unknown length: saving, signing in, searching.
- An area that waits for content whose shape is unknown.

## When not to use

- **The length is known or measurable.** Use a Progress bar.
- **The content's layout is known.** Use Skeletons.
- **Decoration.** A spinner that turns while nothing happens misleads.

## Sizes

| Size | Use for |
| --- | --- |
| Small | Inline, in a button or a table cell: 16 px. |
| Medium | Panels, the default: 24 px. |
| Large | Centered in an empty panel or page: 32 px. |

## Label

The label names what loads (**Loading projects**, **Saving**). It is always there: shown next
to the ring when there is room, visually hidden otherwise, and announced in both cases.

## Accessibility

The Specification tab lists the full accessibility contract. Each statement there links the
source it comes from. This section explains the decisions behind it.

- **A status message.** A spinner reports a waiting state without taking focus: a polite live
  region whose text, the label, is announced when the spinner appears. The ring alone would
  say nothing to assistive technology, which is why the label is never absent
  ([WCAG 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html),
  [WAI-ARIA: status role](https://www.w3.org/TR/wai-aria-1.2/#status),
  [ARIA22](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22),
  [WCAG 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)).
- **The arc is a graphical object.** It keeps 3:1 against the page and against the still part
  of the ring in both modes; the movement and the label say the state, not the color
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#graphical-objects),
  [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
  [WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
- **Motion.** A spinner turns as long as the wait lasts; shown alone while nothing else is
  usable, it is WCAG's preloader case. Under reduced motion the ring stops turning and pulses
  its opacity, so it still says that something happens
  ([WCAG 2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html),
  [WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).

### Web

- The implementation renders a `<div role="status">` holding the ring (`aria-hidden="true"`)
  and the label, visually hidden unless shown. Insert it when the wait starts and remove or
  replace it when the content arrives
  ([MDN: status role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role),
  [ARIA10](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA10),
  [WAI-ARIA: aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)).
- The rotation is replaced by an opacity pulse under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

### iOS

- An indeterminate progress indicator, also called an activity indicator, uses an animated image
  to indicate progress; people prefer a determinate indicator when possible; keep it moving
  while the operation runs and remove it when it completes. Reduce automatic animations when
  Reduce Motion is on
  ([Apple HIG: Progress indicators](https://developer.apple.com/design/human-interface-guidelines/progress-indicators),
  [Apple HIG: Accessibility, cognitive](https://developer.apple.com/design/human-interface-guidelines/accessibility#Cognitive)).

### Android

- Mark the waiting message as a live region and describe the indicator's purpose
  ([Jetpack Compose: alerts and pop-ups](https://developer.android.com/develop/ui/compose/accessibility/semantics#alerts-pop-ups),
  [Android accessibility: describe each UI element](https://developer.android.com/guide/topics/ui/accessibility/apps#describe-ui-element)).

## Related

- Progress bar (a measurable wait)
- Skeleton (content whose layout is known)
