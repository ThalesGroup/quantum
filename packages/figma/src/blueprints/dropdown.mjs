/**
 * Dropdown (packages/components/src/components/dropdown/dropdown.css): a vertical auto layout, the
 * trigger above the menu, separated by the menu offset. The trigger is an instance of the Button
 * with its trailing icon (the indicator chevron); it takes the dropdown's emphasis, intent, size and
 * state, and rests (default) while expanded, as the template renders it. The leading icon is a
 * variant axis passed to the Button, whose padding depends on it. The menu is drawn only expanded,
 * as the web shows it in the flow when the state is forced: the items of the spec's first example
 * in two groups split by a separator (a line of the separator width, inside a frame carrying its
 * block margin), the last item of intent error. The items fill the menu, whose width is a literal
 * 200 px (on the web, the width of its longest item). The trigger's label and trailing glyph are
 * the template's (Actions, expand_more), set on the Button instance's text properties.
 */
const LEADING = 'Leading icon';
const SHOW_ITEM_ICON = 'Show item icon';
const SHOW_SEPARATOR = 'Show separator';
const MENU_WIDTH = 200;

const item = (label, glyph, intent = 'neutral') => ({
  type: 'frame',
  name: 'item',
  context: () => ({ props: { 'item.intent': intent }, state: 'default' }),
  layout: 'HORIZONTAL',
  align: { primary: 'MIN', counter: 'CENTER' },
  width: 'FILL',
  bind: {
    fill: 'item.background',
    radius: 'item.border-radius',
    minHeight: 'item.min-height',
    paddingX: 'item.padding-inline',
    gap: 'item.gap',
  },
  focusRing: 'item',
  children: [
    {
      type: 'icon',
      name: 'item-icon',
      glyph,
      visibleProperty: SHOW_ITEM_ICON,
      // The icon inherits the item's color.
      bind: { fill: 'item-label.color', size: 'item-icon.size', fontFamily: 'item-icon.font-family', fontWeight: 'item-icon.font-weight' },
    },
    { type: 'text', name: 'item-label', text: label, width: 'FILL', bind: { fill: 'item-label.color', typography: 'item-label.typography' } },
  ],
});

const group = (...items) => ({ type: 'frame', name: 'group', layout: 'VERTICAL', width: 'FILL', children: items });

export default {
  uses: ['button'],
  axes: [{ name: LEADING, values: [false, true] }],
  booleans: { [SHOW_ITEM_ICON]: true, [SHOW_SEPARATOR]: true },
  root: {
    type: 'frame',
    name: 'container',
    layout: 'VERTICAL',
    align: { primary: 'MIN', counter: 'MIN' },
    bind: { gap: 'menu.offset' },
    children: [
      {
        type: 'instance',
        name: 'trigger',
        component: 'button',
        variant: (v) => ({
          Emphasis: v.props.emphasis,
          Intent: v.props.intent,
          Size: v.props.size,
          State: v.state === 'expanded' ? 'default' : v.state,
          [LEADING]: String(v.axes[LEADING]),
          'Trailing icon': 'true',
        }),
        texts: { Label: 'Actions', 'Trailing icon glyph': 'expand_more' },
      },
      {
        type: 'frame',
        name: 'menu',
        when: (v) => v.state === 'expanded',
        layout: 'VERTICAL',
        width: MENU_WIDTH,
        bind: {
          fill: 'menu.background',
          stroke: 'menu.border-color',
          strokeWeight: 'menu.border-width',
          radius: 'menu.border-radius',
          padding: 'menu.padding',
        },
        children: [
          group(item('Duplicate', 'content_copy'), item('Rename', 'edit'), item('Download', 'download')),
          {
            type: 'frame',
            name: 'separator-margin',
            layout: 'VERTICAL',
            width: 'FILL',
            visibleProperty: SHOW_SEPARATOR,
            bind: { paddingY: 'separator.margin-block' },
            children: [{ type: 'frame', name: 'separator', width: 'FILL', bind: { fill: 'separator.color', height: 'separator.width' } }],
          },
          group(item('Delete project', 'delete', 'error')),
        ],
      },
    ],
  },
  notDrawn: [
    { slot: 'item.transition', reason: 'Figma variables have no duration or easing.' },
    { slot: 'item-icon.fill, item-icon.grade, item-icon.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' },
  ],
};
