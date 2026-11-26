/**
 * Text field (packages/components/src/components/text-field/text-field.css): a vertical auto layout
 * stacking the label, the control, the description and the message, separated by the
 * container gap. The control is a horizontal auto layout (border, background, min height, inline
 * padding, a minimum block padding) holding its text vertically centered. The web field stretches to its
 * container: here the component is FIELD_WIDTH px wide and every part fills it.
 *
 * The `Content` axis draws the control's text as a value or as the placeholder (its own color).
 * The description is a boolean property (off, as in the template); the message is drawn
 * whenever the variant has a severity, as the template shows it. The severity is the `Severity`
 * axis only: the engine leaves out of State the states an enum axis sets, so State is default,
 * hover, focus-visible, read-only or disabled, crossed with every severity (`severityOf` still
 * reads a severity State, for a blueprint that fixes `severity`). The
 * severity icon (the Alert's glyph of each severity) sits after the control, in `control-row`, or at the start of
 * the message, by the `severityIcon` variant; the web lays the control and the icon out on a grid
 * row without a wrapper.
 *
 * The required mark (markedFields) is not a variant axis (decision mark-part): the form sets it once, so the
 * component draws the web's default, "(optional)" after the label, which the BOOLEAN `Mark` hides and whose
 * TEXT `Mark text` a designer types "(required)" in a form that marks required fields. The word space before
 * it is a quarter of its font size, as the web measures it. The asterisk of Android and Windows is not drawn:
 * the component draws the web specification.
 *
 * The `Leading icon` axis (iconStart) wraps the control in a `field` frame with the decorative glyph over
 * its start edge, the control reserving control.padding-inline-start, as the Search field's.
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

/** The required mark (decisions mark-style, mark-part): "(optional)" by default, shown by the BOOLEAN `Mark`. */
export const mark = {
  type: 'text',
  name: 'mark',
  text: '(optional)',
  property: 'Mark text',
  visibleProperty: 'Mark',
  bind: { fill: 'mark.color', typography: 'mark.typography' },
};

/** The label and, after a word space (a quarter of the mark's font size), the required mark. */
export const labelRow = {
  type: 'frame',
  name: 'label-row',
  layout: 'HORIZONTAL',
  align: { primary: 'MIN', counter: 'MIN' },
  width: 'FILL',
  derive: { gap: ['mark.typography', 0.25] },
  children: [{ ...label, width: 'HUG' }, mark],
};

/** The form setting markedFields, drawn by `Mark` and `Mark text` instead of a variant axis (decision mark-part). */
export const MARKED_FIELDS = { markedFields: 'optional' };

/** The asterisk is Android's and Windows' (decision asterisk-style): the component draws the web specification. */
export const ASTERISK = { slot: 'asterisk', reason: 'Drawn on Android and Windows only (decision asterisk-style); the Figma component draws the web specification (decision mark-part).' };

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

/**
 * The severity a variant shows, from its State or its `severity` property: when both name one, the
 * later declared wins (success, then warning, then error), as `effectiveStates` makes the tokens do,
 * so the message and the icon always match the fill, the border and the outline.
 */
export const severityOf = (v) => [...SEVERITIES].reverse().find((s) => v.state === s || v.props?.severity === s) ?? null;

/** The glyph of each severity's icon, the template's (decision severity-icon-glyphs). */
export const SEVERITY_GLYPHS = { error: 'error', warning: 'warning', success: 'check_circle' };

/** Whether a variant draws the severity icon at `place` (`severityIcon`: after-control or message). */
const iconAt = (place) => (v) => severityOf(v) !== null && v.props.severityIcon === place;

/** The severity icon of every severity, after the control or at the start of the message (`severityIcon`). */
const severityIcon = (place) => ({
  type: 'icon',
  name: 'severity-icon',
  glyph: (v) => SEVERITY_GLYPHS[severityOf(v)],
  when: iconAt(place),
  bind: { fill: 'severity-icon.color', size: 'severity-icon.size', fontFamily: 'severity-icon.font-family', fontWeight: 'severity-icon.font-weight' },
});

/**
 * The icon at the start of the message, centered on the message's first line: a frame as tall as that
 * line (font size x line height, computed from message.typography: no variable holds the product), as the
 * web makes the icon's box `calc(font-size * line-height)` tall and centers the glyph in it.
 */
const messageIcon = {
  type: 'frame',
  name: 'severity-icon-line',
  layout: 'HORIZONTAL',
  align: { primary: 'CENTER', counter: 'CENTER' },
  when: iconAt('message'),
  derive: { height: ['message.typography', 1, 'line'] },
  children: [severityIcon('message')],
};

/** The message: its text, after the severity icon when the form places it there. */
export const message = {
  type: 'frame',
  name: 'message',
  layout: 'HORIZONTAL',
  align: { primary: 'MIN', counter: 'MIN' },
  when: (v) => severityOf(v) !== null,
  width: 'FILL',
  bind: { gap: (v) => (v.props.severityIcon === 'message' ? 'severity-icon.gap' : null) },
  children: [
    messageIcon,
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

/**
 * The control and, when the form places it there, the severity icon after it (the web lays them out on a grid
 * row). With `firstLine` (the Textarea), the row aligns at the top and the icon sits in a frame whose top
 * padding is control.padding-block, level with the control's first line, as the web's
 * `margin-block-start: var(--_padding-block)`.
 */
export const withSeverityIcon = (controlNode, { counter = 'CENTER', firstLine = false } = {}) => ({
  type: 'frame',
  name: 'control-row',
  layout: 'HORIZONTAL',
  align: { primary: 'MIN', counter: firstLine ? 'MIN' : counter },
  width: 'FILL',
  bind: { gap: (v) => (v.props.severityIcon === 'after-control' ? 'severity-icon.gap' : null) },
  children: [
    ...[].concat(controlNode),
    firstLine
      ? {
          type: 'frame',
          name: 'severity-icon-inset',
          layout: 'HORIZONTAL',
          align: { primary: 'MIN', counter: 'MIN' },
          when: iconAt('after-control'),
          bind: { paddingTop: 'control.padding-block' },
          children: [severityIcon('after-control')],
        }
      : severityIcon('after-control'),
  ],
});

/** The `Leading icon` axis: a variant axis, as the Button's, because the control's start padding depends on it. */
export const LEADING_ICON = { name: 'Leading icon', values: [false, true] };

/**
 * The leading icon (iconStart, decorative): a frame positioned absolutely at the field's start edge and
 * vertically centered, whose left padding is icon.margin-inline, holding the glyph. The glyph follows the
 * text beside it: icon.color next to a value, icon.placeholder-color next to the placeholder.
 */
export const leadingIcon = (glyph, property = null) => ({
  type: 'frame',
  name: 'icon-inset',
  layout: 'HORIZONTAL',
  align: { primary: 'MIN', counter: 'CENTER' },
  absolute: { x: 0, y: 'center' },
  bind: { paddingLeft: 'icon.margin-inline' },
  children: [
    {
      type: 'icon',
      name: 'icon',
      glyph,
      ...(property ? { property } : {}),
      bind: { fill: (v) => (v.axes[CONTENT.name] === 'value' ? 'icon.color' : 'icon.placeholder-color'), size: 'icon.size', fontFamily: 'icon.font-family', fontWeight: 'icon.font-weight' },
    },
  ],
});

/** The field box: the control, reserving control.padding-inline-start, and the leading icon over its start edge. */
export const field = (children, glyph, property = null) => ({
  type: 'frame',
  name: 'field',
  layout: 'HORIZONTAL',
  width: 'FILL',
  children: [
    control({ bind: { paddingX: null, paddingLeft: 'control.padding-inline-start', paddingRight: 'control.padding-inline' }, children }),
    leadingIcon(glyph, property),
  ],
});

/** The control, or the field box when the `Leading icon` axis is on. */
export const withLeadingIcon = (children, glyph = 'sell') => [
  { ...control({ children }), when: (v) => !v.axes[LEADING_ICON.name] },
  { ...field(children, glyph, 'Leading icon glyph'), when: (v) => v.axes[LEADING_ICON.name] },
];

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

/** The editable box: its border, background, min height, inline padding and minimum block padding (decision grows-with-text-size), the focus outline over it (flush, drawn from its outline slots). */
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
    paddingY: 'control.padding-block',
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

/** The web input's shortest line (decision value-line-not-clipped): Figma never clips a text layer, so its value keeps the 1.2 line of control.typography. */
export const LINE_FLOOR = { slot: 'control.line-height', reason: 'Web only: Chromium and WebKit clip an input\'s text to its line box; a Figma text layer is never clipped, so the value keeps its 1.2 line (decision value-line-not-clipped).' };

// upstream(figma): no variable binds a font's variation axes (fill, grade, optical size).
export const SEVERITY_ICON_AXES = { slot: 'severity-icon.fill, severity-icon.grade, severity-icon.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' };

// upstream(figma): no variable binds a font's variation axes (fill, grade, optical size).
export const ICON_AXES = { slot: 'icon.fill, icon.grade, icon.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' };

export default {
  axes: [CONTENT, LEADING_ICON],
  fixed: MARKED_FIELDS,
  booleans: { Mark: true, 'Show description': false },
  root: container([labelRow, withSeverityIcon(withLeadingIcon(content(), 'mail')), description, message]),
  notDrawn: [TRANSITION, SEVERITY_ICON_AXES, ICON_AXES, ASTERISK, LINE_FLOOR],
};
