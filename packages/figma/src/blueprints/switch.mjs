/**
 * Switch (packages/components/src/components/switch/switch.css): a horizontal auto layout, the
 * track before a vertical stack of the label and the optional description (the web grid's two
 * columns). The track is an auto layout of fixed size whose inline padding is the thumb margin
 * (its border counts in the layout, as in CSS): the thumb sits at the start edge, at the end edge
 * when on. The thumb is the track's pseudo-element on the web,
 * a frame here. The track's half-pixel offset that centers it on the label's first line (a sum of
 * a line height and a size, which Figma cannot bind) is left out: the track is top-aligned.
 */
const SHOW_DESCRIPTION = 'Show description';

const control = {
  type: 'frame',
  name: 'control',
  layout: 'HORIZONTAL',
  align: (v) => ({ primary: v.state === 'checked' ? 'MAX' : 'MIN', counter: 'CENTER' }),
  bind: {
    fill: 'control.background',
    stroke: 'control.border-color',
    strokeWeight: 'control.border-width',
    radius: 'control.border-radius',
    width: 'control.width',
    height: 'control.height',
    paddingX: 'thumb.margin',
  },
  focusRing: 'control',
  children: [
    // The web thumb takes the track's corner radius.
    { type: 'frame', name: 'thumb', bind: { fill: 'thumb.background', size: 'thumb.size', radius: 'control.border-radius' } },
  ],
};

export default {
  booleans: { [SHOW_DESCRIPTION]: false },
  root: {
    type: 'frame',
    name: 'container',
    layout: 'HORIZONTAL',
    align: { primary: 'MIN', counter: 'MIN' },
    bind: { gap: 'container.column-gap' },
    children: [
      control,
      {
        type: 'frame',
        name: 'text',
        layout: 'VERTICAL',
        bind: { gap: 'container.row-gap' },
        children: [
          { type: 'text', name: 'label', text: 'Label', property: 'Label', bind: { fill: 'label.color', typography: 'label.typography' } },
          {
            type: 'text',
            name: 'description',
            text: 'Description',
            property: 'Description',
            visibleProperty: SHOW_DESCRIPTION,
            bind: { fill: 'description.color', typography: 'description.typography' },
          },
        ],
      },
    ],
  },
  notDrawn: [
    { slot: 'control.transition', reason: 'Figma variables have no duration or easing.' },
  ],
};
