// Painted motions: Recraft illustrations (cut out by scripts/build-elements.mjs) brought to life in code.
// Each motion draws its scene and reveals the text its own way. Everything is a pure function of
// time, so the preview, stills and the exported video match frame for frame.

import elementsJson from "@/data/elements.json";
import { getImage } from "./assets";
import { rnd } from "./decorations";
import type { AnimationId } from "./types";

type Ctx = CanvasRenderingContext2D;
type Img = { src: string; w: number; h: number };
type RigPart = Img & { name: string; x: number; y: number; px: number; py: number; parent?: string; far?: boolean };
type Rig = { w: number; h: number; body: Img & { x: number; y: number }; parts: RigPart[] };

const ELEMENTS = elementsJson as unknown as { items: Record<string, Img[]>; rigs: Record<string, Rig> };
const W = 720;
const H = 1280;

// How a motion shows the text (render.ts supplies these, so this file doesn't depend on it).
export type TextKit = {
  all: (alpha?: number) => void; // every line, fully shown
  masked: (mask: (c: Ctx) => void) => void; // every line, only where `mask` paints
  fadeUp: (start: number) => void; // lines rise and fade in one after another from `start` seconds
  bottom: number; // where the text block ends (page units)
  top: number; // where the block (symbol and text) starts
  left: number; // and its sides
  right: number;
  accent: string; // the palette's accent colour
};

type Motion = (ctx: Ctx, time: number, duration: number, text: TextKit) => void;

const items = ELEMENTS.items;
const rigImages = (r: Rig) => [r.body.src, ...r.parts.map((p) => p.src)];
const srcs = (list: Img[]) => list.map((i) => i.src);

// Every painted motion: how to draw it and the images it needs.
const MOTIONS: Partial<Record<AnimationId, { draw: Motion; assets: () => string[] }>> = {
  ghodi: { draw: (...a) => ghodi(...a), assets: () => rigImages(ELEMENTS.rigs.horseRig) },
  elephants: { draw: (...a) => elephants(...a), assets: () => rigImages(ELEMENTS.rigs.elephantRig) },
  peacock: { draw: (...a) => peacockDance(...a), assets: () => srcs([...items.peacock, ...items.feather]) },
  parrots: { draw: (...a) => parrots(...a), assets: () => srcs(items.parrot) },
  rosePetals: { draw: (...a) => rosePetals(...a), assets: () => srcs([...items.petal, ...items["petal-b"]]) },
  marigolds: { draw: (...a) => marigolds(...a), assets: () => srcs(items.marigold) },
  diyaRow: { draw: (...a) => diyaRow(...a), assets: () => srcs(items.diya) },
  lanterns: { draw: (...a) => lanterns(...a), assets: () => srcs(items.lantern) },
  lotus: { draw: (...a) => lotusBloom(...a), assets: () => srcs(items.lotus) },
  doors: { draw: (...a) => palaceDoors(...a), assets: () => srcs(items.door) },
  skyLanterns: { draw: (...a) => skyLanterns(...a), assets: () => srcs(items.skylantern) },
  mehendi: { draw: (...a) => mehendi(...a), assets: () => srcs(items.mehendi) },
  sparkles: { draw: (...a) => sparkles(...a), assets: () => [] },
  kalash: { draw: (...a) => kalash(...a), assets: () => srcs([...items.kalash, ...items.marigold]) },
  butterflies: { draw: (...a) => butterflies(...a), assets: () => srcs(items.butterfly) },
  clouds: { draw: (...a) => clouds(...a), assets: () => srcs(items.cloud) },
};

export const PAINTED_MOTIONS = Object.keys(MOTIONS) as AnimationId[];

// The images each motion needs (loaded before it can draw).
export function motionAssets(id: AnimationId): string[] {
  return MOTIONS[id]?.assets() ?? [];
}

export function drawPaintedMotion(ctx: Ctx, id: AnimationId, time: number, duration: number, text: TextKit) {
  MOTIONS[id]?.draw(ctx, time, duration, text);
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const DEG = Math.PI / 180;

function draw(ctx: Ctx, img: Img, x: number, y: number, w = img.w, h = img.h) {
  const el = getImage(img.src);
  if (el) ctx.drawImage(el, x, y, w, h);
}

// ---------- Baraat ghodi: a painted horse gallops across, revealing the text behind it ----------

// Angles (radians) for each part at gallop phase u (0..1, one stride).
function gallopPose(u: number): Record<string, number> {
  const pose: Record<string, number> = {};
  // when each leg swings (a rotary gallop: hind legs, then front legs)
  const legs: [string, number, number, number, number][] = [
    // name, phase offset, swing (deg), fold (deg), fold direction
    ["hindFar", 0.0, 26, 34, -1],
    ["hindNear", 0.1, 26, 34, -1],
    ["frontFar", 0.48, 30, 62, 1],
    ["frontNear", 0.58, 30, 62, 1],
  ];
  for (const [name, off, swing, fold, dir] of legs) {
    const a = 2 * Math.PI * (u + off);
    // negative = hoof forward (the horse faces right)
    pose[name] = -swing * DEG * Math.sin(a);
    // the lower leg folds while the leg swings forward (off the ground), and straightens on landing
    const lift = Math.max(0, Math.cos(a));
    pose[name + "Low"] = dir * fold * DEG * Math.pow(lift, 1.6);
  }
  pose.tail = (16 + 7 * Math.sin(2 * Math.PI * u + 1.2)) * DEG;
  return pose;
}

// Draws a cut-out rig: far-side parts (darker), the tail, the body, then the near-side parts.
// Lower legs are drawn before their upper legs so the upper part covers the joint.
function drawRig(ctx: Ctx, rig: Rig, pose: Record<string, number>) {
  const byName = new Map(rig.parts.map((p) => [p.name, p]));
  const place = (p: RigPart) => {
    if (p.parent) place(byName.get(p.parent)!);
    ctx.translate(p.px, p.py);
    ctx.rotate(pose[p.name] ?? 0);
    ctx.translate(-p.px, -p.py);
  };
  const part = (p: RigPart) => {
    ctx.save();
    place(p);
    draw(ctx, p, p.x, p.y);
    ctx.restore();
  };
  const lowersFirst = (list: RigPart[]) => [...list.filter((p) => p.parent), ...list.filter((p) => !p.parent)];
  ctx.save();
  if ("filter" in ctx) ctx.filter = "brightness(0.8)"; // far legs a little darker, for depth
  lowersFirst(rig.parts.filter((p) => p.far)).forEach(part);
  ctx.restore();
  rig.parts.filter((p) => p.name === "tail").forEach(part);
  draw(ctx, rig.body, rig.body.x, rig.body.y);
  lowersFirst(rig.parts.filter((p) => !p.far && p.name !== "tail")).forEach(part);
}

function ghodi(ctx: Ctx, time: number, duration: number, text: TextKit) {
  const rig = ELEMENTS.rigs.horseRig;
  const run = Math.min(3.4, duration * 0.72); // seconds to cross the page
  const s = 300 / 470; // horse about 300 units tall (the rig's horse is ~470 tall)
  const width = rig.w * s;
  const p = clamp01(time / run);
  // glides in fast, eases a touch in the middle, carries on out
  const x = -width + (W + width * 1.15) * (0.15 * easeInOut(p) + 0.85 * p);
  const feet = Math.min(H - 70, text.bottom + 330); // where the hooves land
  const nose = x + width * 0.78;

  // the text appears behind the horse as it passes
  if (p >= 1) text.all();
  else
    text.masked((c) => {
      const g = c.createLinearGradient(nose - 220, 0, nose - 20, 0);
      g.addColorStop(0, "rgba(0,0,0,1)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
    });
  if (p >= 1) return;

  const stride = 0.46; // seconds per stride
  const u = (time / stride) % 1;
  const bob = -9 * Math.abs(Math.sin(Math.PI * 2 * u)); // the body rises with each push
  const pitch = 2.2 * DEG * Math.sin(Math.PI * 2 * u + 0.8);

  // a soft shadow under the horse
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(x + width * 0.55, feet - 8, width * 0.28, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // dust kicked up behind the hooves
  ctx.save();
  for (let i = 0; i < 10; i++) {
    const age = ((time * 1.6 + i / 10) % 1);
    const dx = x + width * (0.25 + 0.5 * rnd(i, 1)) - age * 90;
    ctx.globalAlpha = 0.16 * (1 - age);
    ctx.fillStyle = "#c9b28a";
    ctx.beginPath();
    ctx.arc(dx, feet - age * 26, 8 + age * 22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  ctx.translate(x, feet - 525 * s + bob);
  ctx.scale(s, s);
  ctx.translate(rig.w / 2, rig.h / 2);
  ctx.rotate(pitch);
  ctx.translate(-rig.w / 2, -rig.h / 2);
  drawRig(ctx, rig, gallopPose(u));
  ctx.restore();
}

// ---------- Rose petal shower: painted petals tumble down while the text rises in ----------

function rosePetals(ctx: Ctx, time: number, duration: number, text: TextKit) {
  text.fadeUp(0.5);
  const petals = [...ELEMENTS.items.petal, ...ELEMENTS.items["petal-b"]];
  const fadeOut = clamp01((duration - time) / 0.8); // the last frame is clean
  if (fadeOut <= 0) return;
  const N = 34;
  for (let i = 0; i < N; i++) {
    const img = petals[i % petals.length];
    const speed = 150 + rnd(i, 2) * 120; // units per second
    const start = rnd(i, 3) * 2.2; // when it starts falling
    const t = time - start;
    if (t < 0) continue;
    const y = -90 + t * speed;
    if (y > H + 90) continue;
    const size = 42 + rnd(i, 4) * 40;
    const x = rnd(i, 5) * W + Math.sin(t * (1 + rnd(i, 6)) + i) * (26 + rnd(i, 7) * 40);
    const spin = t * (1.2 + rnd(i, 8) * 2) + i;
    ctx.save();
    ctx.globalAlpha = fadeOut;
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 0.9 + i) * 1.2 + i);
    ctx.scale(0.25 + 0.75 * Math.abs(Math.cos(spin)), 1); // tumbling: the petal turns edge-on and back
    const k = size / Math.max(img.w, img.h);
    draw(ctx, img, (-img.w * k) / 2, (-img.h * k) / 2, img.w * k, img.h * k);
    ctx.restore();
  }
}

// ---------- Diya row: clay lamps rise in under the text and light one by one ----------

function flame(ctx: Ctx, x: number, y: number, h: number, time: number, seed: number, on: number) {
  if (on <= 0) return;
  const flick = 1 + 0.08 * Math.sin(time * 17 + seed) + 0.05 * Math.sin(time * 29 + seed * 3);
  const sway = 0.12 * Math.sin(time * 5.3 + seed) + 0.05 * Math.sin(time * 11 + seed);
  const fh = h * flick * (0.4 + 0.6 * on);
  // warm glow (a tint, so it shows on light and dark paper alike)
  ctx.save();
  const r = h * 1.6;
  const glow = ctx.createRadialGradient(x, y - fh * 0.45, 0, x, y - fh * 0.45, r);
  glow.addColorStop(0, `rgba(255,170,60,${0.32 * on})`);
  glow.addColorStop(0.5, `rgba(255,150,40,${0.12 * on})`);
  glow.addColorStop(1, "rgba(255,140,30,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(x - r, y - fh * 0.45 - r, r * 2, r * 2);
  ctx.restore();
  // the flame: a teardrop that leans and flickers
  ctx.save();
  ctx.translate(x, y);
  ctx.transform(1, 0, sway, 1, 0, 0);
  const w = fh * 0.36;
  const g = ctx.createLinearGradient(0, 0, 0, -fh);
  g.addColorStop(0, `rgba(255,120,30,${on})`);
  g.addColorStop(0.35, `rgba(255,200,80,${on})`);
  g.addColorStop(1, `rgba(255,250,220,${on})`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -fh);
  ctx.bezierCurveTo(w * 0.9, -fh * 0.55, w, -fh * 0.1, 0, 0);
  ctx.bezierCurveTo(-w, -fh * 0.1, -w * 0.9, -fh * 0.55, 0, -fh);
  ctx.fill();
  // bright core
  ctx.fillStyle = `rgba(255,255,240,${0.85 * on})`;
  ctx.beginPath();
  ctx.ellipse(0, -fh * 0.28, w * 0.35, fh * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function diyaRow(ctx: Ctx, time: number, _duration: number, text: TextKit) {
  const diyas = ELEMENTS.items.diya;
  const n = 5;
  const size = 92; // diya width
  const gap = 18;
  const rowW = n * size + (n - 1) * gap;
  const baseY = Math.min(H - 110, text.bottom + 150); // bottom of the diyas
  for (let i = 0; i < n; i++) {
    const img = diyas[i % diyas.length];
    const k = size / img.w;
    const h = img.h * k;
    const appear = clamp01((time - 0.15 - i * 0.18) / 0.6);
    if (appear <= 0) continue;
    const e = 1 - Math.pow(1 - appear, 3);
    const x = W / 2 - rowW / 2 + i * (size + gap);
    const y = baseY - h + (1 - e) * 40;
    ctx.save();
    ctx.globalAlpha = e;
    draw(ctx, img, x, y, size, h);
    ctx.restore();
    // the wick sits at the top middle of the painting; flames light one after another
    const lit = clamp01((time - 0.9 - i * 0.22) / 0.35);
    flame(ctx, x + size / 2, y + h * 0.06, size * 0.42, time, i * 7.3, lit * e);
  }
  text.fadeUp(1.2);
}

// ---------- shared bits ----------

const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// overshoots a little and settles, like something dropping on a spring
const easeBack = (x: number) => {
  const t = clamp01(x);
  return 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);
};

// An image drawn centred at (x, y), `size` across its longer side.
function drawCentred(ctx: Ctx, img: Img, x: number, y: number, size: number, alpha = 1) {
  const k = size / Math.max(img.w, img.h);
  ctx.save();
  ctx.globalAlpha *= alpha;
  draw(ctx, img, x - (img.w * k) / 2, y - (img.h * k) / 2, img.w * k, img.h * k);
  ctx.restore();
}

// A soft warm glow (a tint, so it shows on light and dark paper alike).
function glow(ctx: Ctx, x: number, y: number, r: number, strength: number, rgb = "255,170,60") {
  if (strength <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${0.34 * strength})`);
  g.addColorStop(0.5, `rgba(${rgb},${0.12 * strength})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// An image recoloured to one colour (kept, so it's made once per colour).
const tintCache = new Map<string, HTMLCanvasElement>();
function tinted(img: Img, colour: string): HTMLCanvasElement | null {
  const key = img.src + colour;
  const hit = tintCache.get(key);
  if (hit) return hit;
  const el = getImage(img.src);
  if (!el) return null;
  const c = document.createElement("canvas");
  c.width = img.w;
  c.height = img.h;
  const g = c.getContext("2d")!;
  g.drawImage(el, 0, 0, img.w, img.h);
  g.globalCompositeOperation = "source-in";
  g.fillStyle = colour;
  g.fillRect(0, 0, img.w, img.h);
  tintCache.set(key, c);
  return c;
}

// How far down something hanging from the top at x can reach: beside the block it can go lower,
// above the block it stops short of it.
function hangRoom(text: TextKit, x: number, halfWidth: number): number {
  const beside = x + halfWidth < text.left - 8 || x - halfWidth > text.right + 8;
  return beside ? Math.min(620, Math.max(text.top - 30, text.bottom - 40)) : Math.max(120, text.top - 30);
}

// ---------- Elephant procession: two elephants walk in, meet below the text and raise their trunks ----------

function elephantPose(u: number, amp: number, trunk: number): Record<string, number> {
  const legs: [string, number][] = [
    ["hindNear", 0],
    ["frontNear", 0.25],
    ["hindFar", 0.5],
    ["frontFar", 0.75],
  ];
  const pose: Record<string, number> = {};
  for (const [name, off] of legs) pose[name] = -14 * DEG * amp * Math.sin(2 * Math.PI * (u + off));
  pose.trunk = trunk + 5 * DEG * Math.sin(2 * Math.PI * u * 0.5 + 0.6);
  pose.tail = 8 * DEG * Math.sin(2 * Math.PI * u + 1);
  return pose;
}

function elephants(ctx: Ctx, time: number, _duration: number, text: TextKit) {
  const rig = ELEMENTS.rigs.elephantRig;
  const s = 170 / 360; // about 170 units tall (the rig's elephant is ~360 tall, from y 79 to 439)
  const arrive = 2.4;
  const p = easeOut(time / arrive);
  const walking = time < arrive ? 1 : Math.max(0, 1 - (time - arrive) / 0.4);
  const u = time / 1.1; // one step cycle every 1.1 s
  const trunk = -30 * DEG * smooth(arrive + 0.1, arrive + 0.9, time); // trunks lift to greet
  const feet = Math.min(H - 60, text.bottom + 230);
  const bob = -3 * Math.abs(Math.sin(2 * Math.PI * u)) * walking;

  for (const side of [-1, 1]) {
    // final spot: trunk tips almost meeting in the middle; walks in from off the page
    const home = W / 2 - 14 - 600 * s;
    const tx = home - (1 - p) * (W / 2 + 240);
    ctx.save();
    if (side > 0) {
      ctx.translate(W, 0);
      ctx.scale(-1, 1); // the second elephant is the first one mirrored
    }
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(tx + 390 * s, feet - 4, 200 * s, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.translate(tx, feet - 439 * s + bob);
    ctx.scale(s, s);
    drawRig(ctx, rig, elephantPose(u + (side > 0 ? 0.37 : 0), walking, trunk));
    ctx.restore();
  }
  text.fadeUp(arrive - 0.4);
}

// ---------- Peacock dance: the peacock fans its tail open, feather by feather ----------

function peacockDance(ctx: Ctx, time: number, _duration: number, text: TextKit) {
  text.fadeUp(1.6);
  const bird = items.peacock[0];
  const feathers = items.feather;
  const size = 280; // the peacock image, across
  const k = size / Math.max(bird.w, bird.h);
  const bw = bird.w * k;
  const bh = bird.h * k;
  const appear = easeOut((time - 0.1) / 0.7);
  const bx = W / 2 - bw / 2;
  const by = Math.min(H - 40 - bh, text.bottom + 170) + (1 - appear) * 30;
  // where the tail fans out from: the bird's back
  const px = bx + bw * 0.56;
  const py = by + bh * 0.5;
  const n = 17;
  const len = 230;
  ctx.save();
  ctx.globalAlpha = appear;
  for (let i = 0; i < n; i++) {
    const f = feathers[i % feathers.length];
    const spread = (i / (n - 1) - 0.5) * 2; // -1 (left) .. 1 (right)
    const open = easeBack((time - 0.6 - Math.abs(spread) * 0.5) / 0.9);
    const shimmer = 2 * DEG * Math.sin(time * 2.2 + i) * smooth(1.5, 2.5, time);
    const angle = spread * 78 * DEG * open + shimmer;
    const fk = len / f.h;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle);
    draw(ctx, f, (-f.w * fk) / 2, -f.h * fk * (0.35 + 0.65 * clamp01(open)), f.w * fk, f.h * fk);
    ctx.restore();
  }
  draw(ctx, bird, bx, by, bw, bh);
  ctx.restore();
}

// ---------- Parrots: green parrots fly across the page, wings beating ----------

function parrots(ctx: Ctx, time: number, duration: number, text: TextKit) {
  text.fadeUp(0.7);
  const [up, down] = items.parrot;
  const flight = Math.min(3.6, duration * 0.8);
  const birds = [
    { start: 0.0, y: 0.2, dir: 1, size: 150 },
    { start: 0.45, y: 0.12, dir: 1, size: 120 },
    { start: 0.8, y: 0.3, dir: -1, size: 135 },
  ];
  birds.forEach((b, i) => {
    const t = (time - b.start) / flight;
    if (t <= 0 || t >= 1) return;
    const x = -160 + (W + 320) * t;
    const y = H * b.y + Math.sin(t * Math.PI * 2 + i) * 40 - Math.sin(t * Math.PI) * 60;
    const wing = Math.sin(time * 16 + i * 2) > 0 ? up : down; // two paintings: wings up, wings down
    ctx.save();
    ctx.translate(b.dir > 0 ? x : W - x, y);
    if (b.dir < 0) ctx.scale(-1, 1);
    ctx.rotate(Math.cos(t * Math.PI * 2 + i) * 0.12);
    drawCentred(ctx, wing, 0, 0, b.size);
    ctx.restore();
  });
}

// ---------- Butterflies: butterflies flutter in and settle around the text ----------

function butterflies(ctx: Ctx, time: number, _duration: number, text: TextKit) {
  text.fadeUp(0.5);
  const list = items.butterfly;
  const mid = (text.top + text.bottom) / 2;
  const spots = [
    { x: 110, y: text.top - 50, r: -0.4 },
    { x: W - 120, y: mid - 20, r: 0.5 },
    { x: 140, y: text.bottom + 50, r: 0.3 },
    { x: W - 150, y: text.bottom + 90, r: -0.3 },
  ];
  spots.forEach((spot, i) => {
    const img = list[i % list.length];
    const settle = 2.4 + i * 0.35;
    const t = Math.min(time, settle);
    // wanders in from off the page, then lands on its spot
    const p = easeOut(t / settle);
    const fromX = i % 2 ? W + 120 : -120;
    const fromY = H * (0.25 + 0.5 * rnd(i, 9));
    const x = fromX + (spot.x - fromX) * p + Math.sin(t * 3 + i) * 50 * (1 - p);
    const y = fromY + (spot.y - fromY) * p + Math.cos(t * 2.3 + i) * 60 * (1 - p);
    const flying = time < settle ? 1 : Math.max(0.15, 1 - (time - settle) / 0.6) * 0.3;
    const flap = 0.3 + 0.7 * Math.abs(Math.cos(time * (time < settle ? 14 : 3) + i)); // wings fold up and open
    const wings = 1 - (1 - flap) * (time < settle ? 1 : flying);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spot.r * p + Math.sin(time * 2 + i) * 0.08);
    ctx.scale(wings, 1);
    drawCentred(ctx, img, 0, 0, 70);
    ctx.restore();
  });
}

// ---------- Marigold garlands: strings of marigolds drop from the top and sway ----------

function marigolds(ctx: Ctx, time: number, _duration: number, text: TextKit) {
  const all = items.marigold;
  const flowers = all.filter((m) => m.h / m.w < 1.5);
  const leaves = all.filter((m) => m.h / m.w >= 1.5);
  const strands = [
    { x: 60, len: 1 },
    { x: 180, len: 0.72 },
    { x: 360, len: 0.5 },
    { x: 540, len: 0.72 },
    { x: 660, len: 1 },
  ];
  const size = 46;
  strands.forEach((st, si) => {
    const drop = easeBack((time - si * 0.12) / 0.9);
    if (drop <= 0) return;
    const length = Math.min(520 * st.len, hangRoom(text, st.x, 36) - size);
    const count = Math.max(2, Math.floor(length / (size * 0.82)));
    // swings after the drop and slowly settles, with a gentle breeze
    const swing = 0.16 * Math.exp(-time * 0.9) * Math.sin(time * 4.2 + si) + 0.03 * Math.sin(time * 1.3 + si * 1.7);
    ctx.save();
    ctx.translate(st.x, -10);
    // the thread
    ctx.strokeStyle = "rgba(201,160,58,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let i = 0; i <= count; i++) {
      const d = (i * length * drop) / count;
      const a = swing * (d / length);
      ctx.lineTo(Math.sin(a) * d, Math.cos(a) * d);
    }
    ctx.stroke();
    for (let i = 0; i < count; i++) {
      const d = ((i + 0.5) * length * drop) / count;
      const a = swing * (d / length);
      const img = flowers[(si * 3 + i) % flowers.length];
      drawCentred(ctx, img, Math.sin(a) * d, Math.cos(a) * d, size);
    }
    // a mango leaf at the end
    const leaf = leaves[si % leaves.length];
    const d = length * drop + size * 0.6;
    const a = swing;
    ctx.save();
    ctx.translate(Math.sin(a) * d, Math.cos(a) * d);
    ctx.rotate(-a);
    drawCentred(ctx, leaf, 0, 0, 62);
    ctx.restore();
    ctx.restore();
  });
  text.fadeUp(0.9);
}

// ---------- Swinging lanterns: brass lanterns drop in on chains and swing, glowing ----------

function lanterns(ctx: Ctx, time: number, _duration: number, text: TextKit) {
  const img = items.lantern[0];
  const hangs = [
    { x: 92, len: 0.8, size: 0.85 },
    { x: 360, len: 1, size: 1 },
    { x: 628, len: 0.8, size: 0.85 },
  ];
  hangs.forEach((hng, i) => {
    const drop = easeBack((time - 0.1 - i * 0.18) / 1.0);
    if (drop <= 0) return;
    const room = hangRoom(text, hng.x, 46) * hng.len;
    const lh = Math.min(240, Math.max(110, room * 0.6)) * hng.size; // lantern height
    const lw = (lh * img.w) / img.h;
    const chain = Math.max(16, room - lh);
    const angle = (0.22 * Math.exp(-time * 0.7) + 0.04) * Math.sin(time * 2.4 + i * 1.3);
    ctx.save();
    ctx.translate(hng.x, -20 - (1 - drop) * (chain + lh));
    ctx.rotate(angle);
    // chain
    ctx.strokeStyle = "rgba(180,140,60,0.9)";
    ctx.lineWidth = 2.2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, chain);
    ctx.stroke();
    ctx.setLineDash([]);
    glow(ctx, 0, chain + lh * 0.55, lh * 0.9, 0.7 + 0.15 * Math.sin(time * 7 + i));
    draw(ctx, img, -lw / 2, chain, lw, lh);
    ctx.restore();
  });
  text.fadeUp(0.9);
}

// ---------- Sky lanterns: glowing lanterns rise from below and drift up past the text ----------

function skyLanterns(ctx: Ctx, time: number, _duration: number, text: TextKit) {
  text.fadeUp(0.6);
  const list = items.skylantern;
  const n = 9;
  for (let i = 0; i < n; i++) {
    const img = list[i % list.length];
    const start = rnd(i, 11) * 1.4;
    const t = time - start;
    if (t < 0) continue;
    const speed = 120 + rnd(i, 12) * 80;
    const y = H + 120 - rnd(i, 15) * 380 - t * speed; // some start part-way up, so the page fills quickly
    if (y < -200) continue;
    const depth = 0.55 + rnd(i, 13) * 0.45; // nearer lanterns are bigger
    const x = 60 + rnd(i, 14) * (W - 120) + Math.sin(t * 0.8 + i) * 22;
    const size = 150 * depth * (0.85 + 0.15 * clamp01(y / H));
    const flick = 0.85 + 0.15 * Math.sin(time * 6 + i * 3);
    ctx.save();
    ctx.globalAlpha = 0.6 + 0.4 * depth;
    glow(ctx, x, y - size * 0.2, size * 0.75, flick);
    ctx.translate(x, y);
    ctx.rotate(Math.sin(t * 0.9 + i) * 0.06);
    drawCentred(ctx, img, 0, 0, size);
    ctx.restore();
  }
}

// ---------- Kalash blessing: a brass kalash rises in a golden glow, marigolds drift down ----------

function kalash(ctx: Ctx, time: number, duration: number, text: TextKit) {
  text.fadeUp(0.4);
  const img = items.kalash[0];
  const flowers = items.marigold.filter((m) => m.h / m.w < 1.5);
  const size = 190;
  const k = size / img.h;
  const appear = easeOut((time - 0.8) / 1.0);
  const cx = W / 2;
  const bottom = Math.min(H - 50, text.bottom + 60 + size);
  const cy = bottom - size / 2 + (1 - appear) * 50;
  // slowly turning rays
  ctx.save();
  ctx.translate(cx, cy - size * 0.1);
  ctx.rotate(time * 0.15);
  for (let i = 0; i < 16; i++) {
    ctx.rotate((Math.PI * 2) / 16);
    const g = ctx.createLinearGradient(0, 0, 0, -size * 1.1);
    g.addColorStop(0, `rgba(240,190,80,${0.28 * appear})`);
    g.addColorStop(1, "rgba(240,190,80,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(0, -size * 1.1);
    ctx.lineTo(6, 0);
    ctx.fill();
  }
  ctx.restore();
  glow(ctx, cx, cy, size * 0.9, appear);
  ctx.save();
  ctx.globalAlpha = appear;
  draw(ctx, img, cx - (img.w * k) / 2, cy - size / 2, img.w * k, size);
  ctx.restore();
  // a few marigolds falling around it
  const fade = clamp01((duration - time) / 0.8);
  for (let i = 0; i < 8; i++) {
    const t = time - 1.2 - rnd(i, 21) * 1.5;
    if (t < 0) continue;
    const y = cy - size - 200 + t * 140;
    if (y > bottom + 20) continue;
    const x = cx + (rnd(i, 22) - 0.5) * 440 + Math.sin(t * 2 + i) * 18;
    ctx.save();
    ctx.globalAlpha = fade * clamp01(t * 2);
    ctx.translate(x, y);
    ctx.rotate(t * (1 + rnd(i, 23)));
    drawCentred(ctx, flowers[i % flowers.length], 0, 0, 30);
    ctx.restore();
  }
}

// ---------- Lotus bloom: a bud rises from the water and opens, with ripples and floating leaves ----------

function lotusBloom(ctx: Ctx, time: number, _duration: number, text: TextKit) {
  text.fadeUp(1.6);
  const [flower, bud, ...rest] = items.lotus;
  const pads = rest[rest.length - 1];
  const petals = rest.slice(0, -1);
  const water = Math.min(H - 90, text.bottom + 230); // the water line
  const cx = W / 2;
  // ripples
  for (let i = 0; i < 3; i++) {
    const t = ((time - i * 0.7) % 2.1) / 2.1;
    if (time - i * 0.7 < 0) continue;
    ctx.strokeStyle = `rgba(80,140,150,${0.35 * (1 - t)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, water + 6, 60 + t * 230, 10 + t * 26, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // leaf pads drift in from the sides
  const padIn = easeOut((time - 0.2) / 1.2);
  drawCentred(ctx, pads, cx - 210 + (1 - padIn) * -120, water + 18, 200, padIn);
  ctx.save();
  ctx.translate(cx + 210 + (1 - padIn) * 120, water + 22);
  ctx.scale(-1, 1);
  drawCentred(ctx, pads, 0, 0, 170, padIn);
  ctx.restore();
  // the bud rises, then the open flower blooms out of it
  const rise = easeOut((time - 0.1) / 0.8);
  const bloom = easeBack((time - 0.8) / 0.9);
  if (bloom < 1) drawCentred(ctx, bud, cx, water - 70 + (1 - rise) * 80, 150, rise * (1 - clamp01(bloom * 1.4)));
  if (bloom > 0) {
    const size = 270 * (0.45 + 0.55 * bloom);
    ctx.save();
    ctx.translate(cx, water - 20);
    ctx.scale(1, 0.85 + 0.15 * bloom);
    drawCentred(ctx, flower, 0, -size * 0.38, size, clamp01(bloom * 1.6));
    ctx.restore();
  }
  // a few petals floating on the water
  petals.forEach((p, i) => {
    const t = time - 1.4 - i * 0.3;
    if (t < 0) return;
    const x = cx + (i - 1) * 170 + Math.sin(t * 0.8 + i) * 20;
    ctx.save();
    ctx.translate(x, water + 30 + i * 8);
    ctx.rotate(Math.sin(t * 0.6 + i) * 0.3 + i);
    drawCentred(ctx, p, 0, 0, 48, clamp01(t));
    ctx.restore();
  });
}

// ---------- Palace doors: carved doors cover the page, then swing open to reveal it ----------

function palaceDoors(ctx: Ctx, time: number, duration: number, text: TextKit) {
  text.fadeUp(1.5);
  const img = items.door[0];
  const open = smooth(0.5, 2.2, time); // 0 closed .. 1 open
  if (open >= 1 || time > duration) return;
  const angle = open * 88 * DEG;
  const w = (W / 2) * Math.cos(angle); // the door turns away from us, so it looks narrower
  for (const side of [-1, 1]) {
    ctx.save();
    if (side > 0) {
      ctx.translate(W, 0);
      ctx.scale(-1, 1); // the right door is the left one mirrored
    }
    // hinged at the page edge; the far edge rises a touch as it swings, for perspective
    const lift = Math.sin(angle) * 40;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w, -lift);
    ctx.lineTo(w, H + lift);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.clip();
    draw(ctx, img, 0, -lift, w, H + lift * 2);
    // darker as it turns away from the light
    ctx.fillStyle = `rgba(0,0,0,${0.45 * open})`;
    ctx.fillRect(0, -lift, w, H + lift * 2);
    ctx.restore();
  }
}

// ---------- Mehendi: a henna mandala draws itself in behind the text ----------

function mehendi(ctx: Ctx, time: number, _duration: number, text: TextKit) {
  const img = items.mehendi[0];
  const art = tinted(img, text.accent);
  const cy = (text.top + text.bottom) / 2;
  const size = Math.min(W * 0.95, Math.max(420, text.bottom - text.top + 260));
  const sweep = smooth(0.1, 2.2, time) * Math.PI * 2;
  if (art && sweep > 0) {
    ctx.save();
    ctx.globalAlpha = 0.42;
    ctx.translate(W / 2, cy);
    ctx.rotate(time * 0.05);
    // the drawing appears as if traced round in a circle
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, size, -Math.PI / 2, -Math.PI / 2 + sweep);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(art, -size / 2, -size / 2, size, size);
    ctx.restore();
  }
  text.fadeUp(1.0);
}

// ---------- Golden sparkles: soft gold fireworks burst above and twinkle around the text ----------

function sparkles(ctx: Ctx, time: number, _duration: number, text: TextKit) {
  text.fadeUp(0.6);
  const bursts = [
    { t: 0.2, x: 200, y: 260 },
    { t: 0.7, x: 520, y: 200 },
    { t: 1.3, x: 360, y: 330 },
    { t: 1.9, x: 150, y: 420 },
    { t: 2.4, x: 580, y: 400 },
  ];
  const colours = ["214,158,48", "236,184,72", "222,112,124", "246,206,110"]; // deep enough to show on light paper
  ctx.save();
  bursts.forEach((b, bi) => {
    const t = time - b.t;
    if (t < 0 || t > 1.8) return;
    const n = 46;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + bi;
      const speed = 160 + rnd(bi * 50 + i, 31) * 80;
      const x = b.x + Math.cos(a) * speed * t * (1 - t * 0.25);
      const y = b.y + Math.sin(a) * speed * t * (1 - t * 0.25) + 60 * t * t; // a little gravity
      const life = 1 - t / 1.8;
      const twinkle = 0.6 + 0.4 * Math.sin(time * 30 + i);
      ctx.fillStyle = `rgba(${colours[(i + bi) % colours.length]},${life * twinkle})`;
      ctx.beginPath();
      ctx.arc(x, y, 4 * life + 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    glow(ctx, b.x, b.y, 120, Math.max(0, 1 - t * 2), "255,200,110");
  });
  // stars twinkling around the text (they stay)
  for (let i = 0; i < 22; i++) {
    const x = 40 + rnd(i, 41) * (W - 80);
    const y = text.top - 120 + rnd(i, 42) * (text.bottom - text.top + 240);
    const on = smooth(0.4 + rnd(i, 43) * 2, 0.8 + rnd(i, 43) * 2, time);
    const tw = 0.5 + 0.5 * Math.sin(time * (2 + rnd(i, 44) * 3) + i * 2);
    const r = 4 + rnd(i, 45) * 6;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = `rgba(226,170,64,${0.85 * on * tw})`;
    ctx.beginPath();
    for (let k = 0; k < 4; k++) {
      ctx.rotate(Math.PI / 2);
      ctx.lineTo(0, -r * 2);
      ctx.lineTo(r * 0.35, -r * 0.35);
    }
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

// ---------- Floating clouds: soft, see-through clouds drift slowly above and below the text ----------

function clouds(ctx: Ctx, time: number, _duration: number, text: TextKit) {
  const list = items.cloud;
  const show = clamp01(time / 1.2); // they drift into view over the first second
  const above = Math.max(90, text.top - 50); // the clear sky above the text block
  const below = Math.min(H - 90, text.bottom + 60); // and below it
  for (let i = 0; i < 8; i++) {
    const img = list[i % list.length];
    const depth = 0.6 + rnd(i, 31) * 0.4; // nearer clouds are bigger, brighter and faster
    const lane = i < 3 ? "above" : i < 6 ? "below" : "behind";
    const y =
      lane === "above"
        ? 60 + rnd(i, 32) * Math.max(10, above - 120)
        : lane === "below"
          ? below + rnd(i, 32) * Math.max(10, H - 70 - below)
          : text.top + (0.2 + rnd(i, 32) * 0.6) * (text.bottom - text.top);
    const dir = i % 2 ? 1 : -1;
    const x = -160 + rnd(i, 33) * (W + 320) + dir * (14 + 22 * depth) * time;
    const size = (240 + 220 * rnd(i, 34)) * depth;
    // the ones that pass behind the words are barely there, so the text always reads clearly
    const alpha = show * (lane === "behind" ? 0.16 : 0.42 + 0.3 * depth);
    drawCentred(ctx, img, x, y + Math.sin(time * 0.6 + i) * 4, size, alpha);
  }
  text.fadeUp(0.5);
}
