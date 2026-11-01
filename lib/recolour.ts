// Recolours a background: a new paper colour, a new colour for the decoration, and how
// strongly the decoration shows. Works on designs drawn on a plain colour ("paper").
//
// How: every pixel gets a "how much decoration is here" value from its distance to the
// paper colour. The decoration is recoloured (keeping its light and shade), then laid over
// the paper colour at the chosen opacity.

import { getImage } from "./assets";
import { hexToRgb } from "./colors";
import type { BgColours } from "./types";

type Base = { w: number; h: number; pixels: Uint8ClampedArray; mask: Float32Array; paper: [number, number, number]; meanL: number };

const bases = new Map<string, Base>();
const designs = new Map<string, Uint8ClampedArray>();
const finals = new Map<string, HTMLCanvasElement>(); // most recent last
const MAX_FINALS = 12;

// The background ready to draw: the original image, or a recoloured copy.
export function styledBackground(src: string, paperHex: string, c: BgColours): CanvasImageSource | undefined {
  const img = getImage(src);
  if (!img) return undefined;
  if (!c.paper && !c.design && c.opacity >= 0.999) return img;

  const key = `${src}|${c.paper}|${c.design}|${c.opacity.toFixed(2)}`;
  const hit = finals.get(key);
  if (hit) {
    finals.delete(key);
    finals.set(key, hit);
    return hit;
  }

  const base = getBase(src, img, paperHex);
  const deco = c.design ? getDesign(src, base, c.design) : base.pixels;
  const paper = c.paper ? hexToRgb(c.paper) : base.paper;

  const canvas = document.createElement("canvas");
  canvas.width = base.w;
  canvas.height = base.h;
  const ctx = canvas.getContext("2d")!;
  const out = ctx.createImageData(base.w, base.h);
  const o = out.data;
  const n = base.w * base.h;
  for (let i = 0; i < n; i++) {
    const a = base.mask[i] * c.opacity;
    const j = i * 4;
    o[j] = paper[0] + (deco[j] - paper[0]) * a;
    o[j + 1] = paper[1] + (deco[j + 1] - paper[1]) * a;
    o[j + 2] = paper[2] + (deco[j + 2] - paper[2]) * a;
    o[j + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);

  finals.set(key, canvas);
  if (finals.size > MAX_FINALS) finals.delete(finals.keys().next().value!);
  return canvas;
}

// Pixels + decoration mask of the original image (worked out once per background).
function getBase(src: string, img: HTMLImageElement, paperHex: string): Base {
  const cached = bases.get(src);
  if (cached) return cached;
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const pixels = ctx.getImageData(0, 0, w, h).data;
  const paper = hexToRgb(paperHex);
  const mask = new Float32Array(w * h);
  let lSum = 0;
  let lW = 0;
  for (let i = 0; i < w * h; i++) {
    const j = i * 4;
    const dr = pixels[j] - paper[0];
    const dg = pixels[j + 1] - paper[1];
    const db = pixels[j + 2] - paper[2];
    const d = Math.sqrt(dr * dr + dg * dg + db * db) / 441.7;
    const m = smoothstep(0.035, 0.16, d);
    mask[i] = m;
    if (m > 0.5) {
      lSum += (Math.max(pixels[j], pixels[j + 1], pixels[j + 2]) + Math.min(pixels[j], pixels[j + 1], pixels[j + 2])) / 510;
      lW++;
    }
  }
  const base = { w, h, pixels, mask, paper, meanL: lW ? lSum / lW : 0.5 };
  bases.set(src, base);
  return base;
}

// The decoration repainted in `colour`: its hue and saturation, keeping the original shading.
function getDesign(src: string, base: Base, colour: string): Uint8ClampedArray {
  const key = src + "|" + colour;
  const cached = designs.get(key);
  if (cached) return cached;
  const [th, ts, tl] = rgbToHsl(...hexToRgb(colour));
  const shift = (tl - base.meanL) * 0.8;
  const p = base.pixels;
  const out = new Uint8ClampedArray(p.length);
  const rgb: [number, number, number] = [0, 0, 0];
  for (let j = 0; j < p.length; j += 4) {
    const [, s, l] = rgbToHsl(p[j], p[j + 1], p[j + 2]);
    hslToRgb(th, s + (ts - s) * 0.8, clamp01(l + shift), rgb);
    out[j] = rgb[0];
    out[j + 1] = rgb[1];
    out[j + 2] = rgb[2];
    out[j + 3] = 255;
  }
  designs.set(key, out);
  if (designs.size > 8) designs.delete(designs.keys().next().value!);
  return out;
}

// ---------- colour maths ----------

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}

function hslToRgb(h: number, s: number, l: number, out: [number, number, number]) {
  if (s <= 0) {
    out[0] = out[1] = out[2] = l * 255;
    return;
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  out[0] = f(h + 1 / 3) * 255;
  out[1] = f(h) * 255;
  out[2] = f(h - 1 / 3) * 255;
}
