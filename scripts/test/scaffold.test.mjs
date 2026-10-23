import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scaffoldComponent } from '../lib/scaffold.mjs';
import { loadA11y } from '../lib/a11y.mjs';
import { loadAll, indexTiers, tierFromTrees } from '../lib/dtcg.mjs';
import { PATHS, artifacts } from '../lib/paths.mjs';
import { figmaComponent } from '../../packages/figma/src/plan.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const a11y = loadA11y(ROOT);
const repo = loadAll(path.join(ROOT, PATHS.tokens));

/** The repository's tokens plus the scaffolded component's, without writing them anywhere. */
const withTokens = (tree) => ({ ...indexTiers(repo.config, [...repo.tiers, tierFromTrees('component', [tree])]), platforms: repo.platforms, modes: repo.modes });

/** A scaffolded component: its spec, its loaded tokens and its blueprint module. */
async function scaffold(role) {
  const id = 'scaffold-probe';
  const { files } = scaffoldComponent({ id, name: 'Scaffold Probe', role, summary: 'A probe.', today: '2026-01-01', a11y });
  const paths = artifacts(id);
  const blueprint = (await import(`data:text/javascript,${encodeURIComponent(files[paths.figma])}`)).default;
  return { files, paths, spec: JSON.parse(files[paths.spec]), loaded: withTokens(JSON.parse(files[paths.tokens])), blueprint };
}

test('the scaffold writes the four artifacts and a Figma blueprint, none of them existing', async () => {
  const { files, paths } = await scaffold('button');
  assert.deepEqual(Object.keys(files).sort(), [paths.spec, paths.tokens, paths.docs, paths.css, paths.template, paths.figma].sort());
  for (const rel of Object.keys(files)) assert.ok(!fs.existsSync(path.join(ROOT, rel)), rel);
});

for (const role of ['button', 'presentation']) {
  test(`a scaffolded ${role} component's blueprint covers every token slot`, async () => {
    const { spec, loaded, blueprint, files, paths } = await scaffold(role);
    const plan = figmaComponent(loaded, spec, blueprint);
    assert.deepEqual(plan.uncovered, []);
    assert.match(files[paths.figma], /TODO: rewrite this tree from the real CSS/);
    const focus = plan.variants.find((v) => v.name.endsWith('State=focus-visible'));
    if (role === 'button') assert.deepEqual(Object.keys(focus.root.focusRing), ['strokeWeight', 'offset', 'stroke']);
    else assert.equal(focus, undefined);
    const subtle = plan.variants.find((v) => v.name === 'Variant=subtle, State=default');
    assert.equal(subtle.root.fills, 'scaffold-probe/container/background/subtle/default');
    assert.equal(subtle.root.children[0].fills, 'scaffold-probe/label/color/subtle/default');
    assert.deepEqual(plan.properties.find((p) => p.kind === 'TEXT'), { name: 'Label', kind: 'TEXT', default: 'Scaffold Probe' });
  });
}
