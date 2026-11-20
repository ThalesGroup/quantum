// The shared shell of every review sheet: a slim sticky toolbar (Quantum logo, component, pull request and
// issue, step, question, progress dots, participants' GitHub avatars, a Compare button), a centred hero (the
// question, the participants, the progress, one tile per option, the recommended and the chosen one marked), a sidebar (the
// steps, the anchors), the summary table of options and reasons, then the renderings: one sticky sub-header
// per option, the surface levels as columns, light then dark.
//
// The default view (Overview, everything shown) is what the full-page screenshot posted in the pull request
// or issue shows. The Compare panel (button or the C key, hidden by default) switches to other views
// (options side by side, light next to dark, a wipe of one option over another), filters modes, options,
// levels and variants, toggles the measurements and zooms; its state is kept in the URL query so a shared
// link opens the same view, and the default view keeps a clean URL.
//
// A generator only describes the question and draws one cell:
//
//   import { loadSession, renderSheet } from '<repo>/.claude/skills/review-sheet/reference/sheet-shell.mjs';
//   const session = loadSession(repo);                   // build/review/session.json
//   const html = await renderSheet({ repo, session, sheet, options, variants, cell, summary, measure, css });
//
// - sheet: { step, point, stepTitle, question, component (optional), chosen (optional) }
//   chosen: the id of the option the team chose, set when the step is committed; the sheet is rebuilt and
//   its screenshot posted with the step comment, so the decision shows in the tiles, the table and the
//   sub-headers (the recommended one in blue until then; the chosen one in green with a check).
// - options: [{ id, short, name, title, recommended, why (HTML), token, light, dark, darkNote }]
//   light / dark: the colors shown on the tile and in the table (CSS colors), dark null when there is none;
//   darkNote: the text shown instead of the dark renderings (for a reference without dark values).
// - variants: [{ id, label }] the stack inside each cell (sizes, placements…), filterable in the panel.
// - cell(option, variant): the HTML of one rendering, built with the components' own templates; write IDX
//   where an id goes (the shell makes it unique per copy). Rendered once at build time, stamped per mode and
//   surface level in the page.
// - summary: [{ label, cell: (option) => HTML }] the table's columns; default: token, light, dark, why.
// - measure: optional client-side JS source of a function (f, cell, zoom) => HTML that fills the line under a
//   rendering (f: its wrapper, cell: the surface element, zoom: the zoom factor); helpers available in the
//   page: ratio(colorA, colorB) (WCAG contrast of two computed colors) and $ / $$ (querySelector, -All).
// - css: review-only CSS (an option's overrides of the component's private --_* properties).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** The session's header data, asked at the start of the session (SKILL.md "Session"): build/review/session.json. */
export function loadSession(repo, file = 'build/review/session.json') {
  const p = path.resolve(repo, file);
  if (!fs.existsSync(p)) throw new Error(`${file} is missing: ask who takes part and write it first (SKILL.md "Session")`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export async function renderSheet({ repo, session: S, sheet: Q, options, variants, cell, summary, measure = null, css = '', levels = [0, 1, 2, 3], modes = ['light', 'dark'] }) {
  repo = path.resolve(repo);
  const tpl = async (id) => (await import(pathToFileURL(path.join(repo, 'packages/components/src/components', id, `${id}.template.mjs`)).href)).render;
  const T = Object.fromEntries(await Promise.all(['avatar', 'badge', 'icon', 'progress-bar', 'select', 'checkbox', 'switch', 'button'].map(async (id) => [id, await tpl(id)])));
  const fsUrl = (p) => '/@fs' + path.join(repo, p);
  const component = Q.component || S.component;
  const steps = S.steps || [];
  const done = S.done || [];
  const people = S.people || [];
  const stepCls = (i) => (done.includes(i + 1) ? 'd' : i + 1 === Q.step ? 'c' : '');
  // "Recommended" is blue while the question is open, neutral once the team has chosen.
  const decided = Boolean(Q.chosen);
  const rec = T.badge({ label: 'Recommended', intent: decided ? 'neutral' : 'brand', emphasis: 'subtle', size: 'small' });
  // The chosen option's tag: a success badge holding the check icon, named "Chosen".
  const chosen = T.badge({ label: 'Chosen', intent: 'success', emphasis: 'subtle', size: 'small' })
    .replace(/(<span class="ds-badge__label"[^>]*>)Chosen(<\/span>)/, `$1${T.icon({ name: 'check', size: 'small', label: 'Chosen' })}$2`);
  const mark = (o) => `${o.id === Q.chosen ? ' sel' : ''}${o.recommended ? ' rec' : ''}`;
  const tags = (o) => `${o.recommended ? rec : ''}${o.id === Q.chosen ? chosen : ''}`;
  const avatar = (p) => T.avatar({ name: p.name || p.login, src: p.login ? `https://github.com/${p.login}.png?size=96` : null, size: 'small' });
  const stepLabel = `${Q.step}${Q.point ? '.' + Q.point : ''}`;
  const swatch = (c) => (c ? `<span class="x-sw" style="background:${c}"></span>${esc(c)}` : '<i>none</i>');
  const columns = summary || [
    { label: 'Token', cell: (o) => (o.token ? `<code>${esc(o.token)}</code>` : '') },
    { label: 'Light', cell: (o) => swatch(o.light) },
    { label: 'Dark', cell: (o) => swatch(o.dark) },
    { label: 'Why', cell: (o) => o.why || '' },
  ];

  // Renderings, built once with the templates; the page stamps them per mode and level.
  const CELLS = {};
  for (const o of options) for (const v of variants) CELLS[`${o.id}|${v.id}`] = cell(o, v);

  // Compare panel controls: the design system's own components.
  const sel = (id, label, opts, value) => T.select({ id, size: 'small', label, options: opts.map(([v, l]) => ({ value: v, label: l, selected: v === value })) });
  const chk = (group, value, label) => T.checkbox({ id: `f-${group}-${value}`, size: 'small', label, checked: true, name: group, value });
  const group = (title, inner) => `<fieldset class="x-grp"><legend class="x-gl">${title}</legend><div class="x-gi">${inner}</div></fieldset>`;
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  const toolbar = `<header class="x-bar">
  <img class="x-logo" src="${fsUrl('assets/brand/README-avatar-light.png')}" alt="Quantum">
  <span class="x-name">Quantum review</span><span class="x-sep"></span>
  <span class="x-ids"><b>${esc(component)}</b>${S.pr ? T.badge({ label: `PR #${S.pr}`, intent: 'info', size: 'small' }) : ''}${S.issue ? T.badge({ label: `Issue #${S.issue}`, intent: 'neutral', size: 'small' }) : ''}</span>
  <span class="x-sep"></span>
  ${T.badge({ label: `Step ${stepLabel}`, intent: 'brand', emphasis: 'accent', size: 'small' })}
  <span class="x-q">${esc(Q.question)}</span>
  ${steps.length ? `<span class="x-dots" aria-label="${done.length} of ${steps.length} steps decided">${steps.map((t, i) => `<i class="${stepCls(i)}" title="${i + 1}. ${esc(t)}"></i>`).join('')}</span>` : ''}
  <span class="x-people">${people.map((p) => `<span title="${esc(p.name || p.login)}${p.role ? ' · ' + esc(p.role) : ''}">${avatar(p)}</span>`).join('')}</span>
  <span id="cmpstate" class="x-cmpstate" hidden></span>
  ${T.button({ label: 'Compare', size: 'small', emphasis: 'subtle', iconStart: 'compare', attrs: { id: 'cmpbtn', 'aria-expanded': 'false', 'aria-controls': 'drawer', title: 'Compare (C)' } })}
</header>`;

  const hero = `<section class="x-hero">
  ${T.badge({ label: `${component} · step ${Q.step}${Q.stepTitle ? ', ' + Q.stepTitle : ''}${Q.point ? ' · point ' + Q.point : ''}`, intent: 'brand', emphasis: 'accent', size: 'small' })}
  <h1>${esc(Q.question)}</h1>
  ${people.length ? `<div class="x-who"><span class="x-people">${people.map((p) => `<span>${avatar(p)}</span>`).join('')}</span><span>${people.map((p) => `${esc(p.name || '@' + p.login)}${p.role ? ` <small>(${esc(p.role)})</small>` : ''}`).join(', ')}</span></div>` : ''}
  ${steps.length ? `<div class="x-progress">${T['progress-bar']({ label: `Steps decided: ${done.length} of ${steps.length}`, value: done.length, max: steps.length, showValue: true, size: 'small' })}</div>` : ''}
  <div class="x-tiles${decided ? ' decided' : ''}" style="--x-n:${options.length}">${options.map((o) => `<a class="x-tile${mark(o)}" href="#${modes[0]}-${o.id}"><span class="x-tags">${tags(o)}</span><b class="x-tl">${esc(o.name)}</b><span>${esc(o.title)}</span>${o.light || o.dark ? `<span class="x-chips"><span style="background:${o.light || 'transparent'}" class="${o.light ? '' : 'none'}" title="light ${esc(o.light || 'none')}"></span><span style="background:${o.dark || 'transparent'}" class="${o.dark ? '' : 'none'}" title="dark ${esc(o.dark || 'none')}"></span></span>` : ''}</a>`).join('')}</div>
</section>`;

  const sidebar = `<aside class="x-side">
  ${steps.length ? `<section><h2 class="x-h">Steps${S.pr ? ` of #${S.pr}` : ''}</h2><ol class="x-steps">${steps.map((t, i) => `<li data-n="${i + 1}" class="${stepCls(i)}">${esc(t)}${i + 1 === Q.step && Q.point ? ` · point ${esc(Q.point)}` : ''}</li>`).join('')}</ol></section>` : ''}
  <section><h2 class="x-h">On this sheet</h2><nav id="nav" class="x-nav"></nav></section>
</aside>`;

  const table = `<section class="x-summary"><h2 class="x-h">Options and reasons</h2>
  <table class="x-sum"><thead><tr><th>Option</th>${columns.map((c) => `<th>${c.label}</th>`).join('')}</tr></thead>
  <tbody class="${decided ? 'decided' : ''}">${options.map((o) => `<tr class="${mark(o).trim()}"><td><b>${esc(o.name)}</b>${tags(o) ? `<span class="x-tags">${tags(o)}</span>` : ''}</td>${columns.map((c) => `<td>${c.cell(o)}</td>`).join('')}</tr>`).join('')}</tbody></table>
</section>`;

  const drawer = `<aside id="drawer" class="x-drawer" hidden aria-label="Compare">
  <div class="x-dh"><b>Compare</b>${T.button({ label: 'Close', size: 'small', emphasis: 'subtle', attrs: { id: 'cmpclose' } })}</div>
  ${sel('view', 'View', [['overview', 'Overview (the screenshot)'], ['options', 'Options side by side'], ['modes', 'Light next to dark'], ['wipe', 'Wipe one over the other']], 'overview')}
  ${group('Modes', modes.map((m) => chk('mode', m, cap(m))).join(''))}
  ${group('Options', options.map((o) => chk('opt', o.id, esc(o.name))).join(''))}
  ${group('Surfaces', levels.map((l) => chk('lvl', String(l), `Level ${l}`)).join(''))}
  ${variants.length > 1 ? group('Variants', variants.map((v) => chk('var', v.id, esc(v.label))).join('')) : ''}
  ${measure ? T.switch({ id: 'measure', size: 'small', label: 'Measurements', checked: true }) : ''}
  ${sel('zoom', 'Zoom', [['1', '100 %'], ['1.5', '150 %'], ['2', '200 %'], ['3', '300 %']], '1')}
  ${T.button({ label: 'Reset to the screenshot view', size: 'small', emphasis: 'subtle', attrs: { id: 'cmpreset' } })}
  ${T.button({ label: 'Copy link to this view', size: 'small', emphasis: 'subtle', iconStart: 'link', attrs: { id: 'copy' } })}
</aside>`;

  const client = `
const CELLS=${JSON.stringify(CELLS)};
const OPTS=${JSON.stringify(options.map(({ id, short, name, title, token, recommended, darkNote }) => ({ id, short: short || id, name, title, token, recommended, darkNote })))};
const VARS=${JSON.stringify(variants)};
const LEVELS=${JSON.stringify(levels.map(String))},MODES=${JSON.stringify(modes)};
const REC=${JSON.stringify(rec)},CHOSEN=${JSON.stringify(chosen)},PICK=${JSON.stringify(Q.chosen || null)};
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const checked=(g)=>$$('input[name="'+g+'"]').filter(i=>i.checked).map(i=>i.value);
const cap=(s)=>s[0].toUpperCase()+s.slice(1);
const lum=(c)=>{const m=c.match(/[\\d.]+/g).map(Number);const s=/^color\\(/.test(c)?m.slice(0,3):m.slice(0,3).map(v=>v/255);const f=(v)=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4;return .2126*f(s[0])+.7152*f(s[1])+.0722*f(s[2]);};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
const MEASURE=${measure || 'null'};
let uid=0;
const stack=(o,st)=>st.vars.map(v=>'<div class="x-f"><span class="x-ft">'+v.label+'</span>'+CELLS[o.id+'|'+v.id].replaceAll('IDX','x'+(++uid))+'<span class="x-m"></span></div>').join('');
const cell=(o,mode,lvl,st,caption)=>{
  if(mode==='dark'&&o.darkNote)return '<div class="x-cell x-none" data-theme="dark">'+o.darkNote+'</div>';
  return '<div class="x-cell" data-theme="'+mode+'" style="background:var(--global-bg-level-'+lvl+'-default)"><span class="x-cap">'+(caption||('surface level '+lvl))+'</span><div class="x-zoom">'+stack(o,st)+'</div></div>';};
const sub=(o,extra,id)=>'<div class="x-sub'+(o.recommended?' rec':'')+(o.id===PICK?' sel':'')+(PICK?' decided':'')+'"'+(id?' id="'+id+'"':'')+'><span class="x-letter">'+o.short+'</span><p class="x-st">'+o.name+': '+o.title+'</p>'+(o.recommended?REC:'')+(o.id===PICK?CHOSEN:'')+'<span class="x-tok">'+(o.token?'<code>'+o.token+'</code>':'')+(extra?' · '+extra:'')+'</span></div>';
const cols=(n)=>'style="grid-template-columns:repeat('+n+',minmax(0,1fr))"';
const views={
  overview(st,nav){return st.mode.map(m=>{nav.push('<b>'+cap(m)+'</b>');return '<section class="x-mode"><h2 class="x-mtitle">'+cap(m)+'</h2>'+st.opt.map(o=>{nav.push('<a href="#'+m+'-'+o.id+'">'+o.name+'</a>');return sub(o,cap(m),m+'-'+o.id)+'<div class="x-grid" '+cols(st.lvl.length)+'>'+st.lvl.map(l=>cell(o,m,l,st)).join('')+'</div>';}).join('')+'</section>';}).join('');},
  options(st,nav){return st.mode.map(m=>{nav.push('<b>'+cap(m)+'</b>');return '<section class="x-mode"><h2 class="x-mtitle">'+cap(m)+': options side by side</h2>'+st.lvl.map(l=>{nav.push('<a href="#'+m+'-l'+l+'">Surface level '+l+'</a>');return '<div class="x-sub" id="'+m+'-l'+l+'"><span class="x-letter">L'+l+'</span><p class="x-st">Surface level '+l+'</p><span class="x-tok">'+st.opt.map(o=>o.name).join(' · ')+'</span></div><div class="x-grid" '+cols(st.opt.length)+'>'+st.opt.map(o=>cell(o,m,l,st,o.name)).join('')+'</div>';}).join('')+'</section>';}).join('');},
  modes(st,nav){return '<section class="x-mode"><h2 class="x-mtitle">Light next to dark</h2>'+st.opt.map(o=>{nav.push('<a href="#lvd-'+o.id+'">'+o.name+'</a>');return sub(o,st.mode.map(cap).join(' and '),'lvd-'+o.id)+st.lvl.map(l=>'<div class="x-grid" '+cols(st.mode.length)+'>'+st.mode.map(m=>cell(o,m,l,st,cap(m)+' · surface level '+l)).join('')+'</div>').join('');}).join('')+'</section>';},
  wipe(st,nav){nav.push('<a href="#wipe">Wipe</a>');const W=st.wipe;
    const s=(id,label,opts,v)=>'<div class="ds-select" data-size="small"><label class="ds-select__label" for="'+id+'">'+label+'</label><div class="ds-select__field"><select class="ds-select__control" id="'+id+'">'+opts.map(([k,t])=>'<option value="'+k+'"'+(k===v?' selected':'')+'>'+t+'</option>').join('')+'</select></div></div>';
    const os=OPTS.map(o=>[o.id,o.name]);const L=OPTS.find(o=>o.id===W.l)||OPTS[0],R=OPTS.find(o=>o.id===W.r)||OPTS[1]||OPTS[0];
    const lay=(o)=>'<div class="x-cell layer" data-theme="'+W.m+'" style="background:var(--global-bg-level-'+W.v+'-default)"><div class="x-zoom x-wipe-grid">'+stack(o,st)+'</div></div>';
    return '<section class="x-mode" id="wipe"><h2 class="x-mtitle">Wipe: drag the line to reveal one option over the other</h2><div class="x-wipectl">'+s('wl','Left',os,L.id)+s('wr','Right',os,R.id)+s('wm','Mode',MODES.map(m=>[m,cap(m)]),W.m)+s('wv','Surface',LEVELS.map(l=>[l,'Level '+l]),W.v)
      +'<div class="ds-slider" data-size="small"><label class="ds-slider__label" for="cut">Position</label><input class="ds-slider__control" type="range" id="cut" min="0" max="100" value="'+W.c+'"></div></div>'
      +'<div class="x-wipe" style="--x-cut:'+W.c+'%">'+lay(L)+'<div class="top">'+lay(R)+'</div><span class="line"></span><span class="lab" style="left:4px">'+L.name+'</span><span class="lab" style="right:4px">'+R.name+'</span></div></section>';}
};
const measureOn=()=>!$('#measure')||$('#measure').checked;
const state=()=>({view:$('#view').value,mode:checked('mode'),opt:OPTS.filter(o=>checked('opt').includes(o.id)),lvl:checked('lvl'),vars:VARS.filter(v=>!$('input[name="var"]')||checked('var').includes(v.id)),zoom:$('#zoom').value,
  wipe:{l:$('#wl')?.value||OPTS[0].id,r:$('#wr')?.value||(OPTS[1]||OPTS[0]).id,m:$('#wm')?.value||MODES[0],v:$('#wv')?.value||LEVELS[0],c:$('#cut')?.value||'50'}});
const bar=()=>document.documentElement.style.setProperty('--x-bar',$('.x-bar').offsetHeight+'px');
const render=()=>{bar();const st=state(),nav=[];uid=0;
  $('#stage').innerHTML=views[st.view](st,nav);$('#nav').innerHTML=nav.join('');
  document.body.style.setProperty('--x-zoom',st.zoom);document.body.classList.toggle('measure',Boolean(MEASURE)&&measureOn());
  const def=st.view==='overview'&&st.mode.length===MODES.length&&st.opt.length===OPTS.length&&st.lvl.length===LEVELS.length&&st.vars.length===VARS.length&&st.zoom==='1'&&measureOn();
  const q=new URLSearchParams({view:st.view,mode:st.mode,opt:st.opt.map(o=>o.id),lvl:st.lvl,var:st.vars.map(v=>v.id),zoom:st.zoom,measure:+measureOn()});
  if(st.view==='wipe')Object.entries(st.wipe).forEach(([k,v])=>q.set('w'+k,v));
  const cs=$('#cmpstate');cs.hidden=def;cs.textContent='Comparing: '+$('#view').selectedOptions[0].text+(st.zoom!=='1'?' · '+st.zoom*100+' %':'');
  history.replaceState(null,'',(def?location.pathname:'?'+q)+location.hash);
  if(MEASURE&&measureOn())requestAnimationFrame(()=>$$('.x-f').forEach(f=>{const c=f.closest('.x-cell');try{$('.x-m',f).innerHTML=MEASURE(f,c,+st.zoom)||'';}catch(e){$('.x-m',f).textContent=e.message;}}));};
const q=new URLSearchParams(location.search);
if(q.has('view'))$('#view').value=q.get('view');if(q.has('zoom'))$('#zoom').value=q.get('zoom');
['mode','opt','lvl','var'].forEach(g=>{if(q.has(g)){const v=q.get(g).split(',');$$('input[name="'+g+'"]').forEach(i=>i.checked=v.includes(i.value));}});
if(q.has('measure')&&$('#measure'))$('#measure').checked=q.get('measure')==='1';
document.addEventListener('change',e=>{if(e.target.closest('.x-drawer,.x-wipectl'))render();});
document.addEventListener('input',e=>{if(e.target.id==='cut'){$('.x-wipe').style.setProperty('--x-cut',e.target.value+'%');}});
const open=(v)=>{$('#drawer').hidden=!v;$('#cmpbtn').setAttribute('aria-expanded',String(v));};
$('#cmpbtn').addEventListener('click',()=>open($('#drawer').hidden));$('#cmpclose').addEventListener('click',()=>open(false));
document.addEventListener('keydown',e=>{if(e.target.closest('input,select,textarea'))return;if(e.key==='c')open($('#drawer').hidden);if(e.key==='Escape')open(false);});
$('#cmpreset').addEventListener('click',()=>{location.href=location.pathname;});
$('#copy').addEventListener('click',()=>navigator.clipboard?.writeText(location.href));
addEventListener('resize',bar);
render();
if(q.has('wl')){['wl','wr','wm','wv'].forEach(k=>{const el=$('#'+k);if(el&&q.has(k))el.value=q.get(k);});const c=$('#cut');if(c&&q.has('wc'))c.value=q.get('wc');render();}
`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${S.pr ? `#${S.pr} ` : ''}step ${esc(stepLabel)}: ${esc(Q.question)}</title>
<link rel="stylesheet" href="${fsUrl('packages/tokens/dist/css/index.css')}"><link rel="stylesheet" href="${fsUrl('packages/components/src/index.css')}">
<style>${SHELL_CSS}${css}</style></head><body data-theme="light">
${toolbar}
${hero}
<div class="x-page">${sidebar}<main class="x-main">${table}<div id="stage"></div></main></div>
${drawer}
<script>${client}</script></body></html>`;
}

const SHELL_CSS = `
*{box-sizing:border-box}
html{scroll-padding-top:calc(var(--x-bar,48px) + 56px)}
body{margin:0;font-family:var(--body-family),system-ui,sans-serif;font-size:var(--body-size-sm);background:var(--global-bg-level-0-default);color:var(--global-text-on-base-neutral-primary)}
code{font-family:var(--mono-family),ui-monospace,monospace;font-size:.92em}
a{color:var(--global-text-on-base-brand-default)}
[class*="__control"]{transition:none!important}
/* toolbar */
.x-bar{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:var(--space-12);padding:var(--space-8) var(--space-16);white-space:nowrap;background:var(--global-bg-level-1-default);border-bottom:1px solid var(--global-border-level-on-level-1);box-shadow:var(--effect-shadow-1)}
.x-logo{width:28px;height:28px;border-radius:var(--corner-radius-sm)}
.x-name{font-weight:var(--heading-weight-semi-bold)}
.x-ids{display:inline-flex;gap:var(--space-8);align-items:center}
.x-sep{width:1px;height:20px;background:var(--global-border-level-on-level-1)}
.x-q{font-weight:var(--body-weight-medium);overflow:hidden;text-overflow:ellipsis;min-width:0}
.x-dots{display:flex;gap:3px}.x-dots i{width:8px;height:8px;border-radius:50%;box-shadow:inset 0 0 0 1.5px var(--global-border-accent-neutral-default);opacity:.45}.x-dots .d,.x-dots .c{box-shadow:none;opacity:1}.x-dots .d{background:var(--global-bg-accent-functional-success-default)}.x-dots .c{background:var(--global-bg-accent-brand-default);outline:2px solid var(--global-border-accent-brand-default);outline-offset:1px}
.x-people{display:flex}.x-people>span{margin-inline-start:-4px;border-radius:50%;box-shadow:0 0 0 2px var(--global-bg-level-1-default);display:inline-flex}.x-people>span:first-child{margin:0}
.x-bar .x-people{margin-inline-start:auto}
.x-cmpstate{font-size:var(--body-size-xs);padding:2px 8px;border-radius:var(--corner-radius-full);background:var(--global-bg-subtle-brand-default);color:var(--global-text-on-subtle-brand-default)}
#cmpbtn[aria-expanded=true]{outline:2px solid var(--global-border-accent-brand-default)}
/* compare panel, hidden until asked */
.x-drawer{position:fixed;z-index:20;top:calc(var(--x-bar,48px) + 8px);right:8px;width:300px;max-height:calc(100vh - var(--x-bar,48px) - 16px);overflow:auto;padding:var(--space-16);display:grid;gap:var(--space-16);background:var(--global-bg-level-2-default);border:1px solid var(--global-border-level-on-level-2);border-radius:var(--corner-radius-md);box-shadow:var(--effect-shadow-3)}
.x-drawer[hidden]{display:none}
.x-dh{display:flex;justify-content:space-between;align-items:center;font-size:var(--body-size-md)}
.x-grp{border:0;margin:0;padding:0}.x-gl{padding:0;margin-bottom:var(--space-4);font-size:var(--body-size-2xs);color:var(--global-text-on-base-neutral-secondary);text-transform:uppercase;letter-spacing:.06em}
.x-gi{display:flex;flex-wrap:wrap;gap:var(--space-4) var(--space-12)}
/* hero */
.x-hero{text-align:center;padding:var(--space-40) var(--space-24) var(--space-32);background:var(--global-bg-level-1-default);border-bottom:1px solid var(--global-border-level-on-level-1);display:grid;justify-items:center;gap:var(--space-12)}
.x-hero h1{margin:0;font-size:var(--heading-size-md);line-height:1.1}
.x-who{display:inline-flex;gap:var(--space-8);align-items:center;font-size:var(--body-size-xs)}.x-who small{color:var(--global-text-on-base-neutral-secondary)}
.x-progress{width:420px;max-width:100%}
/* one row of tiles, about 280 px each, up to the hero's full width (more than four options get the room they need) */
.x-tiles{display:grid;grid-template-columns:repeat(var(--x-n),minmax(0,1fr));grid-template-rows:auto auto auto auto;column-gap:var(--space-12);row-gap:0;width:100%;max-width:max(1100px,calc(var(--x-n) * 280px));margin-top:var(--space-12);text-align:start}
.x-tile{display:grid;grid-row:span 4;grid-template-rows:subgrid;row-gap:var(--space-8);padding:var(--space-16);border:2px solid var(--global-border-level-on-level-1);border-radius:var(--corner-radius-md);text-decoration:none;color:inherit;background:var(--global-bg-level-0-default)}
.x-tiles:not(.decided) .x-tile.rec{border-color:var(--global-border-base-brand-default)}
.x-tile.sel{border-color:var(--global-border-base-functional-success-default)}
.x-tags{display:flex;flex-wrap:wrap;gap:var(--space-4);align-items:center}
/* every tile has the same four rows (tags, name, title, colors), shared across tiles through subgrid, so the
   same content lines up from tile to tile whether a tile has tags or not */
.x-tile .x-tags{min-height:var(--badge-container-min-height-small)}
.x-tile .x-chips{align-self:end}
.x-tags .ds-icon,.x-sub .ds-icon{display:inline-flex}
.x-tl{font-size:var(--body-size-lg)}
.x-chips{display:grid;grid-template-columns:1fr 1fr;height:24px;border-radius:var(--corner-radius-xs);overflow:hidden;border:1px solid var(--global-border-level-on-level-0)}
.x-chips .none{background:repeating-linear-gradient(45deg,transparent 0 4px,var(--global-border-level-on-level-0) 4px 5px)!important}
/* sidebar + main */
.x-page{display:grid;grid-template-columns:240px minmax(0,1fr)}
.x-side{position:sticky;top:var(--x-bar,48px);align-self:start;padding:var(--space-20);display:grid;gap:var(--space-24);max-height:calc(100vh - var(--x-bar,48px));overflow:auto}
.x-h{font-size:var(--body-size-2xs);text-transform:uppercase;letter-spacing:.08em;color:var(--global-text-on-base-neutral-secondary);margin:0 0 var(--space-8);font-weight:var(--body-weight-medium)}
.x-steps{list-style:none;margin:0;padding:0;font-size:var(--body-size-xs);display:grid;gap:1px}
.x-steps li{padding:2px var(--space-8);border-radius:var(--corner-radius-xs);display:flex;gap:var(--space-8)}.x-steps li::before{content:attr(data-n);width:16px;color:var(--global-text-on-base-neutral-tertiary)}
.x-steps .d{color:var(--global-text-on-base-neutral-secondary)}.x-steps .d::after{content:'✓';margin-inline-start:auto;color:var(--global-text-on-base-functional-success-default)}
.x-steps .c{background:var(--global-bg-subtle-brand-default);color:var(--global-text-on-subtle-brand-default);font-weight:600}
.x-nav{display:grid;gap:2px;font-size:var(--body-size-xs)}.x-nav b{margin-top:var(--space-4);font-size:var(--body-size-2xs);color:var(--global-text-on-base-neutral-secondary)}
.x-main{min-width:0;padding:var(--space-24) var(--space-24) var(--space-48)}
.x-sum{border-collapse:collapse;width:100%;font-size:var(--body-size-xs)}
.x-sum th,.x-sum td{text-align:left;padding:var(--space-6) var(--space-8);border-bottom:1px solid var(--global-border-level-on-level-0);vertical-align:top}
.x-sum th{color:var(--global-text-on-base-neutral-secondary);font-weight:var(--body-weight-medium)}
.x-sum tbody:not(.decided) tr.rec td{background:var(--global-bg-subtle-brand-default)}
.x-sum tr.sel td{background:var(--global-bg-subtle-functional-success-default)}
.x-sum td .x-tags{display:inline-flex;vertical-align:middle;margin-inline-start:var(--space-8)}
.x-sw{display:inline-block;width:12px;height:12px;border-radius:2px;vertical-align:-2px;margin-inline-end:6px;border:1px solid var(--global-border-level-on-level-0)}
/* renderings */
.x-mode{margin-top:var(--space-24)}
.x-mtitle{font-size:var(--heading-size-xs);margin:0 0 var(--space-12)}
.x-sub{position:sticky;top:var(--x-bar,48px);z-index:3;display:flex;align-items:center;gap:var(--space-12);padding:var(--space-8) var(--space-12);margin:var(--space-16) 0 var(--space-8);background:var(--global-bg-level-1-default);border:1px solid var(--global-border-level-on-level-1);border-inline-start:4px solid var(--global-border-accent-neutral-default);border-radius:var(--corner-radius-xs)}
.x-sub.rec:not(.decided){border-inline-start-color:var(--global-border-base-brand-default)}
.x-sub.sel{border-inline-start-color:var(--global-border-base-functional-success-default)}
.x-letter{font:700 var(--body-size-sm) var(--mono-family),monospace;padding:2px 8px;background:var(--global-bg-accent-neutral-default);color:var(--global-text-on-accent-neutral-primary);border-radius:var(--corner-radius-xs)}
.x-st{margin:0;font-weight:var(--heading-weight-semi-bold)}.x-tok{font-size:var(--body-size-xs);color:var(--global-text-on-base-neutral-secondary);margin-inline-start:auto}
.x-grid{display:grid;border:1px solid var(--global-border-level-on-level-0)}
.x-cell{padding:var(--space-12);display:grid;gap:var(--space-12);align-content:start;background:var(--global-bg-level-0-default);color:var(--global-text-on-base-neutral-primary)}
.x-cap{font-size:var(--body-size-2xs);color:var(--global-text-on-base-neutral-secondary)}
.x-zoom{zoom:var(--x-zoom,1);display:grid;gap:var(--space-20);align-content:start}
.x-f{display:grid;gap:2px}.x-ft{font:var(--body-size-2xs) var(--mono-family),monospace;color:var(--global-text-on-base-neutral-secondary)}
.x-m{font:var(--body-size-2xs)/1.3 var(--mono-family),monospace;color:var(--global-text-on-base-neutral-secondary)}.x-m .bad{color:var(--global-text-on-base-functional-error-default);font-weight:700}
body:not(.measure) .x-m{display:none}
.x-none{font-style:italic;color:var(--global-text-on-base-neutral-secondary)}
/* wipe */
.x-wipectl{display:flex;flex-wrap:wrap;gap:var(--space-16);align-items:end;margin:var(--space-16) 0}
.x-wipe{position:relative;border:1px solid var(--global-border-level-on-level-0)}
.x-wipe .layer{padding:var(--space-24)}.x-wipe .top{position:absolute;inset:0;clip-path:inset(0 0 0 var(--x-cut,50%))}
.x-wipe .line{position:absolute;top:0;bottom:0;left:var(--x-cut,50%);width:2px;background:var(--global-border-accent-brand-default);pointer-events:none}
.x-wipe .lab{position:absolute;top:4px;font-size:var(--body-size-2xs);padding:2px 6px;background:var(--global-bg-accent-neutral-default);color:var(--global-text-on-accent-neutral-primary);border-radius:var(--corner-radius-xs)}
.x-wipe-grid{display:flex!important;flex-wrap:wrap;gap:var(--space-24)}.x-wipe-grid>.x-f{width:300px}
`;
