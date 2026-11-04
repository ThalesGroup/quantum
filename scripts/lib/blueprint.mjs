/**
 * Blueprints: the sketch the docs site draws to tell a component apart (its thumbnail in the
 * component list, the head of its platform pages), never a rendering of it. A blueprint is a
 * small JSON document (apps/docs/content/components/<id>.blueprint.json) that places parts on a
 * grid of cells, like the parts of a circuit board: `size` is the drawing in cells, each part
 * names one piece of PIECES with its place in cells (whole or half cells) and its options.
 *
 *   { "size": [13, 2], "parts": [{ "box": [0, 0, 6, 2], "fill": true }, { "text": [1, 1, 4], "strong": true }] }
 *
 * renderBlueprint draws it as one SVG in screen pixels for a cell size: the grid starts at the
 * drawing's top left corner, strokes are whole pixels on the pixel grid (odd widths on half
 * pixels), so every outline lies on a grid line, crisp, at any page width. Colors are classes of
 * the site's stylesheet (`site-bp__*`, apps/docs/src/styles/site.css), never values. Zero-dependency,
 * shared by validate.mjs, the tests and the docs site (src/components/Blueprint.astro).
 */

/** Glyphs, drawn in their cell box (coordinates 0-1): strokes, or a filled or hatched shape. */
const GLYPHS = {
  'chevron-down': { d: 'M.3 .42 L.5 .6 L.7 .42' },
  'chevron-up': { d: 'M.3 .58 L.5 .4 L.7 .58' },
  'chevron-right': { d: 'M.42 .3 L.6 .5 L.42 .7' },
  'chevron-left': { d: 'M.58 .3 L.4 .5 L.58 .7' },
  check: { d: 'M.28 .52 L.44 .68 L.74 .34' },
  plus: { d: 'M.26 .5 H.74 M.5 .26 V.74' },
  minus: { d: 'M.26 .5 H.74' },
  close: { d: 'M.3 .3 L.7 .7 M.7 .3 L.3 .7' },
  search: { d: 'M.59 .59 L.76 .76', circle: [0.43, 0.43, 0.21] },
  star: { d: 'M.5 .14 L.59 .4 L.87 .4 L.64 .57 L.73 .84 L.5 .68 L.27 .84 L.36 .57 L.13 .4 L.41 .4 Z', fill: 'ink' },
  heart: { d: 'M.5 .82 L.2 .52 C.08 .4 .12 .2 .3 .2 C.4 .2 .46 .26 .5 .33 C.54 .26 .6 .2 .7 .2 C.88 .2 .92 .4 .8 .52 Z', fill: 'hatch' },
};

/**
 * The pieces a part can be: its place (`at`, numbers in cells: x, y, then width and height, or a
 * length, or a size) and its options. A part's place must fit in the drawing.
 */
export const PIECES = {
  /** A surface: x, y, width, height. `fill` hatches it (the emphasised one), `dashed` (a placeholder), `radius` (`xs`, the default; `pill`; `round`), `edge` (an accent bar on its start side), `outline: false` (a highlighted row). */
  box: { at: ['x', 'y', 'width', 'height'], options: { fill: 'boolean', dashed: 'boolean', radius: ['xs', 'pill', 'round'], edge: 'boolean', outline: 'boolean' } },
  /** A line of text, never words: x, y of its middle, length. A trace from a pad; `strong` (a label, a title) is a solid strip; `soft` a dashed one (a placeholder). */
  text: { at: ['x', 'y', 'length'], options: { strong: 'boolean', soft: 'boolean' } },
  /** A glyph in its cells: x, y, then the size (1, the default, or more: drawn on its keyline square). */
  glyph: { at: ['x', 'y'], options: { name: Object.keys(GLYPHS), size: 'number' } },
  /** A checkbox, the case of one cell, checked when `on`. */
  check: { at: ['x', 'y'], options: { on: 'boolean' } },
  /** A radio button, the circle of one cell, selected when `on`. */
  radio: { at: ['x', 'y'], options: { on: 'boolean' } },
  /** A switch, two cells by one, on when `on`. */
  switch: { at: ['x', 'y'], options: { on: 'boolean' } },
  /** A track (progress, range): x, y of its middle, length; `value` (0-1) fills it, `knob` puts a thumb at the end of the fill. */
  track: { at: ['x', 'y', 'length'], options: { value: 'number', knob: 'boolean' } },
  /** A spinner: x, y, size, a ring with one segment drawn. */
  ring: { at: ['x', 'y', 'size'] },
  /** A rule: x, y of its middle, length (a divider). */
  rule: { at: ['x', 'y', 'length'] },
  /** A block of media (an image): x, y, width, height, a frame with its diagonals. */
  media: { at: ['x', 'y', 'width', 'height'] },
  /** A via, a pad with its hole, in one cell (a status dot, an icon spot). */
  via: { at: ['x', 'y'] },
};

const pieceOf = (part) => Object.keys(PIECES).find((p) => p in part);

/** The smallest box that holds a part (its extent inside the box), or null: the part is on the paper. */
function holder(boxes, part, piece) {
  const [x, y, w, h] = extent(piece, part);
  const inside = boxes.filter((b) => b !== part && x >= b.box[0] && y >= b.box[1] && x + w <= b.box[0] + b.box[2] && y + h <= b.box[1] + b.box[3]);
  return inside.sort((a, b) => a.box[2] * a.box[3] - b.box[2] * b.box[3])[0] ?? null;
}

/** Width and height a part takes, in cells (its box, for the bounds check). */
function extent(piece, part) {
  const [x, y, a, b] = part[piece];
  switch (piece) {
    case 'box': case 'media': return [x, y, a, b];
    case 'text': case 'rule': return [x, y - 0.5, a, 1];
    case 'track': return [x, y - 0.5, a, 1];
    case 'ring': return [x, y, a, a];
    case 'glyph': return [x, y, part.size ?? 1, part.size ?? 1];
    case 'switch': return [x, y, 2, 1];
    default: return [x, y, 1, 1];
  }
}

/**
 * Problems of a blueprint document, as { level, message }: its size, each part's piece, place
 * (numbers in whole or half cells, inside the drawing) and options.
 */
export function checkBlueprint(doc) {
  const problems = [];
  const error = (message) => problems.push({ level: 'error', message });
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return [{ level: 'error', message: 'must be an object with "size" and "parts"' }];
  for (const key of Object.keys(doc)) if (!['size', 'parts'].includes(key)) error(`unknown key "${key}": a blueprint has "size" and "parts"`);
  const size = doc.size;
  const okSize = Array.isArray(size) && size.length === 2 && size.every((n) => Number.isInteger(n) && n >= 1 && n <= 24);
  if (!okSize) error('"size" must be [width, height] in whole cells (1-24)');
  if (!Array.isArray(doc.parts) || !doc.parts.length) {
    error('"parts" must list the parts it draws');
    return problems;
  }
  doc.parts.forEach((part, i) => {
    const where = `part ${i + 1}`;
    const pieces = Object.keys(PIECES).filter((p) => part && p in part);
    if (pieces.length !== 1) return error(`${where}: names ${pieces.length ? pieces.join(' and ') : 'no piece'}; one of ${Object.keys(PIECES).join(', ')}`);
    const piece = pieces[0];
    const def = PIECES[piece];
    const at = part[piece];
    if (!Array.isArray(at) || at.length !== def.at.length || !at.every((n) => typeof n === 'number' && Number.isInteger(n * 2))) {
      return error(`${where}: ${piece} takes [${def.at.join(', ')}] in whole or half cells`);
    }
    for (const [key, value] of Object.entries(part)) {
      if (key === piece) continue;
      const type = def.options?.[key];
      if (!type) error(`${where}: ${piece} has no option "${key}"`);
      else if (Array.isArray(type) ? !type.includes(value) : typeof value !== type) error(`${where}: "${key}" must be ${Array.isArray(type) ? type.join(' or ') : `a ${type}`}`);
    }
    if (piece === 'glyph' && !GLYPHS[part.name]) error(`${where}: glyph needs a "name": ${Object.keys(GLYPHS).join(', ')}`);
    if (piece === 'track' && part.value !== undefined && !(part.value >= 0 && part.value <= 1)) error(`${where}: "value" is between 0 and 1`);
    const [x, y, w, h] = extent(piece, part);
    if ((w <= 0 || h <= 0)) error(`${where}: ${piece} has no extent`);
    if (okSize && (x < 0 || y < 0 || x + w > size[0] || y + h > size[1])) error(`${where}: ${piece} goes outside the drawing (${size.join(' x ')} cells)`);
  });
  return problems;
}

const num = (n) => String(Math.round(n * 100) / 100);
const attrs = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false).map(([k, v]) => ` ${k}="${typeof v === 'number' ? num(v) : v}"`).join('');
const el = (tag, o) => `<${tag}${attrs(o)}/>`;
const even = (n) => 2 * Math.round(n / 2);

/**
 * A glyph path of its 0-1 box placed at x, y and scaled to `size` pixels (commands M L H V C Z),
 * every point on a pixel, plus `offset` (half a pixel for an odd stroke width) so strokes are crisp.
 */
function placePath(d, x, y, size, offset = 0) {
  const at = (v) => num(Math.round(v) + offset);
  return d.replace(/([MLHVCZ])([^MLHVCZ]*)/g, (_, cmd, args) => {
    const n = args.trim() ? args.trim().split(/[\s,]+/).map(Number) : [];
    const mapped = n.map((v, i) => at(cmd === 'H' ? x + v * size : cmd === 'V' ? y + v * size : i % 2 ? y + v * size : x + v * size));
    return `${cmd}${mapped.join(' ')}`;
  });
}

/**
 * The blueprint as SVG markup, in screen pixels for `cell` pixels per cell.
 * @param {{ size: number[], parts: object[] }} doc a checked blueprint
 * @param {{ cell: number, uid: string, construction?: boolean }} options `uid` makes its pattern ids
 *   unique in the page; `construction` draws the centre lines through it (the sheet of a page head).
 */
export function renderBlueprint(doc, { cell, uid, construction = false }) {
  const [W, H] = doc.size;
  const px = (n) => n * cell;
  // Hairlines: every outline and trace is one pixel; glyphs a little heavier in a page head.
  const s = 1;
  const gs = cell >= 20 ? 1.5 : 1;
  // A stroke of odd width sits on half pixels to fill whole pixels; the inset keeps it inside its box.
  const o = (w) => (w % 2 ? 0.5 : 0);
  const id = (name) => `site-bp-${uid}-${name}`;
  // Two inks: white on a component's surface, blue on the paper. A part is on the paper when no
  // solid box holds it (a dashed box is a placeholder drawn on the paper); its elements go in a
  // `site-bp__on-sheet` group, whose class swaps the ink, and its hatching is the paper's.
  let onSheet = false;
  const hatch = () => `url(#${id(onSheet ? 'sheet-hatch' : 'hatch')})`;
  const line = (cls = '') => `site-bp__line${cls ? ` site-bp__line--${cls}` : ''}`;
  const out = [];
  const defs = [
    `<pattern id="${id('minor')}" width="${cell}" height="${cell}" patternUnits="userSpaceOnUse"><path class="site-bp__grid" d="M.5 0 V${cell} M0 .5 H${cell}"/></pattern>`,
    `<pattern id="${id('major')}" width="${5 * cell}" height="${5 * cell}" patternUnits="userSpaceOnUse"><path class="site-bp__grid site-bp__grid--major" d="M.5 0 V${5 * cell} M0 .5 H${5 * cell}"/></pattern>`,
    `<pattern id="${id('hatch')}" width="${cell / 2}" height="${cell / 2}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path class="site-bp__line site-bp__line--faint" stroke-width="1" d="M.5 0 V${cell / 2}"/></pattern>`,
    `<pattern id="${id('sheet-hatch')}" width="${cell / 2}" height="${cell / 2}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path class="site-bp__sheet-hatch" stroke-width="1" d="M.5 0 V${cell / 2}"/></pattern>`,
  ];
  // The grid, far past the drawing (the stage clips it), from the drawing's corner.
  const far = 60 * cell;
  out.push(el('rect', { x: -far, y: -far, width: px(W) + 2 * far, height: px(H) + 2 * far, fill: `url(#${id('minor')})` }));
  out.push(el('rect', { x: -far, y: -far, width: px(W) + 2 * far, height: px(H) + 2 * far, fill: `url(#${id('major')})` }));
  if (construction) {
    const dash = `${cell / 2} ${cell / 4} ${cell / 8} ${cell / 4}`;
    const cx = Math.round(px(W) / 2) + 0.5;
    const cy = Math.round(px(H) / 2) + 0.5;
    // Centre marks outside the drawing only, as on a drawing: they never cross its parts.
    const m = 2.5 * cell;
    const g = cell / 2;
    out.push('<g class="site-bp__on-sheet">');
    out.push(el('path', { class: line('faint'), 'stroke-width': 1, 'stroke-dasharray': dash, d: `M${num(-m)} ${num(cy)} H${num(-g)} M${num(px(W) + g)} ${num(cy)} H${num(px(W) + m)} M${num(cx)} ${num(-m)} V${num(-g)} M${num(cx)} ${num(px(H) + g)} V${num(px(H) + m)}` }));
    out.push('</g>');
  }

  const surface = (x, y, w, h, r, { fill = false, dashed = false, outline = true, stroke = s, cls = '' } = {}) => {
    const i = outline ? o(stroke) : 0;
    const box = { x: x + i, y: y + i, width: w - 2 * i, height: h - 2 * i, rx: Math.max(0, r - i) };
    out.push(el('rect', { ...box, class: 'site-bp__paper' }));
    if (fill) out.push(el('rect', { ...box, fill: hatch() }));
    if (outline) out.push(el('rect', { ...box, class: line(cls), 'stroke-width': stroke, 'stroke-dasharray': dashed ? `${2 * stroke} ${2 * stroke}` : undefined }));
  };

  const boxes = doc.parts.filter((p) => 'box' in p);
  for (const part of doc.parts) {
    const piece = pieceOf(part);
    const at = part[piece];
    onSheet = piece === 'box' ? Boolean(part.dashed) : !holder(boxes, part, piece) || Boolean(holder(boxes, part, piece).dashed);
    if (onSheet) out.push('<g class="site-bp__on-sheet">');
    switch (piece) {
      case 'box': {
        const [x, y, w, h] = at.map(px);
        const r = part.radius === 'pill' ? h / 2 : part.radius === 'round' ? Math.min(w, h) / 2 : Math.round(cell * 0.2);
        // A surface on the paper is edged in the dark blue, a shade darker than its fill: a white
        // line against the light paper would halo it. One inside another surface keeps the white.
        const loose = !part.dashed && !holder(boxes, part, piece);
        surface(x, y, w, h, r, { fill: part.fill, dashed: part.dashed, outline: part.outline !== false, cls: part.dashed ? 'mid' : loose ? 'edge' : '' });
        if (part.edge) {
          const e = Math.max(2, even(cell * 0.15));
          // Inside the surface, clear of its edge: an accent bar, never a white line on the paper.
          const inset = Math.round(cell * 0.25);
          out.push(el('path', { class: line(), 'stroke-width': e, d: `M${num(x + inset + e / 2)} ${num(y + inset + e / 2)} V${num(y + h - inset - e / 2)}` }));
        }
        break;
      }
      case 'text': {
        const [x, y, len] = at.map(px);
        if (part.strong) {
          // A label or a title: a thin solid bar, square-cut, on whole pixels.
          const h = Math.max(2, even(cell * 0.2));
          out.push(el('rect', { x, y: y - h / 2, width: len, height: h, rx: 1, class: 'site-bp__ink' }));
        } else if (part.soft) {
          const h = even(cell * 0.4);
          out.push(el('rect', { x: x + 0.5, y: y - h / 2 + 0.5, width: len - 1, height: h - 1, rx: h / 2 - 0.5, class: line('mid'), 'stroke-width': 1, 'stroke-dasharray': '2 2' }));
        } else {
          const r = Math.round(cell * 0.18);
          const cx = x + r + s;
          const ty = y + o(s);
          out.push(el('path', { class: line('mid'), 'stroke-width': s, d: `M${num(cx + r)} ${num(ty)} H${num(x + len - s)}` }));
          out.push(el('circle', { cx, cy: ty, r, class: 'site-bp__paper site-bp__line', 'stroke-width': s }));
        }
        break;
      }
      case 'glyph': {
        const g = GLYPHS[part.name];
        const n = part.size ?? 1;
        const [x, y] = at.map(px);
        const G = px(n);
        const d = placePath(g.d, x, y, G, g.fill === 'ink' ? 0 : o(gs));
        if (n > 1) out.push(el('rect', { x: x + 0.5, y: y + 0.5, width: G - 1, height: G - 1, class: line('faint'), 'stroke-width': 1, 'stroke-dasharray': `${cell / 5} ${cell / 5}` }));
        if (g.fill === 'ink') out.push(el('path', { d, class: 'site-bp__ink' }));
        else {
          if (g.fill === 'hatch') out.push(el('path', { d, fill: hatch() }));
          out.push(el('path', { d, class: line(), 'stroke-width': gs }));
        }
        if (g.circle) out.push(el('circle', { cx: x + g.circle[0] * G, cy: y + g.circle[1] * G, r: g.circle[2] * G, class: line(), 'stroke-width': gs }));
        break;
      }
      case 'check': {
        // A case of the grid: its outline is the cell's, checked hatched with its mark.
        const [x, y] = at.map(px);
        surface(x, y, cell, cell, 0, { fill: part.on });
        if (part.on) out.push(el('path', { d: placePath(GLYPHS.check.d, x, y, cell, o(gs)), class: line(), 'stroke-width': gs }));
        break;
      }
      case 'radio': {
        // The circle inscribed in its cell, touching the grid lines; selected, a dot in it.
        const [x, y] = at.map(px);
        const c = { cx: x + cell / 2, cy: y + cell / 2 };
        out.push(el('circle', { ...c, r: cell / 2 - 0.5, class: 'site-bp__paper site-bp__line', 'stroke-width': s }));
        if (part.on) out.push(el('circle', { ...c, r: Math.round(cell * 0.2), class: 'site-bp__ink' }));
        break;
      }
      case 'switch': {
        // Two cells by one, its outline on theirs; the knob inscribed in a cell, at the end when on.
        const [x, y] = at.map(px);
        surface(x, y, 2 * cell, cell, cell / 2, { fill: part.on });
        const r = cell / 2 - Math.max(2, Math.round(cell * 0.15));
        out.push(el('circle', { cx: part.on ? x + 1.5 * cell : x + cell / 2, cy: y + cell / 2, r, class: part.on ? 'site-bp__ink' : 'site-bp__paper site-bp__line', 'stroke-width': part.on ? undefined : s }));
        break;
      }
      case 'track': {
        const [x, y, len] = at.map(px);
        const h = Math.max(2, even(cell * 0.2));
        out.push(el('rect', { x: x + 0.5, y: y - h / 2 + 0.5, width: len - 1, height: h - 1, rx: 1, class: line('mid'), 'stroke-width': 1 }));
        const filled = Math.round(len * (part.value ?? 0));
        if (filled) out.push(el('rect', { x, y: y - h / 2, width: filled, height: h, rx: 1, class: 'site-bp__ink' }));
        if (part.knob) {
          out.push(el('circle', { cx: x + filled, cy: y, r: cell * 0.45, class: 'site-bp__paper site-bp__line', 'stroke-width': s }));
          out.push(el('circle', { cx: x + filled, cy: y, r: cell * 0.14, class: 'site-bp__ink' }));
        }
        break;
      }
      case 'ring': {
        const [x, y, n] = at.map(px);
        const w = Math.max(2, even(cell * 0.15));
        const r = n / 2 - w / 2 - cell * 0.1;
        const cx = x + n / 2;
        const cy = y + n / 2;
        out.push(el('circle', { cx, cy, r, class: line('faint'), 'stroke-width': w }));
        const a0 = -Math.PI / 2;
        const a1 = a0 + (Math.PI * 2) / 3;
        out.push(el('path', { class: line(), 'stroke-width': w, d: `M${num(cx + r * Math.cos(a0))} ${num(cy + r * Math.sin(a0))} A${num(r)} ${num(r)} 0 0 1 ${num(cx + r * Math.cos(a1))} ${num(cy + r * Math.sin(a1))}` }));
        break;
      }
      case 'rule': {
        const [x, y, len] = at.map(px);
        out.push(el('path', { class: line(), 'stroke-width': s, 'stroke-linecap': 'butt', d: `M${num(x)} ${num(y + o(s))} H${num(x + len)}` }));
        break;
      }
      case 'media': {
        const [x, y, w, h] = at.map(px);
        out.push(el('rect', { x: x + 0.5, y: y + 0.5, width: w - 1, height: h - 1, class: line('mid'), 'stroke-width': 1 }));
        out.push(el('path', { class: line('mid'), 'stroke-width': 1, d: `M${num(x)} ${num(y)} L${num(x + w)} ${num(y + h)} M${num(x + w)} ${num(y)} L${num(x)} ${num(y + h)}` }));
        break;
      }
      case 'via': {
        const [x, y] = at.map(px);
        out.push(el('circle', { cx: x + cell / 2, cy: y + cell / 2, r: cell * 0.32, class: 'site-bp__ink' }));
        out.push(el('circle', { cx: x + cell / 2, cy: y + cell / 2, r: cell * 0.13, class: 'site-bp__paper' }));
        break;
      }
    }
    if (onSheet) out.push('</g>');
  }
  return `<svg class="site-bp__svg" xmlns="http://www.w3.org/2000/svg" width="${px(W)}" height="${px(H)}" viewBox="0 0 ${px(W)} ${px(H)}" aria-hidden="true" focusable="false"><defs>${defs.join('')}</defs>${out.join('')}</svg>`;
}
