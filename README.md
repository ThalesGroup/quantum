<div align="center">

<p><img src="./assets/brand/README-avatar.png" alt="Quantum avatar" width="120" height="120"></p>

# Quantum

<p align="center">
  Quantum tokens defined via the [Design Tokens Format (DTCG) specification](https://www.designtokens.org/)
  <br>
  <br>
  <a href="https://github.com/ThalesGroup/quantum/issues/new"><strong>Report bugs</strong></a>
  ·
  <a href="https://github.com/ThalesGroup/quantum/issues/new"><strong>Request feature</strong></a>
  <br>
</p>

</div>

<hr>

## Get started

Quantum tokens are the single source of truth for design tokens within Quantum’s ecosystem. By adhering to the [Design Tokens Format (DTCG) specification](https://www.designtokens.org/), this repository provides consistent, interoperable token definitions across platforms and tools.

This repository transforms these canonical tokens into formats that are consumable by various design tools and programming languages.

## Usage

The tokens are published as the `@quantum-ds/tokens` package.

> [!WARNING]
> `@quantum-ds/tokens` is not yet published on npm. Until it is, you can build the tokens from this repository with `pnpm build` and use the generated `dist/` directory.

Install in your project:

```sh
pnpm add @quantum-ds/tokens
```

The compiled artifacts are available under `node_modules/@quantum-ds/tokens/dist`:

- **Design token definitions (source of truth):** `dist/dtcg/` – standardized DTCG JSON files
- **Generated outputs:**
  - **Android:** `dist/resources*.xml`
  - **CSS:** `dist/tokens*.css`
  - **Figma:** `dist/figma/*.json` (not yet packaged)
  - **JavaScript CSS variables:** `dist/variables-css.js`
  - **JavaScript/TypeScript ES modules:** `dist/tokens-es6*.js`, `dist/tokens-es6*.d.ts`
  - **Penpot:** `dist/penpot/tokens.json`
  - **Sass:** `dist/tokens.scss`
  - **Tokens Studio:** `dist/tokens_studio/*.json` (not yet packaged)

> [!WARNING]
> The previous source of truth was the tokens defined in Figma artboards. These now live under `deprecated-tokens-from-figma/` and are still included in the package to avoid breaking changes, but **they are deprecated and must not be used for new work**.

## Comparing built files with a branch, tag, or commit

To generate a recursive diff of the built `dist/` output between your current branch and `main`, run:

```sh
pnpm run diff:build
```

This command:

- builds the current branch in a temporary worktree
- builds the reference (`main` by default) in a temporary worktree
- compares both generated `dist/` directories with the equivalent of `diff -r`
- writes the result to `build-diff.diff` at the repository root

You can also compare against another branch, tag, or commit SHA-1, and choose a custom output file name as long as it ends with `.diff`:

```sh
bash ./scripts/diff-built-files.sh origin/main my-custom-build.diff
```

Example with a specific commit:

```sh
bash ./scripts/diff-built-files.sh <commit-sha> my-custom-build.diff
```

## Working with DTCG Tokens

The canonical tokens under `dist/dtcg/` follow the DTCG JSON schema and can be consumed directly or transformed into many other formats:

- **Direct usage in tools that support DTCG**
  Many design and dev tools can read DTCG JSON natively or via plugins (see the [community overview of supporting tools](https://github.com/design-tokens/community-group/discussions/312)). You can:
  - Import the DTCG tokens into compatible design tools to drive color, typography, spacing, etc.
  - Use them in code generation or handoff tools as the shared contract between design and engineering.
  - Feed them to AI-powered tools to generate themes, component libraries, or application UIs that stay aligned with Quantum’s design language.

- **Transforming DTCG tokens to platform‑specific formats**
  DTCG is an exchange format: you can use it as input to token build tools to generate additional artifacts beyond what this package ships:
  - **[Style Dictionary](https://styledictionary.com/)** – configure a build that points at `dist/dtcg/` and outputs tokens for platforms or technologies you need (iOS, Android, web, design tools, etc.). This is what we use in this repository to generate some outputs; please check our [`config.js`](config.js).
  - **[Terrazzo](https://terrazzo.app/)** – use the DTCG files as the source to produce custom token bundles and integrations.

Because the DTCG definitions are the single source of truth, any downstream format or platform can be regenerated from them, keeping all outputs consistent and in sync. The published DTCG artifacts include both foundation and component tokens, including Dataviz tokens for light and dark themes.

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

This project is licensed under the [Apache License 2.0](LICENSE).

The images in [`assets/brand/`](assets/brand/) are proprietary and are not covered by this license. See [`assets/brand/LICENSE`](assets/brand/LICENSE) for details.
