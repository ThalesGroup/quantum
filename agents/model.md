# Model and repository map

What the four artifacts, foundations, screens, token tiers, platforms and modes are, and where everything lives. Part of the agent guide: start from the root `AGENTS.md`.

## Mental model

Four artifacts describe one component. They must always agree; `pnpm check` proves it.

| Artifact | Path | Owns |
| --- | --- | --- |
| Spec | `packages/components/specs/components/<id>.spec.json` | What the component **is**: role, anatomy (parts with roles), properties, states, layout, accessibility, content rules, examples, implementation metadata, and the **decision log** that led there. Technology-agnostic. |
| Component tokens | `packages/tokens/src/components/<id>.tokens.json` | Every **design decision** of the component (colors, dimensions, typography) as DTCG tokens aliasing semantic tokens. |
| Docs | `apps/docs/content/components/<id>.md` | Usage **guidance** for designers and developers: when to use, variants meaning, content, accessibility. Prose only; no data that the spec already holds. |
| Web implementation | `packages/components/src/components/<id>/<id>.css` + `<id>.template.mjs` | The **reference rendering**: vanilla CSS consuming only component tokens, and a pure HTML template `render(props)`. |

### Foundations

Some decisions belong to no single component but hold for all of them: the building blocks of
the system (color, typography, spacing and sizing, shape, elevation and effects, motion,
iconography), global rules such as the focus ring, and code syntax colors; text selection is
planned. A **foundation** is that global specification, documented like a component but with no
anatomy, role or properties:

| Artifact | Path | Owns |
| --- | --- | --- |
| Foundation spec | `packages/components/specs/foundations/<id>.spec.json` | The semantic tokens it owns (`tokens`), what it **is** as one rule per aspect (`rules`), the components that must follow it (`appliesTo`), its contrast requirements (computed in every platform × mode by `pnpm validate`), its cited accessibility statements, the `specimens` that draw the tokens it is built from (raw palettes and scales included) on its page, examples rendered with the components following it (or code samples next to the spec, in `packages/components/specs/foundations/<id>/`), `decisions[]` and `changelog`. Schema `packages/components/specs/schema/foundation.schema.json`. |
| Foundation docs | `apps/docs/content/foundations/<id>.md` | Usage guidance, platform sub-headings, a sourced Accessibility section, like component docs. |

A foundation owns **semantic** tokens only (none yet when no decision gives its primitives a
meaning: elevation and effects); components follow it by aliasing them from their own component
tokens, and never re-specify it. Its specimens present raw and semantic tokens by group
pattern, so a new token appears on its page with no site change, and every raw and semantic
token must reach one foundation (owned or in a specimen; `pnpm validate` warns otherwise). The
site derives who follows a foundation from those aliases and renders each one under
**Foundations**. Foundations carry no web file today:
the components draw what they specify. A foundation that needs global CSS (`::selection`, code
blocks) will add it under `packages/components/src/foundations/`, imported from
`packages/components/src/index.css`.

### Screens

A **screen** is a real-world page (a login page, an application shell, a dashboard) taken from an
open-source project whose licence allows it and rebuilt **only with the components and tokens of
the design system**. Screens prove that components hold together, list what the system still
lacks (each screen's gaps, with their issues when some track them), and show the system on pages people recognise:

| Artifact | Path | Owns |
| --- | --- | --- |
| Screen | `apps/docs/screens/<source>/<block>.screen.mjs` | `meta` (name, section, description, changes from the original, design system gaps with their issues when some track them) and a pure `render()` that composes the components' own templates. |
| Source | `apps/docs/screens/<source>/source.json` + its licence file | Where the screens come from: project, url, repository, commit, licence and copyright, copied verbatim. Shown on every screen. |
| Layout | `apps/docs/screens/screens.css`, `apps/docs/screens/lib/` | Layout only, on semantic tokens; shared building blocks (shells, forms, charts). |

Screens are **consumers** of the design system, like the docs site: **every change to a component
or a token updates the screens that use it in the same change** (`agents/workflow.md`, `agents/impact.md`, `apps/docs/screens/AGENTS.md`).

Tokens form three tiers with a strict reference direction:

```
raw (hidden primitives)        <-  semantic (what components read)        <-  component (per part)
packages/tokens/src/raw/**         packages/tokens/src/semantic/**             packages/tokens/src/components/<id>.tokens.json
                                   packages/tokens/src/additions/semantic/**
```

Raw is the Figma library's color palettes and palette switch, which nobody reads directly. Semantic is
what components and the site read: the Figma library's mapped colors and its Dimension, Effect and
Typography scales (the library applies those directly; there is no semantic layer of sizes or
text styles on top of them), plus the few tokens the design system adds.

The raw and semantic tokens come from two places, kept apart (`agents/token-sources.md`): `packages/tokens/src/raw/`,
`packages/tokens/src/semantic/` and `packages/tokens/src/modes/dark/` are recreated from
the Figma library as it is (paths made valid, same values, same aliases, errors
included); `packages/tokens/src/additions/` and `packages/tokens/src/platforms/` hold the few
tokens the design system adds, and only those the library lacks to render the components.

`scripts/build-tokens.mjs` compiles the tiers to CSS custom properties in
`packages/tokens/dist/css/` (generated, not committed, never edited by hand), with an `index.css`
entry point importing every file in cascade order; Style Dictionary
(`packages/tokens/style-dictionary.config.mjs`) builds the published formats (CSS, Sass, JavaScript,
Android, Figma, Penpot, Tokens Studio, DTCG) next to it. The site in `apps/docs/` is a **viewer**: it
renders what the four artifacts say and must never encode design knowledge of its own. It is also
**built with the design system**: its chrome reads semantic tokens only and renders the
design system's components wherever it shows a control they cover, so a new token or a new
component can change how the docs look (`apps/docs/AGENTS.md`, enforced by `pnpm validate`).

### Platforms

Everything above is written once for every platform. `packages/components/specs/platforms.json` names the
platforms (`web`, `ios`, `android`, `desktop`) and the input modalities (`pointer`, `touch`,
`keyboard`). A state, an example, a keyboard entry, an accessibility guideline or a content
rule carries an optional `platforms` list when it applies to some platforms only; a state
carries `inputs` when only some inputs produce it (hover needs a pointer, focus-visible a
keyboard). Docs scope a paragraph with a `### <Platform name>` sub-heading. Raw and semantic
tokens may be overridden per platform in `packages/tokens/src/platforms/<id>/`; the build resolves every
tier per platform and mode into `packages/tokens/dist/platforms/<id>/<mode>.tokens.json`, a DTCG tree any
technology can transform. Component tokens are never forked: the decisions are the same
everywhere, only the values differ. A technology (Flutter, React Native, Qt, JavaFX, a web
framework) is not a platform: it targets one or more platforms and consumes their outputs. The
web implementation is the only reference rendering; other platforms record their
implementation under `implementations.<id>`.

### Modes

A **mode** is a context in which the same token paths take other values: today the color
modes `light` (the default) and `dark`, declared under `modes` in `packages/tokens/tokens.config.json`. The
default mode is the base tiers; every other mode is an overlay of the semantic tier in
`packages/tokens/src/modes/<id>/` (same paths, aliasing raw tokens, no new path). Component tokens are never
forked per mode either: a component's color decisions hold in every mode, only the semantic
colors they alias change. Each mode carries a `scheme` (`light` or `dark`) that tells every
technology which system appearance selects it. Modes and platforms combine: every platform has
one resolved tree per mode; a token varies per platform or per mode, never both. On the web, the
`data-theme` attribute sets the mode of an element and its subtree: `light`, `dark`, or `auto`
(follows `prefers-color-scheme`); without it, the default mode applies (`agents/conventions.md`).

## Repository map

```
AGENTS.md                      the agent guide (rendered on the site's "How it works" page)
agents/                        the topic guides AGENTS.md routes to
CLAUDE.md                      imports AGENTS.md
.claude/skills/                agent skills for recurring workflows
.githooks/commit-msg           Conventional Commits check, installed by pnpm install
.github/workflows/             CI (check, commits, impact, build) and the npm release workflow
package.json                   pnpm scripts (AGENTS.md "Commands"); pnpm workspace: packages/* and apps/*
scripts/                       build-tokens, validate, impact, specs-bridge, new-component, commit-lint, figma-library, tests -> scripts/AGENTS.md
  scripts/lib/paths.mjs        the layout map every script and the docs site read their paths from
packages/tokens/               @quantum-ds/tokens -> packages/tokens/AGENTS.md
  tokens.config.json           tiers, platforms, modes, outputs, syntax theme
  src/raw, src/semantic        recreated from the Figma library (agents/token-sources.md)
  src/additions/               raw, semantic and mode tokens the design system adds
  src/components/<id>.tokens.json  component tokens
  src/platforms/<id>/          per-platform overrides of raw and semantic tokens
  src/modes/<id>/              per-mode overrides of semantic tokens (dark)
  style-dictionary.config.mjs  the distribution formats (Style Dictionary)
  dist/                        GENERATED, not committed (pnpm tokens:build)
  dist/css/                    GENERATED CSS custom properties: raw.css, semantic.css, components/<id>.css, index.css (entry point)
  dist/platforms/<id>/<mode>.tokens.json  GENERATED resolved DTCG tree per platform and mode
  dist/shiki-theme.json        GENERATED syntax highlighting theme (Code foundation)
  dist/tokens*.css, *.scss, tokens-es6*, variables-css.js, resources*.xml, figma/, penpot/, tokens_studio/, dtcg/
                               GENERATED distribution formats (style-dictionary.config.mjs)
packages/components/           @quantum-ds/components (publishes specs/ only) -> packages/components/AGENTS.md
  specs/                       component.schema.json + one spec per component -> packages/components/specs/AGENTS.md
    specs/foundations/         global specifications shared by every component, foundation.schema.json
    specs/a11y/                accessibility registry: trusted sources, WCAG 2.2 (generated), role profiles
    specs/platforms.json       platform and input vocabulary
  dist/                        GENERATED, not committed: the published specs (pnpm components:build)
  src/                         web reference implementation, not published (the docs site imports it by relative path)
  src/index.css                entry point of the vanilla CSS reference implementation (fonts, foundations, components)
  src/fonts.css                webfonts named by the font-family tokens (Google Fonts)
  src/foundations/             global CSS of a foundation (code.css)
  src/components/<id>/         hand-written CSS + HTML template
  src/lib/template-utils.mjs   escaping helpers + icon ligatures
apps/docs/                     the docs site (Astro) -> apps/docs/AGENTS.md
  content/components/, content/foundations/   one Markdown page per component and foundation -> apps/docs/content/AGENTS.md
  screens/                     real-world screens built with the design system, their sources and licences -> apps/docs/screens/AGENTS.md
  src/                         the viewer: pages, components, lib, styles
```
