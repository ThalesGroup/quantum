/**
 * Textarea (packages/components/src/components/textarea/textarea.css): the text field's stack
 * (src/blueprints/text-field.mjs), FIELD_WIDTH px wide where the web stretches. The control
 * adds its block padding and holds its text at the top.
 *
 * The web control is as tall as its `rows` (3 by default): rows x the line height, plus the block
 * padding. No token holds that height and Figma cannot compute it from the typography variable,
 * so the default texts end with two empty lines: the text, set in the bound control typography,
 * is three lines tall in every size. Designers set the number of rows by the number of lines.
 * The vertical resize handle is not drawn.
 */
import { CONTENT, TRANSITION, container, content, control, description, errorMessage, label } from './text-field.mjs';

export default {
  axes: [CONTENT],
  booleans: { 'Show description': false },
  root: container([
    label,
    control({
      counter: 'MIN',
      bind: { paddingY: 'control.padding-block' },
      children: content({ value: 'Value\n\n', placeholder: 'Placeholder\n\n' }),
    }),
    description,
    errorMessage,
  ]),
  notDrawn: [TRANSITION],
};
