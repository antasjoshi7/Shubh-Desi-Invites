"use client";

// Send: the reason the board exists. For one event, a brief for the decorator, a brief for
// outfits, a "what to wear" card for guests, or a poster. Each shows exactly what will be sent
// before it goes. Below those: the whole board as a PDF, and a backup file.

import { useEffect, useState } from "react";
import { makeBackup } from "@/lib/moodboard/backup";
import { dressColors, eventPalette, imagesOf } from "@/lib/moodboard/layout";
import { nameColor } from "@/lib/moodboard/palette";
import { briefPages, canvasBlob, coverPoster, dressPoster, eventPoster } from "@/lib/moodboard/poster";
import { DRESS_IDEAS, type Board, type EventDef } from "@/lib/moodboard/types";
import { makePdf } from "@/lib/pdf";
import { track } from "@/lib/track";
import { Chips, Icon, Sheet } from "./parts";

export type SendTab = "decor" | "outfit" | "wear" | "poster";
type Page = { url: string; blob: Blob; w: number; h: number };

const TABS: { id: SendTab; label: string }[] = [
  { id: "decor", label: "Decorator brief" },
  { id: "wear", label: "What to wear" },
  { id: "outfit", label: "Outfit brief" },
  { id: "poster", label: "Poster" },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "board";

// Hands files to the phone's share sheet (WhatsApp, Save…); on a laptop, downloads them.
async function give(files: { blob: Blob; name: string }[], title: string): Promise<"shared" | "saved" | "cancelled"> {
  const list = files.map((f) => new File([f.blob], f.name, { type: f.blob.type }));
  if (navigator.canShare?.({ files: list })) {
    try {
      await navigator.share({ files: list, title });
      return "shared";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "cancelled";
    }
  }
  for (const f of files) {
    const url = URL.createObjectURL(f.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 20000);
  }
  return "saved";
}

async function pdfOf(pages: { blob: Blob; w: number; h: number }[], title: string): Promise<Blob> {
  const out = [];
  for (const p of pages) out.push({ bytes: new Uint8Array(await p.blob.arrayBuffer()), width: p.w, height: p.h });
  return makePdf(out, title);
}

const jpegOf = async (c: HTMLCanvasElement) => ({ blob: await canvasBlob(c, "image/jpeg", 0.9), w: c.width, h: c.height });

async function draw(board: Board, ev: EventDef, tab: SendTab): Promise<HTMLCanvasElement[]> {
  if (tab === "decor" || tab === "outfit") return briefPages(board, ev, tab);
  return [tab === "wear" ? await dressPoster(board, ev) : await eventPoster(board, ev)];
}

export default function ShareSheet({ open, board, view, tab: firstTab, onClose, toast, update }: {
  open: boolean;
  board: Board;
  view: string;
  tab: SendTab;
  onClose: () => void;
  toast: (text: string) => void;
  update: (fn: (b: Board) => void) => void;
}) {
  const events = board.events.filter((e) => imagesOf(board, e.id).length > 0);
  const [evId, setEvId] = useState("");
  const [tab, setTab] = useState<SendTab>(firstTab);
  const [pages, setPages] = useState<Page[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const ev = events.find((e) => e.id === evId) ?? events[0];

  useEffect(() => {
    if (!open) return;
    setEvId(events.some((e) => e.id === view) ? view : events[0]?.id ?? "");
    setTab(firstTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, view, firstTab]);

  // redraw what will be sent whenever the event, the kind or the board changes (a beat after typing stops)
  useEffect(() => {
    if (!open || !ev) return;
    let live = true;
    const made: string[] = [];
    const t = window.setTimeout(async () => {
      try {
        const canvases = await draw(board, ev, tab);
        const next: Page[] = [];
        for (const c of canvases) {
          const j = await jpegOf(c);
          const url = URL.createObjectURL(j.blob);
          made.push(url);
          next.push({ url, ...j });
        }
        if (live) setPages(next);
      } catch {
        if (live) { setPages([]); toast("Couldn't draw that. Try again."); }
      }
    }, 280);
    return () => { live = false; window.clearTimeout(t); window.setTimeout(() => made.forEach((u) => URL.revokeObjectURL(u)), 400); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ev?.id, tab, board]);
  useEffect(() => { setPages(null); }, [evId, tab]);

  const brief = tab === "decor" || tab === "outfit";

  const run = async (what: string, job: () => Promise<void>) => {
    if (busy) return;
    setBusy(what);
    try {
      await job();
    } catch {
      toast("That didn't work. Try again.");
    }
    setBusy(null);
  };

  const send = (asPictures: boolean) => run(asPictures ? "pics" : "send", async () => {
    if (!ev || !pages?.length) return;
    const base = `${slug(ev.name)}-${tab === "decor" ? "decor-brief" : tab === "outfit" ? "outfit-brief" : tab === "wear" ? "what-to-wear" : "poster"}`;
    const title = `${ev.name}: ${TABS.find((t) => t.id === tab)!.label.toLowerCase()}`;
    let how;
    if ((tab === "decor" || tab === "outfit") && !asPictures) how = await give([{ blob: await pdfOf(pages, title), name: `${base}.pdf` }], title);
    else how = await give(pages.map((p, i) => ({ blob: p.blob, name: pages.length > 1 ? `${base}-${i + 1}.jpg` : `${base}.jpg` })), title);
    track("moodboard_send", { what: tab, how, pages: pages.length, pictures: asPictures });
    if (how === "saved") toast("Saved to your downloads");
  });

  const shareBoard = () => run("board", async () => {
    const all = [await jpegOf(await coverPoster(board))];
    for (const e of events) all.push(await jpegOf(await eventPoster(board, e)));
    const how = await give([{ blob: await pdfOf(all, board.title), name: `${slug(board.title)}.pdf` }], board.title);
    track("moodboard_send", { what: "board", how, pages: all.length });
    if (how === "saved") toast("Board saved as a PDF");
  });

  const backup = () => run("backup", async () => {
    const how = await give([{ blob: await makeBackup(board), name: `${slug(board.title)}-backup.zip` }], "Mood board backup");
    track("moodboard_send", { what: "backup", how });
    if (how === "saved") toast("Backup saved. Keep the file somewhere safe.");
  });

  const setDress = (fn: (d: { line: string; colors: string[] }) => void) => {
    if (!ev) return;
    update((b) => {
      const e = b.events.find((x) => x.id === ev.id);
      if (!e) return;
      e.dress = e.dress ?? { line: "", colors: [] };
      fn(e.dress);
    });
  };

  const empty = brief && pages !== null && pages.length === 0;
  const palette = ev ? [...new Set([...eventPalette(board, ev), ...(ev.dress?.colors ?? [])])] : [];
  const wearing = ev ? dressColors(board, ev) : [];
  const sendLabel = tab === "decor" ? "Send to the decorator" : tab === "outfit" ? "Send the outfit brief" : tab === "wear" ? "Send to the guests" : `Share the ${ev?.name ?? ""} poster`;

  return (
    <Sheet open={open} onClose={onClose} title="Send" tall>
      {!ev ? (
        <p className="mb-empty-line">Add a few photos first. Then you can send a brief to your decorator or a dress code to your guests.</p>
      ) : (
        <div className="mb-share">
          {events.length > 1 && <Chips label="Event" items={events.map((e) => ({ id: e.id, label: e.name }))} value={ev.id} onPick={setEvId} />}
          <div className="mb-tabs" role="tablist" aria-label="What to send">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>

          {tab === "wear" && (
            <div className="mb-form">
              <label htmlFor="mb-dress-line">The dress code, in a line</label>
              <input id="mb-dress-line" value={ev.dress?.line ?? ""} maxLength={60} placeholder="Shades of yellow. No white, please." onChange={(e) => setDress((d) => { d.line = e.target.value; })} />
              <Chips label="Ideas" items={DRESS_IDEAS.map((s) => ({ id: s, label: s }))} value={ev.dress?.line} onPick={(s) => setDress((d) => { d.line = s; })} />
              <h3>Colours to wear <small>from this event&rsquo;s photos; pick up to four</small></h3>
              <div className="mb-swatches">
                {palette.map((hex) => {
                  const on = wearing.includes(hex);
                  return (
                    <button
                      key={hex}
                      className={on ? "on" : ""}
                      aria-pressed={on}
                      onClick={() => setDress((d) => {
                        const cur = d.colors.length ? d.colors : wearing;
                        d.colors = on ? cur.filter((c) => c !== hex) : [...cur, hex].slice(-4);
                      })}
                    >
                      <i style={{ background: hex }}>{on && <Icon.check size={14} />}</i>
                      {nameColor(hex)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {empty ? (
            <div className="mb-howto">
              <p className="mb-blank-big">Nothing to brief yet.</p>
              <p>In {ev.name}, tap the heart on the {tab === "decor" ? "decor and flower" : "outfit"} photos you want, and tap a photo to pin a note on the exact spot. They&rsquo;ll line up here, numbered, ready to send.</p>
            </div>
          ) : (
            <div className={`mb-pages${(pages?.length ?? 1) > 1 ? " many" : ""}`}>
              {pages ? pages.map((p, i) => <img key={p.url} src={p.url} alt={`Page ${i + 1} of what will be sent`} />) : <span className="mb-poster-wait" />}
            </div>
          )}
          {pages && pages.length > 1 && <p className="mb-fine center">{pages.length} pages. Swipe to see them all.</p>}

          <button className="mb-btn wide" onClick={() => send(false)} disabled={!pages?.length || !!busy}>{busy === "send" ? "Opening…" : sendLabel}</button>
          {brief && !empty && <button className="mb-text center" onClick={() => send(true)} disabled={!pages?.length || !!busy}>{busy === "pics" ? "Opening…" : "Send as pictures instead of a PDF"}</button>}

          <div className="mb-share-list">
            <button onClick={shareBoard} disabled={!!busy}>
              <b>{busy === "board" ? "Making the PDF…" : "The whole board"}</b>
              <small>A PDF with a cover and one page per event, for the family</small>
            </button>
            <button onClick={backup} disabled={!!busy}>
              <b>{busy === "backup" ? "Packing…" : "A backup file"}</b>
              <small>Keeps the board safe and opens it on another phone</small>
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
