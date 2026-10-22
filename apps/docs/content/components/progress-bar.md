---
component: progress-bar
title: Progress bar
summary: Shows how far a task has progressed, or that it is in progress when its length is unknown.
order: 18
---

## Overview

A progress bar fills a track from start to end as a task advances: an upload, an export, the
steps of a setup. A visible label names the task; the value can be shown in percent when it
is measured. When the length of the task is unknown, the bar is indeterminate: a segment
moves along the track to say that something is happening. A progress bar only reports; it is
never a control.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- A task that takes more than a moment and whose progress can be measured (upload, export,
  import).
- The steps of a flow (step 3 of 5), as a bar under the step name.
- A quantity against a limit (storage used), when the bar reads as a fill rather than a wait.

## When not to use

- **A short wait of unknown length** inside a button or a small area. That is a spinner, not in
  the system yet.
- **A value people set.** That is a slider.

## Sizes

| Size | Use for |
| --- | --- |
| Small | Inline progress in lists and cards: a 4 px track. |
| Medium | Standalone progress, the default: an 8 px track. |

## Label and value

The label names the task and is the accessible name of the bar; it never goes away. The value,
when shown, sits at the end of the label row in percent. Show it when people wait for it and it
is accurate; hide it when it jumps or stalls.

## States

| State | How it happens | What changes |
| --- | --- | --- |
| Default | The value is known. | The indicator fills the track in proportion to the value. |
| Indeterminate | No value is set. | A segment moves along the track and keeps moving until a value is set or the bar is removed. Under reduced motion it rests at the start. |

Prefer a determinate bar whenever the duration is known: a moving segment says that something
happens, not how long it will take.

## Content

- The label names the task: **Uploading 12 photos**, **Exporting report**. Sentence case, no
  trailing punctuation.
- When the task ends, replace or complete the bar with a message that says so (**Upload
  complete**).

## Accessibility

The Specification tab lists the full accessibility contract. Each statement there links the
source it comes from. This section explains the decisions behind it.

- **A value, not a drawing.** The native progress element exposes the progressbar role, its
  name, its value and its maximum, so assistive technology reports the progress as a number
  ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WAI-ARIA: progressbar role](https://www.w3.org/TR/wai-aria-1.2/#progressbar)).
- **A name, always.** A bar without a label says that something is happening, not what. The
  label is associated with the bar like a form label
  ([MDN: progress, labeling](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/progress#labeling)).
- **The indicator is a graphical object.** It needs 3:1 against the track it fills, which the
  brand fill keeps in both modes; the track itself needs no contrast with the page
  ([WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html#graphical-objects)).
  Label and value are text and need 4.5:1
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)).
  Progress is shown by length and, when asked, by the value in text, never by color alone
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).
- **Motion.** The indeterminate segment moves for as long as the task runs. WCAG's own example
  of an acceptable moving indicator is a preloader shown while nothing else is usable; when the
  page is usable meanwhile, prefer a determinate bar. The movement stops when people ask for
  less motion ([WCAG 2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html),
  [WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).
- **Completion is a status message.** When the task ends, the page says so in a live region;
  the bar announces its name and value when people reach it
  ([WCAG 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)).

### Web

- The implementation renders a `<progress>` with `value` and `max`, named by a `<label for>`
  (a progress element is labelable); without `value` it is indeterminate
  ([HTML: the progress element](https://html.spec.whatwg.org/multipage/form-elements.html#the-progress-element),
  [ARIA in HTML: progress](https://www.w3.org/TR/html-aria/#el-progress),
  [HTML-AAM: progress](https://www.w3.org/TR/html-aam-1.0/#el-progress)).
- The indeterminate look is the native one (`:indeterminate`); the forced state draws the same
  segment. The animation stops under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
  ([MDN: :indeterminate](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:indeterminate)).
- The sweep lasts six times the normal motion duration: the additions have no long duration
  token yet, so the factor is written in the CSS (an open decision).

### iOS

- Use a determinate indicator for a task with a well-defined duration and an indeterminate one
  for unquantifiable tasks; when possible, use a determinate indicator. Reduce automatic
  animations when Reduce Motion is on
  ([Apple HIG: Progress indicators, best practices](https://developer.apple.com/design/human-interface-guidelines/progress-indicators#Best-practices),
  [Apple HIG: Accessibility, cognitive](https://developer.apple.com/design/human-interface-guidelines/accessibility#Cognitive)).

### Android

- Expose the progress with the progress tracking semantics so the current value is read out
  ([Jetpack Compose: progress tracking](https://developer.android.com/develop/ui/compose/accessibility/semantics#progress-tracking)).

## Related

- Alert (the message that reports completion or failure)
