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
 *
 * The severity icon after the control sits level with the control's first line, below
 * control.padding-block (`withSeverityIcon`'s `firstLine`), as the web's `align-self: start` and
 * `margin-block-start`, not centered on the box. As in the Text field, a focused read-only Textarea
 * is not drawn (State takes one value at a time, #103 step 23, Q3: a designer overrides the fill on a
 * `focus-visible` variant), nor is the hit region of iOS and Android (decision touch-target-hit-region).
 */
import { CONTENT, TRANSITION, container, content, control, description, message, labelRow, LONG_LABEL_NOTE, MARKED_FIELDS, ASTERISK, withSeverityIcon, SEVERITY_ICON_AXES } from './text-field.mjs';

export default {
  axes: [CONTENT],
  fixed: MARKED_FIELDS,
  booleans: { Mark: true, 'Show description': false },
  note: LONG_LABEL_NOTE,
  root: container([
    labelRow,
    withSeverityIcon(control({
      counter: 'MIN',
      bind: { paddingY: 'control.padding-block' },
      children: content({ value: 'Value\n\n', placeholder: 'Placeholder\n\n' }),
    }), { firstLine: true }),
    description,
    message,
  ]),
  notDrawn: [TRANSITION, SEVERITY_ICON_AXES, ASTERISK],
};
