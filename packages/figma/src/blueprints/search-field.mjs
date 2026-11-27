/**
 * Search field (packages/components/src/components/search-field/search-field.css): the text
 * field's stack (src/blueprints/text-field.mjs), FIELD_WIDTH px wide where the web stretches, with the
 * Text field's severities: the Severity axis, the message and the severity icon after the field or at the
 * start of the message, by the `severityIcon` variant (decision text-field-severities). Its required mark
 * is hidden by default: a search field stands alone (markedFields none).
 *
 * The `field` wraps the control and the search glyph, which the web positions over the start edge
 * of the control (inset by icon.margin-inline) while the control reserves room for it with
 * padding-inline-start. Here the glyph sits in `icon-inset`, a frame positioned absolutely at the
 * field's start edge and vertically centered, whose left padding is icon.margin-inline.
 */
import { CONTENT, TRANSITION, LINE_FLOOR, ICON_AXES, SEVERITY_ICON_AXES, ASTERISK, LABEL_COLUMN, container, content, description, field, labelRow, message, withSeverityIcon, LONG_LABEL_NOTE } from './text-field.mjs';

export default {
  axes: [CONTENT],
  fixed: { markedFields: 'none', labelPlacement: 'above' },
  booleans: { Mark: false, 'Show description': false },
  note: LONG_LABEL_NOTE,
  root: container([
    labelRow,
    withSeverityIcon(field(content(), 'search')),
    description,
    message,
  ]),
  notDrawn: [
    LABEL_COLUMN,
    TRANSITION,
    SEVERITY_ICON_AXES,
    ICON_AXES,
    ASTERISK,
    LINE_FLOOR,
  ],
};
