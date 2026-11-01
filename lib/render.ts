// render(ctx, page, time) draws one page at any moment in time.
// Stills, the on-screen preview and the video export all use it.
// renderInvite() strings pages together with transitions.

import { getImage } from "./assets";
import { DEFAULT_INITIALS, LAYOUTS, findBackground, surfaceOf } from "./catalog";
import { isLight, mix } from "./colors";
import { drawChariot, drawDiya, drawDoor, drawFallingPetal, drawFlower, drawMandala, rnd } from "./decorations";
import { styledBackground } from "./recolour";
import { PAINTED_MOTIONS, drawPaintedMotion } from "./motions";
import { drawSymbol } from "./symbols";
import { baseSize, designSize, lineLook, runsOf, type Run } from "./textStyles";
import type { AnimationId, Invite, Page, TextBox, TextSize, TransitionId } from "./types";

// Illustrated horse used by the Chariot animation (loaded at start-up).
export const HORSE = "/decor/horse.png";

export const W = 720;
export const H = 1280;
export const FPS = 30;
// How long each transition lasts. The illustrated ones need a little longer.
// Illustrated transitions are no longer offered; invites saved with one get a crossfade.
export const ILLUSTRATED_TRANSITIONS: TransitionId[] = ["petalShower", "mandala", "diya", "doors"];
export function transitionLength(_type: TransitionId): number {
  return 0.8;
}


export const DEFAULT_LINE_SPACING = 1.22;
const MAX_TEXT_WIDTH = 600; // even on a plain design, lines don't run edge to edge
const MIN_FIT = 0.5; // text shrinks to fit the clear area, but never below half size
const AREA_PAD = 14; // space kept between the text and the decoration
const BLOCK_ANIM = 0.9; // seconds each block takes to animate in

type Line = {
  text: string;
  runs: Run[]; // the text split around raised ordinals (23rd)
  size: number;
  font: string;
  color: string;
  x: number; // centre of the line
  y: number;
  width: number;
  boxId: string;
  bold: boolean;
  italic: boolean;
  tracking: number; // letter spacing in page units
  lh: number;
};

// The colour a text box is drawn in.
export function boxColor(box: TextBox, page: Page): string {
  if (box.color === "text") return page.palette.text;
  if (box.color === "accent") return page.palette.accent;
  return box.color;
}

// ---------- One page ----------

// Draws in 720x1280 units. The caller sets any scaling on ctx (see renderPageAt).
export function render(ctx: CanvasRenderingContext2D, page: Page, time: number) {
  ctx.save();
  ctx.clearRect(0, 0, W, H);

  drawBackground(ctx, page);

  const { groups, centerY, mono } = layoutText(ctx, page);
  if (mono) drawSymbolAt(ctx, page, mono, time);
  drawText(ctx, page, groups, time, centerY, mono);

  ctx.restore();
}

// The colour the text sits on (the paper colour of the background).
export function pageSurface(page: Page): string {
  return surfaceOf(page.colours, findBackground(page.background));
}

// Symbol size (height) on a page.
export const SYMBOL_SIZE = { big: 260, small: 130 };

// The Om / Ganesh ji symbol gently fades and grows in at the start of the page.
function drawSymbolAt(ctx: CanvasRenderingContext2D, page: Page, mono: { x: number; y: number; size: number }, time: number) {
  const e = easeOutCubic(clamp01((time - 0.05) / 0.8));
  if (e <= 0) return;
  ctx.save();
  ctx.globalAlpha = e;
  ctx.translate(mono.x, mono.y);
  ctx.scale(0.85 + 0.15 * e, 0.85 + 0.15 * e);
  drawSymbol(ctx, 0, 0, mono.size, page.symbolStyle, {
    main: page.palette.text,
    accent: page.palette.accent,
    surface: pageSurface(page),
    initials: page.initials ?? DEFAULT_INITIALS,
  });
  ctx.restore();
}

// Draws a page scaled to fill whatever size the canvas is.
export function renderPageAt(ctx: CanvasRenderingContext2D, page: Page, time: number) {
  ctx.save();
  const s = ctx.canvas.width / W;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  render(ctx, page, time);
  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, page: Page) {
  const bg = findBackground(page.background);
  const img = styledBackground(page.background, bg?.paper ?? "#ffffff", page.colours);
  if (!img) {
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, W, H);
    return;
  }
  // "cover": fill the whole canvas, crop what doesn't fit
  const iw = (img as HTMLImageElement).naturalWidth || (img as HTMLCanvasElement).width;
  const ih = (img as HTMLImageElement).naturalHeight || (img as HTMLCanvasElement).height;
  const scale = Math.max(W / iw, H / ih) * (page.bgZoom ?? 1);
  if (scale * iw < W || scale * ih < H) {
    // zoomed out: the plain paper colour fills the space around the design
    ctx.fillStyle = pageSurface(page);
    ctx.fillRect(0, 0, W, H);
  }
  ctx.drawImage(img, (W - iw * scale) / 2, (H - ih * scale) / 2, iw * scale, ih * scale);
}

export type Area = { x: number; y: number; w: number; h: number };

// The clear area of the page's design (720x1280 units), where the text goes.
// Zooming the background in pushes the decoration outwards, so the area grows with it.
export function clearArea(page: Page): Area {
  const safe = findBackground(page.background)?.safe;
  // very busy designs have no real clear area: use a sensible middle band instead
  const f = safe && safe.h >= 0.28 ? safe : { x: 0.1, y: 0.13, w: 0.8, h: 0.74 };
  const z = page.bgZoom ?? 1;
  const edge = (p: number) => Math.max(0.03, Math.min(0.97, 0.5 + (p - 0.5) * z));
  const x0 = edge(f.x), x1 = edge(f.x + f.w), y0 = edge(f.y), y1 = edge(f.y + f.h);
  return { x: x0 * W, y: y0 * H, w: (x1 - x0) * W, h: (y1 - y0) * H };
}

// Works out every line of text and its position: the symbol and lines are stacked,
// shrunk if needed so they fit the design's clear area, then placed inside it.
function layoutText(ctx: CanvasRenderingContext2D, page: Page) {
  const area = clearArea(page);
  const maxWidth = Math.min(MAX_TEXT_WIDTH, area.w - AREA_PAD * 2);
  const room = area.h - AREA_PAD * 2;
  const monoBase = page.symbol === "off" ? 0 : SYMBOL_SIZE[page.symbol];

  // handScaled = false works out the fit from the template sizes, so resizing by hand (one line,
  // or the whole block with textScale) isn't undone by the fitting
  const build = (fit: number, handScaled: boolean) => {
    const groups: Line[][] = [];
    const gapBefore: number[] = [];
    const aligns: ("left" | "center" | "right")[] = [];
    let widest = 0;
    for (const box of page.boxes) {
      const look = lineLook(box, page);
      const raw = box.text.trim();
      if (!raw) continue;
      const value = look.caps ? raw.toUpperCase() : raw;
      const full = handScaled ? designSize(box) * page.textScale : baseSize(box);
      // fitting shrinks big text more than small print, so the hierarchy stays and small text stays readable
      let size = full * Math.pow(fit, Math.max(0.55, Math.min(1.5, full / 42)));
      // letters that join (Hindi and other Indian scripts) break apart if spaced one by one
      const spacing = JOINED_SCRIPT.test(raw) ? 0 : look.tracking;
      let tracking = spacing * size;
      const measureAt = (t: string, sz: number) => runsWidth(ctx, runsOf(t), sz, look.font, look.bold, look.italic, spacing * sz);
      // a short line (a date, a name) shrinks a little rather than breaking onto two lines
      if (!raw.includes("\n") && value.length <= 34) {
        const w1 = measureAt(value, size);
        if (w1 > maxWidth && w1 <= maxWidth * 1.3) {
          size *= maxWidth / w1;
          tracking = spacing * size;
        }
      }
      const lh = size * look.spacing;
      ctx.font = fontString(size, look.font, look.bold, look.italic);
      const measure = (t: string) => measureAt(t, size);
      const lines = wrapBalanced(value, maxWidth, measure).map((text) => {
        const width = measure(text);
        widest = Math.max(widest, width / maxWidth);
        return {
          text,
          runs: runsOf(text),
          size,
          font: look.font,
          color: boxColor(box, page),
          x: W / 2,
          y: 0,
          width,
          boxId: box.id,
          bold: look.bold,
          italic: look.italic,
          tracking,
          lh,
        };
      });
      groups.push(lines);
      aligns.push(look.align);
      // space above: set by the line's role (a section break before a date or message, tight under names)
      gapBefore.push(Math.round((look.gap !== undefined ? look.gap : 14 + size * 0.3) * Math.max(fit, 0.7)));
    }
    const monoSize = monoBase * fit * (handScaled ? page.textScale : 1);
    const monoGap = monoSize && groups.length ? 36 * fit : 0;
    let total = monoSize + monoGap;
    groups.forEach((g, i) => {
      for (const l of g) total += l.lh;
      if (i > 0) total += gapBefore[i];
    });
    return { groups, gapBefore, aligns, monoSize, monoGap, total, widest };
  };

  // shrink until it fits the height, and until no single word is wider than the area
  let fit = 1;
  let r = build(fit, false);
  for (let i = 0; i < 4 && (r.total > room || r.widest > 1.001) && fit > MIN_FIT; i++) {
    fit = Math.max(MIN_FIT, fit * Math.min(room / r.total, 1 / r.widest, 1) * 0.99);
    r = build(fit, false);
  }
  const { groups, gapBefore, aligns, monoSize, monoGap, total } = build(fit, true);

  const anchor = LAYOUTS.find((l) => l.id === page.layout)?.anchor ?? 0.5;
  let y = area.y + AREA_PAD + Math.max(0, room - total) * anchor;
  const centerY = y + total / 2;
  // moving or resizing the symbol by hand doesn't shift the text around it
  const mono = monoSize
    ? { x: W / 2 + (page.symbolDx ?? 0), y: y + monoSize / 2 + (page.symbolDy ?? 0), size: monoSize * (page.symbolScale ?? 1) }
    : null;
  y += monoSize + monoGap;
  const colLeft = W / 2 - maxWidth / 2;
  const colRight = W / 2 + maxWidth / 2;
  groups.forEach((g, i) => {
    if (i > 0) y += gapBefore[i];
    for (const line of g) {
      line.y = y + line.lh / 2;
      // left / right aligned lines sit against the edges of the text column
      if (aligns[i] === "left") line.x = colLeft + line.width / 2;
      else if (aligns[i] === "right") line.x = colRight - line.width / 2;
      y += line.lh;
    }
  });

  // lines moved by hand keep their offset from the automatic position
  const byId = new Map(page.boxes.map((b) => [b.id, b]));
  for (const g of groups) {
    const box = byId.get(g[0].boxId)!;
    for (const line of g) {
      line.x += box.dx ?? 0;
      line.y += box.dy ?? 0;
    }
  }

  return { groups, centerY, mono, fit };
}

// How much the page has shrunk its text to fit the design (1 = not at all).
export function textFit(page: Page): number {
  measureCtx ??= document.createElement("canvas").getContext("2d")!;
  return layoutText(measureCtx, page).fit;
}

// Where each text box sits on the page (720x1280 units), for tapping and dragging in the editor.
export type BoxRect = { id: string; x: number; y: number; w: number; h: number; size: number }; // size = font size
let measureCtx: CanvasRenderingContext2D | null = null;
// The symbol is included with the id SYMBOL_ID.
export const SYMBOL_ID = "__symbol";
export function textBoxRects(page: Page): BoxRect[] {
  measureCtx ??= document.createElement("canvas").getContext("2d")!;
  const { groups, mono } = layoutText(measureCtx, page);
  const symbol: BoxRect[] = mono
    ? [{ id: SYMBOL_ID, x: mono.x - mono.size * 0.42, y: mono.y - mono.size / 2, w: mono.size * 0.84, h: mono.size, size: mono.size }]
    : [];
  return symbol.concat(groups.map((g) => {
    const left = Math.min(...g.map((l) => l.x - l.width / 2));
    const right = Math.max(...g.map((l) => l.x + l.width / 2));
    const top = g[0].y - g[0].lh / 2;
    const last = g[g.length - 1];
    const bottom = last.y + last.lh / 2;
    return { id: g[0].boxId, x: left, y: top, w: right - left, h: bottom - top, size: g[0].size };
  }));
}

// soft shadow under the decorations (flower, petals, chariot), not the text
function shadowFor(page: Page) {
  return isLight(pageSurface(page)) ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.45)";
}

// mono: the symbol's place (painted motions keep clear of the symbol and the text)
function drawText(
  ctx: CanvasRenderingContext2D,
  page: Page,
  groups: Line[][],
  time: number,
  centerY: number,
  mono: { x: number; y: number; size: number } | null = null,
) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (page.animation === "bloom" || page.animation === "petals" || page.animation === "chariot") {
    drawIllustrated(ctx, page, groups, time, centerY);
    return;
  }

  if (PAINTED_MOTIONS.includes(page.animation)) {
    const lines = groups.flat();
    drawPaintedMotion(ctx, page.animation, time, page.duration, {
      all: () => drawAllText(ctx, page, groups),
      masked: (mask) => drawMaskedText(ctx, page, groups, mask),
      fadeUp: (start) => drawBlocks(ctx, page, groups, time - start, "fadeUp"),
      accent: page.palette.accent,
      top: Math.min(mono ? mono.y - mono.size / 2 : Infinity, lines.length ? Math.min(...lines.map((l) => l.y - l.lh / 2)) : H / 2),
      left: Math.min(mono ? mono.x - mono.size * 0.45 : Infinity, ...lines.map((l) => l.x - l.width / 2), W / 2),
      right: Math.max(mono ? mono.x + mono.size * 0.45 : -Infinity, ...lines.map((l) => l.x + l.width / 2), W / 2),
      bottom: lines.length ? Math.max(...lines.map((l) => l.y + l.lh / 2)) : H / 2,
    });
    return;
  }

  drawBlocks(ctx, page, groups, time, page.animation);
}

// Each block animates in turn; everything is fully visible
// before the page ends (and before the transition starts).
function drawBlocks(ctx: CanvasRenderingContext2D, page: Page, groups: Line[][], time: number, anim: AnimationId) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const n = groups.length;
  const window = Math.max(BLOCK_ANIM, Math.min(page.duration - 1.4, 3));
  const stagger = n > 1 ? (window - BLOCK_ANIM) / (n - 1) : 0;

  groups.forEach((g, i) => {
    const p = clamp01((time - 0.2 - i * stagger) / BLOCK_ANIM);
    if (p <= 0) return;
    g.forEach((line, li) => {
      ctx.font = fontString(line.size, line.font, line.bold, line.italic);
      // wipe and typewriter reveal the lines of a block one after another
      const lp = clamp01(p * g.length - li);
      drawLine(ctx, anim, line, anim === "fadeUp" || anim === "blur" ? p : lp);
    });
  });
}

function drawLine(ctx: CanvasRenderingContext2D, anim: AnimationId, line: Line, p: number) {
  if (p <= 0) return;
  // Shadows ignore canvas scaling, so scale them by hand.
  const s = ctx.getTransform().a;
  ctx.save();
  ctx.fillStyle = line.color;

  if (anim === "fadeUp") {
    const e = easeOutCubic(p);
    ctx.globalAlpha = e;
    drawLineText(ctx, line, line.x, line.y + (1 - e) * 40);
  } else if (anim === "typewriter") {
    const chars = Array.from(line.text);
    const shown = chars.slice(0, Math.ceil(p * chars.length)).join("");
    ctx.textAlign = "left"; // so letters don't shift as they appear
    ctx.fillText(shown, line.x - line.width / 2, line.y);
  } else if (anim === "wipe") {
    drawWipe(ctx, line, easeInOutSine(p));
  } else if (anim === "blur") {
    const e = easeOutCubic(p);
    const blur = (1 - e) * 18;
    if (blur > 0.5) {
      // Blurred copy, made with a shadow (works on every browser, unlike ctx.filter).
      const OFF = 3000;
      ctx.shadowColor = line.color;
      ctx.shadowBlur = blur * s;
      ctx.shadowOffsetX = OFF * s;
      ctx.globalAlpha = e * (1 - e * e);
      drawLineText(ctx, line, line.x - OFF, line.y);
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
    }
    ctx.globalAlpha = e * e;
    drawLineText(ctx, line, line.x, line.y);
  }
  ctx.restore();
}

// Left-to-right reveal with a soft edge, like ink being written.
function drawWipe(ctx: CanvasRenderingContext2D, line: Line, e: number) {
  const s = ctx.getTransform().a;
  const pad = 30;
  const boxH = line.size * 2;
  const scratch = getScratch("wipe", Math.ceil(W * s), Math.ceil(boxH * s));
  const sc = scratch.getContext("2d")!;
  sc.setTransform(1, 0, 0, 1, 0, 0);
  sc.globalCompositeOperation = "source-over";
  sc.clearRect(0, 0, scratch.width, scratch.height);
  sc.setTransform(s, 0, 0, s, 0, 0);
  sc.font = ctx.font;
  sc.textAlign = "center";
  sc.textBaseline = "middle";
  sc.fillStyle = line.color;
  drawLineText(sc, line, line.x, boxH / 2);

  // Keep only the part left of the moving edge.
  const feather = 90;
  const x0 = line.x - line.width / 2 - pad;
  const x1 = line.x + line.width / 2 + pad;
  const edge = x0 + (x1 - x0 + feather) * e;
  const grad = sc.createLinearGradient(edge - feather, 0, edge, 0);
  grad.addColorStop(0, "rgba(0,0,0,1)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  sc.globalCompositeOperation = "destination-in";
  sc.fillStyle = grad;
  sc.fillRect(0, 0, W, boxH);

  ctx.shadowColor = "transparent";
  ctx.drawImage(scratch, 0, 0, scratch.width, scratch.height, 0, line.y - boxH / 2, scratch.width / s, scratch.height / s);
}

// ---------- Illustrated animations: Bloom, Petal rain, Chariot ----------

// Draws every line fully.
function drawAllText(c: CanvasRenderingContext2D, page: Page, groups: Line[][]) {
  c.save();
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.shadowColor = "transparent";
  for (const g of groups) {
    for (const line of g) {
      c.font = fontString(line.size, line.font, line.bold, line.italic);
      c.fillStyle = line.color;
      drawLineText(c, line, line.x, line.y);
    }
  }
  c.restore();
}

// Draws all the text through a mask: `mask` paints where the text should show.
function drawMaskedText(ctx: CanvasRenderingContext2D, page: Page, groups: Line[][], mask: (c: CanvasRenderingContext2D) => void) {
  const s = ctx.getTransform().a;
  const layer = getScratch("text", Math.ceil(W * s), Math.ceil(H * s));
  const lc = layer.getContext("2d")!;
  lc.setTransform(1, 0, 0, 1, 0, 0);
  lc.globalCompositeOperation = "source-over";
  lc.clearRect(0, 0, layer.width, layer.height);
  lc.setTransform(s, 0, 0, s, 0, 0);
  drawAllText(lc, page, groups);
  lc.globalCompositeOperation = "destination-in";
  mask(lc);
  lc.globalCompositeOperation = "source-over";
  ctx.save();
  ctx.shadowColor = "transparent";
  ctx.drawImage(layer, 0, 0, layer.width, layer.height, 0, 0, layer.width / s, layer.height / s);
  ctx.restore();
}

function drawIllustrated(ctx: CanvasRenderingContext2D, page: Page, groups: Line[][], time: number, centerY: number) {
  const T = Math.max(1.4, Math.min(page.duration - 1.4, 3)); // length of the effect
  const u = clamp01((time - 0.2) / T);
  if (u >= 1) {
    drawAllText(ctx, page, groups); // final state: just the text
    return;
  }
  const s = ctx.getTransform().a;
  const first = groups[0]?.[0];
  const lastGroup = groups[groups.length - 1];
  const last = lastGroup?.[lastGroup.length - 1];
  const top = first ? first.y - first.size * 0.7 : centerY;
  const bottom = last ? last.y + last.size * 0.7 : centerY;
  const midY = (top + bottom) / 2;
  const accent = page.palette.accent;
  const main = page.palette.text;

  ctx.save();
  ctx.shadowColor = shadowFor(page);
  ctx.shadowBlur = 10 * s;

  if (page.animation === "bloom") {
    // 1) a bud grows and opens  2) it bursts outward while the text appears from the centre
    const a = clamp01(u / 0.45);
    const b = clamp01((u - 0.45) / 0.55);
    if (b > 0) {
      const maxR = Math.hypot(W / 2, (bottom - top) / 2) + 40;
      const feather = 160;
      const R = easeOutCubic(b) * (maxR + feather);
      drawMaskedText(ctx, page, groups, (c) => {
        const g = c.createRadialGradient(W / 2, midY, Math.max(0, R - feather), W / 2, midY, Math.max(1, R));
        g.addColorStop(0, "#000");
        g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g;
        c.fillRect(0, 0, W, H);
      });
    }
    ctx.globalAlpha = 1 - easeInOutSine(b);
    const r = 130 * easeOutBack(a) * (1 + 2.6 * b * b);
    if (r > 0.5) {
      drawFlower(ctx, W / 2, midY, r, easeOutCubic(clamp01((a - 0.15) / 0.85)), (a - 1) * 1.2 + b * 0.8, {
        petal: accent,
        inner: mix(accent, "#ffffff", 0.45),
        centre: mix(accent, "#ffb400", 0.6),
        line: mix(accent, "#000000", 0.35),
      });
    }
  } else if (page.animation === "petals") {
    // petals fall from the top; the text appears just behind the falling front
    const front = top - 80 + clamp01((u - 0.12) / 0.8) * (bottom - top + 200);
    drawMaskedText(ctx, page, groups, (c) => {
      const g = c.createLinearGradient(0, front - 140, 0, front);
      g.addColorStop(0, "#000");
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
    });
    const colors = ["#ffb400", "#ff8a1f", "#e94b6f", accent, "#fff1d6"];
    const fall = Math.min(1.7, T * 0.7);
    const spread = T - fall;
    const t = u * T;
    for (let i = 0; i < 70; i++) {
      const p = (t - rnd(i, 1) * spread) / fall;
      if (p <= 0 || p >= 1) continue;
      const x = rnd(i, 2) * W + Math.sin(p * 6 + rnd(i, 3) * 6) * 30 * (0.5 + rnd(i, 4));
      const y = -40 + p * (H + 80);
      ctx.globalAlpha = p > 0.85 ? (1 - p) / 0.15 : 1;
      drawFallingPetal(
        ctx,
        x,
        y,
        10 + rnd(i, 5) * 12,
        p * 6 * (rnd(i, 6) - 0.5) * 2 + rnd(i, 7) * 6,
        Math.cos(p * 8 + rnd(i, 8) * 6),
        colors[Math.floor(rnd(i, 9) * colors.length)],
      );
    }
  } else {
    // chariot drives across; the text appears behind it
    const scale = 0.85;
    const startX = -350 * scale - 20;
    const endX = W + 95 * scale + 20;
    const x = startX + u * (endX - startX);
    const y = midY + 109 * scale;
    const rear = x - 95 * scale;
    drawMaskedText(ctx, page, groups, (c) => {
      const g = c.createLinearGradient(rear - 150, 0, rear, 0);
      g.addColorStop(0, "#000");
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
    });
    // golden sparkle trail
    ctx.fillStyle = mix(accent, "#ffd76a", 0.5);
    for (let i = 0; i < 14; i++) {
      const tx = rear - 20 - rnd(i, 1) * 220;
      const ty = y + 40 * scale - rnd(i, 2) * 120;
      ctx.globalAlpha = (1 - (rear - tx) / 240) * 0.9;
      ctx.beginPath();
      ctx.arc(tx, ty, 2 + rnd(i, 3) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawChariot(ctx, x, y, scale, (x - startX) / (52 * scale), time, {
      body: accent,
      dark: mix(accent, "#000000", 0.3),
      line: main,
      flag: "#e94b6f",
    }, getImage(HORSE));
  }
  ctx.restore();
}

// ---------- Whole invite (pages + transitions) ----------

// When each page starts. Each page overlaps the next for the length of its transition.
export function pageStarts(invite: Invite): number[] {
  let t = 0;
  return invite.pages.map((p) => {
    const start = t;
    t += p.duration - transitionLength(p.transition);
    return start;
  });
}

export function totalDuration(invite: Invite): number {
  const starts = pageStarts(invite);
  const last = invite.pages.length - 1;
  return starts[last] + invite.pages[last].duration;
}

export function renderInvite(ctx: CanvasRenderingContext2D, invite: Invite, t: number) {
  const pages = invite.pages;
  const starts = pageStarts(invite);
  let i = 0;
  while (i + 1 < pages.length && starts[i + 1] <= t) i++;

  const prev = pages[i - 1];
  if (prev && t < starts[i - 1] + prev.duration) {
    const p = (t - starts[i]) / transitionLength(prev.transition);
    renderTransition(ctx, prev, t - starts[i - 1], pages[i], t - starts[i], prev.transition, p);
  } else {
    renderPageAt(ctx, pages[i], t - starts[i]);
  }
}

// Draws the moment p (0..1) of a transition from page a to page b.
export function renderTransition(
  ctx: CanvasRenderingContext2D,
  a: Page,
  timeA: number,
  b: Page,
  timeB: number,
  type: TransitionId,
  p: number,
) {
  if (ILLUSTRATED_TRANSITIONS.includes(type)) type = "crossfade";
  const out = ctx.canvas;
  const w = out.width;
  const h = out.height;
  const [A, B] = getLayers(w, h);
  renderPageAt(A.getContext("2d")!, a, timeA);
  renderPageAt(B.getContext("2d")!, b, timeB);

  const e = easeInOutCubic(clamp01(p));
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);

  if (type === "crossfade") {
    ctx.drawImage(A, 0, 0);
    ctx.globalAlpha = e;
    ctx.drawImage(B, 0, 0);
  } else if (type === "slide") {
    ctx.drawImage(A, -e * w, 0);
    ctx.drawImage(B, (1 - e) * w, 0);
  } else if (type === "zoom") {
    ctx.drawImage(B, 0, 0);
    ctx.globalAlpha = 1 - e;
    const z = 1 + 0.3 * e;
    ctx.translate(w / 2, h / 2);
    ctx.scale(z, z);
    ctx.drawImage(A, -w / 2, -h / 2);
  } else if (type === "wipe") {
    ctx.drawImage(A, 0, 0);
    ctx.beginPath();
    ctx.rect(0, 0, e * w, h);
    ctx.clip();
    ctx.drawImage(B, 0, 0);
  } else if (type === "rise") {
    // new page pushes the old one up
    ctx.drawImage(A, 0, -e * h);
    ctx.drawImage(B, 0, (1 - e) * h);
  } else if (type === "circle") {
    // new page opens from a growing circle in the middle
    ctx.drawImage(A, 0, 0);
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, (e * Math.hypot(w, h)) / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(B, 0, 0);
  } else if (type === "blinds") {
    // vertical slats that open one after another
    ctx.drawImage(A, 0, 0);
    const n = 8;
    const sw = w / n;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const local = clamp01(e * 1.6 - (i / n) * 0.6);
      ctx.rect(i * sw, 0, sw * local, h);
    }
    ctx.clip();
    ctx.drawImage(B, 0, 0);
  } else if (type === "curtain") {
    // old page splits down the middle and opens like doors
    ctx.drawImage(B, 0, 0);
    const half = w / 2;
    ctx.drawImage(A, 0, 0, half, h, -e * half, 0, half, h);
    ctx.drawImage(A, half, 0, half, h, half + e * half, 0, half, h);
  } else if (type === "flip") {
    // card turns over
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    const sx = e < 0.5 ? 1 - e * 2 : e * 2 - 1;
    ctx.translate(w / 2, 0);
    ctx.scale(Math.max(sx, 0.001), 1);
    ctx.drawImage(e < 0.5 ? A : B, -w / 2, 0);
  } else if (type === "diagonal") {
    // wipe from the top-left corner to the bottom-right
    ctx.drawImage(A, 0, 0);
    const d = e * (w + h);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(d, 0);
    ctx.lineTo(0, d);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(B, 0, 0);
  } else {
    drawIllustratedTransition(ctx, A, B, type, clamp01(p), timeA + timeB);
  }
  ctx.restore();
}

// Petal shower, Mandala, Diya glow and Palace doors.
// The old page is swapped for the new one while the decoration covers the screen.
function drawIllustratedTransition(
  ctx: CanvasRenderingContext2D,
  A: HTMLCanvasElement,
  B: HTMLCanvasElement,
  type: TransitionId,
  p: number,
  time: number,
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const s = w / W;
  const under = p < 0.5 ? A : B;

  if (type === "petalShower") {
    // a heavy shower of petals; the pages crossfade underneath
    const mixAB = clamp01((p - 0.35) / 0.3);
    ctx.drawImage(A, 0, 0);
    ctx.globalAlpha = mixAB;
    ctx.drawImage(B, 0, 0);
    ctx.globalAlpha = 1;
    ctx.setTransform(s, 0, 0, s, 0, 0);
    const colors = ["#ffb400", "#ff8a1f", "#e94b6f", "#c2185b", "#fff1d6", "#ff6f3c"];
    for (let i = 0; i < 220; i++) {
      const local = (p - rnd(i, 1) * 0.45) / 0.55;
      if (local <= 0 || local >= 1) continue;
      const x = rnd(i, 2) * W + Math.sin(local * 5 + rnd(i, 3) * 6) * 40;
      const y = -60 + local * (H + 120);
      drawFallingPetal(ctx, x, y, 22 + rnd(i, 5) * 22, local * 5 + rnd(i, 7) * 6, Math.cos(local * 7 + rnd(i, 8) * 6), colors[Math.floor(rnd(i, 9) * colors.length)]);
    }
    return;
  }

  ctx.drawImage(under, 0, 0);
  ctx.setTransform(s, 0, 0, s, 0, 0);
  const cover = 1 - Math.abs(2 * p - 1); // 0 → 1 (fully covered at the middle) → 0
  const maxR = Math.hypot(W, H) / 2 + 20;

  if (type === "mandala") {
    // a turning mandala grows to fill the screen, then shrinks away
    drawMandala(ctx, W / 2, H / 2, maxR * easeInOutSine(cover), p * Math.PI, MAROON_GOLD);
  } else if (type === "diya") {
    // a diya lights up, its warm glow fills the screen, then fades into the new page
    const flameX = W / 2 + 40;
    const flameY = H / 2 - 30;
    const g = ctx.createRadialGradient(flameX, flameY, 0, flameX, flameY, Math.max(1, maxR * 1.4 * easeInOutSine(cover)));
    g.addColorStop(0, "rgba(255,248,225,1)");
    g.addColorStop(0.55, "rgba(255,214,140,0.95)");
    g.addColorStop(1, "rgba(255,180,80,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    const wash = clamp01(1 - Math.abs(p - 0.5) / 0.15); // hides the swap completely
    ctx.fillStyle = `rgba(255,244,214,${wash})`;
    ctx.fillRect(0, 0, W, H);
    const lampAlpha = Math.min(clamp01(p / 0.15), clamp01((1 - p) / 0.2));
    ctx.globalAlpha = lampAlpha;
    drawDiya(ctx, W / 2, H / 2 + 40, 1.6, time);
    ctx.globalAlpha = 1;
  } else if (type === "doors") {
    // ornate palace doors close, then open onto the new page
    const close = easeInOutCubic(clamp01(p / 0.45));
    const open = easeInOutCubic(clamp01((p - 0.55) / 0.45));
    const shut = close - open; // 0 open … 1 closed
    drawDoor(ctx, -W / 2 + (W / 2) * shut, W / 2, H, "left", MAROON_GOLD);
    drawDoor(ctx, W - (W / 2) * shut, W / 2, H, "right", MAROON_GOLD);
  }
}

const MAROON_GOLD = { base: "#5c1424", dark: "#3e0b18", gold: "#e3b04b", light: "#f6dfa4" };

// ---------- Helpers ----------

// Off-screen canvases, reused between frames.
const layerCache = new Map<string, [HTMLCanvasElement, HTMLCanvasElement]>();
function getLayers(w: number, h: number) {
  const key = w + "x" + h;
  let pair = layerCache.get(key);
  if (!pair) {
    pair = [makeCanvas(w, h), makeCanvas(w, h)];
    layerCache.set(key, pair);
  }
  return pair;
}

const scratchCache = new Map<string, HTMLCanvasElement>();
function getScratch(name: string, w: number, h: number) {
  const key = name + w + "x" + h;
  let c = scratchCache.get(key);
  if (!c) {
    c = makeCanvas(w, h);
    scratchCache.set(key, c);
  }
  return c;
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function fontString(size: number, family: string, bold = false, italic = false) {
  return `${italic ? "italic " : ""}${bold ? "700 " : ""}${size}px "${family}", Georgia, serif`;
}

const SUP = 0.58; // raised ordinals are this much of the font size
// Devanagari, Bengali, Gurmukhi, Gujarati, Odia, Tamil, Telugu, Kannada, Malayalam, Arabic/Urdu
const JOINED_SCRIPT = /[\u0900-\u0DFF\u0600-\u06FF]/;

// Width of a line's runs, with letter spacing.
function runsWidth(ctx: CanvasRenderingContext2D, runs: Run[], size: number, family: string, bold: boolean, italic: boolean, tracking: number) {
  let w = 0;
  let chars = 0;
  for (const r of runs) {
    ctx.font = fontString(r.sup ? size * SUP : size, family, bold, italic);
    w += ctx.measureText(r.sup ? r.text.toLowerCase() : r.text).width;
    chars += Array.from(r.text).length;
  }
  ctx.font = fontString(size, family, bold, italic);
  return w + tracking * Math.max(0, chars - 1);
}

// Draws one line centred on (x, y): raised ordinals and letter spacing included.
function drawLineText(ctx: CanvasRenderingContext2D, line: Line, x: number, y: number) {
  const plain = !line.tracking && line.runs.length === 1 && !line.runs[0].sup;
  if (plain) {
    ctx.fillText(line.text, x, y);
    return;
  }
  ctx.save();
  ctx.textAlign = "left";
  let cx = x - line.width / 2;
  for (const r of line.runs) {
    const size = r.sup ? line.size * SUP : line.size;
    ctx.font = fontString(size, line.font, line.bold, line.italic);
    const text = r.sup ? r.text.toLowerCase() : r.text;
    const ry = r.sup ? y - line.size * 0.26 : y;
    if (!line.tracking) {
      ctx.fillText(text, cx, ry);
      cx += ctx.measureText(text).width;
    } else {
      for (const ch of Array.from(text)) {
        ctx.fillText(ch, cx, ry);
        cx += ctx.measureText(ch).width + line.tracking;
      }
    }
  }
  ctx.restore();
}

// Splits text into lines no wider than maxWidth, balanced so the lines come out
// about the same length (instead of one long line and a short leftover). Keeps typed line breaks.
function wrapBalanced(text: string, maxWidth: number, measure: (t: string) => number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) continue;
    const greedy = (limit: number) => {
      const lines: string[] = [];
      let line = "";
      for (const word of words) {
        const test = line ? line + " " + word : word;
        if (measure(test) > limit && line) {
          lines.push(line);
          line = word;
        } else line = test;
      }
      if (line) lines.push(line);
      return lines;
    };
    const first = greedy(maxWidth);
    if (first.length < 2) {
      out.push(...first);
      continue;
    }
    // narrow the width as far as possible without needing another line
    let lo = maxWidth * 0.4;
    let hi = maxWidth;
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2;
      if (greedy(mid).length > first.length) lo = mid;
      else hi = mid;
    }
    out.push(...greedy(hi));
  }
  return out;
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;
const easeOutBack = (x: number) => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
