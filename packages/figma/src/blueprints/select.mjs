/**
 * Select (packages/components/src/components/select/select.css): the text field's stack
 * (src/blueprints/text-field.mjs), FIELD_WIDTH px wide where the web stretches. The closed
 * control shows the selected option (`Selected option`, the template's first option); a
 * placeholder is a disabled option in the same color, so there is no `Content` axis. The option
 * list is the browser's popup: not drawn.
 *
 * The `field` wraps the control and the chevron, which the web positions over the end edge of the
 * control (inset by indicator.margin-inline, in the control color) while the control reserves room
 * for it with padding-inline-end. Here the chevron sits at the end of `indicator-inset`, a frame
 * as wide as the field (FIELD_WIDTH px) positioned absolutely over it and vertically centered,
 * whose right padding is indicator.margin-inline. Figma cannot pin an absolute child to the end
 * edge from the format: if the component is made wider, widen `indicator-inset` with it.
 */
import { FIELD_WIDTH, TRANSITION, container, control, description, errorMessage, label } from './text-field.mjs';

export default {
  root: container([
    label,
    {
      type: 'frame',
      name: 'field',
      layout: 'HORIZONTAL',
      width: 'FILL',
      children: [
        control({
          bind: { paddingX: null, paddingLeft: 'control.padding-inline', paddingRight: 'control.padding-inline-end' },
          children: [
            {
              type: 'text',
              name: 'option',
              text: 'Option 1',
              property: 'Selected option',
              width: 'FILL',
              bind: { fill: 'control.color', typography: 'control.typography' },
            },
          ],
        }),
        {
          type: 'frame',
          name: 'indicator-inset',
          layout: 'HORIZONTAL',
          align: { primary: 'MAX', counter: 'CENTER' },
          width: FIELD_WIDTH,
          absolute: { x: 0, y: 'center' },
          bind: { paddingRight: 'indicator.margin-inline' },
          children: [
            {
              type: 'icon',
              name: 'indicator',
              glyph: 'expand_more',
              bind: { fill: 'control.color', size: 'indicator.size', fontFamily: 'indicator.font-family', fontWeight: 'indicator.font-weight' },
            },
          ],
        },
      ],
    },
    description,
    errorMessage,
  ]),
  booleans: { 'Show description': false },
  notDrawn: [
    TRANSITION,
    { slot: 'indicator.fill, indicator.grade, indicator.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' },
  ],
};
