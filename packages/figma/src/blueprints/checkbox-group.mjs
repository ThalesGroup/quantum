/**
 * Checkbox group (packages/components/src/components/checkbox-group/checkbox-group.css): a
 * vertical auto layout (the fieldset) stacking the legend, the description, the `options` and the
 * error message, separated by container.row-gap as the spec's layout notes say. `options` (the
 * web's list) stacks three options vertically, or lines them up in the horizontal orientation,
 * separated by container.gap; the web wraps them when they do not fit, Figma's auto layout here
 * does not. The group hugs its content.
 *
 * Each option is the Checkbox's two rows (src/blueprints/checkbox.mjs): its box, label and
 * description. A forced state applies, as on the web, to the whole group when it is group-wide
 * (invalid, disabled) and to the first option only otherwise (hover, focus, checked): the others
 * stay at rest. The description and the options' descriptions are boolean properties (off, as in
 * the template); the error message is drawn in the invalid state only.
 */
import { TRANSITION, checkboxControl, optionRows } from './checkbox.mjs';

/** States that the web forces on the whole group; the others apply to one option. */
const GROUP_WIDE = new Set(['invalid', 'disabled']);

const option = (control) => (n) =>
  optionRows({
    control,
    parts: { label: 'option-label', description: 'option-description' },
    gaps: { row: 'option.row-gap', column: 'option.column-gap' },
    texts: {
      label: `Option ${n}`,
      labelProperty: `Option ${n} label`,
      description: 'Description',
      descriptionProperty: `Option ${n} description`,
      descriptionVisible: 'Show option descriptions',
    },
    extra: {
      name: 'option',
      ...(n > 1 ? { context: (v) => ({ state: GROUP_WIDE.has(v.state) ? v.state : 'default' }) } : {}),
    },
  });

const options = (control, orientation, layout) => ({
  type: 'frame',
  name: 'options',
  when: (v) => v.props.orientation === orientation,
  layout,
  bind: { gap: 'container.gap' },
  children: [1, 2, 3].map(option(control)),
});

/** A group of options drawn with `control`: the Checkbox group's, and the Radio group's. */
export const group = (control) => ({
  booleans: { 'Show description': false, 'Show option descriptions': false },
  root: {
    type: 'frame',
    name: 'container',
    layout: 'VERTICAL',
    bind: { gap: 'container.row-gap' },
    children: [
      {
        type: 'text',
        name: 'legend',
        text: 'Options',
        property: 'Legend',
        bind: { fill: 'legend.color', typography: 'legend.typography' },
      },
      {
        type: 'text',
        name: 'description',
        text: 'Description',
        property: 'Description',
        visibleProperty: 'Show description',
        bind: { fill: 'description.color', typography: 'description.typography' },
      },
      options(control, 'vertical', 'VERTICAL'),
      options(control, 'horizontal', 'HORIZONTAL'),
      {
        type: 'text',
        name: 'error-message',
        when: (v) => v.state === 'invalid',
        text: 'Error message',
        property: 'Error message',
        bind: { fill: 'error-message.color', typography: 'error-message.typography' },
      },
    ],
  },
  notDrawn: [TRANSITION],
});

export default group(checkboxControl);
