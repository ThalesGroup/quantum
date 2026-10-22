---
name: stepwise-pr
description: Run a long piece of work as a draft pull request whose description is the plan and the memory (a TODO list of steps, decided outcomes, ground rules), so that every step can be done in a fresh session. Use when the user wants to go through differences, decisions or improvements "one step at a time", asks to "continue step N" of a pull request, or starts work that needs several team decisions in a row.
---

# Step-by-step pull request

A piece of work that needs a series of team decisions (aligning a component with its Figma
export, reworking a component, going through review findings) runs as **one draft pull
request**, one step at a time. The pull request description is the only state a new session
needs: anyone, or any new session, can pick up the next step by reading it. This keeps every
session short and cheap, and keeps the history readable on GitHub.

Proven on an earlier step-by-step pull request (the button against its Figma export, 13 steps
across four sessions). Read the description of such a pull request for a full example:
`gh pr view <n> --repo ThalesGroup/quantum --json body -q .body`.

Repository rules still apply in full: `agents/workflow.md` (decision loop), `agents/impact.md` (impact), `agents/accessibility.md`
(accessibility sources), `agents/git.md` (branches, commits, pull requests).

## 1. Set up (first session only)

1. Create a worktree and a branch from the latest `origin/main`, named after the main commit
   to come (`feat/button-improvements`):
   `git fetch origin && git worktree add .claude/worktrees/<name> -b <branch> origin/main`.
   Run `pnpm install` in it.
2. Put any input material in place (an export goes to `raw_content/components/`, `agents/token-sources.md`).
3. Push and open a **draft** pull request right away, even before the first change, with the
   labels that fit, `nextgen` always when the work concerns Quantum NextGen
   (`gh pr create --draft --repo ThalesGroup/quantum …`).
4. Start a preview of the worktree (skill `worktree-preview`) so steps can be shown.
5. Write the plan into the description (template below), then stop and let the team read it.

## 2. The description is the state

Keep these sections, in this order, and rewrite them at the end of every step:

```markdown
> **Status:** steps 1 to 4 decided; next: step 5 (label typography).

## Why
The request and its source, in two sentences.
Ground rules for every step: what is the reference for what (e.g. variants: the repository;
rendering: the export), which tokens may change (e.g. component tokens only), what needs asking first.

## What already matches
What needs no step, including values that differ only by export noise.

## TODO: the differences, one step each
- [x] **1. Height.** Reference 20 / 28 / 36 / 44 px, repository 24 / 32 / 40 / 48 px.
  **Decided:** 24 / 28 / 36 / 44 px (`space.24` / …), why in one sentence, decision id.
- [ ] **2. Padding next to an icon.** Reference …, repository …
- [ ] **N. Report back** (the closing step: issue, docs, ready for review).

## What changes so far
Per step: decision ids, spec version, tokens (paths, old → new aliases), CSS/template, docs,
contrast ratios (`agents/workflow.md` step 8), what was measured unchanged.

## Departures from <reference> so far
Every point where the decision differs from the reference, with both values.
(Only when there is a reference to report back to.)

## Left unchanged on purpose
## How to review
Newest step first: the exact pages, tables, states and modes, and the judgement calls.
## Checks
## Follow-ups
Issues opened along the way.
```

- A step found during review gets its own entry (`3b. Block padding (added during review)`).
- A step's outcome says **Decided** with the values and tokens, never just "done".
- Keep history honest: when a commit is reverted by the next one, say so in "What changes".

## 3. One step

1. **Resume.** In a new session, read only what the step needs: the pull request description,
   `git -C <worktree> log --oneline origin/main..`, the files the step touches. Check the
   worktree preview is up (skill `worktree-preview`) and give its URL.
2. **Show.** Build a review sheet per question (skill `review-sheet`): before, after (each
   option), the reference, on the surfaces and in the modes where it matters, plus the real
   site pages and screens where the change shows.
3. **Ask one question at a time** (format in the `review-sheet` skill), with a recommendation.
   Wait for the answer. Follow-up requests on the sheet (another variant, a toggle, a
   checkerboard) come before the answer: update the sheet and re-ask.
4. **Apply** the answer through the decision loop (`agents/workflow.md` "Decisions"): decision in
   `decisions[]`, tokens, `pnpm tokens:build`, spec version + changelog, CSS, docs, mirrors
   (`scripts/lib/mirrors.mjs`), screens, contrast in every mode.
5. **Verify:** `pnpm check`, `pnpm impact --base origin/main`, and look at the site.
6. **Commit** the step alone: `feat(<component>): <decision as a noun phrase>` (`agents/git.md`); a step
   that records a "keep as is" decision is still a commit (decision + changelog).
7. **Record** on GitHub:
   - Rewrite the description (status line, tick the box with the outcome, "What changes",
     "Departures", "How to review"): `gh pr edit <n> --repo ThalesGroup/quantum --body-file <file>`.
     Write the body file from `gh pr view <n> --json body -q .body`, never from memory.
   - Post one comment for the step with its before and after screenshots and the question
     asked, so the decision can be reviewed later without the chat:
     `gh pr comment <n> --repo ThalesGroup/quantum --body-file step-N.md --attach './before.png#Step N before' --attach './after.png#Step N after'`.
   - Push.
8. **Report** in the chat: what was decided, the commit, contrast ratios, and the exact line to
   start the next step in a new session:
   `Continue step N+1 from https://github.com/ThalesGroup/quantum/pull/<n>`.

Anything out of scope that comes up becomes an issue at once (skill `backlog`), listed under
Follow-ups. A rule the user states during a step that holds beyond it (a token policy, a way of
asking) goes to memory and, when it is a repository rule, to the guide in `agents/` (or the directory `AGENTS.md`) that owns it, in the same pull request.

## 4. Close

1. The last step reports back (for a reference such as Figma: an issue listing every departure,
   skill `figma-alignment`).
2. Document anything new the work introduced (directories, scripts, rules) in the
   guides of `agents/` and the directory `AGENTS.md` files.
3. Status line: "Every step is decided". Final `pnpm check` and `pnpm impact --base origin/main`.
4. Mark it ready: `gh pr ready <n> --repo ThalesGroup/quantum`. Never merge it.
5. Report: branch, commits, pull request link, labels, and the "How to review" list.
6. Keep the worktree until the merge (its `build/review/` holds the sheets); after the merge,
   offer to remove it.
