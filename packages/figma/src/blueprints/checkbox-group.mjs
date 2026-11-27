/**
 * Checkbox group (packages/components/src/components/checkbox-group/checkbox-group.css): a
 * vertical auto layout (the fieldset) stacking the `heading` (the legend with the description right
 * under it), the `options` and the message, separated by container.row-gap as the spec's layout
 * notes say. `options` (the
 * web's list) stacks three options vertically, or lines them up in the horizontal orientation,
 * separated by container.gap; the web wraps them when they do not fit, Figma's auto layout here
 * does not. The group hugs its content.
 *
 * Each option is the Checkbox's two rows (src/blueprints/checkbox.mjs): its box, label and
 * description. A forced state applies, as on the web, to the whole group when it is group-wide
 * (disabled) and to the first option only otherwise (hover, focus, checked): the others stay at
 * rest. The severity is the `Severity` axis, not a State value (the engine leaves out of State the
 * states an enum axis sets), so it reaches every option. The description and the options'
 * descriptions are boolean properties (off, as in the template); the legend ends with the required mark
 * (`legend-row`, the BOOLEAN `Mark` and TEXT `Mark text`, markedFields `fixed`, decision mark-part); the message is drawn with
 * Severity=error only, starting with the severity icon when `severityIcon` is message (the Text field's
 * `messageNode`, decision severity-icon).
 */
import { TRANSITION, checkboxControl, optionRows } from './checkbox.mjs';
import { messageNode, withMark, SEVERITY_ICON_AXES, ASTERISK, MARKED_FIELDS } from './text-field.mjs';

/** States that the web forces on the whole group; the others apply to one option. */
const GROUP_WIDE = new Set(['disabled']);

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
  fixed: MARKED_FIELDS,
  booleans: { Mark: true, 'Show description': false, 'Show option descriptions': false },
  root: {
    type: 'frame',
    name: 'container',
    layout: 'VERTICAL',
    bind: { gap: 'container.row-gap' },
    children: [
      {
        // The web's legend and description: the description sits right under the legend (no
        // gap), and container.row-gap separates the pair from the options (the legend's bottom
        // margin on the web when no description follows).
        type: 'frame',
        name: 'heading',
        layout: 'VERTICAL',
        children: [
          withMark({
            type: 'text',
            name: 'legend',
            text: 'Options',
            property: 'Legend',
            bind: { fill: 'legend.color', typography: 'legend.typography' },
          }, 'legend-row'),
          {
            type: 'text',
            name: 'description',
            text: 'Description',
            property: 'Description',
            visibleProperty: 'Show description',
            bind: { fill: 'description.color', typography: 'description.typography' },
          },
        ],
      },
      options(control, 'vertical', 'VERTICAL'),
      options(control, 'horizontal', 'HORIZONTAL'),
      messageNode({ fill: false }),
    ],
  },
  notDrawn: [TRANSITION, SEVERITY_ICON_AXES, ASTERISK],
});

export default group(checkboxControl);
