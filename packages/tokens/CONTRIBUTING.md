# Contributing to @quantum-ds/tokens

Please read the [general Contributing guide](../../CONTRIBUTING.md) first.

## Commands

Run these commands from the `packages/tokens` directory, or from the repository root with `pnpm --filter @quantum-ds/tokens <command>`.

- `pnpm build` generates all output formats
- `pnpm build:<tool>` builds tokens for a specific tool (e.g., `pnpm build:penpot`)
- `pnpm check:dtcg` validates the DTCG tokens
- `pnpm run diff:build` shows how the generated `dist/` differs from `main` (see the [README](README.md#comparing-built-files-with-a-branch-tag-or-commit))

The build scripts in `src/` are written in TypeScript and run directly by Node.js, which strips the types without type checking them.

## Vendor Extensions

### `qtm.other` type

`@quantum-ds/tokens` introduces a `"$type": "qtm.other"` vendor type to support custom or non-standard token values that do not fit within the official [Design Tokens Format types](https://www.designtokens.org/tr/2025.10/format/#types).

### Tool-specific overrides

`@quantum-ds/tokens` also supports custom `$extensions` fields for tool-specific metadata. These are defined in `dtcg-extensions` directory, with subdirectories for each supported tool.

For instance, launching `pnpm build:penpot` will first merge tokens in `dtcg` directory with the matching ones in `dtcg-extensions/penpot`, and then transform them into Penpot-compatible output formats in `dist/penpot`.

This allows for tool-specific customization without affecting the base token definitions, ensuring compatibility and flexibility across different design platforms.

## Pull requests

Before opening a pull request, make sure `pnpm check:dtcg` and `pnpm build` both succeed. If your change affects the generated files, `pnpm run diff:build` shows how `dist/` differs from `main`.
