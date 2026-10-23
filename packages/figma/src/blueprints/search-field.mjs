/**
 * Search field (packages/components/src/components/search-field/search-field.css): the text
 * field's stack (src/blueprints/text-field.mjs), FIELD_WIDTH px wide where the web stretches,
 * without an error message (no invalid state).
 *
 * The `field` wraps the control and the search glyph, which the web positions over the start edge
 * of the control (inset by icon.margin-inline) while the control reserves room for it with
 * padding-inline-start. Here the glyph sits in `icon-inset`, a frame positioned absolutely at the
 * field's start edge and vertically centered, whose left padding is icon.margin-inline.
 */
import { CONTENT, TRANSITION, container, content, control, description, label } from './text-field.mjs';

export default {
  axes: [CONTENT],
  booleans: { 'Show description': false },
  root: container([
    label,
    {
      type: 'frame',
      name: 'field',
      layout: 'HORIZONTAL',
      width: 'FILL',
      children: [
        control({
          bind: { paddingX: null, paddingLeft: 'control.padding-inline-start', paddingRight: 'control.padding-inline' },
          children: content(),
        }),
        {
          type: 'frame',
          name: 'icon-inset',
          layout: 'HORIZONTAL',
          align: { primary: 'MIN', counter: 'CENTER' },
          absolute: { x: 0, y: 'center' },
          bind: { paddingLeft: 'icon.margin-inline' },
          children: [
            {
              type: 'icon',
              name: 'icon',
              glyph: 'search',
              bind: { fill: 'icon.color', size: 'icon.size', fontFamily: 'icon.font-family', fontWeight: 'icon.font-weight' },
            },
          ],
        },
      ],
    },
    description,
  ]),
  notDrawn: [
    TRANSITION,
    { slot: 'icon.fill, icon.grade, icon.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' },
  ],
};
