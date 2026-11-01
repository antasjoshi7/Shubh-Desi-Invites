// Symbols for the top of a page, drawn in code: 5 Om, 5 Ganesh ji and 5 initials monograms.
// Om uses the real ॐ letter from Devanagari fonts; Ganesh ji is drawn from vector shapes;
// monograms use the couple's initials in the invite fonts.

import type { SymbolStyle } from "./types";

type Ctx = CanvasRenderingContext2D;
export type SymbolColours = { main: string; accent: string; surface: string; initials?: [string, string] };

// Devanagari fonts used for ॐ (loaded at start-up, only the Devanagari letters).
export const SYMBOL_FONTS = [
  { family: "Om Yatra", file: "/fonts/symbols/yatra-one-devanagari.woff2" },
  { family: "Om Tiro", file: "/fonts/symbols/tiro-devanagari-hindi-devanagari.woff2" },
  { family: "Om Rozha", file: "/fonts/symbols/rozha-one-devanagari.woff2" },
  { family: "Om Amita", file: "/fonts/symbols/amita-devanagari.woff2" },
];

const OM = "ॐ";

// Draws a symbol of height S centred at (x, y).
export function drawSymbol(ctx: Ctx, x: number, y: number, S: number, style: SymbolStyle, c: SymbolColours) {
  ctx.save();
  ctx.translate(x, y);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const u = S / 100; // drawings below use a 100 x 100 box centred on 0,0

  switch (style) {
    case "om-classic":
      om(ctx, u, "Om Yatra", 60, c.accent);
      break;
    case "om-circle":
      ring(ctx, u, 46, c.accent, 1.4);
      ring(ctx, u, 41, c.accent, 0.6);
      dots(ctx, u, 36, 49, 0.8, c.accent);
      om(ctx, u, "Om Tiro", 50, c.main, 2);
      break;
    case "om-lotus":
      lotus(ctx, u, 30, c);
      om(ctx, u, "Om Rozha", 56, c.accent, -10);
      break;
    case "om-rays":
      rays(ctx, u, c.accent);
      ctx.fillStyle = c.surface;
      ctx.beginPath();
      ctx.arc(0, 0, 30 * u, 0, Math.PI * 2);
      ctx.fill();
      om(ctx, u, "Om Amita", 44, c.accent, 3);
      break;
    case "om-mandala":
      petalRing(ctx, u, 16, 34, 15, 6, c.accent, 0.85);
      ctx.fillStyle = c.surface;
      ctx.beginPath();
      ctx.arc(0, 0, 33 * u, 0, Math.PI * 2);
      ctx.fill();
      ring(ctx, u, 33, c.accent, 1);
      dots(ctx, u, 16, 29, 0.9, c.accent);
      om(ctx, u, "Om Yatra", 40, c.main, 1);
      break;
    case "ganesh-line":
      ganesh(ctx, u, c, false);
      break;
    case "ganesh-filled":
      ganesh(ctx, u, c, true);
      break;
    case "ganesh-circle":
      ring(ctx, u, 48, c.accent, 1.4);
      dots(ctx, u, 40, 44, 0.7, c.accent);
      ctx.save();
      ctx.scale(0.72, 0.72);
      ctx.translate(0, 4 * u);
      ganesh(ctx, u, c, false);
      ctx.restore();
      break;
    case "ganesh-lotus":
      lotus(ctx, u, 36, c);
      ctx.save();
      ctx.translate(0, -8 * u);
      ctx.scale(0.74, 0.74);
      ganesh(ctx, u, c, true);
      ctx.restore();
      break;
    case "mono-classic":
    case "mono-circle":
    case "mono-script":
    case "mono-crest":
    case "mono-wreath":
      monogram(ctx, u, style, c);
      break;
    case "ganesh-arch":
      arch(ctx, u, c.accent);
      ctx.save();
      ctx.translate(0, 8 * u);
      ctx.scale(0.62, 0.62);
      ganesh(ctx, u, c, false);
      ctx.restore();
      break;
  }
  ctx.restore();
}

// ---------- Om ----------

function om(ctx: Ctx, u: number, family: string, size: number, colour: string, dy = 0) {
  ctx.fillStyle = colour;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${size * u}px "${family}", serif`;
  ctx.fillText(OM, 0, dy * u + size * u * 0.06);
}

// ---------- Initials monograms ----------

// Text centred at (0, dy), shrunk if it's wider than maxW (all in 100-box units).
function letters(ctx: Ctx, u: number, text: string, family: string, size: number, maxW: number, colour: string, dy = 0) {
  ctx.font = `${size * u}px "${family}", serif`;
  const w = ctx.measureText(text).width;
  const fit = w > maxW * u ? (maxW * u) / w : 1;
  ctx.font = `${size * u * fit}px "${family}", serif`;
  ctx.fillStyle = colour;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, dy * u + size * u * fit * 0.04);
}

function diamond(ctx: Ctx, u: number, x: number, y: number, r: number, colour: string) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x * u, (y - r) * u);
  ctx.lineTo((x + r) * u, y * u);
  ctx.lineTo(x * u, (y + r) * u);
  ctx.lineTo((x - r) * u, y * u);
  ctx.closePath();
  ctx.fill();
}

function line(ctx: Ctx, u: number, x0: number, y0: number, x1: number, y1: number, colour: string, width: number) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width * u;
  ctx.beginPath();
  ctx.moveTo(x0 * u, y0 * u);
  ctx.lineTo(x1 * u, y1 * u);
  ctx.stroke();
}

// a laurel branch curving up one side (dir -1 = left, 1 = right): stem plus pairs of leaves
function laurel(ctx: Ctx, u: number, dir: number, colour: string) {
  ctx.save();
  if (dir > 0) ctx.scale(-1, 1); // the right branch is the left one mirrored
  ctx.strokeStyle = colour;
  ctx.fillStyle = colour;
  ctx.lineWidth = 1.1 * u;
  const r = 40;
  const from = Math.PI * 0.62; // bottom left
  const to = Math.PI * 1.32; // top left
  ctx.beginPath();
  ctx.arc(0, 0, r * u, from, to);
  ctx.stroke();
  for (let i = 1; i <= 7; i++) {
    const t = from + ((to - from) * i) / 8;
    const x = Math.cos(t) * r;
    const y = Math.sin(t) * r;
    const grow = Math.atan2(-Math.sin(t), -Math.cos(t)); // leaves point along the stem, upwards
    for (const side of [-0.6, 0.6]) {
      ctx.save();
      ctx.translate(x * u, y * u);
      ctx.rotate(grow + side);
      petal(ctx, (10 - i * 0.5) * u, 3.4 * u);
      ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore();
}

function monogram(ctx: Ctx, u: number, style: SymbolStyle, c: SymbolColours) {
  const [a, b] = (c.initials ?? ["R", "A"]).map((x) => x.trim().slice(0, 2).toUpperCase() || "·");
  switch (style) {
    case "mono-classic":
      // R & A between two fine rules with diamonds
      ctx.save();
      ctx.translate(-26 * u, 0);
      letters(ctx, u, a, "Cinzel Decorative", 46, 32, c.main);
      ctx.restore();
      ctx.save();
      ctx.translate(26 * u, 0);
      letters(ctx, u, b, "Cinzel Decorative", 46, 32, c.main);
      ctx.restore();
      letters(ctx, u, "&", "Playfair Display", 24, 14, c.accent, 1);
      for (const y of [-30, 30]) {
        line(ctx, u, -42, y, -6, y, c.accent, 0.8);
        line(ctx, u, 6, y, 42, y, c.accent, 0.8);
        diamond(ctx, u, 0, y, 2.6, c.accent);
      }
      break;
    case "mono-circle":
      // two initials split by a fine line, inside a double ring of dots
      ring(ctx, u, 46, c.accent, 1.4);
      ring(ctx, u, 41.5, c.accent, 0.5);
      dots(ctx, u, 40, 37.5, 0.6, c.accent);
      ctx.save();
      ctx.translate(-14 * u, 0);
      letters(ctx, u, a, "Cinzel", 38, 22, c.main);
      ctx.restore();
      ctx.save();
      ctx.translate(14 * u, 0);
      letters(ctx, u, b, "Cinzel", 38, 22, c.main);
      ctx.restore();
      line(ctx, u, 0, -18, 0, 18, c.accent, 0.8);
      diamond(ctx, u, 0, -22, 2, c.accent);
      diamond(ctx, u, 0, 22, 2, c.accent);
      break;
    case "mono-script": {
      // overlapping script initials over a flowing swash
      ctx.save();
      ctx.translate(-12 * u, -4 * u);
      letters(ctx, u, a, "Pinyon Script", 62, 40, c.main);
      ctx.restore();
      ctx.save();
      ctx.translate(14 * u, 6 * u);
      letters(ctx, u, b, "Pinyon Script", 62, 40, c.accent);
      ctx.restore();
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 1 * u;
      ctx.beginPath();
      ctx.moveTo(-40 * u, 30 * u);
      ctx.bezierCurveTo(-18 * u, 22 * u, 4 * u, 40 * u, 22 * u, 30 * u);
      ctx.bezierCurveTo(30 * u, 26 * u, 36 * u, 27 * u, 40 * u, 31 * u);
      ctx.stroke();
      diamond(ctx, u, 0, 31, 1.8, c.accent);
      break;
    }
    case "mono-crest":
      // stacked initials inside a palace arch, with a small kalash dot on top
      arch(ctx, u, c.accent);
      letters(ctx, u, a, "Cinzel", 30, 34, c.main, -14);
      letters(ctx, u, "&", "Playfair Display", 14, 10, c.accent, 4);
      letters(ctx, u, b, "Cinzel", 30, 34, c.main, 22);
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.arc(0, -53 * u, 2.4 * u, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "mono-wreath":
      // initials in a laurel wreath
      laurel(ctx, u, -1, c.accent);
      laurel(ctx, u, 1, c.accent);
      letters(ctx, u, `${a}${b}`.length > 2 ? `${a}·${b}` : `${a}${b}`, "Marcellus", 34, 50, c.main, -1);
      diamond(ctx, u, 0, -22, 2.2, c.accent);
      diamond(ctx, u, 0, 20, 2.2, c.accent);
      break;
  }
}

// ---------- Ganesh ji ----------

// A front-facing Ganesh ji face: crown, face, big ears, curling trunk, tusks, eyes and tilak.
// filled: solid shapes with the details cut in the background colour; otherwise line art.
function ganesh(ctx: Ctx, u: number, c: SymbolColours, filled: boolean) {
  const P = (d: string) => new Path2D(scalePath(d, u));
  const crown = P("M-15,-30 L-15,-37 Q-11,-44 -8,-40 Q-4,-50 0,-58 Q4,-50 8,-40 Q11,-44 15,-37 L15,-30 Z");
  const band = P("M-18,-31 Q0,-34 18,-31 L17,-25 Q0,-28 -17,-25 Z");
  const face = P("M-16,-26 C-19,-12 -14,1 -7,6 L7,6 C14,1 19,-12 16,-26 Q0,-29 -16,-26 Z");
  const earL = P("M-15,-22 C-28,-31 -47,-25 -45,-8 C-44,4 -35,13 -25,11 C-20,10 -16,5 -13,0 Z");
  const earR = P("M15,-22 C28,-31 47,-25 45,-8 C44,4 35,13 25,11 C20,10 16,5 13,0 Z");
  const trunk = new Path2D(trunkPath(u));
  const tuskL = P("M-7,5 Q-13,11 -11,19 Q-8,13 -3,8 Z");
  const tuskR = P("M7,5 Q10,8 9.5,11 Q7.5,9 4.5,7.5 Z");

  const line = c.accent;
  const cut = filled ? c.surface : c.accent;
  ctx.lineWidth = 2.2 * u;

  for (const part of [earL, earR, face, trunk, band, crown]) {
    if (filled) {
      ctx.fillStyle = c.accent;
      ctx.fill(part);
      ctx.strokeStyle = c.surface;
      ctx.lineWidth = 1.2 * u;
      ctx.stroke(part);
    } else {
      ctx.fillStyle = c.surface;
      ctx.fill(part); // hide lines of the shapes behind
      ctx.strokeStyle = line;
      ctx.lineWidth = 2.2 * u;
      ctx.stroke(part);
    }
  }

  // inner ear folds
  ctx.strokeStyle = cut;
  ctx.lineWidth = 1.3 * u;
  ctx.stroke(P("M-19,-17 C-30,-22 -39,-15 -37,-5 C-36,2 -30,6 -24,5"));
  ctx.stroke(P("M19,-17 C30,-22 39,-15 37,-5 C36,2 30,6 24,5"));

  // tusks: light like ivory (cut out when filled, outlined in line art)
  ctx.fillStyle = c.surface;
  ctx.fill(tuskL);
  ctx.fill(tuskR);
  if (!filled) {
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.4 * u;
    ctx.stroke(tuskL);
    ctx.stroke(tuskR);
  }

  // eyes
  ctx.fillStyle = cut;
  ctx.fill(P("M-11.5,-11 Q-7,-15.5 -2.5,-11 Q-7,-8 -11.5,-11 Z"));
  ctx.fill(P("M11.5,-11 Q7,-15.5 2.5,-11 Q7,-8 11.5,-11 Z"));

  // tilak: a "U" with a red dot
  ctx.strokeStyle = cut;
  ctx.lineWidth = 1.5 * u;
  ctx.stroke(P("M-3.5,-24 L-2.2,-17.5 Q0,-15.5 2.2,-17.5 L3.5,-24"));
  ctx.fillStyle = "#d4373c";
  ctx.beginPath();
  ctx.arc(0, -20 * u, 1.7 * u, 0, Math.PI * 2);
  ctx.fill();

  // jewels on the crown band
  ctx.fillStyle = cut;
  for (const dx of [-11, -5.5, 0, 5.5, 11]) {
    ctx.beginPath();
    ctx.arc(dx * u, -28.5 * u, 1.1 * u, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, -46 * u, 1.6 * u, 0, Math.PI * 2);
  ctx.fill();

  // trunk rings
  ctx.strokeStyle = cut;
  ctx.lineWidth = 1 * u;
  for (const ty of [12, 18, 24]) {
    ctx.beginPath();
    ctx.moveTo(-4.5 * u + ty * 0.05 * u, ty * u);
    ctx.quadraticCurveTo(0, (ty + 1.5) * u, (4.5 + ty * 0.05) * u, ty * u);
    ctx.stroke();
  }
}

// The trunk as a tapering tube along a curl to the right.
function trunkPath(u: number): string {
  const pts: [number, number][] = [];
  const bez = (t: number, a: number[], b: number[], c2: number[], d: number[]) => {
    const m = 1 - t;
    return [m * m * m * a[0] + 3 * m * m * t * b[0] + 3 * m * t * t * c2[0] + t * t * t * d[0], m * m * m * a[1] + 3 * m * m * t * b[1] + 3 * m * t * t * c2[1] + t * t * t * d[1]];
  };
  for (let i = 0; i <= 24; i++) pts.push(bez(i / 24, [0, 2], [0, 20], [-2, 30], [6, 36]) as [number, number]);
  for (let i = 1; i <= 16; i++) pts.push(bez(i / 16, [6, 36], [12, 40], [19, 36], [16, 28]) as [number, number]);
  for (let i = 1; i <= 8; i++) pts.push(bez(i / 8, [16, 28], [14, 24], [11, 26], [12, 29]) as [number, number]);
  const left: string[] = [];
  const right: string[] = [];
  pts.forEach((p, i) => {
    const q = pts[Math.min(pts.length - 1, i + 1)];
    const o = pts[Math.max(0, i - 1)];
    let dx = q[0] - o[0];
    let dy = q[1] - o[1];
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    const w = 7 - 5 * (i / (pts.length - 1)); // half-width tapers from 7 to 2
    left.push(`${(p[0] - dy * w) * u},${(p[1] + dx * w) * u}`);
    right.push(`${(p[0] + dy * w) * u},${(p[1] - dx * w) * u}`);
  });
  return `M${left.join(" L")} L${right.reverse().join(" L")} Z`;
}

// Scales the numbers in an SVG path by u.
function scalePath(d: string, u: number): string {
  return d.replace(/-?\d+(\.\d+)?/g, (n) => String(Number(n) * u));
}

// ---------- frames ----------

function ring(ctx: Ctx, u: number, r: number, colour: string, width: number) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width * u;
  ctx.beginPath();
  ctx.arc(0, 0, r * u, 0, Math.PI * 2);
  ctx.stroke();
}

function dots(ctx: Ctx, u: number, count: number, r: number, size: number, colour: string) {
  ctx.fillStyle = colour;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * u, Math.sin(a) * r * u, size * u, 0, Math.PI * 2);
    ctx.fill();
  }
}

function petal(ctx: Ctx, len: number, wid: number) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(wid, -len * 0.3, wid * 0.8, -len * 0.85, 0, -len);
  ctx.bezierCurveTo(-wid * 0.8, -len * 0.85, -wid, -len * 0.3, 0, 0);
  ctx.closePath();
}

function petalRing(ctx: Ctx, u: number, count: number, from: number, len: number, wid: number, colour: string, alpha: number) {
  ctx.fillStyle = colour;
  ctx.globalAlpha = alpha;
  for (let i = 0; i < count; i++) {
    ctx.save();
    ctx.rotate((i / count) * Math.PI * 2);
    ctx.translate(0, -from * u);
    petal(ctx, len * u, wid * u);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// open lotus whose base sits `at` units below the centre
function lotus(ctx: Ctx, u: number, at: number, c: SymbolColours) {
  ctx.save();
  ctx.translate(0, at * u);
  ctx.strokeStyle = c.surface;
  ctx.lineWidth = 0.8 * u;
  for (const [a, len, alpha] of [[-1.25, 20, 0.7], [1.25, 20, 0.7], [-0.75, 25, 0.85], [0.75, 25, 0.85], [-0.28, 28, 1], [0.28, 28, 1]] as const) {
    ctx.save();
    ctx.rotate(a);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = c.accent;
    petal(ctx, len * u, 8 * u);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = c.accent;
  ctx.lineWidth = 1.4 * u;
  ctx.beginPath();
  ctx.moveTo(-26 * u, 4 * u);
  ctx.quadraticCurveTo(0, 10 * u, 26 * u, 4 * u);
  ctx.stroke();
  ctx.restore();
}

function rays(ctx: Ctx, u: number, colour: string) {
  ctx.fillStyle = colour;
  for (let i = 0; i < 24; i++) {
    ctx.save();
    ctx.rotate((i / 24) * Math.PI * 2);
    const long = i % 2 === 0;
    ctx.beginPath();
    ctx.moveTo(-2.4 * u, -30 * u);
    ctx.lineTo(0, -(long ? 49 : 41) * u);
    ctx.lineTo(2.4 * u, -30 * u);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function arch(ctx: Ctx, u: number, colour: string) {
  const path = (inset: number) => {
    const x0 = -30 + inset;
    const x1 = 30 - inset;
    const w = x1 - x0;
    const t = -48 + inset;
    const b = 48 - inset;
    ctx.beginPath();
    ctx.moveTo(x0 * u, b * u);
    ctx.lineTo(x0 * u, (t + w * 0.45) * u);
    ctx.bezierCurveTo(x0 * u, (t + w * 0.15) * u, -w * 0.12 * u, (t + w * 0.1) * u, 0, t * u);
    ctx.bezierCurveTo(w * 0.12 * u, (t + w * 0.1) * u, x1 * u, (t + w * 0.15) * u, x1 * u, (t + w * 0.45) * u);
    ctx.lineTo(x1 * u, b * u);
    ctx.closePath();
    ctx.stroke();
  };
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1.5 * u;
  path(0);
  ctx.lineWidth = 0.6 * u;
  ctx.setLineDash([1.2 * u, 2.6 * u]);
  path(4);
  ctx.setLineDash([]);
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(0, -52 * u, 2.2 * u, 0, Math.PI * 2);
  ctx.fill();
}
