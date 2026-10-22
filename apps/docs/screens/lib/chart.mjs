/**
 * Static charts for screens: an SVG drawn at render time from the data, colored by screens.css
 * with the semantic data visualisation tokens (dataviz.*), with a text alternative.
 * There is no Chart component or data visualisation foundation yet: screens list it as a gap.
 */
import { el, text } from './ds.mjs';

const W = 720;
const H = 200;
const round = (n) => Math.round(n * 10) / 10;

/** A smooth path through points (Catmull-Rom converted to cubic Béziers). */
function smooth(points) {
  if (points.length < 2) return '';
  let d = `M${round(points[0][0])},${round(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, p1, p2, p3] = [points[i - 1] ?? points[i], points[i], points[i + 1], points[i + 2] ?? points[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${round(c1[0])},${round(c1[1])} ${round(c2[0])},${round(c2[1])} ${round(p2[0])},${round(p2[1])}`;
  }
  return d;
}

/**
 * A stacked area chart. series: [{ label, values }], bottom first; labels: one per value (x axis).
 * Returns the plot (svg, hidden from assistive technology) and its x axis; the caller gives the
 * figure its text alternative (summary()).
 */
export function stackedArea({ series, labels, ticks = 6 }) {
  const n = labels.length;
  const totals = labels.map((_, i) => series.reduce((sum, s) => sum + s.values[i], 0));
  const max = Math.max(...totals) * 1.1;
  const x = (i) => (n === 1 ? 0 : (i / (n - 1)) * W);
  const y = (v) => H - (v / max) * H;
  let base = labels.map(() => 0);
  const layers = series.map((s, k) => {
    const top = base.map((b, i) => b + s.values[i]);
    const upper = top.map((v, i) => [x(i), y(v)]);
    const lower = base.map((v, i) => [x(i), y(v)]).reverse();
    const line = smooth(upper);
    // The area runs along this layer's line, then back along the layer below.
    const area = `${line} ${smooth(lower).replace(/^M/, 'L')} Z`;
    base = top;
    return el('g', { class: 'scr-chart__series', 'data-series': String(k + 1) }, el('path', { class: 'scr-chart__area', d: area }), el('path', { class: 'scr-chart__line', d: line }));
  });
  const step = Math.max(1, Math.round((n - 1) / (ticks - 1)));
  const tickIdx = labels.map((_, i) => i).filter((i) => i % step === 0);
  return [
    el('svg', { class: 'scr-chart__svg', viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' },
      [0.25, 0.5, 0.75].map((f) => el('line', { class: 'scr-chart__grid', x1: 0, x2: W, y1: round(H * f), y2: round(H * f) })),
      layers,
    ),
    el('div', { class: 'scr-chart__axis', 'aria-hidden': 'true' }, tickIdx.map((i) => el('span', {}, text(labels[i])))),
  ];
}

/** The legend of a chart: one swatch per series, in the series' color. */
export function legend(series) {
  return el('ul', { class: 'scr-chart__legend' }, series.map((s, k) => el('li', { 'data-series': String(k + 1) }, el('span', { class: 'scr-chart__swatch', 'aria-hidden': 'true' }), text(s.label))));
}
