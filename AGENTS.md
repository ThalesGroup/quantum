# Quantum Design System — agent guide

This repository is the monorepo of the Quantum Design System (Thales). It holds
**technology-agnostic component specifications**, **DTCG design tokens**, **Markdown
documentation** and a **vanilla CSS reference implementation**, plus an **Astro docs site** that
renders all of it so people can review a component before it is built in any technology, a
**Figma plugin** that draws every component in Figma, bound to variables recreated from the
tokens, and a **Penpot plugin** that draws them in Penpot, bound to Penpot tokens. The packages
are published on npm under `@quantum-ds` (`@quantum-ds/tokens`, `@quantum-ds/components`,
`@quantum-ds/figma`, `@quantum-ds/penpot`).

You (an agent or a human) turn natural-language requests such as *"a button must have a blue
border using the primary color, in three variants"* into coordinated updates across every
artifact.

## How these instructions are organised

- **This file** is loaded in every session (`CLAUDE.md` imports it). It holds only what every
  session needs: the system in brief, where to read more, the skills, the commands and the
  rules that always hold.
- **The guides in [`agents/`](agents/)** hold the detail. Before acting, read the guides the
  table "Read before acting" names for the task, in full. They are the source of truth for how
  to work; this file only summarises them.
- **Directory `AGENTS.md` files** (`packages/components/specs/`, `packages/tokens/`,
  `packages/components/`, `packages/figma/`, `packages/penpot/`, `apps/docs/content/`, `apps/docs/screens/`, `apps/docs/`, `scripts/`)
  add local rules. Read the one of every directory you are about to edit.
- **Skills** in `.claude/skills/` run recurring workflows step by step (see "Skills").
- Changing these instructions: a rule goes in this file only when every session needs it and
  it fits in a line; everything else goes to its guide or directory file. All of them are
  rendered on the site's "How it works" page.

## The system in brief

Four artifacts describe one **component** and must always agree (`pnpm check` proves it): the
**spec** `packages/components/specs/components/<id>.spec.json` (what it is, with its decision
log), the **component tokens** `packages/tokens/src/components/<id>.tokens.json` (every design
decision), the **docs** `apps/docs/content/components/<id>.md` (usage guidance, prose only) and
the **web implementation** `packages/components/src/components/<id>/` (CSS reading only
component tokens, a pure HTML template). A **foundation** (`packages/components/specs/foundations/`,
`apps/docs/content/foundations/`) is a rule every component follows, such as color or the focus
ring. A **screen** (`apps/docs/screens/`) is a real-world page rebuilt only with the components
and tokens. The site in `apps/docs/` is a viewer built with the design system: it never encodes
design knowledge of its own. A **Figma blueprint** (`packages/figma/src/blueprints/<id>.mjs`)
redraws each component in Figma: its layer tree, read from the web implementation, naming the
token slot of each field, bound to Figma variables recreated from the tokens (`packages/figma/AGENTS.md`).

```
raw (hidden primitives)        <-  semantic (what components read)        <-  component (per part)
packages/tokens/src/raw/**         packages/tokens/src/semantic/**             packages/tokens/src/components/<id>.tokens.json
                                   packages/tokens/src/additions/semantic/**
```

The same decisions hold on every **platform** (`web`, `ios`, `android`, `desktop`) and in every
**mode** (`light`, `dark`): only raw and semantic values are overridden, in
`packages/tokens/src/platforms/<id>/` and `packages/tokens/src/modes/<id>/`. The outputs
under `packages/tokens/dist/` (built, not committed) come from `pnpm tokens:build`: the CSS the
repository reads, the platform trees and the syntax theme (`scripts/build-tokens.mjs`), and the
published CSS, Sass, JavaScript, Android, Figma, Penpot and Tokens Studio formats (Style Dictionary,
`packages/tokens/style-dictionary.config.mjs`). Details:
[agents/model.md](agents/model.md).

## Read before acting

| The session is about… | Read |
| --- | --- |
| Understanding the system, finding where something lives | [agents/model.md](agents/model.md) |
| Any change to a component, a foundation or a token: a request, a stated decision, a new component | [agents/workflow.md](agents/workflow.md), [agents/conventions.md](agents/conventions.md), [agents/impact.md](agents/impact.md), then the directory files of what you edit (`packages/components/specs/`, `packages/tokens/`, `packages/components/`, `apps/docs/content/`) |
| Anything touching accessibility: a role, keyboard, naming, contrast, a cited statement | [agents/accessibility.md](agents/accessibility.md), `packages/components/specs/a11y/` |
| The Figma library and its local export, a Figma export, plugging tokens, where a token comes from | [agents/token-sources.md](agents/token-sources.md), `packages/tokens/AGENTS.md` |
| Drawing the components in Figma, a Figma blueprint, the Figma plugin | [agents/token-sources.md](agents/token-sources.md) "Drawing a component in Figma", `packages/figma/AGENTS.md` |
| New releases of Figma, Penpot or Tokens Studio, whether the design tool exports are up to date, a workaround of a tool's limit | [agents/design-tools.md](agents/design-tools.md), `agents/design-tools.json` |
| Drawing the components in Penpot, the Penpot plugin | [agents/token-sources.md](agents/token-sources.md) "Drawing a component in Penpot", `packages/penpot/AGENTS.md`, `packages/figma/AGENTS.md` (the blueprints) |
| Specs format export or import | [agents/specs-interop.md](agents/specs-interop.md) |
| A screen | `apps/docs/screens/AGENTS.md`, [agents/impact.md](agents/impact.md) |
| The docs site | `apps/docs/AGENTS.md` |
| Scripts, the validator, the token build | `scripts/AGENTS.md` |
| Committing, a branch, a pull request, an issue (the end of every change) | [agents/git.md](agents/git.md) |

## Skills

| Skill | Use it when |
| --- | --- |
| `stepwise-pr` | Work needs several team decisions in a row: a draft pull request whose description is the plan, one step per session ("continue step N"). |
| `figma-alignment` | A component is compared with or improved from its local Figma export ([agents/token-sources.md](agents/token-sources.md)). Builds on `stepwise-pr`. |
| `review-sheet` | The team must compare renderings to decide: a focused before/after page and one precise question. |
| `worktree-preview` | Someone needs a local preview of a branch, a pull request or a worktree under `.claude/worktrees/`. |
| `backlog` | Out-of-scope work becomes an issue, a merged study becomes issues, or the open issues need syncing or labelling. |
| `design-tools-watch` | The releases of Figma, Penpot, Tokens Studio or DTCG need reviewing against the exports, or a check in the real tool comes back ([agents/design-tools.md](agents/design-tools.md)). |

Claude Code lists them by itself and invokes them by name; another agent reads
`.claude/skills/<name>/SKILL.md`.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm install` | Install the root tooling and every workspace package (`packages/*`, `apps/*`); installs the `commit-msg` hook. |
| `pnpm tokens:build` | Check the tokens and build `packages/tokens/dist/` (not committed) from `packages/tokens/src/`: `dist/css/**` (`raw.css`, `semantic.css`, `components/<id>.css` and the `index.css` entry point), `dist/platforms/<id>/<mode>.tokens.json` and `dist/shiki-theme.json` (`scripts/build-tokens.mjs`), then the distribution formats (`packages/tokens/style-dictionary.config.mjs`). Run after any token change. |
| `pnpm components:build` | Copy the specs (JSON and the foundations' code samples) to `packages/components/dist/`, what `@quantum-ds/components` publishes; not committed, also run by `pnpm build` and before packing. |
| `pnpm tokens:figma-library` | Report every token recreated from the Figma library that has since been added, removed or changed; needs the local export ([agents/token-sources.md](agents/token-sources.md)). |
| `pnpm figma:export [id…]` | Build the Figma plugin into `packages/figma/dist/` (not committed): it draws the components (all, or the given ones and those their instances use) as component sets bound to Figma variables recreated from the tokens (`packages/figma/AGENTS.md`). |
| `pnpm penpot:export [id…]` | Build the Penpot plugin into `packages/penpot/dist/` (not committed): it writes the Penpot tokens and draws the components (all, or the given ones and those their copies use) as components with variants bound to them, from the Figma blueprints (`packages/penpot/AGENTS.md`). |
| `pnpm penpot:serve` | Serve `packages/penpot/dist/` at http://localhost:4400, where Penpot's plugin manager installs `manifest.json` (Penpot loads plugins over HTTP). |
| `pnpm validate` | Schema-validate specs and cross-check spec ↔ tokens ↔ docs ↔ web; check mirrored components render the same; check the docs site and the screens are built with the design system. |
| `pnpm specs:check` | Export every component to the Specs format and require a valid, lossless round trip ([agents/specs-interop.md](agents/specs-interop.md)). |
| `pnpm specs:export [id…]` | Write `<id>.specs.json` + `<id>.quantum.json` sidecar to `build/specs/`. |
| `pnpm specs:import <file> [--sidecar <file>]` | Turn a Specs document into a draft spec + component tokens in `build/specs-import/`. Never writes into `packages/components/specs/` or `packages/tokens/src/`. |
| `pnpm test` | Unit tests of the scripts' libraries (`scripts/test/`) and of the Figma and Penpot plugins (`packages/figma/test/`, `packages/penpot/test/`). |
| `pnpm check` | `tokens:build` + `validate` + `specs:check` + `test`. **Must pass before any change is considered done.** |
| `pnpm impact [--base <ref>] [--files …]` | Every artifact linked to what changed (screens included), and whether it changed too. Fails when a component changed without a version bump ([agents/impact.md](agents/impact.md)). |
| `pnpm commits:check [--base <ref>] [--message "<text>"]` | Check commit messages against Conventional Commits ([agents/git.md](agents/git.md)). |
| `pnpm a11y:wcag` | Regenerate `packages/components/specs/a11y/wcag.json` from the W3C's machine-readable WCAG 2.2 (network). |
| `pnpm new:component <id> --name "Name" --role <role>` | Scaffold the four artifacts for a new component and a starter Figma blueprint (to rewrite from the real CSS and template), build the tokens, register it in `packages/components/src/index.css`. |
| `pnpm dev` | Build tokens, then start the Astro docs site (`apps/docs/`) at http://localhost:4321. |
| `pnpm build` | Build tokens, the components package (`packages/components/dist/`), the Figma and Penpot plugins (`packages/figma/dist/`, `packages/penpot/dist/`) and the static docs site into `apps/docs/dist/`. |
| `pnpm preview` | Serve the built docs site locally. |

## Rules that always hold

- A change is the whole set of artifacts linked to it, screens included: spec → component
  tokens → `pnpm tokens:build` → CSS/template → Figma blueprint → docs → screens, then
  `pnpm check` and `pnpm impact` ([agents/workflow.md](agents/workflow.md), [agents/impact.md](agents/impact.md)).
- Every stated decision goes through the decision loop in full and is recorded in the spec's
  `decisions[]`, one decision per commit ([agents/workflow.md](agents/workflow.md) "Decisions").
- Accessibility targets WCAG 2.2 AA; every accessibility statement cites a trusted source you
  opened ([agents/accessibility.md](agents/accessibility.md)).
- No raw or semantic token beyond the Figma library and the listed additions
  without asking first ([agents/token-sources.md](agents/token-sources.md)).
- One development, one branch, one pull request against `main`, Conventional Commits; a human
  reviews and merges. Out-of-scope work becomes an issue in `ThalesGroup/quantum`
  ([agents/git.md](agents/git.md)).

## Do not

- Edit or commit anything under `packages/tokens/dist/`.
- Put literal colors or lengths in `packages/components/src/components/**/*.css`.
- Reference raw tokens from component tokens or semantic tokens from CSS.
- Encode component knowledge in `apps/docs/` (variants lists, states, colors). The site derives everything from the four artifacts.
- Style the site with literal colors or font values, raw tokens or component tokens, or give it
  a look-alike of a control the design system has a component for (`apps/docs/AGENTS.md`).
- Duplicate spec data in docs (option lists as data). Docs explain *why* and *when*; the spec defines *what*.
- Add a dependency to `scripts/build-tokens.mjs` and its libraries. The token checks and the CSS the
  repository reads are intentionally zero-dependency so they can be lifted into other tooling; the
  distribution formats belong to `packages/tokens/style-dictionary.config.mjs` (Style Dictionary).
- Commit with `pnpm check` failing.
- Commit or push to `main` directly, merge your own pull request, or enable auto-merge ([agents/git.md](agents/git.md)).
- State an accessibility behaviour, requirement or recommendation without a trusted source, or
  cite a source you have not read. Memory is not a source.
- Change one artifact and leave the ones linked to it out of sync. Screens are linked artifacts:
  a component or token change that leaves a screen broken or stale is not done.
- Write a `ds-*` class by hand in a screen, restyle a component from `apps/docs/screens/screens.css`, or
  reuse the original's visual design, images or logos in a screen (`apps/docs/screens/AGENTS.md`).
- Add a screen without its source, its licence text and the copyright notice the licence requires.
- Fork component tokens per platform or per mode, or put a platform or mode value in a component
  token file: override the raw or semantic token in `packages/tokens/src/platforms/<id>/`, or the
  semantic token in `packages/tokens/src/modes/<id>/`, instead.
- Scope a statement to a platform because its source is web-only when the statement holds
  everywhere, or state a platform behaviour without that platform's trusted source.
- Create GitHub Pages, deploy the site anywhere, or add a deployment job to the workflows
  ([agents/git.md](agents/git.md)).
- Open an issue anywhere other than the `ThalesGroup/quantum` repository ([agents/git.md](agents/git.md)).
