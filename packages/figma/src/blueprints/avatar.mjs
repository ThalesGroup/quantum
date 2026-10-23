/**
 * Avatar (packages/components/src/components/avatar/avatar.css): a square auto layout of the
 * size token (bound to its width and height), rounded by the shape, with the initials centered.
 *
 * The picture is a variant axis, "Picture", because it replaces the initials (the template draws
 * one or the other). Figma variables cannot hold an image, so with a picture the avatar holds an
 * empty `image` layer filling the shape, rounded like it, for the designer to give an image fill
 * on the instance. The web clips the picture to the inner edge of the border; the image layer
 * takes the container radius instead (the inner radius is a difference Figma cannot bind).
 *
 * The initials are a TEXT property, "Initials" (the spec's name is the accessible name, not drawn;
 * the template derives the initials from it): the initials of the spec's first example.
 */
import { initialsOf } from '../../../components/src/components/avatar/avatar.template.mjs';

const PICTURE = 'Picture';

export default {
  axes: [{ name: PICTURE, values: [false, true] }],
  root: {
    type: 'frame',
    layout: 'HORIZONTAL',
    align: { primary: 'CENTER', counter: 'CENTER' },
    bind: {
      size: 'container.size',
      fill: 'container.background',
      stroke: 'container.border-color',
      strokeWeight: 'container.border-width',
      radius: 'container.border-radius',
    },
    children: [
      {
        type: 'frame',
        name: 'image',
        when: (v) => v.axes[PICTURE],
        width: 'FILL',
        height: 'FILL',
        bind: { radius: 'container.border-radius' },
      },
      {
        type: 'text',
        name: 'initials',
        when: (v) => !v.axes[PICTURE],
        text: initialsOf('Ada Lovelace'),
        property: 'Initials',
        bind: { fill: 'initials.color', typography: 'initials.typography' },
      },
    ],
  },
};
