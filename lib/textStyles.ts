// Text styles: what each line of an invite *is* (a heading, the names, the date…) decides how it looks,
// like the hand-made cards this follows — spaced capitals for the event, capital names, a bold italic
// date, italic details, small print for parents and RSVP.

import type { Page, TextBox, TextRole, TextSize } from "./types";

// Font size (in 720x1280 units) for the older size names, used by lines without a role.
export const TEXT_SIZES: Record<TextSize, number> = { xl: 150, l: 84, m: 46, s: 30, xs: 24 };

type RoleStyle = {
  name: string;
  size: number; // font size on the 720-wide page
  font: "heading" | "body" | "script"; // which of the invite's fonts it uses
  caps: boolean;
  italic: boolean;
  bold: boolean;
  tracking: number; // letter spacing, as a fraction of the font size
  gap: number; // space above it, when it follows another line
};

export const ROLES: Record<TextRole, RoleStyle> = {
  title: { name: "Heading", size: 62, font: "heading", caps: true, italic: false, bold: false, tracking: 0.08, gap: 0 },
  names: { name: "Names", size: 56, font: "heading", caps: true, italic: false, bold: false, tracking: 0.05, gap: 16 },
  script: { name: "Script", size: 96, font: "script", caps: false, italic: false, bold: false, tracking: 0, gap: 12 },
  date: { name: "Date", size: 50, font: "body", caps: false, italic: true, bold: true, tracking: 0, gap: 30 },
  details: { name: "Details", size: 35, font: "body", caps: false, italic: true, bold: false, tracking: 0, gap: 8 },
  body: { name: "Message", size: 35, font: "body", caps: false, italic: false, bold: false, tracking: 0, gap: 28 },
  small: { name: "Small print", size: 27, font: "body", caps: false, italic: false, bold: false, tracking: 0.01, gap: 6 },
};

export const ROLE_ORDER: TextRole[] = ["title", "names", "script", "date", "details", "body", "small"];

export const DEFAULT_BODY_FONT = "Cormorant Garamond";
export const DEFAULT_SCRIPT_FONT = "Pinyon Script";

// The size a line's look starts from (before the user resizes it).
export function baseSize(box: TextBox): number {
  return box.role ? ROLES[box.role].size : TEXT_SIZES[box.size];
}

// The line's size as the user set it (before the page shrinks text to fit or scales the whole block).
export function designSize(box: TextBox): number {
  return box.px ?? baseSize(box) * (box.scale ?? 1);
}

// Everything that decides how a line looks: its own choices first, then its role, then the page.
export function lineLook(box: TextBox, page: Page) {
  const role = box.role ? ROLES[box.role] : null;
  const slotFont = role?.font === "body" ? page.bodyFont ?? DEFAULT_BODY_FONT : role?.font === "script" ? page.scriptFont ?? DEFAULT_SCRIPT_FONT : page.font;
  return {
    font: box.font || slotFont,
    bold: box.bold ?? role?.bold ?? page.bold,
    italic: box.italic ?? role?.italic ?? false,
    caps: box.caps ?? role?.caps ?? false,
    tracking: box.tracking ?? role?.tracking ?? 0,
    align: box.align ?? "center",
    spacing: box.spacing ?? page.lineSpacing,
    gap: role?.gap,
  };
}

// Which of the invite's fonts a line uses ("Use for all headings" changes that one).
export function fontSlot(box: TextBox): "heading" | "body" | "script" {
  return box.role ? ROLES[box.role].font : "heading";
}

// A gentle guess at what a line is, from its words (offered as a one-tap suggestion, never forced).
export function guessRole(text: string): TextRole | null {
  const t = text.trim();
  if (!t) return null;
  if (/^&$|^and$/i.test(t)) return "names";
  if (/^\(.*\)$/.test(t) || /\b(rsvp|s\/o|d\/o)\b/i.test(t) || /(\+91|\d{5}\s?\d{5}|\d{10})/.test(t)) return "small";
  if (/\b\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i.test(t) || /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(st|nd|rd|th)?\b/i.test(t))
    return "date";
  if (/\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i.test(t) || /\b(onwards|venue|at the|hall|lawns?|gardens?|palace|hotel|road)\b/i.test(t)) return "details";
  const words = t.split(/\s+/);
  if (words.length <= 4 && t === t.toUpperCase() && /[A-Z]/.test(t)) return "names";
  return null;
}

// Splits a line into plain text and raised ordinals ("23rd" → "23" + raised "rd").
export type Run = { text: string; sup?: boolean };
export function runsOf(text: string): Run[] {
  const runs: Run[] = [];
  const re = /(\d)(st|nd|rd|th)\b/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const cut = m.index + 1; // keep the digit with the text before
    runs.push({ text: text.slice(last, cut) });
    runs.push({ text: m[2], sup: true });
    last = cut + m[2].length;
  }
  runs.push({ text: text.slice(last) });
  return runs.filter((r) => r.text);
}
