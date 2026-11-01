// Draws simple invite backgrounds in code (decorated at the sides, clear in the middle)
// and saves them as PNGs in public/backgrounds/ (named simple-*.png).
// Run:  npm run make-backgrounds   (then  npm run assets)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/backgrounds");
const W = 720;
const H = 1280;

// repeatable pseudo-random 0..1
const rnd = (i, k = 0) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------- motifs

const petal = (len, wid) =>
  `M0,0 C${wid},${-len * 0.3} ${wid * 0.8},${-len * 0.85} 0,${-len} C${-wid * 0.8},${-len * 0.85} ${-wid},${-len * 0.3} 0,0Z`;

function flower(x, y, r, c, petals = 6, rot = 0) {
  let s = `<g transform="translate(${x},${y}) rotate(${rot})">`;
  for (let i = 0; i < petals; i++) s += `<path d="${petal(r, r * 0.55)}" fill="${c.outer}" stroke="${c.line}" stroke-width="1.2" transform="rotate(${(i * 360) / petals})"/>`;
  for (let i = 0; i < petals; i++) s += `<path d="${petal(r * 0.6, r * 0.32)}" fill="${c.inner}" transform="rotate(${(i * 360) / petals + 180 / petals})"/>`;
  s += `<circle r="${r * 0.2}" fill="${c.centre}"/>`;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    s += `<circle cx="${Math.cos(a) * r * 0.12}" cy="${Math.sin(a) * r * 0.12}" r="${r * 0.035}" fill="${c.line}"/>`;
  }
  return s + "</g>";
}

function rose(x, y, r, c, rot = 0) {
  let s = `<g transform="translate(${x},${y}) rotate(${rot})">`;
  for (let i = 0; i < 5; i++) s += `<ellipse cx="0" cy="${-r * 0.5}" rx="${r * 0.45}" ry="${r * 0.52}" fill="${c.light}" stroke="${c.mid}" stroke-width="1.5" transform="rotate(${i * 72})"/>`;
  s += `<circle r="${r * 0.62}" fill="${c.mid}"/>`;
  for (let i = 0; i < 4; i++) s += `<ellipse cx="0" cy="${-r * 0.28}" rx="${r * 0.3}" ry="${r * 0.32}" fill="${c.light}" opacity="0.55" transform="rotate(${i * 90 + 45})"/>`;
  s += `<path d="M${-r * 0.3},${r * 0.05} A${r * 0.3},${r * 0.3} 0 1 1 ${r * 0.18},${r * 0.22}" fill="none" stroke="${c.dark}" stroke-width="${r * 0.06}" stroke-linecap="round"/>`;
  s += `<path d="M${-r * 0.12},${-r * 0.02} A${r * 0.14},${r * 0.14} 0 1 1 ${r * 0.1},${r * 0.08}" fill="none" stroke="${c.dark}" stroke-width="${r * 0.05}" stroke-linecap="round"/>`;
  return s + "</g>";
}

function leaf(x, y, len, ang, color, vein) {
  return `<g transform="translate(${x},${y}) rotate(${ang})"><path d="M0,0 Q${len * 0.5},${-len * 0.3} ${len},0 Q${len * 0.5},${len * 0.3} 0,0Z" fill="${color}"/><path d="M${len * 0.08},0 L${len * 0.85},0" stroke="${vein}" stroke-width="${Math.max(1, len * 0.03)}" stroke-linecap="round"/></g>`;
}

function bud(x, y, s, ang, c) {
  return `<g transform="translate(${x},${y}) rotate(${ang})"><path d="${petal(s, s * 0.45)}" fill="${c.mid}"/><path d="M0,0 L${-s * 0.25},${s * 0.25} M0,0 L${s * 0.25},${s * 0.25}" stroke="${c.leaf}" stroke-width="${s * 0.12}" stroke-linecap="round"/></g>`;
}

// small songbird, facing right (flip = facing left)
function bird(x, y, s, c, flip = false) {
  return `<g transform="translate(${x},${y}) scale(${flip ? -s : s},${s})">
    <path d="M-38,4 L-88,26 L-82,10 L-92,-2 Z" fill="${c.wing}"/>
    <ellipse cx="0" cy="0" rx="44" ry="25" fill="${c.body}"/>
    <ellipse cx="14" cy="9" rx="20" ry="11" fill="#ffffff" opacity="0.28"/>
    <circle cx="35" cy="-17" r="18" fill="${c.body}"/>
    <path d="M51,-20 L67,-14 L51,-10Z" fill="${c.beak}"/>
    <circle cx="40" cy="-20" r="2.8" fill="#2b1d16"/>
    <path d="M-24,-8 Q6,-34 30,-6 Q4,12 -24,-8Z" fill="${c.wing}"/>
    <path d="M-14,-10 Q6,-24 20,-8" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="2"/>
    <path d="M-2,23 L-6,36 M10,23 L9,36" stroke="${c.beak}" stroke-width="3" stroke-linecap="round"/>
  </g>`;
}

function marigold(x, y, r, c1, c2) {
  let s = `<g transform="translate(${x},${y})">`;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    s += `<circle cx="${Math.cos(a) * r * 0.66}" cy="${Math.sin(a) * r * 0.66}" r="${r * 0.36}" fill="${c1}"/>`;
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3;
    s += `<circle cx="${Math.cos(a) * r * 0.36}" cy="${Math.sin(a) * r * 0.36}" r="${r * 0.3}" fill="${c2}"/>`;
  }
  return s + `<circle r="${r * 0.28}" fill="${c2}" stroke="${c1}" stroke-width="1"/></g>`;
}

function lotus(x, y, s, c) {
  let g = `<g transform="translate(${x},${y}) scale(${s})">`;
  for (const a of [-75, 75, -50, 50]) g += `<path d="${petal(80, 30)}" fill="${c.back}" transform="rotate(${a})"/>`;
  for (const a of [-28, 28, 0]) g += `<path d="${petal(95, 34)}" fill="${c.petal}" stroke="${c.line}" stroke-width="1.5" transform="rotate(${a})"/>`;
  g += `<path d="M-46,4 Q0,24 46,4" fill="none" stroke="${c.line}" stroke-width="3" stroke-linecap="round"/>`;
  return g + "</g>";
}

function lilyPad(x, y, r, c) {
  return `<path d="M${x},${y} L${x + r * 0.95},${y - r * 0.2} A${r},${r * 0.45} 0 1 1 ${x + r * 0.95},${y + r * 0.15} Z" fill="${c}"/>`;
}

function feather(x, y, len, ang) {
  let s = `<g transform="translate(${x},${y}) rotate(${ang})">`;
  s += `<path d="M0,0 Q${len * 0.08},${-len * 0.5} 0,${-len}" fill="none" stroke="#8a7a3a" stroke-width="3"/>`;
  for (let i = 4; i < 40; i++) {
    const t = i / 40;
    const yy = -len * t;
    const w = len * 0.13 * Math.sin(Math.PI * Math.min(1, t * 1.15));
    s += `<path d="M0,${yy} Q${w * 0.6},${yy - 10} ${w},${yy - 24}" stroke="#5f8f4a" stroke-width="1.6" fill="none" opacity="0.8"/>`;
    s += `<path d="M0,${yy} Q${-w * 0.6},${yy - 10} ${-w},${yy - 24}" stroke="#5f8f4a" stroke-width="1.6" fill="none" opacity="0.8"/>`;
  }
  const ey = -len * 0.9;
  s += `<ellipse cx="0" cy="${ey}" rx="${len * 0.12}" ry="${len * 0.16}" fill="#c9a03a"/>`;
  s += `<ellipse cx="0" cy="${ey + 4}" rx="${len * 0.09}" ry="${len * 0.12}" fill="#1f8a7e"/>`;
  s += `<ellipse cx="0" cy="${ey + 8}" rx="${len * 0.055}" ry="${len * 0.075}" fill="#1e3f8a"/>`;
  s += `<ellipse cx="0" cy="${ey + 10}" rx="${len * 0.028}" ry="${len * 0.04}" fill="#0b1f4d"/>`;
  return s + "</g>";
}

function archPath(x0, y0, x1, y1) {
  const w = x1 - x0;
  const cx = (x0 + x1) / 2;
  const shoulder = y0 + w * 0.42;
  return `M${x0},${y1} L${x0},${shoulder} C${x0},${y0 + w * 0.16} ${cx - w * 0.14},${y0 + w * 0.12} ${cx},${y0} C${cx + w * 0.14},${y0 + w * 0.12} ${x1},${y0 + w * 0.16} ${x1},${shoulder} L${x1},${y1} Z`;
}

// soft paper: base colour, light centre, faint speckle
function paper(color) {
  let s = `<defs><radialGradient id="glow" cx="50%" cy="48%" r="65%"><stop offset="0" stop-color="#ffffff" stop-opacity="0.45"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
    <radialGradient id="edge" cx="50%" cy="50%" r="75%"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.07"/></radialGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="${color}"/><rect width="${W}" height="${H}" fill="url(#glow)"/><rect width="${W}" height="${H}" fill="url(#edge)"/>`;
  for (let i = 0; i < 400; i++) s += `<circle cx="${rnd(i, 1) * W}" cy="${rnd(i, 2) * H}" r="${0.6 + rnd(i, 3) * 1.2}" fill="#7a5a3a" opacity="0.05"/>`;
  return s;
}

// ---------------------------------------------------------------- designs

function roseCluster(c, withBird) {
  let s = `<path d="M-20,30 Q140,40 330,190" fill="none" stroke="${c.stem}" stroke-width="5" stroke-linecap="round"/>`;
  s += `<path d="M60,40 Q90,150 40,300" fill="none" stroke="${c.stem}" stroke-width="4" stroke-linecap="round"/>`;
  const leaves = [[120, 45, 70, -15], [200, 95, 64, 20], [260, 140, 58, -30], [70, 160, 60, 110], [55, 250, 56, 70], [150, 120, 50, 160], [290, 175, 46, 45]];
  for (const [x, y, l, a] of leaves) s += leaf(x, y, l, a, c.leaf, c.vein);
  s += bud(320, 185, 28, 120, c) + bud(42, 300, 26, 200, c) + bud(235, 70, 22, 60, c);
  s += rose(65, 85, 72, c, 10) + rose(178, 58, 48, c, 40) + rose(40, 210, 42, c, -20);
  s += flower(250, 110, 20, { outer: c.light, inner: "#ffffff", centre: c.dark, line: c.mid }, 5);
  if (withBird) s += bird(300, 160, 0.9, c.bird, true);
  return s;
}

function roseCorners(c) {
  return paper(c.paper) + `<g>${roseCluster(c, true)}</g><g transform="rotate(180 ${W / 2} ${H / 2})">${roseCluster(c, false)}</g>`;
}

function vineSide(c) {
  let d = `M44,-20`;
  for (let y = 0; y <= H + 40; y += 20) d += ` L${44 + 20 * Math.sin(y / 85)},${y}`;
  let s = `<path d="${d}" fill="none" stroke="${c.stem}" stroke-width="4" stroke-linecap="round"/>`;
  for (let y = 30, i = 0; y < H; y += 46, i++) {
    const x = 44 + 20 * Math.sin(y / 85);
    s += leaf(x, y, 40 + rnd(i) * 14, i % 2 ? 25 : 155, c.leaf, c.vein);
  }
  for (let y = 110, i = 0; y < H; y += 165, i++) {
    const x = 44 + 20 * Math.sin(y / 85);
    s += flower(x + 8, y, 24, { outer: c.flower, inner: c.flowerInner, centre: c.gold, line: c.line }, 6, i * 17);
    s += `<circle cx="${x + 34}" cy="${y + 40}" r="5" fill="${c.gold}"/><circle cx="${x + 26}" cy="${y - 44}" r="4" fill="${c.gold}"/>`;
  }
  s += `<line x1="96" y1="40" x2="96" y2="${H - 40}" stroke="${c.gold}" stroke-width="1.5" stroke-dasharray="0 10" stroke-linecap="round"/>`;
  return s;
}

function sideVines(c) {
  return paper(c.paper) + `<g>${vineSide(c)}</g><g transform="translate(${W},0) scale(-1,1)">${vineSide(c)}</g>`;
}

function cornerFlorals(c, x, y, flip) {
  let s = `<g transform="translate(${x},${y}) scale(${flip ? -1 : 1},1)">`;
  for (const [lx, ly, l, a] of [[0, 0, 70, -70], [10, -10, 64, -30], [-5, -20, 58, -110], [30, 5, 52, 10]]) s += leaf(lx, ly, l, a, c.leaf, c.vein);
  s += flower(20, -40, 34, { outer: c.flower, inner: c.flowerInner, centre: c.gold, line: c.line }, 6);
  s += flower(70, -10, 22, { outer: c.flowerInner, inner: "#ffffff", centre: c.gold, line: c.line }, 5, 20);
  s += flower(-20, -95, 18, { outer: c.flower, inner: c.flowerInner, centre: c.gold, line: c.line }, 5, 10);
  return s + "</g>";
}

function archFrame(c) {
  let s = `<rect width="${W}" height="${H}" fill="${c.outer}"/>`;
  for (let i = 0; i < 260; i++) s += `<circle cx="${rnd(i, 4) * W}" cy="${rnd(i, 5) * H}" r="1.2" fill="#ffffff" opacity="0.05"/>`;
  s += `<rect x="22" y="22" width="${W - 44}" height="${H - 44}" fill="none" stroke="${c.gold}" stroke-width="2"/>`;
  s += `<rect x="32" y="32" width="${W - 64}" height="${H - 64}" fill="none" stroke="${c.gold}" stroke-width="1" stroke-dasharray="0 9" stroke-linecap="round"/>`;
  s += `<path d="${archPath(80, 120, W - 80, H - 90)}" fill="${c.panel}"/>`;
  s += `<path d="${archPath(80, 120, W - 80, H - 90)}" fill="none" stroke="${c.gold}" stroke-width="5"/>`;
  s += `<path d="${archPath(98, 146, W - 98, H - 108)}" fill="none" stroke="${c.gold}" stroke-width="2" stroke-dasharray="0 10" stroke-linecap="round"/>`;
  s += `<circle cx="${W / 2}" cy="104" r="9" fill="${c.gold}"/><path d="M${W / 2},94 L${W / 2},70" stroke="${c.gold}" stroke-width="3"/>`;
  s += bird(150, 100, 0.55, c.bird) + bird(W - 150, 100, 0.55, c.bird, true);
  s += cornerFlorals(c, 96, H - 96, false) + cornerFlorals(c, W - 96, H - 96, true);
  return s;
}

function strand(x, len, c, i) {
  let s = `<path d="M${x},28 L${x},${28 + len}" stroke="${c.rope}" stroke-width="2"/>`;
  for (let y = 46, k = 0; y < 28 + len; y += 30, k++) s += marigold(x, y, 15, k % 2 ? c.m1 : c.m2, k % 2 ? c.m2 : c.m1);
  s += leaf(x, 34 + len, 34, 90, c.leaf, c.vein);
  return s;
}

function toran(c) {
  let s = paper(c.paper);
  s += `<path d="M-10,28 Q${W / 2},44 ${W + 10},28" fill="none" stroke="${c.rope}" stroke-width="4"/>`;
  for (let x = 30, i = 0; x < W; x += 60, i++) {
    s += leaf(x + 30, 34, 46, 80 + (i % 2 ? 10 : -10), c.leaf, c.vein);
    s += strand(x, 110 + (i % 3) * 60, c, i);
  }
  for (const [cx, flip] of [[70, false], [W - 70, true]]) {
    s += `<g transform="translate(${cx},${H - 70}) scale(${flip ? -1 : 1},1)">`;
    for (const [lx, ly, l, a] of [[-20, 10, 60, -150], [10, 0, 66, -40], [40, -20, 54, -80]]) s += leaf(lx, ly, l, a, c.leaf, c.vein);
    s += marigold(0, 0, 32, c.m1, c.m2) + marigold(55, 10, 26, c.m2, c.m1) + marigold(20, -45, 22, c.m1, c.m2) + "</g>";
  }
  return s;
}

function lotusPond(c) {
  let s = paper(c.paper);
  for (let k = 0; k < 4; k++) {
    let d = `M0,${H - 150 + k * 32}`;
    for (let x = 0; x <= W; x += 30) d += ` Q${x + 15},${H - 158 + k * 32} ${x + 30},${H - 150 + k * 32}`;
    s += `<path d="${d}" fill="none" stroke="${c.water}" stroke-width="2" opacity="${0.6 - k * 0.1}"/>`;
  }
  s += lilyPad(60, H - 110, 70, c.pad) + lilyPad(500, H - 70, 80, c.pad) + lilyPad(260, H - 40, 60, c.pad) + lilyPad(640, H - 150, 50, c.pad);
  s += lotus(140, H - 120, 1.1, c) + lotus(590, H - 100, 0.95, c) + lotus(370, H - 70, 0.7, c);
  s += `<line x1="40" y1="40" x2="${W - 40}" y2="40" stroke="${c.line}" stroke-width="1.5" opacity="0.6"/>`;
  s += lotus(W / 2, 64, 0.32, c);
  for (const x of [80, W - 80]) s += `<path d="M${x},40 L${x},110" stroke="${c.line}" stroke-width="1.5"/>` + lotus(x, 128, 0.26, c);
  return s;
}

function peacock(c) {
  let s = paper(c.paper);
  for (const [x, flip] of [[0, false], [W, true]]) {
    s += `<g transform="translate(${x},${H}) scale(${flip ? -1 : 1},1)">`;
    for (const [len, ang] of [[420, 18], [380, 34], [330, 50], [300, 66], [260, 6]]) s += feather(0, 0, len, ang);
    s += "</g>";
  }
  for (const [x, flip] of [[0, false], [W, true]]) {
    s += `<g transform="translate(${x},0) scale(${flip ? -1 : 1},1)">`;
    s += feather(-10, -10, 220, 150) + feather(-10, -10, 180, 125);
    s += "</g>";
  }
  s += `<rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="${c.gold}" stroke-width="1.5" stroke-dasharray="0 10" stroke-linecap="round"/>`;
  return s;
}

// ---------------------------------------------------------------- colourways

const blushRose = { light: "#f7c4cf", mid: "#e88aa0", dark: "#a8435f", leaf: "#8fae84", vein: "#cfe0c8", stem: "#7d9a6f" };
const peachRose = { light: "#ffd8c2", mid: "#f4a07c", dark: "#b85a35", leaf: "#5f8a5a", vein: "#c5dcbf", stem: "#567a4f" };

const designs = {
  "simple-rose-corners-ivory": () => roseCorners({ paper: "#fbf6ec", ...blushRose, bird: { body: "#8fb3d4", wing: "#4f7aa3", beak: "#d9a441" } }),
  "simple-rose-corners-sage": () => roseCorners({ paper: "#eef2e5", ...peachRose, bird: { body: "#f0c75e", wing: "#c08a2a", beak: "#7a4b1c" } }),
  "simple-side-vines-cream": () => sideVines({ paper: "#fbf3e4", stem: "#b8954a", leaf: "#c9a24a", vein: "#f1dfae", flower: "#8c1c32", flowerInner: "#d9566f", gold: "#c9a24a", line: "#5c0f1f" }),
  "simple-side-vines-blue": () => sideVines({ paper: "#eaf1f7", stem: "#b8954a", leaf: "#c9a24a", vein: "#f1dfae", flower: "#24407a", flowerInner: "#ffffff", gold: "#c9a24a", line: "#16285a" }),
  "simple-arch-maroon": () => archFrame({ outer: "#5c1424", panel: "#f8f0e0", gold: "#d9ab4f", leaf: "#7f9a6c", vein: "#d4e2c9", flower: "#b8324f", flowerInner: "#f2a5b4", line: "#6e1528", bird: { body: "#f3e6c4", wing: "#d9ab4f", beak: "#d9ab4f" } }),
  "simple-arch-emerald": () => archFrame({ outer: "#0f3b2e", panel: "#fbf7ec", gold: "#d9ab4f", leaf: "#6f9a6a", vein: "#d4e2c9", flower: "#e0657e", flowerInner: "#ffd0d8", line: "#8a2a3c", bird: { body: "#f3e6c4", wing: "#d9ab4f", beak: "#d9ab4f" } }),
  "simple-toran-peach": () => toran({ paper: "#fdf0e4", rope: "#a8742c", m1: "#ff9a1f", m2: "#ffc93c", leaf: "#4f8a3c", vein: "#bfe0a8" }),
  "simple-toran-ivory": () => toran({ paper: "#fffaf0", rope: "#a8742c", m1: "#e8336e", m2: "#ff9a1f", leaf: "#4f8a3c", vein: "#bfe0a8" }),
  "simple-lotus-pink": () => lotusPond({ paper: "#fcecef", petal: "#f28aa8", back: "#f7b7c9", line: "#c24d73", water: "#d48aa2", pad: "#8fb57d" }),
  "simple-lotus-sky": () => lotusPond({ paper: "#eaf3f8", petal: "#fbe3ea", back: "#f4c2d1", line: "#c06a86", water: "#8ab3c9", pad: "#5f9c8a" }),
  "simple-peacock-ivory": () => peacock({ paper: "#fbf7ee", gold: "#c9a03a" }),
  "simple-peacock-blush": () => peacock({ paper: "#fbeee9", gold: "#c9a03a" }),
};

fs.mkdirSync(OUT, { recursive: true });
for (const [name, draw] of Object.entries(designs)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${draw()}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, name + ".png"));
  console.log("  drew " + name);
}
console.log(`Saved ${Object.keys(designs).length} backgrounds to public/backgrounds/. Now run: npm run assets`);
