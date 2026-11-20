---
name: review-sheet
description: Build a focused before/after review page for one design question (reference, today, each option, side by side, in every surface and mode, with live measurements), screenshot it, and ask the team the question with the exact URLs to check. Use whenever a decision needs the team to compare renderings, during a step-by-step pull request or on its own.
---

# Review sheet: one question, one page

The team decides by looking. Every question gets its own page, which isolates it: only the
aspect being decided varies, everything else stays at today's values. Then the question is
asked alone, with the URLs right next to it. Proven on an earlier step-by-step pull request (about 40 sheets).

## Session

Every sheet carries the same header: the Quantum logo, the component, the pull request and issue
numbers, the step, the question, the progress through the steps and the participants' GitHub
avatars. At the start of the session, before the first sheet, ask who takes part (GitHub logins,
and a role each), then write `build/review/session.json` in the worktree (shape:
[reference/session.example.json](reference/session.example.json)): the pull request and issue
numbers and titles, the component, the steps of the pull request description in order, the ones
already decided, and the people (`name` from `gh api users/<login> -q .name`; `login: null` for
someone without an account, drawn with initials). Update `done` after each decided step.

## Where things live

- Sheets: `build/review/<step>-<question>.html` in the worktree (`build/` is git-ignored and,
  unlike the session scratchpad, survives between sessions).
- Generators: `build/review/tools/*.mjs`, one small Node script per kind of sheet, re-run after
  every change. Every generator builds its page with the shared shell
  [reference/sheet-shell.mjs](reference/sheet-shell.mjs) (`renderSheet`, imported by absolute
  path from the worktree's `.claude/skills/`): it only describes the question, the options, the
  variants, how to draw one cell and what to measure; the shell draws the header, the hero, the
  table and every view. Start from [reference/shell.example.mjs](reference/shell.example.mjs)
  (the Text field's error icon color). [reference/colorsheet.mjs](reference/colorsheet.mjs)
  (the button color sheet, with its config [reference/colorsheet.example.json](reference/colorsheet.example.json))
  predates the shell: reuse its Figma replica and checkerboard, not its page.
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

The shell lays every sheet out the same way, top to bottom:

- **Toolbar** (sticky, one line): logo, component, pull request and issue, step, question,
  progress dots, participants' avatars, and the **Compare** button.
- **Hero**: the question, the participants, the progress, one tile per option (its light and
  dark color when color is the question), on one row as wide as the options need; the tiles share
  their rows (tags, name, title, colors), so the same content lines up from tile to tile.
- **Decision marks**, the same on the tiles, the table and the sub-headers: while the question is
  open, the recommended option is outlined in blue with a blue "Recommended" tag; once the team
  has chosen (`chosen` on the sheet, see "Recording the decision"), the chosen option is outlined
  in green with a green check tag, and "Recommended" turns neutral and loses its outline.
- **Sidebar** (sticky): the steps, the current one highlighted, and the anchors of the view.
- **Options and reasons**: the summary table you share in the session reply, one row per option,
  its token, values and why.
- **Renderings**: one sticky sub-header per option (letter, title, token, recommended), the
  surface levels as columns, light then dark.

What goes in it:

- **Options:** the reference (a replica drawn from the export's raw values, when there is one;
  `darkNote` when it has no dark values), `today` when it differs from every option, then one
  option each (`A. Keep today`, `B. …`). Options are review-only CSS in the sheet that override
  the component's private `--_*` properties; never edit the component to show an option.
- **Variants:** the stack inside each cell, rendered with the component's own template
  (`render({ …, state })`): the states (`default`, `hover`, `active`, `disabled`), the sizes when
  the question is about dimensions, the placements.
- **Surfaces and modes:** levels 0 to 3, light and dark, set by the shell (`data-theme` and the
  level's background on each cell). A checkerboard that reveals translucency goes in the cell.
- **Measurements in the page**, computed by a script from the rendered elements, never typed by
  hand: contrast under each element (fill over the surface, red under the WCAG minimum, disabled
  exempt), sizes and insets, offsets against a neighbour (a dashed line at a shared edge).
- **Compare panel**, hidden until the Compare button or the C key opens it, so the page and its
  screenshot stay clean: views (Overview, the screenshot; options side by side; light next to
  dark; a wipe of one option over another), filters (modes, options, levels, variants), the
  measurements and the zoom (100 to 300 %, for sub-pixel borders). Its state goes in the URL
  query: link a specific view in the reply when it shows the point better (`?view=wipe&…`), and
  copy it with "Copy link to this view". Never put controls on the page itself.
- `transition: none !important` on the component: the hidden preview pane freezes transitions,
  so a sheet would otherwise show colors halfway.

Token comparison sheets (a table of every token, today's value, the option's value, a "differs"
filter) work the same way for structural questions.

## Screenshots

`sh .claude/skills/review-sheet/scripts/shot.sh <url> <out.png> [width] [height]` takes a 2x
headless screenshot that exits by itself. The screenshot shared is always the default view (the
URL without a query) at 1440 px wide and tall enough for the whole page: the entire page is
posted, header included. Use them in the step comment of the pull request
(`gh pr comment … --attach`) and in issues (`gh issue create … --attach`); for checking
yourself, the browser pane works too (`computer` screenshot, `javascript_tool` to measure).

## Recording the decision

When the step is committed, set `chosen` on the sheet to the id of the option the team chose, add
the step to `done` in `build/review/session.json`, rebuild the sheet and take its screenshot
again: that screenshot, with the decision marked and the recommendation still visible, is the
only screenshot of the sheet posted in the step comment (skill `stepwise-pr`, "Record"); the
sheet as it was asked is not posted again.

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
