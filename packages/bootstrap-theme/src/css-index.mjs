/**
 * A minimal CSS reader, zero dependencies: enough to index the rules of Bootstrap's compiled CSS
 * and of the theme this package writes. It strips comments, walks the braces, keeps the at-rule
 * context of each style rule (`@layer components`, `@media (…)`) and splits its declarations.
 * It is not a general CSS parser: it assumes well-formed, compiled CSS (no nesting in style rules).
 */

/** Remove comments, keeping strings intact. */
export function stripComments(css) {
  let out = '';
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '"' || c === "'") {
      const end = findStringEnd(css, i);
      out += css.slice(i, end + 1);
      i = end;
    } else if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? css.length : end + 1;
    } else out += c;
  }
  return out;
}

function findStringEnd(s, i) {
  const q = s[i];
  for (let j = i + 1; j < s.length; j++) {
    if (s[j] === '\\') j++;
    else if (s[j] === q) return j;
  }
  return s.length - 1;
}

/** Split a declaration block on top-level semicolons (not inside parentheses or strings). */
export function splitDeclarations(block) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (let i = 0; i < block.length; i++) {
    const c = block[i];
    if (c === '"' || c === "'") {
      const end = findStringEnd(block, i);
      cur += block.slice(i, end + 1);
      i = end;
      continue;
    }
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (c === ';' && depth === 0) {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
    } else cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out
    .map((d) => {
      const i = d.indexOf(':');
      return i === -1 ? null : { property: d.slice(0, i).trim(), value: d.slice(i + 1).trim() };
    })
    .filter(Boolean);
}

/**
 * Parse CSS into a flat list of style rules: { selector, selectors[], context[], declarations[] }.
 * `context` lists the enclosing at-rules (`@layer components`, `@media (…)`), outermost first.
 */
export function parseRules(css) {
  const src = stripComments(css);
  const rules = [];
  const walk = (text, context) => {
    let i = 0;
    while (i < text.length) {
      const open = nextBrace(text, i);
      if (open === -1) return;
      const prelude = text.slice(i, open).trim().replace(/^[;\s]*/, '');
      const close = matchBrace(text, open);
      const body = text.slice(open + 1, close);
      // A statement at-rule before the prelude (`@layer a, b;` or `@charset "…";`) is skipped.
      const head = prelude.includes(';') ? prelude.slice(prelude.lastIndexOf(';') + 1).trim() : prelude;
      if (head.startsWith('@')) {
        if (/^@(media|layer|supports|container|scope|starting-style)\b/.test(head)) walk(body, [...context, head.replace(/\s+/g, ' ')]);
      } else {
        const selectors = head.split(/,(?![^(]*\))/).map((s) => s.trim().replace(/\s+/g, ' ')).filter(Boolean);
        rules.push({ selector: selectors.join(', '), selectors, context, declarations: splitDeclarations(body) });
      }
      i = close + 1;
    }
  };
  walk(src, []);
  return rules;
}

function nextBrace(s, from) {
  for (let i = from; i < s.length; i++) {
    const c = s[i];
    if (c === '"' || c === "'") i = findStringEnd(s, i);
    else if (c === '{') return i;
  }
  return -1;
}

function matchBrace(s, open) {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    const c = s[i];
    if (c === '"' || c === "'") i = findStringEnd(s, i);
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i;
  }
  return s.length;
}

/**
 * Index Bootstrap's compiled CSS: every custom property it declares, with the selectors that declare
 * it, and every custom property it reads through var().
 */
export function indexCustomProperties(css) {
  const rules = parseRules(css);
  const declared = new Map(); // property -> Set of selector strings
  for (const r of rules) {
    for (const d of r.declarations) {
      if (!d.property.startsWith('--')) continue;
      if (!declared.has(d.property)) declared.set(d.property, new Set());
      for (const s of r.selectors) declared.get(d.property).add(s);
    }
  }
  const read = new Set([...stripComments(css).matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]));
  return { rules, declared, read };
}

/**
 * Specificity of one selector as [ids, classes, types]. Handles :is/:not/:has (most specific
 * argument), :where (zero), attribute selectors, pseudo-classes and pseudo-elements.
 */
export function specificity(selector) {
  let a = 0, b = 0, c = 0;
  let s = selector;
  // Functional pseudo-classes first: replace each by a placeholder after counting its argument.
  const fn = /:(is|not|has|where|nth-child|nth-last-child)\(/;
  let m;
  while ((m = fn.exec(s))) {
    const start = m.index + m[0].length;
    let depth = 1, i = start;
    for (; i < s.length && depth; i++) {
      if (s[i] === '(') depth++;
      else if (s[i] === ')') depth--;
    }
    const arg = s.slice(start, i - 1);
    if (m[1] === 'where') { /* zero */ } else if (m[1].startsWith('nth')) b++;
    else {
      const best = arg.split(/,(?![^(]*\))/).map((x) => specificity(x.trim())).sort(compareSpecificity).at(-1) ?? [0, 0, 0];
      a += best[0]; b += best[1]; c += best[2];
    }
    s = s.slice(0, m.index) + ' ' + s.slice(i);
  }
  s = s.replace(/\[[^\]]*\]/g, () => { b++; return ' '; });
  s = s.replace(/::[\w-]+(\([^)]*\))?/g, () => { c++; return ' '; });
  s = s.replace(/:[\w-]+(\([^)]*\))?/g, () => { b++; return ' '; });
  s = s.replace(/#[\w-]+/g, () => { a++; return ' '; });
  s = s.replace(/\.[\w-]+/g, () => { b++; return ' '; });
  for (const part of s.split(/[\s>+~*]+/)) if (/^[a-zA-Z][\w-]*$/.test(part)) c++;
  return [a, b, c];
}

export const compareSpecificity = (x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
const sameSpecificity = (x, y) => compareSpecificity(x, y) === 0;

/** The layer (`@layer components`) of a rule, or '' when unlayered. */
export const layerOf = (rule) => rule.context.find((c) => c.startsWith('@layer')) ?? '';

/** The first rule written exactly with `selector` (same selector list) outside media and container queries. */
export function findRule(rules, selector) {
  const norm = selector.split(/,(?![^(]*\))/).map((s) => s.trim().replace(/\s+/g, ' ')).join(', ');
  const i = rules.findIndex((r) => r.selector === norm && r.context.every((c) => c.startsWith('@layer')));
  return i === -1 ? null : { index: i, rule: rules[i] };
}

/**
 * Bootstrap's rules that the theme's own rules would override by mistake: a rule declaring the same
 * custom property, in the same layer, written AFTER the Bootstrap rule the theme overrides, with a
 * selector of the same specificity, that the theme does not itself re-declare. Bootstrap meant it
 * to win (a size modifier after the base class); the theme, coming later, would win instead. The
 * build restates Bootstrap's value for each, after the theme's rule, so the cascade stays Bootstrap's.
 * `targets` = [{ selector, properties[] }]. Returns [{ index, rule, selectors[], property, value, after }].
 */
export function shadowedRules(rules, targets) {
  const emitted = new Map(); // property -> Set of selectors the theme writes it on
  for (const t of targets) for (const p of t.properties) {
    if (!emitted.has(p)) emitted.set(p, new Set());
    for (const s of t.selector.split(/,(?![^(]*\))/)) emitted.get(p).add(s.trim().replace(/\s+/g, ' '));
  }
  const out = [];
  for (const t of targets) {
    const found = findRule(rules, t.selector);
    if (!found) continue;
    const layer = layerOf(found.rule);
    const specs = found.rule.selectors.map(specificity);
    for (let i = found.index + 1; i < rules.length; i++) {
      const r = rules[i];
      if (layerOf(r) !== layer) continue;
      for (const d of r.declarations) {
        if (!t.properties.includes(d.property)) continue;
        const selectors = r.selectors.filter((s) => !emitted.get(d.property).has(s) && specs.some((sp) => sameSpecificity(sp, specificity(s))));
        if (selectors.length) out.push({ index: i, rule: r, selectors, property: d.property, value: d.value, after: t.selector });
      }
    }
  }
  // One entry per (rule, property), in Bootstrap's order.
  const seen = new Set();
  return out.filter((o) => {
    const k = `${o.index} ${o.property}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).sort((x, y) => x.index - y.index);
}

/**
 * Check a mapping against Bootstrap's compiled CSS: every custom property it targets is declared or
 * read by Bootstrap, and every selector it writes is a rule Bootstrap has. Returns problems (strings).
 */
export function checkTargets(mapping, index) {
  const problems = [];
  for (const g of mapping.groups) {
    for (const sel of [g.selector, ...(g.also ?? [])]) if (!findRule(index.rules, sel)) problems.push(`${g.id}: Bootstrap has no rule "${sel}"`);
    for (const prop of Object.keys(g.tokens)) {
      if (!index.declared.has(prop) && !index.read.has(prop)) problems.push(`${g.id}: Bootstrap neither declares nor reads ${prop}`);
    }
  }
  return problems;
}
