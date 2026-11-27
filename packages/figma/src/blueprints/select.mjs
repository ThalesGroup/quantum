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
 *
 * The severity icon (decision severity-icon) follows the field box in `control-row` (the Text field's
 * `withSeverityIcon`), the indicator staying inside the box, or starts the message (`message`), by the
 * `severityIcon` variant. The label row ends with the required mark, the Text field's `labelRow`: markedFields
 * is kept out of the variants (`fixed`), shown by the BOOLEAN `Mark` and typed in `Mark text` (decision mark-part).
 */
import { FIELD_WIDTH, TRANSITION, SEVERITY_ICON_AXES, ASTERISK, FIELD_SETTINGS, LABEL_COLUMN, LONG_LABEL_NOTE, container, control, description, message, labelRow, withSeverityIcon } from './text-field.mjs';

export default {
  root: container([
    labelRow,
    withSeverityIcon({
      type: 'frame',
      name: 'field',
      layout: 'HORIZONTAL',
      width: 'FILL',
      children: [
        control({
          // The Select is not in the field family yet: no minimum block padding (Text field decision grows-with-text-size).
          bind: { paddingX: null, paddingY: null, paddingLeft: 'control.padding-inline', paddingRight: 'control.padding-inline-end' },
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
    }),
    description,
    message,
  ]),
  fixed: FIELD_SETTINGS,
  booleans: { Mark: true, 'Show description': false },
  note: LONG_LABEL_NOTE,
  notDrawn: [
    LABEL_COLUMN,
    TRANSITION,
    SEVERITY_ICON_AXES,
    ASTERISK,
    { slot: 'indicator.fill, indicator.grade, indicator.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' },
  ],
};
