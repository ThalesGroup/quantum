/**
 * Accordion (packages/components/src/components/accordion/accordion.css): a vertical stack of
 * three items, 360 px wide (the web accordion fills its container). Each item is a column closed
 * by a hairline at its bottom (a bottom stroke only): its trigger (title, then the chevron) and,
 * when expanded, its panel. The variant's state applies to the first item only (`context`), the
 * others stay at rest, so the set shows one item hovered, pressed, focused or expanded among
 * closed ones. Texts are the spec's first example, one TEXT property per item.
 *
 * Approximation: the web turns the chevron upside down when expanded (rotate: 180deg); Figma
 * nodes of this format cannot rotate, so an expanded item shows the expand_less glyph instead of
 * expand_more, which is the same chevron upside down.
 */
const ITEMS = [
  { title: 'Shipping and returns', content: 'Orders ship within two business days. Returns are free within 30 days.' },
  { title: 'Payment methods', content: 'We accept cards, bank transfers and most digital wallets.' },
  { title: 'Warranty', content: 'Every product is covered for two years from the delivery date.' },
];

const expanded = (v) => v.state === 'expanded';

const item = ({ title, content }, i) => ({
  type: 'frame',
  name: 'item',
  layout: 'VERTICAL',
  width: 'FILL',
  // Only the first item takes the variant's state.
  ...(i > 0 ? { context: () => ({ state: 'default' }) } : {}),
  bind: { stroke: 'item.border-color', strokeBottom: 'item.border-width' },
  children: [
    {
      type: 'frame',
      name: 'trigger',
      layout: 'HORIZONTAL',
      align: { primary: 'MIN', counter: 'CENTER' },
      width: 'FILL',
      bind: {
        fill: 'trigger.background',
        radius: 'trigger.border-radius',
        minHeight: 'trigger.min-height',
        gap: 'trigger.gap',
        paddingX: 'trigger.padding-inline',
        paddingY: 'trigger.padding-block',
      },
      focusRing: 'trigger',
      children: [
        { type: 'text', name: 'title', text: title, property: `Title ${i + 1}`, width: 'FILL', bind: { fill: 'title.color', typography: 'title.typography' } },
        {
          type: 'icon',
          name: 'indicator',
          glyph: (v) => (expanded(v) ? 'expand_less' : 'expand_more'),
          // The chevron inherits the title color.
          bind: { fill: 'title.color', size: 'indicator.size', fontFamily: 'indicator.font-family', fontWeight: 'indicator.font-weight' },
        },
      ],
    },
    {
      type: 'frame',
      name: 'panel',
      when: expanded,
      layout: 'VERTICAL',
      width: 'FILL',
      bind: { paddingX: 'panel.padding-inline', paddingY: 'panel.padding-block' },
      children: [
        { type: 'text', name: 'content', text: content, property: `Content ${i + 1}`, width: 'FILL', bind: { fill: 'panel.color', typography: 'panel.typography' } },
      ],
    },
  ],
});

export default {
  root: {
    type: 'frame',
    layout: 'VERTICAL',
    width: 360,
    children: ITEMS.map(item),
  },
  notDrawn: [
    { slot: 'trigger.transition, indicator.transition', reason: 'Figma variables have no duration or easing.' },
    { slot: 'indicator.fill, indicator.grade, indicator.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' },
  ],
};
