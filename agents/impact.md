# Change impact

What else to update or review when an artifact changes. Part of the agent guide: start from the root `AGENTS.md`.

## Change impact

Every change is propagated to everything linked to it, in proportion to its impact. `pnpm
impact` computes the links from the diff (rules in the `LINKS` table of `scripts/impact.mjs`)
and prints a checklist; `pnpm check` then proves the mechanical part of the consistency.

| When this changes | Also update or review |
| --- | --- |
| Spec | Component tokens, CSS, template, docs; docs of components listing it in `related`; the spec and tokens of a component that renders the same as it (`MIRRORS` in `scripts/lib/mirrors.mjs`: the icon button mirrors the button); the screens rendering it. Version + changelog; `decisions[]` when a decision was stated. Its Figma blueprint (`packages/figma/src/blueprints/<id>.mjs`, which the Penpot plugin draws too) when a part, property or state changes. A **new** component: its starter Figma blueprint, rewritten from the CSS and template; the site controls it covers (`apps/docs/src/`, `apps/docs/AGENTS.md` table) and the screen gaps it fills (`apps/docs/screens/`). |
| Component tokens | `pnpm tokens:build`; CSS if variables appear or disappear; the Figma blueprint, which binds every slot or lists it in `notDrawn` (`pnpm test`); docs if a meaning changed; the tokens of a component that renders the same as it (`pnpm validate` fails until they resolve to the same values); the screens rendering it. Version + changelog. |
| CSS or template | Spec (version, changelog, `implementations.web`); docs if behaviour or rendering guidance changed; the Figma blueprint, whose layer tree follows the CSS structure; the CSS of a component that renders the same as it; the screens rendering it (a template API change is applied to each of them). |
| Docs | The spec must say the same thing; every WCAG criterion the docs rely on is cited in the spec. |
| Foundation spec | Its docs page; the semantic tokens it owns; the docs of every component following it. Version + changelog (`pnpm impact` fails otherwise); `decisions[]` when a decision was stated. |
| Foundation docs | The foundation spec must say the same thing; every WCAG criterion linked is cited in it. |
| Foundation code sample (`packages/components/specs/foundations/<id>/`) | The foundation spec: version + changelog if what the sample shows changed. |
| Raw or semantic tokens | `pnpm tokens:build`; `packages/components/src/fonts.css` if a font family changed; every component aliasing them (directly or through semantic aliases): version if its appearance changes, docs if contrast or emphasis changes; `apps/docs/src/styles/site.css` when the docs chrome reads a changed semantic token (check the site in every mode); the screens rendering a component that aliases them, and `apps/docs/screens/screens.css` when it reads them; every foundation owning, measuring or presenting them (contrast recomputed by `pnpm validate`, version if it changes; its specimens redraw by themselves, a token no foundation presents is a warning). |
| Platform overlay (`packages/tokens/src/platforms/<id>/`) | `pnpm tokens:build` (`packages/tokens/dist/platforms/<id>/*.tokens.json`); every component aliasing the overridden tokens: version if its appearance on that platform changes, docs if the platform guidance changed. |
| Mode overlay (`packages/tokens/src/modes/<id>/`) | `pnpm tokens:build` (`packages/tokens/dist/css/semantic.css`, `packages/tokens/dist/platforms/*/<id>.tokens.json`); every component aliasing the overridden tokens: contrast in that mode recomputed, version + changelog with the ratios, docs if the mode guidance changed; the screens using them, in that mode. |
| Distribution formats (`packages/tokens/style-dictionary.config.mjs`) | `pnpm tokens:build` and a look at the changed outputs in `packages/tokens/dist/`; the list of outputs in `packages/tokens/README.md`, "Distribution formats" in `packages/tokens/AGENTS.md`, the package changelog. |
| Screens layout or helpers (`apps/docs/screens/screens.css`, `apps/docs/screens/lib/`) | Every screen: look at it on the site at every frame width and in every mode. |
| Screen source (`apps/docs/screens/<source>/source.json`) | Its licence file and every screen of the source (their pages show the source, licence and commit). |
| `packages/components/specs/platforms.json` | Schema enums (`platform`, `input`), `packages/tokens/tokens.config.json` platform ids, `apps/docs/src/lib/platforms.ts`, `agents/conventions.md` "Platforms and inputs", `packages/components/specs/AGENTS.md`. |
| Schema | Every spec, `apps/docs/src/content.config.ts`, the scaffold, the Specs bridge, the validator, `packages/components/specs/AGENTS.md`; the foundation schema reuses the component schema's definitions. |
| `packages/components/specs/a11y/` registry | Every spec and docs page citing it; the scaffold (role profiles); `packages/components/specs/AGENTS.md`. |
| `packages/components/src/lib/template-utils.mjs` | Every template, every screen. |
| Scripts or libraries | Their tests, `scripts/AGENTS.md`, the root `AGENTS.md` or the `agents/` guide when a command or obligation changes, the site when it uses the library. |
| `package.json` scripts | `AGENTS.md` "Commands" and `.github/workflows/ci.yml`. |
| A guide in `agents/` | The root `AGENTS.md` ("Read before acting" and the rules it summarises); the skills in `.claude/skills/` that cite it by path or section name. |
| A skill (`.claude/skills/<name>/SKILL.md`) | The "Skills" table of the root `AGENTS.md`. |

`pnpm impact` fails when a component's spec, tokens, CSS or template, or a foundation spec,
changed and its version did not move. Every other unchanged linked artifact is a review item: update it or say in the
report why it stays as it is. In CI it runs on pull requests against the target branch.
