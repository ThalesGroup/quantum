/**
 * Text field (packages/components/src/components/text-field/text-field.css): a vertical auto layout
 * stacking the label, the control, the description and the message, separated by the
 * container gap. The control is a horizontal auto layout (border, background, min height, inline
 * padding, no block padding) holding its text vertically centered. The web field stretches to its
 * container: here the component is FIELD_WIDTH px wide and every part fills it.
 *
 * The `Content` axis draws the control's text as a value or as the placeholder (its own color).
 * The description is a boolean property (off, as in the template); the message is drawn in
 * the error, warning and success states only, as the template shows it with a severity. The
 * severity icon (error only for now) sits after the control, in `control-row`, or at the start of
 * the message, by the `severityIcon` variant; the web lays the control and the icon out on a grid
 * row without a wrapper.
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

export const SEVERITIES = ['error', 'warning', 'success'];

/** The severity icon: drawn for the error only (warning and success with #103 step 13), after the control or at the start of the message (`severityIcon`). */
const severityIcon = (place) => ({
  type: 'icon',
  name: 'severity-icon',
  glyph: 'error',
  when: (v) => v.state === 'error' && v.props.severityIcon === place,
  bind: { fill: 'severity-icon.color', size: 'severity-icon.size', fontFamily: 'severity-icon.font-family', fontWeight: 'severity-icon.font-weight' },
});

/** The message: its text, after the severity icon when the form places it there. */
export const message = {
  type: 'frame',
  name: 'message',
  layout: 'HORIZONTAL',
  align: { primary: 'MIN', counter: 'MIN' },
  when: (v) => SEVERITIES.includes(v.state),
  width: 'FILL',
  bind: { gap: (v) => (v.props.severityIcon === 'message' ? 'severity-icon.gap' : null) },
  children: [
    severityIcon('message'),
    {
      type: 'text',
      name: 'message-text',
      text: 'Message',
      property: 'Message',
      width: 'FILL',
      bind: { fill: 'message.color', typography: 'message.typography' },
    },
  ],
};

/** The control and, when the form places it there, the severity icon after it (the web lays them out on a grid row). */
export const withSeverityIcon = (controlNode, counter = 'CENTER') => ({
  type: 'frame',
  name: 'control-row',
  layout: 'HORIZONTAL',
  align: { primary: 'MIN', counter },
  width: 'FILL',
  bind: { gap: (v) => (v.props.severityIcon === 'after-control' ? 'severity-icon.gap' : null) },
  children: [controlNode, severityIcon('after-control')],
});

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

/** The editable box: its border, background, min height and inline padding, the focus outline over it (flush, drawn from its outline slots). */
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

/** The root: label, control (or field), description, message, stacked. */
export const container = (children) => ({
  type: 'frame',
  name: 'container',
  layout: 'VERTICAL',
  width: FIELD_WIDTH,
  bind: { gap: 'container.gap' },
  children: children.filter(Boolean),
});

export const TRANSITION = { slot: 'control.transition', reason: 'Figma variables have no duration or easing.' };

// upstream(figma): no variable binds a font's variation axes (fill, grade, optical size).
export const SEVERITY_ICON_AXES = { slot: 'severity-icon.fill, severity-icon.grade, severity-icon.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' };

export default {
  axes: [CONTENT],
  booleans: { 'Show description': false },
  root: container([label, withSeverityIcon(control({ children: content() })), description, message]),
  notDrawn: [TRANSITION, SEVERITY_ICON_AXES],
};
