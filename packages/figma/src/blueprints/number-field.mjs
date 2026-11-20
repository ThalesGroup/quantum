/**
 * Number field (packages/components/src/components/number-field/number-field.css): the text
 * field's stack (src/blueprints/text-field.mjs), FIELD_WIDTH px wide where the web stretches,
 * with the `Content` axis for the value and the placeholder.
 *
 * Not drawn: the browser's spin buttons, which keep their native look on the web (no token), and
 * the tabular figures of the value (font-variant-numeric, not a token).
 */
import { CONTENT, LEADING_ICON, TRANSITION, ICON_AXES, container, content, description, message, label, withLeadingIcon, withSeverityIcon, SEVERITY_ICON_AXES } from './text-field.mjs';

export default {
  axes: [CONTENT, LEADING_ICON],
  booleans: { 'Show description': false },
  root: container([label, withSeverityIcon(withLeadingIcon(content({ value: '0' }), 'euro')), description, message]),
  notDrawn: [TRANSITION, SEVERITY_ICON_AXES, ICON_AXES],
};
