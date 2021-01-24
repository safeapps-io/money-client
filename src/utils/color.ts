import { randBetween } from './random';

/**
 * We use HSL because we want colors to have high contract and saturation which is
 * sort of impossible to do with plain old RGB.
 *
 * Generates a random color with a good contrast in HEX format.
 */
export const generateRandomColor = () =>
  hslToRgb(randBetween(0, 1), randBetween(0.5, 0.8), randBetween(0.4, 0.8));

/**
 * Source: https://stackoverflow.com/a/36722579/3720087
 */
const hue2rgb = function hue2rgb(p: number, q: number, t: number) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  },
  toHex = (val: number) => {
    let r = val.toString(16);
    return r.length === 1 ? `0` + r : r;
  };

export const hslToRgb = (h: number, s: number, l: number) => {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s,
    p = 2 * l - q,
    r = hue2rgb(p, q, h + 1 / 3),
    g = hue2rgb(p, q, h),
    b = hue2rgb(p, q, h - 1 / 3);

  return '#' + [r, g, b].map(v => toHex(Math.round(v * 255))).join('');
};
