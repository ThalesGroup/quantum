/**
 * Conventional Commits 1.0.0 (https://www.conventionalcommits.org/en/v1.0.0/) for this repository.
 * Pure functions, zero dependencies: shared by scripts/commit-lint.mjs (git hook, CI) and the tests.
 *
 *   <type>[(<scope>[,<scope>…])][!]: <subject>
 *
 *   [body]
 *
 *   [BREAKING CHANGE: <what consumers must change>]
 *
 * Scopes are component ids (packages/components/specs/components/<id>.spec.json), foundation ids
 * (specs/foundations/<id>.spec.json) or the areas in AREA_SCOPES.
 */

/** Allowed types and what they mean here (agents/git.md "Commits"). */
export const TYPES = {
  feat: 'a new capability: component, property, option, state, decision, token, site feature, script command',
  fix: 'a correction that changes no decision (a patch version), or a bug in tooling or the site',
  docs: 'prose only: docs/, AGENTS.md, README',
  style: 'formatting only, no change of meaning',
  refactor: 'restructuring without a visible change',
  perf: 'faster, same result',
  test: 'tests only',
  build: 'token pipeline, build scripts, package manifests',
  ci: 'CI configuration (.github/workflows/) and git hooks',
  chore: 'housekeeping that fits nowhere else',
  revert: 'reverts an earlier commit',
};

/** Scopes that are not component ids. */
export const AREA_SCOPES = ['tokens', 'modes', 'platforms', 'foundations', 'specs', 'a11y', 'components', 'figma', 'penpot', 'web', 'docs', 'screens', 'scripts', 'agents', 'ci', 'deps', 'release'];

export const MAX_HEADER = 100;

const HEADER = /^(?<type>[a-z]+)(?:\((?<scope>[^()]*)\))?(?<breaking>!)?: (?<subject>.*)$/;

/** Lines git itself writes and drops: comments and everything below the scissors line. */
export function stripGitComments(message) {
  const lines = String(message).replace(/\r\n/g, '\n').split('\n');
  const scissors = lines.findIndex((l) => /^# -+ >8 -+$/.test(l));
  return (scissors >= 0 ? lines.slice(0, scissors) : lines).filter((l) => !l.startsWith('#')).join('\n').trim();
}

/** Messages git generates that are not ours to format. */
export function isExempt(message) {
  return /^(Merge |fixup! |squash! |amend! |Revert ")/.test(message);
}

/**
 * Parse and check one commit message.
 * @param {string} message raw message (git comments allowed)
 * @param {{ scopes?: Iterable<string> }} options allowed scopes; omit to accept any kebab-case scope
 * @returns {{ ok: boolean, errors: string[], header?: object }}
 */
export function lintCommit(message, { scopes } = {}) {
  const text = stripGitComments(message);
  const errors = [];
  if (!text) return { ok: false, errors: ['empty message'] };
  if (isExempt(text)) return { ok: true, errors: [], exempt: true };

  const [header, second, ...rest] = text.split('\n');
  const m = HEADER.exec(header);
  if (!m) {
    errors.push(`header "${header}" must read "<type>(<scope>): <subject>", e.g. "feat(button): three emphasis variants"`);
    return { ok: false, errors };
  }
  const { type, scope, breaking, subject } = m.groups;
  if (!Object.hasOwn(TYPES, type)) errors.push(`unknown type "${type}"; use one of ${Object.keys(TYPES).join(', ')}`);

  const allowed = scopes ? new Set(scopes) : null;
  if (scope !== undefined) {
    const list = scope.split(',').map((s) => s.trim());
    for (const s of list) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)) errors.push(`scope "${s}" must be kebab-case`);
      else if (allowed && !allowed.has(s)) errors.push(`unknown scope "${s}"; use a component or foundation id or one of ${AREA_SCOPES.join(', ')}`);
    }
  }

  if (!subject.trim()) errors.push('subject is empty');
  else {
    if (subject !== subject.trim()) errors.push('subject has leading or trailing spaces');
    if (/[.。]$/.test(subject)) errors.push('subject must not end with a period');
  }
  if (header.length > MAX_HEADER) errors.push(`header is ${header.length} characters; keep it under ${MAX_HEADER + 1}`);
  if (second !== undefined && second.trim() !== '') errors.push('leave a blank line between the header and the body');

  const body = rest.join('\n');
  const footerBreaking = /^BREAKING[ -]CHANGE: \S/m.test(body);
  if (/^BREAKING[ -]CHANGE:?\s*$/m.test(body)) errors.push('BREAKING CHANGE footer needs a description');
  if (/^breaking[ -]change:/im.test(body) && !/^BREAKING[ -]CHANGE:/m.test(body)) errors.push('write the footer token in capitals: "BREAKING CHANGE:"');

  return {
    ok: errors.length === 0,
    errors,
    header: { type, scopes: scope?.split(',').map((s) => s.trim()) ?? [], breaking: Boolean(breaking) || footerBreaking, subject },
  };
}
