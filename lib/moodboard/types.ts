// What a mood board is made of. Everything here is saved on the person's own phone.

export type CardType = "decor" | "outfit" | "flowers" | "details" | "vibe";

export const TYPES: { id: CardType; label: string; hint: string }[] = [
  { id: "decor", label: "Decor", hint: "stage, mandap, entrance, seating, lights" },
  { id: "outfit", label: "Outfits", hint: "lehenga, saree, sherwani, kurta" },
  { id: "flowers", label: "Flowers", hint: "strings, garlands, table flowers" },
  { id: "details", label: "Details", hint: "jewellery, mehendi, hair, small things" },
  { id: "vibe", label: "Vibe", hint: "the feeling, a moment, a colour" },
];

export const typeLabel = (t: CardType) => TYPES.find((x) => x.id === t)?.label ?? "Vibe";

export type Reaction = "love" | "maybe" | "no";
export type Tone = "love" | "change" | "no";

// A numbered pin on a photo with a short note ("more marigold here").
export type Pin = { id: string; x: number; y: number; text: string; tone: Tone };

export type Card = {
  id: string;
  kind: "image" | "note";
  eventId: string;
  type: CardType;
  w: number;
  h: number;
  colors: string[]; // the photo's main colours, strongest first
  dom: string; // the colour shown while the photo loads
  hash?: string; // fingerprint, to spot the same photo added twice
  react?: Reaction;
  pins: Pin[];
  note?: string; // the sticky note on the card (for a note card, its text)
  paper?: number; // which sticky-note paper colour
  src?: string; // sample photos live on the site: "/moodboard/s/07"
  link?: string; // where it came from (a reel or pin), if the person pasted one
  trimmed?: boolean; // app bars were cut off a screenshot; the untrimmed copy is kept
  credit?: string;
  at: number;
};

// What guests should wear to this event: one line, and the colours to wear (empty = the event's
// own first colours).
export type Dress = { line: string; colors: string[] };

export type EventDef = { id: string; name: string; pinned: string[]; dress?: Dress };

// Two to four cards the person loves as a combination.
export type Combo = { id: string; eventId: string; cardIds: string[]; note: string };

export type Board = {
  v: 1;
  title: string;
  line: string; // one line about the feeling
  events: EventDef[];
  cards: Card[];
  combos: Combo[];
  sample: boolean; // still the starter board
};

export const DEFAULT_EVENTS: EventDef[] = [
  { id: "overall", name: "Overall", pinned: [] },
  { id: "mehendi", name: "Mehendi", pinned: [] },
  { id: "haldi", name: "Haldi", pinned: [] },
  { id: "sangeet", name: "Sangeet", pinned: [] },
  { id: "wedding", name: "Wedding", pinned: [] },
  { id: "reception", name: "Reception", pinned: [] },
];

export const emptyBoard = (title = "My wedding board"): Board => ({
  v: 1,
  title,
  line: "",
  events: DEFAULT_EVENTS.map((e) => ({ ...e, pinned: [] })),
  cards: [],
  combos: [],
  sample: false,
});

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

// Ready-made notes, so marking up a photo is a tap, not typing.
export const QUICK_PINS: Record<CardType, { text: string; tone: Tone }[]> = {
  decor: [
    { text: "Love this backdrop", tone: "love" },
    { text: "These flowers", tone: "love" },
    { text: "This lighting", tone: "love" },
    { text: "Seating like this", tone: "love" },
    { text: "Entrance like this", tone: "love" },
    { text: "This colour", tone: "love" },
    { text: "Change the colour", tone: "change" },
    { text: "Less of this", tone: "change" },
    { text: "Not this part", tone: "no" },
  ],
  outfit: [
    { text: "This colour", tone: "love" },
    { text: "This embroidery", tone: "love" },
    { text: "This dupatta drape", tone: "love" },
    { text: "This blouse", tone: "love" },
    { text: "Jewellery like this", tone: "love" },
    { text: "For the sisters", tone: "love" },
    { text: "Lighter shade", tone: "change" },
    { text: "Not this part", tone: "no" },
  ],
  flowers: [
    { text: "These flowers", tone: "love" },
    { text: "Strings like this", tone: "love" },
    { text: "This colour mix", tone: "love" },
    { text: "Real flowers only", tone: "change" },
    { text: "More of this", tone: "change" },
    { text: "Not this part", tone: "no" },
  ],
  details: [
    { text: "Exactly this", tone: "love" },
    { text: "This design", tone: "love" },
    { text: "This colour", tone: "love" },
    { text: "Simpler than this", tone: "change" },
    { text: "Not this part", tone: "no" },
  ],
  vibe: [
    { text: "This feeling", tone: "love" },
    { text: "This colour", tone: "love" },
    { text: "This light", tone: "love" },
    { text: "A moment like this", tone: "love" },
    { text: "Not this part", tone: "no" },
  ],
};

export const PAPERS = ["#fff3b0", "#ffd9e0", "#d7f0dc", "#e3dcf7", "#ffe1c2"];

// A card's sticky-note paper: the one the person chose, else a steady pick so a board isn't all yellow.
export const paperOf = (c: { id: string; paper?: number }) => c.paper ?? (c.id.charCodeAt(c.id.length - 1) + c.id.charCodeAt(1)) % PAPERS.length;

// One-tap dress codes.
export const DRESS_IDEAS = ["Shades of yellow", "Pastels", "Jewel tones", "Bright and colourful", "Ivory and gold", "Indian festive", "No white or black, please"];
