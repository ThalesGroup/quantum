/**
 * Icon (packages/components/src/components/icon/icon.css): one glyph of the icon font, in a
 * component frame that hugs it (a component's root is a frame; the glyph is the `container` part).
 * The glyph is a TEXT property, "Glyph" (the template's default, add).
 *
 * Every color option is bound, on each surface to the icon role of that surface (neutral on
 * sunken, which has no role of its own, to the base one). The default color, current, has no
 * token: the web glyph inherits the surrounding text color. It is drawn as neutral on its surface
 * (decision current-drawn-as-neutral), for the designer to override on the instance.
 * upstream(figma): upstream(penpot): no fill inherits the color of the text around it.
 *
 * The font's fill, grade and optical size axes cannot be bound, but every named instance of the
 * variable font, the Light one bound here included, sits at fill 0, grade 0 and optical size 24,
 * the values of the Iconography foundation (whether Figma draws the installed font's named
 * instance is to check in Figma, ThalesGroup/quantum#47).
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
        context: (v) => (v.props.color === 'current' ? { props: { color: 'neutral' } } : {}),
        bind: { fill: 'container.color', size: 'container.size', fontFamily: 'container.font-family', fontWeight: 'container.font-weight' },
      },
    ],
  },
  notDrawn: [
    { slot: 'container.fill, container.grade, container.optical-size', reason: 'Figma cannot bind a variable to a font variation axis.' },
  ],
};
