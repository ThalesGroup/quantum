/**
 * Breadcrumb (packages/components/src/components/breadcrumb/breadcrumb.css): the nav root holding
 * the list, a horizontal auto layout of items (it does not wrap: Figma's wrap is not drawn). Each
 * item is its link (a frame of the link's minimum height, carrying the radius and the focus ring,
 * around the label) then a chevron separator, except the last item, the current page. The levels
 * are the spec's first example. The State forces every link, as the root's data-state does on the
 * web; the last link stays current (a system state, which replaces the forced one: under
 * focus-visible it shows no ring, where the web draws one). The links are underlined; the
 * underline offset (a fraction of the font size) is Figma's default.
 */
const LEVELS = ['Home', 'Projects', 'Quantum Design System', 'Settings'];

const item = (text, current) => ({
  type: 'frame',
  name: 'item',
  ...(current ? { context: () => ({ state: 'current' }) } : {}),
  layout: 'HORIZONTAL',
  align: { primary: 'MIN', counter: 'CENTER' },
  bind: { gap: 'container.gap' },
  children: [
    {
      type: 'frame',
      name: 'link',
      layout: 'HORIZONTAL',
      align: { primary: 'MIN', counter: 'CENTER' },
      bind: { radius: 'link.border-radius', minHeight: 'link.min-height' },
      focusRing: 'link',
      // Links are underlined; the current page is not a link.
      children: [{ type: 'text', name: 'label', text, textDecoration: (v) => (v.state === 'current' ? 'NONE' : 'UNDERLINE'), bind: { fill: 'link.color', typography: 'link.typography' } }],
    },
    ...(current
      ? []
      : [{
        type: 'icon',
        name: 'separator',
        glyph: 'chevron_right',
        bind: { fill: 'separator.color', size: 'separator.size', fontFamily: 'separator.font-family', fontWeight: 'separator.font-weight' },
      }]),
  ],
});

export default {
  root: {
    type: 'frame',
    name: 'container',
    layout: 'HORIZONTAL',
    children: [
      {
        type: 'frame',
        name: 'list',
        layout: 'HORIZONTAL',
        align: { primary: 'MIN', counter: 'CENTER' },
        bind: { gap: 'container.gap' },
        children: LEVELS.map((text, i) => item(text, i === LEVELS.length - 1)),
      },
    ],
  },
  notDrawn: [
    { slot: 'link.transition', reason: 'Figma variables have no duration or easing.' },
    { slot: 'separator.fill, separator.grade, separator.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' },
  ],
};
