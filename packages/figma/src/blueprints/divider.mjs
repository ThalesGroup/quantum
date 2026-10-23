/**
 * Divider (packages/components/src/components/divider/divider.css): the line is a frame filled
 * with the divider color, as thick as the border width (the web draws it as a border of an hr).
 * The component's root is a wrapper whose padding draws the line's margins: margin-block above and
 * below a horizontal line, margin-inline before and after a vertical one (each token exists for
 * its orientation only, so the other padding stays 0).
 *
 * - Horizontal: the line is 240 px wide (the web line spans its container's width).
 * - Vertical: the line is as high as its minimum height, which is also bound as its minimum
 *   height (the web stretches it to its row when the row is taller).
 */
const horizontal = (v) => v.props.orientation === 'horizontal';

export default {
  root: {
    type: 'frame',
    name: 'margins',
    layout: 'VERTICAL',
    bind: { paddingY: 'container.margin-block', paddingX: 'container.margin-inline' },
    children: [
      {
        type: 'frame',
        name: 'container',
        when: horizontal,
        width: 240,
        bind: { fill: 'container.color', height: 'container.border-width' },
      },
      {
        type: 'frame',
        name: 'container',
        when: (v) => !horizontal(v),
        bind: { fill: 'container.color', width: 'container.border-width', minHeight: 'container.min-height' },
        derive: { height: ['container.min-height', 1] },
      },
    ],
  },
};
