# packages/components/specs/ — component specifications

The specifications of the `@quantum-ds/components` package. `pnpm components:build` copies them
(every JSON file and the code samples foundation examples show) to `packages/components/dist/`,
which the package publishes in the same layout (`@quantum-ds/components/components/<id>.spec.json`,
`foundations/`, `schema/`, `a11y/`, `platforms.json`).
`schema/component.schema.json` (JSON Schema 2020-12) defines the shape. One
`components/<id>.spec.json` per component. `a11y/` is the accessibility registry every spec is
checked against. `pnpm validate` enforces the schema, the accessibility contract and the
cross-references to tokens, docs and web files.

## What a spec contains

| Section | Meaning |
| --- | --- |
| `id`, `name`, `version`, `status` | Identity. `status`: draft → review → stable → deprecated. Bump `version` on any visible change and add a `changelog` entry (newest first). |
| `role` | Component role (what it *is*): a composite implying semantics, keyboard and ARIA for every platform. Enum in the schema. |
| `summary`, `description`, `tags` | One sentence for listings; longer prose; free tags. |
| `anatomy[]` | Ordered parts. Each has `id`, `role` (part role: what it *does*), `required`, optional `repeatable`, `decorative` (pure decoration, hidden from assistive technology), `parent`, `component` (when the part is a subcomponent), `properties` (instance properties of a repeatable part, see below), `visibleIn` (states in which the part is shown, a menu shown when `expanded`). First part = root, role `container`. |
| `properties[]` | Configuration API. `type`: `enum` (with `options[]`), `boolean`, `string`, `number`, `icon`, `node`, `list` (with `of`, see below). `bindsTo` = part whose content it drives (prop binding); `affects` = parts whose styling changes. |
| `states[]` | Controlled vocabulary. `trigger`: `interaction`, `property` (name the `property`), `system`. Always include `default`. Optional `inputs` (`pointer`, `touch`, `keyboard`) when only some inputs produce the state; optional `platforms` when a platform lacks or adds it; optional `parts` when the state belongs to some parts rather than to the component as a whole (a trigger and the items of its menu). |
| `slots[]` | Where nested content composes (containers). |
| `layout` | Direction, alignment, sizing and prose notes. Dimensions themselves live in tokens. |
| `accessibility` | Required. `ariaRole`, `name` (how the accessible name is computed), `keyboard[]`, `guidelines[]`, each with `refs` and an optional `platforms`; `references[]` of trusted sources. See below. |
| `content.guidelines[]` | Writing rules for the labels: strings, or `{ text, platforms }` for a platform rule. |
| `examples[]` | Named prop combinations rendered by the site. Also used by the validator to exercise the template. The `name` (and `id`) states the value of every enum property that combines with the others ("Accent neutral", not "Accent"), then what the example adds ("Subtle brand, small"). Optional `platforms`: an example without `web` is listed, not rendered. |
| `decisions[]` | Decision log, newest first: `id`, `date`, `version`, `area`, `status` (`active`/`superseded`), `text`, optional `rationale`, `supersedes`, `tokens`, `platforms`, `refs`. See below. |
| `tokens` | `source` (`packages/tokens/src/components/<id>.tokens.json`) and `prefix` (= id). |
| `implementations.web` | `css` (`packages/components/src/components/<id>/<id>.css`), `template` (`packages/components/src/components/<id>/<id>.template.mjs`), `selector` (`.ds-<id>`), `element`, `attributes` (prop → attribute), `stateAttribute`, `partSelectors`, `rolePart` (the part carrying the component role when the root is a wrapper, a trigger and its popup). Required: the reference rendering. |
| `implementations.ios` / `.android` / `.desktop` | Optional metadata of a native implementation: `control` (required), `framework`, `source`, `notes[]`. Nothing is generated from it. |

## Rules

- A form control whose label, description and error message are parts of the component has a
  wrapper root (`div`, `fieldset`) and names the native control as `implementations.web.rolePart`:
  the validator checks the role, the state attributes, the explicit role and the accessible name
  on that part's element (its name may come from a `label` element pointing at its id). Boolean
  properties then map to `data-*` attributes on the root; the template still sets the native
  attribute (`disabled`, `required`, `readonly`) on the control.
- The spec is technology-agnostic and platform-agnostic by default. Anything web-specific goes
  under `implementations.web`, or carries `platforms: ["web"]` when it is a statement, state or
  example. Platform ids come from `platforms.json` (`agents/conventions.md` "Platforms and inputs").
- Option values and state ids are reused verbatim as token path segments and data-attribute
  values: keep them short kebab-case words. An option value may equal a state id (variant
  `default` next to state `default`): in a token path, each enum property takes one segment
  and the state comes last, so `button.container.background.default.default` is option
  `default`, state `default`.
- A property that changes styling must list the parts it `affects`; the site builds the
  states matrix from enum properties that affect at least one part.
- Do not duplicate token values in the spec. The spec says *that* the container has a border;
  the tokens say *which* color and width.
- Extending a vocabulary (component roles, part roles, states) means editing the schema enum
  and documenting the new term here.

## Repeated parts and composite components

Some components hold a list of parts that each carry their own options: the items of a menu.

- The repeated part is `repeatable` and declares its **instance properties** in `properties`
  (same shape as component properties). They are set per instance; their enum options are token
  segments of that part and its children (`dropdown.item.background.error.hover`); on the web
  each becomes `data-<property>` on the instance.
- A component property of type `list` holds the instances, in order: `of` names the repeatable
  parts it may hold. An entry is an object of instance properties for the first part of `of`, or
  names its part with `part` (`{ "part": "separator" }`). Examples use the same shape.
- States of parts: `parts` on a state says which parts take it. The site draws one states matrix
  per part: rows are the enum properties affecting it (component properties, or the part's
  instance properties), columns its states. A state of a repeated part is forced per instance
  (the entry's sandbox `state`), and the part's `visibleIn` state is forced on the component so
  the part shows.
- A part that is another component (`component: "button"`) is styled by that component's tokens:
  the composite forwards the properties that only affect it (emphasis, intent, size of a
  trigger), and its web template renders it with the other component's template.

## Vocabulary notes

- Component roles follow Nathan Curtis' list of control roles (`button`, `togglebutton`,
  `checkbox`, `radio`, `switch`, `textbox`, `textarea`, `password`, `searchbox`, `slider`,
  `spinbutton`, `disclosure`, `link`, `group`, `alert`, `status`, `progressbar`) extended with
  structural roles (`container`, `list`, `navigation`, `table`, `dialog`, `tooltip`, `menu`,
  `menuitem`, `tab`, `tablist`, `tabpanel`, `combobox`, `listbox`, `option`) and
  `presentation` for purely visual components (badge, divider).
- Part roles follow the same article (`label`, `description`, `errormessage`, `value`,
  `placeholder`, `indicator`, `panel`, `increment`, `decrement`) extended with `container`,
  `icon`, `handle`, `track`, `header`, `footer`, `media`, `action`, `separator`, `overlay`,
  `slot`.
- Nathan Curtis' Specs format places the component role on the root anatomy element and uses
  the same flat lowercase role names. `pnpm specs:check` exports every spec to that format
  (`agents/specs-interop.md`). Two consequences for authors: `state` is a reserved property id, and
  a new part role or token property exports through the sidecar until
  `scripts/lib/specs-bridge.mjs` maps it.

## Decision log

`decisions[]` records every design decision someone stated about the component, as the rule
the artifacts implement (`agents/workflow.md`, "Decisions"). Changelog says *what changed in a
version*; the log says *what is decided* and stays true until superseded.

```json
"decisions": [{
  "id": "border-primary",
  "date": "2026-10-01",
  "version": "0.5.0",
  "area": "color",
  "status": "active",
  "text": "Every variant has a border in the primary color.",
  "rationale": "Keeps the button shape crisp on tinted surfaces.",
  "tokens": ["button.container.border-color.*"]
}]
```

- `area`: `anatomy`, `variant`, `size`, `state`, `color`, `typography`, `dimension`, `layout`,
  `motion`, `content`, `behaviour`, `accessibility`, `platform`. The site groups by it.
- `rationale` only when someone gave one. Never invent a reason.
- Replacing a decision: the new one lists the old id in `supersedes`; the old one turns
  `superseded` and keeps its text. Never delete or rewrite an entry.
- `tokens`: exact paths or `group.*`; each must match a token. `refs` follow the accessibility
  grammar below and are checked like any accessibility statement; `area: "accessibility"`
  requires them.
- Validated: unique ids, newest first, `version` has a changelog entry and is not newer than
  the spec, supersession is consistent (exactly one successor per superseded entry).
- Exported to Specs through the sidecar.

## Accessibility contract

Every statement cites its sources in `refs` (at least one):

```json
"accessibility": {
  "ariaRole": "button",
  "name": { "text": "Computed from the label text content.", "refs": ["apg-button-roles"] },
  "keyboard": [{ "key": "Enter", "action": "Activates the button.", "refs": ["apg-button-keyboard"] }],
  "guidelines": [{ "text": "Every size is at least 24 x 24 CSS pixels.", "refs": ["wcag:2.5.8"] }],
  "references": [{ "id": "apg-button-keyboard", "title": "APG: Button pattern, keyboard interaction", "url": "https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction" }]
}
```

- `wcag:<sc>` cites a WCAG 2.2 success criterion; the site links its Understanding page and
  shows its level. Removed criteria (4.1.1) and unknown numbers are errors.
- Any other ref is the kebab-case id of an entry in `references[]`, whose URL must start with a
  prefix of `a11y/sources.json`. Uncited references are warnings.
- Open every source before citing it and check the anchor. Reword or drop a claim no trusted
  source supports.

## Foundations

`foundations/<id>.spec.json` (schema `schema/foundation.schema.json`) specifies what every
component shares: the building blocks (color, typography, spacing and sizing, shape, elevation
and effects, motion, iconography) and global rules (the focus ring, code syntax colors). It reuses the component schema's definitions
(`decision`, `refs`, guidelines, references, changelog) and adds:

| Section | Meaning |
| --- | --- |
| `id`, `name`, `version`, `status`, `summary`, `description`, `tags` | As for a component. The id shares one namespace with component ids and names the docs page `apps/docs/content/foundations/<id>.md`. |
| `tokens` | Semantic token paths or `group.*` the foundation owns. Each must match semantic tokens. Empty while no semantic token gives its primitives a meaning (elevation and effects). |
| `appliesTo` | `focusable-components` (every component whose role profile is focusable) or `every-component`: each must have component tokens aliasing every exact path of `tokens` (validated). Omit when following it is optional. |
| `rules[]` | What the foundation is, one aspect per rule (`id`, `name`, `text`, optional `tokens`, `platforms`). Present tense, no values: the tokens hold them and the site shows them per mode. |
| `specimens[]` | How the page draws the tokens the foundation is built from: `id`, `name`, `description`, `display`, `tokens` (raw or semantic paths or `group.*`, never component tokens), optional `tier` when raw and semantic tokens share a group (`space.*`). The display says how a value is drawn (`palette`, `color`, `length`, `size`, `radius`, `stroke`, `blur`, `opacity`, `typography`, `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `duration`, `easing`, `icon`, `icon-size`, `value`); `scripts/lib/specimens.mjs` lists the `$type`s each accepts and `pnpm validate` checks them. Patterns, not lists: a new token in a group appears with no change. Every raw and semantic token must be owned or presented by one foundation (warning). |
| `contrast[]` | `foreground` color token on `backgrounds` (paths or `group.*`), `minimum` ratio, `refs`; `on` (surfaces) composites a translucent background over each surface, one pair per surface. `pnpm validate` computes every pair in every platform × mode context (`scripts/lib/contrast.mjs`) and fails under the minimum. Without `minimum` the pair is measured and shown only (disabled text, borders that do not identify a component). `knownIssue` (a short free-text description of the known problem) marks a requirement whose failures are known: they become warnings naming the known issue, and the validator fails once every pair passes so the marker goes with the fix. |
| `accessibility` | `guidelines[]` and `references[]`, cited exactly like a component's; no role, name or keyboard. |
| `examples[]` | Either `component` + `props` (the sandbox `state` prop may force a declared state), rendered with that component's web template, or `source`: a code sample in `foundations/<id>/` (`packages/components/specs/foundations/<id>/<file>`; extension `css`, `diff`, `html`, `js`, `json`, `md`, `sh` or `yml`; Shiki notation comments mark lines), highlighted with the system's Shiki theme. Component examples are shown once per mode; code samples in an example explorer whose mode context can be switched, as in a component's playground. |
| `decisions[]`, `changelog` | Same rules as a component's (validated the same way). |

Components never re-specify a foundation: they alias its tokens, and the site lists them under
the foundation (derived from the aliases). A new foundation needs no site or script change.

## platforms.json

The platform vocabulary: id, name, description, `inputs`, example `technologies` and the
trusted `sources` that apply. The schema enums `platform` and `input` must equal its keys
(validated), as must the `platforms` of `packages/tokens/tokens.config.json`. A technology (Flutter, Qt,
JavaFX) is not a platform: it targets one and consumes `packages/tokens/dist/platforms/<id>/<mode>.tokens.json`
(`@quantum-ds/tokens/platforms/<id>/<mode>.tokens.json`). Adding a
platform is a team decision: registry entry, schema enums, optionally a token overlay, and a
trusted source for it in `a11y/sources.json`.

## a11y/ registry

| File | Content | Edit |
| --- | --- | --- |
| `sources.json` | Conformance target (WCAG 2.2 AA) and trusted publishers with URL prefixes and kind (standard, guidance, reference, regulation, platform, organisation). | Adding a publisher is a team decision: add it with the narrowest prefix, and note it here. |
| `wcag.json` | Every WCAG success criterion: title, level, Understanding slug, membership in 2.2. | Generated by `pnpm a11y:wcag` from the W3C's `wcag.json`. Never by hand. |
| `roles.json` | Per component role: `ariaRole` (omitted for `presentation`, whose specs state the role their element exposes), `nameRequired`, `focusable`, `keyboard` keys, `requiredCriteria` (SC → why), `web.elements` carrying the role natively (empty when the role must be written out, as `alert`), `web.explicitRole` (the element must carry `role="<ariaRole>"`, as a `switch` on a native checkbox), `web.stateAttributes` (one of them must expose the role's state, e.g. a disclosure's expanded state), `references`. Profiles today: `button`, `disclosure` (a button showing and hiding content: Dropdown; or a `summary`, whose expanded state comes from its `details`: Accordion), `checkbox`, `group` (a fieldset of native radios or checkboxes: Radio group, Checkbox group), `switch`, `textbox` (Text field), `textarea`, `combobox` (a native select: Select), `spinbutton` (Number field), `searchbox` (Search field), `slider`, `navigation` (Breadcrumb, Pagination), `status` (Spinner), `container` (Card), `presentation` (Badge, Divider, Skeleton, Avatar, Icon), `alert`, `progressbar`. | Write a profile from the role's APG pattern and the WAI-ARIA role definition, citing them, before specifying a component with that role. Changing a profile impacts every spec with that role (`pnpm impact`). |

Trusted publishers today: W3C WCAG 2.2 and WAI Understanding/Techniques, WAI-ARIA, APG,
AccName, HTML-AAM, Core-AAM, ARIA in HTML, WAI tutorials, WHATWG HTML, MDN, RGAA, ETSI EN 301 549,
Apple HIG and accessibility docs, Android accessibility docs, Material Design 3 foundations,
Orange accessibility guidelines.
