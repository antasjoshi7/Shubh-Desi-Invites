// The starter board: 29 free-licence photos from Unsplash, sorted and annotated by hand so a
// first-time visitor sees what a finished board looks like. Sizes and colours come from
// samples.json (made by scripts/build-moodboard-samples.mjs).

import data from "./samples.json";
import { DEFAULT_EVENTS, type Board, type Card, type CardType, type Pin, type Reaction, type Tone } from "./types";

type Tag = {
  e: string;
  t: CardType;
  r?: Reaction;
  n?: string;
  p?: [number, number, string, Tone?][];
};

// One entry per photo, in file order.
const TAGS: Tag[] = [
  /* 00 */ { e: "sangeet", t: "decor", r: "love", n: "the whole garden lit up", p: [[0.24, 0.42, "Fairy lights wrapped round the trees"], [0.44, 0.24, "Hanging lanterns"]] },
  /* 01 */ { e: "haldi", t: "decor", r: "love", n: "marigold wall!!", p: [[0.74, 0.22, "Genda phool strings like this"], [0.5, 0.86, "A gold lotus seat for the bride"]] },
  /* 02 */ { e: "wedding", t: "outfit", r: "love", n: "rani pink + gold", p: [[0.6, 0.3, "This nath and maang tikka"]] },
  /* 03 */ { e: "wedding", t: "decor", r: "maybe", n: "open-air mandap?" },
  /* 04 */ { e: "reception", t: "decor", r: "love", n: "warm gold everything", p: [[0.5, 0.2, "A big chandelier in the middle"]] },
  /* 05 */ { e: "reception", t: "vibe", n: "a little bit magic" },
  /* 06 */ { e: "mehendi", t: "decor", r: "love", n: "colour everywhere", p: [[0.5, 0.1, "Pink and green canopy"], [0.74, 0.84, "Low seating with printed cushions"]] },
  /* 07 */ { e: "haldi", t: "vibe", r: "love", n: "everyone joins in" },
  /* 08 */ { e: "overall", t: "vibe", r: "love", n: "easy, happy, us" },
  /* 09 */ { e: "mehendi", t: "outfit", r: "love", n: "pink + green for me", p: [[0.44, 0.52, "Temple jewellery"]] },
  /* 10 */ { e: "wedding", t: "decor", r: "love", n: "peach and ivory", p: [[0.5, 0.3, "Arches like this behind the mandap"]] },
  /* 11 */ { e: "wedding", t: "outfit", r: "maybe", n: "orange safa for the boys?" },
  /* 12 */ { e: "wedding", t: "outfit", r: "no", n: "too much red together" },
  /* 13 */ { e: "wedding", t: "flowers", r: "love", n: "pheras under this", p: [[0.5, 0.34, "Hanging strings from the tree"], [0.5, 0.82, "White flowers along the aisle"]] },
  /* 14 */ { e: "wedding", t: "vibe", r: "love" },
  /* 15 */ { e: "mehendi", t: "details", r: "love", n: "full hands, fine lines" },
  /* 16 */ { e: "haldi", t: "outfit", r: "love", n: "we match in yellow", p: [[0.72, 0.5, "Ivory kurta, yellow dupatta"]] },
  /* 17 */ { e: "haldi", t: "vibe", r: "love", n: "phoolon ki holi" },
  /* 18 */ { e: "wedding", t: "outfit" },
  /* 19 */ { e: "sangeet", t: "vibe", r: "love", n: "end the night like this" },
  /* 20 */ { e: "sangeet", t: "outfit", r: "love", n: "pastels for the sisters", p: [[0.47, 0.44, "Powder blue lehenga"]] },
  /* 21 */ { e: "overall", t: "flowers", n: "red and pink together" },
  /* 22 */ { e: "wedding", t: "vibe" },
  /* 23 */ { e: "haldi", t: "flowers", r: "love", n: "orange + white strings", p: [[0.42, 0.72, "Marigold with white tuberose"]] },
  /* 24 */ { e: "overall", t: "outfit", r: "maybe", n: "classic red, both of us" },
  /* 25 */ { e: "sangeet", t: "decor", r: "love", n: "walk in through lights", p: [[0.5, 0.5, "A tunnel of fairy lights at the entry"]] },
  /* 26 */ { e: "mehendi", t: "decor", r: "love", n: "cosy corners", p: [[0.46, 0.45, "Embroidered cushions"], [0.3, 0.74, "Wooden crates as side tables"]] },
  /* 27 */ { e: "wedding", t: "decor", r: "love", n: "all-white mandap", p: [[0.5, 0.4, "A floral dome"], [0.5, 0.78, "Mirror aisle", "change"]] },
  /* 28 */ { e: "sangeet", t: "decor", r: "love", n: "bulbs over the dance floor" },
];

const SAMPLE_DRESS: Record<string, string> = {
  haldi: "Shades of yellow. No white, please.",
  sangeet: "Jewel tones and a little sparkle.",
};

export const SAMPLE_CREDITS: string[] = [...new Set(data.map((d) => d.credit).filter(Boolean))];

export function sampleBoard(): Board {
  const cards: Card[] = data.map((d, i) => {
    const tag = TAGS[i] ?? { e: "overall", t: "vibe" as CardType };
    const pins: Pin[] = (tag.p ?? []).map(([x, y, text, tone], k) => ({ id: `s${d.id}p${k}`, x, y, text, tone: tone ?? "love" }));
    return {
      id: `s${d.id}`,
      kind: "image",
      eventId: tag.e,
      type: tag.t,
      w: d.w,
      h: d.h,
      colors: d.colors,
      dom: d.dom,
      hash: d.hash,
      react: tag.r,
      pins,
      note: tag.n,
      src: `/moodboard/s/${d.id}`,
      credit: d.credit,
      at: 1000 - i,
    };
  });
  cards.push({ id: "sn1", kind: "note", eventId: "sangeet", type: "vibe", w: 4, h: 3, colors: [], dom: "#e3dcf7", pins: [], note: "Dress code: jewel tones, nothing white", paper: 3, at: 990.5 });
  cards.push({ id: "sn2", kind: "note", eventId: "haldi", type: "vibe", w: 4, h: 3, colors: [], dom: "#fff3b0", pins: [], note: "Everyone in yellow. Real marigold only!", paper: 0, at: 998.5 });
  return {
    v: 1,
    title: "Meera's wedding board",
    line: "Marigold mornings, fairy-light nights.",
    events: DEFAULT_EVENTS.map((e) => ({ ...e, pinned: [], dress: SAMPLE_DRESS[e.id] ? { line: SAMPLE_DRESS[e.id], colors: [] } : undefined })),
    cards,
    combos: [
      { id: "sc1", eventId: "haldi", cardIds: ["s01", "s23"], note: "this backdrop with these strings" },
      { id: "sc2", eventId: "sangeet", cardIds: ["s25", "s28", "s00"], note: "lights, lights, lights" },
      { id: "sc3", eventId: "wedding", cardIds: ["s10", "s27"], note: "arches + white flowers" },
    ],
    sample: true,
  };
}
