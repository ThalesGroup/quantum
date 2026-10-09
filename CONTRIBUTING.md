# Contributing

## Commands

You need an LTS version of [Node.js](https://nodejs.org/) (22 or 24) and [pnpm](https://pnpm.io/) 10.

- `pnpm i` installs the dependencies
- `pnpm build` generates all output formats
- `pnpm build:<tool>` builds tokens for a specific tool (e.g., `pnpm build:penpot`)

## Vendor Extensions

### `qtm.other` type

`@quantum-ds/tokens` introduces a `"$type": "qtm.other"` vendor type to support custom or non-standard token values that do not fit within the official [Design Tokens Format types](https://www.designtokens.org/tr/2025.10/format/#types).

### Tool-specific overrides

`@quantum-ds/tokens` also supports custom `$extensions` fields for tool-specific metadata. These are defined in `dtcg-extensions` directory, with subdirectories for each supported tool.

For instance, launching `pnpm build:penpot` will first merge tokens in `dtcg` directory with the matching ones in `dtcg-extensions/penpot`, and then transform them into Penpot-compatible output formats in `dist/penpot`.

This allows for tool-specific customization without affecting the base token definitions, ensuring compatibility and flexibility across different design platforms.

## Proprietary images

Logos, avatars and other brand images are not covered by the Apache License 2.0. Add them to the `assets/brand/` directory, which has its own [license](assets/brand/LICENSE), and nowhere else in the repository.

## Pull requests

Commit messages and pull request titles follow the [Conventional Commits](https://www.conventionalcommits.org/) specification, for example `feat: add Dataviz tokens` or `fix: correct the border radius of buttons`.

Before opening a pull request, make sure `pnpm check:dtcg` and `pnpm build` both succeed. If your change affects the generated files, `pnpm run diff:build` shows how `dist/` differs from `main`.
