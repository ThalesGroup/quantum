/**
 * Number field (packages/components/src/components/number-field/number-field.css): the text
 * field's stack (src/blueprints/text-field.mjs), FIELD_WIDTH px wide where the web stretches,
 * with the `Content` axis for the value and the placeholder.
 *
 * Not drawn: the browser's spin buttons, which keep their native look on the web (no token), and
 * the tabular figures of the value (font-variant-numeric, not a token).
 */
import { CONTENT, LEADING_ICON, TRANSITION, LINE_FLOOR, ICON_AXES, container, content, description, message, labelRow, LONG_LABEL_NOTE, MARKED_FIELDS, ASTERISK, withLeadingIcon, withSeverityIcon, SEVERITY_ICON_AXES } from './text-field.mjs';

export default {
  axes: [CONTENT, LEADING_ICON],
  fixed: MARKED_FIELDS,
  booleans: { Mark: true, 'Show description': false },
  note: LONG_LABEL_NOTE,
  root: container([labelRow, withSeverityIcon(withLeadingIcon(content({ value: '0' }), 'euro')), description, message]),
  notDrawn: [TRANSITION, SEVERITY_ICON_AXES, ICON_AXES, ASTERISK, LINE_FLOOR],
};
