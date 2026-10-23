/**
 * Quantum Penpot plugin: draws components of the design system in the open Penpot file, bound to
 * Penpot design tokens. packages/penpot/build.mjs prepends `const PLAN = …;` (src/plan.mjs) and
 * writes this file as packages/penpot/dist/plugin.js, next to its manifest.
 *
 * 1. Tokens: finds or creates the token sets (Foundation, Component, one per mode) and every token
 *    the components reach, references kept, then the themes (one per mode) and activates the
 *    default one. Running it again updates the values in place.
 * 2. Components: on a page named after each component, draws every variant's shape tree and applies
 *    its tokens, which set their values, each token once for all the shapes that take it; lays the
 *    variants out in a grid, makes each one a component and combines them into a component with
 *    variants, whose properties it names and sets. One that already exists is kept as it is
 *    (delete it to draw it again), so the copies of a file never lose their main component; the
 *    components drawn after it still use it.
 *
 * Penpot applies layouts and tokens a moment after a call returns: the plugin draws, waits for them
 * to settle, then places what depends on a laid out size (absolute positions, focus rings, paths).
 * The window (index.html, src/ui/ui.mjs) follows the run: the plugin posts a message per step and
 * yields every few variants so that it repaints; it stays open on the summary until closed.
 */

const warnings = [];

function warn(message) {
  if (!warnings.includes(message)) warnings.push(message);
}

/** A message to the window (src/ui/ui.js). */
function post(message) {
  penpot.ui.sendMessage(message);
}

function tick(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Variants drawn (or tokens written) between two progress messages. */
const PROGRESS_EVERY = 8;
const TOKENS_EVERY = 50;

/** Waits until Penpot has applied the layouts and token values it scheduled. */
async function settle() {
  if (typeof penpot.waitForLayoutUpdate === 'function') {
    try {
      await penpot.waitForLayoutUpdate();
      return;
    } catch (e) {
      // Fall back to a pause.
    }
  }
  await tick(50);
}

/** Polls `test` until it holds: some changes (variants, pages) land after the call returns. */
async function until(test, what) {
  for (let i = 0; i < 150; i++) {
    try {
      if (test()) return true;
    } catch (e) {
      // Not there yet.
    }
    await tick(20);
  }
  warn(`Timed out waiting for ${what}.`);
  return false;
}

/** The value of a token in the default mode, as the plan resolved it. */
function valueOf(name) {
  return PLAN.values[name];
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

/** Token name -> the token, for applyToken (Penpot applies a token by its name). */
const tokens = new Map();

/** Whether a token holds the plan's value: a number imported from the Tokens panel equals its text. */
const sameValue = (held, value) => JSON.stringify(held) === JSON.stringify(value) || (typeof held === 'number' && String(held) === value);

async function syncTokens(plan, progress) {
  const catalog = penpot.library.local.tokens;
  const sets = {};
  for (const name of plan.sets) sets[name] = catalog.sets.find((s) => s.name === name) || catalog.addSet({ name });
  await settle();
  const existing = {};
  for (const name of plan.sets) existing[name] = new Map(sets[name].tokens.map((t) => [t.name, t]));

  // Penpot resolves a token when it is created: the plan lists every reference first. A token
  // that still fails is tried again once, after the others.
  let pending = plan.tokens;
  let written = 0;
  for (let attempt = 0; attempt < 2 && pending.length; attempt++) {
    const failed = [];
    for (const spec of pending) {
      let token = existing[spec.set].get(spec.name);
      try {
        if (token && token.type !== spec.type) {
          warn(`Token "${spec.name}" exists in "${spec.set}" as ${token.type}, expected ${spec.type}: left as it is.`);
        } else {
          if (!token) {
            token = sets[spec.set].addToken({ type: spec.type, name: spec.name, value: spec.value });
            if (!token) throw new Error('Penpot could not resolve its value');
            existing[spec.set].set(spec.name, token);
          } else if (!sameValue(token.value, spec.value)) {
            token.value = spec.value;
          }
          if (token.description !== spec.description) token.description = spec.description;
        }
        if (token && !tokens.has(spec.name)) tokens.set(spec.name, token);
      } catch (e) {
        failed.push({ spec, error: e.message });
        continue;
      }
      written += 1;
      if (written % TOKENS_EVERY === 0) {
        progress(written);
        await tick();
      }
    }
    pending = failed.map((f) => f.spec);
    if (attempt === 1 || !pending.length) failed.forEach((f) => warn(`Token "${f.spec.name}" (${f.spec.set}) could not be written: ${f.error}.`));
    if (pending.length) await settle();
  }

  for (const spec of plan.themes) {
    const theme = catalog.themes.find((t) => t.group === spec.group && t.name === spec.name) || catalog.addTheme({ group: spec.group, name: spec.name });
    for (const name of spec.sets) {
      if (!theme.activeSets.some((s) => s.id === sets[name].id)) theme.addSet(sets[name]);
    }
  }
  await settle();
  for (const name of plan.active) {
    const theme = catalog.themes.find((t) => `${t.group}/${t.name}` === name);
    if (theme && !theme.active) theme.toggleActive();
  }
  return written;
}

/** Property names Penpot read otherwise before 2.19: `fontFamilies` was `fontFamily`. */
const FORMER_PROPERTIES = { fontFamilies: 'fontFamily' };

/** Calls `apply` with the token properties, then with their former names where Penpot refuses them. */
function withFormer(properties, apply) {
  try {
    apply(properties);
  } catch (e) {
    const former = properties.map((p) => FORMER_PROPERTIES[p] || p);
    if (former.join() === properties.join()) throw e;
    try {
      apply(former);
    } catch (again) {
      throw e;
    }
  }
}

/** Whether a shape has a token on one of the properties: applying it again would take it off. */
function carries(shape, name, properties) {
  let applied;
  try {
    applied = shape.tokens || {};
  } catch (e) {
    return false;
  }
  return properties.some((p) => applied[p] === name || applied[FORMER_PROPERTIES[p]] === name);
}

/**
 * Token applications waiting for `applyTokens`, by token and properties. Penpot resolves every
 * token of the active sets before each application, whatever the number of shapes it is applied
 * to: a token is applied once to all the shapes of a component that take it, not once per shape.
 */
const queue = new Map();

/**
 * Queues a token for properties of a shape: applied by `applyTokens`, it sets their values too.
 * Where Penpot refuses it, `fallback` sets the values without the token.
 */
function bindToken(shape, name, properties, fallback) {
  const key = `${name}\n${properties.join()}`;
  if (!queue.has(key)) queue.set(key, { name, properties, shapes: [], fallbacks: [] });
  queue.get(key).shapes.push(shape);
  queue.get(key).fallbacks.push(fallback);
}

/** Applies a token to properties of one shape, now. */
function applyToken(shape, name, properties, fallback) {
  try {
    const token = tokens.get(name);
    if (!token) throw new Error('no such token');
    withFormer(properties, (props) => shape.applyToken(token, props));
  } catch (e) {
    warn(`Could not apply "${name}" to ${properties.join(', ')} of ${shape.name}: ${e.message}`);
    if (fallback) fallback();
  }
}

/** How long the queued tokens may take to show without one more of them showing. */
const TOKENS_QUIET = 2000;

/**
 * Applies the queued tokens, each one in one call to its shapes, except those that have it already
 * (Penpot would take it off all of them), then waits until Penpot shows them: it applies a token
 * once it has resolved the others, after the call returns.
 */
async function applyTokens() {
  const applied = [];
  for (const { name, properties, shapes, fallbacks } of queue.values()) {
    const targets = shapes.map((shape, i) => ({ shape, fallback: fallbacks[i] })).filter(({ shape }) => !carries(shape, name, properties));
    if (!targets.length) continue;
    try {
      const token = tokens.get(name);
      if (!token) throw new Error('no such token');
      withFormer(properties, (props) => token.applyToShapes(targets.map((t) => t.shape), props));
      applied.push({ name, properties, last: targets[targets.length - 1].shape });
    } catch (e) {
      // A shape refuses it: one at a time, each refusal said and its values set.
      targets.forEach(({ shape, fallback }) => applyToken(shape, name, properties, fallback));
    }
  }
  queue.clear();
  let pending = applied;
  for (let quiet = 0; pending.length && quiet < TOKENS_QUIET;) {
    const left = pending.filter(({ name, properties, last }) => !carries(last, name, properties));
    quiet = left.length < pending.length ? 0 : quiet + 50;
    pending = left;
    if (pending.length) await tick(50);
  }
  pending.forEach(({ name, properties, last }) => warn(`Penpot did not show "${name}" on ${properties.join(', ')} of ${last.name}.`));
  await settle();
}

// ---------------------------------------------------------------------------
// Fonts: a family and weight the tokens name, found among Penpot's fonts
// ---------------------------------------------------------------------------

/** "family/weight" -> { font, variant }, or null when Penpot has no such family. */
const fonts = {};

function fontOf(family, weight) {
  const key = `${family}/${weight}`;
  if (key in fonts) return fonts[key];
  const font = penpot.fonts.findByName(family);
  if (!font) {
    warn(`The font "${family}" is not among Penpot's fonts: its text keeps Penpot's default font, its icons are drawn as empty squares.`);
    fonts[key] = null;
    return null;
  }
  let variant = font.variants.find((v) => String(v.fontWeight) === String(weight) && v.fontStyle !== 'italic');
  if (!variant) {
    warn(`Font "${family}" has no style for weight ${weight}: drawn in its default style.`);
    variant = undefined;
  }
  fonts[key] = { font, variant };
  return fonts[key];
}

function applyFont(text, family, weight) {
  const found = fontOf(family, weight);
  if (!found) return false;
  try {
    found.font.applyToText(text, found.variant);
  } catch (e) {
    warn(`Could not set the font "${family}" on ${text.name}: ${e.message}`);
  }
  return true;
}

// ---------------------------------------------------------------------------
// Drawing: a binding is a token name, queued and applied with the others (applyTokens)
// ---------------------------------------------------------------------------

/** A flex layout's padding, by token property. */
const PADDINGS = { paddingTop: 'topPadding', paddingRight: 'rightPadding', paddingBottom: 'bottomPadding', paddingLeft: 'leftPadding' };
/** A layout child's limits, by token property. */
const LIMITS = { layoutItemMinW: 'minWidth', layoutItemMinH: 'minHeight', layoutItemMaxW: 'maxWidth', layoutItemMaxH: 'maxHeight' };
/** Sizing of a board's layout and of a layout child, by dimension. */
const SIZINGS = { width: 'horizontalSizing', height: 'verticalSizing' };

/** Sets a property to a value (the token, applied next, sets the same). */
function setProperty(shape, property, value) {
  try {
    if (property === 'width') shape.resize(value, shape.height);
    else if (property === 'height') shape.resize(shape.width, value);
    else if (PADDINGS[property]) shape.flex[PADDINGS[property]] = value;
    else if (property === 'rowGap' || property === 'columnGap') shape.flex[property] = value;
    else if (LIMITS[property]) {
      if (shape.layoutChild) shape.layoutChild[LIMITS[property]] = value;
    } else if (property === 'strokeWidth') shape.strokes = shape.strokes.map((s) => Object.assign({}, s, { strokeWidth: value }));
    else if (property === 'fontSize' || property === 'lineHeight' || property === 'letterSpacing') shape[property] = String(value);
    else shape[property] = value;
  } catch (e) {
    warn(`Could not set ${property} on ${shape.name}: ${e.message}`);
  }
}

/** Fixes a dimension: a bound or literal size stays the size, in a layout or not. */
function fix(shape, dimension, parent) {
  if (shape.flex) shape.flex[SIZINGS[dimension]] = 'fix';
  if (parent && parent.flex && shape.layoutChild) shape.layoutChild[SIZINGS[dimension]] = 'fix';
}

function fillOf(name) {
  const c = valueOf(name);
  return { fillColor: c.color, fillOpacity: c.opacity };
}

function strokeOf(name, width, alignment) {
  const c = valueOf(name);
  return { strokeColor: c.color, strokeOpacity: c.opacity, strokeStyle: 'solid', strokeWidth: width, strokeAlignment: alignment };
}

/**
 * Paints, values computed from tokens (`set`) and bound properties (`bind`) of a shape. A token
 * sets the values it drives: they are written only where Penpot refuses the token. Given `prev`,
 * the spec of the shape this one is a clone of, only what differs from it is written: every write
 * is a change Penpot commits, the cost of a run.
 */
function applyFields(shape, spec, parent, prev) {
  const bind = spec.bind || {};
  const set = spec.set || {};
  const was = { fill: prev && prev.fill, stroke: prev && prev.stroke, bind: (prev && prev.bind) || {}, set: (prev && prev.set) || {} };
  const differs = (key, property) => !prev || (property ? (spec[key] || {})[property] !== was[key][property] : spec[key] !== was[key]);
  const stroke = () => {
    const width = bind.strokeWidth ? valueOf(bind.strokeWidth) : set.strokeWidth || 1;
    const out = strokeOf(spec.stroke, width, spec.type === 'path' ? 'center' : 'inner');
    if (spec.strokeCap) Object.assign(out, { strokeCapStart: spec.strokeCap, strokeCapEnd: spec.strokeCap });
    return [out];
  };
  if (differs('fill')) {
    if (spec.fill) {
      // A clone has its fill already: the token alone changes its color.
      if (!was.fill) shape.fills = [fillOf(spec.fill)];
      bindToken(shape, spec.fill, ['fill'], () => { shape.fills = [fillOf(spec.fill)]; });
    } else if (spec.type !== 'text' && spec.type !== 'instance') {
      shape.fills = [];
    }
  }
  // The stroke holds its width; writing it again unbinds its tokens, so a clone keeps it.
  const restroke = spec.stroke && (!prev || (spec.set && differs('set', 'strokeWidth')));
  if (restroke) shape.strokes = stroke();
  if (spec.stroke && (restroke || differs('stroke'))) bindToken(shape, spec.stroke, ['strokeColor'], () => { shape.strokes = stroke(); });
  // A path is drawn at its size: resizing it would stretch it to its bounds.
  const sized = (property) => spec.type !== 'path' || (property !== 'width' && property !== 'height');
  const inStroke = (property) => property === 'strokeWidth' && spec.stroke;
  Object.keys(set).filter(sized).filter((p) => !inStroke(p) && differs('set', p)).forEach((property) => setProperty(shape, property, set[property]));
  // One application per token, for every property it drives (a radius, its four corners). A clone's
  // bound sizes are fixed already: its source binds the same properties.
  const groups = new Map();
  Object.keys(bind).filter(sized).filter((p) => differs('bind', p) || (restroke && inStroke(p))).forEach((property) => {
    if (SIZINGS[property] && !prev) fix(shape, property, parent);
    groups.set(bind[property], (groups.get(bind[property]) || []).concat(property));
  });
  groups.forEach((properties, name) => bindToken(shape, name, properties, () => {
    properties.filter((p) => p !== 'fontFamilies' && p !== 'fontWeight').forEach((p) => setProperty(shape, p, valueOf(name)));
    if (shape.type === 'text' && (properties.includes('fontFamilies') || properties.includes('fontWeight'))) applyFont(shape, valueOf(bind.fontFamilies), valueOf(bind.fontWeight));
  }));
}

/** Width and height: auto (hug), fill (in a layout) or a fixed number of pixels. */
function applySizing(shape, spec, parent) {
  const inLayout = !!(parent && parent.flex);
  Object.keys(SIZINGS).forEach((dimension) => {
    const want = spec[dimension];
    if (want === undefined) return;
    try {
      if (typeof want === 'number') {
        setProperty(shape, dimension, want);
        fix(shape, dimension, parent);
      } else if (inLayout) {
        shape.layoutChild[SIZINGS[dimension]] = want;
      } else if (shape.flex && want === 'auto') {
        shape.flex[SIZINGS[dimension]] = want;
      }
    } catch (e) {
      warn(`Could not size ${shape.name} (${dimension} ${want}): ${e.message}`);
    }
  });
}

function drawBoard(spec) {
  const board = penpot.createBoard();
  board.name = spec.name;
  board.clipContent = false;
  board.fills = [];
  if (spec.layout) {
    const flex = board.addFlexLayout();
    flex.dir = spec.layout;
    flex.wrap = 'nowrap';
    flex.justifyContent = spec.justify;
    flex.alignItems = spec.align;
    flex.horizontalSizing = 'auto';
    flex.verticalSizing = 'auto';
  }
  return board;
}

/** The values of a typography token on a text (the token, applied next, sets the same). */
function typeset(text, name) {
  const t = valueOf(name);
  applyFont(text, t.fontFamily, t.fontWeight);
  setProperty(text, 'fontSize', t.fontSize);
  setProperty(text, 'lineHeight', t.lineHeight);
  setProperty(text, 'letterSpacing', t.letterSpacing);
}

function drawText(spec) {
  const text = penpot.createText(spec.text || ' ');
  text.name = spec.name;
  text.growType = spec.width === 'fill' ? 'auto-height' : 'auto-width';
  if (spec.textDecoration) text.textDecoration = spec.textDecoration;
  // The typography token sets the font: only say when Penpot does not have it.
  if (spec.typography) fontOf(valueOf(spec.typography).fontFamily, valueOf(spec.typography).fontWeight);
  return text;
}

/** The spec drawn for a node: without the icon font, an icon is a square of its size holding the place. */
function drawnSpec(spec) {
  if (spec.type !== 'icon' || fontOf(valueOf(spec.bind.fontFamilies), valueOf(spec.bind.fontWeight))) return spec;
  return { type: 'board', name: spec.name, stroke: spec.fill, bind: { width: spec.bind.width, height: spec.bind.height } };
}

/** An icon: a glyph of the icon font. */
function drawIcon(spec) {
  const bind = spec.bind;
  const text = penpot.createText(spec.glyph);
  text.name = spec.name;
  text.growType = 'fixed';
  text.align = 'center';
  text.verticalAlign = 'center';
  return text;
}

function drawShape(spec) {
  if (spec.type === 'ellipse' && !spec.arc) {
    const ellipse = penpot.createEllipse();
    ellipse.name = spec.name;
    return ellipse;
  }
  // A path, or an arc (a partial ellipse) as an open path: drawn at the origin, moved into its box by `place`.
  const path = penpot.createPath();
  path.name = spec.name;
  const size = pathBox(spec);
  path.d = spec.arc ? arcPath(spec.arc, size, valueOf(spec.bind.strokeWidth), 0, 0) : movePath(spec.path, size, 0, 0);
  return path;
}

/** Component id -> its component with variants in this file (drawn now or kept), for copies. */
const containers = {};

/** A copy of a variant of another component, matched by its property values. */
function drawInstance(spec) {
  const target = containers[spec.component];
  if (!target) {
    warn(`No component "${spec.component}": its copies are left out.`);
    return null;
  }
  const component = target.container.variants.variantComponents().find((c) => Object.keys(spec.variant).every((k) => c.variantProps[k] === spec.variant[k]));
  if (!component) {
    warn(`No variant of "${spec.component}" matches ${JSON.stringify(spec.variant)}.`);
    return null;
  }
  const copy = component.instance();
  copy.name = spec.name;
  Object.keys(spec.texts || {}).forEach((property) => {
    const layer = findText(copy, target.textLayers[property]);
    if (!layer) return warn(`"${spec.component}" has no text layer for "${property}".`);
    layer.characters = spec.texts[property];
  });
  return copy;
}

function findText(shape, name) {
  if (shape.type === 'text' && shape.name === name) return shape;
  for (const child of shape.children || []) {
    const found = findText(child, name);
    if (found) return found;
  }
  return null;
}

/**
 * Draws a shape and its subtree, appended to `parent`. `out` lists every drawn shape with its spec
 * and parent, parents first, for `place` and `decorate`.
 */
function drawNode(spec, parent, out) {
  spec = drawnSpec(spec);
  let shape;
  if (spec.type === 'board') shape = drawBoard(spec);
  else if (spec.type === 'text') shape = drawText(spec);
  else if (spec.type === 'icon') shape = drawIcon(spec);
  else if (spec.type === 'instance') shape = drawInstance(spec);
  else shape = drawShape(spec);
  if (!shape) return null;
  if (parent) parent.appendChild(shape);
  out.push({ shape, spec, parent });
  (spec.children || []).forEach((child) => drawNode(child, shape, out));
  applySizing(shape, spec, parent);
  if (spec.type !== 'instance') applyFields(shape, spec, parent);
  if (spec.typography) bindToken(shape, spec.typography, ['typography'], () => typeset(shape, spec.typography));
  if (spec.hidden) shape.hidden = true;
  return shape;
}

// ---------------------------------------------------------------------------
// Clones: variants of the same structure differ in values only. The first one is drawn, its tokens
// applied, the others are clones of it (one change) on which only what differs is written.
// ---------------------------------------------------------------------------

/**
 * What a node tree is made of, without its values: two trees of the same structure match shape for
 * shape. A copy is of a component, whichever its variant and texts: a clone swaps it (`update`).
 */
function structure(spec) {
  spec = drawnSpec(spec);
  const keys = (o) => Object.keys(o || {}).sort();
  return [
    spec.type, spec.name, spec.layout || '', typeof spec.width, typeof spec.height, keys(spec.bind), keys(spec.set),
    !!spec.fill, !!spec.stroke, !!spec.typography, !!spec.focusRing, spec.border ? spec.border.side : '', spec.arc ? 'arc' : '',
    spec.type === 'instance' ? spec.component : '',
    (spec.children || []).map(structure),
  ];
}

/** The nodes of a tree, parents first, as `drawNode` lists them. */
function nodes(spec, out = []) {
  spec = drawnSpec(spec);
  out.push(spec);
  if (spec.type !== 'instance') (spec.children || []).forEach((child) => nodes(child, out));
  return out;
}

/**
 * The shapes of a clone of `source` (a drawn variant) paired with the nodes of `spec`, parents
 * first, or null when they do not match one for one (a copy left out of the source).
 */
function pairs(clone, spec, source) {
  const specs = nodes(spec);
  if (specs.length !== source.shapes.length) return null;
  const out = [];
  const walk = (shape, parent) => {
    const i = out.length;
    if (i >= specs.length) return;
    out.push({ shape, spec: specs[i], parent, prev: source.shapes[i].spec });
    if (source.shapes[i].spec.type !== 'instance') (shape.children || []).forEach((child) => walk(child, shape));
  };
  walk(clone, null);
  return out.length === specs.length ? out : null;
}

/** Writes on a cloned shape what its node changes from the node of the shape it is a clone of. */
function update(pair) {
  const { shape, spec, prev, parent } = pair;
  if (spec.type === 'instance' && JSON.stringify([spec.variant, spec.texts]) !== JSON.stringify([prev.variant, prev.texts])) {
    pair.shape = swap(shape, spec, parent);
    return;
  }
  if (spec.layout && (spec.justify !== prev.justify || spec.align !== prev.align)) {
    shape.flex.justifyContent = spec.justify;
    shape.flex.alignItems = spec.align;
  }
  if (spec.width !== prev.width || spec.height !== prev.height) applySizing(shape, spec, parent);
  const characters = spec.type === 'icon' ? [spec.glyph, prev.glyph] : [spec.text, prev.text];
  if (characters[0] !== undefined && characters[0] !== characters[1]) shape.characters = characters[0];
  // Penpot takes 'none', not null, for no decoration.
  if (spec.textDecoration !== prev.textDecoration) shape.textDecoration = spec.textDecoration || 'none';
  if (spec.type !== 'instance') applyFields(shape, spec, parent, prev);
  if (spec.typography && spec.typography !== prev.typography) bindToken(shape, spec.typography, ['typography'], () => typeset(shape, spec.typography));
  if (!!spec.hidden !== !!prev.hidden) shape.hidden = !!spec.hidden;
}

/** A copy of another variant in place of a cloned copy: fewer changes than switching its properties one by one. */
function swap(old, spec, parent) {
  const copy = drawInstance(spec);
  if (copy) {
    parent.insertChild(parent.children.findIndex((c) => c.id === old.id), copy);
    applySizing(copy, spec, parent);
    if (spec.hidden) copy.hidden = true;
  }
  old.remove();
  return copy;
}

/** The box of a path: its size and its position in its parent, as for any shape. */
function pathBox(spec) {
  const bind = spec.bind || {};
  const set = spec.set || {};
  return set.width || (bind.width && valueOf(bind.width)) || 24;
}

/** Scales SVG path data drawn in a 24 x 24 box to `size`, then moves it to (x, y). */
function movePath(data, size, x, y) {
  const scale = size / 24;
  let i = 0;
  return data.replace(/-?\d*\.?\d+/g, (n) => String(+((parseFloat(n) * scale) + (i++ % 2 === 0 ? x : y)).toFixed(3)));
}

/** An open circular arc in a square box at (x, y): `arc` in turns, clockwise from 3 o'clock. */
function arcPath(arc, size, weight, x, y) {
  const r = (size - weight) / 2;
  const c = size / 2;
  const at = (turn) => [x + c + r * Math.cos(turn * 2 * Math.PI), y + c + r * Math.sin(turn * 2 * Math.PI)].map((n) => +n.toFixed(3));
  const [x1, y1] = at(arc[0]);
  const [x2, y2] = at(arc[1]);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${arc[1] - arc[0] > 0.5 ? 1 : 0} 1 ${x2} ${y2}`;
}

/** Absolute positions, positions in boards without layout, and paths: once the tree is laid out, parents first. */
function place(drawn) {
  drawn.forEach(({ shape, spec, parent }) => {
    if (!parent) return;
    const isPath = spec.type === 'path' || (spec.type === 'ellipse' && spec.arc);
    const size = isPath ? pathBox(spec) : null;
    const width = isPath ? size : shape.width;
    const height = isPath ? size : shape.height;
    const at = (axis, extent, start) => {
      const want = spec.absolute ? spec.absolute[axis] : undefined;
      if (want === 'center') return start + ((axis === 'x' ? parent.width : parent.height) - extent) / 2;
      return start + (want || 0);
    };
    const inFlow = parent.flex && !spec.absolute;
    if (spec.absolute && parent.flex) shape.layoutChild.absolute = true;
    const x = inFlow ? shape.x : at('x', width, parent.x);
    const y = inFlow ? shape.y : at('y', height, parent.y);
    if (spec.type === 'path') shape.d = movePath(spec.path, size, x, y);
    else if (isPath) shape.d = arcPath(spec.arc, size, valueOf(spec.bind.strokeWidth), x, y);
    else if (!inFlow) {
      shape.x = x;
      shape.y = y;
    }
  });
}

/** Focus rings and one-sided borders, once every shape has its place and size. */
function decorate(drawn) {
  drawn.forEach(({ shape, spec }) => {
    if (spec.focusRing) drawFocusRing(shape, spec.focusRing);
    if (spec.border) drawBorder(shape, spec.border);
  });
}

function drawFocusRing(shape, ring) {
  const offset = valueOf(ring.offset);
  const radius = typeof shape.borderRadiusTopLeft === 'number' ? shape.borderRadiusTopLeft : 0;
  const rect = penpot.createRectangle();
  rect.name = 'focus-ring';
  shape.appendChild(rect);
  if (shape.flex) rect.layoutChild.absolute = true;
  rect.resize(shape.width + 2 * offset, shape.height + 2 * offset);
  rect.x = shape.x - offset;
  rect.y = shape.y - offset;
  rect.fills = [];
  rect.strokes = [strokeOf(ring.color, valueOf(ring.width), 'outer')];
  bindToken(rect, ring.color, ['strokeColor']);
  bindToken(rect, ring.width, ['strokeWidth']);
  // The outline follows the border radius, pushed out by the offset: a sum no token holds.
  rect.borderRadius = radius + offset;
  rect.constraintsHorizontal = 'leftright';
  rect.constraintsVertical = 'topbottom';
  rect.blocked = true;
}

/** A border on one side: a line along it, its stroke centered on the inner half of the border. */
function drawBorder(shape, border) {
  const width = valueOf(border.width);
  const line = penpot.createPath();
  line.name = `border-${border.side}`;
  shape.appendChild(line);
  if (shape.flex) line.layoutChild.absolute = true;
  const { x, y } = shape;
  const right = x + shape.width;
  const bottom = y + shape.height;
  const half = width / 2;
  line.d = {
    top: `M ${x} ${y + half} L ${right} ${y + half}`,
    bottom: `M ${x} ${bottom - half} L ${right} ${bottom - half}`,
    left: `M ${x + half} ${y} L ${x + half} ${bottom}`,
    right: `M ${right - half} ${y} L ${right - half} ${bottom}`,
  }[border.side];
  line.fills = [];
  line.strokes = [strokeOf(border.color, width, 'center')];
  bindToken(line, border.color, ['strokeColor']);
  bindToken(line, border.width, ['strokeWidth']);
  const vertical = border.side === 'left' || border.side === 'right';
  line.constraintsHorizontal = vertical ? border.side : 'leftright';
  line.constraintsVertical = vertical ? 'topbottom' : border.side;
}

/** The minimum size of a component itself: Penpot honours one inside a layout only. */
function applyMinimum(root, spec) {
  const bind = spec.bind || {};
  [['layoutItemMinW', 'width'], ['layoutItemMinH', 'height']].forEach(([property, dimension]) => {
    const min = bind[property] && valueOf(bind[property]);
    if (!min || root[dimension] >= min) return;
    fix(root, dimension, null);
    setProperty(root, dimension, min);
  });
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

async function findPage(name) {
  let page = penpot.currentFile.pages.find((p) => p.name === name);
  if (!page) {
    page = penpot.createPage();
    page.name = name;
  }
  await penpot.openPage(page);
  await until(() => penpot.currentPage.id === page.id, `the page "${name}"`);
  return penpot.currentPage;
}

/** Offsets of a grid's cells along one axis: each cell as large as its largest variant. */
function offsets(sizes, gutter, gap) {
  const out = [];
  let at = gutter;
  for (let i = 0; i < sizes.length; i++) {
    out.push(at);
    at += (sizes[i] || 0) + gap;
  }
  out.push(at - gap + gutter);
  return out;
}

const isContainer = (shape) => shape.type === 'board' && typeof shape.isVariantContainer === 'function' && shape.isVariantContainer();

async function drawComponent(plan, progress) {
  // What a component that failed left queued is on its page.
  queue.clear();
  const page = await findPage(plan.page);
  const existing = page.findShapes({ name: plan.name, type: 'board' }).find(isContainer);
  if (existing) {
    containers[plan.id] = { container: existing, textLayers: plan.textLayers };
    warn(`"${plan.name}" already exists on the page "${plan.page}": kept as it is (delete it to draw it again).`);
    return null;
  }

  // The first variant of each structure is drawn and its tokens applied, then cloned for the
  // others, on which only what differs is written. The tokens wait in `queue`: each one is applied
  // once for all the variants (applyTokens).
  const drawn = [];
  const firsts = new Map();
  let count = 0;
  const counted = async () => {
    count += 1;
    if (count % PROGRESS_EVERY === 0) {
      progress('drawing', count);
      await tick();
    }
  };
  const draw = (variant) => {
    const shapes = [];
    const root = drawNode(variant.root, null, shapes);
    // Penpot names a component after its board, and its variants after their common name.
    root.name = plan.name;
    return { root, shapes, variant };
  };
  for (let i = 0; i < plan.variants.length; i++) {
    const key = JSON.stringify(structure(plan.variants[i].root));
    if (firsts.has(key)) continue;
    firsts.set(key, i);
    drawn[i] = draw(plan.variants[i]);
    await counted();
  }
  await applyTokens();
  for (let i = 0; i < plan.variants.length; i++) {
    if (drawn[i]) continue;
    const variant = plan.variants[i];
    const key = JSON.stringify(structure(variant.root));
    const source = drawn[firsts.get(key)];
    const root = source.root.clone();
    const matched = pairs(root, variant.root, source);
    if (matched) {
      // Named when its properties are (nameProperties).
      matched.forEach((pair) => update(pair));
      drawn[i] = { root, shapes: matched.filter((pair) => pair.shape).map(({ shape, spec, parent }) => ({ shape, spec, parent })), variant };
    } else {
      root.remove();
      drawn[i] = draw(variant);
    }
    await counted();
  }
  await applyTokens();
  drawn.forEach((d) => place(d.shapes));
  await settle();
  drawn.forEach((d) => {
    decorate(d.shapes);
    applyMinimum(d.root, d.variant.root);
  });
  await applyTokens();

  const widths = [];
  const heights = [];
  drawn.forEach(({ root, variant }) => {
    widths[variant.column] = Math.max(widths[variant.column] || 0, root.width);
    heights[variant.row] = Math.max(heights[variant.row] || 0, root.height);
  });
  const xs = offsets(widths, 40, 24);
  const ys = offsets(heights, 40, 24);
  drawn.forEach(({ root, variant }) => {
    root.x = xs[variant.column];
    root.y = ys[variant.row] + ((heights[variant.row] || 0) - root.height) / 2;
  });
  await settle();

  // Each variant a component, then all of them one component with variants.
  progress('combining', plan.variants.length);
  const mains = drawn.map((d) => {
    d.component = penpot.library.local.createComponent([d.root]);
    return d.component.mainInstance();
  });
  await settle();
  const container = penpot.createVariantFromComponents(mains);
  await until(() => container.variants.variantComponents().length === mains.length, `the variants of "${plan.name}"`);
  container.name = plan.name;
  await nameProperties(container, plan, drawn);
  container.setSharedPluginData('quantum', 'component', JSON.stringify({ id: plan.id, version: plan.version }));
  containers[plan.id] = { container, textLayers: plan.textLayers };
  await settle();
  return container;
}

/**
 * The variant properties: a variant's main component named `Size=small, State=hover` takes those
 * properties and values, in one change, as when it is renamed in Penpot's layers. Where Penpot did
 * not, the properties are named and each value set, one change each.
 */
async function nameProperties(container, plan, drawn) {
  const variants = container.variants;
  const names = plan.properties.map((p) => p.name);
  const named = () => names.every((n, i) => variants.properties[i] === n) && variants.properties.length === names.length;
  const valued = (d) => names.every((n) => d.component.variantProps[n] === d.variant.props[n]);
  for (let i = 0; i < drawn.length; i++) {
    drawn[i].component.mainInstance().name = drawn[i].variant.name;
    if ((i + 1) % PROGRESS_EVERY === 0) await tick();
  }
  await settle();
  if (named() && drawn.every(valued)) return;
  while (variants.properties.length < names.length) {
    const count = variants.properties.length;
    variants.addProperty();
    await until(() => variants.properties.length > count, `a property of "${plan.name}"`);
  }
  names.forEach((name, i) => { if (variants.properties[i] !== name) variants.renameProperty(i, name); });
  for (let i = 0; i < drawn.length; i++) {
    const { component, variant } = drawn[i];
    names.forEach((name, position) => { if (component.variantProps[name] !== variant.props[name]) component.setVariantProperty(position, variant.props[name]); });
    if ((i + 1) % PROGRESS_EVERY === 0) await tick();
  }
}

// ---------------------------------------------------------------------------

/** The window says it is ready: messages posted before it loads would be lost. */
let ready;
const loaded = new Promise((resolve) => { ready = resolve; });

async function main() {
  penpot.ui.onMessage((msg) => {
    if (msg && msg.type === 'ready') ready();
    if (msg && msg.type === 'close') penpot.closePlugin();
  });
  penpot.on('themechange', (theme) => post({ type: 'theme', theme }));
  // Next to the manifest, wherever it is served; Penpot adds the theme to the URL (in its hash for a version 2 manifest).
  penpot.ui.open('Quantum components', 'index.html', { width: 380, height: 560 });
  await Promise.race([loaded, tick(3000)]);
  // appendChild then adds a shape after its siblings, in a layout as on the canvas.
  penpot.flags.naturalChildOrdering = true;

  const total = PLAN.components.reduce((n, c) => n + c.variants.length, 0);
  const plan = PLAN.tokens;
  post({ type: 'tokens', status: 'running', done: 0, total: plan.tokens.length });
  await tick();
  await syncTokens(plan, (done) => post({ type: 'tokens', status: 'running', done, total: plan.tokens.length }));
  post({ type: 'tokens', status: 'done', detail: `${plan.tokens.length} in ${plan.sets.length} sets` });

  const count = { done: 0, kept: 0, failed: 0, variants: 0 };
  let last = null;
  for (const component of PLAN.components) {
    const report = (status, drawnCount, phase, error) => {
      post({ type: 'component', id: component.id, name: component.name, status, phase, drawn: drawnCount, total: component.variants.length, totalVariants: total, error });
    };
    report('running', 0, 'drawing');
    await tick();
    try {
      const container = await drawComponent(component, (phase, n) => report('running', n, phase));
      if (container) {
        count.done += 1;
        count.variants += component.variants.length;
        last = container;
      } else {
        count.kept += 1;
      }
      report(container ? 'done' : 'kept', component.variants.length);
    } catch (e) {
      // One component failing leaves the others to draw.
      count.failed += 1;
      warn(`${component.name} could not be drawn: ${e.message}`);
      report('failed', 0, undefined, e.message);
    }
  }
  if (last) penpot.viewport.zoomIntoView([last]);
  const parts = [count.done ? `${plural(count.done, 'component')} drawn (${plural(count.variants, 'variant')})` : 'no component drawn'];
  if (count.kept) parts.push(`${count.kept} kept`);
  if (count.failed) parts.push(`${count.failed} failed`);
  parts.push(plural(plan.tokens.length, 'token'));
  end(`${parts.join(', ')}.${warnings.length ? ` ${plural(warnings.length, 'warning')}, see the console.` : ''}`);
}

function plural(n, word) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** Shows the summary in the window, which closes the plugin when its Close button is pressed. */
function end(summary, error) {
  warnings.forEach((w) => console.warn(`Quantum: ${w}`));
  post({ type: 'finished', summary, warnings, error: error || null });
}

main().catch((e) => end(e.message, e.message));
