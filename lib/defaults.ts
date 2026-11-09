// Starting content for new invites and new pages.
// The flow follows a typical invite video: intro → invitation → one page per event → thank you.

import { ANIMATIONS, BACKGROUNDS, EVENT_LOOK, MAX_PAGES, lookFor, type Background } from "./catalog";
import { DEFAULT_LINE_SPACING } from "./render";
import { DEFAULT_BODY_FONT, DEFAULT_SCRIPT_FONT } from "./textStyles";
import type { EventId, Invite, Page, PageKind, TextBox, TextRole } from "./types";

let counter = 0;
export function newId(): string {
  return "b" + Date.now().toString(36) + (counter++).toString(36);
}

// A line styled by its role (heading, names, date…); `extra` for touches like italic parents' names.
function box(label: string, text: string, role: TextRole, color: TextBox["color"] = "text", extra: Partial<TextBox> = {}): TextBox {
  return { id: newId(), label, text, size: "m", role, color, ...extra };
}

export const PAGE_KINDS: { id: PageKind; name: string }[] = [
  { id: "event", name: "Event" },
  { id: "intro", name: "Intro" },
  { id: "invite", name: "Invitation" },
  { id: "outro", name: "Thank you" },
  { id: "custom", name: "Custom" },
];

type EventInfo = { name: string; date: string; time: string; venue: string; dress: string };

// Template text for each event page.
export const EVENTS: { id: EventId; info: EventInfo }[] = [
  {
    id: "haldi",
    info: { name: "Haldi", date: "On 11th December 2026", time: "10:30 AM onwards", venue: "at Poolside Lawns, The Leela Palace, Udaipur", dress: "Dress code: Shades of yellow" },
  },
  {
    id: "mehendi",
    info: { name: "Mehendi", date: "On 11th December 2026", time: "4:00 PM onwards", venue: "at Garden Courtyard, The Leela Palace, Udaipur", dress: "Dress code: Shades of green" },
  },
  {
    id: "sangeet",
    info: { name: "Sangeet", date: "On 11th December 2026", time: "8:00 PM onwards", venue: "at Durbar Hall, The Leela Palace, Udaipur", dress: "Dress code: Glitter & glam" },
  },
  {
    id: "shaadi",
    info: { name: "Shaadi", date: "On 12th December 2026", time: "7:00 PM onwards", venue: "at Lakeside Mandap, The Leela Palace, Udaipur", dress: "Dress code: Traditional" },
  },
  {
    id: "reception",
    info: { name: "Reception", date: "On 13th December 2026", time: "8:00 PM onwards", venue: "at Grand Ballroom, The Leela Palace, Udaipur", dress: "Dress code: Indo-western" },
  },
];

// Template text, styled the way hand-made cards are: spaced capitals for the event, capital names,
// italic parents in small print, a bold italic date, italic details, a message, and the RSVP.
function boxesFor(kind: PageKind, event?: EventId): TextBox[] {
  switch (kind) {
    case "intro":
      return [box("Tagline", "The beginning of their forever!", "date", "accent")];
    case "invite":
      return [
        box("Blessing", "With the blessings of the elders,\nwe cordially invite you to the wedding of", "body"),
        box("Groom", "Rohan Sharma", "names", "accent"),
        box("Groom's parents", "(S/o Mr. Anil & Mrs. Sunita Sharma)", "small", "text", { italic: true }),
        box("And", "&", "names", "accent", { px: 42 }),
        box("Bride", "Aishwarya Iyer", "names", "accent"),
        box("Bride's parents", "(D/o Mr. Ravi & Mrs. Lakshmi Iyer)", "small", "text", { italic: true }),
        box("Message", "We would be honoured by your presence\nand blessings as they begin\ntheir journey together.", "body"),
      ];
    case "event": {
      const e = (EVENTS.find((x) => x.id === event) ?? EVENTS[1]).info;
      return [
        box("Event", e.name, "title", "accent"),
        box("Date", e.date, "date"),
        box("Time", e.time, "details"),
        box("Venue", e.venue, "details"),
        box("Dress code", e.dress, "body"),
        box("RSVP", "RSVP: Sharma family, +91 98765 43210", "small"),
      ];
    }
    case "outro":
      return [box("Message", "Looking forward to celebrating with you!", "date", "accent")];
    case "custom":
      return [box("Text", "Your text here", "body")];
  }
}

// Big symbol on the intro and thank-you pages, small at the top of the rest.
const symbolFor = (kind: PageKind): Page["symbol"] => (kind === "intro" || kind === "outro" ? "big" : "small");

// The name on each page's tab: Intro, Invitation, Mehendi…, Thank you, Custom 1, Custom 2…
export function pageTitles(pages: Page[]): string[] {
  let custom = 0;
  return pages.map((p) => {
    if (p.kind === "event") return EVENTS.find((e) => e.id === p.event)?.info.name ?? "Event";
    if (p.kind === "custom") return `Custom ${++custom}`;
    return PAGE_KINDS.find((k) => k.id === p.kind)!.name;
  });
}

// A page on this background with its original colours, recommended text position and palette.
function basePage(bg: Background, kind: PageKind): Page {
  return {
    kind,
    background: bg.src,
    ...lookFor(bg),
    bgZoom: 1,
    boxes: boxesFor(kind),
    symbol: symbolFor(kind),
    symbolStyle: "ganesh-line",
    font: "Playfair Display",
    bodyFont: DEFAULT_BODY_FONT,
    scriptFont: DEFAULT_SCRIPT_FONT,
    textScale: 1,
    lineSpacing: DEFAULT_LINE_SPACING,
    bold: false,
    animation: "fadeUp",
    duration: 4,
    transition: "flythrough",
    cinematic: true,
  };
}

// A new page of the given kind: the settings of `like` (the page you're on),
// with the template text for that kind of page (and event).
export function makePage(kind: PageKind, like: Page, event?: EventId): Page {
  return {
    ...like,
    kind,
    event: kind === "event" ? event : undefined,
    boxes: boxesFor(kind, event),
    symbol: symbolFor(kind),
    // fresh template text lays itself out again
    pinned: false,
    symbolX: undefined,
    symbolY: undefined,
    symbolSize: undefined,
    symbolDx: 0,
    symbolDy: 0,
    symbolScale: 1,
    textScale: 1,
  };
}

// A new invite starts with a single Intro page.
export function defaultInvite(): Invite {
  const first: Page = { ...basePage(BACKGROUNDS[0], "intro"), animation: "rosePetals" };
  return {
    pages: [first],
    same: { duration: true, background: false, animation: false },
    music: { track: "shehnai-welcome", volume: 0.8 },
  };
}

// A copy of a page, with its own line ids.
export function duplicatePage(p: Page): Page {
  return { ...p, boxes: p.boxes.map((b) => ({ ...b, id: newId() })) };
}

// Opening the editor from a landing page link (/create?event=haldi, ?design=<id>, ?motion=ghodi, or a mix):
// adds that event's page (in a design made for it) or puts that design on the first page, gives that page the
// motion, and says which page to show. Work already saved on this device is kept; Undo takes the change back.
export function startFrom(
  invite: Invite,
  fresh: boolean,
  event?: string | null,
  design?: string | null,
  motion?: string | null,
): { invite: Invite; page: number } | null {
  const picked = design ? BACKGROUNDS.find((b) => b.id === design) : undefined;
  const ev = event && event in EVENT_LOOK ? (event as EventId) : undefined;
  const anim = ANIMATIONS.find((a) => a.id === motion)?.id;
  const withMotion = (r: { invite: Invite; page: number }) =>
    anim ? { ...r, invite: { ...r.invite, pages: r.invite.pages.map((p, i) => (i === r.page ? { ...p, animation: anim } : p)) } } : r;
  if (ev) {
    const bg = picked ?? BACKGROUNDS.find((b) => b.category === EVENT_LOOK[ev].category) ?? BACKGROUNDS[0];
    const pages = fresh ? invite.pages.map((p) => ({ ...p, background: bg.src, ...lookFor(bg) })) : [...invite.pages];
    const at = pages.findIndex((p) => p.kind === "event" && p.event === ev);
    if (at >= 0) return withMotion({ invite: { ...invite, pages }, page: at });
    if (pages.length >= MAX_PAGES) return null;
    pages.push({ ...makePage("event", pages[pages.length - 1], ev), background: bg.src, ...lookFor(bg) });
    return withMotion({ invite: { ...invite, pages }, page: pages.length - 1 });
  }
  if (picked) {
    const pages = invite.pages.map((p, i) => (i === 0 ? { ...p, background: picked.src, ...lookFor(picked) } : p));
    return withMotion({ invite: { ...invite, pages }, page: 0 });
  }
  if (anim) return withMotion({ invite, page: 0 });
  return null;
}
