# Contributing

## Repository structure

This repository is a monorepo managed with [pnpm workspaces](https://pnpm.io/workspaces). The npm packages live under `packages/`, the applications under `apps/`, and the tooling shared by all of them under `scripts/`:

| Directory | Content | Guide |
| --------- | ------- | ----- |
| [`packages/tokens`](packages/tokens) | `@quantum-ds/tokens`: the DTCG token sources, their configuration and the generated outputs | [packages/tokens/AGENTS.md](packages/tokens/AGENTS.md) |
| [`packages/components`](packages/components) | `@quantum-ds/components`: the component and foundation specifications (published) and the vanilla CSS reference implementation (not published, used by the docs) | [packages/components/AGENTS.md](packages/components/AGENTS.md), [packages/components/specs/AGENTS.md](packages/components/specs/AGENTS.md) |
| [`packages/figma`](packages/figma) | `@quantum-ds/figma`: the Figma plugin that draws every component from the specifications and the tokens, one blueprint per component | [packages/figma/AGENTS.md](packages/figma/AGENTS.md) |
| [`packages/penpot`](packages/penpot) | `@quantum-ds/penpot`: the Penpot plugin that draws every component from the specifications, the tokens and the Figma blueprints | [packages/penpot/AGENTS.md](packages/penpot/AGENTS.md) |
| [`packages/bootstrap-theme`](packages/bootstrap-theme) | `@quantum-ds/bootstrap-theme`: the Bootstrap 6 theme built from the tokens through Bootstrap's theming API, with its demo page | [packages/bootstrap-theme/AGENTS.md](packages/bootstrap-theme/AGENTS.md) |
| [`packages/shadcn-theme`](packages/shadcn-theme) | `@quantum-ds/shadcn-theme`: the shadcn/ui theme built from the tokens through shadcn's theming API, with its demo page | [packages/shadcn-theme/AGENTS.md](packages/shadcn-theme/AGENTS.md) |
| [`apps/docs`](apps/docs) | The documentation site: the Markdown guidelines, the screens and the Astro viewer | [apps/docs/AGENTS.md](apps/docs/AGENTS.md), [apps/docs/content/AGENTS.md](apps/docs/content/AGENTS.md), [apps/docs/screens/AGENTS.md](apps/docs/screens/AGENTS.md) |
| [`scripts`](scripts) | The token build, the validator, the change impact report, the Specs bridge, the scaffolder and their tests | [scripts/AGENTS.md](scripts/AGENTS.md) |

[AGENTS.md](AGENTS.md) and the guides in [`agents/`](agents/) describe the model (the four artifacts of a component, foundations, screens, token tiers, platforms and modes), the change workflow and the conventions. They are written for agents and humans alike: read them before changing a component, a foundation or a token.

## Commands

You need the latest LTS version of [Node.js](https://nodejs.org/), as defined in [`.nvmrc`](.nvmrc) (run `nvm use` if you use [nvm](https://github.com/nvm-sh/nvm)), and [pnpm](https://pnpm.io/) 12.

From the repository root:

- `pnpm install` installs the dependencies of every package and application, and installs the `commit-msg` git hook
- `pnpm dev` builds the tokens and serves the docs site at http://localhost:4321
- `pnpm tokens:build` regenerates the token outputs after any token change
- `pnpm check` runs every check: generated outputs fresh, specifications valid and consistent with the tokens, the docs and the web implementation, Specs export round trip, unit tests. It must pass before a change is considered done
- `pnpm impact` lists every artifact linked to what you changed and fails when a component changed without a version bump
- `pnpm figma:export` builds the Figma plugin into `packages/figma/dist/`, to import in the Figma desktop app ([packages/figma/README.md](packages/figma/README.md))
- `pnpm penpot:export` builds the Penpot plugin into `packages/penpot/dist/` and `pnpm penpot:serve` serves it, to install in Penpot ([packages/penpot/README.md](packages/penpot/README.md))
- `pnpm bootstrap-theme:build` and `pnpm shadcn-theme:build` build the Bootstrap 6 and shadcn/ui themes, each with a demo page, into `packages/bootstrap-theme/dist/` and `packages/shadcn-theme/dist/` ([packages/bootstrap-theme/README.md](packages/bootstrap-theme/README.md), [packages/shadcn-theme/README.md](packages/shadcn-theme/README.md))
- `pnpm build` builds the tokens, the components package, the Figma and Penpot plugins, the Bootstrap and shadcn themes and the static docs site into `apps/docs/dist/`
- `pnpm --filter <package> <command>` runs a command of a single package, for example `pnpm --filter docs build`

The full list, with what each command does, is in the "Commands" table of [AGENTS.md](AGENTS.md).

## Proprietary images

Logos, avatars and other brand images are not covered by the MIT License. Add them to the `assets/brand/` directory, which has its own [license](assets/brand/LICENSE), and nowhere else in the repository.

## Third-party material

Material adapted from another project (a screen rebuilt from an open source page, code derived from another open source project) keeps the license of its origin. Add it only when that license allows reuse and adaptation, keep its license text and copyright notice next to the files (for a screen, in its source directory, as described in [apps/docs/screens/AGENTS.md](apps/docs/screens/AGENTS.md)), and list it in [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

## Pull requests

Every change goes through a branch and a pull request against `main`, as described in [agents/git.md](agents/git.md). Commit messages and pull request titles follow the [Conventional Commits](https://www.conventionalcommits.org/) specification, for example `feat(button): a loading state` or `fix(docs): keep the token group links in place while filtering`; the `commit-msg` hook and the CI check them, with the scopes listed in that guide.

Before opening a pull request, run `pnpm check` and `pnpm impact --base origin/main`, and look at what you changed on the docs site.

## Releases

Each package is versioned and released on its own. Quantum NextGen only releases alpha versions for now (`<major>.<minor>.<patch>-alpha.<n>`), published on npm under the `alpha` dist-tag (`npm install @quantum-ds/tokens@alpha`) so that `latest` stays on the stable version, and without a GitHub release, so that the [Releases](https://github.com/ThalesGroup/quantum/releases) page keeps showing stable versions only.

To release a new version, update the `version` field and the `CHANGELOG.md` of the package in a pull request against `nextgen`. Once it is merged, tag the merge commit `<package name>@<version>` and push the tag, for example:

```bash
git fetch origin
git tag @quantum-ds/tokens@2.0.0-alpha.1 origin/nextgen
git push origin @quantum-ds/tokens@2.0.0-alpha.1
```

Pushing the tag runs the [Release workflow](.github/workflows/release.yml). It refuses a version that isn't an alpha, a tag that doesn't match the package version and a commit that isn't on `nextgen`, then checks the repository and publishes the package on npm with [trusted publishing](https://docs.npmjs.com/trusted-publishers), after a maintainer approves the `npm` environment. Don't publish a GitHub release for these tags.

No npm token is stored in the repository, and npm generates a provenance attestation that links the published version to the workflow run and the commit it was built from.

The trusted publisher is configured in the package settings on npmjs.com, for the repository `ThalesGroup/quantum`, the workflow `release.yml` and the environment `npm`. npm can drop a configuration that hasn't been used for a publication, so after a long period without releases, re-create it just before pushing the tag, either on npmjs.com or with `npm trust github <package name> --file release.yml --repo ThalesGroup/quantum --env npm --allow-publish`. If the workflow fails with a 404 from npm, the trusted publisher is the first thing to check: re-create it, then re-run the failed job. npm only accepts a trusted publisher for a package that already exists, so the first version of a new package is published by hand (`pnpm publish --tag alpha` from its directory).
