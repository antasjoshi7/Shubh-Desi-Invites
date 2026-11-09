// Scans public/fonts and public/backgrounds and writes data/fonts.json and data/backgrounds.json.
// Run it after adding files:   npm run assets
// (It also runs automatically before every build.)
//
// Fonts:       unzips .zip files, keeps Regular (+ Bold if there is one), converts to .woff2,
//              moves licence/readme files to public/fonts/licenses/, deletes the zips.
// Backgrounds: makes a web-sized JPG and a thumbnail of each image, and analyses it:
//              its plain "paper" colour (so the app can recolour it), its main colour,
//              and where the text should sit.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { unzipSync } from "fflate";
import wawoff2 from "wawoff2";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONTS_DIR = path.join(ROOT, "public/fonts");
const LICENSES_DIR = path.join(FONTS_DIR, "licenses");
const BG_DIR = path.join(ROOT, "public/backgrounds");
const GEN_DIR = path.join(ROOT, "public/generated");
const DATA_DIR = path.join(ROOT, "data");

// How each font feels. The picker shows them in this order: traditional, script, display, modern.
// Add new fonts here. Fonts not listed count as "modern".
//   skip = not usable for typing English (hidden from the picker)
const FONT_STYLES = {
  // open licence (OFL), safe to use anywhere
  "Playfair Display": "traditional",
  "Cinzel": "traditional",
  "Cormorant Garamond": "traditional",
  "Marcellus": "traditional",
  "Yeseva One": "traditional",
  "Italiana": "traditional",
  "Rozha One": "traditional",
  "Yatra One": "traditional",
  "Gilda Display": "traditional",
  "Bodoni Moda": "traditional",
  "Cinzel Decorative": "traditional",
  "Pinyon Script": "script",
  "Alex Brush": "script",
  "Parisienne": "script",
  "Allura": "script",
  "Petit Formal Script": "script",
  "Amita": "script",
  // free for personal use only / unknown licence
  "Taj Mahal": "traditional",
  "Royal": "traditional",
  "Royal Glamour": "traditional",
  "Dehanna": "traditional",
  "Kharisna": "display",
  "Royal Moscow": "display",
  "Arivndr Pomt": "skip", // legacy Hindi font: English letters turn into Devanagari
};
const STYLE_ORDER = ["traditional", "script", "display", "modern"];
// within a group, keep the order of FONT_STYLES above (unlisted fonts go last)
const listed = (f) => {
  const i = Object.keys(FONT_STYLES).indexOf(f.family);
  return i === -1 ? 999 : i;
};

const slug = (s) => s.toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const titleCase = (s) => s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();

// ---------------------------------------------------------------- fonts

const SKIP_FONT = /italic|oblique|hollow|upright|outline|variable|\bvf\b|\[wght|thin|light|medium|semibold|semi-bold|extrabold|extra-bold|black|heavy|condensed/i;
const LICENSE_FILE = /licen[cs]e|ofl|readme|read me|terms|info\.txt/i;

async function toWoff2(buf, ext) {
  if (ext === ".woff2") return buf;
  return Buffer.from(await wawoff2.compress(buf));
}

async function saveFont(family, role, buf, ext) {
  const out = path.join(FONTS_DIR, `${slug(family)}-${role}.woff2`);
  fs.writeFileSync(out, await toWoff2(buf, ext));
  console.log(`  font  ${family} (${role})`);
}

async function unpackZip(zipPath) {
  const family = titleCase(path.basename(zipPath, ".zip").replace(/[-_]font$/i, ""));
  const files = unzipSync(new Uint8Array(fs.readFileSync(zipPath)));
  let regular = null;
  let bold = null;
  for (const [name, data] of Object.entries(files)) {
    if (name.startsWith("__MACOSX") || name.endsWith("/")) continue;
    const base = path.basename(name);
    const ext = path.extname(base).toLowerCase();
    if ([".ttf", ".otf", ".woff2"].includes(ext)) {
      if (SKIP_FONT.test(base)) continue;
      const pick = { data: Buffer.from(data), ext };
      // prefer .ttf over .otf when a zip has both
      if (/bold/i.test(base)) {
        if (!bold || ext === ".ttf") bold = pick;
      } else if (!regular || ext === ".ttf") {
        regular = pick;
      }
    } else if (LICENSE_FILE.test(base)) {
      fs.mkdirSync(LICENSES_DIR, { recursive: true });
      fs.writeFileSync(path.join(LICENSES_DIR, `${slug(family)}-${base}`), Buffer.from(data));
    }
  }
  if (!regular && bold) [regular, bold] = [bold, null];
  if (!regular) {
    console.warn(`  ! no usable font in ${path.basename(zipPath)}, left as is`);
    return;
  }
  await saveFont(family, "regular", regular.data, regular.ext);
  if (bold) await saveFont(family, "bold", bold.data, bold.ext);
  fs.unlinkSync(zipPath);
}

async function buildFonts() {
  console.log("Fonts");
  for (const f of fs.readdirSync(FONTS_DIR)) {
    const full = path.join(FONTS_DIR, f);
    const ext = path.extname(f).toLowerCase();
    if (ext === ".zip") {
      await unpackZip(full);
    } else if (ext === ".ttf" || ext === ".otf") {
      // loose font file: convert, then remove the original
      const base = path.basename(f, ext);
      const family = titleCase(base.replace(/[-_ ]?(regular|bold)$/i, ""));
      const role = /bold$/i.test(base) ? "bold" : "regular";
      await saveFont(family, role, fs.readFileSync(full), ext);
      fs.unlinkSync(full);
    }
  }

  // Collect every .woff2 into fonts.json
  const families = new Map();
  for (const f of fs.readdirSync(FONTS_DIR)) {
    const m = f.match(/^(.*)-(regular|bold)\.woff2$/);
    if (!m) continue;
    const entry = families.get(m[1]) ?? { id: m[1], family: titleCase(m[1]) };
    entry[m[2]] = `/fonts/${f}`;
    families.set(m[1], entry);
  }
  // fonts fetched by scripts/fetch-fonts.mjs: their real names, looks and Hindi letters
  const metaFile = path.join(DATA_DIR, "font-meta.json");
  const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, "utf8")) : {};
  const fonts = [...families.values()]
    .filter((f) => f.regular)
    .map((f) => {
      const m = meta[f.id];
      const family = m?.family ?? f.family;
      return { ...f, family, style: FONT_STYLES[family] ?? m?.style ?? "modern", ...(m?.hindi ? { hindi: true } : {}) };
    })
    .filter((f) => f.style !== "skip")
    .sort((a, b) => STYLE_ORDER.indexOf(a.style) - STYLE_ORDER.indexOf(b.style) || listed(a) - listed(b));
  return fonts;
}

// ---------------------------------------------------------------- colour helpers

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToHex(h, s, l) {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return "#" + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, "0")).join("");
}

const toHex = ([r, g, b]) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const round5 = (x) => Math.round(x / 5) * 5;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// ---------------------------------------------------------------- background analysis

// Busyness thresholds (average edge strength behind the text area).
// Below CALM the centre is quiet; above BUSY the design is heavy (used to rank backgrounds).
// (Set from the first 62 backgrounds: roughly the quietest and busiest quarter.)
const CALM = 0.045;
const BUSY = 0.115;

async function analyse(file) {
  const AW = 90, AH = 160; // same 9:16 crop the video uses
  const { data } = await sharp(file).resize(AW, AH, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });

  const lum = new Float32Array(AW * AH);
  const bins = Array.from({ length: 12 }, () => ({ w: 0, r: 0, g: 0, b: 0 }));
  let sumR = 0, sumG = 0, sumB = 0, colourful = 0;
  let cR = 0, cG = 0, cB = 0, cL = 0, cN = 0;
  const votes = new Map();

  for (let y = 0; y < AH; y++) {
    for (let x = 0; x < AW; x++) {
      const i = (y * AW + x) * 3;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      lum[y * AW + x] = L;
      sumR += r; sumG += g; sumB += b;
      const [h, s, l] = rgbToHsl(r, g, b);
      if (s > 0.18 && l > 0.12 && l < 0.92) {
        colourful++;
        const bin = bins[Math.floor(h / 30) % 12];
        const w = s;
        bin.w += w; bin.r += r * w; bin.g += g * w; bin.b += b * w;
      }
      // centre region, where the text usually sits
      if (x > AW * 0.18 && x < AW * 0.82 && y > AH * 0.25 && y < AH * 0.75) {
        cR += r; cG += g; cB += b; cL += L; cN++;
        // count rough colours to find the plain "paper" colour behind the design
        const key = (r >> 4) * 256 + (g >> 4) * 16 + (b >> 4);
        const v = votes.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
        v.n++; v.r += r; v.g += g; v.b += b;
        votes.set(key, v);
      }
    }
  }

  // busyness: average brightness change between neighbouring pixels in the centre
  let edges = 0, eN = 0;
  for (let y = Math.floor(AH * 0.25); y < AH * 0.75; y++) {
    for (let x = Math.floor(AW * 0.18); x < AW * 0.82; x++) {
      const i = y * AW + x;
      edges += Math.abs(lum[i] - lum[i + 1]) + Math.abs(lum[i] - lum[i + AW]);
      eN++;
    }
  }
  const busyness = edges / eN;

  // how much decoration sits in the top band vs the bottom band (middle columns only)
  const band = (y0, y1) => {
    let e = 0, n = 0;
    for (let y = Math.floor(AH * y0); y < AH * y1 - 1; y++) {
      for (let x = Math.floor(AW * 0.15); x < AW * 0.85; x++) {
        const i = y * AW + x;
        e += Math.abs(lum[i] - lum[i + 1]) + Math.abs(lum[i] - lum[i + AW]);
        n++;
      }
    }
    return e / n;
  };
  const topBusy = band(0.03, 0.33);
  const bottomBusy = band(0.67, 0.97);

  const total = AW * AH;
  const colourShare = colourful / total;
  const top = bins.reduce((a, b) => (b.w > a.w ? b : a));
  const average = [sumR / total, sumG / total, sumB / total];
  const primaryRgb = colourShare > 0.12 && top.w > 0 ? [top.r / top.w, top.g / top.w, top.b / top.w] : average;
  const [hue, sat] = rgbToHsl(...primaryRgb);
  const centreRgb = [cR / cN, cG / cN, cB / cN];
  const centreL = cL / cN;
  const top1 = [...votes.values()].reduce((a, b) => (b.n > a.n ? b : a));
  const paperRgb = [top1.r / top1.n, top1.g / top1.n, top1.b / top1.n];

  // two careful ways to find the clear area; whichever finds more room wins
  const byColour = clearAreaByColour(data, AW, AH, paperRgb);
  const byRegion = await clearArea(file);
  const safe = byRegion.w * byRegion.h > byColour.w * byColour.h ? byRegion : byColour;

  return { primaryRgb, hue, sat, colourShare, centreRgb, centreL, paperRgb, busyness, topBusy, bottomBusy, safe };
}

// The clear area in the middle of the design, where text can sit without touching the decoration.
// Returns the tallest centred rectangle that's wide enough for text, as fractions of the page.
// It grows a region outward from the middle of the page through colour that changes only
// gradually (a plain panel, a watercolour wash, a soft sky) and stops at sharp changes: a panel's
// outline, the edge of a flower, a patterned border. Works on a softened 180x320 copy.
async function clearArea(file) {
  const AW = 180, AH = 320;
  const { data } = await sharp(file).resize(AW, AH, { fit: "cover" }).removeAlpha().blur(1.6).raw().toBuffer({ resolveWithObject: true });
  const px = (i) => [data[i * 3], data[i * 3 + 1], data[i * 3 + 2]];
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  // the seed colour: the median of a small patch in the middle
  const patch = [];
  for (let y = AH * 0.42; y < AH * 0.58; y += 2) for (let x = AW * 0.4; x < AW * 0.6; x += 2) patch.push(px(Math.floor(y) * AW + Math.floor(x)));
  const seed = [0, 1, 2].map((c) => patch.map((p) => p[c]).sort((a, b) => a - b)[patch.length >> 1]);
  const STEP = 7; // most a colour may change between neighbouring pixels
  const DRIFT = 95; // and how far it may wander from the middle's colour overall
  const inside = new Uint8Array(AW * AH);
  const queue = [];
  for (let y = Math.floor(AH * 0.45); y < AH * 0.55; y++)
    for (let x = Math.floor(AW * 0.45); x < AW * 0.55; x++) {
      const i = y * AW + x;
      if (dist(px(i), seed) < 30) {
        inside[i] = 1;
        queue.push(i);
      }
    }
  while (queue.length) {
    const i = queue.pop();
    const x = i % AW, y = (i / AW) | 0;
    const c = px(i);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= AW || ny >= AH) continue;
      const n = ny * AW + nx;
      if (inside[n]) continue;
      const nc = px(n);
      if (dist(nc, c) < STEP && dist(nc, seed) < DRIFT) {
        inside[n] = 1;
        queue.push(n);
      }
    }
  }
  const deco = new Uint8Array(AW * AH);
  for (let i = 0; i < AW * AH; i++) deco[i] = inside[i] ? 0 : 1;
  return largestCentredRect(deco, AW, AH);
}

// The clear area by colour alone: anything clearly unlike the plain paper colour is decoration.
function clearAreaByColour(data, AW, AH, paperRgb) {
  const raw = new Float32Array(AW * AH);
  for (let i = 0; i < AW * AH; i++) {
    const dr = data[i * 3] - paperRgb[0], dg = data[i * 3 + 1] - paperRgb[1], db = data[i * 3 + 2] - paperRgb[2];
    raw[i] = Math.sqrt(dr * dr + dg * dg + db * db) > 42 ? 1 : 0;
  }
  // ignore paper texture and specks: a pixel counts as decoration when most of its 3x3 block is
  const deco = new Uint8Array(AW * AH);
  for (let y = 0; y < AH; y++) {
    for (let x = 0; x < AW; x++) {
      let n = 0, c = 0;
      for (let j = -1; j <= 1; j++)
        for (let i = -1; i <= 1; i++) {
          const xx = x + i, yy = y + j;
          if (xx < 0 || yy < 0 || xx >= AW || yy >= AH) continue;
          n++;
          c += raw[yy * AW + xx];
        }
      deco[y * AW + x] = c / n > 0.4 ? 1 : 0;
    }
  }
  return largestCentredRect(deco, AW, AH);
}

// The tallest rectangle centred on the page that holds no decoration and is wide enough for text.
function largestCentredRect(deco, AW, AH) {
  // each row: how far the clear space reaches out from the centre (the smaller of the two sides)
  const cx = AW / 2;
  const half = new Float32Array(AH);
  for (let y = 0; y < AH; y++) {
    let l = 0, r = 0;
    while (cx - l - 1 >= 0 && !deco[y * AW + Math.floor(cx - l - 1)]) l++;
    while (cx + r < AW && !deco[y * AW + Math.floor(cx + r)]) r++;
    half[y] = Math.min(l, r);
  }
  // tallest band whose narrowest row is still wide enough; wider bands score a little higher
  const MIN = AW * 0.42;
  let best = { score: 0, top: Math.round(AH * 0.3), bottom: Math.round(AH * 0.7), w: AW * 0.7 };
  for (let top = 0; top < AH; top++) {
    let w = Infinity;
    for (let bottom = top; bottom < AH; bottom++) {
      w = Math.min(w, half[bottom] * 2);
      if (w < MIN) break;
      const score = (bottom - top + 1) * Math.min(w, AW * 0.75);
      if (score > best.score) best = { score, top, bottom, w };
    }
  }
  const pad = Math.round(AW / 45); // keep a little distance from the decoration
  const w = Math.max(MIN, best.w - pad * 2);
  const r3 = (v) => Math.round(v * 1000) / 1000;
  return {
    x: r3((AW - w) / 2 / AW),
    y: r3((best.top + pad) / AH),
    w: r3(w / AW),
    h: r3(Math.max(4, best.bottom - best.top + 1 - pad * 2) / AH),
  };
}

// Where the text should sit: away from whichever end is clearly more decorated.
function recommendLayout(a) {
  const ratio = (a.topBusy + 0.004) / (a.bottomBusy + 0.004);
  if (ratio > LAYOUT_RATIO) return "bottom";
  if (ratio < 1 / LAYOUT_RATIO) return "top";
  return "centered";
}
const LAYOUT_RATIO = 1.8;

// Higher = shown first: calm text area + warm, traditional colours (reds, pinks, oranges, golds).
function suitability(a) {
  const calm = 1 - clamp((a.busyness - CALM) / (BUSY - CALM), 0, 1);
  const warmHue = a.hue >= 330 || a.hue <= 60;
  const traditional = warmHue ? clamp(a.sat * 1.6, 0, 1) : 0.15;
  return Math.round((0.55 * calm + 0.45 * traditional) * 100) / 100;
}

// Background categories, in the order the library shows them.
// Name new files recraft-<category>-NN.png to put them in a category.
const CATEGORY_ORDER = [
  "sangeet", "haldi", "mehendi", "wedding", "reception", "minimal",
  "peacocks", "elephants", "birds", "horses", "florals", "marigold", "lotus", "temple",
  "palaces", "paisley", "borders", "lights", "drawn", "illustrated",
];

// Hand-measured text areas for designs with a drawn panel (see data/safe-overrides.json).
const SAFE_OVERRIDES = fs.existsSync(path.join(DATA_DIR, "safe-overrides.json"))
  ? JSON.parse(fs.readFileSync(path.join(DATA_DIR, "safe-overrides.json"), "utf8"))
  : {};

async function buildBackgrounds() {
  console.log("Backgrounds");
  fs.mkdirSync(path.join(GEN_DIR, "bg"), { recursive: true });
  fs.mkdirSync(path.join(GEN_DIR, "thumbs"), { recursive: true });

  const files = fs.readdirSync(BG_DIR).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
  const out = [];
  const used = new Set();
  for (const f of files) {
    const src = path.join(BG_DIR, f);
    const id = slug(f);
    used.add(id);
    const web = path.join(GEN_DIR, "bg", id + ".jpg");
    const thumb = path.join(GEN_DIR, "thumbs", id + ".jpg");
    const stale = (p) => !fs.existsSync(p) || fs.statSync(p).mtimeMs < fs.statSync(src).mtimeMs;

    if (stale(web)) {
      await sharp(src).resize({ height: 1280, withoutEnlargement: true }).jpeg({ quality: 85, mozjpeg: true }).toFile(web);
    }
    if (stale(thumb)) {
      await sharp(src).resize(180, 320, { fit: "cover" }).jpeg({ quality: 70, mozjpeg: true }).toFile(thumb);
    }

    const a = await analyse(src);
    // "simple-…" and "recraft-…" files are designs with a clear middle
    const kind = /^(simple|recraft)-/.test(id) ? "simple" : "illustrated";
    // category from the file name: recraft-<category>-NN.png (see CATEGORY_ORDER)
    const category = id.match(/^recraft-([a-z]+)-\d+$/)?.[1] ?? (id.startsWith("simple-") ? "drawn" : "illustrated");
    out.push({
      id,
      kind,
      category,
      src: `/generated/bg/${id}.jpg`,
      thumb: `/generated/thumbs/${id}.jpg`,
      primary: toHex(a.primaryRgb),
      centre: toHex(a.centreRgb),
      busyness: Math.round(a.busyness * 1000) / 1000,
      paper: toHex(a.paperRgb),
      layout: recommendLayout(a),
      safe: SAFE_OVERRIDES[id] ?? a.safe,
      score: suitability(a),
    });
  }

  // remove generated files whose source image was deleted
  for (const sub of ["bg", "thumbs"]) {
    for (const f of fs.readdirSync(path.join(GEN_DIR, sub))) {
      if (!used.has(f.replace(/\.jpg$/, ""))) fs.unlinkSync(path.join(GEN_DIR, sub, f));
    }
  }

  // grouped by category (in CATEGORY_ORDER), best-suited first within each
  const rank = (c) => (CATEGORY_ORDER.includes(c) ? CATEGORY_ORDER.indexOf(c) : CATEGORY_ORDER.length);
  out.sort((a, b) => rank(a.category) - rank(b.category) || b.score - a.score);
  console.log(`  ${out.length} backgrounds`);
  return out;
}

// ---------------------------------------------------------------- main

fs.mkdirSync(DATA_DIR, { recursive: true });
const fonts = await buildFonts();
fs.writeFileSync(path.join(DATA_DIR, "fonts.json"), JSON.stringify(fonts, null, 2) + "\n");
const backgrounds = await buildBackgrounds();
fs.writeFileSync(path.join(DATA_DIR, "backgrounds.json"), JSON.stringify(backgrounds, null, 2) + "\n");
console.log(`Wrote data/fonts.json (${fonts.length}) and data/backgrounds.json (${backgrounds.length})`);
