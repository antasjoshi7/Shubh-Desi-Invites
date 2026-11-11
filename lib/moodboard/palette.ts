// Colour maths for the mood board: reads the main colours out of a photo, blends many photos into
// one palette, and gives every colour a name people actually use ("Marigold", "Rani pink").
// No AI and no network: plain arithmetic that runs on the phone. No imports, so the sample-photo
// script (scripts/build-moodboard-samples.mjs) can use the very same code.

export type RGB = [number, number, number];

export const hexToRgb = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const rgbToHex = (c: RGB): string =>
  "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");

const lin = (c: number) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

// OKLab: distances in it match how different two colours look to the eye.
export function oklab(c: RGB): [number, number, number] {
  const R = lin(c[0]), G = lin(c[1]), B = lin(c[2]);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

const labDist = (a: [number, number, number], b: [number, number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

export const dist = (a: string, b: string) => labDist(oklab(hexToRgb(a)), oklab(hexToRgb(b)));

export const lightness = (hex: string) => oklab(hexToRgb(hex))[0];

export const mix = (a: string, b: string, t: number): string => {
  const x = hexToRgb(a), y = hexToRgb(b);
  return rgbToHex([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]);
};

// Dark or light text, whichever reads on this colour.
export const inkOn = (hex: string) => (lightness(hex) > 0.68 ? "#1d1a16" : "#ffffff");

type Cluster = { r: number; g: number; b: number; n: number; score: number; lab: [number, number, number] };

function cluster(points: { rgb: RGB; n: number; score: number }[], radius: number, cap: number): Cluster[] {
  const out: Cluster[] = [];
  for (const p of points) {
    const lab = oklab(p.rgb);
    let hit: Cluster | null = null;
    for (const c of out) {
      if (labDist(c.lab, lab) < radius) { hit = c; break; }
    }
    if (hit) {
      const t = hit.n + p.n;
      hit.r = (hit.r * hit.n + p.rgb[0] * p.n) / t;
      hit.g = (hit.g * hit.n + p.rgb[1] * p.n) / t;
      hit.b = (hit.b * hit.n + p.rgb[2] * p.n) / t;
      hit.n = t;
      hit.score += p.score;
      hit.lab = oklab([hit.r, hit.g, hit.b]);
    } else if (out.length < cap) {
      out.push({ r: p.rgb[0], g: p.rgb[1], b: p.rgb[2], n: p.n, score: p.score, lab });
    }
  }
  return out;
}

function pick(clusters: Cluster[], n: number, gap: number): Cluster[] {
  const sorted = [...clusters].sort((a, b) => b.score - a.score);
  const out: Cluster[] = [];
  // relax the "must look different" rule until there are enough colours
  for (let g = gap; out.length < Math.min(n, sorted.length) && g > 0.02; g *= 0.7) {
    for (const c of sorted) {
      if (out.length >= n) break;
      if (out.includes(c)) continue;
      if (out.every((o) => labDist(o.lab, c.lab) >= g)) out.push(c);
    }
  }
  return out;
}

// The main colours of one picture. `data` is RGBA pixels (a small copy of the photo is plenty).
// Vivid colours count for more than greys, shadows and blown-out whites: a haldi photo should
// say "marigold", not "dark background".
export function extractPalette(data: Uint8ClampedArray | Uint8Array, n = 5): { colors: string[]; dom: string } {
  const bins = new Map<number, { r: number; g: number; b: number; n: number }>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 200) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bin = bins.get(key);
    if (bin) { bin.r += r; bin.g += g; bin.b += b; bin.n++; }
    else bins.set(key, { r, g, b, n: 1 });
  }
  const points = [...bins.values()].map((b) => {
    const rgb: RGB = [b.r / b.n, b.g / b.n, b.b / b.n];
    const lab = oklab(rgb);
    const chroma = Math.hypot(lab[1], lab[2]);
    const dull = lab[0] < 0.2 ? 0.12 : lab[0] > 0.975 ? 0.25 : lab[0] < 0.32 ? 0.5 : lab[0] < 0.45 ? 0.8 : 1;
    return { rgb, n: b.n, score: b.n * (0.05 + Math.pow(chroma * 6, 2)) * dull };
  }).sort((a, b) => b.score - a.score);
  if (!points.length) return { colors: ["#d9cfc1"], dom: "#d9cfc1" };
  const clusters = cluster(points, 0.075, 28);
  const chosen = pick(clusters, n, 0.12);
  const biggest = [...clusters].sort((a, b) => b.n - a.n)[0];
  return {
    colors: chosen.map((c) => rgbToHex([c.r, c.g, c.b])),
    dom: rgbToHex([biggest.r, biggest.g, biggest.b]),
  };
}

// One palette from many photos. Each entry is a photo's colours (most important first) and how
// much that photo should count (loved photos count more).
export function blendPalettes(entries: { colors: string[]; weight: number }[], n = 5): string[] {
  const rank = [1, 0.8, 0.6, 0.42, 0.3, 0.2];
  const points: { rgb: RGB; n: number; score: number }[] = [];
  for (const e of entries) {
    e.colors.forEach((hex, i) => {
      const rgb = hexToRgb(hex);
      const lab = oklab(rgb);
      const chroma = Math.hypot(lab[1], lab[2]);
      const w = e.weight * (rank[i] ?? 0.15);
      points.push({ rgb, n: w, score: w * (0.2 + Math.pow(chroma * 5, 2)) });
    });
  }
  if (!points.length) return [];
  points.sort((a, b) => b.score - a.score);
  return pick(cluster(points, 0.07, 40), n, 0.11).map((c) => rgbToHex([c.r, c.g, c.b]));
}

// Names families use for wedding colours, each with a typical shade.
const NAMES: [string, string][] = [
  ["Marigold", "#f2a20c"], ["Haldi yellow", "#f4c430"], ["Mango", "#ffb62e"], ["Lemon", "#f6e05e"], ["Mustard", "#c99a1e"],
  ["Saffron", "#f47a1f"], ["Tangerine", "#f28a3c"], ["Rust", "#b5502a"], ["Terracotta", "#c66a4a"], ["Copper", "#a8623a"],
  ["Peach", "#f7b995"], ["Apricot", "#f5a26b"], ["Coral", "#f0705a"], ["Salmon pink", "#f29488"],
  ["Sindoor red", "#c81e2c"], ["Bridal red", "#a8121f"], ["Tomato red", "#e0402e"], ["Maroon", "#6e1423"], ["Wine", "#5b1730"],
  ["Rani pink", "#d81b72"], ["Hot pink", "#ec3d8f"], ["Gulabi pink", "#f06ca0"], ["Rose", "#e58a9e"], ["Blush", "#f3c3c6"],
  ["Dusty rose", "#c98b8f"], ["Baby pink", "#f8d4de"], ["Magenta", "#b5187c"], ["Fuchsia", "#c9349b"],
  ["Mauve", "#b08aa6"], ["Lilac", "#c4a8dc"], ["Lavender", "#b9a5e0"], ["Jamun purple", "#4a2259"], ["Aubergine", "#3c1b3f"],
  ["Royal purple", "#6a2c91"], ["Violet", "#8050b8"],
  ["Indigo", "#2a2f7a"], ["Navy", "#1c2550"], ["Royal blue", "#2447b8"], ["Cobalt", "#2d5fd0"], ["Peacock blue", "#0d6f8c"],
  ["Sky blue", "#8cc5ea"], ["Powder blue", "#b9d3e8"], ["Firozi", "#1fb5b0"], ["Teal", "#17817c"], ["Sea green", "#4fb59a"],
  ["Mint", "#b5e3cb"], ["Pista green", "#b8d68a"], ["Parrot green", "#63b83c"], ["Mehendi green", "#7a8a2e"], ["Olive", "#6e6b2c"],
  ["Leaf green", "#3f8a3a"], ["Emerald", "#0f7a4f"], ["Bottle green", "#11503a"], ["Sage", "#a4b494"], ["Forest green", "#234a2c"],
  ["Ivory", "#f6efdf"], ["Cream", "#f3e4c4"], ["Champagne", "#e8d3a8"], ["Beige", "#dcc8a8"], ["Sand", "#cbb089"],
  ["Gold", "#d4a534"], ["Antique gold", "#b08a3c"], ["Bronze", "#8a6a34"], ["Caramel", "#b57a3e"], ["Tan", "#c49a6c"],
  ["Chocolate", "#56341f"], ["Coffee", "#6e4a34"], ["Walnut", "#7c5a3f"],
  ["Pearl white", "#f7f5f0"], ["Off white", "#e6e3de"], ["Soft grey", "#d2d2d2"], ["Silver grey", "#bfc2c6"], ["Dove grey", "#9a9a98"], ["Slate", "#5d6670"], ["Charcoal", "#33353a"], ["Kohl black", "#17161a"],
  ["Rose gold", "#d9a394"], ["Lotus pink", "#e9a7b8"], ["Onion pink", "#c9809c"], ["Plum", "#7a2a55"],
];
const NAME_LABS = NAMES.map(([name, hex]) => ({ name, lab: oklab(hexToRgb(hex)) }));

export function nameColor(hex: string): string {
  const lab = oklab(hexToRgb(hex));
  let best = NAME_LABS[0], bd = Infinity;
  for (const n of NAME_LABS) {
    // hue and strength matter more to a colour's name than how light it is
    const d = Math.hypot((n.lab[0] - lab[0]) * 0.7, (n.lab[1] - lab[1]) * 1.6, (n.lab[2] - lab[2]) * 1.6);
    if (d < bd) { bd = d; best = n; }
  }
  return best.name;
}

// "Marigold, Rani pink and Leaf green" (no name twice).
export function paletteSentence(colors: string[], max = 3): string {
  const names: string[] = [];
  for (const c of colors) {
    const n = nameColor(c);
    if (!names.includes(n)) names.push(n);
    if (names.length >= max) break;
  }
  if (!names.length) return "";
  const rest = names.slice(1).map((n) => n.toLowerCase());
  if (!rest.length) return names[0];
  return [names[0], ...rest.slice(0, -1)].join(", ") + " and " + rest[rest.length - 1];
}

// A difference hash: two copies of the same picture (even resized or re-saved) give nearly the
// same 64 bits. `grey` is 9 x 8 brightness values, row by row.
export function dhash(grey: ArrayLike<number>): string {
  let hex = "";
  for (let y = 0; y < 8; y++) {
    let byte = 0;
    for (let x = 0; x < 8; x++) byte = (byte << 1) | (grey[y * 9 + x] > grey[y * 9 + x + 1] ? 1 : 0);
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
}

export function hashDistance(a: string, b: string): number {
  let d = 0;
  for (let i = 0; i < 16; i += 2) {
    let x = parseInt(a.slice(i, i + 2), 16) ^ parseInt(b.slice(i, i + 2), 16);
    while (x) { d += x & 1; x >>= 1; }
  }
  return d;
}

// Screenshots from Instagram or Pinterest carry the app's bars above and below the picture.
// Given, for each row of the screenshot, whether it looks like flat app background, returns the
// rows that hold the picture, or null when there is nothing sensible to trim.
export function contentBand(flat: boolean[]): { top: number; bottom: number } | null {
  const h = flat.length;
  const bridge = Math.max(2, Math.round(h * 0.035));
  const best = { top: -1, bottom: -1 };
  let start = -1, lastBusy = -1;
  const consider = (a: number, b: number) => {
    if (best.top < 0 || b - a > best.bottom - best.top) { best.top = a; best.bottom = b; }
  };
  for (let y = 0; y < h; y++) {
    if (!flat[y]) {
      if (start < 0) start = y;
      lastBusy = y;
    } else if (start >= 0 && y - lastBusy > bridge) {
      consider(start, lastBusy);
      start = -1;
    }
  }
  if (start >= 0) consider(start, lastBusy);
  if (best.top < 0) return null;
  const { top, bottom } = best;
  const len = bottom - top;
  if (len < h * 0.28 || len > h * 0.9) return null;
  return { top: top / h, bottom: (bottom + 1) / h };
}
