/**
 * Text size rules: a component whose text takes the size of another component's text, size for
 * size. The value and placeholder text of a field takes the text size of the Button of the same
 * size (decision value-text-button-size in packages/components/specs/components/text-field.spec.json):
 * small 14, medium 16, large 16 px, the same semantic tokens as button.label.typography. Component
 * tokens alias semantic tokens only, so the rule compares the font size token each one aliases,
 * not a resolved value. The three plain fields follow through the mirror check (lib/mirrors.mjs).
 * Zero-dependency, shared by validate.mjs and the tests.
 */
import { isAlias, aliasPath } from './dtcg.mjs';

/**
 * - `token`: typography token (component path, without the size) whose font size follows `follows`.
 * - `follows`: the typography token whose font size it takes, at the same size.
 * - `sizes`: size option ids, the last segment of both paths.
 */
export const TEXT_SIZE_RULES = [
  {
    token: 'text-field.control.typography',
    follows: 'button.label.typography',
    sizes: ['small', 'medium', 'large'],
    why: 'the value and placeholder text of a field takes the text size of the Button of the same size',
  },
];

/** The font size member of a typography token, as the semantic path it aliases (or its literal). */
const fontSizeOf = (token) => {
  const v = token?.value?.fontSize;
  return typeof v === 'string' && isAlias(v) ? aliasPath(v) : v;
};

/**
 * @param {typeof TEXT_SIZE_RULES} rules
 * @param {Map<string, { value: any }>} byPath component and semantic tokens by path
 * @returns {{ message: string }[]} one problem per size whose font size tokens differ, or a token that is missing
 */
export function checkTextSizeRules(rules, byPath) {
  const problems = [];
  for (const rule of rules) {
    for (const size of rule.sizes) {
      const a = `${rule.token}.${size}`;
      const b = `${rule.follows}.${size}`;
      const ta = byPath.get(a);
      const tb = byPath.get(b);
      if (!ta || !tb) {
        problems.push({ message: `${!ta ? a : b} does not exist: ${a} takes the font size of ${b} (scripts/lib/text-size-rules.mjs)` });
        continue;
      }
      const fa = fontSizeOf(ta);
      const fb = fontSizeOf(tb);
      if (fa === undefined || fb === undefined || fa !== fb) {
        problems.push({ message: `${a} takes font size ${fa ?? 'none'} but ${b} takes ${fb ?? 'none'}: ${rule.why} (scripts/lib/text-size-rules.mjs)` });
      }
    }
  }
  return problems;
}
