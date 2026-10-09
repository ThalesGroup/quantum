# Contributing

## Repository structure

This repository is a monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces). Each package lives in its own directory under `packages/`:

| Package | Directory | Contributing guide |
| ------- | --------- | ------------------ |
| `@quantum-ds/tokens` | [`packages/tokens`](packages/tokens) | [packages/tokens/CONTRIBUTING.md](packages/tokens/CONTRIBUTING.md) |

## Commands

You need an LTS version of [Node.js](https://nodejs.org/) (22 or 24) and [pnpm](https://pnpm.io/) 10.

From the repository root:

- `pnpm i` installs the dependencies of all packages
- `pnpm build` builds all packages
- `pnpm --filter <package> <command>` runs a command of a single package, for example `pnpm --filter @quantum-ds/tokens build:penpot`

You can also run the commands of a package from its directory. Each package's contributing guide lists its own commands.

## Proprietary images

Logos, avatars and other brand images are not covered by the Apache License 2.0. Add them to the `assets/brand/` directory, which has its own [license](assets/brand/LICENSE), and nowhere else in the repository.

## Pull requests

Commit messages and pull request titles follow the [Conventional Commits](https://www.conventionalcommits.org/) specification, for example `feat: add Dataviz tokens` or `fix: correct the border radius of buttons`.

Before opening a pull request, make sure the packages you changed pass the checks described in their contributing guide.
