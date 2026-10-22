---
name: figma-alignment
description: Compare a component with its Figma export (raw_content/components/<id>-variants-raw.json, made with figma-cli), list every difference as the TODO of a draft pull request, decide them with the team one step at a time, and finish with an upstream-figma-ds issue so the Figma library converges. Use when the user adds a component export, asks to align or improve a component from Figma, or continues such a pull request.
---

# Align a component with its Figma export

The method of `agents/workflow.md` ("Compare a component with its Figma export") and `agents/token-sources.md`
("Component exports"), run as a step-by-step pull request (skill `stepwise-pr`) with a review
sheet per question (skill `review-sheet`). Reference run: an earlier step-by-step pull request
(Button and Icon button) and its closing issue in the issue backlog.

## Ground rules (write them in the pull request's "Why")

- **Variants** (axes, option names, defaults): the repository is the reference.
- **Rendering**: the export is the candidate. The team decides each difference.
- **Raw values** in the export map to the semantic token that carries them. Values a couple of
  RGB units apart (about 3 or less per channel) are export noise and count as matching; say so in
  "What already matches".
- **Tokens**: change only the component's tokens (add, update, delete). Never raw or semantic
  tokens. A new addition (`packages/tokens/src/additions/`) is asked for explicitly and confirmed before it is
  written, even when an option mentions it; prefer options that need none.
- **Mirrors**: a component that renders the same as this one (`scripts/lib/mirrors.mjs`: the Icon
  button mirrors the Button) changes in the same step, or `pnpm validate` fails.
- **Accessibility** wins over the export: a Figma value that breaks WCAG 2.2 AA (target size
  2.5.8, contrast 1.4.3 / 1.4.11, focus 2.4.7) is shown, with the criterion and its source, and a
  compliant alternative is recommended.

## 1. Set up

1. Copy the export to `raw_content/components/<id>-variants-raw.json` in the worktree (from the
   main checkout or a download): git ignores `raw_content/`, so a new worktree starts without it.
   It is read-only, local and never committed; the pull request and the issue cite it as "the
   Figma prototype", never by path (`agents/token-sources.md`).
2. Worktree, branch `feat/<id>-improvements`, draft pull request (`stepwise-pr` §1).
3. Read the export against the spec, the component tokens (resolved:
   `packages/tokens/dist/platforms/ios/light.tokens.json` carries resolved values and each alias in
   the token's `$extensions` entry, keyed by `EXT` in `scripts/lib/dtcg.mjs`) and the CSS:
   - variant properties and their defaults;
   - per variant: height, padding (with and without icon), gap, radius, border width, icon size;
   - per variant: fill, stroke and label colors in every state;
   - label typography (size, line height, letter spacing, weight);
   - the focus variant (ring width, color, offset);
   - variants the repository models differently (`icon=only` became the Icon button component).
   A script beats reading the JSON by eye: [reference/button-figmadiff.py](reference/button-figmadiff.py)
   compares every color of the `medium` variants with the resolved light tokens and prints the
   differences above the noise threshold; adapt its part and property names to the component.
4. Write the TODO, one step per difference, in an order where earlier answers do not get undone
   by later ones: dimensions (height, padding, gap, icon size, typography), then colors (border
   across states, fills, labels, ghost and disabled), then the focus ring, then variants modeled
   differently, then defaults, and last **Report back to Figma**. Write "What already matches".
   Stop and let the team read the plan.

## 2. Each step

`stepwise-pr` §3. Specific to the export:

- Each review sheet has a **Figma** row drawn from the export's own values (the export has no
  dark mode: say so on dark surfaces), a **today** row and the options.
- Every decision that differs from Figma adds a line to **Departures from Figma so far** in the
  description: the repository value, the Figma value, the token, the decision id.
- A "keep the repository's rule" outcome is still a decision (`decisions[]`, changelog, commit):
  it records the departure.
- Problems with no answer inside the step (a missing palette step, a system-wide length rule, a
  component next to this one that no longer lines up) become issues at once (skill `backlog`),
  labelled `upstream-figma-ds` when the Figma library or its primitives must change.

## 3. Report back to Figma (last step)

1. Recheck variant by variant: every color of the final repository (resolved, light) against
   the export, and every dimension, so that the list is complete and not just the sum of the steps.
2. Open one issue labelled `upstream-figma-ds`, `components` and the component labels, and `nextgen` when
   the work concerns Quantum NextGen (skill `backlog`),
   written for the Figma designer:
   - each departure: Figma value, repository value, the Figma variable to bind (token path
     written with `/`, e.g. `global/text/on-base/neutral/primary`), the decision id;
   - the repository additions the Figma library lacks (variables to create);
   - the export noise to ignore;
   - variants the repository models as another component.
3. Link it under Follow-ups, then close the pull request as in `stepwise-pr` §4.
