/**
 * Checkbox (packages/components/src/components/checkbox/checkbox.css): the web grid (box | label,
 * description under the label) as a vertical auto layout of two rows separated by the row gap:
 * `row` (the box, then the label, vertically centered, column gap between) and `description-row`
 * (an empty `control-column` as wide as the box, then the description), so the description aligns
 * with the label as in the grid's second column.
 *
 * The web centers the box on the label's first line (a margin computed from the label's line
 * height and font size, which Figma cannot compute from the typography variable); here the row
 * centers it on the label, the same position while the label holds one line.
 *
 * The box is a frame without auto layout, sized by control.size; its mark is drawn from the
 * control size as the CSS draws it: the check (two borders 0.12 x size wide, rotated 45 degrees)
 * as a vector path through the center lines of those borders, the indeterminate bar (0.5 x size
 * wide) as a horizontal vector, both stroked in control.color, centered, in the states that show
 * them. The description is a boolean property (off, as in the template).
 *
 * The group blueprints (checkbox-group, radio-group) build on the helpers exported here.
 */

/** Center lines of the CSS check, in a 24 x 24 box the size of the control. */
const CHECK = 'M 5.806 11.663 L 9.879 15.736 L 18.194 7.42';
/** Center line of the CSS indeterminate bar. */
const BAR = 'M 6 12 L 18 12';

const mark = (name, path, state) => ({
  type: 'vector',
  name,
  when: (v) => v.state === state,
  path,
  absolute: { x: 'center', y: 'center' },
  derive: { size: ['control.size', 1], strokeWeight: ['control.size', 0.12] },
  bind: { stroke: 'control.color' },
});

/** The box: a fixed square with its border, background and radius, the focus ring outside it. */
export const box = (marks) => ({
  type: 'frame',
  name: 'control',
  focusRing: 'control',
  bind: {
    size: 'control.size',
    fill: 'control.background',
    stroke: 'control.border-color',
    strokeWeight: 'control.border-width',
    radius: 'control.border-radius',
  },
  children: marks,
});

export const checkboxControl = box([mark('check', CHECK, 'checked'), mark('bar', BAR, 'indeterminate')]);

/**
 * The control, its label and its description as two rows. `parts` names the label and
 * description parts, `gaps` the row and column gap slots, `texts` their default texts and
 * properties.
 */
export const optionRows = ({ control, parts, gaps, texts, extra = {} }) => ({
  type: 'frame',
  layout: 'VERTICAL',
  bind: { gap: gaps.row },
  ...extra,
  children: [
    {
      type: 'frame',
      name: 'row',
      layout: 'HORIZONTAL',
      align: { primary: 'MIN', counter: 'CENTER' },
      bind: { gap: gaps.column },
      children: [
        control,
        {
          type: 'text',
          name: parts.label,
          text: texts.label,
          property: texts.labelProperty,
          bind: { fill: `${parts.label}.color`, typography: `${parts.label}.typography` },
        },
      ],
    },
    {
      type: 'frame',
      name: 'description-row',
      layout: 'HORIZONTAL',
      visibleProperty: texts.descriptionVisible,
      bind: { gap: gaps.column },
      children: [
        { type: 'frame', name: 'control-column', height: 1, bind: { width: 'control.size' } },
        {
          type: 'text',
          name: parts.description,
          text: texts.description,
          property: texts.descriptionProperty,
          bind: { fill: `${parts.description}.color`, typography: `${parts.description}.typography` },
        },
      ],
    },
  ],
});

export const TRANSITION = { slot: 'control.transition', reason: 'Figma variables have no duration or easing.' };

export default {
  booleans: { 'Show description': false },
  root: optionRows({
    control: checkboxControl,
    parts: { label: 'label', description: 'description' },
    gaps: { row: 'container.row-gap', column: 'container.column-gap' },
    extra: { name: 'container' },
    texts: {
      label: 'Label',
      labelProperty: 'Label',
      description: 'Description',
      descriptionProperty: 'Description',
      descriptionVisible: 'Show description',
    },
  }),
  notDrawn: [TRANSITION],
};
