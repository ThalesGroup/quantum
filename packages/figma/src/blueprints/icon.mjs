/**
 * Icon (packages/components/src/components/icon/icon.css): one glyph of the icon font, in a
 * component frame that hugs it (a component's root is a frame; the glyph is the `container` part).
 * The glyph is a TEXT property, "Glyph" (the template's default, add).
 *
 * The default color, current, has no token: the web glyph inherits the surrounding text color.
 * Figma has no inheritance, so that variant keeps Figma's default text fill, for the designer to
 * set on the instance; every other color option is bound.
 */
export default {
  root: {
    type: 'frame',
    layout: 'HORIZONTAL',
    align: { primary: 'CENTER', counter: 'CENTER' },
    children: [
      {
        type: 'icon',
        name: 'container',
        glyph: 'add',
        property: 'Glyph',
        bind: { fill: 'container.color', size: 'container.size', fontFamily: 'container.font-family', fontWeight: 'container.font-weight' },
      },
    ],
  },
  notDrawn: [
    { slot: 'container.fill, container.grade, container.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' },
  ],
};
