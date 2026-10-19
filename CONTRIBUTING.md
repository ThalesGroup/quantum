# Contributing

## Repository structure

This repository is a monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces). Each package lives in its own directory under `packages/`:

| Package | Directory | Contributing guide |
| ------- | --------- | ------------------ |
| `@quantum-ds/tokens` | [`packages/tokens`](packages/tokens) | [packages/tokens/CONTRIBUTING.md](packages/tokens/CONTRIBUTING.md) |

## Commands

You need the latest LTS version of [Node.js](https://nodejs.org/), as defined in [`.nvmrc`](.nvmrc) (run `nvm use` if you use [nvm](https://github.com/nvm-sh/nvm)), and [pnpm](https://pnpm.io/) 12.

From the repository root:

- `pnpm i` installs the dependencies of all packages
- `pnpm build` builds all packages
- `pnpm --filter <package> <command>` runs a command of a single package, for example `pnpm --filter @quantum-ds/tokens build:penpot`

You can also run the commands of a package from its directory. Each package's contributing guide lists its own commands.

## Proprietary images

Logos, avatars and other brand images are not covered by the MIT License. Add them to the `assets/brand/` directory, which has its own [license](assets/brand/LICENSE), and nowhere else in the repository.

## Pull requests

Commit messages and pull request titles follow the [Conventional Commits](https://www.conventionalcommits.org/) specification, for example `feat: add Dataviz tokens` or `fix: correct the border radius of buttons`.

Before opening a pull request, make sure the packages you changed pass the checks described in their contributing guide.

## Releases

Each package is versioned and released on its own. To release a new version, update the `version` field and the `CHANGELOG.md` of the package in a pull request. Once it is merged, publish a [GitHub release](https://github.com/ThalesGroup/quantum/releases) whose tag is `<package name>@<version>`, for example `@quantum-ds/tokens@1.10.1`, with the changelog entry as release notes.

Publishing the release runs the [Release workflow](.github/workflows/release.yml), which builds the package and publishes it on npm with [trusted publishing](https://docs.npmjs.com/trusted-publishers). No npm token is stored in the repository, and npm generates a provenance attestation that links the published version to the workflow run and the commit it was built from.
