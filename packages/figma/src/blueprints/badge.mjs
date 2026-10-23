/**
 * Badge (packages/components/src/components/badge/badge.css): a pill, a horizontal auto layout
 * hugging its label, centered, with the minimum height and inline padding of the size (no block
 * padding, as on the web). Emphasis x intent set the fill, the border and the label color.
 */
export default {
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
      paddingX: 'container.padding-inline',
    },
    children: [
      { type: 'text', name: 'label', text: 'Badge', property: 'Label', bind: { fill: 'label.color', typography: 'label.typography' } },
    ],
  },
};
