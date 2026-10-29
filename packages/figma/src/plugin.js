/**
 * Quantum Figma plugin: draws components of the design system in the open Figma file, bound to
 * Figma variables. packages/figma/build.mjs prepends `const PLAN = …;` (src/plan.mjs) and
 * writes this file as packages/figma/dist/code.js, next to its manifest.
 *
 * 1. Variables: finds or creates one collection per token tier and one variable per token, then
 *    sets every value (literal or alias) in every mode. Running it again updates them in place.
 * 2. Components: on a page named after each component, draws every variant's node tree, sets each
 *    value from the plan, binds it to its variable, and combines the variants into a component set
 *    with its text and boolean properties. A component set that already exists is kept as it is
 *    (delete it to draw it again), so the instances of a file never lose their main component;
 *    the components drawn after it still use it for their instances.
 *
 * The window (`__html__`, src/ui/ui.mjs) follows the run: the plugin posts a message per step and
 * yields every few variants so that it repaints; it stays open on the summary until closed.
 *
 * Runs in Figma's plugin sandbox: plain JavaScript, no optional chaining, no object spread.
 */

var warnings = [];

function warn(message) {
  if (warnings.indexOf(message) === -1) warnings.push(message);
}

/** A message to the window (src/ui/ui.js). */
function post(message) {
  figma.ui.postMessage(message);
}

/** Lets Figma deliver the posted messages and the window repaint. */
function tick() {
  return new Promise(function (resolve) { setTimeout(resolve, 0); });
}

/** Variants drawn between two progress messages. */
var PROGRESS_EVERY = 8;

// ---------------------------------------------------------------------------
// Variables
// ---------------------------------------------------------------------------

async function syncVariables(plan) {
  var existingCollections = await figma.variables.getLocalVariableCollectionsAsync();
  var existingVariables = await figma.variables.getLocalVariablesAsync();
  var collections = {};

  plan.collections.forEach(function (spec) {
    var collection = existingCollections.find(function (c) { return c.name === spec.name; });
    var created = !collection;
    if (created) collection = figma.variables.createVariableCollection(spec.name);
    var modeIds = {};
    spec.modes.forEach(function (modeName, i) {
      var mode = collection.modes.find(function (m) { return m.name === modeName; });
      if (!mode && created && i === 0) {
        collection.renameMode(collection.modes[0].modeId, modeName);
        mode = collection.modes[0];
      }
      if (mode) {
        modeIds[modeName] = mode.modeId;
        return;
      }
      try {
        modeIds[modeName] = collection.addMode(modeName);
      } catch (e) {
        // upstream(figma): one mode per collection on the Starter (formerly Free) plan; the Dark values are left out there.
        warn('Collection "' + spec.name + '" could not get the mode "' + modeName + '" (' + e.message + '): its values are left out.');
      }
    });
    try {
      collection.hiddenFromPublishing = spec.hidden;
    } catch (e) {
      warn('Collection "' + spec.name + '": hiddenFromPublishing not set (' + e.message + ').');
    }
    collections[spec.key] = { collection: collection, modeIds: modeIds };
  });

  // Every variable first, so that any alias finds its target.
  var byName = {};
  plan.variables.forEach(function (spec) {
    var target = collections[spec.collection].collection;
    var variable = existingVariables.find(function (v) { return v.variableCollectionId === target.id && v.name === spec.name; });
    if (variable && variable.resolvedType !== spec.type) {
      warn('Variable "' + spec.name + '" exists as ' + variable.resolvedType + ', expected ' + spec.type + ': left as it is.');
      return;
    }
    byName[spec.name] = variable || figma.variables.createVariable(spec.name, target, spec.type);
  });

  plan.variables.forEach(function (spec) {
    var variable = byName[spec.name];
    if (!variable) return;
    var modeIds = collections[spec.collection].modeIds;
    Object.keys(spec.values).forEach(function (modeName) {
      if (!modeIds[modeName]) return;
      var value = spec.values[modeName];
      if (value && typeof value === 'object' && value.alias) {
        var target = byName[value.alias];
        if (!target) {
          warn('Variable "' + spec.name + '" aliases "' + value.alias + '", which could not be created.');
          return;
        }
        value = figma.variables.createVariableAlias(target);
      }
      variable.setValueForMode(modeIds[modeName], value);
    });
    variable.description = spec.description;
    variable.hiddenFromPublishing = spec.hidden;
    try {
      variable.scopes = spec.scopes;
    } catch (e) {
      warn('Variable "' + spec.name + '": scopes not set (' + e.message + ').');
    }
    Object.keys(spec.codeSyntax).forEach(function (platform) {
      variable.setVariableCodeSyntax(platform, spec.codeSyntax[platform]);
    });
  });
  return byName;
}

// ---------------------------------------------------------------------------
// Fonts: every family and weight a component draws, loaded once
// ---------------------------------------------------------------------------

var FALLBACK_FONT = { family: 'Inter', style: 'Regular' };

var WEIGHT_STYLES = {
  100: ['Thin'],
  200: ['ExtraLight', 'Extra Light'],
  300: ['Light'],
  400: ['Regular'],
  500: ['Medium'],
  600: ['SemiBold', 'Semi Bold'],
  700: ['Bold'],
  800: ['ExtraBold', 'Extra Bold'],
  900: ['Black'],
};

/** "family/weight" -> the loaded FontName, or null when Figma has none. */
var fonts = {};

function fontKey(family, weight) {
  return family + '/' + weight;
}

/** Loads `family` in the style of `weight` (or Regular). */
async function loadFont(family, weight) {
  var key = fontKey(family, weight);
  if (key in fonts) return;
  fonts[key] = null;
  var styles = (WEIGHT_STYLES[weight] || []).concat(['Regular']);
  for (var i = 0; i < styles.length; i++) {
    var font = { family: family, style: styles[i] };
    try {
      await figma.loadFontAsync(font);
      if (i >= (WEIGHT_STYLES[weight] || []).length) warn('Font "' + family + '" has no style for weight ' + weight + ': drawn in Regular.');
      fonts[key] = font;
      return;
    } catch (e) {
      // Try the next style.
    }
  }
  warn('The font "' + family + '" is not available in Figma: its text is drawn in Inter Regular, its icons as empty squares.');
}

async function loadFonts(component) {
  var wanted = [];
  function collect(node) {
    if (node.typography) wanted.push([valueOf(node.typography.fontFamily), valueOf(node.typography.fontWeight)]);
    if (node.type === 'icon') wanted.push([valueOf(node.bind.fontFamily), valueOf(node.bind.fontWeight)]);
    (node.children || []).forEach(collect);
  }
  component.variants.forEach(function (v) { collect(v.root); });
  for (var i = 0; i < wanted.length; i++) await loadFont(wanted[i][0], wanted[i][1]);
}

// ---------------------------------------------------------------------------
// Drawing: a binding is a variable name; set its value (PLAN.values), then bind the variable
// ---------------------------------------------------------------------------

var variables = {};

/** The resolved value of a binding in the default mode. */
function valueOf(name) {
  return PLAN.values[name];
}

function bindVariable(node, field, name) {
  var variable = variables[name];
  if (!variable) return warn('No variable "' + name + '" for ' + field + '.');
  try {
    node.setBoundVariable(field, variable);
  } catch (e) {
    warn('Could not bind ' + field + ' to "' + name + '": ' + e.message);
  }
}

/** Sets a field to a value (width and height through resize). */
function setField(node, field, value) {
  try {
    if (field === 'width') node.resize(value, node.height);
    else if (field === 'height') node.resize(node.width, value);
    else if (field === 'lineHeight') node.lineHeight = { unit: 'PIXELS', value: value };
    else if (field === 'letterSpacing') node.letterSpacing = { unit: 'PIXELS', value: value };
    // An opacity variable holds a percentage, as Figma reads it; the layer property is 0-1.
    else if (field === 'opacity') node.opacity = value / 100;
    else node[field] = value;
  } catch (e) {
    warn('Could not set ' + field + ' on ' + node.name + ': ' + e.message);
  }
}

function solid(name) {
  var c = valueOf(name);
  var paint = { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: c.a };
  var variable = variables[name];
  if (!variable) {
    warn('No variable "' + name + '" for a color.');
    return paint;
  }
  return figma.variables.setBoundVariableForPaint(paint, 'color', variable);
}

var SIDES = ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'];

/** Paints, values computed from tokens (`set`) and bound fields (`bind`) of a node. */
function applyFields(node, spec) {
  if (spec.fills) node.fills = [solid(spec.fills)];
  else if (spec.type === 'frame' || spec.type === 'ellipse') node.fills = [];
  if (spec.strokes) {
    node.strokes = [solid(spec.strokes)];
    node.strokeAlign = spec.type === 'vector' ? 'CENTER' : 'INSIDE';
  }
  var bind = spec.bind || {};
  // A border on some sides only: the others are 0.
  if (SIDES.some(function (s) { return s in bind; })) SIDES.forEach(function (s) { setField(node, s, 0); });
  var set = spec.set || {};
  // A vector's path is drawn at its size: resizing it would stretch the mark to its bounds.
  var sized = function (field) { return spec.type !== 'vector' || (field !== 'width' && field !== 'height'); };
  Object.keys(set).filter(sized).forEach(function (field) { setField(node, field, set[field]); });
  Object.keys(bind).filter(sized).forEach(function (field) {
    if (field !== 'fontFamily' && field !== 'fontWeight') setField(node, field, valueOf(bind[field]));
    bindVariable(node, field, bind[field]);
  });
  // A bound size stays the size: an auto layout frame would otherwise hug its children.
  if (node.layoutMode !== undefined && node.layoutMode !== 'NONE') {
    if (bind.width) node.layoutSizingHorizontal = 'FIXED';
    if (bind.height) node.layoutSizingVertical = 'FIXED';
  }
}

/** Width and height: HUG, FILL (in an auto layout parent) or a fixed number of pixels. */
function applySizing(node, spec, parent) {
  var inLayout = !!parent && parent.layoutMode !== undefined && parent.layoutMode !== 'NONE';
  var autoLayout = node.layoutMode !== undefined && node.layoutMode !== 'NONE';
  [['width', 'layoutSizingHorizontal'], ['height', 'layoutSizingVertical']].forEach(function (pair) {
    var want = spec[pair[0]];
    if (want === undefined) return;
    try {
      if (typeof want === 'number') {
        setField(node, pair[0], want);
        if (inLayout || autoLayout) node[pair[1]] = 'FIXED';
      } else if (want !== 'FILL' || inLayout) {
        node[pair[1]] = want;
      }
    } catch (e) {
      warn('Could not size ' + node.name + ' (' + pair[0] + ' ' + want + '): ' + e.message);
    }
  });
}

function drawText(spec) {
  var text = figma.createText();
  text.name = spec.name;
  var t = spec.typography;
  var font = t ? fonts[fontKey(valueOf(t.fontFamily), valueOf(t.fontWeight))] : null;
  text.fontName = font || FALLBACK_FONT;
  text.characters = spec.text;
  text.textAutoResize = spec.width === 'FILL' ? 'HEIGHT' : 'WIDTH_AND_HEIGHT';
  if (spec.textDecoration) text.textDecoration = spec.textDecoration;
  if (t) {
    if (t.lineHeight) text.lineHeight = t.lineHeight;
    text.fontSize = valueOf(t.fontSize);
    if (t.letterSpacing) text.letterSpacing = { unit: 'PIXELS', value: valueOf(t.letterSpacing) };
    ['fontSize', 'letterSpacing', 'fontFamily', 'fontWeight'].forEach(function (field) {
      if (t[field] && (font || field === 'fontSize' || field === 'letterSpacing')) bindVariable(text, field, t[field]);
    });
  }
  applyFields(text, { type: 'text', fills: spec.fills, bind: spec.bind, set: spec.set });
  return text;
}

function drawIcon(spec) {
  var bind = spec.bind;
  var font = fonts[fontKey(valueOf(bind.fontFamily), valueOf(bind.fontWeight))];
  if (!font) {
    // No icon font in this file: a square of the icon size holds the place of the glyph.
    var box = figma.createFrame();
    box.name = spec.name;
    box.fills = [];
    if (spec.fills) box.strokes = [solid(spec.fills)];
    ['width', 'height'].forEach(function (field) {
      setField(box, field, valueOf(bind[field]));
      bindVariable(box, field, bind[field]);
    });
    return box;
  }
  var text = figma.createText();
  text.name = spec.name;
  text.fontName = font;
  text.characters = spec.glyph;
  text.textAutoResize = 'NONE';
  text.textAlignHorizontal = 'CENTER';
  text.textAlignVertical = 'CENTER';
  applyFields(text, { type: 'icon', fills: spec.fills, bind: bind, set: spec.set });
  return text;
}

function drawShape(spec) {
  var node = spec.type === 'ellipse' ? figma.createEllipse() : figma.createVector();
  node.name = spec.name;
  if (spec.type === 'vector') {
    var size = (spec.set && spec.set.width) || (spec.bind && spec.bind.width && valueOf(spec.bind.width)) || 24;
    var scale = size / 24;
    var data = spec.path.replace(/-?\d*\.?\d+/g, function (n) { return String(+(parseFloat(n) * scale).toFixed(3)); });
    node.vectorPaths = [{ windingRule: 'NONE', data: data }];
    if (spec.strokeCap) node.strokeCap = spec.strokeCap;
  }
  applyFields(node, spec);
  if (spec.arc) {
    // A stroked open arc closes as a pie in Figma: draw the stroke as a filled ring sector instead.
    var weight = spec.bind && spec.bind.strokeWeight ? valueOf(spec.bind.strokeWeight) : (spec.set && spec.set.strokeWeight) || 0;
    var inner = node.width > 0 && spec.strokes ? Math.max(0, 1 - (2 * weight) / node.width) : 0;
    if (spec.strokes) {
      node.fills = [solid(spec.strokes)];
      node.strokes = [];
    }
    node.arcData = { startingAngle: spec.arc[0] * 2 * Math.PI, endingAngle: spec.arc[1] * 2 * Math.PI, innerRadius: inner };
  }
  return node;
}

/** A variant of another component's set, matched by its variant property values. */
function drawInstance(spec) {
  var set = sets[spec.component];
  if (!set) {
    warn('No component set for "' + spec.component + '": its instances are left out.');
    return null;
  }
  var variant = set.children.find(function (c) {
    var props = c.variantProperties || {};
    return Object.keys(spec.variant).every(function (k) { return props[k] === String(spec.variant[k]); });
  });
  if (!variant) {
    warn('No variant of "' + spec.component + '" matches ' + JSON.stringify(spec.variant) + '.');
    return null;
  }
  var instance = variant.createInstance();
  instance.name = spec.name;
  var texts = spec.texts || {};
  var props = instance.componentProperties || {};
  Object.keys(texts).forEach(function (name) {
    var key = Object.keys(props).find(function (k) { return k.split('#')[0] === name; });
    if (!key) return warn('"' + spec.component + '" has no property "' + name + '".');
    var change = {};
    change[key] = texts[name];
    instance.setProperties(change);
  });
  return instance;
}

function drawFrame(spec, isRoot) {
  var node = isRoot ? figma.createComponent() : figma.createFrame();
  node.name = spec.name;
  node.clipsContent = false;
  if (spec.layout) {
    node.layoutMode = spec.layout;
    node.primaryAxisSizingMode = 'AUTO';
    node.counterAxisSizingMode = 'AUTO';
    var align = spec.align || {};
    node.primaryAxisAlignItems = align.primary || 'MIN';
    node.counterAxisAlignItems = align.counter || 'MIN';
    // CSS border-box: the border takes room inside the box, before the padding.
    try {
      node.strokesIncludedInLayout = true;
    } catch (e) {
      warn('Strokes not included in the layout (' + e.message + '): borders overlap the padding.');
    }
  }
  applyFields(node, spec);
  return node;
}

/**
 * Draws a node and its subtree, appended to `parent`; collects in `refs` the nodes that show a
 * component property. `out` pairs every drawn node with its spec, for `finish`.
 */
function drawNode(spec, parent, refs, out, isRoot) {
  var node;
  if (spec.type === 'frame') node = drawFrame(spec, isRoot);
  else if (spec.type === 'text') node = drawText(spec);
  else if (spec.type === 'icon') node = drawIcon(spec);
  else if (spec.type === 'instance') node = drawInstance(spec);
  else node = drawShape(spec);
  if (!node) return null;
  if (parent) parent.appendChild(node);
  (spec.children || []).forEach(function (child) { drawNode(child, node, refs, out, false); });
  applySizing(node, spec, parent);
  if (spec.textProperty && node.type === 'TEXT') refs.push({ node: node, property: spec.textProperty, field: 'characters' });
  if (spec.visibleProperty) refs.push({ node: node, property: spec.visibleProperty, field: 'visible' });
  out.push({ node: node, spec: spec });
  return node;
}

/** Absolute positions, then focus rings: once the whole tree is laid out (children first). */
function finish(drawn) {
  drawn.forEach(function (d) {
    var spec = d.spec;
    var node = d.node;
    var parent = node.parent;
    if (!spec.absolute || !parent) return;
    if (parent.layoutMode && parent.layoutMode !== 'NONE') node.layoutPositioning = 'ABSOLUTE';
    if (spec.absolute.x !== undefined) node.x = spec.absolute.x === 'center' ? (parent.width - node.width) / 2 : spec.absolute.x;
    if (spec.absolute.y !== undefined) node.y = spec.absolute.y === 'center' ? (parent.height - node.height) / 2 : spec.absolute.y;
  });
  drawn.forEach(function (d) {
    if (d.spec.focusRing) drawFocusRing(d.node, d.spec.focusRing);
  });
}

function drawFocusRing(node, ring) {
  var offset = valueOf(ring.offset);
  var radius = typeof node.topLeftRadius === 'number' ? node.topLeftRadius : 0;
  var frame = figma.createFrame();
  frame.name = 'focus-ring';
  frame.fills = [];
  node.appendChild(frame);
  if (node.layoutMode && node.layoutMode !== 'NONE') frame.layoutPositioning = 'ABSOLUTE';
  frame.resize(node.width + 2 * offset, node.height + 2 * offset);
  frame.x = -offset;
  frame.y = -offset;
  frame.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
  frame.strokes = [solid(ring.stroke)];
  frame.strokeAlign = 'OUTSIDE';
  setField(frame, 'strokeWeight', valueOf(ring.strokeWeight));
  bindVariable(frame, 'strokeWeight', ring.strokeWeight);
  // The outline follows the border radius, pushed out by the offset: a sum Figma cannot bind.
  // upstream(figma): no expression in a variable binding.
  frame.cornerRadius = radius + offset;
  frame.locked = true;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

/** Component id -> its component set in this file (drawn now or kept), for instances. */
var sets = {};

async function findPage(name) {
  var page = figma.root.children.find(function (p) { return p.name === name; });
  if (!page) {
    page = figma.createPage();
    page.name = name;
  }
  await page.loadAsync();
  return page;
}

/** Offsets of a grid's cells along one axis: each cell as large as its largest variant. */
function offsets(sizes, gutter, gap) {
  var out = [];
  var at = gutter;
  for (var i = 0; i < sizes.length; i++) {
    out.push(at);
    at += (sizes[i] || 0) + gap;
  }
  out.push(at - gap + gutter);
  return out;
}

async function drawComponent(plan, progress) {
  var page = await findPage(plan.page);
  var existing = page.children.find(function (n) { return n.type === 'COMPONENT_SET' && n.name === plan.name; });
  if (existing) {
    sets[plan.id] = existing;
    warn('"' + plan.name + '" already exists on the page "' + plan.page + '": kept as it is (delete it to draw it again).');
    return null;
  }
  await figma.setCurrentPageAsync(page);
  await loadFonts(plan);

  var drawn = [];
  for (var i = 0; i < plan.variants.length; i++) {
    var variant = plan.variants[i];
    var refs = [];
    var nodes = [];
    var node = drawNode(variant.root, null, refs, nodes, true);
    node.name = variant.name;
    finish(nodes);
    drawn.push({ node: node, refs: refs, variant: variant });
    if ((i + 1) % PROGRESS_EVERY === 0) {
      progress(i + 1);
      await tick();
    }
  }
  var set = figma.combineAsVariants(drawn.map(function (d) { return d.node; }), page);
  set.name = plan.name;
  set.description = plan.description + ' Quantum ' + plan.id + ' ' + plan.version + '.';
  set.setSharedPluginData('quantum', 'component', JSON.stringify({ id: plan.id, version: plan.version }));
  sets[plan.id] = set;

  var widths = [];
  var heights = [];
  drawn.forEach(function (d) {
    widths[d.variant.column] = Math.max(widths[d.variant.column] || 0, d.node.width);
    heights[d.variant.row] = Math.max(heights[d.variant.row] || 0, d.node.height);
  });
  var xs = offsets(widths, 40, 24);
  var ys = offsets(heights, 40, 24);
  drawn.forEach(function (d) {
    d.node.x = xs[d.variant.column];
    d.node.y = ys[d.variant.row] + ((heights[d.variant.row] || 0) - d.node.height) / 2;
  });
  set.resizeWithoutConstraints(xs[xs.length - 1], ys[ys.length - 1]);

  plan.properties.filter(function (p) { return p.kind !== 'VARIANT'; }).forEach(function (property) {
    var targets = [];
    drawn.forEach(function (d) {
      d.refs.forEach(function (r) { if (r.property === property.name) targets.push(r); });
    });
    if (!targets.length) return;
    var key = set.addComponentProperty(property.name, property.kind, property.default);
    targets.forEach(function (r) {
      var refs = {};
      var current = r.node.componentPropertyReferences || {};
      Object.keys(current).forEach(function (k) { refs[k] = current[k]; });
      refs[r.field] = key;
      r.node.componentPropertyReferences = refs;
    });
  });
  return set;
}

// ---------------------------------------------------------------------------

async function main() {
  figma.showUI(__html__, { width: 380, height: 560, themeColors: true, title: 'Quantum components' });
  var total = PLAN.components.reduce(function (n, c) { return n + c.variants.length; }, 0);
  var vars = PLAN.variables;
  post({ type: 'variables', status: 'running' });
  await tick();
  variables = await syncVariables(vars);
  post({ type: 'variables', status: 'done', detail: vars.variables.length + ' in ' + vars.collections.length + ' collections' });
  try {
    await figma.loadFontAsync(FALLBACK_FONT);
  } catch (e) {
    warn('The fallback font Inter Regular is not available: a text whose font is missing cannot be drawn.');
  }
  var count = { done: 0, kept: 0, failed: 0, variants: 0 };
  var last = null;
  for (var i = 0; i < PLAN.components.length; i++) {
    var component = PLAN.components[i];
    var report = function (status, drawnCount, error) {
      post({ type: 'component', id: component.id, name: component.name, status: status, drawn: drawnCount, total: component.variants.length, totalVariants: total, error: error });
    };
    report('running', 0);
    await tick();
    try {
      var set = await drawComponent(component, function (n) { report('running', n); });
      if (set) {
        count.done += 1;
        count.variants += set.children.length;
        last = set;
      } else {
        count.kept += 1;
      }
      report(set ? 'done' : 'kept', component.variants.length);
    } catch (e) {
      // One component failing leaves the others to draw.
      count.failed += 1;
      warn(component.name + ' could not be drawn: ' + e.message);
      report('failed', 0, e.message);
    }
  }
  if (last) figma.viewport.scrollAndZoomIntoView([last]);
  var parts = [count.done ? plural(count.done, 'component') + ' drawn (' + plural(count.variants, 'variant') + ')' : 'no component drawn'];
  if (count.kept) parts.push(count.kept + ' kept');
  if (count.failed) parts.push(count.failed + ' failed');
  parts.push(plural(vars.variables.length, 'variable'));
  end(parts.join(', ') + '.' + (warnings.length ? ' ' + plural(warnings.length, 'warning') + ', see the console.' : ''));
}

function plural(n, word) {
  return n + ' ' + word + (n === 1 ? '' : 's');
}

/** Shows the summary in the window, which closes the plugin when its Close button is pressed. */
function end(summary, error) {
  warnings.forEach(function (w) { console.warn('Quantum: ' + w); });
  figma.ui.onmessage = function (msg) {
    if (msg && msg.type === 'close') figma.closePlugin('Quantum: ' + summary);
  };
  post({ type: 'finished', summary: summary, warnings: warnings, error: error || null });
  figma.notify('Quantum: ' + summary, { timeout: 6000 });
}

main().catch(function (e) {
  end(e.message, e.message);
});
