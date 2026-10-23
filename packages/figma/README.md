# @quantum-ds/figma

The Quantum components in Figma: a Figma plugin that draws every component of the design system
as a Figma component set bound to Figma variables recreated from
[`@quantum-ds/tokens`](../tokens), following the specifications of
[`@quantum-ds/components`](../components). Private for now: it is built from the repository,
not published.

## Use

```sh
pnpm install
pnpm figma:export            # every component
pnpm figma:export button     # some of them (and the components their instances use)
```

Then, in the Figma desktop app: **Plugins > Development > Import plugin from manifest…**, pick
`packages/figma/dist/manifest.json`, open a design file and run **Quantum components**. Its
window, built with the design system, shows the progress of the run (the variables, then each
component, with its status) and the warnings at the end; close it when it is done. It
creates or updates three variable collections (`Quantum / Raw`, `Quantum / Semantic` with a
Light and a Dark mode, `Quantum / Components`) and draws each component on its own page. A
component set that already exists is kept: delete it to draw it again.

Icons are glyphs of Material Symbols Outlined: install the font on your machine first (the
variable font of [google/material-design-icons](https://github.com/google/material-design-icons/tree/master/variablefont)),
or icons are drawn as empty squares. The Dark mode needs a Figma plan that allows several modes
per collection.

## License

[MIT](LICENSE)
