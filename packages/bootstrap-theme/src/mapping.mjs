/**
 * The Quantum theme for Bootstrap 6, as data: every Bootstrap token the theme sets, the Quantum
 * token it takes its value from, and how each Quantum component corresponds to Bootstrap classes.
 * Plain data, no logic: build.mjs turns it into dist/quantum.css, the Sass configuration and the
 * demo notes, and src/lib.mjs checks it against the built tokens and the component specs (an
 * unknown token path, spec property, option, state or part fails the build and the test).
 *
 * groups[]       One Bootstrap selector each (exactly as bootstrap.css writes it) and the custom
 *                properties the theme reassigns on it; `also` lists the other Bootstrap rules that
 *                include the same Sass map, which get the same values. `tier` is the Quantum tier the values come
 *                from: Bootstrap's root layer reads semantic tokens, its per-component tokens read
 *                Quantum component tokens; a value from the other tier must say `why`.
 *                `sass` names the Bootstrap Sass map that receives the same values in the Sass
 *                output (`@use "bootstrap/scss/bootstrap" with (...)`); without it the rule is
 *                written after the @use, in Bootstrap's layer.
 * Entry forms    'token.path'                          the token's resolved value
 *                ['token.path', 'why']                 the same, with the reason of the choice
 *                { token, member, why }                one member of a typography token
 *                { template: '{a} solid {b}', why }    tokens composed with CSS text
 *                { literal, rule, why }                a CSS keyword a Quantum foundation rule
 *                                                      (<foundation id>.<rule id>) decides
 * units          Lengths are written in rem (16px base) like Bootstrap, except tokens whose
 *                semantic origin matches `keepPx` (hairlines and outlines stay in px, as
 *                Bootstrap keeps its borders in px).
 * equivalences[] Quantum component (spec id) -> Bootstrap component and classes. `options` maps
 *                every option of a spec property to a class ('' = Bootstrap's default, null = no
 *                equivalent); `combinations` override a pair of options; `states` and `parts` map
 *                spec states and anatomy parts. Each id is checked against the spec.
 */

const SANS_STACK = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Noto Sans', 'Liberation Sans', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";
const MONO_STACK = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Monaco, 'Cascadia Mono', Consolas, 'Liberation Mono', monospace";
const ROOT = ':root, :host';

export default {
  bootstrap: { version: '6.0.0-alpha.1', prefix: '--bs-' },

  units: {
    remBase: 16,
    keepPx: ['stroke-width.*', 'focus.ring.*', 'corner-radius.full'],
  },

  groups: [
    // ---- Theme colors ($theme-colors) ------------------------------------------------------
    {
      id: 'theme-primary', section: 'Theme colors', title: '.theme-primary', selector: ROOT, tier: 'semantic',
      sass: { map: '$theme-colors', key: 'primary', strip: '--bs-primary-' },
      why: 'Quantum brand intent (Button and Badge intent brand).',
      tokens: {
        '--bs-primary-base': 'global.bg.accent.brand.default',
        '--bs-primary-fg': ['global.text.on-base.brand.default', 'Brand text on the page: the ghost button label and the link color.'],
        '--bs-primary-fg-emphasis': ['global.text.on-subtle.brand.default', 'The ghost button hover label and the subtle button label: the darker brand text step.'],
        '--bs-primary-bg': 'global.bg.accent.brand.default',
        '--bs-primary-bg-subtle': 'global.bg.subtle.brand.default',
        '--bs-primary-bg-muted': ['global.bg.subtle.brand.hover', 'The next step of the subtle ramp, Quantum\'s hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum\'s hover.'],
        '--bs-primary-border': 'global.border.accent.brand.default',
        '--bs-primary-focus-ring': ['color.focus.ring', 'Quantum has one focus ring color for every intent (Focus foundation).'],
        '--bs-primary-contrast': 'global.text.on-accent.brand.default',
      },
    },
    {
      id: 'theme-accent', section: 'Theme colors', title: '.theme-accent', selector: ROOT, tier: 'semantic',
      sass: { map: '$theme-colors', key: 'accent', strip: '--bs-accent-' },
      why: 'Bootstrap\'s accent is a decorative second hue (indigo), not a status: it takes Quantum\'s extended lavender, the decorative palette closest to indigo. functional.severe is a status between warning and error and must not decorate.',
      tokens: {
        '--bs-accent-base': 'global.bg.accent.extended.lavender.default',
        '--bs-accent-fg': 'global.text.on-base.extended.lavender.default',
        '--bs-accent-fg-emphasis': 'global.text.on-subtle.extended.lavender.default',
        '--bs-accent-bg': 'global.bg.accent.extended.lavender.default',
        '--bs-accent-bg-subtle': 'global.bg.subtle.extended.lavender.default',
        '--bs-accent-bg-muted': ['global.bg.subtle.extended.lavender.hover', 'The next step of the subtle ramp, Quantum\'s hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum\'s hover.'],
        '--bs-accent-border': 'global.border.accent.extended.lavender.default',
        '--bs-accent-focus-ring': ['color.focus.ring', 'Quantum has one focus ring color for every intent (Focus foundation).'],
        '--bs-accent-contrast': 'global.text.on-accent.extended.lavender.default',
      },
    },
    {
      id: 'theme-success', section: 'Theme colors', title: '.theme-success', selector: ROOT, tier: 'semantic',
      sass: { map: '$theme-colors', key: 'success', strip: '--bs-success-' },
      why: 'Quantum functional success.',
      tokens: {
        '--bs-success-base': 'global.bg.accent.functional.success.default',
        '--bs-success-fg': ['global.text.on-subtle.functional.success.default', 'Text in the intent color reads on the subtle fill (alert, subtle badge) and on the page: Quantum\'s on-subtle step, the alert title and subtle badge label.'],
        '--bs-success-fg-emphasis': 'global.text.on-sunken.functional.success.default',
        '--bs-success-bg': 'global.bg.accent.functional.success.default',
        '--bs-success-bg-subtle': 'global.bg.subtle.functional.success.default',
        '--bs-success-bg-muted': ['global.bg.subtle.functional.success.hover', 'The next step of the subtle ramp, Quantum\'s hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum\'s hover.'],
        '--bs-success-border': ['global.border.accent.functional.success.default', 'The alert and accent badge border.'],
        '--bs-success-focus-ring': ['color.focus.ring', 'Quantum has one focus ring color for every intent (Focus foundation).'],
        '--bs-success-contrast': 'global.text.on-accent.functional.success.default',
      },
    },
    {
      id: 'theme-danger', section: 'Theme colors', title: '.theme-danger', selector: ROOT, tier: 'semantic',
      sass: { map: '$theme-colors', key: 'danger', strip: '--bs-danger-' },
      why: 'Quantum functional error (Button intent error).',
      tokens: {
        '--bs-danger-base': 'global.bg.accent.functional.error.default',
        '--bs-danger-fg': ['global.text.on-subtle.functional.error.default', 'Text in the intent color reads on the subtle fill (alert, subtle badge) and on the page: Quantum\'s on-subtle step, the alert title and subtle badge label.'],
        '--bs-danger-fg-emphasis': 'global.text.on-sunken.functional.error.default',
        '--bs-danger-bg': 'global.bg.accent.functional.error.default',
        '--bs-danger-bg-subtle': 'global.bg.subtle.functional.error.default',
        '--bs-danger-bg-muted': ['global.bg.subtle.functional.error.hover', 'The next step of the subtle ramp, Quantum\'s hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum\'s hover.'],
        '--bs-danger-border': ['global.border.accent.functional.error.default', 'The alert and accent badge border.'],
        '--bs-danger-focus-ring': ['color.focus.ring', 'Quantum has one focus ring color for every intent (Focus foundation).'],
        '--bs-danger-contrast': 'global.text.on-accent.functional.error.default',
      },
    },
    {
      id: 'theme-warning', section: 'Theme colors', title: '.theme-warning', selector: ROOT, tier: 'semantic',
      sass: { map: '$theme-colors', key: 'warning', strip: '--bs-warning-' },
      why: 'Quantum functional warning.',
      tokens: {
        '--bs-warning-base': 'global.bg.accent.functional.warning.default',
        '--bs-warning-fg': ['global.text.on-subtle.functional.warning.default', 'Text in the intent color reads on the subtle fill (alert, subtle badge) and on the page: Quantum\'s on-subtle step, the alert title and subtle badge label.'],
        '--bs-warning-fg-emphasis': 'global.text.on-sunken.functional.warning.default',
        '--bs-warning-bg': 'global.bg.accent.functional.warning.default',
        '--bs-warning-bg-subtle': 'global.bg.subtle.functional.warning.default',
        '--bs-warning-bg-muted': ['global.bg.subtle.functional.warning.hover', 'The next step of the subtle ramp, Quantum\'s hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum\'s hover.'],
        '--bs-warning-border': ['global.border.accent.functional.warning.default', 'The alert and accent badge border.'],
        '--bs-warning-focus-ring': ['color.focus.ring', 'Quantum has one focus ring color for every intent (Focus foundation).'],
        '--bs-warning-contrast': 'global.text.on-accent.functional.warning.default',
      },
    },
    {
      id: 'theme-info', section: 'Theme colors', title: '.theme-info', selector: ROOT, tier: 'semantic',
      sass: { map: '$theme-colors', key: 'info', strip: '--bs-info-' },
      why: 'Quantum functional info.',
      tokens: {
        '--bs-info-base': 'global.bg.accent.functional.info.default',
        '--bs-info-fg': ['global.text.on-subtle.functional.info.default', 'Text in the intent color reads on the subtle fill (alert, subtle badge) and on the page: Quantum\'s on-subtle step, the alert title and subtle badge label.'],
        '--bs-info-fg-emphasis': 'global.text.on-sunken.functional.info.default',
        '--bs-info-bg': 'global.bg.accent.functional.info.default',
        '--bs-info-bg-subtle': 'global.bg.subtle.functional.info.default',
        '--bs-info-bg-muted': ['global.bg.subtle.functional.info.hover', 'The next step of the subtle ramp, Quantum\'s hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum\'s hover.'],
        '--bs-info-border': ['global.border.accent.functional.info.default', 'The alert and accent badge border.'],
        '--bs-info-focus-ring': ['color.focus.ring', 'Quantum has one focus ring color for every intent (Focus foundation).'],
        '--bs-info-contrast': 'global.text.on-accent.functional.info.default',
      },
    },
    {
      id: 'theme-inverse', section: 'Theme colors', title: '.theme-inverse', selector: ROOT, tier: 'semantic',
      sass: { map: '$theme-colors', key: 'inverse', strip: '--bs-inverse-' },
      why: 'Quantum neutral accent (Button and Badge accent/neutral).',
      tokens: {
        '--bs-inverse-base': 'global.bg.accent.neutral.default',
        '--bs-inverse-fg': 'global.text.on-base.neutral.primary',
        '--bs-inverse-fg-emphasis': 'global.text.on-base.neutral.primary',
        '--bs-inverse-bg': ['global.bg.accent.neutral.default', 'Quantum\'s neutral accent is the inverse surface (near black in light mode, near white in dark): Button accent/neutral.'],
        '--bs-inverse-bg-subtle': 'global.bg.subtle.neutral.default',
        '--bs-inverse-bg-muted': ['global.bg.subtle.neutral.hover', 'The next step of the subtle ramp, Quantum\'s hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum\'s hover.'],
        '--bs-inverse-border': 'global.border.accent.neutral.default',
        '--bs-inverse-focus-ring': ['color.focus.ring', 'Quantum has one focus ring color for every intent (Focus foundation).'],
        '--bs-inverse-contrast': 'global.text.on-accent.neutral.primary',
      },
    },
    {
      id: 'theme-secondary', section: 'Theme colors', title: '.theme-secondary', selector: ROOT, tier: 'semantic',
      sass: { map: '$theme-colors', key: 'secondary', strip: '--bs-secondary-' },
      why: 'Quantum neutral subtle family (Button subtle/neutral and ghost/neutral).',
      tokens: {
        '--bs-secondary-base': 'global.bg.base.neutral.4',
        '--bs-secondary-fg': ['global.text.on-base.neutral.primary', 'The subtle and ghost neutral button label.'],
        '--bs-secondary-fg-emphasis': 'global.text.on-base.neutral.primary',
        '--bs-secondary-bg': ['global.bg.base.neutral.3', 'An opaque neutral surface step for the solid secondary button, which Quantum has no emphasis for (its neutral accent is the inverse one).'],
        '--bs-secondary-bg-subtle': 'global.bg.subtle.neutral.default',
        '--bs-secondary-bg-muted': ['global.bg.subtle.neutral.hover', 'The next step of the subtle ramp, Quantum\'s hover step. Bootstrap mixes it 50/50 with bg-subtle for the subtle button hover, a little lighter than Quantum\'s hover.'],
        '--bs-secondary-border': 'global.border.subtle.neutral.default',
        '--bs-secondary-focus-ring': ['color.focus.ring', 'Quantum has one focus ring color for every intent (Focus foundation).'],
        '--bs-secondary-contrast': 'global.text.on-base.neutral.primary',
      },
    },

    // ---- Surfaces, text, borders ($theme-bgs, $theme-fgs, $theme-borders) ------------------
    {
      id: 'surfaces', section: 'Surfaces', title: 'Backgrounds', selector: ROOT, tier: 'semantic',
      sass: { map: '$theme-bgs', strip: '--bs-bg-' },
      why: 'Bootstrap\'s bg-1..4 ladder steps away from the page; Quantum\'s neutral base ladder 1..5 is the same ramp (level.1 equals base.neutral.2).',
      tokens: {
        '--bs-bg-body': 'global.bg.level.0.default',
        '--bs-bg-1': 'global.bg.level.1.default',
        '--bs-bg-2': 'global.bg.base.neutral.3',
        '--bs-bg-3': 'global.bg.base.neutral.4',
        '--bs-bg-4': 'global.bg.base.neutral.5',
      },
    },
    {
      id: 'text', section: 'Text', title: 'Foregrounds', selector: ROOT, tier: 'semantic',
      sass: { map: '$theme-fgs', strip: '--bs-fg-' },
      why: 'Quantum has three text steps and a disabled color; Bootstrap reads fg-1 for hover text, so it stays at the primary step.',
      tokens: {
        '--bs-fg-body': 'global.text.on-base.neutral.primary',
        '--bs-fg-1': 'global.text.on-base.neutral.primary',
        '--bs-fg-2': 'global.text.on-base.neutral.secondary',
        '--bs-fg-3': 'global.text.on-base.neutral.tertiary',
        '--bs-fg-4': 'global.text.state.disabled.default',
      },
    },
    {
      id: 'theme-borders', section: 'Borders', title: 'Border colors', selector: ROOT, tier: 'semantic',
      sass: { map: '$theme-borders', strip: '--bs-border-' },
      tokens: {
        '--bs-border-body': 'global.border.base.neutral.3',
        '--bs-border-muted': 'global.border.base.neutral.2',
        '--bs-border-subtle': 'global.border.base.neutral.1',
        '--bs-border-emphasized': 'global.border.base.neutral.4',
      },
    },
    {
      id: 'borders', section: 'Borders', title: 'Border width and default color', selector: ROOT, tier: 'semantic',
      sass: { map: '$root-tokens', strip: '--bs-' },
      tokens: {
        '--bs-border-width': ['stroke-width.sm', 'The hairline every Quantum container and control border uses.'],
        '--bs-border-color': ['global.border.base.neutral.3', 'Bootstrap\'s default edge (tables, list groups, inputs before the text-field override): the neutral base step that stays visible in both modes.'],
        '--bs-border-color-translucent': ['global.border.level.edge.level.2', 'Bootstrap draws the edge of raised surfaces (menu, dialog, popover, toast) with it: Quantum\'s edge of a level-2 surface, the dropdown menu border.'],
      },
    },

    // ---- Typography ------------------------------------------------------------------------
    {
      id: 'typography', section: 'Typography', title: 'Body, monospace and links', selector: ROOT, tier: 'semantic',
      sass: { map: '$root-tokens', strip: '--bs-' },
      tokens: {
        '--bs-body-font-family': { template: `{body.family}, ${SANS_STACK}`, why: 'Inter first, Bootstrap\'s system stack as the fallback.' },
        '--bs-body-font-size': 'body.size.md',
        '--bs-body-font-weight': 'body.weight.regular',
        '--bs-body-line-height': 'font.line-height.normal',
        '--bs-font-mono': { template: `{mono.family}, ${MONO_STACK}`, why: 'Fragment Mono first, Bootstrap\'s monospace stack as the fallback.' },
        '--bs-link-color': ['global.text.on-base.brand.default', 'Quantum has no Link component: brand text on the page.'],
        '--bs-link-hover-color': ['global.text.on-subtle.brand.default', 'The darker brand text step (the ghost button hover label).'],
      },
    },
    {
      id: 'headings', section: 'Typography', title: 'Headings', selector: ROOT, tier: 'semantic',
      sass: { map: '$type-tokens', strip: '--bs-' },
      tokens: {
        '--bs-heading-font-family': { template: `{heading.family}, ${SANS_STACK}` },
        '--bs-heading-font-weight': ['heading.weight.semi-bold', 'Read by Bootstrap\'s headings with a medium fallback; Quantum headings are semi-bold.'],
        '--bs-heading-line-height': 'font.line-height.tight',
      },
    },
    {
      id: 'font-sizes', section: 'Typography', title: 'Font sizes and line heights', selector: ROOT, tier: 'semantic',
      sass: { map: '$font-sizes', nested: { '--bs-font-size-': 'font-size', '--bs-line-height-': 'line-height' } },
      why: 'xs to lg are body sizes; xl and up are heading sizes (h3 = xl, h2 = 2xl, h1 = 3xl). Quantum sizes are fixed: Bootstrap\'s fluid clamp() steps become fixed rem values.',
      tokens: {
        '--bs-font-size-xs': 'body.size.xs',
        '--bs-line-height-xs': 'font.line-height.normal',
        '--bs-font-size-sm': 'body.size.sm',
        '--bs-line-height-sm': 'font.line-height.normal',
        '--bs-font-size-md': 'body.size.md',
        '--bs-line-height-md': 'font.line-height.normal',
        '--bs-font-size-lg': 'body.size.lg',
        '--bs-line-height-lg': 'font.line-height.normal',
        '--bs-font-size-xl': 'heading.size.sm',
        '--bs-line-height-xl': 'font.line-height.tight',
        '--bs-font-size-2xl': 'heading.size.md',
        '--bs-line-height-2xl': 'font.line-height.tight',
        '--bs-font-size-3xl': 'heading.size.lg',
        '--bs-line-height-3xl': 'font.line-height.tight',
        '--bs-font-size-4xl': 'heading.size.xl',
        '--bs-line-height-4xl': 'font.line-height.tight',
        '--bs-font-size-5xl': 'heading.size.2xl',
        '--bs-line-height-5xl': 'font.line-height.tight',
        '--bs-font-size-6xl': 'heading.size.3xl',
        '--bs-line-height-6xl': 'font.line-height.tight',
      },
    },
    {
      id: 'font-weights', section: 'Typography', title: 'Font weights', selector: ROOT, tier: 'semantic',
      sass: { map: '$font-weights', strip: '--bs-font-weight-' },
      why: 'Quantum has regular, medium and semi-bold; Bootstrap\'s light, bold, lighter and bolder stay Bootstrap\'s.',
      tokens: {
        '--bs-font-weight-normal': 'body.weight.regular',
        '--bs-font-weight-medium': 'body.weight.medium',
        '--bs-font-weight-semibold': 'heading.weight.semi-bold',
      },
    },

    // ---- Shape and spacing -----------------------------------------------------------------
    {
      id: 'radii', section: 'Shape', title: 'Radii', selector: ROOT, tier: 'semantic',
      sass: { map: '$radii', strip: '--bs-radius-', numericKeys: true },
      why: 'Bootstrap rounds buttons and inputs with radius-5 and cards, alerts and menus with radius-7: they take Quantum\'s control radius (corner-radius.xs, 4px) and container radius (corner-radius.sm, 8px); the other steps fill the scale in order.',
      tokens: {
        '--bs-radius-0': 'corner-radius.none',
        '--bs-radius-1': 'corner-radius.3xs',
        '--bs-radius-2': 'corner-radius.2xs',
        '--bs-radius-3': ['corner-radius.2xs', 'Bootstrap\'s placeholder and kbd radius: the Skeleton text radius.'],
        '--bs-radius-4': 'corner-radius.xs',
        '--bs-radius-5': ['corner-radius.xs', 'button.container.border-radius.medium and text-field.control.border-radius.'],
        '--bs-radius-6': 'corner-radius.sm',
        '--bs-radius-7': ['corner-radius.sm', 'card.container.border-radius, alert.container.border-radius, dropdown.menu.border-radius.'],
        '--bs-radius-8': 'corner-radius.md',
        '--bs-radius-9': 'corner-radius.lg',
        '--bs-radius-pill': { token: 'corner-radius.full', sass: false, why: 'Bootstrap sets it after the $radii loop: not configurable in Sass, written after the @use.' },
      },
    },
    {
      id: 'spacers', section: 'Spacing', title: 'Spacers', selector: ROOT, tier: 'semantic',
      sass: { map: '$spacers', strip: '--bs-spacer-', numericKeys: true },
      why: 'Bootstrap\'s 0..12 steps (0, 4, 6, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48 px) all exist in Quantum\'s space scale: same values, now traced to it.',
      tokens: {
        '--bs-spacer-0': 'space.none',
        '--bs-spacer-1': 'space.4',
        '--bs-spacer-2': 'space.6',
        '--bs-spacer-3': 'space.8',
        '--bs-spacer-4': 'space.12',
        '--bs-spacer-5': 'space.16',
        '--bs-spacer-6': 'space.20',
        '--bs-spacer-7': 'space.24',
        '--bs-spacer-8': 'space.28',
        '--bs-spacer-9': 'space.32',
        '--bs-spacer-10': 'space.36',
        '--bs-spacer-11': 'space.40',
        '--bs-spacer-12': 'space.48',
      },
    },
    {
      id: 'spacer', section: 'Spacing', title: 'Base spacer', selector: ROOT, tier: 'semantic',
      sass: { map: '$root-tokens', strip: '--bs-' },
      tokens: { '--bs-spacer': 'space.16' },
    },

    // ---- Focus, elevation, motion ----------------------------------------------------------
    {
      id: 'focus', section: 'Focus', title: 'Focus ring', selector: ROOT, tier: 'semantic',
      sass: { map: '$root-tokens', strip: '--bs-' },
      tokens: {
        '--bs-focus-ring-width': 'focus.ring.width',
        '--bs-focus-ring-offset': 'focus.ring.offset',
        '--bs-focus-ring-color': 'color.focus.ring',
      },
    },
    {
      id: 'elevation', section: 'Elevation', title: 'Shadow color', selector: ROOT, tier: 'semantic',
      sass: { map: '$root-tokens', strip: '--bs-' },
      why: 'Quantum has shadow colors but no shadow geometry (Effects foundation): Bootstrap\'s geometry stays, tinted with Quantum\'s shadow color. Bootstrap replaces its alpha with its own (oklch(from …)), times --bs-shadow-strength.',
      tokens: { '--bs-shadow-color': 'effect.shadow.5' },
    },
    {
      id: 'motion', section: 'Motion', title: 'Overlay easing', selector: ROOT, tier: 'semantic',
      sass: { map: '$root-tokens', strip: '--bs-' },
      tokens: { '--bs-transition-timing-overlay': ['easing.standard', 'Bootstrap\'s shared curve for menus, dialogs and drawers.'] },
    },

    // ---- Divider ---------------------------------------------------------------------------
    {
      id: 'divider', section: 'Divider', component: 'divider', title: '<hr> and .vr', selector: ROOT, tier: 'component',
      sass: { map: '$root-tokens', strip: '--bs-' },
      tokens: {
        '--bs-hr-border-color': 'divider.container.color',
        '--bs-hr-margin-y': 'divider.container.margin-block.horizontal',
        '--bs-vr-border-width': 'divider.container.border-width',
      },
    },

    // ---- Buttons ---------------------------------------------------------------------------
    {
      id: 'btn-input', section: 'Button', component: 'button', title: 'Button and input sizes (root)', selector: ROOT, tier: 'component',
      sass: { map: '$root-tokens', strip: '--bs-' },
      why: 'Bootstrap sizes buttons, inputs and pagination from one set of --btn-input-* tokens. They take the Button sizes (xsmall, small, medium, large = xs, sm, default, lg); the form controls, whose Quantum heights differ (32, 40, 48), get their own values on .form-control below.',
      tokens: {
        '--bs-btn-input-fg': ['text-field.control.color.default', 'Bootstrap\'s shared control foreground (inputs, OTP, chip input): the Text field value color.'],
        '--bs-btn-input-bg': ['text-field.control.background.default', 'Bootstrap\'s shared control background (inputs, OTP, chip input, floating labels): the Text field background.'],
        '--bs-btn-input-gap': 'button.container.gap.medium',
        '--bs-btn-input-min-height': 'button.container.min-height.medium',
        '--bs-btn-input-padding-y': 'button.container.padding-block.medium',
        '--bs-btn-input-padding-x': 'button.container.padding-inline.medium',
        '--bs-btn-input-font-size': { token: 'button.label.typography.medium', member: 'fontSize' },
        '--bs-btn-input-font-weight': { token: 'button.label.typography.medium', member: 'fontWeight' },
        '--bs-btn-input-line-height': { token: 'button.label.typography.medium', member: 'lineHeight' },
        '--bs-btn-input-border-radius': 'button.container.border-radius.medium',
        '--bs-btn-input-xs-gap': 'button.container.gap.xsmall',
        '--bs-btn-input-xs-min-height': 'button.container.min-height.xsmall',
        '--bs-btn-input-xs-padding-y': 'button.container.padding-block.xsmall',
        '--bs-btn-input-xs-padding-x': 'button.container.padding-inline.xsmall',
        '--bs-btn-input-xs-font-size': { token: 'button.label.typography.xsmall', member: 'fontSize' },
        '--bs-btn-input-xs-line-height': { token: 'button.label.typography.xsmall', member: 'lineHeight' },
        '--bs-btn-input-xs-border-radius': 'button.container.border-radius.xsmall',
        '--bs-btn-input-sm-gap': 'button.container.gap.small',
        '--bs-btn-input-sm-min-height': 'button.container.min-height.small',
        '--bs-btn-input-sm-padding-y': 'button.container.padding-block.small',
        '--bs-btn-input-sm-padding-x': 'button.container.padding-inline.small',
        '--bs-btn-input-sm-font-size': { token: 'button.label.typography.small', member: 'fontSize' },
        '--bs-btn-input-sm-line-height': { token: 'button.label.typography.small', member: 'lineHeight' },
        '--bs-btn-input-sm-border-radius': 'button.container.border-radius.small',
        '--bs-btn-input-lg-gap': 'button.container.gap.large',
        '--bs-btn-input-lg-min-height': 'button.container.min-height.large',
        '--bs-btn-input-lg-padding-y': 'button.container.padding-block.large',
        '--bs-btn-input-lg-padding-x': 'button.container.padding-inline.large',
        '--bs-btn-input-lg-font-size': { token: 'button.label.typography.large', member: 'fontSize' },
        '--bs-btn-input-lg-line-height': { token: 'button.label.typography.large', member: 'lineHeight' },
        '--bs-btn-input-lg-border-radius': 'button.container.border-radius.large',
      },
    },
    {
      id: 'btn', section: 'Button', component: 'button', title: 'Every button', tier: 'component',
      selector: '.btn, .btn-link, .btn-icon, .btn-solid, .btn-outline, .btn-subtle, .btn-text',
      sass: { map: '$button-tokens', strip: '--bs-' },
      tokens: {
        '--bs-btn-border-width': 'button.container.border-width',
        '--bs-btn-transition-duration': 'button.container.transition.duration',
        '--bs-btn-transition-timing': 'button.container.transition.easing',
        '--bs-btn-disabled-opacity': { literal: '1', rule: 'effects.no-faded-text', why: 'Quantum shows disabled with its disabled colors (set per variant below), never by fading.' },
      },
    },
    {
      id: 'btn-focus', section: 'Button', component: 'button', title: 'Focus ring offset', tier: 'component',
      selector: '.btn:focus-visible, .btn-link:focus-visible, .btn-icon:focus-visible, .btn-solid:focus-visible, .btn-outline:focus-visible, .btn-subtle:focus-visible, .btn-text:focus-visible',
      tokens: { '--bs-focus-ring-offset': 'button.container.outline-offset.focus-visible' },
    },
    {
      id: 'btn-solid-disabled', section: 'Button', component: 'button', title: 'Solid disabled (accent)', tier: 'component',
      selector: '.btn-solid:disabled, .btn-solid.disabled, .btn-solid.btn-check:has(input:disabled)',
      tokens: {
        '--bs-btn-disabled-bg': 'button.container.background.accent.disabled',
        '--bs-btn-disabled-color': 'button.label.color.accent.disabled',
        '--bs-btn-disabled-border-color': 'button.container.border-color.accent.disabled',
      },
    },
    {
      id: 'btn-outline-disabled', section: 'Button', component: 'button', title: 'Outline disabled (subtle)', tier: 'component',
      selector: '.btn-outline:disabled, .btn-outline.disabled, .btn-outline.btn-check:has(input:disabled)',
      why: 'Quantum has no outline emphasis: the bordered subtle emphasis is the nearest.',
      tokens: {
        '--bs-btn-disabled-bg': 'button.container.background.subtle.disabled',
        '--bs-btn-disabled-color': 'button.label.color.subtle.disabled',
        '--bs-btn-disabled-border-color': 'button.container.border-color.subtle.disabled',
      },
    },
    {
      id: 'btn-subtle-disabled', section: 'Button', component: 'button', title: 'Subtle disabled', tier: 'component',
      selector: '.btn-subtle:disabled, .btn-subtle.disabled, .btn-subtle.btn-check:has(input:disabled)',
      tokens: {
        '--bs-btn-disabled-bg': 'button.container.background.subtle.disabled',
        '--bs-btn-disabled-color': 'button.label.color.subtle.disabled',
        '--bs-btn-disabled-border-color': 'button.container.border-color.subtle.disabled',
      },
    },
    {
      id: 'btn-text-disabled', section: 'Button', component: 'button', title: 'Text disabled (ghost)', tier: 'component',
      selector: '.btn-text:disabled, .btn-text.disabled, .btn-text.btn-check:has(input:disabled)',
      tokens: {
        '--bs-btn-disabled-bg': 'button.container.background.ghost.disabled',
        '--bs-btn-disabled-color': 'button.label.color.ghost.disabled',
        '--bs-btn-disabled-border-color': 'button.container.border-color.ghost.disabled',
      },
    },

    // ---- Form controls ---------------------------------------------------------------------
    {
      id: 'form-control', section: 'Text field', component: 'text-field', title: '.form-control (input, select, textarea)', tier: 'component',
      selector: '.form-control',
      also: ['.form-control-plaintext'],
      sass: { map: '$form-control-tokens', strip: '--bs-' },
      tokens: {
        '--bs-control-min-height': 'text-field.control.min-height.medium',
        '--bs-control-padding-x': 'text-field.control.padding-inline.medium',
        '--bs-control-padding-y': ['space.7', 'Bootstrap pads inputs and textareas alike; Quantum centers a field\'s line in its min-height (no block padding) and pads only the textarea. The largest space step that keeps a medium input at its 40px min-height (line 24px + 2 x 7px + borders).'],
        '--bs-control-font-size': { token: 'text-field.control.typography.medium', member: 'fontSize' },
        '--bs-control-line-height': { token: 'text-field.control.typography.medium', member: 'lineHeight' },
        '--bs-control-fg': 'text-field.control.color.default',
        '--bs-control-bg': 'text-field.control.background.default',
        '--bs-control-border-width': 'text-field.control.border-width',
        '--bs-control-border-color': 'text-field.control.border-color.default',
        '--bs-control-border-radius': 'text-field.control.border-radius',
        '--bs-control-box-shadow': { literal: 'none', rule: 'effects.shadow', why: 'No shadow is drawn in Quantum: no inset shadow on fields.' },
        '--bs-control-transition-duration': 'text-field.control.transition.duration',
        '--bs-control-transition-timing': 'text-field.control.transition.easing',
        '--bs-control-placeholder-color': 'text-field.control.placeholder-color.default',
        '--bs-control-disabled-color': 'text-field.control.color.disabled',
        '--bs-control-disabled-bg': 'text-field.control.background.disabled',
        '--bs-control-disabled-border-color': 'text-field.control.border-color.disabled',
      },
    },
    {
      id: 'form-control-sm', section: 'Text field', component: 'text-field', title: '.form-control-sm (small)', tier: 'component',
      selector: '.form-control-sm',
      tokens: {
        '--bs-control-min-height': 'text-field.control.min-height.small',
        '--bs-control-padding-x': 'text-field.control.padding-inline.small',
        '--bs-control-padding-y': ['space.4', 'Keeps a small input at its 32px min-height (line 21px).'],
        '--bs-control-font-size': { token: 'text-field.control.typography.small', member: 'fontSize' },
        '--bs-control-line-height': { token: 'text-field.control.typography.small', member: 'lineHeight' },
        '--bs-control-border-radius': ['text-field.control.border-radius', 'Bootstrap gives small controls the small button radius; a Quantum field keeps one radius at every size.'],
      },
    },
    {
      id: 'form-control-lg', section: 'Text field', component: 'text-field', title: '.form-control-lg (large)', tier: 'component',
      selector: '.form-control-lg',
      tokens: {
        '--bs-control-min-height': 'text-field.control.min-height.large',
        '--bs-control-padding-x': 'text-field.control.padding-inline.large',
        '--bs-control-padding-y': ['space.8', 'Keeps a large input at its 48px min-height (line 30px).'],
        '--bs-control-font-size': { token: 'text-field.control.typography.large', member: 'fontSize' },
        '--bs-control-line-height': { token: 'text-field.control.typography.large', member: 'lineHeight' },
        '--bs-control-border-radius': 'text-field.control.border-radius',
      },
    },
    {
      id: 'form-control-focus', section: 'Text field', component: 'text-field', title: 'Focus ring offset', tier: 'component',
      selector: '.form-control:focus-visible, .form-control:focus-within',
      tokens: { '--bs-focus-ring-offset': 'text-field.control.outline-offset.focus-visible' },
    },
    {
      id: 'form-control-invalid', section: 'Text field', component: 'text-field', title: 'Invalid (.is-invalid)', tier: 'component',
      selector: '.form-control.is-invalid',
      tokens: { '--bs-control-border-color': 'text-field.control.border-color.invalid' },
    },
    {
      id: 'form-control-user-invalid', section: 'Text field', component: 'text-field', title: 'Invalid (:user-invalid)', tier: 'component',
      selector: '[data-bs-validate] .form-control:user-invalid',
      tokens: { '--bs-control-border-color': 'text-field.control.border-color.invalid' },
    },
    {
      id: 'chip-input', section: 'Text field', component: 'text-field', title: '.chip-input', tier: 'component',
      selector: '.chip-input',
      sass: { map: '$chip-input-tokens', strip: '--bs-' },
      why: 'Bootstrap\'s chip input is a field holding chips: it takes the Text field control.',
      tokens: {
        '--bs-control-fg': 'text-field.control.color.default',
        '--bs-control-bg': 'text-field.control.background.default',
        '--bs-control-border-width': 'text-field.control.border-width',
        '--bs-control-border-color': 'text-field.control.border-color.default',
        '--bs-control-border-radius': 'text-field.control.border-radius',
      },
    },
    {
      id: 'labels', section: 'Text field', component: 'text-field', title: 'Labels (.form-label)', selector: ROOT, tier: 'component',
      sass: { map: '$root-tokens', strip: '--bs-' },
      why: 'Bootstrap reads these with fallbacks on .form-label; declared on the root, they reach every label.',
      tokens: {
        '--bs-label-color': 'text-field.label.color.default',
        '--bs-label-font-size': { token: 'text-field.label.typography', member: 'fontSize' },
        '--bs-label-font-weight': { token: 'text-field.label.typography', member: 'fontWeight' },
      },
    },
    {
      id: 'form-text', section: 'Text field', component: 'text-field', title: 'Description (.form-text)', tier: 'component',
      selector: '.form-text',
      sass: { map: '$form-text-tokens', strip: '--bs-' },
      tokens: {
        '--bs-form-text-margin-top': 'text-field.container.gap',
        '--bs-form-text-font-size': { token: 'text-field.description.typography', member: 'fontSize' },
        '--bs-form-text-color': 'text-field.description.color.default',
      },
    },

    // ---- Checkbox, radio, switch, range ----------------------------------------------------
    {
      id: 'controls', section: 'Checkbox', component: 'checkbox', title: 'Selection controls (root)', selector: ROOT, tier: 'component',
      sass: { map: '$root-tokens', strip: '--bs-' },
      tokens: {
        '--bs-control-checked-bg': 'checkbox.control.background.checked',
        '--bs-control-checked-border-color': 'checkbox.control.border-color.checked',
        '--bs-control-disabled-bg': 'checkbox.control.background.disabled',
        '--bs-control-transition-duration': 'checkbox.control.transition.duration',
        '--bs-control-transition-timing': 'checkbox.control.transition.easing',
      },
    },
    {
      id: 'check', section: 'Checkbox', component: 'checkbox', title: '.check', tier: 'component',
      selector: '.check',
      sass: { map: '$check-tokens', strip: '--bs-' },
      tokens: {
        '--bs-check-size': 'checkbox.control.size.medium',
        '--bs-check-bg': 'checkbox.control.background.default',
        '--bs-check-border-color': 'checkbox.control.border-color.default',
        '--bs-check-checked-bg': 'checkbox.control.background.checked',
        '--bs-check-checked-border-color': 'checkbox.control.border-color.checked',
        '--bs-check-indeterminate-bg': 'checkbox.control.background.indeterminate',
        '--bs-check-indeterminate-border-color': 'checkbox.control.border-color.indeterminate',
        '--bs-check-disabled-bg': 'checkbox.control.background.disabled',
      },
    },
    {
      id: 'check-sm', section: 'Checkbox', component: 'checkbox', title: '.check-sm (small)', tier: 'component',
      selector: '.check-sm',
      tokens: { '--bs-check-size': 'checkbox.control.size.small' },
    },
    {
      id: 'check-invalid', section: 'Checkbox', component: 'checkbox', title: 'Invalid (.is-invalid)', tier: 'component',
      selector: '.check.is-invalid',
      tokens: { '--bs-check-border-color': 'checkbox.control.border-color.invalid' },
    },
    {
      id: 'check-user-invalid', section: 'Checkbox', component: 'checkbox', title: 'Invalid (:user-invalid)', tier: 'component',
      selector: '[data-bs-validate] .check:user-invalid',
      tokens: { '--bs-check-border-color': 'checkbox.control.border-color.invalid' },
    },
    {
      id: 'radio', section: 'Radio group', component: 'radio-group', title: '.radio', tier: 'component',
      selector: '.radio',
      sass: { map: '$radio-tokens', strip: '--bs-' },
      tokens: {
        '--bs-radio-size': 'radio-group.control.size.medium',
        '--bs-radio-bg': 'radio-group.control.background.default',
        '--bs-radio-border-color': 'radio-group.control.border-color.default',
        '--bs-radio-checked-bg': 'radio-group.control.background.checked',
        '--bs-radio-checked-border-color': 'radio-group.control.border-color.checked',
        '--bs-radio-disabled-bg': 'radio-group.control.background.disabled',
      },
    },
    {
      id: 'radio-sm', section: 'Radio group', component: 'radio-group', title: '.radio-sm (small)', tier: 'component',
      selector: '.radio-sm',
      tokens: { '--bs-radio-size': 'radio-group.control.size.small' },
    },
    {
      id: 'radio-invalid', section: 'Radio group', component: 'radio-group', title: 'Invalid (.is-invalid)', tier: 'component',
      selector: '.radio.is-invalid',
      tokens: { '--bs-radio-border-color': 'radio-group.control.border-color.invalid' },
    },
    {
      id: 'radio-user-invalid', section: 'Radio group', component: 'radio-group', title: 'Invalid (:user-invalid)', tier: 'component',
      selector: '[data-bs-validate] .radio:user-invalid',
      tokens: { '--bs-radio-border-color': 'radio-group.control.border-color.invalid' },
    },
    {
      id: 'switch', section: 'Switch', component: 'switch', title: '.switch', tier: 'component',
      selector: '.switch',
      sass: { map: '$switch-tokens', strip: '--bs-' },
      tokens: {
        '--bs-switch-height': 'switch.control.height.medium',
        '--bs-switch-width': 'switch.control.width.medium',
        '--bs-switch-padding': 'switch.thumb.margin',
        '--bs-switch-bg': 'switch.control.background.default',
        '--bs-switch-border-width': 'switch.control.border-width',
        '--bs-switch-border-color': 'switch.control.border-color.default',
        '--bs-switch-indicator-bg': 'switch.thumb.background.default',
        '--bs-switch-indicator-width': 'switch.thumb.size.medium',
        '--bs-switch-indicator-height': 'switch.thumb.size.medium',
        '--bs-switch-checked-bg': 'switch.control.background.checked',
        '--bs-switch-checked-border-color': 'switch.control.border-color.checked',
        '--bs-switch-checked-indicator-bg': 'switch.thumb.background.checked',
        '--bs-switch-disabled-bg': 'switch.control.background.disabled',
        '--bs-switch-disabled-indicator-bg': 'switch.thumb.background.disabled',
      },
    },
    {
      id: 'switch-sm', section: 'Switch', component: 'switch', title: '.switch-sm (small)', tier: 'component',
      selector: '.switch-sm',
      tokens: {
        '--bs-switch-height': 'switch.control.height.small',
        '--bs-switch-width': 'switch.control.width.small',
        '--bs-switch-indicator-width': 'switch.thumb.size.small',
        '--bs-switch-indicator-height': 'switch.thumb.size.small',
      },
    },
    {
      id: 'range', section: 'Slider', component: 'slider', title: '.form-range', tier: 'component',
      selector: '.form-range',
      sass: { map: '$range-tokens', strip: '--bs-' },
      why: 'The thumb color and the filled track keep Bootstrap\'s --theme-bg / --primary-base, so .theme-* still colors a slider; brand is Quantum\'s slider.thumb.background.default.',
      tokens: {
        '--bs-range-track-height': 'slider.control.height.medium',
        '--bs-range-track-bg': 'slider.control.background.default',
        '--bs-range-track-border-radius': 'slider.control.border-radius',
        '--bs-range-track-disabled-bg': 'slider.control.background.disabled',
        '--bs-range-thumb-width': 'slider.thumb.size.medium',
        '--bs-range-thumb-border': { template: '{slider.thumb.border-width} solid {slider.thumb.border-color.default}' },
        '--bs-range-thumb-border-radius': 'slider.thumb.border-radius',
        '--bs-range-thumb-disabled-bg': 'slider.thumb.background.disabled',
        '--bs-range-thumb-box-shadow': { literal: 'none', rule: 'effects.shadow', why: 'No shadow is drawn in Quantum.' },
        '--bs-range-thumb-transition-duration': 'slider.control.transition.duration',
        '--bs-range-thumb-transition-timing': 'slider.control.transition.easing',
      },
    },

    // ---- Content components ----------------------------------------------------------------
    {
      id: 'card', section: 'Card', component: 'card', title: '.card', tier: 'component',
      selector: '.card',
      sass: { map: '$card-tokens', strip: '--bs-' },
      tokens: {
        '--bs-card-bg': 'card.container.background.level-1',
        '--bs-card-border-color': 'card.container.border-color.level-1',
        '--bs-card-border-width': 'card.container.border-width',
        '--bs-card-border-radius': 'card.container.border-radius',
        '--bs-card-spacer-x': 'card.container.padding',
        '--bs-card-spacer-y': 'card.container.padding',
        '--bs-card-body-gap': 'card.container.gap',
        '--bs-card-color': ['card.title.color', 'Bootstrap colors the whole card body (title included) with one color: the title color; the subtitle takes the description color.'],
        '--bs-card-subtitle-color': 'card.description.color',
      },
    },
    {
      id: 'badge', section: 'Badge', component: 'badge', title: '.badge', tier: 'component',
      selector: '.badge',
      sass: { map: '$badge-tokens', strip: '--bs-' },
      tokens: {
        '--bs-badge-padding-x': 'badge.container.padding-inline.medium',
        '--bs-badge-font-size': { token: 'badge.label.typography.medium', member: 'fontSize' },
        '--bs-badge-font-weight': { token: 'badge.label.typography.medium', member: 'fontWeight' },
        '--bs-badge-border-width': 'badge.container.border-width',
        '--bs-badge-border-radius': 'badge.container.border-radius',
      },
    },
    {
      id: 'alert', section: 'Alert', component: 'alert', title: '.alert', tier: 'component',
      selector: '.alert',
      sass: { map: '$alert-tokens', strip: '--bs-' },
      tokens: {
        '--bs-alert-gap': 'alert.container.gap',
        '--bs-alert-padding-x': 'alert.container.padding',
        '--bs-alert-padding-y': 'alert.container.padding',
        '--bs-alert-border-radius': 'alert.container.border-radius',
        '--bs-alert-color': ['alert.message.color', 'The color of an alert without a theme class; a themed alert takes the theme fg (Quantum\'s alert title color).'],
      },
    },
    {
      id: 'accordion', section: 'Accordion', component: 'accordion', title: '.accordion', tier: 'component',
      selector: '.accordion',
      sass: { map: '$accordion-tokens', strip: '--bs-' },
      tokens: {
        '--bs-accordion-btn-padding-x': 'accordion.trigger.padding-inline',
        '--bs-accordion-btn-padding-y': 'accordion.trigger.padding-block',
        '--bs-accordion-body-padding-x': 'accordion.panel.padding-inline',
        '--bs-accordion-body-padding-y': 'accordion.panel.padding-block',
        '--bs-accordion-font-size': { token: 'accordion.title.typography.medium', member: 'fontSize' },
        '--bs-accordion-color': 'accordion.panel.color',
        '--bs-accordion-bg': ['accordion.trigger.background.default', 'Quantum\'s accordion has no surface of its own.'],
        '--bs-accordion-border-color': 'accordion.item.border-color',
        '--bs-accordion-border-width': 'accordion.item.border-width',
        '--bs-accordion-border-radius': ['accordion.trigger.border-radius', 'Quantum rounds the trigger; Bootstrap rounds the group box, the only radius it exposes.'],
        '--bs-accordion-btn-color': 'accordion.title.color',
        '--bs-accordion-btn-bg': 'accordion.trigger.background.default',
        '--bs-accordion-active-color': 'accordion.title.color',
        '--bs-accordion-active-bg': ['accordion.trigger.background.default', 'An expanded trigger keeps its background in Quantum.'],
        '--bs-accordion-btn-icon-width': 'accordion.indicator.size.medium',
        '--bs-accordion-transition-duration': 'accordion.trigger.transition.duration',
        '--bs-accordion-transition-timing': 'accordion.trigger.transition.easing',
        '--bs-accordion-btn-icon-transition': { template: 'transform {accordion.indicator.transition.duration} {accordion.indicator.transition.easing}' },
      },
    },
    {
      id: 'accordion-sm', section: 'Accordion', component: 'accordion', title: '.accordion-sm (small)', tier: 'component',
      selector: '.accordion-sm',
      tokens: {
        '--bs-accordion-font-size': { token: 'accordion.title.typography.small', member: 'fontSize' },
        '--bs-accordion-border-radius': 'accordion.trigger.border-radius',
        '--bs-accordion-btn-icon-width': 'accordion.indicator.size.small',
      },
    },
    {
      id: 'progress', section: 'Progress bar', component: 'progress-bar', title: '.progress', tier: 'component',
      selector: '.progress, .progress-stacked',
      sass: { map: '$progress-tokens', strip: '--bs-' },
      tokens: {
        '--bs-progress-height': 'progress-bar.track.height.medium',
        '--bs-progress-font-size': { token: 'progress-bar.value.typography', member: 'fontSize' },
        '--bs-progress-bg': 'progress-bar.track.background',
        '--bs-progress-border-radius': 'progress-bar.track.border-radius',
        '--bs-progress-box-shadow': { literal: 'none', rule: 'effects.shadow', why: 'No shadow is drawn in Quantum.' },
        '--bs-progress-bar-bg': 'progress-bar.indicator.background',
      },
    },
    {
      id: 'spinner', section: 'Spinner', component: 'spinner', title: '.spinner-border', tier: 'component',
      selector: '.spinner-border',
      sass: { map: '$spinner-border-tokens', strip: '--bs-' },
      tokens: {
        '--bs-spinner-width': 'spinner.ring.size.medium',
        '--bs-spinner-height': 'spinner.ring.size.medium',
        '--bs-spinner-border-width': 'spinner.ring.border-width.medium',
      },
    },
    {
      id: 'spinner-sm', section: 'Spinner', component: 'spinner', title: '.spinner-sm (small)', tier: 'component',
      selector: '.spinner-sm',
      tokens: {
        '--bs-spinner-width': 'spinner.ring.size.small',
        '--bs-spinner-height': 'spinner.ring.size.small',
        '--bs-spinner-border-width': 'spinner.ring.border-width.small',
      },
    },
    {
      id: 'pagination', section: 'Pagination', component: 'pagination', title: '.pagination', tier: 'component',
      selector: '.pagination',
      sass: { map: '$pagination-tokens', strip: '--bs-' },
      tokens: {
        '--bs-pagination-min-height': 'pagination.link.size.medium',
        '--bs-pagination-padding-x': 'pagination.link.padding-inline.medium',
        '--bs-pagination-font-size': { token: 'pagination.link.typography.medium', member: 'fontSize' },
        '--bs-pagination-color': 'pagination.link.color.default',
        '--bs-pagination-bg': 'pagination.link.background.default',
        '--bs-pagination-border-width': ['stroke-width.none', 'Quantum pagination links have no border.'],
        '--bs-pagination-border-radius': 'pagination.link.border-radius',
        '--bs-pagination-hover-color': 'pagination.link.color.default',
        '--bs-pagination-hover-bg': 'pagination.link.background.hover',
        '--bs-pagination-active-color': 'pagination.link.color.current',
        '--bs-pagination-active-bg': 'pagination.link.background.current',
        '--bs-pagination-active-border-color': 'pagination.link.background.current',
        '--bs-pagination-disabled-color': 'pagination.link.color.disabled',
        '--bs-pagination-disabled-bg': 'pagination.link.background.disabled',
      },
    },
    {
      id: 'pagination-sm', section: 'Pagination', component: 'pagination', title: '.pagination-sm (small)', tier: 'component',
      selector: '.pagination-sm',
      tokens: {
        '--bs-pagination-min-height': 'pagination.link.size.small',
        '--bs-pagination-padding-x': 'pagination.link.padding-inline.small',
        '--bs-pagination-font-size': { token: 'pagination.link.typography.small', member: 'fontSize' },
        '--bs-pagination-border-radius': 'pagination.link.border-radius',
      },
    },
    {
      id: 'breadcrumb', section: 'Breadcrumb', component: 'breadcrumb', title: '.breadcrumb', tier: 'component',
      selector: '.breadcrumb',
      sass: { map: '$breadcrumb-tokens', strip: '--bs-' },
      tokens: {
        '--bs-breadcrumb-font-size': { token: 'breadcrumb.link.typography.medium', member: 'fontSize' },
        '--bs-breadcrumb-divider-color': 'breadcrumb.separator.color',
        '--bs-breadcrumb-link-padding-x': ['breadcrumb.container.gap', 'Bootstrap spaces the items with the links\' inline padding (and a divider margin derived from it): Quantum\'s gap between items goes there.'],
        '--bs-breadcrumb-link-color': 'breadcrumb.link.color.default',
        '--bs-breadcrumb-link-hover-color': 'breadcrumb.link.color.hover',
        '--bs-breadcrumb-link-hover-bg': ['color.transparent', 'A Quantum breadcrumb link has no hover fill.'],
        '--bs-breadcrumb-link-active-color': 'breadcrumb.link.color.current',
        '--bs-breadcrumb-link-border-radius': 'breadcrumb.link.border-radius',
      },
    },
    {
      id: 'avatar', section: 'Avatar', component: 'avatar', title: '.avatar', tier: 'component',
      selector: '.avatar',
      sass: { map: '$avatar-tokens', strip: '--bs-' },
      why: 'Bootstrap\'s avatar sizes xs, sm and default (24, 32, 40px) already equal Quantum\'s small, medium and large: they are left as they are.',
      tokens: {
        '--bs-avatar-border-radius': 'avatar.container.border-radius.circle',
        '--bs-avatar-bg': 'avatar.container.background',
        '--bs-avatar-color': 'avatar.initials.color',
      },
    },
    {
      id: 'menu', section: 'Dropdown', component: 'dropdown', title: '.menu', tier: 'component',
      selector: '.menu',
      sass: { map: '$menu-tokens', strip: '--bs-' },
      tokens: {
        '--bs-menu-gap': ['dropdown.menu.offset', 'The distance between the toggle and the menu.'],
        '--bs-menu-padding-x': 'dropdown.menu.padding',
        '--bs-menu-padding-y': 'dropdown.menu.padding',
        '--bs-menu-font-size': { token: 'dropdown.item-label.typography', member: 'fontSize' },
        '--bs-menu-bg': 'dropdown.menu.background',
        '--bs-menu-border-color': 'dropdown.menu.border-color',
        '--bs-menu-border-width': 'dropdown.menu.border-width',
        '--bs-menu-border-radius': 'dropdown.menu.border-radius',
        '--bs-menu-box-shadow': { literal: 'none', rule: 'effects.elevation', why: 'A Quantum menu stands apart by its surface level and border, not by a shadow.' },
        '--bs-menu-divider-bg': 'dropdown.separator.color',
        '--bs-menu-divider-margin-y': 'dropdown.separator.margin-block',
        '--bs-menu-item-color': 'dropdown.item-label.color.neutral.default',
        '--bs-menu-item-font-weight': { token: 'dropdown.item-label.typography', member: 'fontWeight' },
        '--bs-menu-item-hover-color': 'dropdown.item-label.color.neutral.hover',
        '--bs-menu-item-hover-bg': 'dropdown.item.background.neutral.hover',
        '--bs-menu-item-active-color': 'dropdown.item-label.color.neutral.active',
        '--bs-menu-item-active-bg': 'dropdown.item.background.neutral.active',
        '--bs-menu-item-disabled-color': 'dropdown.item-label.color.disabled',
        '--bs-menu-item-gap': 'dropdown.item.gap',
        '--bs-menu-item-padding-x': 'dropdown.item.padding-inline',
        '--bs-menu-item-border-radius': 'dropdown.item.border-radius',
        '--bs-menu-icon-size': 'dropdown.item-icon.size',
      },
    },
  ],

  equivalences: [
    {
      component: 'button', bootstrap: 'Buttons', base: '',
      options: {
        emphasis: { accent: '.btn-solid', subtle: '.btn-subtle', ghost: '.btn-text' },
        intent: { neutral: '.theme-secondary', brand: '.theme-primary', error: '.theme-danger' },
        size: { xsmall: '.btn-xs', small: '.btn-sm', medium: '', large: '.btn-lg' },
      },
      combinations: [
        { when: { emphasis: 'accent', intent: 'neutral' }, classes: '.btn-solid.theme-inverse', why: 'Quantum\'s neutral accent is the inverse surface.' },
      ],
      states: { hover: ':hover', active: ':active', 'focus-visible': ':focus-visible', disabled: ':disabled' },
      parts: { icon: '.material-symbols-outlined (any inline icon)' },
      bootstrapOnly: ['.btn-outline', '.btn-link', '.btn-styled', '.btn-group', '.btn-check', '.btn-close'],
    },
    {
      component: 'icon-button', bootstrap: 'Buttons', base: '.btn-icon',
      options: {
        emphasis: { accent: '.btn-solid', subtle: '.btn-subtle', ghost: '.btn-text' },
        intent: { neutral: '.theme-secondary', brand: '.theme-primary', error: '.theme-danger' },
        size: { xsmall: '.btn-xs', small: '.btn-sm', medium: '', large: '.btn-lg' },
      },
      combinations: [
        { when: { emphasis: 'accent', intent: 'neutral' }, classes: '.btn-icon.btn-solid.theme-inverse' },
      ],
      states: { disabled: ':disabled' },
    },
    {
      component: 'badge', bootstrap: 'Badge', base: '.badge',
      options: {
        emphasis: { accent: '', subtle: '.badge-subtle' },
        intent: { neutral: '.theme-secondary', brand: '.theme-primary', success: '.theme-success', warning: '.theme-warning', error: '.theme-danger', info: '.theme-info' },
        size: { small: null, medium: '' },
      },
      combinations: [
        { when: { emphasis: 'accent', intent: 'neutral' }, classes: '.badge.theme-inverse' },
      ],
      bootstrapOnly: ['.badge-outline', '.badge-lg'],
    },
    {
      component: 'alert', bootstrap: 'Alert', base: '.alert',
      options: { intent: { info: '.theme-info', success: '.theme-success', warning: '.theme-warning', error: '.theme-danger' } },
      parts: { title: '.alert-heading', message: 'text after .alert-heading' },
      bootstrapOnly: ['dismissible alerts (.btn-close)', '.alert-link'],
    },
    {
      component: 'card', bootstrap: 'Card', base: '.card',
      options: { surface: { 'level-1': '', 'level-2': null } },
      parts: { container: '.card', title: '.card-body > h5 (a heading)', description: '.card-subtitle or a paragraph' },
      bootstrapOnly: ['.card-header', '.card-footer', '.card-img-*', '.card-group', '.card-translucent'],
    },
    {
      component: 'accordion', bootstrap: 'Accordion', base: '.accordion',
      options: { size: { small: '.accordion-sm', medium: '' } },
      states: { expanded: '[open]' },
      parts: { item: '.accordion-item (<details>)', trigger: '.accordion-header (<summary>)', indicator: '.accordion-icon', panel: '.accordion-body' },
    },
    {
      component: 'avatar', bootstrap: 'Avatar', base: '.avatar',
      options: { size: { small: '.avatar-xs', medium: '.avatar-sm', large: '' }, shape: { circle: '', square: null } },
      parts: { image: '.avatar-img', initials: 'text inside .avatar' },
      bootstrapOnly: ['.avatar-lg', '.avatar-xl', '.avatar-status', '.avatar-stack'],
    },
    {
      component: 'breadcrumb', bootstrap: 'Breadcrumb', base: '.breadcrumb',
      options: { size: { small: null, medium: '' } },
      parts: { item: '.breadcrumb-item', link: '.breadcrumb-link', separator: '.breadcrumb-divider' },
    },
    { component: 'checkbox', bootstrap: 'Checks', base: 'input.check', options: { size: { small: '.check-sm', medium: '' } }, states: { checked: ':checked', indeterminate: ':indeterminate', invalid: '.is-invalid', disabled: ':disabled' } },
    { component: 'checkbox-group', bootstrap: 'Checks', base: 'fieldset.form-group of input.check', options: { orientation: { vertical: '', horizontal: null }, size: { small: '.check-sm', medium: '' } } },
    { component: 'radio-group', bootstrap: 'Radios', base: 'fieldset.form-group of input.radio', options: { orientation: { vertical: '', horizontal: null }, size: { small: '.radio-sm', medium: '' } }, states: { checked: ':checked', invalid: '.is-invalid', disabled: ':disabled' } },
    { component: 'switch', bootstrap: 'Switch', base: '.switch', options: { size: { small: '.switch-sm', medium: '' } }, states: { checked: ':has(input:checked)', disabled: ':has(input:disabled)' } },
    { component: 'slider', bootstrap: 'Range', base: '.form-range > .form-range-input', options: { size: { small: null, medium: '' } }, states: { disabled: ':disabled' } },
    {
      component: 'text-field', bootstrap: 'Form control', base: 'input.form-control',
      options: { size: { small: '.form-control-sm', medium: '', large: '.form-control-lg' } },
      states: { invalid: '.is-invalid', readonly: '[readonly]', disabled: ':disabled' },
      parts: { label: '.form-label', control: '.form-control', description: '.form-text', 'error-message': '.invalid-feedback' },
    },
    { component: 'textarea', bootstrap: 'Form control', base: 'textarea.form-control', options: { size: { small: '.form-control-sm', medium: '', large: '.form-control-lg' } } },
    { component: 'select', bootstrap: 'Form control', base: 'select.form-control', options: { size: { small: '.form-control-sm', medium: '', large: '.form-control-lg' } } },
    { component: 'number-field', bootstrap: 'Form control', base: 'input[type=number].form-control', options: { size: { small: '.form-control-sm', medium: '', large: '.form-control-lg' } } },
    { component: 'search-field', bootstrap: 'Form adorn', base: 'label.form-control.form-adorn > .form-adorn-icon + input.form-ghost', options: { size: { small: '.form-control-sm', medium: '', large: '.form-control-lg' } } },
    { component: 'progress-bar', bootstrap: 'Progress', base: '.progress > .progress-bar', options: { size: { small: null, medium: '' } }, parts: { track: '.progress', indicator: '.progress-bar' }, bootstrapOnly: ['.progress-stacked', '.progress-bar-striped'] },
    { component: 'spinner', bootstrap: 'Spinners', base: '.spinner-border', options: { size: { small: '.spinner-sm', medium: '', large: null } }, bootstrapOnly: ['.spinner-grow'] },
    { component: 'pagination', bootstrap: 'Pagination', base: '.pagination', options: { size: { small: '.pagination-sm', medium: '' } }, states: { current: '.active', disabled: '.disabled' }, bootstrapOnly: ['.pagination-lg'] },
    { component: 'skeleton', bootstrap: 'Placeholder', base: '.placeholder', options: { shape: { text: '', circle: null, rectangle: null } }, bootstrapOnly: ['.placeholder-glow', '.placeholder-wave'] },
    {
      component: 'dropdown', bootstrap: 'Menu', base: '[data-bs-toggle="menu"] + .menu',
      options: {
        emphasis: { accent: '.btn-solid', subtle: '.btn-subtle', ghost: '.btn-text' },
        intent: { neutral: '.theme-secondary', brand: '.theme-primary', error: '.theme-danger' },
        size: { xsmall: '.btn-xs', small: '.btn-sm', medium: '', large: '.btn-lg' },
      },
      parts: { menu: '.menu', item: '.menu-item', 'item-icon': '.menu-item-icon', separator: '.menu-divider', group: '.menu-header' },
    },
    { component: 'divider', bootstrap: 'Reboot hr / .vr', base: 'hr', options: { orientation: { horizontal: 'hr', vertical: '.vr' } } },
    { component: 'icon', bootstrap: null, base: null, why: 'Bootstrap has no icon component: use the Material Symbols Outlined font (.material-symbols-outlined) inside any component.' },
  ],

  bootstrapOnly: ['Chip', 'Chip input', 'OTP input', 'Strength', 'Combobox', 'Datepicker', 'List group', 'Nav and tabs', 'Navbar', 'Dialog', 'Drawer', 'Toasts', 'Tooltip', 'Popover', 'Stepper', 'Table', 'Carousel', 'Close button'],
};
