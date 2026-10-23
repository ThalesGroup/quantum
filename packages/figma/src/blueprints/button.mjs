/**
 * Button (packages/components/src/components/button/button.css): a horizontal auto layout, the
 * label between an optional icon on each side. Each icon slot is a variant axis because the
 * padding of a side depends on whether it holds an icon (spec layout.notes); its glyph is a text
 * property. Icons inherit the label color.
 */
const LEADING = 'Leading icon';
const TRAILING = 'Trailing icon';

/** Inline padding of a side: icon side, label side next to an icon, or the plain padding. */
const padding = (side) => (v) => {
  const start = v.axes[LEADING];
  const end = v.axes[TRAILING];
  if (side === 'start' ? start : end) return 'container.padding-inline.icon-side';
  return start || end ? 'container.padding-inline.label-side' : 'container.padding-inline';
};

const icon = (position, axis, glyph) => ({
  type: 'icon',
  name: `icon-${position}`,
  when: (v) => v.axes[axis],
  glyph,
  property: `${axis} glyph`,
  bind: { fill: 'label.color', size: 'icon.size', fontFamily: 'icon.font-family', fontWeight: 'icon.font-weight' },
});

export default {
  axes: [
    { name: LEADING, values: [false, true] },
    { name: TRAILING, values: [false, true] },
  ],
  root: {
    type: 'frame',
    layout: 'HORIZONTAL',
    align: { primary: 'CENTER', counter: 'CENTER' },
    bind: {
      fill: 'container.background',
      stroke: 'container.border-color',
      strokeWeight: 'container.border-width',
      radius: 'container.border-radius',
      minHeight: 'container.min-height',
      gap: 'container.gap',
      paddingY: 'container.padding-block',
      paddingLeft: padding('start'),
      paddingRight: padding('end'),
    },
    focusRing: 'container',
    children: [
      icon('start', LEADING, 'add'),
      { type: 'text', name: 'label', text: 'Button', property: 'Label', bind: { fill: 'label.color', typography: 'label.typography' } },
      icon('end', TRAILING, 'arrow_forward'),
    ],
  },
  notDrawn: [
    { slot: 'container.transition', reason: 'Figma variables have no duration or easing.' },
    { slot: 'icon.fill, icon.grade, icon.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' },
  ],
};
