// Claude Quantum: the Quantum Design System's colors in the Claude Code desktop app, over dots on
// its spacing grid, with the conversation's rows and the app's bars on a solid page color so the
// dots never sit behind text. build.mjs copies this module as it is next to look.ts, which it
// generates from the tokens.
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { COLORS, DOTS } from './look'

const PLUGIN = 'claude-quantum'
const COMMAND = 'quantum-theme'
// The person's choice, kept across sessions: 'light' or 'dark' (the app in that mode, with that
// mode's dotted scene) or 'off'. Absent or unknown, 'dark'.
const CHOICE_KEY = 'choice'
const MODES = ['light', 'dark'] as const
const CHOICES = [...MODES, 'off']

type Mode = (typeof MODES)[number]
const isMode = (value: unknown): value is Mode => MODES.includes(value as Mode)

async function choiceOf($: EngineInterface): Promise<string> {
  const kept = await $.store.get(CHOICE_KEY)
  return typeof kept === 'string' && CHOICES.includes(kept) ? kept : 'dark'
}

/**
 * The whole look of a mode: the colors, its dotted scene, and the app held in that mode. The glass
 * is the page color at full opacity with no blur: the app's bars (sidebar, header, composer) are
 * solid over the dots.
 */
const lookOf = (mode: Mode): ThemeSetArgs => ({
  colors: COLORS,
  backdrop: { scene: mode, glass: { blur: 0, tint: DOTS[mode].page, opacity: 1 } },
  overrideColorScheme: mode,
})

async function show($: EngineInterface, choice: string): Promise<string> {
  // The rows already drawn keep the page color they were drawn on: draw them again in this one.
  $.ui.invalidate('ui.render')
  if (!isMode(choice)) {
    await $.theme.clear()
    return 'Claude Quantum is off.'
  }
  const set = await $.theme.set(lookOf(choice))
  return set.isDrawn ? `Claude Quantum, ${choice}.` : `Claude Quantum, ${choice}: set, not drawn (${set.reason}).`
}

const failure = (error: unknown) => (error instanceof Error ? error.message : String(error))

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: `Claude Quantum look: ${CHOICES.join(', ')}`,
      argumentHint: CHOICES.join('|'),
    })
    const choice = await choiceOf($)
    // Never clear at start: another plugin's theme may stand.
    if (isMode(choice)) {
      try {
        const said = await show($, choice)
        if (said.includes('not drawn')) $.ui.status(said)
      } catch (error) {
        $.ui.toast(`Claude Quantum: ${failure(error)}`)
      }
    }
    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const asked = e.args.trim().toLowerCase()
    if (asked === '') {
      return { text: `Claude Quantum is ${await choiceOf($)}. Choose one of: ${CHOICES.join(', ')}.` }
    }
    if (!CHOICES.includes(asked)) {
      return { text: `Unknown choice "${asked}". Choose one of: ${CHOICES.join(', ')}.` }
    }
    await $.store.set(CHOICE_KEY, asked)
    try {
      return { text: await show($, asked) }
    } catch (error) {
      return { text: `Claude Quantum could not set ${asked}: ${failure(error)}` }
    }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    // Only a window has room behind the chat, and only its table has `Svg`.
    if (e.props.plugin !== PLUGIN || !isMode(e.props.scene) || e.surface !== 'desktop') return next(e)
    const { Svg } = $.ui.resolve(e)
    return <Svg isInteractive alt="Dots on the Quantum spacing grid" source={DOTS[e.props.scene].scene} />
  })

  // The conversation's rows, each drawn on the page color so the dots stay out from behind them.
  on(
    'ui.render',
    {
      component: ['UserMessage', 'AssistantMessage', 'ToolUse', 'ToolGroup', 'CommandOutput', 'InfoNotice', 'TurnDuration', 'Spinner'],
      surface: 'desktop',
    },
    async ($, e, next) => {
      const choice = await choiceOf($)
      if (!isMode(choice)) return next(e)
      const { Box } = $.ui.resolve(e)
      return (
        <Box flexDirection="column" backgroundColor={DOTS[choice].page}>
          {await next(e)}
        </Box>
      )
    },
  )
}
