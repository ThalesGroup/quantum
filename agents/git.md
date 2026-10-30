# Repository, commits and issues

Branches, pull requests, Conventional Commits, labels and issues. Part of the agent guide: start from the root `AGENTS.md`.

## Repository, commits and issues

The repository is the GitHub repository
[`ThalesGroup/quantum`](https://github.com/ThalesGroup/quantum).

- **Never commit to `main`: one branch and one pull request per development.** Start every
  change from an up-to-date `main` on a new branch, commit there, push the branch to `origin`
  and open a pull request against `main` (see "Branches" and "Pull requests" below). Never
  push to `main`, never merge your own pull request and never enable auto-merge: a human
  reviews and merges. `pnpm check` must pass before every commit (`AGENTS.md` "Do not").
- **Conventional Commits.** Every commit message follows
  [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) (see "Commits"
  below). The `commit-msg` hook refuses any other message, and CI checks every commit of a
  pull request (the `commits` job).
- **CI.** `.github/workflows/ci.yml` runs on every pull request: `check` (`pnpm check`),
  `commits` (`pnpm commits:check --base`), `impact` (`pnpm impact --base`) and `build`
  (`pnpm build`, which uploads the docs site as an artifact, and a dry-run pack of every
  package); `check` and `build` run again on every push to `main` and `nextgen`.
  `.github/workflows/release.yml` publishes an alpha version of a package to npm (dist-tag
  `alpha`) with trusted publishing when a tag `@quantum-ds/<package>@<version>-alpha.<n>` is
  pushed on a commit of `nextgen`; no GitHub release is created (`CONTRIBUTING.md` "Releases").
- **No deployment.** Never create GitHub Pages and never deploy the site, anywhere: no
  deployment job in the workflows. `pnpm build` and `pnpm dev` are for local review only. The
  docs site will later be integrated into https://quantum.thalesdigital.io/ by the Quantum team.
- **Out-of-scope work becomes an issue.** When a conversation raises a new feature, a bug or
  an enhancement that is not directly part of the current work, open an issue for it right away
  instead of doing it or leaving it in the chat:
  `gh issue create --repo ThalesGroup/quantum --title "…" --body "…" --label <label>`.
  The body stands alone: context, the artifacts involved (paths), what is expected. Report the
  issue URL.
- **Labels.** On every issue and every pull request, pick every label that fits from the
  repository's existing set (`gh label list --repo ThalesGroup/quantum`):
  - **Kind.** A pull request takes the label of its commit type (`feat`, `fix`, `docs`, `ci`,
    `test`, `perf`, `build`, `chore`, `refactor`), plus `dependencies` when it changes
    dependencies. An issue takes `bug`, `enhancement` or `question` instead, never a commit type
    (`docs` aside, as an area).
  - **Area**, every one the change or the issue touches: `site` (the docs website's code,
    `apps/docs/` and its screens), `content` (its guidance pages, `apps/docs/content/`),
    `tokens` (`packages/tokens/`), `components` (`packages/components/`: specs, CSS,
    templates), `docs` (README, CONTRIBUTING, the agent guides in `agents/` and the skills; the
    same label as the commit type, there is no `documentation` label). Scripts and workflows take
    no area label: the kind says it (`build`, `ci`).
  - **Design tool**, every one the change or the issue concerns: `figma` (the Figma library, its
    export, the Figma token format, and `@quantum-ds/figma` in `packages/figma/`), `penpot` (the
    Penpot token format, its import, and `@quantum-ds/penpot` in `packages/penpot/`),
    `tokens-studio` (the Tokens Studio token format). A change to `packages/figma/` takes `figma`,
    one to `packages/penpot/` takes `penpot`, on top of its kind.
  - **Framework**, every one the change or the issue concerns: `bootstrap` (the Bootstrap theme,
    `@quantum-ds/bootstrap-theme` in `packages/bootstrap-theme/`), `shadcn` (the shadcn/ui theme,
    `@quantum-ds/shadcn-theme` in `packages/shadcn-theme/`). A change to a theme package takes its
    framework label on top of its kind.
  - **Quantum NextGen.** Every issue and pull request that concerns it (a pull request against
    `nextgen`, an issue about its packages, specs, docs site, guides or skills) always takes
    `nextgen`.

  The area is the part of the repository, not the commit scope: `fix(docs): …` on the site's
  code takes `fix` and `site`; `docs` goes only on what touches the repository's own docs. Do not invent labels on the fly; create a new one
  only when asked.
- **This repository only.** Always pass `--repo ThalesGroup/quantum`. Never open an issue or a
  pull request, or comment on one, in any other repository, including upstream projects
  (Specs, Astro, W3C…): describe the upstream problem in an issue here instead.

### Branches

- One development, one branch: a component decision (`agents/workflow.md` "Decisions"), a foundation, a script,
  a docs site feature, a docs rewrite. Unrelated changes go to separate branches and pull requests.
- Name it `<type>/<scope>-<short-kebab-subject>`, with the type and scope of its main commit
  (see "Commits"): `feat/button-primary-border`, `fix/docs-token-filter`,
  `docs/agents-pr-workflow`.
- Branch from the latest `main` (`git fetch origin && git switch -c <branch> origin/main`). If
  `main` moves before the merge, bring it in (rebase or merge `origin/main`), re-run
  `pnpm check` and push again.
- On a branch, check against `main`: `pnpm impact --base origin/main` and
  `pnpm commits:check --base origin/main`.

### Pull requests

- Open it with `gh pr create --repo ThalesGroup/quantum --base main --head <branch> --title
  "…" --body "…" --label <label> [--label <label>…]`. The title is the Conventional Commit
  header of the change (the main commit's header when there are several commits).
- The description is written for a human reviewer who did not follow the conversation: plain
  sentences, no internal jargon left unexplained, no pasted tool output. Use these sections:
  - **Why**: the request or decision behind the change, in one or two sentences.
  - **What changes**: per artifact (spec, tokens, CSS/template, docs, site, scripts), what
    changed and the visible effect; decision ids, contrast ratios and the sources cited (`agents/accessibility.md`).
  - **Left unchanged on purpose**: every linked artifact `pnpm impact` listed that was not
    updated, with the reason (`agents/impact.md`).
  - **How to review**: the precise places to look (files and lines, site pages, examples,
    states, modes), and the judgement calls the reviewer must confirm or reject.
  - **Checks**: `pnpm check` and `pnpm impact --base origin/main` results.
  - **Follow-ups**: issues opened for out-of-scope work (links).
- Keep the description true: when review feedback adds commits, update it.
- **When done, report** in the conversation: what was done (branch, commits, pull request
  link, labels), and what the reviewer must review precisely, the same list as the "How to
  review" section.

### Commits

```
<type>(<scope>): <subject>

[body: what and why, decision ids, contrast ratios]

[BREAKING CHANGE: what consumers must change]
```

- **Type** says what the change is for the people consuming the design system:

  | Type | Use for | Spec version |
  | --- | --- | --- |
  | `feat` | A new or changed decision, component, property, option, state, token; a docs site feature; a new command | minor |
  | `fix` | A correction that changes no decision; a bug in a script or the docs site | patch |
  | `docs` | Prose only: `apps/docs/content/`, `AGENTS.md`, `agents/`, README | none, or patch |
  | `refactor` · `perf` · `style` | Restructuring, speed, formatting: nothing visible changes | none |
  | `test` | Tests only | none |
  | `build` | Token pipeline, build scripts, package manifests | none |
  | `ci` | `.github/workflows/`, git hooks | none |
  | `chore` | Housekeeping that fits nowhere else | none |
  | `revert` | Reverts an earlier commit (`revert: <header of the reverted commit>`) | as reverted |

- **Scope** names what changed: the component id (`button`, `icon-button`) for a component
  change, the foundation id (`focus`) for a foundation change, several comma-separated when one decision spans components
  (`feat(button,icon-button): color modes`), otherwise an area: `tokens`, `modes`,
  `platforms`, `foundations`, `specs`, `a11y`, `components` (the components package), `figma`
  (the Figma package), `penpot` (the Penpot package), `bootstrap-theme` (the Bootstrap theme package),
  `shadcn-theme` (the shadcn/ui theme package), `web`
  (the web reference implementation), `docs` (the docs app and the guidelines), `screens`,
  `scripts`, `agents`, `ci`, `deps`, `release`. A
  component scope that does not exist fails the check; the list lives in
  `scripts/lib/conventional-commits.mjs`.
- **Breaking changes** (a removed option, property or token path, a renamed part, anything that
  makes consumers change their code or design files) take `!` after the scope and a
  `BREAKING CHANGE:` footer saying what to change, and bump the spec's **major** version.
- **Subject**: imperative or a noun phrase stating the decision, no final period, header at
  most 100 characters. One decision, one commit (`agents/workflow.md` "Decisions").
- Check a message before committing with `pnpm commits:check --message "<message>"`.
  `pnpm install` installs the hook (`git config core.hooksPath .githooks`); merge commits and
  git's own `fixup!`/`squash!`/`Revert "…"` messages are let through. Commits made before the
  rule are not rewritten.
