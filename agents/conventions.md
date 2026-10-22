# Conventions

Identifiers, roles, the component token path grammar, states, platforms, modes and the web implementation rules. Part of the agent guide: start from the root `AGENTS.md`.

## Conventions

### Identifiers
- Component ids, part ids, option values, state ids: **kebab-case** (`icon-start`, `focus-visible`).
- Property ids: **camelCase** (`iconStart`), because they become template props and, later, framework props.
- One component = one id used everywhere: spec `id`, token root group, docs file, `packages/components/src/components/<id>/`, CSS class `ds-<id>`.

### Roles (from Nathan Curtis' "component and part roles as composites")
- A **component role** says what the component *is* (`button`, `togglebutton`, `textbox`,
  `disclosure`, `alert`, `presentation`…). It is a composite: it implies semantics, keyboard
  behaviour and ARIA for every platform, so implementations never re-derive them.
- A **part role** says what a part *does* for the component (`container`, `label`, `icon`,
  `indicator`, `description`, `errormessage`, `panel`…).
- Both vocabularies live as enums in `packages/components/specs/schema/component.schema.json`. Extending them is a
  deliberate act: edit the schema, explain the new role in `packages/components/specs/AGENTS.md`.
- The first anatomy part is always the root and has role `container`.

### Component token path grammar
```
<component>.<part>.<property>[.<option>][.<state>]
button.container.background.primary.hover
button.container.border-radius
button.label.typography.md
```
- `<part>` must be a part id from the spec's anatomy.
- `<property>` is a kebab-case CSS-like property name (`background`, `border-color`, `min-height`, `typography`).
- `<option>` is an option value of an enum property (`primary`, `sm`); `<state>` a declared state id.
- Which token applies to a configuration follows from the path alone: an option missing from
  the path matches any value, a state without a token falls back to `default`, the token naming
  the most options wins. Rule and checks: `packages/tokens/AGENTS.md` "Which token applies".
- Values **alias semantic tokens only**. Never a raw token, never a literal.
- The generated CSS variable is the path joined with `-`: `--button-container-background-primary-hover`.
  Typography composites expand to `-font-family`, `-font-size`, `-font-weight`, `-line-height`, `-letter-spacing`.

### States vocabulary
`default`, `hover`, `active`, `focus-visible`, `disabled`, `selected`, `checked`, `unchecked`,
`indeterminate`, `pressed`, `expanded`, `collapsed`, `invalid`, `readonly`, `loading`,
`dragging`, `visited`, `current`. Every spec declares `default`. A state used in a token path
must be declared in the spec.

### Platforms and inputs
- Vocabulary in `packages/components/specs/platforms.json`; the schema enums mirror it and `pnpm check` keeps them equal.
- Default is universal. Add `platforms` only when a platform genuinely differs, and `inputs` only
  when a state depends on how people interact (hover, focus-visible). A statement whose *source*
  is web-only but whose *content* holds everywhere stays universal.
- A platform statement cites that platform's trusted source (Apple HIG, Android developers,
  Material). Never infer a platform behaviour from another platform's documentation.
- Docs: `### Web`, `### iOS`, `### Android`, `### Desktop` sub-headings, exactly those names.
- Tokens: override in `packages/tokens/src/platforms/<id>/`, same paths as the base tokens, only raw and
  semantic tiers, no new paths. Lengths stay in the DTCG unit (`px`, read as pt or dp).
- `implementations.web` is the reference rendering and stays required; `ios`, `android` and
  `desktop` are optional metadata (`control`, `framework`, `source`, `notes`).

### Modes
- Vocabulary in `packages/tokens/tokens.config.json` (`modes`): exactly one `default` (the base tiers), each with
  a `scheme` (`light` or `dark`). Overlays in `packages/tokens/src/modes/<id>/` override **semantic** tokens
  only, same paths, aliasing raw tokens. A component token, a raw token or a new path in a mode
  is refused by the build.
- Descriptions, docs and spec statements name modes by their meaning ("dark mode"), never by a
  technology mechanism; the web mechanism belongs to `### Web` sub-headings and `packages/components/src/`.
- Web: `data-theme="<mode>"` on any element switches its subtree; `data-theme="auto"` follows
  `prefers-color-scheme`; no attribute means the default mode. The generated CSS declares the
  semantic and component tokens on `:root, [data-theme]` so aliases resolve again in every
  context, and sets `color-scheme`. Component CSS never mentions modes.
- Other platforms: one resolved tree per mode, `packages/tokens/dist/platforms/<id>/<mode>.tokens.json`; the
  technology selects the tree from the system appearance (the mode's `scheme`).

### Web implementation
- Root class `.ds-<id>` on the native element named in `implementations.web.element`. A form
  control with a label, a description or an error message as parts has a wrapper root and names
  the native control as `implementations.web.rolePart` (`packages/components/AGENTS.md` "Form controls with a
  wrapper root"); the accessibility checks then apply to that element.
- Enum properties become `data-<prop>="<option>"` attributes; booleans become native attributes when one exists (`disabled`), otherwise `data-<prop>`.
- Parts are `.ds-<id>__<part>`, optionally with `data-part="<part>"`. Decorative parts carry `aria-hidden="true"`.
- Every state selector is written twice through `:where()`: the native pseudo-class **and**
  `[data-state="<state>"]`, so the site can force any state for review.
- CSS reads **only** `--<id>-*` tokens and private `--_*` properties. No literals.
- The template is a pure function `render(props) -> string` with no DOM access, usable in Node and browsers.
- No script ships in the web implementation: interactive behaviour comes from native HTML
  (`<button>`, popover, `popovertarget`). A pattern that needs script to be accessible (an ARIA
  menu's arrow keys) is not used; the docs site may use script for itself, never for a component.
- A composite (Dropdown) renders its subcomponent part (`component: "button"`) with that
  component's template, and lists repeated parts with their own `properties` behind a `list`
  property (`packages/components/specs/AGENTS.md` "Repeated parts and composite components").
