/**
 * Radio group (packages/components/src/components/radio-group/radio-group.css): the Checkbox
 * group's tree (src/blueprints/checkbox-group.mjs): legend, description, three options
 * stacked or in a row, error message; a forced state on the first option only, except invalid and
 * disabled, which apply to the whole group.
 *
 * The control is the Checkbox's box with the round radius (control.border-radius), and its dot,
 * 0.4 x the control size in control.color, an ellipse centered in it in the checked state.
 */
import { box } from './checkbox.mjs';
import { group } from './checkbox-group.mjs';

const dot = {
  type: 'ellipse',
  name: 'dot',
  when: (v) => v.state === 'checked',
  absolute: { x: 'center', y: 'center' },
  derive: { size: ['control.size', 0.4] },
  bind: { fill: 'control.color' },
};

export default group(box([dot]));
