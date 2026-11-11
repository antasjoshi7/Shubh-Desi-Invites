// The choices shown in the editor's pickers.
// Backgrounds and fonts come from data/*.json, which `npm run assets` generates.
// Palettes and layouts are hand-written in data/palettes.json and data/layouts.json.
// A layout's anchor is where the text sits inside the design's clear area (0 = top, 1 = bottom).

import backgroundsJson from "@/data/backgrounds.json";
import fontsJson from "@/data/fonts.json";
import layoutsJson from "@/data/layouts.json";
import palettesJson from "@/data/palettes.json";
import { rankPalettes } from "./colors";
import { SCENE_NAMES } from "./motions";
import type { AnimationId, BgColours, EventId, LayoutId, Palette, SymbolStyle, TransitionId } from "./types";

export type Background = {
  id: string;
  kind: "simple" | "illustrated"; // simple = designs with a clear middle
  category: string; // e.g. "peacocks", "elephants" (see CATEGORY_LABELS)
  src: string; // web-sized image used for drawing
  thumb: string; // small image for the picker
  primary: string; // main colour of the design
  paper: string; // the plain colour behind the design (what recolouring replaces)
  centre: string; // average colour behind the text area
  busyness: number; // how detailed the design is behind the text
  layout: LayoutId; // which end is less decorated (older hint; text now fits into `safe`)
  safe: { x: number; y: number; w: number; h: number }; // clear area in the middle, as fractions of the page
  score: number; // higher = calmer and more traditional (shown first)
};

export type FontInfo = {
  id: string;
  family: string;
  regular: string;
  bold?: string;
  style: "traditional" | "script" | "display" | "modern";
  hindi?: boolean; // has Hindi (Devanagari) letters
};

export const SYMBOL_STYLES: { id: SymbolStyle; name: string }[] = [
  { id: "ganesh-line", name: "Ganesh ji" },
  { id: "ganesh-filled", name: "Ganesh ji, filled" },
  { id: "ganesh-circle", name: "Ganesh ji, circle" },
  { id: "ganesh-lotus", name: "Ganesh ji, lotus" },
  { id: "ganesh-arch", name: "Ganesh ji, arch" },
  { id: "om-classic", name: "Om" },
  { id: "om-circle", name: "Om, circle" },
  { id: "om-lotus", name: "Om, lotus" },
  { id: "om-rays", name: "Om, sun rays" },
  { id: "om-mandala", name: "Om, mandala" },
  { id: "mono-classic", name: "Classic" },
  { id: "mono-circle", name: "Circle" },
  { id: "mono-script", name: "Script" },
  { id: "mono-crest", name: "Crest" },
  { id: "mono-wreath", name: "Wreath" },
];
export const DEFAULT_INITIALS: [string, string] = ["R", "A"];

export const BACKGROUNDS = backgroundsJson as Background[]; // already grouped by category, best-first

// Library section names, in display order (matches CATEGORY_ORDER in scripts/build-assets.mjs).
export const CATEGORY_LABELS: { id: string; name: string }[] = [
  { id: "sangeet", name: "Sangeet" },
  { id: "haldi", name: "Haldi" },
  { id: "mehendi", name: "Mehendi" },
  { id: "wedding", name: "Wedding" },
  { id: "reception", name: "Reception" },
  { id: "minimal", name: "Minimal & gold" },
  { id: "regional", name: "Folk & regional art" },
  { id: "abstract", name: "Painted & abstract" },
  { id: "prints", name: "Block prints" },
  { id: "peacocks", name: "Peacocks" },
  { id: "elephants", name: "Elephants" },
  { id: "tigers", name: "Tigers" },
  { id: "birds", name: "Birds" },
  { id: "horses", name: "Horses" },
  { id: "florals", name: "Flowers" },
  { id: "marigold", name: "Marigold & haldi" },
  { id: "lotus", name: "Lotus & Pichwai" },
  { id: "temple", name: "Temple & kalash" },
  { id: "palaces", name: "Palaces & arches" },
  { id: "paisley", name: "Paisley & mehendi" },
  { id: "borders", name: "Borders & lace" },
  { id: "lights", name: "Lanterns & lights" },
  { id: "drawn", name: "Simple drawn" },
  { id: "illustrated", name: "Busy illustrated" },
];
export const BEST_PICKS = 12; // how many backgrounds get a ★
export const FONTS = fontsJson as FontInfo[]; // already sorted traditional-first
export const PALETTES = palettesJson as Palette[];
export const LAYOUTS = layoutsJson as { id: LayoutId; name: string; anchor: number }[];

export function findBackground(src: string): Background | undefined {
  return BACKGROUNDS.find((b) => b.src === src);
}

// Colours for the plain background behind the design.
export const PAPER_COLOURS: { name: string; color: string }[] = [
  { name: "Ivory", color: "#fbf6ec" },
  { name: "Cream", color: "#f6ead2" },
  { name: "Blush", color: "#f9e4e4" },
  { name: "Haldi yellow", color: "#fbe7a1" },
  { name: "Peach", color: "#fde3cf" },
  { name: "Mint", color: "#e3f1e6" },
  { name: "Sky", color: "#e4eef7" },
  { name: "Lilac", color: "#ece4f4" },
  { name: "Maroon", color: "#4a0e1e" },
  { name: "Wine", color: "#3e0a26" },
  { name: "Plum", color: "#33103a" },
  { name: "Emerald", color: "#0f3b2e" },
  { name: "Navy", color: "#13224a" },
  { name: "Black", color: "#151012" },
];

// Colours for the decoration (flowers, borders, arches…).
export const DESIGN_COLOURS: { name: string; color: string }[] = [
  { name: "Gold", color: "#c9a03a" },
  { name: "Rose", color: "#d9667f" },
  { name: "Rani pink", color: "#c2185b" },
  { name: "Maroon", color: "#7a1630" },
  { name: "Marigold", color: "#f29f1c" },
  { name: "Haldi yellow", color: "#e8b923" },
  { name: "Mehendi green", color: "#5f7d2e" },
  { name: "Emerald", color: "#1f7a52" },
  { name: "Peacock", color: "#14707a" },
  { name: "Royal blue", color: "#2a4aa0" },
  { name: "Purple", color: "#6b3fa0" },
  { name: "Peach", color: "#f2a07b" },
  { name: "Ivory", color: "#f4ead2" },
];

// One-tap colour sets for common events.
export const THEMES: { name: string; colours: BgColours }[] = [
  { name: "Haldi", colours: { paper: "#fbe7a1", design: "#f29f1c", opacity: 1 } },
  { name: "Mehendi", colours: { paper: "#e3f1e6", design: "#5f7d2e", opacity: 1 } },
  { name: "Sangeet", colours: { paper: "#33103a", design: "#c9a03a", opacity: 1 } },
  { name: "Shaadi", colours: { paper: "#4a0e1e", design: "#c9a03a", opacity: 1 } },
  { name: "Reception", colours: { paper: "#13224a", design: "#c9a03a", opacity: 1 } },
];

// Each event's matching colour theme and the design category that suits it.
export const EVENT_LOOK: Record<EventId, { theme: string; category: string }> = {
  haldi: { theme: "Haldi", category: "haldi" },
  mehendi: { theme: "Mehendi", category: "mehendi" },
  sangeet: { theme: "Sangeet", category: "sangeet" },
  shaadi: { theme: "Shaadi", category: "wedding" },
  reception: { theme: "Reception", category: "reception" },
};

export const ORIGINAL_COLOURS: BgColours = { paper: null, design: null, opacity: 1 };

// The colour the text sits on.
export function surfaceOf(colours: BgColours, bg?: Background): string {
  return colours.paper ?? bg?.paper ?? bg?.centre ?? "#ffffff";
}

// The recommended look for a background: original colours, text in the middle of its clear area, and the best palette.
export function lookFor(bg: Background): { colours: BgColours; layout: LayoutId; palette: Palette } {
  return {
    colours: { ...ORIGINAL_COLOURS },
    layout: "centered",
    palette: rankPalettes(PALETTES, surfaceOf(ORIGINAL_COLOURS, bg), bg.primary)[0].palette,
  };
}

export const ANIMATIONS: { id: AnimationId; name: string }[] = [
  { id: "ghodi", name: "Baraat ghodi" },
  { id: "elephants", name: "Elephant procession" },
  { id: "peacock", name: "Peacock dance" },
  { id: "rosePetals", name: "Rose petals" },
  { id: "marigolds", name: "Marigold garlands" },
  { id: "diyaRow", name: "Diya lights" },
  { id: "lanterns", name: "Swinging lanterns" },
  { id: "skyLanterns", name: "Sky lanterns" },
  { id: "doors", name: "Palace doors" },
  { id: "lotus", name: "Lotus bloom" },
  { id: "kalash", name: "Kalash blessing" },
  { id: "mehendi", name: "Mehendi" },
  { id: "parrots", name: "Parrots" },
  { id: "butterflies", name: "Butterflies" },
  { id: "clouds", name: "Floating clouds" },
  ...SCENE_NAMES,
  { id: "sparkles", name: "Golden sparkles" },
  { id: "fadeUp", name: "Fade up" },
  { id: "wipe", name: "Wipe" },
  { id: "typewriter", name: "Typewriter" },
  { id: "blur", name: "Blur in" },
];

export const TRANSITIONS: { id: TransitionId; name: string }[] = [
  { id: "flythrough", name: "Fly through" },
  { id: "goldflash", name: "Golden glow" },
  { id: "crossfade", name: "Crossfade" },
  { id: "slide", name: "Slide" },
  { id: "zoom", name: "Zoom" },
  { id: "wipe", name: "Wipe" },
  { id: "rise", name: "Rise" },
  { id: "circle", name: "Circle" },
  { id: "blinds", name: "Blinds" },
  { id: "curtain", name: "Curtain" },
  { id: "flip", name: "Flip" },
  { id: "diagonal", name: "Diagonal" },
];

export const DURATIONS = [3, 4, 5, 6, 8, 10, 12, 15];

export const MAX_PAGES = 10;
