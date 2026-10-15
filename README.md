<div align="center">

<p><img src="./assets/brand/README-avatar.png" alt="Quantum avatar" width="120" height="120"></p>

# Quantum

<p align="center">
  Quantum Design System
  <br>
  <br>
  <a href="https://quantum.thalesdigital.io/"><strong>Website</strong></a>
  ·
  <a href="https://github.com/ThalesGroup/quantum/issues/new"><strong>Report bugs</strong></a>
  ·
  <a href="https://github.com/ThalesGroup/quantum/issues/new"><strong>Request feature</strong></a>
  <br>
</p>

</div>

<hr>

## Get started

Quantum is the Thales Design System. This repository is a monorepo that hosts its open source packages, each one in its own directory under [`packages/`](packages/):

| Package | Description |
| ------- | ----------- |
| [`@quantum-ds/tokens`](packages/tokens) | Quantum tokens defined via the [Design Tokens Format (DTCG) specification](https://www.designtokens.org/) and transformed into formats for design tools and programming languages |

> [!WARNING]
> The packages are not yet published on npm. Until they are, you can build them from this repository.

To install the dependencies and build all packages, you need the latest LTS version of [Node.js](https://nodejs.org/), as defined in [`.nvmrc`](.nvmrc), and [pnpm](https://pnpm.io/) 12:

```sh
pnpm i
pnpm build
```

See the README of each package for its usage.

<!--
## Documentation

Documentation is available at [xxx/docs](https://xxx/docs/).

You can use [GitHub pages](https://guides.github.com/features/pages/) to create your documentation.

See an example here : https://github.com/ThalesGroup/ThalesGroup.github.io

**Please also add the documentation URL into the About section (Website field)**
-->

## Contributing

If you are interested in contributing to the Quantum project, start by reading the [Contributing guide](/CONTRIBUTING.md).

## License

The code in this project is licensed under the [MIT License](LICENSE). The documentation is licensed under the [Creative Commons Attribution 4.0 International License (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

The images in [`assets/brand/`](assets/brand/) are proprietary and are not covered by these licenses. See [`assets/brand/LICENSE`](assets/brand/LICENSE) for details.
