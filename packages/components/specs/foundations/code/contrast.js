/**
 * Contrast between two colors, as WCAG defines it.
 * Every category of the syntax shows here: keywords, variables,
 * functions, classes, strings, numbers and comments.
 */
import { readFile } from 'node:fs/promises';

const HEX = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
const MINIMUM = { text: 4.5, large: 3, ui: 3 };

export class Color {
  #channels;

  constructor(r, g, b, alpha = 1) {
    this.#channels = [r, g, b].map((c) => Math.min(1, Math.max(0, c)));
    this.alpha = alpha;
  }

  static fromHex(hex) {
    const match = HEX.exec(hex.trim());
    if (!match) throw new TypeError(`"${hex}" is not a six-digit hex color`);
    const channels = match.slice(1).map((pair) => parseInt(pair, 16) / 255);
    return new Color(...channels);
  }

  get luminance() {
    const linear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const [r, g, b] = this.#channels.map(linear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
}

export function contrast(foreground, background) {
  const [light, dark] = [foreground, background]
    .map((color) => color.luminance)
    .sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

export async function audit(file, { kind = 'text', signal } = {}) {
  const text = await readFile(file, { encoding: 'utf8', signal });
  const pairs = JSON.parse(text);
  const failing = [];
  for (const { fg, bg, name = 'unnamed' } of pairs) {
    const ratio = contrast(Color.fromHex(fg), Color.fromHex(bg));
    if (ratio < MINIMUM[kind]) {
      failing.push({ name, ratio: Number(ratio.toFixed(2)) });
    }
  }
  return failing.length === 0 ? null : failing;
}
