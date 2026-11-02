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

export const PAINTED_MOTIONS: AnimationId[] = []; // filled at the end of this file, once the scenes are added

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

// =====================================================================================================
// Scenes: several painted elements arriving together and living on the page, so a still card plays
// like a short film. Each scene keeps the words clear: things come in along the edges, above and below
// the text block, and anything that passes behind the words stays faint. Existing motions can be used
// as layers (their scene without their own text reveal), so scenes combine old and new elements.
// =====================================================================================================

type SceneOpts = { filter?: string }; // a colour variant: a CSS filter over the painted layers
type Scene = (ctx: Ctx, time: number, duration: number, text: TextKit) => void;

const el = (name: string) => items[name] ?? [];
const pickEl = (name: string, i = 0) => {
  const list = el(name);
  return list.length ? list[i % list.length] : null;
};
// tall/narrow vs round pieces of one sheet (e.g. jasmine strings vs single blooms)
const tallOf = (name: string) => el(name).filter((m) => m.h > m.w * 1.6);
const singles = (name: string, max = 360) => el(name).filter((m) => m.w < max && m.h < max); // drop pieces that came out as clumps
const roundOf = (name: string) => el(name).filter((m) => m.h <= m.w * 1.6);

// The text kit without its reveal, for using a whole motion as one layer of a scene.
const quietText = (k: TextKit): TextKit => ({ ...k, all: () => {}, masked: () => {}, fadeUp: () => {} });
function layerOf(id: AnimationId, ctx: Ctx, time: number, duration: number, text: TextKit) {
  MOTIONS[id]?.draw(ctx, time, duration, quietText(text));
}

const arrive = (time: number, at: number, dur: number) => easeOut((time - at) / dur);
const wave = (time: number, speed: number, seed = 0) => Math.sin(time * speed + seed);

// One element: width `size`, placed by its top-centre ("hang"), bottom-centre ("stand") or centre.
type Put = { x: number; y: number; size: number; rot?: number; alpha?: number; flip?: boolean; anchor?: "hang" | "stand" | "centre" };
function put(ctx: Ctx, img: Img | null, p: Put) {
  if (!img) return;
  const w = p.size;
  const h = (img.h / img.w) * w;
  const oy = p.anchor === "hang" ? 0 : p.anchor === "stand" ? -h : -h / 2;
  ctx.save();
  ctx.globalAlpha *= p.alpha ?? 1;
  ctx.translate(p.x, p.y);
  if (p.rot) ctx.rotate(p.rot);
  if (p.flip) ctx.scale(-1, 1);
  draw(ctx, img, -w / 2, oy, w, h);
  ctx.restore();
}

// Things falling gently from above (petals, jasmine, flowers), spinning and swaying; they thin out
// near the end so the last frame is clean.
function shower(ctx: Ctx, list: Img[], time: number, duration: number, n: number, size: number, seed: number, start = 0) {
  if (!list.length) return;
  const fade = clamp01((duration - time) / 0.9);
  for (let i = 0; i < n; i++) {
    const t = time - start - rnd(i, seed) * 2.2;
    if (t < 0) continue;
    const speed = 70 + rnd(i, seed + 1) * 70;
    const y = -60 + t * speed;
    if (y > H + 60) continue;
    const x = 30 + rnd(i, seed + 2) * (W - 60) + 26 * wave(t, 1.3, i);
    const s = size * (0.7 + rnd(i, seed + 3) * 0.5);
    put(ctx, list[i % list.length], { x, y, size: s, rot: t * (0.6 + rnd(i, seed + 4)) * (i % 2 ? 1 : -1), alpha: 0.9 * fade });
  }
}

// Tiny glowing specks drifting upwards (fireflies, embers of the diyas).
function fireflies(ctx: Ctx, time: number, n: number, seed: number, rgb = "255,214,120") {
  for (let i = 0; i < n; i++) {
    const x = rnd(i, seed) * W + 30 * wave(time, 0.5, i);
    const y = H - ((time * (14 + rnd(i, seed + 1) * 18) + rnd(i, seed + 2) * H) % H);
    const a = clamp01(time / 1.2) * (0.35 + 0.35 * (0.5 + 0.5 * wave(time, 2 + rnd(i, seed + 3) * 3, i)));
    ctx.fillStyle = `rgba(${rgb},${a})`;
    ctx.beginPath();
    ctx.arc(x, y, 2 + rnd(i, seed + 4) * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ---------- the pieces scenes are built from ----------

// Two royal hand fans either side of the text, rising in and slowly waving.
function fans(ctx: Ctx, time: number, text: TextKit, at = 0.2) {
  const p = arrive(time, at, 1.1);
  const y = Math.min(H - 40, text.bottom + 260) + (1 - p) * 300;
  [0, 1].forEach((side) => {
    const x = side ? W - 92 : 92;
    const tilt = (side ? 1 : -1) * (0.22 + 0.1 * wave(time, 1.6, side * 2));
    put(ctx, pickEl("fan", side), { x, y, size: 170, rot: tilt, anchor: "stand", flip: !!side, alpha: p });
  });
}

// Chandeliers dropping in on their chains above the text, swinging a little before settling.
function chandeliers(ctx: Ctx, time: number, text: TextKit, at = 0) {
  const spots = [
    { x: 130, size: 150 },
    { x: W / 2, size: 120 },
    { x: W - 130, size: 150 },
  ];
  spots.forEach((s, i) => {
    const drop = easeBack((time - at - i * 0.15) / 1);
    if (drop <= 0) return;
    const room = i === 1 ? Math.max(60, text.top - 150) : Math.max(140, text.top + 40);
    const swing = 0.08 * Math.exp(-time * 0.8) * Math.sin(time * 3 + i) + 0.02 * wave(time, 1.1, i);
    const img = pickEl("chandelier", i);
    const h = img ? (img.h / img.w) * s.size : 0;
    put(ctx, img, { x: s.x, y: -h + drop * Math.min(room, h + 10), size: s.size, rot: swing, anchor: "hang" });
  });
}

// Temple bells hanging along the top, swinging gently.
function bells(ctx: Ctx, time: number, text: TextKit, at = 0) {
  const xs = [70, 190, W - 190, W - 70];
  xs.forEach((x, i) => {
    const drop = easeBack((time - at - i * 0.1) / 0.9);
    if (drop <= 0) return;
    const img = pickEl("bell", i);
    const size = i % 3 === 0 ? 90 : 70;
    const h = img ? (img.h / img.w) * size : 0;
    const reach = Math.min(hangRoom(text, x, size / 2), 260);
    put(ctx, img, { x, y: -h + drop * Math.min(reach, h), size, rot: 0.12 * Math.sin(time * 2.4 + i) * Math.exp(-time * 0.3) + 0.03 * wave(time, 1.7, i), anchor: "hang" });
  });
}

// The toran (mango leaves and marigolds) dropping across the top.
function toran(ctx: Ctx, time: number, at = 0) {
  const img = pickEl("toran");
  if (!img) return;
  const drop = easeBack((time - at) / 0.9);
  const h = (img.h / img.w) * (W + 40);
  ctx.save();
  ctx.translate(W / 2, -h + drop * h * 0.92);
  ctx.rotate(0.01 * wave(time, 1.2));
  draw(ctx, img, -(W + 40) / 2, 0, W + 40, h);
  ctx.restore();
}

// Lush floral corners growing in: the top-left piece and the bottom-right piece, mirrored for the other two.
function corners(ctx: Ctx, time: number, at = 0, all4 = false) {
  const [tl, br] = [pickEl("corner", 0), pickEl("corner", 1)];
  if (!tl || !br) return;
  // image, corner x, corner y, mirror x, which way it grows (from the top-left or the bottom-right of the image)
  const spots: [Img, number, number, number, boolean][] = [
    [tl, 0, 0, 1, true],
    [br, W, H, 1, false],
    ...(all4 ? ([[tl, W, 0, -1, true], [br, 0, H, -1, false]] as [Img, number, number, number, boolean][]) : []),
  ];
  spots.forEach(([img, x, y, mx, fromTop], i) => {
    const p = arrive(time, at + i * 0.2, 1.2);
    if (p <= 0) return;
    const w = 290 * (0.75 + 0.25 * p) * (1 + 0.015 * wave(time, 1.1, i));
    const h = (img.h / img.w) * w;
    ctx.save();
    ctx.globalAlpha = p;
    ctx.translate(x, y);
    ctx.scale(mx, 1);
    if (fromTop) draw(ctx, img, -8, -8, w, h);
    else draw(ctx, img, -w + 8, -h + 8, w, h);
    ctx.restore();
  });
}

// The crescent moon rising into the sky above the text.
function moon(ctx: Ctx, time: number, text: TextKit, at = 0) {
  const p = arrive(time, at, 2.2);
  const y = Math.max(110, text.top - 150) + (1 - p) * 120;
  glow(ctx, W - 150, y, 140, 0.5 * p, "255,220,150");
  put(ctx, pickEl("moon"), { x: W - 150, y, size: 170, alpha: p, rot: -0.15 + 0.03 * wave(time, 0.5) });
}

// A flock of egrets crossing the sky above the text.
function egrets(ctx: Ctx, time: number, text: TextKit, at = 0) {
  const list = el("egret");
  if (!list.length) return;
  const sky = Math.max(70, text.top - 220);
  for (let i = 0; i < 5; i++) {
    const t = time - at - i * 0.25;
    if (t < 0) continue;
    const x = -120 + t * 150 + i * 40;
    if (x > W + 150) continue;
    const y = sky + i * 26 + 10 * wave(t, 2, i);
    put(ctx, list[Math.floor(t * 4 + i) % list.length], { x, y, size: 90 - i * 8 });
  }
}

// Something travelling along the bottom: the camel or the doli, bobbing gently as it goes.
function traveller(ctx: Ctx, time: number, text: TextKit, name: string, size: number, at = 0) {
  const p = arrive(time, at, 3.2);
  const ground = Math.min(H - 30, text.bottom + 300);
  const x = -size / 2 + p * (W / 2 + size / 2) - 10;
  const bob = -5 * Math.abs(Math.sin(time * 4.4)) * (p < 1 ? 1 : 0.2);
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(x, ground - 4, size * 0.38, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (name === "palki" && el("kahar").length) return doliProcession(ctx, time, text, at);
  const rig = name === "camel" ? ELEMENTS.rigs.camelRig : undefined;
  if (!rig) {
    put(ctx, pickEl(name), { x, y: ground + bob, size, anchor: "stand" });
    return;
  }
  // the camel's legs swing as it walks in (a pace: near legs together, far leg opposite), then it stands
  const walking = p < 1 ? 1 : Math.max(0, 1 - (time - at - 3.2) / 0.4);
  const u = time / 0.95;
  const swing = 13 * DEG * walking * Math.sin(2 * Math.PI * u);
  const feet = Math.max(...rig.parts.map((q) => q.y + q.h));
  const k = size / rig.body.w;
  ctx.save();
  ctx.translate(x - (rig.body.x + rig.body.w / 2) * k, ground + bob * 0.6 - feet * k);
  ctx.scale(k, k);
  drawRig(ctx, rig, { hindNear: swing, frontNear: swing, frontFar: -swing });
  ctx.restore();
}

// The doli carried in by two kahars (bearers), one behind and one in front, the poles on their shoulders.
// Their walking poses play in turn while they walk, and the doli rocks a little with each step.
// Pole ends measured on the painting: back end (2%, 68%), front end (95%, 80%) of the doli picture.
function doliProcession(ctx: Ctx, time: number, text: TextKit, at = 0) {
  const doli = pickEl("palki");
  const frames = [...el("kahar")].sort((a, b) => a.src.localeCompare(b.src, undefined, { numeric: true }));
  if (!doli || !frames.length) return;
  const p = arrive(time, at, 3.4);
  const walking = p < 1;
  const dw = 240;
  const dh = (doli.h / doli.w) * dw;
  const bh = 180; // a bearer's height
  const shoulder = 0.8 * bh; // from his feet up to the pole on his shoulder
  const ground = Math.min(H - 20, text.bottom + 320);
  const step = walking ? Math.floor(time * 7) % frames.length : 0;
  const rock = walking ? 3 * Math.sin(time * 7 * Math.PI) : 0;
  const dx = -dw - 80 + p * (W / 2 + dw / 2 + 60) - dw / 2;
  const dy = ground - 0.8 * dh - shoulder + rock;
  const back = { x: dx + 0.02 * dw, y: dy + 0.68 * dh + shoulder };
  const front = { x: dx + 0.95 * dw, y: dy + 0.8 * dh + shoulder };
  const bearer = (pos: { x: number; y: number }, offset: number, shade: boolean) => {
    const img = frames[(step + offset) % frames.length];
    const w = (img.w / img.h) * bh;
    ctx.save();
    if (shade && "filter" in ctx) ctx.filter = "brightness(0.85)"; // the one behind is a little darker
    put(ctx, img, { x: pos.x, y: pos.y, size: w, anchor: "stand" });
    ctx.restore();
  };
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(dx + dw / 2, ground - 4, dw * 0.55, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  bearer(back, 2, true);
  draw(ctx, doli, dx, dy, dw, dh);
  bearer(front, 0, false);
}

// The royal parasols standing either side of the text, their fringe swaying.
function parasols(ctx: Ctx, time: number, text: TextKit, at = 0) {
  const p = arrive(time, at, 1.2);
  const y = Math.min(H - 20, text.bottom + 330) + (1 - p) * 260;
  [0, 1].forEach((side) => {
    put(ctx, pickEl("parasol", side), { x: side ? W - 80 : 80, y, size: 170, anchor: "stand", rot: 0.04 * wave(time, 1.3, side), flip: !!side, alpha: p });
  });
}

// The rangoli spinning slowly into place below the text.
function rangoli(ctx: Ctx, time: number, text: TextKit, at = 0) {
  const p = arrive(time, at, 1.6);
  const y = Math.min(H - 150, text.bottom + 170);
  const size = 260 * (0.6 + 0.4 * p);
  ctx.save();
  ctx.translate(W / 2, y);
  ctx.scale(1, 0.42); // seen at an angle, lying on the floor
  put(ctx, pickEl("rangoli"), { x: 0, y: 0, size, rot: (1 - p) * 2.4 + time * 0.08, alpha: p });
  ctx.restore();
}

// The Madhubani fish pair turning gently below the text.
function fish(ctx: Ctx, time: number, text: TextKit, at = 0) {
  const p = arrive(time, at, 1.4);
  const y = Math.min(H - 140, text.bottom + 150);
  put(ctx, pickEl("fish"), { x: W / 2, y: y + (1 - p) * 60, size: 220, rot: 0.08 * wave(time, 0.9), alpha: p });
}

// Gold paisleys twinkling in the margins.
function paisleys(ctx: Ctx, time: number, text: TextKit) {
  const list = el("paisley");
  if (!list.length) return;
  const spots: [number, number][] = [
    [60, text.top - 40],
    [W - 60, text.top - 10],
    [50, text.bottom + 40],
    [W - 50, text.bottom + 80],
    [W / 2 - 220, Math.max(60, text.top - 120)],
    [W / 2 + 220, Math.min(H - 60, text.bottom + 140)],
  ];
  spots.forEach(([x, y], i) => {
    const p = arrive(time, 0.2 + i * 0.18, 0.8);
    const tw = 0.75 + 0.25 * (0.5 + 0.5 * wave(time, 2.2, i * 1.7));
    put(ctx, list[i % list.length], { x, y, size: 60 + (i % 3) * 12, rot: 0.2 * wave(time, 0.6, i), alpha: p * tw });
  });
}

// Jasmine strings hanging from the top corners.
function gajra(ctx: Ctx, time: number, text: TextKit, at = 0) {
  const strings = tallOf("jasmine");
  if (!strings.length) return;
  [50, 120, W - 120, W - 50].forEach((x, i) => {
    const drop = easeBack((time - at - i * 0.12) / 1);
    if (drop <= 0) return;
    const img = strings[i % strings.length];
    const size = 46;
    const h = (img.h / img.w) * size;
    const reach = Math.min(h, hangRoom(text, x, 30) + 40);
    put(ctx, img, { x, y: -h + drop * reach, size, rot: 0.05 * wave(time, 1.5, i), anchor: "hang" });
  });
}

// ---------- the scenes ----------

type SceneDef = { name: string; parts: string[]; layers: AnimationId[]; draw: Scene; reveal?: number };
const SCENES: Record<string, SceneDef> = {
  shahiSwagat: {
    name: "Royal welcome",
    parts: ["fan"],
    layers: ["elephants", "rosePetals"],
    draw: (c, t, d, k) => (fans(c, t, k, 0.6), layerOf("elephants", c, t, d, k), layerOf("rosePetals", c, t, d, k)),
    reveal: 2,
  },
  royalCourt: {
    name: "Royal court",
    parts: ["chandelier", "fan"],
    layers: ["sparkles"],
    draw: (c, t, d, k) => (chandeliers(c, t, k), fans(c, t, k, 0.5), layerOf("sparkles", c, t, d, k)),
  },


  baraatParasols: {
    name: "Baraat with parasols",
    parts: ["parasol"],
    layers: ["ghodi"],
    draw: (c, t, d, k) => (parasols(c, t, k, 0.3), layerOf("ghodi", c, t, d, k)),
    reveal: 1.8,
  },
  doliArrival: {
    name: "Doli arrival",
    parts: ["palki", "kahar", "toran"],
    layers: ["rosePetals"],
    draw: (c, t, d, k) => (toran(c, t), traveller(c, t, k, "palki", 300, 0.3), layerOf("rosePetals", c, t, d, k)),
  },
  desertCaravan: {
    name: "Rajasthani camel",
    parts: ["camel", "bell", "paisley"],
    layers: [],
    draw: (c, t, _d, k) => (bells(c, t, k), paisleys(c, t, k), traveller(c, t, k, "camel", 280, 0.2)),
  },
  toranWelcome: {
    name: "Toran welcome",
    parts: ["toran", "bell"],
    layers: ["diyaRow"],
    draw: (c, t, d, k) => (toran(c, t), bells(c, t, k, 0.5), layerOf("diyaRow", c, t, d, k)),
  },

  gardenCorners: {
    name: "Garden corners",
    parts: ["corner"],
    layers: ["butterflies"],
    draw: (c, t, d, k) => (corners(c, t, 0, true), layerOf("butterflies", c, t, d, k)),
  },
  madhubani: {
    name: "Madhubani fish",
    parts: ["fish"],
    layers: ["mehendi"],
    draw: (c, t, d, k) => (layerOf("mehendi", c, t, d, k), fish(c, t, k, 0.4)),
  },
  rangoliDiyas: {
    name: "Rangoli",
    parts: ["rangoli", "toran"],
    layers: [],
    draw: (c, t, _d, k) => (toran(c, t), rangoli(c, t, k, 0.3), fireflies(c, t, 16, 91)),
  },
  jasmineRain: {
    name: "Jasmine rain",
    parts: ["jasmine"],
    layers: [],
    draw: (c, t, d, k) => (gajra(c, t, k), shower(c, roundOf("jasmine"), t, d, 18, 30, 101, 0.6)),
  },
  chandelierNight: {
    name: "Chandelier night",
    parts: ["chandelier"],
    layers: ["skyLanterns"],
    draw: (c, t, d, k) => (layerOf("skyLanterns", c, t, d, k), chandeliers(c, t, k, 0.2), fireflies(c, t, 18, 111)),
  },
  templeBells: {
    name: "Temple bells",
    parts: ["bell"],
    layers: ["kalash"],
    draw: (c, t, d, k) => (bells(c, t, k), layerOf("kalash", c, t, d, k)),
  },
  peacockGarden: {
    name: "Peacock garden",
    parts: ["corner"],
    layers: ["peacock"],
    draw: (c, t, d, k) => (corners(c, t, 0.2), layerOf("peacock", c, t, d, k)),
  },

  monsoonEgrets: {
    name: "Egrets and clouds",
    parts: ["egret"],
    layers: ["clouds"],
    draw: (c, t, d, k) => (layerOf("clouds", c, t, d, k), egrets(c, t, k, 0.4)),
  },
  shahiChhatri: {
    name: "Royal parasols",
    parts: ["parasol", "toran", "bloom"],
    layers: [],
    draw: (c, t, d, k) => (toran(c, t), parasols(c, t, k, 0.3), shower(c, singles("bloom"), t, d, 10, 42, 121, 1)),
  },
  haldiMorning: {
    name: "Haldi morning",
    parts: ["toran"],
    layers: ["marigolds", "butterflies"],
    draw: (c, t, d, k) => (toran(c, t), layerOf("butterflies", c, t, d, k), shower(c, el("marigold").filter((m) => m.h / m.w < 1.5), t, d, 14, 40, 131, 0.8)),
  },
  mehendiGarden: {
    name: "Mehendi garden",
    parts: ["corner"],
    layers: ["mehendi", "parrots"],
    draw: (c, t, d, k) => (layerOf("mehendi", c, t, d, k), corners(c, t, 0.3), layerOf("parrots", c, t, d, k)),
  },
  sangeetNight: {
    name: "Sangeet night",
    parts: ["chandelier", "paisley"],
    layers: ["sparkles"],
    draw: (c, t, d, k) => (chandeliers(c, t, k), paisleys(c, t, k), layerOf("sparkles", c, t, d, k)),
  },
  receptionGlow: {
    name: "Moonlit diyas",
    parts: ["moon"],
    layers: ["diyaRow"],
    draw: (c, t, d, k) => (moon(c, t, k), layerOf("diyaRow", c, t, d, k), fireflies(c, t, 20, 141)),
  },
  goldPaisley: {
    name: "Gold paisley",
    parts: ["paisley"],
    layers: ["sparkles"],
    draw: (c, t, d, k) => (paisleys(c, t, k), layerOf("sparkles", c, t, d, k)),
  },

  moonClouds: {
    name: "Moon and clouds",
    parts: ["moon"],
    layers: ["clouds"],
    draw: (c, t, d, k) => (moon(c, t, k), layerOf("clouds", c, t, d, k), fireflies(c, t, 14, 151)),
  },
  flowerShower: {
    name: "Flower shower",
    parts: ["bloom", "corner"],
    layers: [],
    draw: (c, t, d, k) => (corners(c, t, 0.1), shower(c, singles("bloom"), t, d, 16, 48, 161, 0.3)),
  },

};

// Colour variants of favourite scenes: the same scene with a different palette over its painted layers.
const VARIANTS: Record<string, { of: string; name: string; filter: string }> = {
  royalCourtSilver: { of: "royalCourt", name: "Royal court, silver", filter: "grayscale(1) brightness(1.18) contrast(1.05)" },
  gardenCornersIvory: { of: "gardenCorners", name: "Garden corners, ivory", filter: "grayscale(0.85) sepia(0.3) brightness(1.1)" },
  toranRoseGold: { of: "toranWelcome", name: "Toran, rose gold", filter: "hue-rotate(-32deg) saturate(1.1)" },
};

function runScene(def: SceneDef, opts: SceneOpts): Motion {
  return (ctx, time, duration, text) => {
    ctx.save();
    if (opts.filter && "filter" in ctx) ctx.filter = opts.filter;
    def.draw(ctx, time, duration, text);
    ctx.restore();
    text.fadeUp(def.reveal ?? 0.6);
  };
}
const RIG_OF: Record<string, string> = { camel: "camelRig" }; // pieces that are drawn as a moving-leg puppet
const sceneAssets = (def: SceneDef) => () => [
  ...def.parts.flatMap((p) => srcs(el(p))),
  ...def.parts.flatMap((p) => (RIG_OF[p] && ELEMENTS.rigs[RIG_OF[p]] ? rigImages(ELEMENTS.rigs[RIG_OF[p]]) : [])),
  ...def.layers.flatMap((id) => MOTIONS[id]?.assets() ?? []),
];

// a scene is offered only once all its painted parts exist (e.g. the doli waits for its picture)
const ready = (def: SceneDef) => def.parts.every((p) => el(p).length > 0);
for (const [id, def] of Object.entries(SCENES)) if (ready(def)) MOTIONS[id as AnimationId] = { draw: runScene(def, {}), assets: sceneAssets(def) };
for (const [id, v] of Object.entries(VARIANTS)) if (ready(SCENES[v.of])) MOTIONS[id as AnimationId] = { draw: runScene(SCENES[v.of], { filter: v.filter }), assets: sceneAssets(SCENES[v.of]) };

PAINTED_MOTIONS.push(...(Object.keys(MOTIONS) as AnimationId[]));

// Names for the editor's list, in the order they're offered.
export const SCENE_NAMES: { id: AnimationId; name: string }[] = [
  ...Object.entries(SCENES).filter(([, d]) => ready(d)).map(([id, d]) => ({ id: id as AnimationId, name: d.name })),
  ...Object.entries(VARIANTS).filter(([, v]) => ready(SCENES[v.of])).map(([id, v]) => ({ id: id as AnimationId, name: v.name })),
];
