---
component: alert
title: Alert
summary: A brief, important message that draws attention without interrupting the task.
order: 17
---

## Overview

An alert tells people something important about the page or about what they just did: a
change was saved, a payment failed, maintenance is coming, a quota is almost reached. It sits
in the content, tinted by its intent, with an icon and a title, and assistive technology
announces it when it appears. It never moves focus and never blocks the page.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Feedback after an action, shown in the page (Changes saved, Payment failed).
- Information about the page or the account that people should notice (a maintenance window,
  a quota).
- A summary of the errors of a form, above the form, with the fields named.

## When not to use

- **A decision is needed before continuing.** Use a dialog: an alert never blocks.
- **A short confirmation that can disappear by itself.** Use a toast.
- **A status of one item.** Use a Badge.
- **An explanation of a field.** Use the field's description.

## Intent

| Intent | Use for |
| --- | --- |
| Info | Neutral information worth noticing. The default. |
| Success | Something completed as expected. |
| Warning | Something needs attention before it becomes a problem. |
| Error | Something failed or is blocked, with what to do about it. |

Each intent has a fixed icon (info, check circle, warning, error) that cannot be changed: the
icon and the title say the kind of message as well as the tint.

## Title and message

The title states the point in a few words (**Payment failed**); it is the first thing announced.
The message says what happened and what to do, in one or two plain sentences. A one-sentence
message can stand without a title.

The alert has no close button and no actions in this version: dismissing needs script, and an
action inside a live region is read before people can reach it. Both are open questions.

## Content

- Title: a few words, sentence case, no period. Message: one or two sentences, with a period.
- Say the status in words, never through the color: **Your card was declined**, not
  **Something went wrong**.
- With the error intent, say how to recover.

## Accessibility

The Specification tab lists the full accessibility contract. Each statement there links the
source it comes from. This section explains the decisions behind it.

- **Announced, not focused.** An alert is a status message: assistive technology announces its
  content when it appears, and focus stays where it was. Moving focus to it would interrupt the
  task it reports on
  ([WCAG 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html),
  [APG Alert pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/),
  [WAI-ARIA: alert role](https://www.w3.org/TR/wai-aria-1.2/#alert)).
  Content that is already in the page when it loads is not announced: insert the alert when the
  event happens.
- **Words carry the meaning.** The icon is decorative and hidden; the title and the message say
  what kind of message it is, so the tint is never the only signal
  ([WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
  [WCAG 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)).
- **Contrast.** Title and message are text on the tinted fill and need 4.5:1 in both modes; the
  icon needs 3:1. All pairs pass. The border is decoration (the warning border is 2.13:1 in
  light mode) ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)).
- **Form errors.** An alert summarising the errors of a form names the fields and what to do;
  the fields keep their own error messages
  ([WCAG 3.3.1 Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html),
  [WAI tutorial: User notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)).

### Web

- The implementation renders a `<div role="alert">`, an assertive and atomic live region, with
  the icon in `aria-hidden="true"`. Insert it, or set its content, at the moment of the event
  ([MDN: alert role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alert_role),
  [ARIA19](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA19),
  [WAI-ARIA: aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)).

### Android

- Mark alert-like components with the live region semantics so accessibility services announce
  them, and use the assertive mode sparingly
  ([Jetpack Compose: alerts and pop-ups](https://developer.android.com/develop/ui/compose/accessibility/semantics#alerts-pop-ups)).

## Related

- Badge (the status of one item)
