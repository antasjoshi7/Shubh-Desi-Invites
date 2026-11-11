"use client";

// Small building blocks the mood board is made of: icons, the bottom sheet, photo tiles,
// sticky notes, colour dots and the collage.

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { collage } from "@/lib/moodboard/layout";
import { cachedUrl, urlFor, type Size } from "@/lib/moodboard/store";
import { PAPERS, paperOf, type Card } from "@/lib/moodboard/types";

export const cls = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");

// ---------- icons (drawn, so they take the text colour) ----------

const I = ({ d, fill, size = 22 }: { d: string; fill?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth={fill ? 0 : 1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const HEART = "M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z";
export const Icon = {
  heart: (p: { on?: boolean; size?: number }) => <I d={HEART} fill={p.on} size={p.size} />,
  plus: (p: { size?: number }) => <I d="M12 5v14M5 12h14" size={p.size} />,
  share: () => <I d="M12 15V4m0 0L8 8m4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />,
  note: () => <I d="M5 4h14v10l-5 6H5zM14 20v-6h5" />,
  more: () => <I d="M5 12h.01M12 12h.01M19 12h.01" />,
  close: () => <I d="M6 6l12 12M18 6 6 18" />,
  down: () => <I d="m6 9 6 6 6-6" />,
  left: () => <I d="m15 6-6 6 6 6" />,
  right: () => <I d="m9 6 6 6-6 6" />,
  up: () => <I d="m6 15 6-6 6 6" size={18} />,
  dn: () => <I d="m6 9 6 6 6-6" size={18} />,
  check: (p: { size?: number }) => <I d="m5 12.5 4.5 4.5L19 7.5" size={p.size} />,
  trash: () => <I d="M5 7h14M10 7V4h4v3m-7 0 1 13h8l1-13" />,
  link: () => <I d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  pin: () => <I d="M12 21s6-5.4 6-10.5A6 6 0 0 0 6 10.5C6 15.6 12 21 12 21zm0-8.2a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6z" />,
  together: () => <I d="M4 6h9v9H4zM11 9h9v9h-9z" />,
  move: () => <I d="M4 12h14m0 0-5-5m5 5-5 5" />,
};

// ---------- hooks ----------

// The address of a card's picture, once it's ready.
export function useImg(card: Card | undefined, size: Size): string | undefined {
  const [url, setUrl] = useState<string | undefined>(() => (card ? cachedUrl(card, size) : undefined));
  const id = card?.id, src = card?.src, shape = card ? card.w / card.h : 0;
  useEffect(() => {
    if (!card) { setUrl(undefined); return; }
    const hit = cachedUrl(card, size);
    setUrl(hit);
    if (hit) return;
    let live = true;
    urlFor(card, size).then((u) => { if (live) setUrl(u); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, src, size, shape]);
  return url;
}

// Meant to make the phone's Back button close whatever is open on top. Switched off for now:
// the first version sent the browser back one page too far when a photo was closed (11 Nov 2026).
// TODO: bring it back, tested with Next's own history handling.
export function useBackClose(_open: boolean, _close: () => void) {}

// Press and hold (to start picking several cards).
export function useHold(onHold: () => void, ms = 420) {
  const timer = useRef(0);
  const fired = useRef(false);
  const at = useRef<[number, number]>([0, 0]);
  const stop = () => window.clearTimeout(timer.current);
  return {
    fired: () => fired.current,
    bind: {
      onPointerDown: (e: RPointerEvent) => {
        fired.current = false;
        at.current = [e.clientX, e.clientY];
        stop();
        timer.current = window.setTimeout(() => {
          fired.current = true;
          navigator.vibrate?.(12);
          onHold();
        }, ms);
      },
      onPointerMove: (e: RPointerEvent) => {
        if (Math.hypot(e.clientX - at.current[0], e.clientY - at.current[1]) > 10) stop();
      },
      onPointerUp: stop,
      onPointerCancel: stop,
      onPointerLeave: stop,
      onContextMenu: (e: { preventDefault: () => void }) => e.preventDefault(),
    },
  };
}

// ---------- bottom sheet ----------

export function Sheet({ open, onClose, title, children, tall, bare }: { open: boolean; onClose: () => void; title: string; children: ReactNode; tall?: boolean; bare?: boolean }) {
  const [render, setRender] = useState(open);
  const [shown, setShown] = useState(false);
  const [dy, setDy] = useState(0);
  const drag = useRef<{ y: number; t: number } | null>(null);
  const last = useRef<ReactNode>(children);
  if (open) last.current = children;
  useBackClose(open, onClose);

  useEffect(() => {
    if (open) {
      setRender(true);
      setDy(0);
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(r);
    }
    setShown(false);
    const t = window.setTimeout(() => setRender(false), 280);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!render) return null;
  const grab = {
    onPointerDown: (e: RPointerEvent) => {
      drag.current = { y: e.clientY, t: performance.now() };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: RPointerEvent) => {
      if (drag.current) setDy(Math.max(0, e.clientY - drag.current.y));
    },
    onPointerUp: (e: RPointerEvent) => {
      if (!drag.current) return;
      const moved = e.clientY - drag.current.y;
      const fast = moved / Math.max(1, performance.now() - drag.current.t) > 0.5;
      drag.current = null;
      if (moved > 110 || (fast && moved > 30)) onClose();
      else setDy(0);
    },
    onPointerCancel: () => { drag.current = null; setDy(0); },
  };
  return (
    <div className={cls("mb-sheet-wrap", shown && "in")}>
      <div className="mb-scrim" onClick={onClose} />
      <div
        className={cls("mb-sheet", tall && "tall", bare && "bare")}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={dy ? { transform: `translateY(${dy}px)`, transition: "none" } : undefined}
      >
        <div className="mb-sheet-head" {...grab}>
          <span className="mb-grab" />
          <h2>{title}</h2>
          <button className="mb-x" onClick={onClose} onPointerDown={(e) => e.stopPropagation()} aria-label="Close"><Icon.close /></button>
        </div>
        <div className="mb-sheet-body">{open ? children : last.current}</div>
      </div>
    </div>
  );
}

// ---------- colours ----------

export function Dots({ colors, size = 18, overlap = 0.28 }: { colors: string[]; size?: number; overlap?: number }) {
  return (
    <span className="mb-dots" aria-hidden="true">
      {colors.map((c, i) => (
        <span key={c + i} style={{ background: c, width: size, height: size, marginLeft: i ? -size * overlap : 0 }} />
      ))}
    </span>
  );
}

// ---------- tiles ----------

const tilt = (id: string) => ((id.charCodeAt(id.length - 1) + id.charCodeAt(0)) % 5) - 2; // -2..2 degrees, steady per card

export function Sticky({ text, paper = 0, id, small }: { text: string; paper?: number; id: string; small?: boolean }) {
  return (
    <span className={cls("mb-sticky", small && "small")} style={{ background: PAPERS[paper % PAPERS.length], rotate: `${tilt(id) * 0.9}deg` }}>
      {text}
    </span>
  );
}

export function CardTile(p: {
  card: Card;
  i: number;
  hero: boolean;
  selecting: boolean;
  selected: boolean;
  onOpen: () => void;
  onLove: () => void;
  onHold: () => void;
  onPick: () => void;
}) {
  const { card } = p;
  const url = useImg(card, "thumb");
  const [loaded, setLoaded] = useState(false);
  const hold = useHold(p.onHold);
  const love = card.react === "love";
  return (
    <div className={cls("mb-card", card.react === "no" && "is-no", p.selected && "is-sel", p.selecting && "is-picking")} style={{ "--i": Math.min(p.i, 12) } as CSSProperties}>
      <button
        className="mb-card-img"
        style={{ aspectRatio: `${card.w} / ${card.h}`, background: card.dom }}
        onClick={() => { if (hold.fired()) return; if (p.selecting) p.onPick(); else p.onOpen(); }}
        {...hold.bind}
        aria-label={card.note ? `Photo: ${card.note}` : "Photo"}
      >
        {url && (
          <img
            src={url}
            alt=""
            draggable={false}
            className={loaded ? "in" : ""}
            onLoad={() => setLoaded(true)}
            ref={(el) => { if (el?.complete && !loaded) setLoaded(true); }}
            style={p.hero ? ({ viewTransitionName: "mb-hero" } as CSSProperties) : undefined}
          />
        )}
        {card.pins.length > 0 && <span className="mb-pinct"><Icon.pin />{card.pins.length}</span>}
        {card.react === "maybe" && <span className="mb-flag">Maybe</span>}
        {card.react === "no" && <span className="mb-flag no">Not this</span>}
      </button>
      {p.selecting ? (
        <span className="mb-tick" aria-hidden="true">{p.selected && <Icon.check size={16} />}</span>
      ) : (
        <button className={cls("mb-heart", love && "on")} onClick={p.onLove} aria-label={love ? "Loved. Tap to undo" : "Love this"} aria-pressed={love}>
          <Icon.heart on={love} size={19} />
        </button>
      )}
      {card.note && <Sticky text={card.note} paper={paperOf(card)} id={card.id} />}
    </div>
  );
}

export function NoteTile({ card, i, onOpen, selecting, selected, onHold, onPick }: { card: Card; i: number; onOpen: () => void; selecting: boolean; selected: boolean; onHold: () => void; onPick: () => void }) {
  const hold = useHold(onHold);
  return (
    <div className={cls("mb-card", selected && "is-sel")} style={{ "--i": Math.min(i, 12) } as CSSProperties}>
      <button
        className="mb-notecard"
        style={{ background: PAPERS[paperOf(card) % PAPERS.length], rotate: `${tilt(card.id) * 0.6}deg` }}
        onClick={() => { if (hold.fired()) return; if (selecting) onPick(); else onOpen(); }}
        {...hold.bind}
      >
        {card.note}
      </button>
      {selecting && <span className="mb-tick" aria-hidden="true">{selected && <Icon.check size={16} />}</span>}
    </div>
  );
}

function CollageImg({ card, style }: { card: Card; style: CSSProperties }) {
  const url = useImg(card, "thumb");
  return (
    <span className="mb-collage-cell" style={{ ...style, background: card.dom }}>
      {url && <img src={url} alt="" draggable={false} loading="lazy" />}
    </span>
  );
}

// The tight collage of an event's best photos. `ratio` is height / width.
export function Collage({ cards, ratio = 1.25, gap = 1.4 }: { cards: Card[]; ratio?: number; gap?: number }) {
  const rects = useMemo(() => collage(cards, 100, 100 * ratio, gap), [cards, ratio, gap]);
  const H = 100 * ratio;
  return (
    <span className="mb-collage" style={{ aspectRatio: `1 / ${ratio}` }}>
      {rects.map((r) => {
        const card = cards.find((c) => c.id === r.id)!;
        return <CollageImg key={r.id} card={card} style={{ left: `${r.x}%`, top: `${(r.y / H) * 100}%`, width: `${r.w}%`, height: `${(r.h / H) * 100}%` }} />;
      })}
    </span>
  );
}

export function Chips<T extends string>({ items, value, onPick, label }: { items: { id: T; label: string; dot?: string }[]; value: T | null | undefined; onPick: (id: T) => void; label: string }) {
  return (
    <div className="mb-chips" role="group" aria-label={label}>
      {items.map((it) => (
        <button key={it.id} className={cls("mb-chip", value === it.id && "on")} onClick={() => onPick(it.id)} aria-pressed={value === it.id}>
          {it.dot && <i style={{ background: it.dot }} />}
          {it.label}
        </button>
      ))}
    </div>
  );
}
