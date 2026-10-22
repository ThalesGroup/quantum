---
name: backlog
description: Keep the ThalesGroup/quantum issue backlog useful - file a standalone issue for anything out of scope (with labels, measurements and screenshots attached), turn the findings of a merged study pull request into issues, bring every open issue up to date after a structural merge, or re-label the backlog. Use when the user says "create an issue", "fill an issue", "follow-up", "upstream Figma", "sync the backlog", or when out-of-scope work comes up (agents/git.md).
---

# Backlog

Rules from `agents/git.md`: issues go to `ThalesGroup/quantum` only (always `--repo
ThalesGroup/quantum`), labels come from the repository's existing set, and out-of-scope work becomes an
issue right away instead of being done or left in the chat.

## Labels

`gh label list --repo ThalesGroup/quantum --limit 100`, then every label of that set that fits:

- **Kind:** `bug`, `enhancement` or `question`. Commit types (`fix`, `feat`…) are for pull requests only,
  `docs` aside as an area.
- **Area**, every one concerned: `site` (the docs website's code, its screens included),
  `content` (its guidance pages), `tokens`, `components`, `docs` (README, CONTRIBUTING,
  guides, skills) (`agents/git.md` "Labels").
- **One label per component id** (`button`, `icon-button`, `text-field`…), when the set has them: every component
  concerned. A component that mirrors another (`scripts/lib/mirrors.mjs`) gets its label too.
- **One label per platform** (`web`, `ios`, `android`, `desktop`), when the set has them and the issue is scoped to it.
- **Upstream Figma work** (`upstream-figma-ds`, when the set has it): work for the Figma designer (bind a variable, redefine a primitive,
  backport a decision to the library).
- **Quantum NextGen** (`nextgen`): always, on every issue that concerns it (the `nextgen` branch,
  its packages, specs, docs site, guides or skills).

Never invent a label; a label the set lacks is not applied; create one only when the user asks.
`nextgen` is the exception: when the set lacks it, ask the user to create it instead of leaving it out.

## A new issue

Write the body to a file in the scratchpad, then
`gh issue create --repo ThalesGroup/quantum --title "<Component or area>: <problem>" --body-file body.md --label a --label b`.

The body stands alone for someone who never saw the chat:

- **Context:** where it shows (component, variant × state × mode, page URL path), how it was found.
- **Problem**, measured: values and tokens (`global.bg.subtle.brand.default` → Brand 950 `#…`),
  contrast ratios in every mode against the real surfaces, the WCAG criterion with its link (`agents/accessibility.md`).
- **Ideas:** the user's proposal first, as stated, then other possibilities with their
  trade-offs. When the palette lacks a value, give an approximate hint and say a designer must
  define the real one.
- **Artifacts involved:** paths (spec, tokens, CSS, docs, screens).
- **Expected:** what closes the issue.
- **Screenshots** when the problem is visual (skill `review-sheet` for the page and `shot.sh`):
  attach them, `--attach './dark.png#Subtle brand button, dark mode: default, hover, active'`;
  a body reference `![alt](./dark.png)` is rewritten to the uploaded asset. Never push images
  to a branch. Then check the issue renders (`gh issue view <n> --repo ThalesGroup/quantum`).

Report the issue URL and its labels. Add it to the Follow-ups of the current pull request.

## Findings of a study pull request

A study (a batch of components, an audit) keeps its findings in the pull request description
while it is open: numbered, no issues. Once it is merged:

1. One issue per finding or question, and one per item left out (each left-out component).
   Search first (`gh issue list --repo ThalesGroup/quantum --search "<words>" --state all`): when
   an issue already covers it, comment there instead.
2. Each body quotes the finding's context, so it stands alone; link the merged pull request.
3. Comment on the pull request with the mapping (finding number → issue), and report it.

## Sync the backlog after a structural merge

When a merged change moves the ground under the backlog (a token migration, a renamed concept):

1. Read every open issue (`gh issue list --repo ThalesGroup/quantum --state open --limit 200 --json number,title,body`).
2. For each one the change affects, put a dated block at the top of the body, keeping the rest:
   `> **Update YYYY-MM-DD, after #NN:** what changed for this issue (new token names, what is now done, what still applies).`
3. Close the issues the change resolves, with a comment naming the pull request.
4. Report the list: updated, closed, untouched.

## Re-label the backlog

Read every issue and pull request, apply every label that fits (above), and check the platform
and component labels in particular. Report what changed per issue.
