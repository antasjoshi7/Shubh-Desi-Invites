// Tappable links for the PDF card: a phone number calls, a venue or address opens the map.
// This is what a printed card can't do, and what people rarely set up by hand in other tools.

import type { PdfLink } from "./pdf";
import { textLines } from "./render";
import type { Page } from "./types";

// Indian mobile and landline numbers, with or without +91 and spaces
const PHONE = /(?:\+?91[\s-]?)?(?:[6-9]\d{4}[\s-]?\d{5}|0\d{2,4}[\s-]?\d{6,8})/g;
// words that mark a line as a place
const PLACE = /\b(road|rd\.?|marg|bagh|palace|hotel|resort|lawns?|garden|banquet|farm|mandap|venue|sector|nagar|colony|vihar|enclave|club|haveli|fort|temple|mandir|gurudwara|hall|house|tower|apartments?|flat|floor|street|lane|chowk|cantt|kunj|exotica)\b/i;
const PAD = 8;

export function pdfLinks(page: Page): PdfLink[] {
  const lines = textLines(page);
  const links: PdfLink[] = [];
  const byBox = new Map<string, typeof lines>();
  for (const l of lines) byBox.set(l.boxId, [...(byBox.get(l.boxId) ?? []), l]);

  for (const [boxId, ls] of byBox) {
    const box = page.boxes.find((b) => b.id === boxId);
    if (!box) continue;
    // phone numbers: each line with one becomes a call link
    let phones = false;
    for (const l of ls) {
      const m = l.text.match(PHONE);
      if (!m) continue;
      phones = true;
      const digits = m[0].replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
      const tel = digits.length === 10 && !digits.startsWith("0") ? "+91" + digits : digits;
      links.push({ x: l.x - PAD, y: l.y, w: l.w + PAD * 2, h: l.h, url: "tel:" + tel });
    }
    if (phones) continue;
    // a place: the whole text block opens Google Maps searched for that address
    // (a schedule that mentions a place, like "Baraat 3:30 PM at the gate", is not an address)
    // (the template's venue line, or "at <Name>", counts too: "at Taj Lands End" has no place word)
    const place = PLACE.test(box.text) || (box.label === "Venue" && box.text.includes(",")) || /^at\s+\p{Lu}/u.test(box.text.trim());
    if (place && !/\b\d{1,2}(:\d{2})?\s?(am|pm)\b/i.test(box.text)) {
      const x0 = Math.min(...ls.map((l) => l.x));
      const x1 = Math.max(...ls.map((l) => l.x + l.w));
      const y0 = Math.min(...ls.map((l) => l.y));
      const y1 = Math.max(...ls.map((l) => l.y + l.h));
      const query = box.text
        .replace(/^(at|venue:?)\s+/i, "")
        .replace(/\s*\n\s*/g, ", ")
        .replace(/^(family home|delhi home|residence)\s*,\s*/i, "");
      links.push({ x: x0 - PAD, y: y0, w: x1 - x0 + PAD * 2, h: y1 - y0, url: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(query) });
    }
  }
  return links;
}
