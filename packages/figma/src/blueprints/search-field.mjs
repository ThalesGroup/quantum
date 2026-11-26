/**
 * Search field (packages/components/src/components/search-field/search-field.css): the text
 * field's stack (src/blueprints/text-field.mjs), FIELD_WIDTH px wide where the web stretches,
 * without a message (no severity). Its required mark is hidden by default: a search field stands alone
 * (markedFields none).
 *
 * The `field` wraps the control and the search glyph, which the web positions over the start edge
 * of the control (inset by icon.margin-inline) while the control reserves room for it with
 * padding-inline-start. Here the glyph sits in `icon-inset`, a frame positioned absolutely at the
 * field's start edge and vertically centered, whose left padding is icon.margin-inline.
 */
import { CONTENT, TRANSITION, LINE_FLOOR, ICON_AXES, ASTERISK, container, content, description, field, labelRow, LONG_LABEL_NOTE } from './text-field.mjs';

export default {
  axes: [CONTENT],
  fixed: { markedFields: 'none' },
  booleans: { Mark: false, 'Show description': false },
  note: LONG_LABEL_NOTE,
  root: container([
    labelRow,
    field(content(), 'search'),
    description,
  ]),
  notDrawn: [
    TRANSITION,
    ICON_AXES,
    ASTERISK,
    LINE_FLOOR,
  ],
};
