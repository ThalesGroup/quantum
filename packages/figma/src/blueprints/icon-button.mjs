/**
 * Icon button (packages/components/src/components/icon-button/icon-button.css): a square
 * horizontal auto layout (minimum width and height from the size) with a minimum padding on
 * every side, the button's block padding, the glyph centered in it. It renders as the button (scripts/lib/mirrors.mjs) with only an icon, whose
 * glyph is a text property. The label is the accessible name only: it is not drawn.
 */
export default {
  root: {
    type: 'frame',
    name: 'container',
    layout: 'HORIZONTAL',
    align: { primary: 'CENTER', counter: 'CENTER' },
    bind: {
      fill: 'container.background',
      stroke: 'container.border-color',
      strokeWeight: 'container.border-width',
      radius: 'container.border-radius',
      minWidth: 'container.min-width',
      minHeight: 'container.min-height',
      padding: 'container.padding',
    },
    focusRing: 'container',
    children: [
      {
        type: 'icon',
        name: 'icon',
        glyph: 'add',
        property: 'Icon',
        bind: { fill: 'icon.color', size: 'icon.size', fontFamily: 'icon.font-family', fontWeight: 'icon.font-weight' },
      },
    ],
  },
  notDrawn: [
    { slot: 'container.transition', reason: 'Figma variables have no duration or easing.' },
    { slot: 'icon.fill, icon.grade, icon.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' },
  ],
};
