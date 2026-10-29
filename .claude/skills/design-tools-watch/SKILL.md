---
name: design-tools-watch
description: Review the new releases of the design tools the repository exports to (Figma, Penpot, Tokens Studio) and of the DTCG format, against what the token formats of @quantum-ds/tokens and the plugins of @quantum-ds/figma and @quantum-ds/penpot rely on; report the findings, turn them into issues (with a check in the real tool, assigned to a person, when only the tool can confirm the impact), and record how far the review went. Use when the user asks what changed in Figma, Penpot or Tokens Studio, whether the exports are up to date, to review or catch up on design tool releases, or when a check in the real tool comes back.
---

# Design tools watch

The method is `agents/design-tools.md`: read it first, then `agents/design-tools.json` (the
registry), `agents/token-sources.md` ("Drawing a component in Figma", "… in Penpot"),
`packages/figma/AGENTS.md`, `packages/penpot/AGENTS.md` and the design tool section of
`packages/tokens/AGENTS.md`.

## 1. Set up

1. Worktree and branch `docs/agents-design-tools-<YYYY-MM-DD>` from the latest base branch
   (`agents/git.md`). Nothing is committed before step 6.
2. Gather what the exports rely on:
   - the registry's `reliesOn` and `minimum` for each tool reviewed;
   - the workarounds: `git grep -n "upstream("`;
   - the open issues of each tool: `gh issue list --repo ThalesGroup/quantum --state open --label <label> --json number,title,body`
     for `figma`, `penpot`, `tokens-studio`.
3. The range per tool: from the release after `reviewed.through` to today (the last twelve months
   when `reviewed` is `null`).

## 2. Read the releases

For every source of the tool, every release in the range, betas and release candidates included.
Several tools can be read in parallel by subagents: give each one the tool's registry entry, its
markers, its open issues and the range, and ask for the findings below with the exact link of each
release note, never a summary without its source. A source that is gone or moved: find where it
went, say so, and update the registry in step 6.

Keep a change only when it touches a `reliesOn` line, a marker or an open issue. Count the others.

## 3. Classify and check

For each finding (`agents/design-tools.md` "A review", step 3): its class (breaking, lifts a
workaround, fixes a known issue, opportunity, coming), the artifacts it touches (paths, the marker's
`file:line`), and how sure it is:

- **Confirmed** when the tool's own source shows it (Penpot and the Tokens Studio plugin are open
  source: read the code at the release tag, cite the file and the tag) or a test here proves it.
- **To check in the tool** otherwise. Write the check (`agents/design-tools.md` "A check in the
  real tool"): exact versions, commands, steps, what to look at, what confirms and what rules out.
  Run every command of its setup yourself first, so that it works as written.

Do not change an export, a stand-in or a token format in this review: the work goes to issues.

## 4. Report

In the conversation, one numbered list per tool, newest release first:

`N. [class] <release> — <what changed> (<link>). Touches: <artifacts>. <Confirmed | To check in the tool>. Proposed: <issue | no work, because …>.`

Then the counts (releases read, changes kept, changes without impact), the sources that moved, and
the range covered. Ask whether to file the proposed issues.

## 5. File the issues (once the user agrees)

Skill `backlog`, one issue per finding that needs work, after searching for an existing one
(comment there instead). Title `<Tool>: <what to do>` (`Penpot: drop the fontFamily fallback now
that 2.19 is the minimum`). Labels: `enhancement`, or `bug` for a breaking change; the tool's
`label`; the areas the work touches (`agents/git.md` "Labels": `tokens` for a token format);
`nextgen`.
Body: the release and its link, what changed, what in the repository it touches (paths, markers),
how sure it is, what closes the issue, and the **Check in <tool>** section when it needs one.

An issue with a check in the real tool is assigned to the person who will run it: the user, unless
they name someone else (`--assignee @me`, or `--assignee <login>`). Report every issue URL with its
labels and assignee.

## 6. Record the review

In `agents/design-tools.json`, for every tool reviewed: `reviewed.through` (the latest stable
release read, or the date of the last release note), `reviewed.on` (today), any `reliesOn` line
the review found missing, any source that moved. Then `pnpm check`, one commit
`docs(agents): review the design tool releases through <YYYY-MM-DD>`, and stop: push and the pull
request only when the user says so (`agents/git.md`). Its description lists the findings and the
issues filed.

## When a check comes back

The user (or the person assigned) reports the result of a check in the real tool:

1. Comment on the issue with the result as reported (version, what was seen, the answer).
2. Confirmed: rewrite the issue's top as ordinary work (what to change, where) and keep the check
   as a record. Ruled out: close it with the result.
3. When the result teaches something about the tool (a value it refuses, a field it ignores), the
   change that fixes the issue teaches the plugin's stand-in the same rule
   (`packages/figma/AGENTS.md`, `packages/penpot/AGENTS.md`) and adjusts the registry's `reliesOn`.
