/**
 * Number field (packages/components/src/components/number-field/number-field.css): the text
 * field's stack (src/blueprints/text-field.mjs), FIELD_WIDTH px wide where the web stretches,
 * with the `Content` axis for the value and the placeholder.
 *
 * Not drawn: the browser's spin buttons, which keep their native look on the web (no token), and
 * the tabular figures of the value (font-variant-numeric, not a token).
 */
import { CONTENT, TRANSITION, container, content, control, description, errorMessage, label } from './text-field.mjs';

export default {
  axes: [CONTENT],
  booleans: { 'Show description': false },
  root: container([label, control({ children: content({ value: '0' }) }), description, errorMessage]),
  notDrawn: [TRANSITION],
};
