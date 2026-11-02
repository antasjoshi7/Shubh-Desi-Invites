// The invite is plain JSON. These types describe its shape.

// How the background design is coloured. null = keep the original colour.
export type BgColours = {
  paper: string | null; // the plain background colour behind the design
  design: string | null; // the colour of the decoration (flowers, borders…)
  opacity: number; // how strongly the decoration shows, 0.2–1
};

export type TextSize = "xl" | "l" | "m" | "s" | "xs";

// What a line is, which decides how it looks (see lib/textStyles.ts).
export type TextRole = "title" | "names" | "script" | "date" | "details" | "body" | "small";

// One line item on a page, e.g. "Names", "Date", "Venue", or a custom one.
export type TextBox = {
  id: string;
  label: string;
  text: string;
  size: TextSize; // older size names, for lines without a role
  role?: TextRole; // what the line is: sets its size, case, italic, spacing and font
  px?: number; // size set by the user (720-wide page units), instead of the role's size
  color: "text" | "accent" | string; // palette main, palette accent, or a custom "#rrggbb"
  font?: string; // this line's own font (otherwise its role's font: the invite's heading/body/script font)
  bold?: boolean; // these four fall back to the role, then the page
  italic?: boolean;
  caps?: boolean;
  tracking?: number; // letter spacing, as a fraction of the font size
  align?: "left" | "center" | "right";
  spacing?: number; // line height for wrapped lines, 1.22 = normal (falls back to the page's)
  dx?: number; // moved by hand: offset from its automatic position (720x1280 units)
  dy?: number;
  scale?: number; // resized by hand: multiplies its text size (1 = normal)
};

export type Palette = {
  id: string;
  name: string;
  text: string; // main text colour
  accent: string; // accent colour
};

export type LayoutId = "centered" | "top" | "bottom";
// ghodi … butterflies: painted motions (lib/motions.ts). bloom, petals, chariot: older drawn ones, no longer offered.
export type AnimationId =
  | "ghodi"
  | "elephants"
  | "peacock"
  | "parrots"
  | "rosePetals"
  | "marigolds"
  | "diyaRow"
  | "lanterns"
  | "lotus"
  | "doors"
  | "skyLanterns"
  | "mehendi"
  | "sparkles"
  | "kalash"
  | "butterflies"
  | "clouds"
  // scenes (lib/motions.ts)
  | "shahiSwagat"
  | "royalCourt"
  | "baraatParasols"
  | "doliArrival"
  | "desertCaravan"
  | "toranWelcome"
  | "floralArch"
  | "gardenCorners"
  | "madhubani"
  | "rangoliDiyas"
  | "jasmineRain"
  | "chandelierNight"
  | "templeBells"
  | "peacockGarden"
  | "parrotArch"
  | "monsoonEgrets"
  | "shahiChhatri"
  | "haldiMorning"
  | "mehendiGarden"
  | "sangeetNight"
  | "receptionGlow"
  | "goldPaisley"
  | "moonClouds"
  | "flowerShower"
  | "elephantArch"
  | "royalCourtSilver"
  | "floralArchPastel"
  | "gardenCornersIvory"
  | "toranRoseGold"
  | "fadeUp" | "wipe" | "typewriter" | "blur" | "bloom" | "petals" | "chariot";
export type TransitionId =
  | "crossfade"
  | "slide"
  | "zoom"
  | "wipe"
  | "rise"
  | "circle"
  | "blinds"
  | "curtain"
  | "flip"
  | "diagonal"
  | "petalShower"
  | "mandala"
  | "diya"
  | "doors";

// Symbol at the top of a page: 5 Om, 5 Ganesh ji and 5 initials monogram designs.
export type SymbolStyle =
  | "mono-classic"
  | "mono-circle"
  | "mono-script"
  | "mono-crest"
  | "mono-wreath"
  | "om-classic"
  | "om-circle"
  | "om-lotus"
  | "om-rays"
  | "om-mandala"
  | "ganesh-line"
  | "ganesh-filled"
  | "ganesh-circle"
  | "ganesh-lotus"
  | "ganesh-arch";

export type PageKind = "intro" | "invite" | "event" | "outro" | "custom";
export type EventId = "mehendi" | "haldi" | "sangeet" | "shaadi" | "reception";

export type Page = {
  kind: PageKind; // what the page is for (names its tab)
  event?: EventId; // for event pages: which event
  background: string; // path under /public, e.g. "/generated/bg/x.jpg"
  colours: BgColours;
  bgZoom: number; // 1 = fill the page; bigger zooms in (pushes the design outwards), smaller shows all of it
  boxes: TextBox[]; // top to bottom
  symbol: "big" | "small" | "off"; // the Om / Ganesh ji symbol on this page
  symbolDx?: number; // symbol moved by hand (720x1280 units)
  symbolDy?: number;
  symbolScale?: number; // symbol resized by hand (1 = normal)
  symbolStyle: SymbolStyle; // the same on every page
  initials?: [string, string]; // for the monogram styles, e.g. ["R", "A"] (the same on every page)
  // Defaults for text lines that don't set their own (new lines copy the line you were on).
  font: string; // heading font (headings, names, and lines without a role)
  bodyFont?: string; // body font (date, details, messages, small print)
  scriptFont?: string; // script font
  textScale: number; // 1 = normal text size
  lineSpacing: number; // space between wrapped lines, 1.22 = normal
  bold: boolean;
  palette: Palette;
  layout: LayoutId;
  animation: AnimationId;
  duration: number; // seconds
  transition: TransitionId; // transition between pages (the same everywhere)
};

// Settings ticked "Apply to this page and the ones after": changing them on a page also
// changes every page after it (never the pages before).
export type SameEverywhere = {
  duration: boolean;
  background: boolean; // background + its colours + zoom + text position + palette
  animation: boolean;
};

export type Invite = {
  pages: Page[];
  same: SameEverywhere;
  music: { track: string | null; volume: number }; // track id from lib/music.ts, or null for none
};
