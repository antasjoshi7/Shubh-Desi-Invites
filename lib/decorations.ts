// Hand-drawn (vector) decorations for the Bloom, Petal rain and Chariot text animations.
// Everything is drawn with canvas paths in 720x1280 units.

type Ctx = CanvasRenderingContext2D;

// Repeatable pseudo-random number 0..1 for petal i, property k (same every frame).
export function rnd(i: number, k: number): number {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// A single petal pointing up from (0,0).
function petalPath(ctx: Ctx, len: number, wid: number) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(wid, -len * 0.3, wid * 0.8, -len * 0.85, 0, -len);
  ctx.bezierCurveTo(-wid * 0.8, -len * 0.85, -wid, -len * 0.3, 0, 0);
  ctx.closePath();
}

// ---------- Bloom ----------

// open: 0 = closed bud, 1 = fully open
export function drawFlower(
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  open: number,
  rotation: number,
  colors: { petal: string; inner: string; centre: string; line: string },
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.lineWidth = 2;
  ctx.strokeStyle = colors.line;
  const n = 8;
  for (let layer = 0; layer < 2; layer++) {
    const lr = layer === 0 ? r : r * 0.68;
    ctx.fillStyle = layer === 0 ? colors.petal : colors.inner;
    for (let i = 0; i < n; i++) {
      ctx.save();
      ctx.rotate((i / n) * Math.PI * 2 + (layer * Math.PI) / n);
      petalPath(ctx, lr * (0.35 + 0.65 * open), lr * 0.42 * (0.4 + 0.6 * open));
      ctx.fill();
      ctx.stroke();
      // vein
      ctx.beginPath();
      ctx.moveTo(0, -lr * 0.12);
      ctx.lineTo(0, -lr * (0.3 + 0.45 * open));
      ctx.stroke();
      ctx.restore();
    }
  }
  // centre with a ring of seeds
  ctx.fillStyle = colors.centre;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = colors.line;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.12, Math.sin(a) * r * 0.12, r * 0.022, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---------- Petal rain ----------

export function drawFallingPetal(ctx: Ctx, x: number, y: number, size: number, rotation: number, flip: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(flip, 1);
  ctx.translate(0, size * 0.8);
  ctx.fillStyle = color;
  petalPath(ctx, size * 1.6, size * 0.75);
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.18)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.2);
  ctx.lineTo(0, -size * 1.2);
  ctx.stroke();
  ctx.restore();
}

// ---------- Mandala (transition) ----------

type Royal = { base: string; dark: string; gold: string; light: string };

// A filled, layered mandala of radius r, turned by `rotation`.
export function drawMandala(ctx: Ctx, x: number, y: number, r: number, rotation: number, c: Royal) {
  if (r < 1) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  ctx.fillStyle = c.base;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  const ring = (count: number, from: number, len: number, wid: number, fill: string, stroke?: string, offset = 0) => {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke ?? "transparent";
    ctx.lineWidth = Math.max(1, r * 0.006);
    for (let i = 0; i < count; i++) {
      ctx.save();
      ctx.rotate(((i + offset) / count) * Math.PI * 2);
      ctx.translate(0, -from);
      petalPath(ctx, len, wid);
      ctx.fill();
      if (stroke) ctx.stroke();
      ctx.restore();
    }
  };
  const dots = (count: number, at: number, size: number, fill: string) => {
    ctx.fillStyle = fill;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * at, Math.sin(a) * at, size, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  const circle = (at: number, width: number, color: string) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(0, 0, at, 0, Math.PI * 2);
    ctx.stroke();
  };

  dots(48, r * 0.96, r * 0.012, c.gold);
  ring(24, r * 0.7, r * 0.22, r * 0.07, c.gold);
  ring(24, r * 0.72, r * 0.14, r * 0.035, c.dark, undefined, 0.5);
  circle(r * 0.7, r * 0.012, c.gold);
  ring(12, r * 0.4, r * 0.27, r * 0.1, c.light, c.gold);
  ring(12, r * 0.42, r * 0.18, r * 0.05, c.gold, undefined, 0.5);
  dots(24, r * 0.37, r * 0.014, c.gold);
  circle(r * 0.34, r * 0.008, c.light);
  ring(8, r * 0.1, r * 0.22, r * 0.08, c.gold, c.dark);
  ctx.fillStyle = c.light;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  dots(8, r * 0.05, r * 0.012, c.base);
  ctx.restore();
}

// ---------- Diya (transition) ----------

// A clay oil lamp with a flickering flame. (x, y) is the middle of the bowl.
export function drawDiya(ctx: Ctx, x: number, y: number, scale: number, time: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const flicker = Math.sin(time * 23) * 3 + Math.sin(time * 37) * 2;

  // glow around the flame
  const glow = ctx.createRadialGradient(25, -70, 0, 25, -70, 90);
  glow.addColorStop(0, "rgba(255,200,90,0.6)");
  glow.addColorStop(1, "rgba(255,170,60,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(-80, -170, 210, 200);

  // flame
  const f = ctx.createLinearGradient(25, -30, 25, -105);
  f.addColorStop(0, "#ff7a1a");
  f.addColorStop(0.45, "#ffc23a");
  f.addColorStop(1, "#fff6c8");
  ctx.fillStyle = f;
  ctx.beginPath();
  ctx.moveTo(25, -28);
  ctx.bezierCurveTo(8, -45, 16, -80, 25 + flicker * 0.5, -105 + flicker);
  ctx.bezierCurveTo(34, -80, 42, -45, 25, -28);
  ctx.fill();
  ctx.fillStyle = "#fffbe8";
  ctx.beginPath();
  ctx.ellipse(25, -45, 5, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // spout + bowl
  ctx.fillStyle = "#b5532a";
  ctx.beginPath();
  ctx.moveTo(10, -14);
  ctx.quadraticCurveTo(30, -24, 40, -32);
  ctx.quadraticCurveTo(44, -18, 34, -6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-70, -12);
  ctx.bezierCurveTo(-62, 42, 62, 42, 70, -12);
  ctx.closePath();
  ctx.fill();
  // rim and oil
  ctx.fillStyle = "#7a3416";
  ctx.beginPath();
  ctx.ellipse(0, -12, 70, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e3b04b";
  ctx.lineWidth = 3;
  ctx.stroke();
  // painted dots
  ctx.fillStyle = "#f6dfa4";
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.arc(i * 15, 12 - Math.abs(i) * 2.5, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---------- Palace doors (transition) ----------

// One door panel covering x … x+w, full height, with a Mughal arch, studs and a ring handle.
export function drawDoor(ctx: Ctx, x: number, w: number, h: number, side: "left" | "right", c: Royal) {
  ctx.save();
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, side === "left" ? c.dark : c.base);
  g.addColorStop(1, side === "left" ? c.base : c.dark);
  ctx.fillStyle = g;
  ctx.fillRect(x, 0, w, h);

  ctx.strokeStyle = c.gold;
  ctx.lineWidth = 5;
  ctx.strokeRect(x + 16, 16, w - 32, h - 32);
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 26, 26, w - 52, h - 52);

  // pointed arch panel
  const ax = x + 50;
  const aw = w - 100;
  const top = h * 0.12;
  const base = h * 0.62;
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ax, base);
  ctx.lineTo(ax, top + aw * 0.55);
  ctx.quadraticCurveTo(ax, top + aw * 0.12, ax + aw / 2, top);
  ctx.quadraticCurveTo(ax + aw, top + aw * 0.12, ax + aw, top + aw * 0.55);
  ctx.lineTo(ax + aw, base);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // flower in the arch
  ctx.fillStyle = c.gold;
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.translate(ax + aw / 2, top + aw * 0.75);
    ctx.rotate((i / 8) * Math.PI * 2);
    petalPath(ctx, aw * 0.18, aw * 0.06);
    ctx.fill();
    ctx.restore();
  }

  // studs on the lower panel
  for (let sy = base + 40; sy < h - 50; sy += 56) {
    for (let sx = ax + 14; sx < ax + aw; sx += 56) {
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ring handle near the middle edge
  const hx = side === "left" ? x + w - 40 : x + 40;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(hx, h * 0.5 + 18, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(hx, h * 0.5, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---------- Chariot ----------

// Draws a horse-drawn chariot facing right. (x, y) is the centre of the chariot wheel.
// Roughly 445 wide (x-95 … x+350) and 320 tall (y-270 … y+52) before scaling.
export function drawChariot(
  ctx: Ctx,
  x: number,
  y: number,
  scale: number,
  wheelAngle: number,
  time: number,
  colors: { body: string; dark: string; line: string; flag: string },
  horse?: HTMLImageElement, // illustrated horse (faces left); falls back to the drawn one
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const gallop = wheelAngle * 1.4;

  // ground shadow
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(140, 54, 240, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  if (horse && horse.naturalWidth) {
    // illustrated horse, flipped to face right, standing on the ground line with a little trot bob
    const hh = 240;
    const hw = (hh * horse.naturalWidth) / horse.naturalHeight;
    const bob = Math.abs(Math.sin(gallop)) * -4;
    ctx.save();
    ctx.translate(150 + hw, 52 - hh + bob);
    ctx.scale(-1, 1);
    ctx.drawImage(horse, 0, 0, hw, hh);
    ctx.restore();
  } else {
    drawHorse(ctx, 235, -62, gallop, time, colors);
  }

  // shaft from chariot to horse
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(95, -32);
  ctx.lineTo(205, -52);
  ctx.stroke();
  // reins
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(60, -95);
  ctx.quadraticCurveTo(200, -60, 330, -110);
  ctx.stroke();

  // canopy poles
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-72, -70);
  ctx.lineTo(-72, -150);
  ctx.moveTo(62, -70);
  ctx.lineTo(62, -150);
  ctx.stroke();

  // onion dome canopy
  ctx.fillStyle = colors.dark;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-95, -150);
  ctx.bezierCurveTo(-95, -205, -20, -205, -5, -245);
  ctx.bezierCurveTo(10, -205, 85, -205, 85, -150);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // scalloped trim under the dome
  ctx.fillStyle = colors.line;
  for (let sx = -88; sx <= 80; sx += 16) {
    ctx.beginPath();
    ctx.arc(sx, -150, 7, 0, Math.PI);
    ctx.fill();
  }
  // kalash finial + waving flag
  ctx.beginPath();
  ctx.arc(-5, -252, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-5, -258);
  ctx.lineTo(-5, -285);
  ctx.stroke();
  const wave = Math.sin(time * 9) * 5;
  ctx.fillStyle = colors.flag;
  ctx.beginPath();
  ctx.moveTo(-5, -285);
  ctx.quadraticCurveTo(15, -290 + wave, 40, -278 + wave);
  ctx.quadraticCurveTo(15, -272 - wave, -5, -268);
  ctx.closePath();
  ctx.fill();

  // body (the car)
  ctx.fillStyle = colors.body;
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-95, -12);
  ctx.lineTo(60, -12);
  ctx.quadraticCurveTo(100, -12, 100, -55);
  ctx.lineTo(100, -72);
  ctx.lineTo(-80, -72);
  ctx.quadraticCurveTo(-95, -72, -95, -52);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // decorative band of dots
  ctx.fillStyle = colors.line;
  for (let dx = -82; dx <= 88; dx += 14) {
    ctx.beginPath();
    ctx.arc(dx, -42, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(-90, -58);
  ctx.lineTo(96, -58);
  ctx.moveTo(-90, -26);
  ctx.lineTo(90, -26);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // wheel
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 44, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const a = wheelAngle + (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 9, Math.sin(a) * 9);
    ctx.lineTo(Math.cos(a) * 44, Math.sin(a) * 44);
    ctx.stroke();
  }
  ctx.fillStyle = colors.line;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawHorse(
  ctx: Ctx,
  x: number,
  y: number,
  gallop: number,
  time: number,
  colors: { body: string; dark: string; line: string; flag: string },
) {
  ctx.save();
  ctx.translate(x, y + Math.sin(gallop * 2) * 3); // little bounce

  // legs behind the body (two segments each)
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 10;
  const legs: [number, number, number][] = [
    [-42, 8, 0],
    [-30, 10, Math.PI * 0.6],
    [36, 8, Math.PI],
    [48, 10, Math.PI * 1.6],
  ];
  for (const [hx, hy, phase] of legs) {
    const swing = Math.sin(gallop + phase);
    const front = hx > 0;
    const thigh = (front ? 0.15 : -0.1) + swing * 0.55;
    const kx = hx + Math.sin(thigh) * 30;
    const ky = hy + Math.cos(thigh) * 30;
    const bend = (front ? -1 : 1) * (0.25 + 0.6 * Math.max(0, Math.sin(gallop + phase + 1.2)));
    const shin = thigh + bend;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(kx, ky);
    ctx.lineTo(kx + Math.sin(shin) * 30, ky + Math.cos(shin) * 30);
    ctx.stroke();
  }

  // tail
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-58, -10);
  ctx.quadraticCurveTo(-90, -15 + Math.sin(time * 10) * 6, -100, 22);
  ctx.stroke();

  ctx.fillStyle = colors.line;
  // body
  ctx.beginPath();
  ctx.ellipse(0, 0, 62, 27, 0, 0, Math.PI * 2);
  ctx.fill();
  // neck
  ctx.beginPath();
  ctx.moveTo(30, -12);
  ctx.quadraticCurveTo(50, -50, 70, -68);
  ctx.lineTo(90, -58);
  ctx.quadraticCurveTo(70, -25, 58, 10);
  ctx.closePath();
  ctx.fill();
  // head
  ctx.beginPath();
  ctx.moveTo(68, -72);
  ctx.lineTo(112, -46);
  ctx.quadraticCurveTo(120, -38, 108, -32);
  ctx.lineTo(82, -42);
  ctx.closePath();
  ctx.fill();
  // ear
  ctx.beginPath();
  ctx.moveTo(72, -70);
  ctx.lineTo(77, -88);
  ctx.lineTo(84, -68);
  ctx.closePath();
  ctx.fill();

  // plume, mane and saddle cloth in the chariot colours
  ctx.fillStyle = colors.flag;
  ctx.beginPath();
  ctx.ellipse(76, -94, 6, 13, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = colors.body;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(66, -66);
  ctx.quadraticCurveTo(50, -45, 38, -18);
  ctx.stroke();
  ctx.fillStyle = colors.body;
  ctx.beginPath();
  ctx.moveTo(-25, -24);
  ctx.lineTo(22, -24);
  ctx.lineTo(18, 8);
  ctx.quadraticCurveTo(0, 14, -21, 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = colors.dark;
  for (let dx = -16; dx <= 12; dx += 9) {
    ctx.beginPath();
    ctx.arc(dx, 4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
