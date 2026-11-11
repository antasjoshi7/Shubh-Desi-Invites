// Draws the things people share: a poster for each event (collage, colours, a few notes),
// a cover for the whole board, and briefs for the decorator and for outfits (each loved photo with
// its numbered notes). Everything is 1080 x 1920, the shape of a phone story, and is drawn on
// the phone with no server.

import { loadImage } from "./image";
import { collage, collagePicks, dressColors, dressRefs, eventPalette, boardPalette, imagesOf, ranked, topNotes } from "./layout";
import { inkOn, mix, nameColor, paletteSentence } from "./palette";
import { urlFor } from "./store";
import { PAPERS, paperOf, type Board, type Card, type CardType, type EventDef } from "./types";

export const PW = 1080, PH = 1920;
const INK = "#1d1a16";
const PAPER = "#fbf8f2";
const TONE = { love: "#2f9e62", change: "#e08a00", no: "#d13b3b" };

type G = CanvasRenderingContext2D;

const fonts = () => {
  const root = getComputedStyle(document.documentElement);
  const display = root.getPropertyValue("--font-bodoni").trim() || "Georgia, serif";
  return { display, sans: '"MB Sans", system-ui, sans-serif', hand: '"MB Hand", "Comic Sans MS", cursive' };
};

async function ready() {
  const f = fonts();
  try {
    await Promise.all([
      document.fonts.load(`italic 500 100px ${f.display}`),
      document.fonts.load(`400 30px ${f.sans}`),
      document.fonts.load(`700 30px ${f.sans}`),
      document.fonts.load(`400 40px ${f.hand}`),
    ]);
  } catch { /* draw with fallbacks */ }
  return f;
}

function page(bg: string): { c: HTMLCanvasElement; g: G } {
  const c = document.createElement("canvas");
  c.width = PW;
  c.height = PH;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, PW, PH);
  return { c, g };
}

function rr(g: G, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

// Fills the box with the photo, cropping the overflow (a little more off the bottom than the top,
// because faces sit high in a picture).
function cover(g: G, img: HTMLImageElement, x: number, y: number, w: number, h: number, r: number) {
  g.save();
  rr(g, x, y, w, h, r);
  g.clip();
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
  g.drawImage(img, x + (w - dw) / 2, y + (h - dh) * 0.38, dw, dh);
  g.restore();
}

function spaced(g: G, px: number) {
  (g as unknown as { letterSpacing: string }).letterSpacing = `${px}px`;
}

function wrap(g: G, text: string, max: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? line + " " + w : w;
    if (g.measureText(next).width > max && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function fitText(g: G, text: string, font: (px: number) => string, px: number, max: number): number {
  let size = px;
  g.font = font(size);
  while (g.measureText(text).width > max && size > 40) {
    size -= 6;
    g.font = font(size);
  }
  return size;
}

async function imgOf(card: Card): Promise<HTMLImageElement | null> {
  try {
    const url = await urlFor(card, "full");
    return url ? await loadImage(url) : null;
  } catch {
    return null;
  }
}

function dots(g: G, colors: string[], cx: number, cy: number, r: number, ring: string, step: number) {
  const x0 = cx - ((colors.length - 1) * step) / 2;
  colors.forEach((c, i) => {
    g.beginPath();
    g.arc(x0 + i * step, cy, r + 8, 0, Math.PI * 2);
    g.fillStyle = ring;
    g.fill();
    g.beginPath();
    g.arc(x0 + i * step, cy, r, 0, Math.PI * 2);
    g.fillStyle = c;
    g.fill();
  });
}

function footer(g: G, text: string) {
  const f = fonts();
  g.font = `400 24px ${f.sans}`;
  g.fillStyle = INK + "80";
  g.textAlign = "center";
  spaced(g, 2);
  g.fillText(text, PW / 2, PH - 56);
  spaced(g, 0);
}

// One event as a poster: its name, its colours, a collage of the loved photos and a few notes.
export async function eventPoster(board: Board, ev: EventDef): Promise<HTMLCanvasElement> {
  const f = await ready();
  const palette = eventPalette(board, ev);
  const bg = mix(PAPER, palette[0] ?? PAPER, 0.13);
  const { c, g } = page(bg);
  g.textAlign = "center";
  g.fillStyle = INK + "99";
  g.font = `700 25px ${f.sans}`;
  spaced(g, 7);
  g.fillText(board.title.toUpperCase(), PW / 2, 128);
  spaced(g, 0);

  g.fillStyle = INK;
  fitText(g, ev.name, (px) => `italic 500 ${px}px ${f.display}`, 196, 940);
  g.fillText(ev.name, PW / 2, 318);

  const sentence = paletteSentence(palette);
  if (sentence) {
    g.font = `400 33px ${f.sans}`;
    g.fillStyle = INK + "b0";
    g.fillText(sentence, PW / 2, 388);
  }

  const picks = collagePicks(board, ev.id, 7);
  const box = { x: 60, y: 446, w: 960, h: 1080 };
  const rects = collage(picks, box.w, box.h, 12);
  const imgs = await Promise.all(picks.map(imgOf));
  rects.forEach((r) => {
    const i = picks.findIndex((p) => p.id === r.id);
    const img = imgs[i];
    if (img) cover(g, img, box.x + r.x, box.y + r.y, r.w, r.h, 18);
    else {
      rr(g, box.x + r.x, box.y + r.y, r.w, r.h, 18);
      g.fillStyle = picks[i]?.dom ?? "#ddd";
      g.fill();
    }
  });
  if (palette.length) dots(g, palette, PW / 2, box.y + box.h, 50, bg, 118);

  const notes = topNotes(board, ev.id, 3);
  g.font = `400 46px ${f.hand}`;
  g.fillStyle = INK + "d0";
  let y = 1668;
  for (const n of notes) {
    const lines = wrap(g, n, 900).slice(0, 1);
    g.fillText(lines[0], PW / 2, y);
    y += 62;
  }
  footer(g, "Made on Shubh Desi");
  return c;
}

// The first page of the whole board: its name, its line, all its colours, a peek at each event.
export async function coverPoster(board: Board): Promise<HTMLCanvasElement> {
  const f = await ready();
  const palette = boardPalette(board, 6);
  const bg = mix(PAPER, palette[0] ?? PAPER, 0.1);
  const { c, g } = page(bg);
  g.textAlign = "center";
  g.fillStyle = INK + "99";
  g.font = `700 25px ${f.sans}`;
  spaced(g, 7);
  g.fillText("WEDDING MOOD BOARD", PW / 2, 150);
  spaced(g, 0);

  g.fillStyle = INK;
  g.font = `italic 500 128px ${f.display}`;
  const lines = wrap(g, board.title, 940).slice(0, 3);
  let y = 330;
  for (const l of lines) {
    g.fillText(l, PW / 2, y);
    y += 136;
  }
  if (board.line.trim()) {
    g.font = `400 50px ${f.hand}`;
    g.fillStyle = INK + "c8";
    g.fillText(wrap(g, board.line.trim(), 900)[0], PW / 2, y - 24);
    y += 60;
  }
  if (palette.length) dots(g, palette, PW / 2, y + 30, 46, bg, 108);
  y += 130;

  const events = board.events.filter((e) => imagesOf(board, e.id).length);
  const shown = events.slice(0, 6);
  const cols = 2, gap = 24;
  const rows = Math.ceil(shown.length / cols);
  const tw = (PW - 120 - gap) / cols;
  const th = Math.min(400, (PH - 120 - y - rows * 64 - (rows - 1) * gap) / Math.max(1, rows));
  const heroes = await Promise.all(shown.map((e) => imgOf(collagePicks(board, e.id, 1)[0])));
  shown.forEach((e, i) => {
    const x = 60 + (i % cols) * (tw + gap);
    const ty = y + Math.floor(i / cols) * (th + 64 + gap);
    const img = heroes[i];
    if (img) cover(g, img, x, ty, tw, th, 18);
    g.textAlign = "left";
    g.fillStyle = INK;
    g.font = `italic 500 42px ${f.display}`;
    g.fillText(e.name, x + 4, ty + th + 48);
    const p = eventPalette(board, e, 4);
    p.forEach((col, k) => {
      g.beginPath();
      g.arc(x + tw - 16 - k * 30, ty + th + 34, 12, 0, Math.PI * 2);
      g.fillStyle = col;
      g.fill();
    });
  });
  footer(g, "Made on Shubh Desi");
  return c;
}

// "What to wear": the card guests get. Event name, the dress code in a line, the colours to wear
// with their names, and a few outfit photos as examples.
export async function dressPoster(board: Board, ev: EventDef): Promise<HTMLCanvasElement> {
  const f = await ready();
  const colors = dressColors(board, ev).slice(0, 4);
  const bg = mix(PAPER, colors[0] ?? PAPER, 0.15);
  const { c, g } = page(bg);
  g.textAlign = "center";
  g.fillStyle = INK + "99";
  g.font = `700 25px ${f.sans}`;
  spaced(g, 7);
  g.fillText(board.title.toUpperCase(), PW / 2, 128);
  spaced(g, 0);

  g.fillStyle = INK;
  fitText(g, ev.name, (px) => `italic 500 ${px}px ${f.display}`, 190, 940);
  g.fillText(ev.name, PW / 2, 312);
  g.fillStyle = INK + "b8";
  g.font = `700 30px ${f.sans}`;
  spaced(g, 10);
  g.fillText("WHAT TO WEAR", PW / 2, 394);
  spaced(g, 0);

  g.fillStyle = INK;
  g.font = `400 70px ${f.hand}`;
  const lines = wrap(g, ev.dress?.line.trim() || "Wear these colours", 920).slice(0, 3);
  let y = 520;
  for (const l of lines) {
    g.fillText(l, PW / 2, y);
    y += 86;
  }

  const refs = dressRefs(board, ev, 3);
  const imgs = await Promise.all(refs.map(imgOf));
  const r = refs.length ? 86 : 120;
  const step = colors.length > 3 ? r * 2 + 60 : r * 2 + 90;
  const cy = y + 40 + r;
  const x0 = PW / 2 - ((colors.length - 1) * step) / 2;
  colors.forEach((col, i) => {
    g.beginPath();
    g.arc(x0 + i * step, cy, r + 9, 0, Math.PI * 2);
    g.fillStyle = "#ffffff";
    g.fill();
    g.beginPath();
    g.arc(x0 + i * step, cy, r, 0, Math.PI * 2);
    g.fillStyle = col;
    g.fill();
    g.fillStyle = INK + "d8";
    g.font = `700 27px ${f.sans}`;
    g.fillText(nameColor(col), x0 + i * step, cy + r + 54);
  });
  y = cy + r + 110;

  if (refs.length) {
    const gap = 16, h = Math.min(760, PH - 130 - y);
    const w = (960 - gap * (refs.length - 1)) / refs.length;
    refs.forEach((_, i) => {
      const img = imgs[i];
      if (img) cover(g, img, 60 + i * (w + gap), y, w, h, 20);
    });
  }
  footer(g, "Made on Shubh Desi");
  return c;
}

const BRIEF_TYPES: Record<"decor" | "outfit", CardType[]> = {
  decor: ["decor", "flowers", "vibe"],
  outfit: ["outfit", "details"],
};

export function briefCards(board: Board, ev: EventDef, kind: "decor" | "outfit"): { wanted: Card[]; avoid: Card[] } {
  const all = board.cards.filter((c) => c.eventId === ev.id && BRIEF_TYPES[kind].includes(c.type));
  const wanted = ranked(all.filter((c) => c.kind === "image" && c.react !== "no" && (c.react === "love" || c.pins.length > 0 || !!c.note?.trim())));
  const avoid = all.filter((c) => c.kind === "image" && c.react === "no");
  return { wanted, avoid };
}

// A brief someone can act on: every wanted photo, whole, with its numbered notes beside it.
export async function briefPages(board: Board, ev: EventDef, kind: "decor" | "outfit"): Promise<HTMLCanvasElement[]> {
  const f = await ready();
  const { wanted, avoid } = briefCards(board, ev, kind);
  if (!wanted.length && !avoid.length) return [];
  const palette = eventPalette(board, ev);
  const bg = mix(PAPER, palette[0] ?? PAPER, 0.07);
  const label = kind === "decor" ? "DECOR BRIEF" : "OUTFIT BRIEF";
  const pages: HTMLCanvasElement[] = [];
  let g!: G;
  let y = 0;
  const LIMIT = PH - 120;

  const start = () => {
    const p = page(bg);
    pages.push(p.c);
    g = p.g;
    g.textAlign = "left";
    if (pages.length === 1) {
      g.fillStyle = INK + "99";
      g.font = `700 24px ${f.sans}`;
      spaced(g, 6);
      g.fillText(`${board.title.toUpperCase()}  ·  ${label}`, 60, 110);
      spaced(g, 0);
      g.fillStyle = INK;
      fitText(g, ev.name, (px) => `italic 500 ${px}px ${f.display}`, 132, 960);
      g.fillText(ev.name, 56, 250);
      let x = 60;
      palette.forEach((col) => {
        g.beginPath();
        g.arc(x + 30, 340, 30, 0, Math.PI * 2);
        g.fillStyle = col;
        g.fill();
        g.fillStyle = INK + "c0";
        g.font = `400 22px ${f.sans}`;
        const name = nameColor(col);
        g.fillText(name, x + 72, 348);
        x += 72 + g.measureText(name).width + 34;
        if (x > 900) x = 2000; // no room for more names on this line
      });
      y = 440;
    } else {
      g.fillStyle = INK + "99";
      g.font = `700 22px ${f.sans}`;
      spaced(g, 5);
      g.fillText(`${ev.name.toUpperCase()}  ·  ${label}  ·  ${pages.length}`, 60, 100);
      spaced(g, 0);
      y = 150;
    }
  };
  const finish = () => footer(g, "Made on Shubh Desi");
  start();

  for (const card of wanted) {
    const img = await imgOf(card);
    const ar = card.h / card.w;
    let iw = 430, ih = iw * ar;
    if (ih > 640) { ih = 640; iw = ih / ar; }

    // measure the text column first, so the entry can move to a new page whole
    const tx = 60 + 430 + 50, tw = PW - 60 - tx;
    g.font = `400 40px ${f.hand}`;
    const noteLines = card.note?.trim() ? wrap(g, card.note.trim(), tw - 44) : [];
    g.font = `400 30px ${f.sans}`;
    const pinLines = card.pins.map((p) => wrap(g, p.text || "Look at this", tw - 64));
    const textH = (card.react === "love" ? 46 : 0) + (noteLines.length ? noteLines.length * 50 + 48 : 0) + pinLines.reduce((a, l) => a + l.length * 40 + 18, 0);
    const eh = Math.max(ih, textH);
    if (y + eh > LIMIT && y > 200) { finish(); start(); }

    const ix = 60 + (430 - iw) / 2;
    if (img) cover(g, img, ix, y, iw, ih, 16);
    card.pins.forEach((p, i) => {
      const px = ix + p.x * iw, py = y + p.y * ih;
      g.beginPath();
      g.arc(px, py, 24, 0, Math.PI * 2);
      g.fillStyle = "#ffffff";
      g.fill();
      g.beginPath();
      g.arc(px, py, 19, 0, Math.PI * 2);
      g.fillStyle = TONE[p.tone];
      g.fill();
      g.fillStyle = "#ffffff";
      g.font = `700 22px ${f.sans}`;
      g.textAlign = "center";
      g.fillText(String(i + 1), px, py + 8);
      g.textAlign = "left";
    });

    let ty = y;
    if (card.react === "love") {
      g.fillStyle = "#d13b5f";
      g.font = `700 24px ${f.sans}`;
      g.fillText("♥  Loved", tx, ty + 26);
      ty += 46;
    }
    if (noteLines.length) {
      const nh = noteLines.length * 50 + 28;
      rr(g, tx, ty, tw, nh, 10);
      g.fillStyle = PAPERS[paperOf(card)];
      g.fill();
      g.fillStyle = INK;
      g.font = `400 40px ${f.hand}`;
      noteLines.forEach((l, i) => g.fillText(l, tx + 22, ty + 48 + i * 50));
      ty += nh + 20;
    }
    card.pins.forEach((p, i) => {
      g.beginPath();
      g.arc(tx + 19, ty + 22, 19, 0, Math.PI * 2);
      g.fillStyle = TONE[p.tone];
      g.fill();
      g.fillStyle = "#ffffff";
      g.font = `700 22px ${f.sans}`;
      g.textAlign = "center";
      g.fillText(String(i + 1), tx + 19, ty + 30);
      g.textAlign = "left";
      g.fillStyle = INK;
      g.font = `400 30px ${f.sans}`;
      pinLines[i].forEach((l, k) => g.fillText(l, tx + 56, ty + 32 + k * 40));
      ty += pinLines[i].length * 40 + 18;
    });
    y += eh + 56;
  }

  // combinations: "these, together"
  const groupIds = new Set(wanted.map((c) => c.id));
  for (const combo of board.combos.filter((k) => k.eventId === ev.id && k.cardIds.some((id) => groupIds.has(id)))) {
    const cards = combo.cardIds.map((id) => board.cards.find((c) => c.id === id)).filter((c): c is Card => !!c);
    if (cards.length < 2) continue;
    const H = 300;
    if (y + H + 130 > LIMIT) { finish(); start(); }
    g.fillStyle = INK + "99";
    g.font = `700 22px ${f.sans}`;
    spaced(g, 5);
    g.fillText("LOVED TOGETHER", 60, y + 22);
    spaced(g, 0);
    y += 44;
    const widths = cards.map((c) => (H * c.w) / c.h);
    const total = widths.reduce((a, b) => a + b, 0) + (cards.length - 1) * 12;
    const s = Math.min(1, 960 / total);
    let x = 60;
    for (let i = 0; i < cards.length; i++) {
      const img = await imgOf(cards[i]);
      if (img) cover(g, img, x, y, widths[i] * s, H * s, 14);
      x += widths[i] * s + 12;
    }
    y += H * s + 20;
    if (combo.note.trim()) {
      g.fillStyle = INK;
      g.font = `400 40px ${f.hand}`;
      g.fillText(wrap(g, combo.note.trim(), 960)[0], 60, y + 36);
      y += 56;
    }
    y += 40;
  }

  if (avoid.length) {
    const H = 220;
    if (y + H + 110 > LIMIT) { finish(); start(); }
    g.fillStyle = TONE.no;
    g.font = `700 22px ${f.sans}`;
    spaced(g, 5);
    g.fillText("NOT THIS, PLEASE", 60, y + 22);
    spaced(g, 0);
    y += 44;
    let x = 60;
    for (const card of avoid.slice(0, 5)) {
      const w = Math.min(280, (H * card.w) / card.h);
      if (x + w > PW - 60) break;
      const img = await imgOf(card);
      if (img) cover(g, img, x, y, w, H, 14);
      g.strokeStyle = TONE.no;
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(x + 14, y + 14);
      g.lineTo(x + w - 14, y + H - 14);
      g.stroke();
      if (card.note?.trim()) {
        g.fillStyle = INK + "d0";
        g.font = `400 28px ${f.hand}`;
        g.fillText(wrap(g, card.note.trim(), w)[0], x, y + H + 34);
      }
      x += w + 16;
    }
    y += H + 60;
  }
  finish();
  return pages;
}

export const canvasBlob = (c: HTMLCanvasElement, type: "image/png" | "image/jpeg" = "image/png", q = 0.92) =>
  new Promise<Blob>((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not make the picture"))), type, q));

export const textColorFor = inkOn;
