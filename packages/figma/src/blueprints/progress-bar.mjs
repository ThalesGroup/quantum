/**
 * Progress bar (packages/components/src/components/progress-bar/progress-bar.css): a vertical auto
 * layout, the label row (label at the start, optional value at the end, on one baseline) above the
 * track. The web bar fills its container: here it is a literal 240 px wide. The indicator (the
 * progress element's pseudo-element on the web) is a frame in the track, as high as the track:
 * at 40 % (literal 96 px, the spec's first example) by default; indeterminate, a still frame of the
 * moving segment (a third of the track, literal 80 px, centered), square-ended like the web's
 * gradient, and the value is not shown (the template drops it without a value).
 */
const WIDTH = 240;
const SHOW_VALUE = 'Show value';
const indeterminate = (v) => v.state === 'indeterminate';

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
          { type: 'text', name: 'label', text: 'Progress', property: 'Label', bind: { fill: 'label.color', typography: 'label.typography' } },
          {
            type: 'text',
            name: 'value',
            when: (v) => !indeterminate(v),
            text: '40%',
            property: 'Value',
            visibleProperty: SHOW_VALUE,
            bind: { fill: 'value.color', typography: 'value.typography' },
          },
        ],
      },
      {
        type: 'frame',
        name: 'track',
        width: 'FILL',
        bind: { fill: 'track.background', radius: 'track.border-radius', height: 'track.height' },
        children: [
          {
            type: 'frame',
            name: 'indicator',
            when: (v) => !indeterminate(v),
            width: WIDTH * 0.4,
            bind: { fill: 'indicator.background', radius: 'indicator.border-radius', height: 'track.height' },
          },
          {
            type: 'frame',
            name: 'indicator',
            when: indeterminate,
            width: WIDTH / 3,
            absolute: { x: 'center', y: 0 },
            bind: { fill: 'indicator.background', height: 'track.height' },
          },
        ],
      },
    ],
  },
  notDrawn: [
    { slot: 'indicator.transition', reason: 'Figma variables have no duration or easing (the indeterminate sweep is an animation).' },
  ],
};
