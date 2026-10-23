/**
 * The plugin window (dist/ui.html, the manifest's `ui`): a page built with the design system,
 * showing the progress of a run. Rendered at build time from the plan with the components'
 * own templates (progress bar, badge, button) and styled by the generated token CSS and the
 * components' CSS; ui.js then updates it from the plugin's messages. Its own layout (ui.css)
 * reads semantic tokens only.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { render as progressBar } from '../../../components/src/components/progress-bar/progress-bar.template.mjs';
import { render as badge } from '../../../components/src/components/badge/badge.template.mjs';
import { render as button } from '../../../components/src/components/button/button.template.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));

/** The design system's components the window renders. */
export const UI_COMPONENTS = ['progress-bar', 'badge', 'button'];

const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const status = () => badge({ label: 'Waiting', intent: 'neutral', emphasis: 'subtle', size: 'small' });

const row = (key, name, detail) => `<li class="qf-row" data-key="${escape(key)}" data-status="waiting"><span class="qf-name">${escape(name)}</span><span class="qf-detail">${escape(detail)}</span>${status()}</li>`;

/**
 * The window's HTML for a plugin plan. `css` is the stylesheet text to inline: the webfonts, the
 * token CSS (raw, semantic, the window's components) and the components' CSS, in that order.
 */
export function renderUi(plan, { fonts, css }) {
  const variants = plan.components.reduce((n, c) => n + c.variants.length, 0);
  const vars = plan.variables;
  const summary = `${plan.components.length} component${plan.components.length > 1 ? 's' : ''}, ${variants} variants, ${vars.variables.length} variables`;
  const rows = [
    row('variables', 'Variables', `${vars.variables.length} in ${vars.collections.length} collections`),
    ...plan.components.map((c) => row(c.id, c.name, `${c.variants.length} variants`)),
  ];
  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${fonts}</style>
<style>${css}
${fs.readFileSync(path.join(here, 'ui.css'), 'utf8')}</style>
</head>
<body>
<main class="qf">
<header class="qf-header">
<h1 class="qf-title">Quantum components</h1>
<p class="qf-summary" id="qf-summary">${escape(summary)}</p>
</header>
<div class="qf-progress">${progressBar({ label: 'Starting…', value: 0, max: variants || 1, showValue: true, id: 'qf-progress' })}</div>
<ol class="qf-list" aria-label="Steps">${rows.join('')}</ol>
<section class="qf-warnings" id="qf-warnings" hidden><h2>Warnings</h2><ul></ul></section>
<footer class="qf-footer">${button({ label: 'Close', emphasis: 'accent', intent: 'neutral', size: 'small', disabled: true, attrs: { id: 'qf-close' } })}</footer>
</main>
<script>${fs.readFileSync(path.join(here, 'ui.js'), 'utf8')}</script>
</body>
</html>
`;
}
