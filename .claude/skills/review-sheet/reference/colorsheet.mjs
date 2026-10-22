// Reference copy of the generator used for the Button color questions of an earlier step-by-step pull request (steps 7 to 9).
// Button-specific (export path, template, emphasis × intent groups): copy it to build/review/tools/ and adapt.
// Color review sheet: given emphasis × intent groups, Figma replica / today / candidate rows (review-only CSS),
// on a page, a card and a checkerboard, light and dark, with the label contrast measured live under each button.
// node colorsheet.mjs <repo> <out.html> <config.json>
// config: { title, note (HTML), groups: [[emphasis, intent]], rows: [[label, class]], css: "review-only CSS" }
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const [repo, out, cfgPath] = process.argv.slice(2);
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const exp = JSON.parse(fs.readFileSync(path.join(repo, 'raw_content/components/button-variants-raw.json'), 'utf8'));
const { render } = await import(pathToFileURL(path.join(repo, 'packages/components/src/components/button/button.template.mjs')).href);
// Two stylesheets: the tokens entry point (generated) first, then the components entry point.
const tokensCss = '/@fs' + path.resolve(repo, 'packages/tokens/dist/css/index.css');
const css = '/@fs' + path.resolve(repo, 'packages/components/src/index.css');
const STATES = ['default', 'hover', 'active', 'disabled'];
const solid = (ps) => (ps || []).find((p) => p.visible !== false && p.type === 'SOLID');
const rgba = (p) => { const n = parseInt(p.color.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${+(p.opacity ?? 1).toFixed(3)})`; };
const figma = (emphasis, intent, state) => {
  const v = exp.variants.find((x) => { const p = x.variantProperties; return p.emphasis === emphasis && p.intent === intent && p.size === 'medium' && p.icon === 'left' && p.state === state; });
  const f = solid(v.fills), s = solid(v.strokes);
  const t = (function find(n) { if (n.type === 'TEXT') return n; for (const c of n.children || []) { const r = find(c); if (r) return r; } })(v);
  const tc = solid(t.text.fills);
  return `<span class="fig" style="background:${f ? rgba(f) : 'transparent'};box-shadow:inset 0 0 0 0.6px ${s ? rgba(s) : 'transparent'};color:${tc ? rgba(tc) : 'inherit'}"><span class="ico">add</span>Button</span>`;
};
const today = (emphasis, intent, state) => render({ emphasis, intent, size: 'medium', label: 'Button', iconStart: 'add', disabled: state === 'disabled', state: ['hover', 'active'].includes(state) ? state : null });
const ROWS = [['Figma', 'figma'], ['today', 'today'], ...cfg.rows];
const SURFACES = [['light', '0', 'Page (level 0), light'], ['light', '1', 'Card / sidebar (level 1), light'], ['light', 'checker', 'Checkerboard, light'], ['dark', '0', 'Page (level 0), dark'], ['dark', '1', 'Card / sidebar (level 1), dark'], ['dark', 'checker', 'Checkerboard, dark']];
const block = ([theme, level, title]) => `<section data-theme="${theme}" data-level="${level}" class="surface${level === 'checker' ? ' checker' : ''}" style="${level === 'checker' ? '' : `background: var(--global-bg-level-${level}-default); `}color: var(--global-text-on-base-neutral-primary)"><h2>${title}</h2>${cfg.groups.map(([em, it]) => `<table><thead><tr><th>${em} ${it}</th>${STATES.map((s) => `<th>${s}</th>`).join('')}</tr></thead><tbody>${ROWS.map(([label, cls]) => cls === 'figma' && theme === 'dark' ? `<tr class="figma"><th>${label}</th><td colspan="4"><i>no dark colors in the export</i></td></tr>` : `<tr class="${cls}"><th>${label}</th>${STATES.map((s) => `<td><div class="cell">${cls === 'figma' ? figma(em, it, s) : today(em, it, s)}<i class="cr"></i></div></td>`).join('')}</tr>`).join('')}</tbody></table>`).join('')}</section>`;
fs.writeFileSync(out, `<!doctype html><html data-theme="light"><head><meta charset="utf-8"><title>${cfg.title}</title>
<link rel="stylesheet" href="${tokensCss}">
<link rel="stylesheet" href="${css}">
<style>
  body { zoom: 1.5; margin: 12px; font: 12px/1.4 system-ui, sans-serif; background: #fff; color: #222; }
  h1 { font-size: 15px; margin: 0 0 10px; } h2 { font-size: 12px; margin: 0 0 6px; }
  .note { max-width: 1100px; margin: 0 0 12px; padding: 8px 10px; border-left: 3px solid #175dd6; background: #f3f6fc; font-size: 11px; } .note p { margin: 0 0 4px; }
  .grid { display: grid; grid-template-columns: repeat(3, max-content); gap: 10px; }
  .surface { padding: 10px 12px; border: 1px solid #ccc; }
  .surface.checker[data-theme="light"] { background: repeating-conic-gradient(#ffffff 0 25%, #b8b8b8 0 50%) 0 0 / 12px 12px; }
  .surface.checker[data-theme="dark"] { background: repeating-conic-gradient(#000000 0 25%, #5a5a5a 0 50%) 0 0 / 12px 12px; }
  .surface.checker :is(h2, th, td > i, .cr) { background: var(--global-bg-level-0-default); padding: 1px 4px; }
  table { border-collapse: collapse; margin-bottom: 8px; } th, td { padding: 4px 6px; text-align: left; font-weight: 400; font-size: 10px; vertical-align: top; } thead th { opacity: 0.75; } tbody th { white-space: nowrap; opacity: 0.75; } thead th:first-child { font-weight: 600; opacity: 1; }
  .cell { display: grid; justify-items: start; gap: 2px; } .cr { font-style: normal; font-size: 9px; opacity: 0.8; } .cr.fail { color: #c01619; font-weight: 700; opacity: 1; } [data-theme="dark"] .cr.fail { color: #faa79d; }
  .fig { display: inline-flex; align-items: center; gap: 4px; height: 36px; box-sizing: border-box; padding: 0 8px 0 6px; border-radius: 4px; font: 500 16px/1 Inter; letter-spacing: -0.03em; }
  .fig .ico { font-family: 'Material Symbols Outlined'; font-weight: 300; font-size: 24px; width: 24px; line-height: 24px; font-variation-settings: 'FILL' 0, 'GRAD' 0, 'opsz' 20; }
  .ds-button { transition: none !important; } /* the hidden preview pane freezes transitions; review sheets show final colors */
${cfg.css || ''}
</style></head><body><h1>${cfg.title}</h1><div class="note">${cfg.note}<p><b>Under each button:</b> label contrast against its fill laid over the surface (page and card only; red under 4.5:1; disabled buttons are exempt from WCAG 1.4.3).</p></div><div class="grid">${SURFACES.map(block).join('')}</div>
<script type="module">
  const parse = (s) => { let m = s.match(/rgba?\\(([^)]+)\\)/); if (m) { const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { c: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; } m = s.match(/color\\(srgb ([^)]+)\\)/); if (m) { const p = m[1].split(/[ /]+/).filter(Boolean).map(Number); return { c: p.slice(0, 3).map((v) => v * 255), a: p.length > 3 ? p[3] : 1 }; } throw new Error('color ' + s); };
  const over = (f, b) => f.c.map((v, i) => v * f.a + b[i] * (1 - f.a));
  const lum = (c) => { const l = c.map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  for (const cr of document.querySelectorAll('.cr')) {
    const sec = cr.closest('section'); if (sec.dataset.level === 'checker') continue;
    const b = cr.previousElementSibling; const surf = parse(getComputedStyle(sec).backgroundColor).c;
    const bg = over(parse(getComputedStyle(b).backgroundColor), surf); const fg = over(parse(getComputedStyle(b).color), bg);
    const r = ratio(fg, bg); const disabled = b.disabled || cr.closest('td').cellIndex === 4;
    cr.textContent = r.toFixed(2) + ':1'; if (r < 4.5 && !disabled) cr.classList.add('fail');
  }
</script></body></html>`);
console.log(out);
