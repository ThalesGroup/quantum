import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatScalar, tierFromTrees, indexTiers, checkReferences, cssDeclarations, resolveValue, renderCss, platformFromTrees, applyPlatform, checkPlatforms, renderResolvedTree, EXT, modeFromTrees, applyMode, checkModes, resolveContext, planOutputs } from '../lib/dtcg.mjs';

const config = {
  tiers: [
    { name: 'raw', mayReference: [] },
    { name: 'semantic', mayReference: ['raw'] },
    { name: 'component', mayReference: ['semantic'] },
  ],
};

const raw = {
  color: { $type: 'color', blue: { 600: { $value: '#2563eb' } }, p3: { $value: { colorSpace: 'display-p3', components: [0, 0.5, 1], alpha: 0.5 } } },
  space: { $type: 'dimension', 4: { $value: { value: 16, unit: 'px' } } },
  font: {
    family: { $type: 'fontFamily', sans: { $value: ['Inter', 'system-ui', 'sans-serif'] } },
    weight: { $type: 'fontWeight', medium: { $value: 'medium' } },
    size: { $type: 'dimension', 300: { $value: '16px' } },
    lh: { $type: 'number', tight: { $value: 1.2 } },
  },
  easing: { $type: 'cubicBezier', standard: { $value: [0.2, 0, 0, 1] } },
};
const semantic = {
  color: { action: { primary: { $type: 'color', bg: { $value: '{color.blue.600}' } } } },
  text: { $type: 'typography', control: { $value: { fontFamily: '{font.family.sans}', fontSize: '{font.size.300}', fontWeight: '{font.weight.medium}', lineHeight: '{font.lh.tight}' } } },
};
const component = {
  button: { container: { background: { $type: 'color', $value: '{color.action.primary.bg}' } }, label: { typography: { $type: 'typography', $value: '{text.control}' } } },
};

const load = (c = component) => indexTiers(config, [tierFromTrees('raw', [raw]), tierFromTrees('semantic', [semantic]), tierFromTrees('component', [c])]);

test('formatScalar handles legacy strings and 2024+ object values', () => {
  assert.equal(formatScalar('color', '#fff'), '#fff');
  assert.equal(formatScalar('color', { hex: '#123456', colorSpace: 'srgb', components: [0, 0, 0] }), '#123456');
  assert.equal(formatScalar('color', { colorSpace: 'srgb', components: [1, 0, 0], alpha: 0.5 }), 'color(srgb 1 0 0 / 0.5)');
  assert.equal(formatScalar('color', { hex: '#B6B4B4', colorSpace: 'srgb', components: [0.71, 0.71, 0.71], alpha: 0.1 }), '#B6B4B41a', 'hex keeps the alpha channel (Figma exports both)');
  assert.equal(formatScalar('color', { colorSpace: 'oklch', components: [0.7, 0.1, 250] }), 'oklch(0.7 0.1 250)');
  assert.equal(formatScalar('dimension', { value: 16, unit: 'px' }), '16px');
  assert.equal(formatScalar('dimension', '1.5rem'), '1.5rem');
  assert.equal(formatScalar('duration', { value: 150, unit: 'ms' }), '150ms');
  assert.equal(formatScalar('fontFamily', ['Inter', 'system-ui', 'sans-serif']), 'Inter, system-ui, sans-serif');
  assert.equal(formatScalar('fontFamily', ['JetBrains Mono', 'monospace']), '"JetBrains Mono", monospace');
  assert.equal(formatScalar('fontWeight', 'semi-bold'), '600');
  assert.equal(formatScalar('cubicBezier', [0.2, 0, 0, 1]), 'cubic-bezier(0.2, 0, 0, 1)');
  assert.equal(formatScalar('shadow', { offsetX: '0px', offsetY: '2px', blur: '4px', spread: '0px', color: '#0003' }), '0px 2px 4px 0px #0003');
});

test('type inheritance from groups and through aliases', () => {
  const { byPath } = load();
  assert.equal(byPath.get('color.blue.600').type, 'color');
  assert.equal(byPath.get('color.action.primary.bg').type, 'color');
  assert.equal(byPath.get('space.4').type, 'dimension');
});

test('aliases resolve transitively; circular references throw', () => {
  const { byPath } = load();
  assert.equal(resolveValue('{button.container.background}', byPath), '#2563eb');
  const bad = indexTiers(config, [tierFromTrees('raw', [{ a: { $type: 'color', $value: '{b}' }, b: { $type: 'color', $value: '{a}' } }]), tierFromTrees('semantic', []), tierFromTrees('component', [])]);
  assert.throws(() => resolveValue('{a}', bad.byPath), /Circular alias/);
});

test('checkReferences reports unknown targets and tier violations', () => {
  const badComponent = { button: { x: { $type: 'color', $value: '{color.blue.600}' }, y: { $type: 'color', $value: '{nope.missing}' } } };
  const problems = checkReferences(load(badComponent));
  assert.equal(problems.length, 2);
  assert.match(problems.find((p) => p.token === 'button.x').message, /may not reference raw/);
  assert.match(problems.find((p) => p.token === 'button.y').message, /unknown token/);
  assert.deepEqual(checkReferences(load()), []);
});

test('cssDeclarations preserves aliases as var() and expands typography composites', () => {
  const { byPath } = load();
  assert.deepEqual(cssDeclarations(byPath.get('button.container.background'), byPath), [
    ['--button-container-background', 'var(--color-action-primary-bg)'],
  ]);
  assert.deepEqual(cssDeclarations(byPath.get('text.control'), byPath), [
    ['--text-control-font-family', 'var(--font-family-sans)'],
    ['--text-control-font-size', 'var(--font-size-300)'],
    ['--text-control-font-weight', 'var(--font-weight-medium)'],
    ['--text-control-line-height', 'var(--font-lh-tight)'],
  ]);
  const expanded = cssDeclarations(byPath.get('button.label.typography'), byPath);
  assert.equal(expanded.length, 5);
  assert.deepEqual(expanded[0], ['--button-label-typography-font-family', 'var(--text-control-font-family)']);
  // Resolved mode flattens everything to literal values.
  assert.deepEqual(cssDeclarations(byPath.get('button.container.background'), byPath, { preserveAliases: false }), [
    ['--button-container-background', '#2563eb'],
  ]);
  assert.deepEqual(cssDeclarations(byPath.get('color.p3'), byPath), [['--color-p3', 'color(display-p3 0 0.5 1 / 0.5)']]);
});

test('renderCss produces a :root block', () => {
  const { tiers, byPath } = load();
  const css = renderCss(tiers[0].tokens, byPath, { header: 'test' });
  assert.match(css, /^\/\* test \*\/\n:root \{\n  --color-blue-600: #2563eb;\n/);
  assert.match(css, /--easing-standard: cubic-bezier\(0.2, 0, 0, 1\);/);
});

test('platform overlays override raw and semantic tokens only, and resolve per platform', () => {
  const cfg = { tiers: [{ name: 'raw', mayReference: [], overridable: true }, { name: 'semantic', mayReference: ['raw'], overridable: true }, { name: 'component', mayReference: ['semantic'] }] };
  const base = indexTiers(cfg, [tierFromTrees('raw', [raw]), tierFromTrees('semantic', [semantic]), tierFromTrees('component', [component])]);
  const ios = platformFromTrees('ios', [{ color: { action: { primary: { $type: 'color', bg: { $value: '{color.p3}' } } } }, font: { family: { $type: 'fontFamily', sans: { $value: ['SF Pro'] } } } }]);
  const { index, problems } = applyPlatform(base, ios);
  assert.deepEqual(problems, []);
  assert.equal(resolveValue('{button.container.background}', base.byPath), '#2563eb', 'base index is untouched');
  assert.deepEqual(resolveValue('{button.container.background}', index.byPath), { colorSpace: 'display-p3', components: [0, 0.5, 1], alpha: 0.5 });
  assert.equal(index.byPath.get('color.action.primary.bg').overridden, true);
  assert.equal(index.byPath.get('color.action.primary.bg').tier, 'semantic', 'an overridden token keeps its tier');
  assert.deepEqual(checkPlatforms({ ...base, platforms: [ios] }), []);

  const bad = platformFromTrees('bad', [{ nope: { $type: 'color', $value: '#000' }, button: { container: { background: { $type: 'color', $value: '{color.blue.600}' } } } }]);
  const refused = applyPlatform(base, bad).problems.map((p) => [p.token, p.message]);
  assert.match(refused.find(([t]) => t === 'nope')[1], /cannot add tokens/);
  assert.match(refused.find(([t]) => t === 'button.container.background')[1], /only raw and semantic tokens may vary/);
  const crossTier = platformFromTrees('x', [{ color: { action: { primary: { $type: 'color', bg: { $value: '{button.container.background}' } } } } }]);
  assert.match(checkPlatforms({ ...base, platforms: [crossTier] })[0].message, /may not reference component/);

  const json = JSON.parse(renderResolvedTree(index, { platform: 'ios', header: 'test' }));
  assert.deepEqual(json.$extensions[EXT], { platform: 'ios', overridden: ['font.family.sans', 'color.action.primary.bg'] }, 'tier order, raw first');
  assert.deepEqual(json.button.container.background, { $type: 'color', $value: { colorSpace: 'display-p3', components: [0, 0.5, 1], alpha: 0.5 }, $extensions: { [EXT]: { tier: 'component', alias: 'color.action.primary.bg' } } });
  assert.equal(json.color.action.primary.bg.$extensions[EXT].overridden, true);
  assert.deepEqual(json.text.control.$value.fontFamily, ['SF Pro'], 'composite members follow the overlay');
});

test('modes override modal tiers only, combine with platforms, and refuse a token both override', () => {
  const cfg = { tiers: [{ name: 'raw', mayReference: [], overridable: true }, { name: 'semantic', mayReference: ['raw'], overridable: true, modal: true }, { name: 'component', mayReference: ['semantic'] }] };
  const base = indexTiers(cfg, [tierFromTrees('raw', [raw]), tierFromTrees('semantic', [semantic]), tierFromTrees('component', [component])]);
  const light = modeFromTrees('light', [], { default: true, scheme: 'light' });
  const dark = modeFromTrees('dark', [{ color: { action: { primary: { $type: 'color', bg: { $value: '{color.p3}' } } } } }], { scheme: 'dark' });
  const loaded = { ...base, platforms: [], modes: [light, dark] };
  assert.deepEqual(checkModes(loaded), []);

  const { index } = applyMode(base, dark);
  assert.equal(index.mode, 'dark');
  assert.equal(index.byPath.get('color.action.primary.bg').modeOverridden, true);
  assert.equal(resolveValue('{button.container.background}', base.byPath), '#2563eb', 'base index is untouched');
  assert.deepEqual(resolveValue('{button.container.background}', index.byPath), { colorSpace: 'display-p3', components: [0, 0.5, 1], alpha: 0.5 }, 'components follow the mode through their aliases');
  assert.equal(resolveValue('{button.container.background}', resolveContext(loaded, { mode: 'light' }).byPath), '#2563eb', 'the default mode is the base tiers');

  const raws = modeFromTrees('x', [{ color: { blue: { 600: { $type: 'color', $value: '#000' } } }, button: { container: { background: { $type: 'color', $value: '{color.blue.600}' } } } }]);
  const refused = applyMode(base, raws).problems.map((p) => p.message);
  assert.equal(refused.length, 2);
  assert.ok(refused.every((m) => /only semantic tokens may vary per mode/.test(m)));

  const ios = platformFromTrees('ios', [{ color: { action: { primary: { $type: 'color', bg: { $value: '{color.blue.600}' } } } } }]);
  const both = checkModes({ ...loaded, platforms: [ios] });
  assert.equal(both.length, 1);
  assert.equal(both[0].platform, 'ios');
  assert.match(both[0].message, /per platform or per mode, not both/);

  assert.match(checkModes({ ...loaded, modes: [dark] })[0].message, /exactly one mode must be "default"/);
  const json = JSON.parse(renderResolvedTree(index, { mode: 'dark' }));
  assert.deepEqual(json.$extensions[EXT], { mode: 'dark', overridden: [], modeOverridden: ['color.action.primary.bg'] });
  assert.equal(json.color.action.primary.bg.$extensions[EXT].modeOverridden, true);
});

test('planOutputs writes mode contexts for the web and one tree per platform and mode', () => {
  const cfg = {
    tiers: [
      { name: 'raw', mayReference: [], output: 'raw.css', overridable: true },
      { name: 'semantic', mayReference: ['raw'], output: 'semantic.css', overridable: true, modal: true },
      { name: 'component', mayReference: ['semantic'], output: 'components/{component}.css', splitByTopLevelGroup: true },
    ],
    css: { selector: ':root', preserveAliases: true, modes: { attribute: 'data-theme', auto: 'auto' } },
  };
  const base = indexTiers(cfg, [tierFromTrees('raw', [raw]), tierFromTrees('semantic', [semantic]), tierFromTrees('component', [component])]);
  const modes = [modeFromTrees('light', [], { default: true, scheme: 'light' }), modeFromTrees('dark', [{ color: { action: { primary: { $type: 'color', bg: { $value: '{color.p3}' } } } } }], { scheme: 'dark' })];
  const ios = { ...platformFromTrees('ios', []), output: 'ios/{mode}.tokens.json' };
  const out = planOutputs({ ...base, platforms: [ios], modes }, '/t');
  const raw_ = out.get('/t/raw.css');
  const sem = out.get('/t/semantic.css');
  const btn = out.get('/t/components/button.css');
  assert.match(raw_, /^:root \{$/m, 'raw tokens are context-free');
  assert.match(sem, /^:root, \[data-theme\] \{\n  color-scheme: light;\n  --color-action-primary-bg: var\(--color-blue-600\);/m);
  assert.match(sem, /^\[data-theme="auto"\] \{\n  color-scheme: light dark;\n\}/m);
  assert.match(sem, /^\[data-theme="dark"\] \{\n  color-scheme: dark;\n  --color-action-primary-bg: var\(--color-p3\);\n\}/m);
  assert.match(sem, /@media \(prefers-color-scheme: dark\) \{\n  \[data-theme="auto"\] \{\n    --color-action-primary-bg: var\(--color-p3\);\n  \}\n\}/);
  assert.doesNotMatch(sem.slice(sem.indexOf('[data-theme="dark"]')), /--text-control/, 'only the tokens the mode overrides');
  assert.match(btn, /^:root, \[data-theme\] \{$/m, 'component aliases resolve again in every context');
  assert.doesNotMatch(btn, /color-scheme/);
  assert.deepEqual([...out.keys()].filter((k) => k.endsWith('.json')).sort(), ['/t/ios/dark.tokens.json', '/t/ios/light.tokens.json']);
  assert.deepEqual(JSON.parse(out.get('/t/ios/dark.tokens.json')).$extensions[EXT], { platform: 'ios', mode: 'dark', overridden: [], modeOverridden: ['color.action.primary.bg'] });
});
