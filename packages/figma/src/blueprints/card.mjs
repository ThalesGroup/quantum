/**
 * Card (packages/components/src/components/card/card.css): a vertical auto layout, 320 px wide
 * (the web card fills the width its grid or list gives it), stacking the title and the optional
 * description (BOOLEAN "Show description"), both wrapping. The surface sets the fill and the
 * edge. Texts are the spec's first example. The heading level is a property of the markup only.
 */
export default {
  booleans: { 'Show description': true },
  root: {
    type: 'frame',
    layout: 'VERTICAL',
    width: 320,
    bind: {
      fill: 'container.background',
      stroke: 'container.border-color',
      strokeWeight: 'container.border-width',
      radius: 'container.border-radius',
      padding: 'container.padding',
      gap: 'container.gap',
    },
    children: [
      { type: 'text', name: 'title', text: 'Quantum Design System', property: 'Title', width: 'FILL', bind: { fill: 'title.color', typography: 'title.typography' } },
      {
        type: 'text',
        name: 'description',
        text: 'Technology-agnostic component specifications, DTCG tokens and a vanilla CSS reference implementation.',
        property: 'Description',
        visibleProperty: 'Show description',
        width: 'FILL',
        bind: { fill: 'description.color', typography: 'description.typography' },
      },
    ],
  },
};
