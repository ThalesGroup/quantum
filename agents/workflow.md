# Change workflow

The change loop, where each kind of request goes, the decision loop, and the definition of done. Part of the agent guide: start from the root `AGENTS.md`.

## The change workflow

Every request follows the same loop. Do not skip steps or stop halfway: a change that
touches the spec but not the tokens, CSS, or docs leaves the repository inconsistent.

1. **Read first.** Open the spec, the component tokens, the CSS and the docs of the component.
   For a new component, read `packages/components/specs/components/button.spec.json` and its siblings as the
   reference implementation of the pattern.
2. **Map the impact.** List every artifact linked to what you are about to change (`agents/impact.md`). The
   change is the whole set, not the file the request names.
3. **Locate the decision.** Decide which layer the request changes (table below). Prefer the
   highest layer that expresses the intent: a change that should apply to every control
   belongs in semantic tokens, not in a component's tokens.
4. **Edit in order:** spec → component tokens → `pnpm tokens:build` → CSS/template → Figma
   blueprint (`packages/figma/src/blueprints/<id>.mjs`: a new part, layout or token slot changes
   its layer tree; every slot is bound or listed in `notDrawn`) → docs.
   Bump `version` in the spec and add a `changelog` entry (newest first) for anything visible.
   A stated design decision is also recorded in `decisions[]` (see "Decisions" below).
   Anything touching accessibility follows `agents/accessibility.md`: verify the source, then cite it.
5. **Update the screens.** Every screen rendering a changed component, or a component whose
   tokens alias a changed token, is part of the change (`pnpm impact` lists them): apply any
   template API change to it, drop a gap a new component or token now fills, and look at it.
6. **Verify:** `pnpm check`, then `pnpm impact`. Fix every error. Read warnings; they usually
   point at forgotten states, unused tokens or uncited references. Walk the impact checklist:
   every linked artifact is either updated or consciously left as is.
7. **Look at it:** `pnpm dev`, open the component page, check the examples, the
   states matrix, the playground (and its token inspector: which token paints which part)
   and the accessibility contract on the Specification tab; then the **Screens** using it, at
   every frame width and in every mode.
8. **Report** what changed in each artifact, the sources behind any accessibility statement,
   and every linked artifact you deliberately left unchanged, with the reason.

### Where does a change go?

| Request sounds like | Change |
| --- | --- |
| "Add a *success* intent" | Spec: new option on `intent`, example. Semantic tokens: the Figma library already maps `global.bg.<emphasis>.functional.success.*`, `global.text.on-<emphasis>.functional.success.default`, `global.border.<emphasis>.functional.success.*`; add a role only if it is missing, in `packages/tokens/src/additions/semantic/`. Component tokens: `<id>.<part>.<property>.<emphasis>.success.<state>` for every affected part/property/emphasis/state. CSS: one ladder rule per emphasis for `[data-intent="success"]`. Docs: row in the Intent table. Contrast computed for every new pair. |
| "The border must be the primary color" | Semantic tokens if it applies to all controls, otherwise component tokens: repoint `<id>.container.border-color.*` aliases. Rebuild. CSS unchanged (it only reads tokens). Docs: mention if the meaning changed. |
| "Buttons are too small on mobile" | The heights come from the Figma library's `space.*` in each component's tokens, the same on every platform; there is no control height token (an earlier decision removed them). A per-platform height is a decision to discuss first. |
| "Add a loading state" | Spec: state `loading` (trigger `system`), possibly property `loading` and a part `indicator`. Tokens for the indicator. CSS: `[data-state="loading"]` plus the native mechanism. Template: render the indicator. Docs: row in States. Accessibility: how the busy state is announced, cited from APG/WAI-ARIA (`agents/accessibility.md`). |
| "Make it accessible" / "What does a screen reader say?" | Read the role profile in `packages/components/specs/a11y/roles.json` and its APG pattern first. Answer and specify only from trusted sources (`agents/accessibility.md`); cite them in the spec, explain them in the docs. |
| "Every component must…" / "The focus ring…" / "Define the code colors" | A foundation (`agents/model.md`): the semantic tokens first, then `packages/components/specs/foundations/<id>.spec.json` (rules, specimens, contrast, accessibility, examples, `decisions[]`) and `apps/docs/content/foundations/<id>.md`. Components follow it by aliasing its tokens; `appliesTo` makes `pnpm validate` require it. Never re-describe it in each component. |
| "Add a new component" | `pnpm new:component <id> --name ... --role ...`, then fill every generated file. Add the component to `packages/components/src/index.css` (the scaffold does it). If the role has no profile in `packages/components/specs/a11y/roles.json`, write it first from the APG pattern and the WAI-ARIA role. Then the docs: every site control the component covers becomes the component (`pnpm validate` lists them), and the table in `apps/docs/AGENTS.md` says so. Then its Figma blueprint, written from the CSS and template (`packages/figma/AGENTS.md`): the scaffold does not write one, and `pnpm test` fails until it exists. |
| "Hover does not exist on touch" / "This state only exists on iOS" | Spec: `inputs` on the state (`pointer`, `touch`, `keyboard`), or `platforms` when a platform genuinely lacks or adds the state. CSS and template only cover states that include `web`. Docs: say so in the States table. |
| "Support dark mode" / "This color is wrong in dark mode" | Semantic tokens of the mode: `packages/tokens/src/modes/dark/` (same path as in `packages/tokens/src/semantic/`, aliasing a raw token; add the raw primitive if missing), or `packages/tokens/src/additions/modes/dark/` for a token the design system added. Never a component token. Rebuild. Every component aliasing it (directly or through semantic aliases): contrast recomputed in that mode, version + changelog with the ratios. Docs only if the guidance changes. |
| "Add a high-contrast / dim mode" | A `modes` entry in `packages/tokens/tokens.config.json` (with its `scheme`) and its overlay directory `packages/tokens/src/modes/<id>/`. Rebuild: the web gets `[data-theme="<id>"]`, every platform a `<id>.tokens.json`. Contrast of every component in the new mode. |
| "On iOS the target must be 44 pt" | A decision first: there is no control height token to override. Then an override in `packages/tokens/src/platforms/ios/`, never a component token. Rebuild. Spec: a guideline scoped `platforms: ["ios"]` citing Apple HIG (`agents/accessibility.md`). Docs: a `### iOS` sub-heading. |
| "Add a Flutter / Qt / JavaFX implementation" | Not a platform. Pick the platforms it targets, consume `packages/tokens/dist/platforms/<id>/<mode>.tokens.json` (`@quantum-ds/tokens/platforms/<id>/<mode>.tokens.json`; one per mode, selected by the system appearance named by the mode's `scheme`; or `packages/tokens/dist/css/` (`@quantum-ds/tokens/css/index.css`) for the web), record it under `implementations.<platform>` in the spec. |
| "Add a screen" / "Rebuild this page with the design system" | `apps/docs/screens/AGENTS.md`: a source with a licence that allows it (`source.json` + the licence text), then `apps/docs/screens/<source>/<block>.screen.mjs` rendering the components' templates, laid out by `apps/docs/screens/screens.css` on semantic tokens. Every gap goes to `meta.gaps` (its text; the issues tracking it when some exist). |
| "Change how the site looks" | `apps/docs/` only, with semantic tokens and the design system's components. A meaning the semantic tier lacks becomes a semantic token (`packages/tokens/src/additions/semantic/`), never a site literal. Never solve a component styling problem in the site CSS. |
| "Plug the real tokens" / "Where does this token come from?" | See `agents/token-sources.md`. |
| "Draw the components in Figma" / "Update the Figma file" | `pnpm figma:export` (or `pnpm figma:export <id>…`) builds the plugin into `packages/figma/dist/`; run it in the Figma desktop app (`agents/token-sources.md` "Drawing a component in Figma"). A component that renders wrong in Figma is fixed in its blueprint, never in the Figma file: the next run would redraw it. |
| "Compare a component with its Figma export" / "Align the button with Figma" | The local export in `raw_content/components/` (`agents/token-sources.md`) is the candidate rendering; the repository stays the reference for the variants (axes and option names). List every difference in the pull request, then take them **one at a time**: show before and after on the site, the team decides, then the decision loop (below) and one commit. Map every raw value of the export to the semantic token that carries it (values a couple of RGB units apart are export noise); change only the component's tokens, never raw or semantic tokens, and ask before any addition. Keep the running list of departures from Figma in the pull request; when the last difference is decided, open one issue labelled `upstream-figma-ds` listing each departure with its values, the Figma variable to bind and the decision id, so the Figma library converges. |

### Decisions: defining a component one statement at a time

Components are defined incrementally: someone states a decision ("the button has a blue
border using the primary color", "there are three variants", "no icon on the small size").
Each statement goes through the decision loop below, in full, before the next one. It applies
to every component. What a component shows before a decision confirms it is **provisional**: a
decision may replace provisional content without superseding anything.

1. **Understand it.** Restate the decision as a rule. Ask before applying when it is
   ambiguous, contradicts an active decision, or would break WCAG 2.2 AA (`agents/accessibility.md`): say which
   criterion it breaks, with its source, and propose a compliant alternative.
2. **Store it** in the spec's `decisions[]`, newest first: a stable kebab `id`, `date`,
   `version` (the one this change ships in), `area`, `status: "active"`, `text` (the rule,
   present tense), `rationale` only when one was given (never invented), `tokens` (the paths or
   `group.*` that carry it), `platforms` when scoped, `refs` when accessibility is involved
   (required for `area: "accessibility"`). A decision that replaces an earlier one lists it in
   `supersedes`, and the earlier one becomes `status: "superseded"`; old entries are never
   edited or deleted. The site renders the log on the component's Decisions tab.
3. **Tokens.** Create, update or delete semantic tokens when the decision is a system-wide
   meaning (step 3 of the change workflow above), then component tokens for every affected part × option × state. Raw
   tokens only when a needed primitive is missing (`agents/token-sources.md`). Delete tokens nothing uses any more.
   `pnpm tokens:build`.
4. **Spec.** Anatomy, properties and options, states, layout, content rules, `examples[]` (add
   or change an example when the decision is visible), accessibility contract. Bump the minor
   `version` (patch for a fix that changes no decision) and add a `changelog` entry naming the
   decision ids.
5. **Web implementation.** CSS rules for every new option and state, template parts. CSS still
   reads only component tokens.
6. **Docs.** Tables (variants, sizes, states), guidance, platform sub-headings. Docs explain
   *why* and *when*; they do not copy the decision log.
7. **Examples, states matrix, playground and screens.** They are generated from `examples[]`,
   `properties` and `states`: check on the site that they show the decision. Never patch the
   site for one component; if the viewer cannot show a decision, open an issue (`agents/git.md`). Update
   and look at every screen rendering the component (`pnpm impact` lists them).
8. **Accessibility check.** For every affected pair, compute the contrast from the resolved
   tokens in every mode × option × enabled state (text 4.5:1, WCAG 1.4.3; borders that identify the
   control and the focus ring 3:1, WCAG 1.4.11) and record the ratios in the changelog entry.
   Also review target size (2.5.8), focus visibility (2.4.7), meaning by color alone (1.4.1),
   the role profile, and each platform's overlay. New statements cite sources you opened (`agents/accessibility.md`).
9. **Verify and look:** `pnpm check`, `pnpm impact`, then the site: Decisions tab, examples,
   states matrix, playground, Specification tab.
10. **Report and commit.** Report per artifact what the decision changed, the contrast ratios
    and sources, and each linked artifact left unchanged with the reason. Commit the decision
    on its own branch, as a Conventional Commit scoped to the component (`feat(button): blue
    border in the primary color`; `agents/git.md`), push the branch and open a pull request with the labels
    that fit and a description a reviewer can follow (`agents/git.md` "Pull requests").

## Definition of done

- [ ] Spec validates against the schema; `version` bumped and `changelog` entry added.
- [ ] Every stated decision recorded in `decisions[]`; a replaced one marked `superseded`.
- [ ] Component tokens cover every affected part × option × state; aliases point to semantic tokens.
- [ ] `pnpm tokens:build` run (its outputs are not committed).
- [ ] CSS has a rule for every option and every state; template renders every example.
- [ ] The Figma blueprint follows the CSS structure and binds or lists every token slot (`pnpm test`).
- [ ] Docs updated (variants/sizes/states tables, content, accessibility).
- [ ] Contrast of every affected color pair computed from the resolved tokens, in every mode, and recorded. A foundation's pairs are declared in its `contrast[]` and computed by `pnpm validate`.
- [ ] A rule shared by every component lives in a foundation (`packages/components/specs/foundations/`), not in each component; components following it alias its tokens.
- [ ] Every new raw or semantic token reaches a foundation page: owned by a foundation or matched by one of its specimens (no `pnpm validate` warning).
- [ ] Every accessibility statement cites a trusted source you actually opened (`agents/accessibility.md`); the
      docs Accessibility section links the sources that back its explanations.
- [ ] Anything platform-specific is scoped (`platforms`, `inputs`, `### <Platform>`); universal statements really hold everywhere; platform overlays rebuilt.
- [ ] `pnpm check` passes with no errors. Warnings understood.
- [ ] `pnpm impact` passes; every unchanged linked artifact is justified in the report (`agents/impact.md`).
- [ ] Component reviewed in the site (examples, states matrix, playground, accessibility).
- [ ] Every screen using a changed component or token updated (API changes applied, filled gaps removed) and reviewed on the Screens tab, at every frame width and in every mode.
- [ ] The docs site still uses only semantic tokens, and the components covering its controls (a new component replaced its site look-alikes; `apps/docs/AGENTS.md` table updated).
- [ ] Committed on its own branch, never on `main`, as a Conventional Commit scoped to the component or area (`agents/git.md` "Commits").
- [ ] Branch pushed and pull request opened with the labels that fit and a human-readable description (`agents/git.md` "Pull requests").
- [ ] Final report: what was done, and what the reviewer must look at precisely (`agents/git.md` "Pull requests").
