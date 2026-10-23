/**
 * Slider (packages/components/src/components/slider/slider.css): a vertical auto layout, the label
 * row (label at the start, optional value at the end, on one baseline) above the control. The web
 * slider fills its container: here it is a literal 240 px wide. The control keeps a 24 px target
 * (control.min-height) around the thinner track: a horizontal frame of that minimum height centers
 * the track, which fills its width. The thumb (the input's pseudo-element on the web) is a frame in
 * the track, at the template's default value, 50: centered, whatever its size.
 */
const WIDTH = 240;
const SHOW_VALUE = 'Show value';

export default {
  booleans: { [SHOW_VALUE]: false },
  root: {
    type: 'frame',
    name: 'container',
    layout: 'VERTICAL',
    width: WIDTH,
    bind: { gap: 'container.gap' },
    children: [
      {
        type: 'frame',
        name: 'header',
        layout: 'HORIZONTAL',
        align: { primary: 'SPACE_BETWEEN', counter: 'BASELINE' },
        width: 'FILL',
        bind: { gap: 'container.column-gap' },
        children: [
          { type: 'text', name: 'label', text: 'Value', property: 'Label', bind: { fill: 'label.color', typography: 'label.typography' } },
          {
            type: 'text',
            name: 'value',
            text: '50',
            property: 'Value',
            visibleProperty: SHOW_VALUE,
            bind: { fill: 'value.color', typography: 'value.typography' },
          },
        ],
      },
      {
        type: 'frame',
        name: 'target',
        layout: 'HORIZONTAL',
        align: { primary: 'MIN', counter: 'CENTER' },
        width: 'FILL',
        bind: { minHeight: 'control.min-height' },
        children: [
          {
            type: 'frame',
            name: 'control',
            width: 'FILL',
            bind: { fill: 'control.background', radius: 'control.border-radius', height: 'control.height' },
            focusRing: 'control',
            children: [
              {
                type: 'frame',
                name: 'thumb',
                absolute: { x: 'center', y: 'center' },
                bind: {
                  fill: 'thumb.background',
                  stroke: 'thumb.border-color',
                  strokeWeight: 'thumb.border-width',
                  radius: 'thumb.border-radius',
                  size: 'thumb.size',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  notDrawn: [
    { slot: 'control.transition', reason: 'Figma variables have no duration or easing.' },
  ],
};
