// Pictures for the landing pages: finished sample invites (rendered by the tool itself, see
// scripts/render-samples) where we have them, otherwise the plain designs from the library.

import samplesJson from "@/data/samples.json";
import { BACKGROUNDS, CATEGORY_LABELS } from "../catalog";

export type Sample = { src: string; design: string; event?: string; alt: string };
export const SAMPLES = samplesJson as Sample[];

export type Tile = { src: string; alt: string; href: string; label: string };

const label = (category: string) => CATEGORY_LABELS.find((c) => c.id === category)?.name ?? category;
const designAlt = (category: string) => `${label(category)} Indian wedding invitation design, blank for your text`;

// Finished samples first (for this event, if given; "shaadi" = the main wedding invite), then designs from these categories.
export function tilesFor(categories: string[], count: number, event?: string): Tile[] {
  const tiles: Tile[] = [];
  const used = new Set<string>();
  for (const s of SAMPLES) {
    if (tiles.length >= count) break;
    if (event && s.event !== event) continue;
    used.add(s.design);
    // the main wedding samples open as the invitation page; event samples add that event's page
    tiles.push({ src: s.src, alt: s.alt, href: link(s.design, s.event === "shaadi" ? undefined : s.event), label: "Use this design" });
  }
  for (const c of categories) {
    for (const b of BACKGROUNDS.filter((x) => x.category === c)) {
      if (tiles.length >= count) return tiles;
      if (used.has(b.id)) continue;
      used.add(b.id);
      tiles.push({ src: b.thumb, alt: designAlt(c), href: link(b.id, event), label: "Use this design" });
    }
  }
  return tiles;
}

export function link(design: string, event?: string) {
  const q = new URLSearchParams();
  if (event) q.set("event", event);
  q.set("design", design);
  return `/create?${q}`;
}

export function designsByCategory() {
  return CATEGORY_LABELS.map((c) => ({
    id: c.id,
    name: c.name,
    designs: BACKGROUNDS.filter((b) => b.category === c.id).map((b) => ({ id: b.id, src: b.thumb, alt: designAlt(c.id), href: link(b.id) })),
  })).filter((c) => c.designs.length);
}
