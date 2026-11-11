"use client";

import { useEffect, useRef, useState } from "react";
import { renderPageAt } from "@/lib/render";
import type { Page } from "@/lib/types";

const THUMB_W = 44; // CSS pixels
const STEP = THUMB_W + 10; // thumb plus the gap between thumbs
const HOLD_MS = 350;

// A small still of one page.
function Thumb({ page, tick }: { page: Page; tick: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = Math.round(THUMB_W * dpr);
    c.height = Math.round(((THUMB_W * 16) / 9) * dpr);
    // draw after the big preview has had its turn
    const id = window.setTimeout(() => renderPageAt(c.getContext("2d")!, page, page.duration), 60);
    return () => window.clearTimeout(id);
  }, [page, tick]);
  return <canvas ref={ref} style={{ width: THUMB_W, height: (THUMB_W * 16) / 9 }} />;
}

// The row of pages under the preview. Tap a page to open it, tap the open page for its menu,
// press and hold a page then drag sideways to move it.
export function PageStrip({
  pages,
  titles,
  current,
  tick,
  canAdd,
  disabled,
  onGo,
  onMenu,
  onMove,
  onAdd,
}: {
  pages: Page[];
  titles: string[];
  current: number;
  tick: number;
  canAdd: boolean;
  disabled: boolean;
  onGo: (i: number) => void;
  onMenu: (i: number) => void;
  onMove: (from: number, to: number) => void;
  onAdd: () => void;
}) {
  const [lift, setLift] = useState<{ from: number; dx: number } | null>(null); // page being dragged
  const press = useRef<{ i: number; x: number; timer: number | null; lifted: boolean } | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  // keep the open page in view (scrolling only the strip itself)
  useEffect(() => {
    const row = rowRef.current;
    const el = row?.querySelectorAll<HTMLElement>(".strip-page")[current];
    if (!row || !el) return;
    const left = el.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft || left + el.offsetWidth > row.scrollLeft + row.clientWidth)
      row.scrollTo({ left: left - row.clientWidth / 2 + el.offsetWidth / 2, behavior: "smooth" });
  }, [current, pages.length]);

  const target = lift ? Math.max(0, Math.min(pages.length - 1, lift.from + Math.round(lift.dx / STEP))) : -1;

  // where each thumb shows while one is being dragged: the others make room
  const shift = (i: number) => {
    if (!lift) return 0;
    if (i === lift.from) return lift.dx;
    if (lift.from < target && i > lift.from && i <= target) return -STEP;
    if (lift.from > target && i < lift.from && i >= target) return STEP;
    return 0;
  };

  return (
    <div className="strip" ref={rowRef}>
      {pages.map((p, i) => (
        <button
          key={i}
          className={"strip-page" + (i === current ? " on" : "") + (lift?.from === i ? " lifted" : "")}
          style={{ transform: `translateX(${shift(i)}px)` }}
          disabled={disabled}
          onContextMenu={(e) => e.preventDefault()}
          onPointerDown={(e) => {
            const timer = window.setTimeout(() => {
              if (!press.current) return;
              press.current.lifted = true;
              navigator.vibrate?.(15);
              setLift({ from: i, dx: 0 });
            }, HOLD_MS);
            press.current = { i, x: e.clientX, timer, lifted: false };
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              // fine without capture
            }
          }}
          onPointerMove={(e) => {
            const p = press.current;
            if (!p) return;
            const dx = e.clientX - p.x;
            if (p.lifted) setLift({ from: p.i, dx });
            else if (Math.abs(dx) > 8 && p.timer !== null) {
              window.clearTimeout(p.timer); // scrolling the strip, not holding
              press.current = null;
            }
          }}
          onPointerUp={() => {
            const p = press.current;
            press.current = null;
            if (!p) return;
            if (p.timer !== null) window.clearTimeout(p.timer);
            if (p.lifted) {
              if (target !== p.i) onMove(p.i, target);
              setLift(null);
              return;
            }
            if (i === current) onMenu(i);
            else onGo(i);
          }}
          onPointerCancel={() => {
            if (press.current?.timer) window.clearTimeout(press.current.timer);
            press.current = null;
            setLift(null);
          }}
          aria-label={`${titles[i]}, page ${i + 1}${i === current ? " (open, tap for options)" : ""}`}
        >
          <Thumb page={p} tick={tick} />
          <span className="strip-name">{titles[i]}</span>
        </button>
      ))}
      {/* at the limit it stays, greyed, and says why instead of vanishing */}
      <button className="strip-add" onClick={onAdd} disabled={disabled || !canAdd} aria-label={canAdd ? "Add a page" : "Pages are full"}>
        <span>+</span>
        <span className="strip-name">{canAdd ? "Page" : "Full"}</span>
      </button>
    </div>
  );
}
