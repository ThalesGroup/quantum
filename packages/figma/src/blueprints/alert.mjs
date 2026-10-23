/**
 * Alert (packages/components/src/components/alert/alert.css): a horizontal auto layout, 360 px
 * wide (the web alert fills its container), the intent icon before a content column that fills
 * the rest and stacks the optional title (BOOLEAN "Show title") and the message, both wrapping.
 * The icon is the glyph the template gives each intent. Texts are the spec's info example.
 */
import { INTENT_ICONS } from '../../../components/src/components/alert/alert.template.mjs';

export default {
  booleans: { 'Show title': true },
  root: {
    type: 'frame',
    layout: 'HORIZONTAL',
    align: { primary: 'MIN', counter: 'MIN' },
    width: 360,
    bind: {
      fill: 'container.background',
      stroke: 'container.border-color',
      strokeWeight: 'container.border-width',
      radius: 'container.border-radius',
      padding: 'container.padding',
      gap: 'container.gap',
    },
    children: [
      {
        type: 'icon',
        name: 'icon',
        glyph: (v) => INTENT_ICONS[v.props.intent],
        bind: { fill: 'icon.color', size: 'icon.size', fontFamily: 'icon.font-family', fontWeight: 'icon.font-weight' },
      },
      {
        type: 'frame',
        name: 'content',
        layout: 'VERTICAL',
        width: 'FILL',
        bind: { gap: 'content.gap' },
        children: [
          { type: 'text', name: 'title', text: 'Scheduled maintenance', property: 'Title', visibleProperty: 'Show title', width: 'FILL', bind: { fill: 'title.color', typography: 'title.typography' } },
          { type: 'text', name: 'message', text: 'The service will be unavailable on Sunday from 02:00 to 04:00 UTC.', property: 'Message', width: 'FILL', bind: { fill: 'message.color', typography: 'message.typography' } },
        ],
      },
    ],
  },
  notDrawn: [
    { slot: 'icon.fill, icon.grade, icon.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' },
  ],
};
