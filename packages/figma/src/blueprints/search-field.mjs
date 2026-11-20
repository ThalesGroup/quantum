/**
 * Search field (packages/components/src/components/search-field/search-field.css): the text
 * field's stack (src/blueprints/text-field.mjs), FIELD_WIDTH px wide where the web stretches,
 * without a message (no severity).
 *
 * The `field` wraps the control and the search glyph, which the web positions over the start edge
 * of the control (inset by icon.margin-inline) while the control reserves room for it with
 * padding-inline-start. Here the glyph sits in `icon-inset`, a frame positioned absolutely at the
 * field's start edge and vertically centered, whose left padding is icon.margin-inline.
 */
import { CONTENT, TRANSITION, ICON_AXES, container, content, description, field, label } from './text-field.mjs';

export default {
  axes: [CONTENT],
  booleans: { 'Show description': false },
  root: container([
    label,
    field(content(), 'search'),
    description,
  ]),
  notDrawn: [
    TRANSITION,
    ICON_AXES,
  ],
};
