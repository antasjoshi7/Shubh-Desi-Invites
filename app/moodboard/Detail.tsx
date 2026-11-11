"use client";

// One photo, opened up: tap the exact spot to pin a note, say love / maybe / not this,
// stick a note on it, move it to another event, keep one of its colours.

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent } from "react";
import { mix, nameColor } from "@/lib/moodboard/palette";
import { PAPERS, QUICK_PINS, TYPES, paperOf, uid, type Board, type Card, type CardType, type Pin, type Reaction, type Tone } from "@/lib/moodboard/types";
import { Chips, Icon, cls, useBackClose, useImg } from "./parts";

type Draft = { id?: string; x: number; y: number; text: string; tone: Tone };

const TONES: { id: Tone; label: string }[] = [
  { id: "love", label: "Love" },
  { id: "change", label: "Change" },
  { id: "no", label: "Not this" },
];
const REACTS: { id: Reaction; label: string }[] = [
  { id: "love", label: "Love" },
  { id: "maybe", label: "Maybe" },
  { id: "no", label: "Not this" },
];

export default function Detail(p: {
  card: Card;
  list: Card[];
  board: Board;
  onClose: () => void;
  onNav: (id: string) => void;
  onChange: (fn: (c: Card) => void) => void;
  onDelete: () => void;
  onPinColor: (hex: string) => void;
  onRestore: () => void;
}) {
  const { card, list, board } = p;
  const full = useImg(card, "full");
  const thumb = useImg(card, "thumb");
  const [draft, setDraft] = useState<Draft | null>(null);
  const down = useRef<{ x: number; y: number; t: number } | null>(null);
  const photo = useRef<HTMLDivElement>(null);
  const idx = list.findIndex((c) => c.id === card.id);
  const ev = board.events.find((e) => e.id === card.eventId);
  useBackClose(true, p.onClose);

  const go = (step: number) => {
    const next = list[idx + step];
    if (next) { setDraft(null); p.onNav(next.id); }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key === "Escape") { if (draft) setDraft(null); else p.onClose(); }
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onUp = (e: RPointerEvent) => {
    const d = down.current;
    down.current = null;
    if (!d || !photo.current) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && performance.now() - d.t < 500) {
      if ((e.target as HTMLElement).closest(".mb-pin")) return;
      const r = photo.current.getBoundingClientRect();
      const x = Math.min(0.97, Math.max(0.03, (e.clientX - r.left) / r.width));
      const y = Math.min(0.97, Math.max(0.03, (e.clientY - r.top) / r.height));
      navigator.vibrate?.(8);
      setDraft({ x, y, text: "", tone: "love" });
    } else if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1);
  };

  const savePin = (d: Draft) => {
    const text = d.text.trim() || (d.tone === "love" ? "Love this" : d.tone === "change" ? "Change this" : "Not this");
    p.onChange((c) => {
      if (d.id) {
        const pin = c.pins.find((x) => x.id === d.id);
        if (pin) { pin.text = text; pin.tone = d.tone; }
      } else c.pins.push({ id: uid(), x: d.x, y: d.y, text, tone: d.tone });
    });
    setDraft(null);
  };
  const removePin = (id: string) => {
    p.onChange((c) => { c.pins = c.pins.filter((x) => x.id !== id); });
    setDraft(null);
  };
  const editPin = (pin: Pin) => setDraft({ id: pin.id, x: pin.x, y: pin.y, text: pin.text, tone: pin.tone });

  const react = (r: Reaction) => {
    navigator.vibrate?.(8);
    p.onChange((c) => { c.react = c.react === r ? undefined : r; });
  };

  const tint = mix("#fff3dc", card.dom, 0.24);
  return (
    <div className="mb-detail" style={{ "--dtint": tint } as CSSProperties} role="dialog" aria-modal="true" aria-label="Photo">
      <div className="mb-detail-top">
        <button className="mb-round" onClick={p.onClose} aria-label="Back to the board"><Icon.down /></button>
        <span className="mb-detail-where">{ev?.name} <i>·</i> {TYPES.find((t) => t.id === card.type)?.label}</span>
        <span className="mb-detail-count">{idx + 1} / {list.length}</span>
      </div>

      <div className="mb-detail-scroll">
        <div className="mb-stage">
          <button className="mb-nav prev" onClick={() => go(-1)} disabled={idx <= 0} aria-label="Previous photo"><Icon.left /></button>
          <div
            key={card.id}
            ref={photo}
            className="mb-photo"
            style={{ "--ar": card.w / card.h, aspectRatio: `${card.w} / ${card.h}`, background: card.dom } as CSSProperties}
            onPointerDown={(e) => { down.current = { x: e.clientX, y: e.clientY, t: performance.now() }; }}
            onPointerUp={onUp}
            onPointerCancel={() => { down.current = null; }}
          >
            <img src={full ?? thumb} alt="" draggable={false} style={{ viewTransitionName: "mb-hero" } as CSSProperties} />
            {card.pins.map((pin, i) => (
              <button
                key={pin.id}
                className={cls("mb-pin", pin.tone, draft?.id === pin.id && "active")}
                style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
                onClick={() => editPin(pin)}
                aria-label={`Note ${i + 1}: ${pin.text}`}
              >
                {i + 1}
              </button>
            ))}
            {draft && !draft.id && <span className={cls("mb-pin draft", draft.tone)} style={{ left: `${draft.x * 100}%`, top: `${draft.y * 100}%` }}>{card.pins.length + 1}</span>}
          </div>
          <button className="mb-nav next" onClick={() => go(1)} disabled={idx >= list.length - 1} aria-label="Next photo"><Icon.right /></button>
        </div>

        <div className={cls("mb-detail-body", draft && "composing")}>
          {card.pins.length === 0 && <p className="mb-hint">Tap the photo right where you love something</p>}

          <div className="mb-react" role="group" aria-label="What do you think?">
            {REACTS.map((r) => (
              <button key={r.id} className={cls(r.id, card.react === r.id && "on")} onClick={() => react(r.id)} aria-pressed={card.react === r.id}>
                {r.id === "love" && <Icon.heart on={card.react === "love"} size={18} />}
                {r.label}
              </button>
            ))}
          </div>

          <div className="mb-notefield" style={{ background: PAPERS[paperOf(card) % PAPERS.length] }}>
            <textarea
              id="mb-card-note"
              rows={1}
              maxLength={90}
              placeholder="Stick a note on it…"
              value={card.note ?? ""}
              onChange={(e) => { const v = e.target.value.replace(/\n/g, " "); p.onChange((c) => { c.note = v || undefined; }); }}
              aria-label="Sticky note"
            />
            <span className="mb-papers" role="group" aria-label="Note colour">
              {PAPERS.map((col, i) => (
                <button key={col} style={{ background: col }} className={paperOf(card) === i ? "on" : ""} onClick={() => p.onChange((c) => { c.paper = i; })} aria-label={`Note colour ${i + 1}`} aria-pressed={paperOf(card) === i} />
              ))}
            </span>
          </div>

          {card.pins.length > 0 && (
            <ol className="mb-pinlist">
              {card.pins.map((pin, i) => (
                <li key={pin.id}>
                  <button onClick={() => editPin(pin)}>
                    <b className={pin.tone}>{i + 1}</b>
                    <span>{pin.text}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}

          <h3>Which event is this for?</h3>
          <Chips label="Event" items={board.events.map((e) => ({ id: e.id, label: e.name }))} value={card.eventId} onPick={(id) => p.onChange((c) => { c.eventId = id; })} />
          <h3>What does it show?</h3>
          <Chips<CardType> label="Kind" items={TYPES.map((t) => ({ id: t.id, label: t.label }))} value={card.type} onPick={(id) => p.onChange((c) => { c.type = id; })} />

          <h3>Colours in this photo <small>tap one to keep it in {ev?.name}&rsquo;s colours</small></h3>
          <div className="mb-swatches">
            {card.colors.map((hex) => {
              const kept = !!ev?.pinned.includes(hex);
              return (
                <button key={hex} className={kept ? "on" : ""} onClick={() => p.onPinColor(hex)} aria-pressed={kept}>
                  <i style={{ background: hex }}>{kept && <Icon.check size={14} />}</i>
                  {nameColor(hex)}
                </button>
              );
            })}
          </div>

          <h3>Where is it from? <small>optional</small></h3>
          <div className="mb-linkrow">
            <input
              id="mb-card-link"
              type="url"
              inputMode="url"
              placeholder="Paste the reel or pin link"
              value={card.link ?? ""}
              onChange={(e) => { const v = e.target.value.trim(); p.onChange((c) => { c.link = v || undefined; }); }}
              aria-label="Link to where this came from"
            />
            {card.link && /^https?:\/\//.test(card.link) && <a href={card.link} target="_blank" rel="noreferrer noopener" aria-label="Open the link"><Icon.link /></a>}
          </div>

          <div className="mb-detail-foot">
            {card.trimmed && <button className="mb-text" onClick={p.onRestore}>Show the whole screenshot</button>}
            <button className="mb-text danger" onClick={p.onDelete}><Icon.trash /> Remove from the board</button>
            {card.credit && <p className="mb-fine">Sample photo by {card.credit} on Unsplash</p>}
          </div>
        </div>
      </div>

      {draft && (
        <div className="mb-composer">
          <button className="mb-composer-x" onClick={() => setDraft(null)} aria-label="Cancel this note"><Icon.close /></button>
          <div className="mb-quick">
            {QUICK_PINS[card.type].map((q) => (
              <button key={q.text} className={q.tone} onClick={() => savePin({ ...draft, text: q.text, tone: q.tone })}>{q.text}</button>
            ))}
          </div>
          <div className="mb-composer-row">
            <button
              className={cls("mb-tone", draft.tone)}
              onClick={() => setDraft({ ...draft, tone: TONES[(TONES.findIndex((t) => t.id === draft.tone) + 1) % TONES.length].id })}
              aria-label={`Kind of note: ${TONES.find((t) => t.id === draft.tone)!.label}. Tap to change`}
            >
              {TONES.find((t) => t.id === draft.tone)!.label}
            </button>
            <input
              id="mb-pin-text"
              value={draft.text}
              maxLength={80}
              placeholder="or write your own"
              onChange={(e) => setDraft({ ...draft, text: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") savePin(draft); }}
              aria-label="Note for this spot"
              enterKeyHint="done"
            />
            {draft.id && <button className="mb-round small" onClick={() => removePin(draft.id!)} aria-label="Delete this note"><Icon.trash /></button>}
            <button className="mb-btn small" onClick={() => savePin(draft)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
