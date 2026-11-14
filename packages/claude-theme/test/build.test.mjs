import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadQuantum } from '../../../scripts/lib/theme-mapping.mjs';
import { COLORS, DOTS, resolveColors, resolveDots, build } from '../build.mjs';

const quantum = loadQuantum();
const value = (mode, p) => quantum[mode].get(p).value.slice(0, 7).toLowerCase();

test('the app colors read semantic tokens and the desktop app paints them', () => {
  const paths = [
    ...Object.values(COLORS.anchors).flatMap(Object.values),
    ...Object.values(COLORS.roles).flatMap(({ seed, fill, hover }) => [seed, fill, hover]),
  ];
  for (const p of paths) assert.equal(quantum[quantum.modes[0]].get(p)?.tier, 'semantic', p);
  const { theme, problems } = resolveColors(quantum);
  assert.equal(theme.v, 1);
  assert.deepEqual(Object.keys(theme.inputs).sort(), ['dark', 'light']);
  assert.equal(problems.filter((l) => l.startsWith("Desktop won't paint")).length, 0);
});

test("filled controls paint Quantum's own fill and hover tokens", () => {
  const { theme } = resolveColors(quantum);
  for (const mode of ['light', 'dark']) {
    for (const [role, { fill, hover, modes }] of Object.entries(COLORS.roles)) {
      if (modes && !modes.includes(mode)) continue;
      assert.equal(theme.inputs[mode][`role-${role}-fill`], value(mode, fill), `${mode} ${role} fill`);
      assert.equal(theme.inputs[mode][`role-${role}-fill-hover`], value(mode, hover), `${mode} ${role} hover`);
    }
  }
});

test('the dots cover the window on the page color, one scene per mode', () => {
  const dots = resolveDots(quantum);
  const step = /^([\d.]+)px$/.exec(quantum.light.get(DOTS.step).value)[1];
  for (const mode of ['light', 'dark']) {
    const { scene, page } = dots[mode];
    assert.equal(page.toLowerCase(), value(mode, DOTS.page[mode]), `${mode} page`);
    assert.match(scene, new RegExp(`<pattern id="dots" width="${step}" height="${step}"`));
    assert.ok(scene.includes(page), `${mode} scene on the page color`);
    assert.ok(scene.includes(value(mode, DOTS.color[mode]).toUpperCase()), `${mode} dots`);
    assert.doesNotMatch(scene, /calc\(|@media|<image|href=|@import|@font-face/);
  }
});

test('build writes a loadable mod', () => {
  const out = build(fs.mkdtempSync(path.join(os.tmpdir(), 'claude-quantum-')));
  const manifest = JSON.parse(fs.readFileSync(path.join(out, '.claude-plugin', 'plugin.json'), 'utf8'));
  assert.equal(manifest.name, 'claude-quantum');
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(out, 'hooks', 'hooks.json'), 'utf8')), { modules: ['./register.tsx'] });
  assert.ok(fs.existsSync(path.join(out, 'hooks', 'register.tsx')));
  const look = fs.readFileSync(path.join(out, 'hooks', 'look.ts'), 'utf8');
  assert.match(look, /export const COLORS/);
  assert.match(look, /export const DOTS/);
  fs.rmSync(out, { recursive: true, force: true });
});
