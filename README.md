<div align="center">

<p>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/brand/README-avatar-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="./assets/brand/README-avatar-light.png">
    <img src="./assets/brand/README-avatar-light.png" alt="Quantum avatar" width="120" height="120">
  </picture>
</p>

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

> [!WARNING]
> **Experimental: Quantum NextGen.** This branch holds Quantum NextGen, the next major version of the Quantum Design System, and everything in it is experimental: the packages (`@quantum-ds/tokens` 2.0.0 alpha, `@quantum-ds/components` 0.1.0 alpha), the specifications and the docs site may change or break at any time without notice. Do not use them in production.

## Get started

Quantum is the Thales Design System. This repository is its monorepo: technology-agnostic component specifications, design tokens in the [Design Tokens Format (DTCG)](https://www.designtokens.org/), a vanilla CSS and HTML reference implementation, and the documentation that explains them.

The npm packages live under [`packages/`](packages/) and are published under the [`@quantum-ds`](https://www.npmjs.com/org/quantum-ds) scope:

| Package | Description |
| ------- | ----------- |
| [`@quantum-ds/tokens`](packages/tokens) | The design tokens: DTCG sources in three tiers (raw, semantic, component), with the CSS custom properties, the resolved per-platform trees and the syntax highlighting theme generated from them |
| [`@quantum-ds/components`](packages/components) | The components: technology-agnostic specifications (anatomy, properties, states, accessibility contract, decision log) in JSON. Their vanilla CSS and HTML reference implementation stays in the repository, where it renders the docs |

Themes will join them later. See the README of each package for its usage.

The documentation site lives in [`apps/docs/`](apps/docs/): the Markdown guidelines of every component and foundation, the real-world [screens](apps/docs/screens/) rebuilt with the design system, and the Astro viewer that renders all of it with the design system's own components. It is meant to become the foundations and components documentation of the [Quantum website](https://quantum.thalesdigital.io/).

```bash
pnpm install
pnpm dev        # build the tokens and serve the docs site at http://localhost:4321
pnpm check      # tokens fresh + specs valid + artifacts consistent + accessibility cited + Specs export + tests
pnpm build      # build the tokens and the static site into apps/docs/dist/
```

The model behind the repository (four artifacts per component that must always agree, foundations, screens, token tiers, platforms and modes) and the way to change it are described in [AGENTS.md](AGENTS.md) and the guides in [`agents/`](agents/), written for agents and humans alike and rendered on the site's "How it works" page.

## Contributing

If you are interested in contributing to the Quantum project, start by reading the [Contributing guide](/CONTRIBUTING.md).

## License

The code in this project is licensed under the [MIT License](LICENSE). The documentation is licensed under the [Creative Commons Attribution 4.0 International License (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

The repository also contains material from other projects, each under its own license: the screens in [`apps/docs/screens/`](apps/docs/screens/) are adapted from open source projects and keep their license and copyright notice next to them, and a few files are derived from other open source work. [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md) lists them all.

The images in [`assets/brand/`](assets/brand/) are proprietary and are not covered by these licenses. See [`assets/brand/LICENSE`](assets/brand/LICENSE) for details.
