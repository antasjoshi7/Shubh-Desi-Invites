// Cuts the motion elements out of the Recraft images in assets/elements and writes
// transparent WebP files to public/generated/elements plus data/elements.json.
// Run it after changing the source images:   npm run elements
//
// Each source image was made on a flat background colour (green, blue, magenta or white).
// The background is measured from the image's border, then removed with soft edges.
// Sheets with several items (petals, marigolds…) are split into one file per item.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT, "assets/elements");
const OUT_DIR = path.join(ROOT, "public/generated/elements");
const DATA_FILE = path.join(ROOT, "data/elements.json");

// name: what the app calls it. file: the Recraft export. split: one file per item on the sheet.
// columns: split the sheet into this many side-by-side items at the gaps between them (for items that touch).
// grow: how far apart (in 4px steps) bits can be and still count as one item (default 2).
// noChain: crop off a thin chain/string at the top (the app draws its own).
// white: the background is white and the drawing is dark lines (cut by darkness instead of colour).
// soft: soft-edged things like clouds, whose see-through edges are turned cream so no background tint shows.
// bg: the background colour, for sheets whose pieces touch the edges (so it can't be measured there).
// grow: how far apart bits can be and still count as one piece.
const SOURCES = [
  { name: "horse", file: "side-view-of-a-richly-decorated-indian-wedding-hor.png" },
  { name: "elephant", file: "side-view-of-a-richly-decorated-indian-wedding-ele (1).png" },
  { name: "parrot", file: "animation-sprite-sheet--the-same-green-indian-rose (1).png", split: true },
  { name: "peacock", file: "a-single-indian-peacock-standing--side-view-facing (1).png" },
  { name: "feather", file: "element-sheet--six-single-long-peacock-tail-feathe (1).png", columns: 5 },
  { name: "marigold", file: "element-sheet--nine-single-marigold-flower-heads-s (1).png", split: true },
  { name: "petal", file: "element-sheet--twelve-single-loose-rose-petals--so (1).png", split: true },
  { name: "petal-b", file: "element-sheet--twelve-single-loose-rose-petals--so.png", split: true },
  { name: "diya", file: "element-sheet--four-traditional-indian-clay-diya-o (1).png", split: true },
  { name: "lotus", file: "element-sheet--one-fully-open-pink-lotus-flower-se.png", split: true },
  { name: "kalash", file: "a-single-shiny-brass-kalash-pot--front-view--with- (1).png" },
  { name: "door", file: "a-single-tall-ornate-rajasthani-palace-door-panel-.png" },
  { name: "mehendi", file: "an-intricate-circular-mehendi-henna-mandala-design.png", white: true },
  { name: "skylantern", file: "element-sheet--three-glowing-paper-sky-lanterns-fo (1).png", split: true },
  { name: "butterfly", file: "element-sheet--three-ornate-butterflies-seen-from- (1).png", split: true, grow: 0 },
  { name: "lantern", file: "a-single-ornate-brass-indian-hanging-lantern-on-a-.png", noChain: true },
  { name: "cloud", file: "clouds.png", split: true, soft: true },
  // scene elements (assets/elements/new), the better of each pair Recraft made
  { name: "fan", file: "new/element-sheet--two-ornate-royal-rajasthani-hand-fa.png", split: true },
  { name: "chandelier", file: "new/element-sheet--three-ornate-antique-crystal-and-go.png", split: true },
  { name: "chandelier", file: "new/element-sheet--three-ornate-antique-crystal-and-go (1).png", split: true },
  { name: "bell", file: "new/element-sheet--five-ornate-brass-temple-bells-hang (1).png", split: true },
  { name: "corner", file: "new/element-sheet--two-lush-floral-corner-arrangements.png", split: true, grow: 6, bg: [221, 14, 134] },
  { name: "arch", file: "new/a-lush-semicircular-floral-arch-of-pink-roses--whi.png", bg: [192, 8, 97] },
  { name: "toran", file: "new/a-long-horizontal-toran-door-hanging-across-the-fu.png" },
  { name: "jasmine", file: "new/element-sheet--three-long-hanging-strings-of-white (1).png", split: true },
  { name: "egret", file: "new/element-sheet--five-flying-white-egrets-in-differe.png", split: true },
  { name: "paisley", file: "new/element-sheet--six-ornate-gold-foil-paisley--keri- (1).png", split: true },
  { name: "bloom", file: "new/element-sheet--nine-single-loose-flower-heads-for- (1).png", split: true },
  { name: "bloom", file: "new/element-sheet--nine-single-loose-flower-heads-for-.png", split: true },
  { name: "parasol", file: "new/a-single-ornate-royal-indian-ceremonial-parasol--c.png" },
  { name: "camel", file: "new/a-single-decorated-rajasthani-camel--side-view-wal (1).png" },
  { name: "rangoli", file: "new/a-single-circular-rangoli-mandala-seen-from-direct (1).png" },
  { name: "moon", file: "new/a-soft-glowing-golden-crescent-moon-with-delicate-.png", split: true },
  { name: "fish", file: "new/two-madhubani-folk-art-fish-facing-each-other-in-a (1).png" },
  { name: "palki", file: "new/doli.png" },
];

// Animals cut into parts so code can move their legs (a "cut-out" puppet).
// Coordinates are in the source image's pixels. Each part is a polygon; `cut` is where a leg meets the
// body: the leg keeps a soft-faded strip above it so no gap shows when it swings. `pivot` is the joint.
// `parent` = this part hangs from another (a lower leg from its upper leg). `far` = the far-side leg,
// drawn behind the body.
const RIGS = [
  {
    name: "horseRig",
    file: "side-view-of-a-richly-decorated-indian-wedding-hor.png",
    scale: 0.7,
    parts: [
      { name: "hindFar", poly: [[455, 450], [535, 450], [528, 578], [450, 578]], cut: 472, pivot: [492, 470], far: true },
      { name: "hindFarLow", poly: [[447, 566], [585, 566], [585, 750], [447, 750]], pivot: [462, 570], parent: "hindFar", far: true },
      { name: "frontFar", poly: [[678, 466], [741, 466], [741, 592], [680, 592]], cut: 492, pivot: [712, 490], far: true },
      { name: "frontFarLow", poly: [[668, 582], [741, 582], [741, 750], [668, 750]], pivot: [706, 590], parent: "frontFar", far: true },
      { name: "tail", poly: [[240, 325], [362, 325], [362, 760], [240, 760]], pivot: [362, 345] },
      { name: "hindNear", poly: [[362, 478], [455, 478], [455, 560], [362, 560]], cut: 500, pivot: [412, 500] },
      { name: "hindNearLow", poly: [[350, 548], [447, 548], [447, 750], [350, 750]], pivot: [382, 552], parent: "hindNear" },
      { name: "frontNear", poly: [[741, 466], [818, 466], [814, 592], [741, 592]], cut: 492, pivot: [770, 490] },
      { name: "frontNearLow", poly: [[741, 582], [816, 582], [816, 750], [741, 750]], pivot: [758, 590], parent: "frontNear" },
    ],
  },
  {
    name: "elephantRig",
    file: "side-view-of-a-richly-decorated-indian-wedding-ele (1).png",
    scale: 0.6,
    parts: [
      { name: "hindFar", poly: [[405, 548], [560, 548], [560, 732], [415, 732]], cut: 575, pivot: [478, 572], far: true },
      { name: "frontFar", poly: [[585, 540], [728, 540], [735, 600], [705, 732], [585, 732]], cut: 568, pivot: [650, 565], far: true },
      { name: "tail", poly: [[236, 370], [328, 370], [328, 614], [236, 614]], pivot: [316, 395] },
      { name: "hindNear", poly: [[322, 548], [404, 548], [412, 732], [283, 732], [283, 616], [322, 612]], cut: 570, pivot: [350, 568] },
      { name: "frontNear", poly: [[730, 540], [832, 540], [912, 732], [758, 732], [745, 620]], cut: 568, pivot: [775, 565] },
      { name: "trunk", poly: [[868, 395], [1012, 395], [1012, 602], [858, 602]], cut: 425, pivot: [935, 410] },
    ],
  },
];
const FEATHER = 22; // px of soft fade above a leg's cut line

const MAX_SIDE = 900; // elements are drawn at most about this big on the 720x1280 page

// ---------------------------------------------------------------- cutting out

// The background colour: the median of the pixels along the border, and how much it varies.
function measureBackground(data, w, h) {
  const px = [];
  const band = 8;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (x >= band && x < w - band && y >= band && y < h - band) continue;
      if ((x + y) % 3) continue; // a sample is plenty
      const i = (y * w + x) * 3;
      px.push([data[i], data[i + 1], data[i + 2]]);
    }
  const med = [0, 1, 2].map((c) => {
    const v = px.map((p) => p[c]).sort((a, b) => a - b);
    return v[v.length >> 1];
  });
  const d = px.map((p) => Math.hypot(p[0] - med[0], p[1] - med[1], p[2] - med[2])).sort((a, b) => a - b);
  return { bg: med, spread: d[Math.floor(d.length * 0.96)] };
}

// RGBA with the background removed: alpha from the distance to the background colour,
// and edge pixels "un-mixed" from the background so no green or blue fringe is left.
function cutOut(data, w, h, white, soft, fixedBg) {
  const out = Buffer.alloc(w * h * 4);
  // pieces that touch the edges by design (corners, arches) would fool the border sampling, so they give the colour
  const { bg, spread } = fixedBg ? { bg: fixedBg, spread: 14 } : measureBackground(data, w, h);
  // which background colour can leak into the edges
  const [br, bgG, bb0] = bg;
  const spill = white ? null : bgG > br + 40 && bgG > bb0 ? "green" : bb0 > br + 60 && bb0 > bgG + 40 ? "blue" : br > bgG + 60 && bb0 > bgG + 60 ? "magenta" : null;
  const t0 = white ? 0 : Math.max(22, spread * 1.15);
  const t1 = t0 + (white ? 0 : 55);
  for (let p = 0; p < w * h; p++) {
    const r = data[p * 3], g = data[p * 3 + 1], b = data[p * 3 + 2];
    let a;
    if (white) {
      // henna lines on white: darker = more solid
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      a = Math.max(0, Math.min(1, (235 - lum) / 120));
    } else {
      const d = Math.hypot(r - bg[0], g - bg[1], b - bg[2]);
      a = Math.max(0, Math.min(1, (d - t0) / (t1 - t0)));
    }
    let rr = r, gg = g, bb = b;
    if (!white && a > 0 && a < 1) {
      rr = (r - (1 - a) * bg[0]) / a;
      gg = (g - (1 - a) * bg[1]) / a;
      bb = (b - (1 - a) * bg[2]) / a;
    }
    // remove background colour that soaked into fine detail (feather barbs, petal edges)
    if (spill === "green") gg = Math.min(gg, Math.max(rr, bb) + 6);
    else if (spill === "blue") bb = Math.min(bb, Math.max(rr, gg) + 10);
    else if (spill === "magenta") {
      const m = Math.min(rr, bb) - gg;
      if (m > 0) {
        rr -= m * 0.9;
        bb -= m * 0.9;
      }
    }
    // soft things (clouds): see-through edges take a cream colour instead of whatever tint is left
    if (soft) {
      // keep the painted light (whites and warm peach); anything darker or tinted becomes cream
      gg = Math.min(gg, (rr + bb) / 2 + 4);
      const lum = 0.3 * rr + 0.59 * gg + 0.11 * bb;
      const keep = Math.max(0, Math.min(1, (lum - 175) / 60)) * Math.pow(a, 0.5);
      rr = rr * keep + 252 * (1 - keep);
      gg = gg * keep + 244 * (1 - keep);
      bb = Math.min(bb, rr) * keep + 236 * (1 - keep);
    }
    out[p * 4] = Math.max(0, Math.min(255, rr));
    out[p * 4 + 1] = Math.max(0, Math.min(255, gg));
    out[p * 4 + 2] = Math.max(0, Math.min(255, bb));
    out[p * 4 + 3] = a < 0.1 ? 0 : Math.round(a * 255); // drop faint specks of background texture
  }
  return out;
}

// Shaves one pixel off every edge, which removes the thin fringe of background colour.
function erode(rgba, w, h) {
  const a = new Uint8Array(w * h);
  for (let p = 0; p < w * h; p++) a[p] = rgba[p * 4 + 3];
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      if (!a[p]) continue;
      const m = Math.min(a[p - 1], a[p + 1], a[p - w], a[p + w]);
      if (m < a[p]) rgba[p * 4 + 3] = m;
    }
  return rgba;
}

// Splits side-by-side items that touch: cuts at the emptiest column between each pair.
function splitColumns(rgba, w, h, n) {
  const cover = new Float64Array(w);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) cover[x] += rgba[(y * w + x) * 4 + 3];
  let x0 = 0, x1 = w - 1;
  while (x0 < w && cover[x0] < 255 * 3) x0++;
  while (x1 > 0 && cover[x1] < 255 * 3) x1--;
  const cuts = [x0];
  for (let i = 1; i < n; i++) {
    const guess = Math.round(x0 + ((x1 - x0) * i) / n);
    const span = Math.round((x1 - x0) / n / 3);
    let best = guess;
    for (let x = guess - span; x <= guess + span; x++) if (cover[x] < cover[best]) best = x;
    cuts.push(best);
  }
  cuts.push(x1 + 1);
  const out = [];
  for (let i = 0; i < n; i++) {
    const cw = cuts[i + 1] - cuts[i];
    const data = Buffer.alloc(cw * h * 4);
    for (let y = 0; y < h; y++) rgba.copy(data, y * cw * 4, (y * w + cuts[i]) * 4, (y * w + cuts[i + 1]) * 4);
    out.push({ data, w: cw, h });
  }
  return out;
}

// ---------------------------------------------------------------- splitting sheets

// Groups the solid pixels into separate items. Works on a 1/4-size grid, slightly grown,
// so thin bits (a lantern's string, a feather's tip) stay with their item.
function findItems(rgba, w, h, grow = 2) {
  const S = 4;
  const gw = Math.ceil(w / S), gh = Math.ceil(h / S);
  const solid = new Uint8Array(gw * gh);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) if (rgba[(y * w + x) * 4 + 3] > 90) solid[Math.floor(y / S) * gw + Math.floor(x / S)] = 1;
  // grow by `grow` cells
  const grown = new Uint8Array(gw * gh);
  for (let y = 0; y < gh; y++)
    for (let x = 0; x < gw; x++) {
      if (!solid[y * gw + x]) continue;
      for (let j = -grow; j <= grow; j++)
        for (let i = -grow; i <= grow; i++) {
          const xx = x + i, yy = y + j;
          if (xx >= 0 && yy >= 0 && xx < gw && yy < gh) grown[yy * gw + xx] = 1;
        }
    }
  const label = new Int32Array(gw * gh).fill(-1);
  const items = [];
  for (let s = 0; s < gw * gh; s++) {
    if (!grown[s] || label[s] >= 0) continue;
    const id = items.length;
    const box = { x0: gw, y0: gh, x1: 0, y1: 0, cells: 0 };
    const stack = [s];
    label[s] = id;
    while (stack.length) {
      const c = stack.pop();
      const cx = c % gw, cy = (c / gw) | 0;
      if (solid[c]) box.cells++;
      box.x0 = Math.min(box.x0, cx); box.x1 = Math.max(box.x1, cx);
      box.y0 = Math.min(box.y0, cy); box.y1 = Math.max(box.y1, cy);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= gw || ny >= gh) continue;
        const n = ny * gw + nx;
        if (grown[n] && label[n] < 0) {
          label[n] = id;
          stack.push(n);
        }
      }
    }
    items.push(box);
  }
  const biggest = Math.max(...items.map((b) => b.cells));
  return items
    .map((b, id) => ({ ...b, id }))
    .filter((b) => b.cells > biggest * 0.06) // drop specks
    .map((b) => ({ id: b.id, label, gw, S, x: b.x0 * S, y: b.y0 * S, w: (b.x1 - b.x0 + 1) * S, h: (b.y1 - b.y0 + 1) * S }))
    .sort((a, b) => Math.round((a.y + a.h / 2) / (h / 6)) - Math.round((b.y + b.h / 2) / (h / 6)) || a.x - b.x); // reading order
}

// One item cut from the sheet: only its own pixels, trimmed to its size.
function itemImage(rgba, w, h, it) {
  const pad = 6;
  const x0 = Math.max(0, it.x - pad), y0 = Math.max(0, it.y - pad);
  const x1 = Math.min(w, it.x + it.w + pad), y1 = Math.min(h, it.y + it.h + pad);
  const cw = x1 - x0, ch = y1 - y0;
  const out = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++)
    for (let x = 0; x < cw; x++) {
      const sx = x + x0, sy = y + y0;
      const cell = Math.floor(sy / it.S) * it.gw + Math.floor(sx / it.S);
      if (it.label[cell] !== it.id) continue;
      rgba.copy(out, (y * cw + x) * 4, (sy * w + sx) * 4, (sy * w + sx) * 4 + 4);
    }
  return { data: out, w: cw, h: ch };
}

// Crops off a thin chain at the top: everything above the first row that's at least a fifth as wide as the item.
function cropChain(img) {
  const rowW = [];
  for (let y = 0; y < img.h; y++) {
    let x0 = -1, x1 = -1;
    for (let x = 0; x < img.w; x++)
      if (img.data[(y * img.w + x) * 4 + 3] > 60) {
        if (x0 < 0) x0 = x;
        x1 = x;
      }
    rowW.push(x0 < 0 ? 0 : x1 - x0);
  }
  const widest = Math.max(...rowW);
  const top = Math.max(0, rowW.findIndex((w) => w > widest * 0.2) - 4);
  const h = img.h - top;
  return { data: img.data.subarray(top * img.w * 4), w: img.w, h };
}

// Trims empty edges. Rows and columns with almost nothing in them (a stray shadow, a speck)
// count as empty too.
function trim(img) {
  const colSum = new Float64Array(img.w);
  const rowSum = new Float64Array(img.h);
  for (let y = 0; y < img.h; y++)
    for (let x = 0; x < img.w; x++) {
      const a = img.data[(y * img.w + x) * 4 + 3];
      colSum[x] += a;
      rowSum[y] += a;
    }
  const colMin = Math.max(...colSum) * 0.02;
  const rowMin = Math.max(...rowSum) * 0.02;
  let x0 = colSum.findIndex((v) => v > colMin);
  let y0 = rowSum.findIndex((v) => v > rowMin);
  if (x0 < 0 || y0 < 0) return img;
  let x1 = img.w - 1, y1 = img.h - 1;
  while (x1 > x0 && colSum[x1] <= colMin) x1--;
  while (y1 > y0 && rowSum[y1] <= rowMin) y1--;
  x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2);
  x1 = Math.min(img.w - 1, x1 + 2); y1 = Math.min(img.h - 1, y1 + 2);
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) img.data.copy(out, y * w * 4, ((y + y0) * img.w + x0) * 4, ((y + y0) * img.w + x1 + 1) * 4);
  return { data: out, w, h, x0, y0 };
}

async function save(img, name) {
  const file = `${name}.webp`;
  let pipe = sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } });
  if (Math.max(img.w, img.h) > MAX_SIDE) pipe = pipe.resize({ width: img.w >= img.h ? MAX_SIDE : undefined, height: img.h > img.w ? MAX_SIDE : undefined });
  const info = await pipe.webp({ quality: 88, alphaQuality: 90 }).toFile(path.join(OUT_DIR, file));
  return { src: `/generated/elements/${file}`, w: info.width, h: info.height };
}

// ---------------------------------------------------------------- rigs

function inPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Cuts a cut-out image into its parts. Pixels go to the first part whose polygon holds them
// (lower legs before upper legs); everything left is the body. A leg's strip above its cut line
// stays in the body too, and is faded in the leg so the joint blends.
async function buildRig(rig, rgba, w, h) {
  const owner = new Int16Array(w * h).fill(-1);
  const order = rig.parts.map((p, i) => i).sort((a, b) => (rig.parts[b].parent ? 1 : 0) - (rig.parts[a].parent ? 1 : 0));
  const layers = rig.parts.map(() => Buffer.alloc(w * h * 4));
  const body = Buffer.from(rgba);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (!rgba[p * 4 + 3]) continue;
      for (const i of order) {
        const part = rig.parts[i];
        if (!inPoly(x, y, part.poly)) continue;
        const top = part.cut ?? -Infinity;
        if (y < top - FEATHER) continue; // above the strip: body only
        const fade = y >= top ? 1 : (y - (top - FEATHER)) / FEATHER;
        rgba.copy(layers[i], p * 4, p * 4, p * 4 + 4);
        layers[i][p * 4 + 3] = Math.round(rgba[p * 4 + 3] * fade);
        if (y >= top) body[p * 4 + 3] = 0; // below the cut: not part of the body any more
        owner[p] = i;
        break;
      }
    }
  const s = rig.scale;
  const parts = [];
  for (let i = 0; i < rig.parts.length; i++) {
    const t = trim({ data: layers[i], w, h });
    const box = { x0: t.x0 ?? 0, y0: t.y0 ?? 0 };
    const saved = await saveScaled(t, `${rig.name}-${rig.parts[i].name}`, s);
    const def = rig.parts[i];
    parts.push({
      name: def.name,
      ...saved,
      x: Math.round(box.x0 * s),
      y: Math.round(box.y0 * s),
      px: Math.round(def.pivot[0] * s),
      py: Math.round(def.pivot[1] * s),
      ...(def.parent ? { parent: def.parent } : {}),
      ...(def.far ? { far: true } : {}),
    });
  }
  const bodyTrim = trim({ data: body, w, h });
  const bodyBox = { x0: bodyTrim.x0 ?? 0, y0: bodyTrim.y0 ?? 0 };
  const bodySaved = await saveScaled(bodyTrim, `${rig.name}-body`, s);
  return { w: Math.round(w * s), h: Math.round(h * s), body: { ...bodySaved, x: Math.round(bodyBox.x0 * s), y: Math.round(bodyBox.y0 * s) }, parts };
}

async function saveScaled(img, name, s) {
  const file = `${name}.webp`;
  const info = await sharp(img.data, { raw: { width: img.w, height: img.h, channels: 4 } })
    .resize(Math.max(1, Math.round(img.w * s)), Math.max(1, Math.round(img.h * s)))
    .webp({ quality: 90, alphaQuality: 95 })
    .toFile(path.join(OUT_DIR, file));
  return { src: `/generated/elements/${file}`, w: info.width, h: info.height };
}

// ---------------------------------------------------------------- main

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const f of fs.readdirSync(OUT_DIR)) fs.unlinkSync(path.join(OUT_DIR, f));
const result = {};
for (const s of SOURCES) {
  const src = path.join(SRC_DIR, s.file);
  if (!fs.existsSync(src)) {
    console.warn(`  ! missing ${s.file}`);
    continue;
  }
  const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = erode(cutOut(data, info.width, info.height, s.white, s.soft, s.bg), info.width, info.height);
  // several sheets can feed one name (e.g. two sheets of flowers): their pieces add up
  const list = (result[s.name] ??= []);
  const n0 = list.length;
  if (s.columns) {
    const parts = splitColumns(rgba, info.width, info.height, s.columns);
    for (let i = 0; i < parts.length; i++) list.push(await save(trim(parts[i]), `${s.name}-${n0 + i + 1}`));
  } else if (s.split) {
    const items = findItems(rgba, info.width, info.height, s.grow);
    for (let i = 0; i < items.length; i++) list.push(await save(trim(itemImage(rgba, info.width, info.height, items[i])), `${s.name}-${n0 + i + 1}`));
  } else {
    const whole = trim({ data: rgba, w: info.width, h: info.height });
    list.push(await save(s.noChain ? trim(cropChain(whole)) : whole, n0 ? `${s.name}-${n0 + 1}` : s.name));
  }
  console.log(`  ${s.name}: ${result[s.name].length}`);
}
const rigs = {};
for (const r of RIGS) {
  const { data, info } = await sharp(path.join(SRC_DIR, r.file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  rigs[r.name] = await buildRig(r, erode(cutOut(data, info.width, info.height, false), info.width, info.height), info.width, info.height);
  console.log(`  ${r.name}: ${rigs[r.name].parts.length} parts`);
}
fs.writeFileSync(DATA_FILE, JSON.stringify({ items: result, rigs }, null, 2) + "\n");
console.log(`Wrote data/elements.json`);
