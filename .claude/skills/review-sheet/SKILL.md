---
name: review-sheet
description: Build a focused before/after review page for one design question (reference, today, each option, side by side, in every surface and mode, with live measurements), screenshot it, and ask the team the question with the exact URLs to check. Use whenever a decision needs the team to compare renderings, during a step-by-step pull request or on its own.
---

# Review sheet: one question, one page

The team decides by looking. Every question gets its own page, which isolates it: only the
aspect being decided varies, everything else stays at today's values. Then the question is
asked alone, with the URLs right next to it. Proven on an earlier step-by-step pull request (about 40 sheets).

## Where things live

- Sheets: `build/review/<step>-<question>.html` in the worktree (`build/` is git-ignored and,
  unlike the session scratchpad, survives between sessions).
- Generators: `build/review/tools/*.mjs`, one small Node script per kind of sheet, re-run after
  every change. Start from [reference/colorsheet.mjs](reference/colorsheet.mjs) (the button
  color sheet: reference replica / today / candidate rows, page, card and checkerboard, light and
  dark, live label contrast) and its config [reference/colorsheet.example.json](reference/colorsheet.example.json).
- A fixed "before": snapshot the files before changing them,
  `mkdir -p build/review/before && cp -R packages/tokens/dist packages/components/src build/review/before/`
  (the generated token CSS, the web implementation and the read-only exports), and point the
  before sheet at `build/review/before/dist/css/index.css` then `build/review/before/src/index.css`
  (the tokens entry point first, the components entry point second).
- Served by the worktree's dev server through Vite's `/@fs/` prefix:
  `http://localhost:<port>/@fs/<absolute path>/build/review/<sheet>.html`, the two stylesheets
  linked as `/@fs/<absolute path>/packages/tokens/dist/css/index.css` and
  `/@fs/<absolute path>/packages/components/src/index.css` (skill `worktree-preview`).

## What a sheet shows

- **Rows:** the reference (a replica drawn from the export's raw values, when there is one),
  `today`, then one row per option (`A. Keep today`, `B. …`). Options are review-only CSS in
  the sheet that override the component's private `--_*` properties; never edit the component
  to show an option.
- **Columns:** the states (`default`, `hover`, `active`, `disabled`) rendered with the
  component's own template (`render({ …, state })`), and the sizes when the question is about
  dimensions.
- **Surfaces and modes** when color is involved: page (level 0) and card (level 1), in light and
  dark (`data-theme` on each block), plus a **checkerboard** that reveals translucency. Say when
  the reference has no dark values.
- **Measurements in the page**, computed by a script from the rendered elements, never typed by
  hand: contrast under each element (fill over the surface, red under the WCAG minimum, disabled
  exempt), sizes and insets, offsets against a neighbour (a dashed line at a shared edge).
- **Toggles** (checkboxes at the top) for what helps reading: outline the boxes being decided,
  highlight the area in question, show or hide sample glyphs, "only what differs" in token tables.
- **Zoom** (`body { zoom: 1.5 }` to `2.5`) for sub-pixel borders; say so in the note.
- `transition: none !important` on the component: the hidden preview pane freezes transitions,
  so a sheet would otherwise show colors halfway.
- A short **note** at the top: what to look at, what each row is, which tokens each option uses.

Token comparison sheets (a table of every token, today's value, the option's value, a "differs"
filter) work the same way for structural questions.

## Screenshots

`sh .claude/skills/review-sheet/scripts/shot.sh <url> <out.png> [width] [height]` takes a 2x
headless screenshot that exits by itself. Use them in the step comment of the pull request
(`gh pr comment … --attach`) and in issues (`gh issue create … --attach`); for checking
yourself, the browser pane works too (`computer` screenshot, `javascript_tool` to measure).

## Asking the question

One question per reply. After the answer, build the next question's sheet and ask it.

```markdown
## Step 11, question 2: glyph size of the Icon button

**Context.** Which part and token carry it (link the token file), today's values, the
reference's values, why they differ. What stays fixed in this question (earlier answers, later
questions).

**Options:**

| | xsmall | small | medium | large |
|---|---|---|---|---|
| Reference | … | … | … | … |
| A. Keep today | … | … | … | … |
| **B. … (recommended)** | … | … | … | … |

- One bullet per option: the consequence, the tokens it uses (existing tokens only, or which
  addition it would need: ask before any addition), the WCAG criterion it meets or breaks,
  with its source (`agents/accessibility.md`).

**Where to check:**
- **Question sheet:** <url> — what each row shows, what the toggle does.
- **In a real screen:** <url> — where exactly on the page.
- **The component today:** <url> (which tab, which table).

**A or B?**
```

- Give a recommendation and say why; the team decides.
- Prefer options that need no new token. Never present a raw value as an option: map it to the
  semantic token that carries it (values a few RGB units apart are export noise).
- When an answer states a broader rule ("the Icon button always renders the same as the
  Button"), restate it as a rule and ask how far it goes (record only, or enforce it).
- Every reply during the work ends with the preview URLs, even when nothing changed.
