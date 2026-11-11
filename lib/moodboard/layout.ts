// How things are arranged: the scrolling grid, the tight collage for each event, and the facts
// the board works out from the cards (an event's palette, its best photos, its notes).

import { blendPalettes } from "./palette";
import type { Board, Card, EventDef } from "./types";

export type Rect = { id: string; x: number; y: number; w: number; h: number };

// Pinterest-style columns: each card goes to whichever column is shortest so far.
export function masonry<T extends { w: number; h: number; extra?: number }>(items: T[], cols: number): T[][] {
  const out: T[][] = Array.from({ length: cols }, () => []);
  const heights = new Array(cols).fill(0);
  for (const it of items) {
    let k = 0;
    for (let i = 1; i < cols; i++) if (heights[i] < heights[k] - 0.001) k = i;
    out[k].push(it);
    heights[k] += it.h / it.w + (it.extra ?? 0) + 0.06;
  }
  return out;
}

// How many pictures per column, and how wide each column is, for a collage of n pictures.
const SHAPES: Record<number, { counts: number[]; widths: number[] }> = {
  1: { counts: [1], widths: [1] },
  2: { counts: [1, 1], widths: [0.5, 0.5] },
  3: { counts: [1, 2], widths: [0.58, 0.42] },
  4: { counts: [2, 2], widths: [0.52, 0.48] },
  5: { counts: [2, 3], widths: [0.56, 0.44] },
  6: { counts: [2, 2, 2], widths: [0.36, 0.3, 0.34] },
  7: { counts: [2, 3, 2], widths: [0.36, 0.3, 0.34] },
  8: { counts: [3, 2, 3], widths: [0.32, 0.36, 0.32] },
  9: { counts: [3, 3, 3], widths: [0.34, 0.32, 0.34] },
};

// A gapless-looking collage that exactly fills a W x H box, like the mood boards people pin.
// The first picture is the hero and gets the biggest tile; the rest go where their shape fits best
// (tall pictures in tall tiles), so cropping stays gentle.
export function collage(items: { id: string; w: number; h: number }[], W: number, H: number, gap: number): Rect[] {
  const list = items.slice(0, 9);
  const n = list.length;
  if (!n) return [];
  const shape = SHAPES[n];
  const slots: (Rect & { ar: number })[] = [];
  let x = 0;
  const innerW = W - gap * (shape.counts.length - 1);
  shape.counts.forEach((count, c) => {
    const w = innerW * shape.widths[c];
    const innerH = H - gap * (count - 1);
    // alternate tall and short tiles inside a column so the grid doesn't look like a table
    const parts = Array.from({ length: count }, (_, i) => (count === 1 ? 1 : (i + c) % 2 === 0 ? 1.18 : 0.86));
    const sum = parts.reduce((a, b) => a + b, 0);
    let y = 0;
    parts.forEach((p) => {
      const h = (innerH * p) / sum;
      slots.push({ id: "", x, y, w, h, ar: h / w });
      y += h + gap;
    });
    x += w + gap;
  });
  const hero = list[0];
  const rest = list.slice(1).sort((a, b) => b.h / b.w - a.h / a.w);
  const bySize = [...slots].sort((a, b) => b.w * b.h - a.w * a.h);
  const heroSlot = bySize[0];
  heroSlot.id = hero.id;
  const free = slots.filter((s) => s !== heroSlot).sort((a, b) => b.ar - a.ar);
  free.forEach((s, i) => { s.id = rest[i].id; });
  return slots.map(({ id, x, y, w, h }) => ({ id, x, y, w, h }));
}

// ---- what the board works out from its cards ----

const reactWeight = (c: Card) => (c.react === "love" ? 3 : c.react === "maybe" ? 0.6 : 1);

export const imagesOf = (board: Board, eventId?: string) =>
  board.cards.filter((c) => c.kind === "image" && (!eventId || c.eventId === eventId));

// Loved first, then by when they were added; "not this" last.
export function ranked(cards: Card[]): Card[] {
  const score = (c: Card) => (c.react === "love" ? 0 : c.react === "no" ? 3 : c.react === "maybe" ? 2 : 1);
  return [...cards].sort((a, b) => score(a) - score(b) || b.at - a.at);
}

// An event's colours: the ones the person pinned, then the blend of its photos
// (loved ones count most, "not this" doesn't count).
export function eventPalette(board: Board, ev: EventDef, n = 5): string[] {
  const cards = imagesOf(board, ev.id).filter((c) => c.react !== "no");
  const auto = blendPalettes(cards.map((c) => ({ colors: c.colors, weight: reactWeight(c) })), n + ev.pinned.length);
  const out = [...ev.pinned];
  for (const c of auto) {
    if (out.length >= n) break;
    if (!out.includes(c)) out.push(c);
  }
  return out.slice(0, Math.max(n, ev.pinned.length));
}

export function boardPalette(board: Board, n = 6): string[] {
  const cards = imagesOf(board).filter((c) => c.react !== "no");
  return blendPalettes(cards.map((c) => ({ colors: c.colors.slice(0, 3), weight: reactWeight(c) })), n);
}

// The pictures an event's collage shows: loved ones first, never the rejected ones.
export function collagePicks(board: Board, eventId: string, max = 7): Card[] {
  return ranked(imagesOf(board, eventId).filter((c) => c.react !== "no")).slice(0, max);
}

// The sticky notes worth quoting on a poster.
export function topNotes(board: Board, eventId: string, max = 3): string[] {
  const cards = ranked(board.cards.filter((c) => c.eventId === eventId && c.react !== "no" && c.note?.trim()));
  return cards.slice(0, max).map((c) => c.note!.trim());
}

// The colours guests are asked to wear: the ones the person chose, else the event's first three.
export function dressColors(board: Board, ev: EventDef): string[] {
  return ev.dress?.colors.length ? ev.dress.colors : eventPalette(board, ev).slice(0, 3);
}

// Outfit photos to show guests as examples: the loved ones.
export function dressRefs(board: Board, ev: EventDef, max = 3): Card[] {
  return ranked(imagesOf(board, ev.id).filter((c) => c.type === "outfit" && c.react === "love")).slice(0, max);
}
