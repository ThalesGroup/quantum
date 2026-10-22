---
name: worktree-preview
description: Serve the docs site of a git worktree (not the main checkout) on its own port so the user can review a branch, and make sure the page really comes from that worktree. Use when the user asks for a local server or a preview URL to check a branch, a pull request or review sheets, or when work happens in .claude/worktrees/.
---

# Preview a worktree

`pnpm dev` in the main checkout serves `main` (or whatever is checked out there) on 4321.
A branch in `.claude/worktrees/<name>` needs its own server, or the user reviews the wrong code.

1. **Port.** One per worktree, from 4341 up (4341, 4342, …); 4321 stays for the main checkout,
   4322 and 4331 are the build previews. Check it is free: `lsof -iTCP:<port> -sTCP:LISTEN`.
2. **Tokens.** `pnpm tokens:build` in the worktree first (`pnpm dev` does it, `astro dev` does not).
3. **Start** through the preview tools, never through Bash: add a temporary entry to the main
   checkout's `.claude/launch.json`,
   ```json
   { "name": "docs-<name>", "runtimeExecutable": "pnpm",
     "runtimeArgs": ["--dir", "<repo>/.claude/worktrees/<name>/apps/docs", "dev", "--port", "<port>"],
     "port": <port> }
   ```
   (`<repo>` is the absolute path of the main checkout; the docs app is the `docs` workspace package in `apps/docs`), then `preview_start { name: "docs-<name>" }`. Remove the entry afterwards: it is never committed.
4. **Prove which checkout serves the page.** In the browser pane:
   `[...document.querySelectorAll('style[data-vite-dev-id]')].map(s => s.dataset.viteDevId).slice(0, 3)`
   must show paths under `.claude/worktrees/<name>/`.
5. **Give the URLs** in every reply while the work lasts: the server root, the exact pages
   (`/components/<id>`, `/components/<id>/states`, `/components/<id>/playground`,
   `/screens/<source>/<block>`), and the review sheets
   (`http://localhost:<port>/@fs/<absolute path>/build/review/<sheet>.html`).

## Pitfalls

- **Stale server.** An Astro dev server left from an earlier day blocks `astro dev` on another
  port and keeps serving cached CSS import errors: `pnpm --filter docs exec astro dev stop` (or
  `pnpm --dir apps/docs exec astro dev stop`), then
  start again through `preview_start`.
- **Missing generated CSS** (`ENOENT … packages/tokens/dist/css/components/<id>.css` or a missing
  `@quantum-ds/tokens/css/index.css`): run `pnpm tokens:build` in that checkout and restart.
- **Hidden pane.** When the browser pane is hidden, CSS transitions do not run: measure colors
  with transitions turned off (`* { transition: none !important }`) or read the token values.
