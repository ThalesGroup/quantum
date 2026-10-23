/**
 * Text field (packages/components/src/components/text-field/text-field.css): a vertical auto layout
 * stacking the label, the control, the description and the error message, separated by the
 * container gap. The control is a horizontal auto layout (border, background, min height, inline
 * padding, no block padding) holding its text vertically centered. The web field stretches to its
 * container: here the component is FIELD_WIDTH px wide and every part fills it.
 *
 * The `Content` axis draws the control's text as a value or as the placeholder (its own color).
 * The description is a boolean property (off, as in the template); the error message is drawn in
 * the invalid state only, as the template shows it.
 *
 * The other field blueprints (textarea, number-field, search-field, select) build on the helpers
 * exported here.
 */
export const FIELD_WIDTH = 240;

export const CONTENT = { name: 'Content', values: ['value', 'placeholder'] };

export const label = {
  type: 'text',
  name: 'label',
  text: 'Label',
  property: 'Label',
  width: 'FILL',
  bind: { fill: 'label.color', typography: 'label.typography' },
};

export const description = {
  type: 'text',
  name: 'description',
  text: 'Description',
  property: 'Description',
  width: 'FILL',
  visibleProperty: 'Show description',
  bind: { fill: 'description.color', typography: 'description.typography' },
};

export const errorMessage = {
  type: 'text',
  name: 'error-message',
  when: (v) => v.state === 'invalid',
  text: 'Error message',
  property: 'Error message',
  width: 'FILL',
  bind: { fill: 'error-message.color', typography: 'error-message.typography' },
};

/** The control's text: the value, or the placeholder in its own color (`Content` axis). */
export const content = ({ value = 'Value', placeholder = 'Placeholder' } = {}) => [
  {
    type: 'text',
    name: 'value',
    when: (v) => v.axes[CONTENT.name] === 'value',
    text: value,
    property: 'Value',
    width: 'FILL',
    bind: { fill: 'control.color', typography: 'control.typography' },
  },
  {
    type: 'text',
    name: 'placeholder',
    when: (v) => v.axes[CONTENT.name] === 'placeholder',
    text: placeholder,
    property: 'Placeholder',
    width: 'FILL',
    bind: { fill: 'control.placeholder-color', typography: 'control.typography' },
  },
];

/** The editable box: its border, background, min height and inline padding, the focus ring outside it. */
export const control = ({ children, bind = {}, counter = 'CENTER' }) => ({
  type: 'frame',
  name: 'control',
  layout: 'HORIZONTAL',
  align: { primary: 'MIN', counter },
  width: 'FILL',
  focusRing: 'control',
  bind: {
    fill: 'control.background',
    stroke: 'control.border-color',
    strokeWeight: 'control.border-width',
    radius: 'control.border-radius',
    minHeight: 'control.min-height',
    paddingX: 'control.padding-inline',
    ...bind,
  },
  children,
});

/** The root: label, control (or field), description, error message, stacked. */
export const container = (children) => ({
  type: 'frame',
  name: 'container',
  layout: 'VERTICAL',
  width: FIELD_WIDTH,
  bind: { gap: 'container.gap' },
  children: children.filter(Boolean),
});

export const TRANSITION = { slot: 'control.transition', reason: 'Figma variables have no duration or easing.' };

export default {
  axes: [CONTENT],
  booleans: { 'Show description': false },
  root: container([label, control({ children: content() }), description, errorMessage]),
  notDrawn: [TRANSITION],
};
