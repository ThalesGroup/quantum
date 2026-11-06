---
name: component-refinement
description: Refine an existing component end to end - challenge its component tokens against the semantic tier, its accessibility contract and its platform agnosticity, compare it with its Figma export (raw_content/components/<id>-variants-raw.json) when there is one, and decide every finding with the team one step at a time in a draft pull request, down to the Figma blueprint and the framework themes, closing with an upstream-figma-ds issue when Figma must converge. Use when the user asks to refine, review, rework, challenge or improve a component, to align or compare it with Figma, adds a component export, or continues such a pull request ("continue step N").
---

# Refine a component

A refinement goes through **everything** a component is made of and asks, for each part, whether
the current answer is still the right one: the tokens, the spec and its accessibility contract,
how it holds on every platform, the web implementation, the docs, the Figma blueprint, the
framework themes and the screens. When the component has a Figma export, every difference with
it is part of the run, and the run ends by reporting the departures back to Figma. It runs as a
step-by-step pull request (skill `stepwise-pr`), one question per step, each shown on a review
sheet (skill `review-sheet`). Reference runs: an earlier step-by-step pull request (Button and
Icon button against their Figma export) and ThalesGroup/quantum#62 (Icon, without an export).

Repository rules apply in full: `agents/workflow.md` (decision loop, definition of done),
`agents/impact.md`, `agents/accessibility.md`, `agents/conventions.md`, `agents/git.md`,
`agents/token-sources.md` ("Component exports"), and the directory `AGENTS.md` of every
directory touched.

## Ground rules (write them in the pull request's "Why")

- **Agnostic first.** Every finding is asked for every platform (`web`, `ios`, `android`,
  `desktop`): a statement holds everywhere unless a platform's own trusted source says it
  differs (`agents/conventions.md` "Platforms and inputs"). The web CSS is a reference rendering,
  not the deliverable: a question is never "how does the CSS do it" but "what is the decision",
  then how each platform carries it.
- **Variants** (axes, option names, defaults): the repository is the reference. **Rendering**:
  the export, when there is one, is the candidate; the team decides each difference.
- **Tokens.** Every component token aliases the semantic token whose *meaning* fits the part,
  not just its value. Change only the component's tokens (add, repoint, delete). Never raw or
  semantic tokens. An addition (`packages/tokens/src/additions/`) is asked for explicitly and
  confirmed before it is written, even when an option mentions it; prefer options that need
  none. What the semantic tier lacks becomes an issue (skill `backlog`), unless the team
  asks for it in this run.
- **Raw values** of an export map to the semantic token that carries them. Values a couple of
  RGB units apart (about 3 or less per channel) are export noise and count as matching; say so
  in "What already matches".
- **Mirrors**: a component that renders the same as this one (`scripts/lib/mirrors.mjs`: the
  Icon button mirrors the Button) changes in the same step, or `pnpm validate` fails.
- **Accessibility wins** over the existing values and over the export: WCAG 2.2 AA in every mode,
  on every surface level the component can sit on, on every platform. A failure (target size
  2.5.8, contrast 1.4.3 / 1.4.11, focus 2.4.7…) is shown with its criterion and the source you
  opened, and a compliant option is recommended.
- **One question at a time**, with its context, a review sheet when rendering is involved, and a
  recommendation. Nothing is applied before the answer.

## 1. Set up (first session)

1. **Input.** Look for the export in `raw_content/components/<id>-variants-raw.json` (main
   checkout, worktrees). When it is missing, ask for it once (one question: add it, or go on
   without it). Without it, the references are the foundations the component follows, the
   semantic tier and the platforms' guidelines; the export can still come later as its own step.
   Git ignores `raw_content/`, so copy the export into the new worktree. It is read-only, local
   and never committed; the pull request and the issues cite it as "the Figma prototype", never
   by path (`agents/token-sources.md`).
2. **Branch.** Worktree and branch `feat/<id>-improvements` from the branch the component lives
   on (`origin/nextgen` for Quantum NextGen, `origin/main` otherwise), `pnpm install`,
   `pnpm tokens:build`. The pull request targets that same branch.
3. **Audit** (the checklist below), with measurements and scripts, never by eye. Record what
   already holds.
4. **Plan.** One step per finding, in an order where later answers do not undo earlier ones:
   dimensions and scale (height, padding, gap, icon size, typography), then colors and contrast
   (borders across states, fills, labels, ghost and disabled), then the focus ring, then the
   accessibility contract, then platform behaviours, then variants the repository models
   differently, then defaults, then the spec and docs fixes, then the Figma blueprint, then the
   framework themes, and last the closing step. Write "What already matches". Push, open the
   draft pull request with the plan as its description (`stepwise-pr` §2), with the labels that
   fit and `nextgen` when it applies; with an export, keep a **Departures from Figma so far**
   section.
5. Stop and let the team read the plan; then ask the first step's question, and follow
   `stepwise-pr` §3 for every step.

## 2. The audit checklist

For each item: today's value and the token that carries it, what the foundations and the
semantic tier offer, the export's value when there is one, and whether it holds on every
platform and in every mode.

- **Properties and options.** Is every option used, is one missing that the semantic tier
  already offers (an intent, a size step), do the names match the sibling components (Badge,
  Button)? Is the default right? Variants the repository models differently (the export's
  `icon=only` became the Icon button component).
- **Dimensions** per size: height, padding (with and without icon), gap, radius, border width,
  icon size, typography of the label (size, line height, letter spacing, weight).
- **Component tokens.** For every token: the semantic token it aliases, whether that token's
  role fits the part (an `icon` role for a glyph, `on-base` for a glyph on a level), tokens that
  nothing reads, values hard-coded in the CSS that should be tokens, tokens the CSS reads that
  are not in the spec. Resolved values and aliases:
  `packages/tokens/dist/platforms/ios/light.tokens.json` (each alias in the token's
  `$extensions` entry, keyed by `EXT` in `scripts/lib/dtcg.mjs`).
- **Colors and contrast** of every fill, stroke and label in every state, on every surface level
  (0 to 3 and sunken), in every mode and platform:
  [reference/contrast-levels.mjs](reference/contrast-levels.mjs)
  (`node .claude/skills/component-refinement/reference/contrast-levels.mjs . '^<id>\.' 3`). The
  same script lists candidate semantic tokens (`'^global\..*warning'`) for an option. Against an
  export: [reference/button-figmadiff.py](reference/button-figmadiff.py) compares every color of
  the `medium` variants with the resolved light tokens and prints the differences above the noise
  threshold; adapt its part and property names to the component.
- **Focus ring** (width, color, offset) against the Focus foundation.
- **Accessibility contract** (`packages/components/specs/a11y/roles.json` profile, the spec's
  `accessibility`): name, role per platform, states announced, target size (2.5.8), focus
  (2.4.7), meaning by color alone (1.4.1), text resize (1.4.4) and reflow; every statement cited.
- **Platforms.** What each platform's guidelines say about this kind of component: scaling with
  the system text size (Dynamic Type, font scale), right-to-left mirroring, native controls, input
  methods (touch, pointer, keyboard). Platform-scoped guidelines cite that platform's source.
- **Web implementation.** CSS reading only component tokens, every option and state ruled,
  template defaults and fallbacks, attributes matching `implementations.web`.
- **Docs.** Tables and guidance in step with the spec, typos, the Accessibility section linking
  its sources, the platform sub-headings; the docs blueprint still telling the component apart.
- **Figma blueprint** (`packages/figma/src/blueprints/<id>.mjs`): exists (create it from the CSS
  and template when missing, `packages/figma/AGENTS.md`), every slot bound or listed in
  `notDrawn`, open design tool issues touching it (`gh issue list --label figma`).
- **Framework themes** (`packages/*-theme/src/mapping.mjs`): the equivalence or the reason for
  none, and whether a decision of the run gives the framework something to map.
- **Screens** rendering the component (`pnpm impact --files <its files>` lists them).

## 3. Each step

`stepwise-pr` §3, with these additions:

- With an export, each review sheet has a **Figma** row drawn from the export's own values (the
  export has no dark mode: say so on dark surfaces), a **today** row and the options. Every
  decision that differs from Figma adds a line to **Departures from Figma so far**: the
  repository value, the Figma value, the token, the decision id.
- A step that changes nothing still ends in a decision ("keep", with the reason) recorded in
  `decisions[]` (with an export, it records the departure), or in "Left unchanged on purpose"
  when it is not a design decision.
- A spec or docs correction that changes no decision is a `fix` (patch version) and needs no
  question; list it in the plan so the team sees it.
- Every step that touches the structure updates the Figma blueprint in the same commit, and
  every step that renames or removes something runs the theme tests in the same commit.
- Whatever the run reveals beyond the component (a foundation rule, a missing palette step, a
  semantic token, a sibling component that no longer lines up) is fixed in the run when it is
  related to a step and should be fixed right away: a step of its own after the one that found
  it (`1b`), no issue. A foundation that the step's decision makes out of date is always this
  case. The rest becomes an issue at once (skill `backlog`), labelled `upstream-figma-ds` when
  the Figma library or its primitives must change, and linked under Follow-ups; what the Figma
  library must change goes to the closing Figma issue.

## 4. Close

1. Recheck the whole component against the audit checklist, variant by variant (every color of
   the final repository, resolved, against the export when there is one, and every dimension):
   the final list of what changed and of what was kept on purpose, not just the sum of the steps.
2. **Report back to Figma.** One issue labelled `upstream-figma-ds`, `components`, the component
   labels and `nextgen` when it applies (skill `backlog`), written for the Figma designer:
   - each departure: Figma value, repository value, the Figma variable to bind (token path
     written with `/`, e.g. `global/text/on-base/neutral/primary`), the decision id;
   - the repository additions the Figma library lacks (variables to create);
   - the limits of the Figma library the run met (a value that fails WCAG in a mode);
   - with an export: the export noise to ignore and the variants the repository models as
     another component.
   Without an export, open it only when the run met such a limit or addition.
3. `pnpm figma:export <id>` and `pnpm penpot:export <id>` build: they give the Figma designer the
   result, bound to variables named after the token paths of the issue (`agents/token-sources.md`
   "Drawing a component in Figma"). Rebuild the themes and look at their demos in light and dark
   (`pnpm themes:demo`).
4. `stepwise-pr` §4: status line, checks, ready for review.
5. **Improve this skill**: add what went wrong or was missing to "Lessons learned" below, and fix
   the step it concerns (here, or in `stepwise-pr`, `review-sheet`), in the same pull request.

## Lessons learned

Newest first. Each entry: date, component, what was off, what changed in the process.

- **2026-11-05, Icon, step 4.** The first recommendation was to keep inheriting the text color
  (`currentColor`) on colored fills, because the icon roles of those fills resolve to the text
  roles almost everywhere. The team chose the icon roles (`global.icon.on-accent.*`, …): the
  semantic tier keeps them apart so they can differ, and they already do (warning). Weigh an
  option by the meaning of the role it reads, not by today's resolved value; equal values
  today are no reason to read another role. A component placed on fills it does not draw takes
  a `surface` property naming the fill (`base` by default). The site then drew those
  configurations on the page, where the glyph vanished (step 4b): look at every configuration a
  step adds on the site (examples, states matrix, playground) in the same step. The site now
  draws the fill paired with the role a rendering reads (`scripts/lib/backdrop.mjs`).

- **2026-11-05, Icon, steps 1 and 3.** Two findings tied to a step went to issues instead of
  being fixed: the foundations' icon sizes made out of date by step 1 (#63) and the warning
  text role failing next to the icon role fixed in step 3 (#64). The team then had them fixed
  in the pull request as steps 1b and 3b. A finding related to the work that should be fixed
  right away is a step of the run, not an issue; only what the run cannot fix becomes one.
- **2026-11-05, Icon, step 3.** `reference/contrast-levels.mjs` crashed on a pattern that also
  matched non-color tokens (`'^icon\.'` reaches the font family): it now skips them. When a
  semantic value fails WCAG and the team chooses to fix the value rather than repoint the
  component, the change goes to the mode or tier file with a `$description` naming the
  decision, the decision to the foundation that owns the token (Color), a contrast pair to that
  foundation so `pnpm validate` keeps checking it, and the departure to the closing Figma issue.
  (The Figma library's POC2 export then took the same dark value, #65: the departure was
  dropped on rebase. When a new export lands mid-run, rebase and drop what it already carries.)
- **2026-11-05, Icon.** A refinement skill was created while `figma-alignment` already covered
  the Figma part of it: `figma-alignment` is folded into this skill (one skill, with or without
  an export). Before creating a skill, read the existing ones end to end, not only their
  names. No Figma export existed: the skill now asks once and names the references to use
  without one. `stepwise-pr` branched from `origin/main`, but NextGen components live on
  `nextgen`: branch from, and target, the branch the component lives on. The resolved token
  trees exist only for iOS and Android (`packages/tokens/dist/platforms/`); the web reads the
  base tiers, and the platform overlays change only typography today, so the colors measured on
  either tree are the web's too.
