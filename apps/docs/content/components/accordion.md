---
component: accordion
title: Accordion
summary: A stack of sections whose content shows and hides under a header people activate.
order: 24
---

## Overview

An accordion stacks sections behind headers: activating a header shows its section, activating
it again hides it. It saves vertical space when people need one or two sections at a time:
settings groups, frequently asked questions, order details. Several sections may be open at
once; the component never closes one when another opens, because that needs script and the
reference implementation ships none. One section alone is an accordion with a single item.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Long pages whose sections people consult selectively (FAQ, policies, order details).
- Settings grouped by topic, when the groups would be too long to show at once.

## When not to use

- **Content people must read in full.** Show it; do not make them open every section.
- **Switching between views of the same thing.** That is a tab set, not in the system yet.
- **A menu of actions.** Use a Dropdown.

## Sizes

| Size | Use for |
| --- | --- |
| Small | Dense panels: 40 px triggers with 14 px text and a 20 px chevron. |
| Medium | Pages, the default: 48 px triggers with 16 px text and a 24 px chevron. |

## States

States belong to the items.

| State | How it happens | What changes |
| --- | --- | --- |
| Default | Collapsed. | The trigger alone, chevron pointing down. |
| Hover | A pointer rests over the trigger. Needs a pointing device: there is no hover on touch. | The trigger takes a light tint. |
| Active | Pressed down. | The next tint. |
| Focus visible | Keyboard focus on the trigger. | The shared focus ring appears around it. Pointer focus shows no ring. |
| Expanded | The item's `open` property, or activation. | The panel appears under the trigger and the chevron turns. |

## Content

- Titles are short noun phrases that let people decide whether to open the section:
  **Shipping and returns**, **Payment methods**.
- Open at first only the section people most likely need.

## Accessibility

The Specification tab lists the full accessibility contract, grouped into what holds on every
platform and what is specific to one. Each statement there links the source it comes from.
This section explains the decisions behind it.

- **A disclosure per section.** Each header is a control that shows and hides its section and
  exposes whether it is expanded; that is the accordion pattern, section by section
  ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html),
  [APG Accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/)).
- **No heading in the trigger.** The APG pattern wraps each button in a heading; the native
  disclosure cannot, because a button's descendants are presentational and a heading inside
  it would be lost. So the title is plain text and the accordion sits under a heading of the
  page; people navigating by heading find the accordion, not each section
  ([WAI-ARIA: button role, children presentational](https://www.w3.org/TR/wai-aria-1.2/#button),
  [WAI-ARIA: presentational children](https://www.w3.org/TR/wai-aria-1.2/#childrenArePresentational)).
  This trade-off is an open question of the study.
- **Order.** The content of an expanded section follows its trigger in the reading and focus
  order ([WCAG 2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html),
  [WCAG 1.3.2 Meaningful Sequence](https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html)).
- **Keyboard and focus.** Enter and Space toggle the focused section; Tab moves through the
  triggers and the open content; keyboard focus shows the shared ring
  ([WCAG 2.1.1 Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html),
  [APG keyboard interaction](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/#keyboardinteraction),
  [WCAG 2.4.7 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html),
  [WCAG 2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html)).
- **Contrast, color and target.** Title and content are text; the chevron direction and the
  shown content say the state, not color; triggers are 40 or 48 px high
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
  [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
  [WCAG 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)).
- **Motion.** The chevron rotation and the tint transition are dropped under reduced motion
  ([WCAG 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).

### Web

- Each item is a `<details>` with a `<summary>` as its trigger: the browser toggles it, keeps
  the hidden content out of the tab order, and exposes the expanded state from the `open`
  attribute. The summary has no WAI-ARIA role of its own; user agents expose it as a
  button-like disclosure control, which is what the pattern needs
  ([HTML: the details element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element),
  [HTML: the summary element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-summary-element),
  [ARIA in HTML: summary](https://www.w3.org/TR/html-aria/#el-summary),
  [HTML-AAM: summary](https://www.w3.org/TR/html-aam-1.0/#el-summary),
  [HTML-AAM: the details open attribute](https://www.w3.org/TR/html-aam-1.0/#att-open-details),
  [MDN: summary](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/summary)).
- The focus ring uses `:focus-visible`
  ([MDN: :focus-visible](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible));
  transitions are switched off under
  [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

### iOS

- Disclosure controls reveal and hide information and functionality related to specific
  controls or views: the counterpart of an accordion section
  ([Apple HIG: Disclosure controls](https://developer.apple.com/design/human-interface-guidelines/disclosure-controls)).

## Related

- Dropdown (a menu of actions behind a button)
- Card (a group of content that is always shown)
