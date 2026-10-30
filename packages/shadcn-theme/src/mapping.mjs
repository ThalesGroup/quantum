/**
 * The Quantum theme for shadcn/ui, as data: every shadcn theme variable and the Quantum token
 * it takes, and which Quantum component configurations the shadcn components and variants
 * stand for. build.mjs writes dist/quantum.css and dist/quantum.json from this file alone, and
 * refuses (throws) a token path that does not exist or is a raw token, and a component id,
 * property, option, state or part that its spec does not declare (src/lib.mjs checkMapping;
 * the test runs the same check). No logic here: plain objects only.
 *
 * Tiers: a shadcn variable that is a semantic decision (a surface, a text color, the focus
 * ring) takes a Quantum SEMANTIC token; one that is really a component decision (`--card`,
 * `--popover`, `--input`, the radii) takes the Quantum COMPONENT token of that component, so it
 * follows the component's own decisions. Never a raw token.
 */

/** The shadcn style the demo and the equivalences are written against. */
export const STYLE = 'new-york-v4';

/**
 * shadcn's theme variables (https://ui.shadcn.com/docs/theming), declared on `:root` (light,
 * Quantum's default mode) and `.dark` (Quantum's dark mode), bridged to Tailwind as
 * `--color-<name>` in `@theme inline`. `token` is a Quantum token path; `reason` says why when
 * the choice is not obvious. `modes: ['light']` declares a mode-independent variable on
 * `:root` only (shadcn's `--radius`).
 */
export const VARIABLES = {
  background: { token: 'global.bg.level.0.default', reason: 'The page surface: Quantum level 0.' },
  foreground: { token: 'global.text.on-base.neutral.primary', reason: 'Running text on every level.' },
  card: { token: 'card.container.background.level-1', reason: 'Component decision: the Quantum Card surface at its default level (level-1 = global.bg.level.1.default).' },
  'card-foreground': { token: 'card.title.color', reason: 'Component decision: the Quantum Card title color (= global.text.on-base.neutral.primary).' },
  popover: { token: 'dropdown.menu.background', reason: 'Component decision: the Quantum Dropdown menu surface (level 2), which shadcn uses for every floating surface (menus, select lists).' },
  'popover-foreground': { token: 'dropdown.item-label.color.neutral.default', reason: 'Component decision: the label color of a Quantum menu item.' },
  primary: { token: 'global.bg.accent.brand.default', reason: 'The brand accent fill: Quantum Button emphasis accent, intent brand.' },
  'primary-foreground': { token: 'global.text.on-accent.brand.default' },
  secondary: { token: 'global.bg.subtle.neutral.default', reason: 'The neutral subtle fill: Quantum Button emphasis subtle, intent neutral (translucent).' },
  'secondary-foreground': { token: 'global.text.on-subtle.neutral.default' },
  muted: { token: 'global.bg.base.neutral.3', reason: 'A neutral surface one step from level 1, the one Quantum progress-bar and slider tracks read (neutral.2 equals level 1 and would vanish on cards).' },
  'muted-foreground': { token: 'global.text.on-base.neutral.secondary', reason: 'Secondary text: what Quantum descriptions and helper texts read. shadcn also uses it for placeholders, which Quantum draws tertiary.' },
  accent: { token: 'global.bg.subtle.neutral.default', reason: 'The hover surface of Quantum ghost buttons, accordion triggers and menu items (button.container.background.ghost.neutral.hover, dropdown.item.background.neutral.hover); shadcn uses it for ghost/outline hover, focused menu items, toggles.' },
  'accent-foreground': { token: 'global.text.on-subtle.neutral.default' },
  destructive: { token: 'global.bg.accent.functional.error.default', reason: 'The error accent fill: Quantum Button emphasis accent, intent error. shadcn also uses it as the color of error text and invalid borders.' },
  'destructive-foreground': { token: 'global.text.on-accent.functional.error.default', reason: 'No longer in shadcn\'s documented set and not read by the new-york-v4 components (they write text-white); kept for blocks and older components that read it.' },
  border: { token: 'card.container.border-color.level-1', reason: 'Component decision: the edge of the Quantum Card at level 1 (= global.border.level.edge.level.1). shadcn\'s --border is mostly card, popover and table edges; Quantum\'s Divider is darker (divider.container.color = global.border.base.neutral.4), which separators lose.' },
  input: { token: 'text-field.control.border-color.default', reason: 'Component decision: the border of a Quantum form control (= global.border.accent.neutral.default), also what checkboxes read.' },
  ring: { token: 'color.focus.ring', reason: 'The Quantum focus ring color (shadcn draws it as a 3px ring at 50%, not Quantum\'s solid 2.4px ring with offset).' },
  'chart-1': { token: 'dataviz.role.brand.bg.accent.brand-1', reason: 'The Quantum brand data series, darkest first. The categorical alternative is dataviz.role.extended.sand.accent.extended-1..8.' },
  'chart-2': { token: 'dataviz.role.brand.bg.accent.brand-2' },
  'chart-3': { token: 'dataviz.role.brand.bg.accent.brand-3' },
  'chart-4': { token: 'dataviz.role.brand.bg.accent.brand-4' },
  'chart-5': { token: 'dataviz.role.brand.bg.accent.brand-5' },
  sidebar: { token: 'global.bg.level.1.default', reason: 'A sidebar is a level-1 surface beside the level-0 page.' },
  'sidebar-foreground': { token: 'global.text.on-base.neutral.primary' },
  'sidebar-primary': { token: 'global.bg.accent.brand.default' },
  'sidebar-primary-foreground': { token: 'global.text.on-accent.brand.default' },
  'sidebar-accent': { token: 'global.bg.subtle.neutral.default', reason: 'Same hover surface as --accent.' },
  'sidebar-accent-foreground': { token: 'global.text.on-subtle.neutral.default' },
  'sidebar-border': { token: 'global.border.level.edge.level.1', reason: 'The edge of a level-1 surface.' },
  'sidebar-ring': { token: 'color.focus.ring' },
  radius: { token: 'corner-radius.sm', modes: ['light'], reason: 'shadcn\'s base radius, which it takes as --radius-lg: the step of Quantum\'s surfaces (card, alert, dropdown menu). The scale is set step by step in THEME, since shadcn\'s multiplied scale (0.6, 0.8, 1, 1.4 x --radius) cannot give Quantum\'s 2/4/8/8px.' },
};

/**
 * Tailwind theme variables shadcn's components read beyond the colors, written into
 * `@theme inline` (the registry item's `cssVars.theme`): the font families and the radius
 * scale. Each overrides the value shadcn would derive. `fallback` is a generic font stack
 * appended after the token's family, not a Quantum decision.
 */
export const THEME = {
  'font-sans': { token: 'body.family', fallback: 'ui-sans-serif, system-ui, sans-serif', reason: 'Quantum body text (Inter).' },
  'font-mono': { token: 'mono.family', fallback: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', reason: 'Quantum code text (Fragment Mono).' },
  'radius-sm': { token: 'dropdown.item.border-radius', reason: 'Component decision: rounded-sm is the shadcn menu and select item; Quantum menu items are 2px.' },
  'radius-md': { token: 'button.container.border-radius.medium', reason: 'Component decision: rounded-md is every shadcn control (button, input, select, toggle, textarea) and popover; Quantum controls are 4px at the default size (text-field, select and pagination agree).' },
  'radius-lg': { token: 'alert.container.border-radius', reason: 'Component decision: rounded-lg is the shadcn alert, dialog and tabs list; the Quantum Alert is 8px.' },
  'radius-xl': { token: 'card.container.border-radius', reason: 'Component decision: rounded-xl is the shadcn Card; the Quantum Card is 8px (shadcn would derive 11.2px).' },
  'radius-2xl': { token: 'corner-radius.md', reason: 'Not read by the components: the next steps of the Quantum scale, so the scale keeps growing.' },
  'radius-3xl': { token: 'corner-radius.lg' },
  'radius-4xl': { token: 'corner-radius.xl' },
};

/**
 * Which shadcn component, and which of its props, renders each Quantum component configuration.
 * `quantum` is a component id of packages/components/specs/components/; in each `configs`
 * entry, `set` names spec properties and their option ids (or a boolean property and its
 * value), `state` a spec state id, `part` an anatomy part id: all checked against the spec.
 * `shadcn` is a component of the shadcn registry (demo/src/components/ui/<name>.tsx), `props`
 * the shadcn props or sub-component that renders it, or null when shadcn has no equivalent.
 */
export const COMPONENTS = [
  {
    quantum: 'button', shadcn: 'button',
    configs: [
      { set: { emphasis: 'accent', intent: 'brand' }, props: { variant: 'default' } },
      { set: { emphasis: 'subtle', intent: 'neutral' }, props: { variant: 'secondary' } },
      { set: { emphasis: 'ghost', intent: 'neutral' }, props: { variant: 'ghost' } },
      { set: { emphasis: 'accent', intent: 'error' }, props: { variant: 'destructive' } },
      { set: { size: 'xsmall' }, props: { size: 'xs' } },
      { set: { size: 'small' }, props: { size: 'sm' } },
      { set: { size: 'medium' }, props: { size: 'default' } },
      { set: { size: 'large' }, props: { size: 'lg' } },
      { set: { disabled: true }, props: { disabled: true } },
      { part: 'icon', props: { children: '<svg> (lucide-react)' } },
      { set: { emphasis: 'accent', intent: 'neutral' }, props: null, note: 'Quantum\'s default button (neutral accent) has no shadcn variant: --primary is the brand.' },
      { set: { emphasis: 'subtle', intent: 'brand' }, props: null },
      { set: { emphasis: 'ghost', intent: 'brand' }, props: null },
      { set: { emphasis: 'subtle', intent: 'error' }, props: null },
      { set: { emphasis: 'ghost', intent: 'error' }, props: null },
    ],
    shadcnOnly: ['variant="outline"', 'variant="link"'],
  },
  {
    quantum: 'icon-button', shadcn: 'button',
    configs: [
      { set: { size: 'xsmall' }, props: { size: 'icon-xs' } },
      { set: { size: 'small' }, props: { size: 'icon-sm' } },
      { set: { size: 'medium' }, props: { size: 'icon' } },
      { set: { size: 'large' }, props: { size: 'icon-lg' } },
      { set: { emphasis: 'accent', intent: 'brand' }, props: { variant: 'default' } },
      { set: { emphasis: 'subtle', intent: 'neutral' }, props: { variant: 'secondary' } },
      { set: { emphasis: 'ghost', intent: 'neutral' }, props: { variant: 'ghost' } },
      { set: { emphasis: 'accent', intent: 'error' }, props: { variant: 'destructive' } },
    ],
  },
  {
    quantum: 'badge', shadcn: 'badge',
    configs: [
      { set: { emphasis: 'accent', intent: 'brand' }, props: { variant: 'default' } },
      { set: { emphasis: 'subtle', intent: 'neutral' }, props: { variant: 'secondary' } },
      { set: { emphasis: 'accent', intent: 'error' }, props: { variant: 'destructive' } },
      { set: { intent: 'success' }, props: null },
      { set: { intent: 'warning' }, props: null },
      { set: { intent: 'info' }, props: null },
      { set: { size: 'small' }, props: null, note: 'One badge size in shadcn.' },
    ],
    shadcnOnly: ['variant="outline"', 'variant="ghost"', 'variant="link"'],
  },
  {
    quantum: 'alert', shadcn: 'alert',
    configs: [
      { set: { intent: 'info' }, props: { variant: 'default' }, note: 'shadcn\'s default alert is a neutral card, not tinted.' },
      { set: { intent: 'error' }, props: { variant: 'destructive' } },
      { set: { intent: 'success' }, props: null },
      { set: { intent: 'warning' }, props: null },
      { part: 'title', props: { component: 'AlertTitle' } },
      { part: 'message', props: { component: 'AlertDescription' } },
    ],
  },
  {
    quantum: 'card', shadcn: 'card',
    configs: [
      { set: { surface: 'level-1' }, props: { component: 'Card' } },
      { set: { surface: 'level-2' }, props: null, note: '--card is level 1 only.' },
      { part: 'title', props: { component: 'CardTitle' } },
      { part: 'description', props: { component: 'CardDescription' } },
    ],
  },
  {
    quantum: 'accordion', shadcn: 'accordion',
    configs: [
      { part: 'item', props: { component: 'AccordionItem' } },
      { part: 'trigger', props: { component: 'AccordionTrigger' } },
      { part: 'panel', props: { component: 'AccordionContent' } },
      { state: 'expanded', props: { 'data-state': 'open' } },
      { set: { size: 'small' }, props: null },
    ],
  },
  {
    quantum: 'breadcrumb', shadcn: 'breadcrumb',
    configs: [
      { part: 'list', props: { component: 'BreadcrumbList' } },
      { part: 'item', props: { component: 'BreadcrumbItem' } },
      { part: 'link', props: { component: 'BreadcrumbLink' } },
      { state: 'current', props: { component: 'BreadcrumbPage' } },
      { part: 'separator', props: { component: 'BreadcrumbSeparator' } },
    ],
  },
  {
    quantum: 'pagination', shadcn: 'pagination',
    configs: [
      { part: 'link', props: { component: 'PaginationLink' } },
      { state: 'current', props: { isActive: true } },
      { part: 'previous', props: { component: 'PaginationPrevious' } },
      { part: 'next', props: { component: 'PaginationNext' } },
    ],
  },
  {
    quantum: 'progress-bar', shadcn: 'progress',
    configs: [
      { part: 'track', props: { component: 'Progress' } },
      { part: 'indicator', props: { value: 'number' } },
      { state: 'indeterminate', props: null },
    ],
  },
  { quantum: 'skeleton', shadcn: 'skeleton', configs: [{ set: { shape: 'rectangle' }, props: { component: 'Skeleton' } }] },
  { quantum: 'spinner', shadcn: 'spinner', configs: [{ part: 'ring', props: { component: 'Spinner' } }] },
  {
    quantum: 'avatar', shadcn: 'avatar',
    configs: [
      { set: { shape: 'circle' }, props: { component: 'Avatar' } },
      { set: { shape: 'square' }, props: null },
      { part: 'image', props: { component: 'AvatarImage' } },
      { part: 'initials', props: { component: 'AvatarFallback' } },
    ],
  },
  {
    quantum: 'checkbox', shadcn: 'checkbox',
    configs: [
      { state: 'checked', props: { checked: true } },
      { state: 'indeterminate', props: { checked: 'indeterminate' } },
      { state: 'invalid', props: { 'aria-invalid': true } },
      { set: { disabled: true }, props: { disabled: true } },
    ],
  },
  {
    quantum: 'checkbox-group', shadcn: 'field',
    configs: [
      { part: 'container', props: { component: 'FieldSet' } },
      { part: 'legend', props: { component: 'FieldLegend' } },
      { part: 'option', props: { component: 'Field orientation="horizontal" + Checkbox' } },
      { part: 'error-message', props: { component: 'FieldError' } },
    ],
  },
  {
    quantum: 'radio-group', shadcn: 'radio-group',
    configs: [
      { part: 'control', props: { component: 'RadioGroupItem' } },
      { part: 'legend', props: { component: 'FieldLegend (field)' } },
      { state: 'invalid', props: { 'aria-invalid': true } },
    ],
  },
  {
    quantum: 'switch', shadcn: 'switch',
    configs: [
      { state: 'checked', props: { checked: true } },
      { set: { disabled: true }, props: { disabled: true } },
    ],
  },
  {
    quantum: 'slider', shadcn: 'slider',
    configs: [
      { part: 'thumb', props: { component: 'Slider' } },
      { set: { disabled: true }, props: { disabled: true } },
    ],
  },
  {
    quantum: 'text-field', shadcn: 'input',
    configs: [
      { part: 'control', props: { component: 'Input' } },
      { part: 'label', props: { component: 'Label' } },
      { part: 'description', props: { component: 'FieldDescription (field)' } },
      { part: 'error-message', props: { component: 'FieldError (field)' } },
      { state: 'invalid', props: { 'aria-invalid': true } },
      { set: { disabled: true }, props: { disabled: true } },
      { set: { readonly: true }, props: { readOnly: true } },
      { set: { size: 'small' }, props: null, note: 'One control height in shadcn.' },
      { set: { size: 'large' }, props: null },
    ],
  },
  {
    quantum: 'textarea', shadcn: 'textarea',
    configs: [
      { part: 'control', props: { component: 'Textarea' } },
      { state: 'invalid', props: { 'aria-invalid': true } },
    ],
  },
  { quantum: 'number-field', shadcn: 'input', configs: [{ part: 'control', props: { type: 'number' }, note: 'A plain input: no stepper buttons.' }] },
  {
    quantum: 'search-field', shadcn: 'input-group',
    configs: [
      { part: 'control', props: { component: 'InputGroupInput' } },
      { part: 'icon', props: { component: 'InputGroupAddon' } },
    ],
  },
  {
    quantum: 'select', shadcn: 'native-select',
    configs: [
      { part: 'control', props: { component: 'NativeSelect' }, note: 'The Quantum Select is a native select; shadcn\'s Select (Radix listbox) is the custom alternative.' },
      { part: 'option', props: { component: 'NativeSelectOption' } },
      { state: 'invalid', props: { 'aria-invalid': true } },
    ],
  },
  {
    quantum: 'dropdown', shadcn: 'dropdown-menu',
    configs: [
      { part: 'trigger', props: { component: 'DropdownMenuTrigger asChild + Button' } },
      { part: 'menu', props: { component: 'DropdownMenuContent' } },
      { part: 'group', props: { component: 'DropdownMenuGroup' } },
      { part: 'item', props: { component: 'DropdownMenuItem' } },
      { part: 'separator', props: { component: 'DropdownMenuSeparator' } },
    ],
  },
  { quantum: 'divider', shadcn: 'separator', configs: [{ set: { orientation: 'horizontal' }, props: { orientation: 'horizontal' } }, { set: { orientation: 'vertical' }, props: { orientation: 'vertical' } }] },
  { quantum: 'icon', shadcn: null, configs: [], note: 'shadcn components take lucide-react SVG icons; Quantum icons are Material Symbols glyphs.' },
];

/** shadcn components of the demo with no Quantum component yet. */
export const SHADCN_ONLY = ['dialog', 'tabs', 'table', 'tooltip', 'toggle', 'toggle-group'];
