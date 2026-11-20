// Reference copy of a sheet built on the shared shell (sheet-shell.mjs): the Text field's error icon color
// (#103 step 12, point 2c). It needs that branch's Text field template (severity, severityIcon): copy it to
// build/review/tools/ and adapt the sheet, the options, the variants, the cell and the measurement.
// node shell.example.mjs <repo> <out.html>
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadSession, renderSheet } from './sheet-shell.mjs';

const [repo, out] = process.argv.slice(2);
const tpl = async (id) => (await import(pathToFileURL(path.resolve(repo, 'packages/components/src/components', id, `${id}.template.mjs`)).href)).render;
const textField = await tpl('text-field');
const icon = await tpl('icon');

const sheet = {
  step: 12, point: '2c', stepTitle: 'Error state',
  question: 'Which color for the error icon?',
  decided: 'The icon goes after the control (20 / 24 / 24 px) or in the message (16 px), one rule per form; the message is 14 / 16 / 16 px. In both placements the icon sits on the surface, never on the fill.',
  notHere: 'Whether the message keeps the word "Error:" next to the icon is #105 step 11.',
};
const options = [
  { id: 'reference', short: 'Ref', name: 'Reference', title: 'Figma prototype: icon inside the box', token: 'global.icon.on-subtle.functional.error.default', light: '#940E11', dark: null, darkNote: 'The Figma prototype has no dark values.', why: 'Figma draws the icon inside the box, on the subtle fill; ruled out on the web by #105 step 5.' },
  { id: 'A', name: 'Option A', title: 'On-base error icon, the message\'s color', token: 'global.icon.on-base.functional.error.default', light: '#C01619', dark: '#F88275', recommended: true, why: 'The Icon\'s color: error on a surface, where the icon sits in both placements; same color as the message text.' },
  { id: 'B', name: 'Option B', title: 'On-subtle error icon, Figma\'s color', token: 'global.icon.on-subtle.functional.error.default', light: '#940E11', dark: '#FAA79D', why: 'The role of an icon on the subtle error fill; here the icon sits on the surface, not on the fill.' },
];
const variants = ['small', 'medium', 'large'].flatMap((size) => [['after-control', 'after the control'], ['message', 'in the message']].map(([place, label]) => ({ id: `${size}-${place}`, label: `${size} · ${label}`, size, place })));
const field = (size, place) => textField({ size, label: 'Start date', value: '12/03/2024', message: 'Enter a date after today.', severity: 'error', severityIcon: place, id: 'IDX' });
const cell = (o, v) => {
  if (o.id === 'reference') {
    return field(v.size, 'none').replace(/(<input[^>]*>)/, `<span class="ex-figbox">$1<span class="ex-figic" data-part="severity-icon" role="img" aria-label="Error">${icon({ name: 'error', size: v.size === 'small' ? 'medium' : 'large' })}</span></span>`);
  }
  return `<div class="ex-${o.id}">${field(v.size, v.place)}</div>`;
};
// Review-only CSS: each option's icon color; the Figma replica's icon inside the box.
const css = `
.ex-A [data-part=severity-icon]{color:var(--global-icon-on-base-functional-error-default)}
.ex-B [data-part=severity-icon]{color:var(--global-icon-on-subtle-functional-error-default)}
.ex-figbox{position:relative;display:block}.ex-figbox input{width:100%;padding-inline-end:36px}
.ex-figic{position:absolute;inset-inline-end:8px;top:50%;transform:translateY(-50%);display:inline-flex;color:#940E11}`;
// Under each rendering: the icon's size, its contrast on the surface (WCAG 1.4.11, 3:1) and how far its color is from the message's.
const measure = `(f, cell, zoom) => {
  const ic = $('[data-part=severity-icon]', f), msg = $('[data-part=message]', f);
  if (!ic) return '';
  const icc = getComputedStyle(ic).color, r = ratio(icc, getComputedStyle(cell).backgroundColor);
  return 'icon ' + Math.round(ic.getBoundingClientRect().width / zoom) + 'px · <span class="' + (r < 3 ? 'bad' : '') + '">' + r.toFixed(2) + ':1</span> on the surface'
    + (msg ? ' · icon/msg ' + ratio(icc, getComputedStyle(msg).color).toFixed(2) : '');
}`;

fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
fs.writeFileSync(out, await renderSheet({ repo, session: loadSession(repo), sheet, options, variants, cell, css, measure }));
console.log('wrote', out);
