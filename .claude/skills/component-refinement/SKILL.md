---
name: component-refinement
description: Refine an existing component end to end - challenge its component tokens against the semantic tier, its accessibility contract and its platform agnosticity, starting from its Figma export when there is one, and decide every finding with the team one step at a time in a draft pull request, down to the Figma blueprint and the framework themes. Use when the user asks to refine, review, rework, challenge or improve a component (not only align it with Figma), or continues such a pull request ("continue step N").
---

# Refine a component

A refinement goes through **everything** a component is made of and asks, for each part, whether
the current answer is still the right one: the tokens, the spec and its accessibility contract,
how it holds on every platform, the web implementation, the docs, the Figma blueprint, the
framework themes and the screens. It runs as a step-by-step pull request (skill `stepwise-pr`),
one question per step, each shown on a review sheet (skill `review-sheet`). When the component
has a Figma export, the comparison with it (skill `figma-alignment`) is part of the run.

Repository rules apply in full: `agents/workflow.md` (decision loop, definition of done),
`agents/impact.md`, `agents/accessibility.md`, `agents/conventions.md`, `agents/git.md`, and the
directory `AGENTS.md` of every directory touched.

## Ground rules (write them in the pull request's "Why")

- **Agnostic first.** Every finding is asked for every platform (`web`, `ios`, `android`,
  `desktop`): a statement holds everywhere unless a platform's own trusted source says it
  differs (`agents/conventions.md` "Platforms and inputs"). The web CSS is a reference rendering,
  not the deliverable: a question is never "how does the CSS do it" but "what is the decision",
  then how each platform carries it.
- **Tokens.** Every component token aliases the semantic token whose *meaning* fits the part,
  not just its value. Change only the component's tokens (add, repoint, delete). Never raw or
  semantic tokens, never an addition, unless the team asks: what the semantic tier lacks becomes
  an issue (skill `backlog`).
- **Accessibility wins.** WCAG 2.2 AA in every mode, on every surface level the component can
  sit on, on every platform. A failure is shown with its criterion and the source you opened, and
  a compliant option is recommended.
- **The repository is the reference for the variants** (axes, option names, defaults); a Figma
  export, when there is one, is the candidate for the rendering.
- **One question at a time**, with its context, a review sheet when rendering is involved, and a
  recommendation. Nothing is applied before the answer.

## 1. Set up (first session)

1. **Input.** Look for the export in `raw_content/components/<id>-variants-raw.json` (main
   checkout, worktrees). When it is missing, ask for it once (one question: add it, or go on
   without it). Without it, the references are the foundations the component follows, the
   semantic tier and the platforms' guidelines; the export can still come later as its own step.
2. **Branch.** Worktree and branch `feat/<id>-improvements` from the branch the component lives
   on (`origin/nextgen` for Quantum NextGen, `origin/main` otherwise), `pnpm install`,
   `pnpm tokens:build`. The pull request targets that same branch.
3. **Audit** (the checklist below), with measurements, never by eye. Record what already holds.
4. **Plan.** Write one step per finding in an order where later answers do not undo earlier
   ones: scale and dimensions, then colors and contrast, then the accessibility contract, then
   platform behaviours, then the spec and docs fixes, then the Figma blueprint, then the
   framework themes, and last the closing step. Push, open the draft pull request with the
   plan as its description (`stepwise-pr` §2), with the labels that fit and `nextgen` when it
   applies.
5. Ask the first step's question. Then follow `stepwise-pr` §3 for every step.

## 2. The audit checklist

For each item: today's value and the token that carries it, what the foundations and the
semantic tier offer, and whether it holds on every platform and in every mode.

- **Properties and options.** Is every option used, is one missing that the semantic tier
  already offers (an intent, a size step), do the names match the sibling components (Badge,
  Button)? Is the default right?
- **Component tokens.** For every token: the semantic token it aliases, whether that token's
  role fits the part (an `icon` role for a glyph, `on-base` for a glyph on a level), tokens that
  nothing reads, values hard-coded in the CSS that should be tokens, tokens the CSS reads that
  are not in the spec.
- **Contrast** of every color on every surface level (0 to 3 and sunken), in every mode and
  platform: [reference/contrast-levels.mjs](reference/contrast-levels.mjs)
  (`node .claude/skills/component-refinement/reference/contrast-levels.mjs . '^<id>\.' 3`).
  The same script lists candidate semantic tokens (`'^global\..*warning'`) for an option.
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
- **Figma blueprint** (`packages/figma/src/blueprints/<id>.mjs`): every slot bound or listed in
  `notDrawn`, open design tool issues touching it (`gh issue list --label figma`).
- **Framework themes** (`packages/*-theme/src/mapping.mjs`): the equivalence or the reason for
  none, and whether a decision of the run gives the framework something to map.
- **Screens** rendering the component (`pnpm impact --files <its files>` lists them).

## 3. Each step

`stepwise-pr` §3, with these additions:

- A step that changes nothing still ends in a decision ("keep", with the reason) recorded in
  `decisions[]`, or in "Left unchanged on purpose" when it is not a design decision.
- A spec or docs correction that changes no decision is a `fix` (patch version) and needs no
  question; list it in the plan so the team sees it.
- Every step that touches the structure updates the Figma blueprint in the same commit, and
  every step that renames or removes something runs the theme tests in the same commit.
- Whatever the run reveals beyond the component (a foundation rule, a semantic token, a
  sibling component) becomes an issue at once, linked under Follow-ups.

## 4. Close

1. Recheck the whole component against the audit checklist: the final list of what changed
   and of what was kept on purpose.
2. With an export: the `upstream-figma-ds` issue of `figma-alignment` §3. Without one: an
   issue for every limit of the Figma library or the semantic tier the run met.
3. `pnpm figma:export <id>` and `pnpm penpot:export <id>` build; rebuild the themes and look at
   their demos in light and dark (`pnpm themes:demo`).
4. `stepwise-pr` §4: status line, checks, ready for review.
5. **Improve this skill**: add what went wrong or was missing to "Lessons learned" below, and fix
   the step it concerns (here, or in `stepwise-pr`, `review-sheet`, `figma-alignment`), in the
   same pull request.

## Lessons learned

Newest first. Each entry: date, component, what was off, what changed in the process.

- **2026-11-05, Icon.** No Figma export existed: the skill now asks once and names the
  references to use without one. `stepwise-pr` branched from `origin/main`, but NextGen
  components live on `nextgen`: branch from, and target, the branch the component lives on. The
  resolved token trees exist only for iOS and Android (`packages/tokens/dist/platforms/`); the
  web reads the base tiers, and the platform overlays change only typography today, so the
  colors measured on either tree are the web's too.
