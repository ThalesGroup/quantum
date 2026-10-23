/**
 * Spinner (packages/components/src/components/spinner/spinner.css): a horizontal auto layout, the
 * ring before the label. The web ring is a bordered circle whose top border takes the arc color:
 * here a frame of the ring size holding two stroked ellipses, the full track and the arc, a quarter
 * turn centered on the top (where the top border is), as the ring rests before it turns. The
 * label is visually hidden by default on the web: here a layer hidden by a boolean property.
 */
const SHOW_LABEL = 'Show label';

const circle = (name, color, arc) => ({
  type: 'ellipse',
  name,
  ...(arc ? { arc } : {}),
  bind: { stroke: color, strokeWeight: 'ring.border-width', size: 'ring.size' },
});

export default {
  booleans: { [SHOW_LABEL]: false },
  root: {
    type: 'frame',
    name: 'container',
    layout: 'HORIZONTAL',
    align: { primary: 'MIN', counter: 'CENTER' },
    bind: { gap: 'container.gap' },
    children: [
      {
        type: 'frame',
        name: 'ring',
        bind: { size: 'ring.size' },
        children: [circle('track', 'ring.border-color'), circle('arc', 'ring.color', [0.625, 0.875])],
      },
      {
        type: 'text',
        name: 'label',
        text: 'Loading',
        property: 'Label',
        visibleProperty: SHOW_LABEL,
        bind: { fill: 'label.color', typography: 'label.typography' },
      },
    ],
  },
  notDrawn: [
    { slot: 'ring.animation', reason: 'Figma variables have no duration or easing (the ring turns).' },
    { slot: 'ring.opacity', reason: 'The low point of the pulse that replaces the turn under reduced motion, an animation: the ring at rest is opaque.' },
    { slot: 'label.size', reason: 'The 1 px clip of the visually hidden label: Figma hides the layer instead (Show label).' },
  ],
};
