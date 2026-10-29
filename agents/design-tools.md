# Following the design tools

How the repository keeps up with the design tools it exports to (Figma, Penpot, Tokens Studio)
and the token format they share (DTCG): what each export relies on, where each tool publishes its
changes, how a review turns them into issues, and how a change that needs the real tool is checked
by a person. Part of the agent guide: start from the root `AGENTS.md`. The skill
`design-tools-watch` runs the review step by step.

## Why

Every design tool export is written against what a tool did on the day it was written: the
`@quantum-ds/tokens` formats for Figma, Tokens Studio and Penpot
(`packages/tokens/style-dictionary.config.mjs`), and the plugins of `@quantum-ds/figma` and
`@quantum-ds/penpot`, which draw the components (`agents/token-sources.md`). The tools keep moving:
a release can break an export, fix a limit the code works around, or bring a feature worth using.
None of them is an npm dependency, so Dependabot never sees them (it does follow Style Dictionary).
The review is how those releases reach the backlog.

## The registry

`agents/design-tools.json` lists one entry per tool:

- `exports`: what the repository writes for it.
- `reliesOn`: every behaviour of the tool an export depends on, in a line each. A release that
  touches one of them is a finding; one that touches none is not. Keep it true: a new feature used
  by an export adds its line in the same change.
- `sources`: where the tool publishes its changes (release notes, changelogs, the plugin API's
  updates). Only these are read; a source that moves is updated here.
- `minimum`: the oldest version the exports support, when there is one.
- `reviewed`: `{ "through", "on" }`, the last release reviewed (a version, or the date of the last
  release note for a tool without versions) and the day of the review. `null` until the first
  review.

`reviewed` moves forward only in the change that records a review, never by hand.

## Workarounds in the code

Code that works around a tool's limit says so with a marker in its comment:
`upstream(<tool>): <the limit>`, the tool being an id of the registry (several, comma-separated, when
they share the limit):

```js
// upstream(penpot): no baseline alignment; the end of the cross axis comes closest for one-line texts.
```

The marker goes where the workaround is decided (a table, a fallback, a conversion), once. It is
how a review finds what a release may let the code drop: `git grep -n "upstream("` lists them, and
`pnpm test` checks that every marker names a tool of the registry. A workaround added later gets
its marker in the same change.

## A review

The skill `design-tools-watch` runs it, for one tool or all of them, regularly (once a month, or
before a release of a package) and once at least when a tool announces a major version.

1. **Read** every source of the tool from the release after `reviewed.through` up to the latest
   stable one (the last twelve months when `reviewed` is `null`). Betas and release candidates are
   read too, and reported apart as what is coming.
2. **Match** each change against `reliesOn` and the `upstream(…)` markers. A change matching
   neither is not a finding; the review only counts them.
3. **Classify** each finding:
   - **Breaking**: an export stops working or loses something (a type renamed, an API removed).
   - **Lifts a workaround**: a marked limit is gone; the workaround can go, or be kept for the
     versions before (then `minimum` decides).
   - **Fixes a known issue**: an open issue of the repository is fixed upstream.
   - **Opportunity**: a feature that would let an export draw or bind more, or more simply.
   - **Coming**: any of the above, in a beta or a release candidate only.
4. **Check** what can be checked here: read the tool's source when it is open (Penpot, Tokens
   Studio), run the token build and read its output, teach the plugins' stand-ins the new rule and
   run `pnpm test`. Each finding says how sure it is: **confirmed** (read in the tool's source or
   proven by a test) or **to check in the tool** (only the release note says it).
5. **Report** the findings, numbered, each with its source link, its class, the artifacts it
   touches and how sure it is. Then, once the person who asked for the review agrees, one issue per
   finding that needs work (skill `backlog`), searching first for an issue that already covers
   it. Findings with no work (a fix for a problem the exports never had) stay in the report.
6. **Record** the review: `reviewed` of each tool reviewed, and any new `reliesOn` line, in one
   commit on its own branch (`docs(agents): review the design tool releases through <date>`).

## A check in the real tool

An agent cannot run Figma or Penpot. When a finding needs the real tool to be confirmed or ruled
out, its issue does not claim the impact: it says so, gives the person who will run it everything
needed to do it in one go, and is assigned to that person (the one who asked for the review, unless
they name someone else). Its body has a **Check in <tool>** section:

- **Needs**: the tool and version (a beta when the change is not released yet), the plan when it
  matters (a second variable mode needs a paid Figma plan), the fonts to install.
- **Setup**: the commands, from a clean checkout of the branch to check (`pnpm install`, then
  `pnpm figma:export <id>` or `pnpm penpot:export <id>` and `pnpm penpot:serve`), and how to load
  the plugin or import the token file (`agents/token-sources.md`).
- **Steps**: numbered, each one action, with the component, variant, token or panel to open.
- **Look at**: what shows the impact (a variable's type, a token's value in the Tokens panel, a
  warning in the plugin window, a layer's binding), and what it should be if the export is right.
- **Answers**: what result confirms the impact and what rules it out.
- **Report back**: in a comment, the tool's version, what was seen (screenshots, the plugin
  window's warnings), and the answer.

When the result comes back, the issue is updated with it: confirmed, it becomes ordinary work;
ruled out, it is closed with the result. A stand-in rule taught from a release note is kept only
once the tool has confirmed it (`packages/figma/AGENTS.md`, `packages/penpot/AGENTS.md`).
