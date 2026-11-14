# Claude Quantum

A theme mod for the [Claude Code](https://code.claude.com) desktop app, built from the Quantum
design tokens: the app's own colors from the Quantum semantic tokens, over a still ground of dots
on the Quantum spacing grid.

- **Surfaces and text** (`COLORS.anchors` in `build.mjs`): the surfaces climb the
  `global.bg.base.neutral.*` steps and the text is `global.text.on-base.neutral.primary`,
  `.secondary` and `.tertiary`, in light and dark.
- **Accent, danger, success, warning and pro** (`COLORS.roles`): each role's ramp takes the hue of
  its Quantum token (brand, error, success, warning, lavender), and its filled controls paint
  Quantum's own pair, `global.bg.accent.<role>.default` at rest and `.hover` on hover. Dark mode's
  warning is the exception: the app draws an active editor comment as 45% of the warning fill
  under light text, Quantum's bright warning fill leaves it at 2.9:1, and the app then refuses the
  whole theme, so dark mode keeps the warning ramp made from the token's hue.
- **The ground** (`DOTS`): one `space.2` dot per `space.16` step, in `global.border.base.neutral.4`
  on the page color, over the whole window. The dots never sit behind text: the app's bars
  (sidebar, header, composer) are drawn solid over them (the look's glass is the page color at full
  opacity, with no blur), and each row of the conversation (prompts, replies, tool calls, command
  output, notices) is drawn on the page color too (`src/register.tsx`), so the dots show around
  and between them. One still scene per mode; nothing moves and nothing loads.

Claude Code's own `makeColors` (`vendor/make-colors.js`, copied as it is from its plugin-authoring
skill) derives the app's hundred-odd colors from these; the build fails where the desktop app would
not paint the result, and keeps its contrast notes as comments in the generated `hooks/look.ts`.

What the app's theme can't take: it is colors only, so the app keeps its own font, border widths
(Quantum's `stroke-width.md`, 1.2px), radii and focus ring (`focus.ring.width`, 2.4px, offset
`focus.ring.offset`). Its borders, hover washes of neutral controls and focus ring are mixes of the
gray ramp the anchors make, close to Quantum's `global.border.base.neutral.*` but not the same
values. `contrast: 'more'` would ask for stronger borders and focus rings throughout.

## Build and install

```bash
pnpm claude-theme:build
```

writes the mod to `packages/claude-theme/dist/claude-quantum/` (not committed). Load it with
`claude --plugin-dir packages/claude-theme/dist/claude-quantum`, or copy it into a mods folder:

```bash
node packages/claude-theme/build.mjs --install <mods folder>
```

It needs Claude Code 2.1.325 or later (`$.theme.set` with `colors` and `backdrop.scene`); the
look is drawn by the desktop app only (the terminal keeps its own). Copy `vendor/make-colors.*`
again from the skill when Claude Code updates it.

## Use

The look is set when a session starts. `/quantum-theme light` or `dark` puts the app in that mode
with its colors and dots, and `off` clears the look. The choice is kept for the next sessions;
`dark` until one is made.
