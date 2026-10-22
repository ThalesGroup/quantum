---
component: avatar
title: Avatar
summary: Represents a person or an entity with a picture, or their initials when there is none.
order: 29
---

## Overview

An avatar shows who or what something belongs to: the author of a comment, the members of a
project, a workspace. It displays a picture when there is one and the initials of the name
otherwise, in a circle for people or a rounded square for entities. Assistive technology reads
it as an image named by the person, unless the name is written right next to it, in which
case the avatar is decoration.

This page applies to every platform. Where a platform differs, the difference sits under a
sub-heading named after it (Web, iOS, Android, Desktop); everything else holds everywhere.

## When to use

- Identifying the author or owner of something: comments, assignments, activity.
- Representing a member, a team or a workspace in lists and headers.

## When not to use

- **Illustration or product images.** An avatar is an identity, not a picture.
- **Status alone.** A presence dot or a badge is another part, not specified here.

## Sizes and shapes

| Size | Use for |
| --- | --- |
| Small | Lists and comments: 24 px. |
| Medium | Most places, the default: 32 px. |
| Large | Profile headers and cards: 40 px. |

Circle for people, square for entities (teams, organizations, bots).

## Name and picture

The name is the full name as the person wrote it; it is the accessible name of the avatar and
the source of the initials (first letters of the first and last words). The picture, when
given, covers the whole shape. When the name is written next to the avatar, mark the avatar
decorative so the name is not read twice.

## Accessibility

The Specification tab lists the full accessibility contract. Each statement there links the
source it comes from. This section explains the decisions behind it.

- **One image, named by the person.** An avatar is non-text content that identifies someone;
  its text alternative is the full name, whether it shows a picture or initials. Initials
  alone are never the name
  ([WCAG 1.1.1 Non-text Content](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html),
  [WCAG 1.3.1 Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html),
  [WAI tutorial: Informative images](https://www.w3.org/WAI/tutorials/images/informative/),
  [WAI-ARIA: img role](https://www.w3.org/TR/wai-aria-1.2/#img)).
- **Decorative next to the name.** When the name is visible beside the avatar, the avatar is
  decoration and is hidden, so screen readers do not read the name twice
  ([WAI tutorial: Decorative images](https://www.w3.org/WAI/tutorials/images/decorative/),
  [WAI-ARIA: aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)).
- **Contrast and color.** Initials contrast with the brand tint behind them; the tint is the
  same for everyone, so nothing is conveyed by color
  ([WCAG 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [WCAG 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html),
  [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)).

### Web

- The implementation renders a `<span role="img" aria-label="Full name">`; the picture inside
  is an `<img alt="">` (the span already carries the name) and the initials carry
  `aria-hidden="true"`; a decorative avatar is a span with `aria-hidden="true"` and no role
  ([MDN: img role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/img_role),
  [ARIA in HTML: img](https://www.w3.org/TR/html-aria/#el-img),
  [ARIA in HTML: img with an empty alt](https://www.w3.org/TR/html-aria/#el-img-empty-alt),
  [HTML-AAM: img](https://www.w3.org/TR/html-aam-1.0/#el-img),
  [HTML: text alternatives for images](https://html.spec.whatwg.org/multipage/images.html#alt),
  [H37](https://www.w3.org/WAI/WCAG22/Techniques/html/H37),
  [H67](https://www.w3.org/WAI/WCAG22/Techniques/html/H67),
  [WAI-ARIA: aria-label](https://www.w3.org/TR/wai-aria-1.2/#aria-label)).

### iOS

- Provide alternative text labels for custom interface images so VoiceOver can describe them
  ([Apple HIG: Icons](https://developer.apple.com/design/human-interface-guidelines/icons)).

### Android

- Give the avatar the name as its content description, or `null` when the name is written next
  to it ([Android accessibility: describe each UI element](https://developer.android.com/guide/topics/ui/accessibility/apps#describe-ui-element),
  [Jetpack Compose: graphic elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults#graphic-elements)).

## Related

- Icon (a glyph, named or decorative)
- Badge (a status next to an item)
