/**
 * Which components a foundation applies to (`appliesTo` of a foundation spec), read from each
 * component's role profile (`specs/a11y/roles.json`). Zero dependencies; shared by validate.mjs,
 * impact.mjs and the docs site (apps/docs/src/lib/foundations.ts).
 *
 *   every-component        every component
 *   focusable-components   role profile `focusable`
 *   input-components       role profile `input`: a component through which people enter or
 *                          choose a value the product keeps (the Forms foundation)
 *
 * A foundation that owns tokens is followed by the components aliasing them, so the first two
 * resolve their followers from the component tokens (`followers: 'aliases'`). The Forms
 * foundation owns no token to alias: its followers are the components in scope
 * (`followers: 'scope'`), and what each one follows is read from its own spec (`tiersOf`).
 */

export const SCOPES = {
  'every-component': { followers: 'aliases', has: () => true, rule: 'every component' },
  'focusable-components': { followers: 'aliases', has: (profile) => Boolean(profile?.focusable), rule: 'every component whose role profile is focusable' },
  'input-components': { followers: 'scope', has: (profile) => Boolean(profile?.input), rule: 'every component whose role profile is marked as input' },
};

/** True when the component (its role profile in `roles`) is in the scope `appliesTo` names. */
export function inScope(appliesTo, spec, roles) {
  return Boolean(SCOPES[appliesTo]?.has(roles?.[spec.role], spec));
}

/** True when the followers of the scope are the components in scope, not the ones aliasing tokens. */
export function followedByScope(appliesTo) {
  return SCOPES[appliesTo]?.followers === 'scope';
}

/** The component specs in scope, in the order given. */
export function componentsInScope(appliesTo, specs, roles) {
  return specs.filter((spec) => inScope(appliesTo, spec, roles));
}

/**
 * The rules of the Forms foundation a control follows, read from its spec, with no list of
 * exceptions: `presentation` for every input, `required` when it declares the `required`
 * property, `validation` when it has the `severity` property or the `error` state.
 */
export function tiersOf(spec) {
  return [
    'presentation',
    ...((spec.properties ?? []).some((p) => p.id === 'required') ? ['required'] : []),
    ...((spec.properties ?? []).some((p) => p.id === 'severity') || (spec.states ?? []).some((s) => s.id === 'error') ? ['validation'] : []),
  ];
}

/** The tiers a foundation guideline may name (`tier`), in the order `tiersOf` returns them. */
export const TIERS = ['presentation', 'required', 'validation'];

/**
 * The guidelines of a foundation that a component follows, derived with no list of its own: the
 * foundation is followed by scope (Forms), the component is in its scope, and the guideline names
 * a tier the component follows (`tier`, read against `tiersOf`). A guideline without a tier is
 * about the form as a whole (its summary, its spacing, its keyboard): it stays on the foundation's
 * page and is not listed on a component's.
 */
export function inheritedGuidelines(foundation, spec, roles) {
  if (!foundation?.appliesTo || !followedByScope(foundation.appliesTo) || !inScope(foundation.appliesTo, spec, roles)) return [];
  const tiers = new Set(tiersOf(spec));
  return (foundation.accessibility?.guidelines ?? []).filter((g) => g.tier && tiers.has(g.tier));
}

/**
 * What the tiers ask of an input control's anatomy: a visible label part of the whole control
 * (the label of a field, the legend of a group), and, with a `severity`, a part to say
 * the message in text. A missing message part is an error: a control without one reports an
 * error by color alone (WCAG 3.3.1; Forms decision `forms-message-part-every-control`).
 */
export function checkInputControl(spec) {
  const problems = [];
  const anatomy = spec.anatomy ?? [];
  const label = anatomy.find((p) => p.role === 'label' && p.required && !p.parent);
  if (!label) problems.push({ level: 'error', message: 'is an input but has no required part with role "label" (its label, or the legend of a group) that is not inside another part: every input has a visible label' });
  if (tiersOf(spec).includes('validation') && !anatomy.some((p) => p.role === 'errormessage')) {
    problems.push({ level: 'error', message: 'has a severity but no part with role "errormessage" (the message): an error cannot be said in text next to the control, only by its color (WCAG 3.3.1; Forms decision forms-message-part-every-control)' });
  }
  return problems;
}
