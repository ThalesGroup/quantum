/**
 * Skeleton (packages/components/src/components/skeleton/skeleton.css): the shape is a frame with
 * the skeleton fill, the corners and the default height of its shape, in a component frame that
 * hugs it (a node's fixed width cannot change per variant, hence two `container` nodes).
 *
 * - Text and rectangle: 240 px wide (the web shape spans its container's width by default).
 * - Circle: as wide as its height token, as on the web.
 *
 * The web pulses the shape's opacity between 1 and the opacity token; Figma draws it at the
 * token's opacity, the low point of the pulse (the animation itself is not drawn). The width and
 * height properties are the consumer's lengths: resize the instance.
 */
const circle = (v) => v.props.shape === 'circle';

const shape = {
  fill: 'container.background',
  radius: 'container.border-radius',
  height: 'container.height',
  opacity: 'container.opacity',
};

export default {
  root: {
    type: 'frame',
    layout: 'HORIZONTAL',
    children: [
      { type: 'frame', name: 'container', when: (v) => !circle(v), width: 240, bind: shape },
      { type: 'frame', name: 'container', when: circle, bind: { ...shape, width: 'container.height' } },
    ],
  },
  notDrawn: [
    { slot: 'container.animation', reason: 'Figma variables have no duration or easing, and Figma components do not animate.' },
  ],
};
