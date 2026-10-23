/**
 * Pagination (packages/components/src/components/pagination/pagination.css): the nav root holding
 * the list, a horizontal auto layout of previous, the pages and next (it does not wrap: Figma's
 * wrap is not drawn). Each is an item holding its link: a horizontal auto layout at least a square
 * of the link size, centered, with a chevron and a word for previous and next. The pages are the
 * spec's "first page" example: 1 (current), 2, 3, an ellipsis and 12; previous is disabled.
 * The State forces every link, as the root's data-state does on the web: the current page also
 * stays current (its state is property-triggered, so it holds beside the forced one), and the
 * disabled previous link stays disabled (a system state, which replaces the forced one: under
 * focus-visible it shows no ring, where the web draws one).
 */
const link = (children) => ({
  type: 'frame',
  name: 'link',
  layout: 'HORIZONTAL',
  align: { primary: 'CENTER', counter: 'CENTER' },
  bind: {
    fill: 'link.background',
    radius: 'link.border-radius',
    minWidth: 'link.size',
    minHeight: 'link.size',
    paddingX: 'link.padding-inline',
    gap: 'container.gap',
  },
  focusRing: 'link',
  children,
});

const label = (text) => ({ type: 'text', name: 'label', text, bind: { fill: 'link.color', typography: 'link.typography' } });

const icon = (glyph) => ({
  type: 'icon',
  name: 'icon',
  glyph,
  bind: { fill: 'link.color', size: 'icon.size', fontFamily: 'icon.font-family', fontWeight: 'icon.font-weight' },
});

const item = (name, children, context) => ({ type: 'frame', name, layout: 'HORIZONTAL', ...(context ? { context } : {}), children: [link(children)] });

/** A page; the current one turns its property-triggered state on (spec state `current`, property `pages`). */
const page = (text, current = false) => item('item', [label(text)], current ? () => ({ props: { pages: true } }) : null);

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
        children: [
          item('previous', [icon('chevron_left'), label('Previous')], () => ({ state: 'disabled' })),
          page('1', true),
          page('2'),
          page('3'),
          page('…'),
          page('12'),
          item('next', [label('Next'), icon('chevron_right')]),
        ],
      },
    ],
  },
  notDrawn: [
    { slot: 'link.transition', reason: 'Figma variables have no duration or easing.' },
    { slot: 'icon.fill, icon.grade, icon.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' },
  ],
};
