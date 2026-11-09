"use client";

import { useEffect, useRef, useState } from "react";
import { H, W, type Area, type BoxRect } from "@/lib/render";

// Something on the page that can be selected, moved and resized: a text line or the symbol.
export type OverlayItem = { id: string; kind: "text" | "symbol"; dx: number; dy: number; scale: number };

const SNAP_PX = 8; // how close (screen pixels) before a line snaps to a guide
const SIZE_SNAP = 0.05; // within 5% of another line's size, snap to match it
const HOLD_MS = 450; // press and hold this long to pick several

type Guide = { at: number; page: boolean }; // a guide line; page = page centre / clear area edge (vs another line)
type Gap = { x: number; y1: number; y2: number }; // an equal vertical gap between two items, shown while dragging
// kind: "fresh" = this press picked the whole block, "group" = the block was already picked, "item" = one line or several
type Drag = { id: string; x: number; y: number; starts: Map<string, { dx: number; dy: number }>; rect: BoxRect; moved: boolean; was: boolean; kind: "fresh" | "group" | "item" };
type Resize = { id: string; ax: number; ay: number; dist: number; start: number; base: number };
type Pinch = { id: string; dist: number; start: number; base: number; group: boolean }; // two fingers on the page
type GroupResize = { ax: number; ay: number; dist: number; start: number };
const GROUP_ID = "__group";
const clampGroup = (s: number) => Math.max(0.4, Math.min(2.5, Math.round(s * 100) / 100));
type Pt = { x: number; y: number };
const spread = (pts: Pt[]) => Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);

// Keep receiving moves while dragging, even outside the box (ignore if the browser refuses).
function capture(e: React.PointerEvent<HTMLElement>) {
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    // no active pointer (e.g. synthetic events): dragging still works inside the box
  }
}

// Sits on top of the big preview, like Canva. A tap picks that one line (or the symbol): drag to
// move it, pinch or pull the corner dot to resize it, tap it again to type. Press and hold to pick
// several; "Select all" picks everything. Moving snaps to guides and even spacing.
export function TextOverlay({
  rects,
  items,
  area,
  selected,
  multi,
  group,
  groupScale,
  onSelect,
  onHold,
  onMove,
  onScale,
  onGroupScale,
  onEdit,
  onDragging,
}: {
  rects: BoxRect[];
  items: OverlayItem[];
  area: Area; // the design's clear area (shown while dragging)
  selected: string[];
  multi: boolean; // picking several: taps add or remove
  group: boolean; // the whole block is picked
  groupScale: number; // the block's size (1 = normal)
  onSelect: (ids: string[]) => void;
  onGroupScale: (scale: number) => void;
  onHold: (id: string) => void; // press and hold: start picking several
  onMove: (moves: { id: string; dx: number; dy: number }[]) => void;
  onScale: (id: string, scale: number) => void;
  onEdit: (id: string) => void; // tap a selected line again
  onDragging?: (on: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4); // screen pixels per page unit
  const [guides, setGuides] = useState<{ x: Guide[]; y: Guide[]; gaps: Gap[] }>({ x: [], y: [], gaps: [] });
  const [dragging, setDragging] = useState(false);
  const [sizeMatch, setSizeMatch] = useState<string | null>(null); // line whose size we snapped to
  const drag = useRef<Drag | null>(null);
  const resize = useRef<Resize | null>(null);
  const hold = useRef<number | null>(null);
  const pinch = useRef<Pinch | null>(null);
  const groupResize = useRef<GroupResize | null>(null);
  const fingers = useRef(new Map<number, Pt>()); // every finger on the screen

  // Moves and resizes are sent at most once per frame, so dragging stays smooth.
  // (A timer backs up the frame callback, which browsers pause in background tabs.)
  const pending = useRef<(() => void) | null>(null);
  const scheduled = useRef(false);
  const later = (fn: () => void) => {
    pending.current = fn;
    if (scheduled.current) return;
    scheduled.current = true;
    const flush = () => {
      if (!scheduled.current) return;
      scheduled.current = false;
      const f = pending.current;
      pending.current = null;
      f?.();
    };
    requestAnimationFrame(flush);
    window.setTimeout(flush, 34);
  };
  useEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cancelHold = () => {
    if (hold.current !== null) window.clearTimeout(hold.current);
    hold.current = null;
  };

  // End any drag or resize wherever the finger lifts (it may not be over the box or handle any more).
  useEffect(() => {
    const end = (e: PointerEvent) => {
      fingers.current.delete(e.pointerId);
      if (pinch.current && fingers.current.size >= 2) return; // still pinching
      cancelHold();
      drag.current = null;
      resize.current = null;
      groupResize.current = null;
      pinch.current = null;
      setGuides({ x: [], y: [], gaps: [] });
      setSizeMatch(null);
      setDragging(false);
    };
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, []);

  // Pinch: a second finger anywhere on the page while one is on a line (or the symbol) resizes it.
  // Listening before anything else sees the touch, so the second finger doesn't deselect.
  const latest = useRef({ rects, items, onScale, scale, group, groupScale, onGroupScale });
  latest.current = { rects, items, onScale, scale, group, groupScale, onGroupScale };
  useEffect(() => {
    const el = ref.current!.parentElement!; // the stage
    const down = (e: PointerEvent) => {
      fingers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const d = drag.current;
      if (fingers.current.size !== 2 || !d) return;
      const { rects, items, group, groupScale } = latest.current;
      const r = rects.find((x) => x.id === d.id);
      const it = items.find((x) => x.id === d.id);
      const whole = group || d.kind !== "item";
      if (!whole && (!r || !it)) return;
      e.stopPropagation();
      e.preventDefault();
      cancelHold();
      // put a half-started drag back, then resize instead
      if (d.moved) onMoveRef.current([...d.starts].map(([id, s]) => ({ id, ...s })));
      drag.current = null;
      setGuides({ x: [], y: [], gaps: [] });
      setDragging(false);
      const dist = Math.max(20, spread([...fingers.current.values()]));
      pinch.current = whole
        ? { id: GROUP_ID, dist, start: groupScale, base: 1, group: true }
        : { id: d.id, dist, start: it!.scale, base: r!.size / it!.scale, group: false };
    };
    const move = (e: PointerEvent) => {
      if (!fingers.current.has(e.pointerId)) return;
      fingers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const p = pinch.current;
      if (!p || fingers.current.size < 2) return;
      e.preventDefault();
      const { rects, items, onScale, onGroupScale } = latest.current;
      if (p.group) {
        const g = clampGroup((p.start * spread([...fingers.current.values()])) / p.dist);
        later(() => onGroupScale(g));
        return;
      }
      let s = Math.max(0.3, Math.min(4, (p.start * spread([...fingers.current.values()])) / p.dist));
      // match another line's size when close (text only)
      let match: string | null = null;
      if (items.find((x) => x.id === p.id)?.kind === "text")
        for (const o of rects) {
          if (o.id === p.id || items.find((x) => x.id === o.id)?.kind !== "text") continue;
          if (Math.abs(p.base * s - o.size) / o.size < SIZE_SNAP) {
            s = o.size / p.base;
            match = o.id;
            break;
          }
        }
      setSizeMatch(match);
      later(() => onScale(p.id, Math.round(s * 100) / 100));
    };
    el.addEventListener("pointerdown", down, { capture: true });
    window.addEventListener("pointermove", move, { capture: true, passive: false });
    return () => {
      el.removeEventListener("pointerdown", down, { capture: true });
      window.removeEventListener("pointermove", move, { capture: true });
    };
  }, []);

  useEffect(() => onDragging?.(dragging), [dragging, onDragging]);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  const item = (id: string) => items.find((b) => b.id === id);

  // Moves the dragged item (and the others picked with it), pulling it onto the nearest guide.
  function snapMove(d: Drag, mx: number, my: number) {
    const r = d.rect;
    const thr = SNAP_PX / scale;
    let ox = mx / scale;
    let oy = my / scale;
    const others = rects.filter((o) => !d.starts.has(o.id));

    const best = (points: number[], targets: Guide[]) => {
      let pick: { delta: number; guide: Guide; cost: number } | null = null;
      for (const p of points)
        for (const t of targets) {
          const delta = t.at - p;
          const cost = Math.abs(delta) - (t.page ? 1 : 0); // page guides win near-ties
          if (Math.abs(delta) < thr && (!pick || cost < pick.cost)) pick = { delta, guide: t, cost };
        }
      return pick;
    };

    const left = r.x + ox;
    const xs = best(
      [left, left + r.w / 2, left + r.w],
      [
        { at: W / 2, page: true },
        { at: area.x, page: true },
        { at: area.x + area.w, page: true },
        ...others.flatMap((o) => [o.x, o.x + o.w / 2, o.x + o.w].map((at) => ({ at, page: false }))),
      ],
    );
    if (xs) ox += xs.delta;

    const top = r.y + oy;
    const ys = best(
      [top, top + r.h / 2, top + r.h],
      [
        { at: H / 2, page: true },
        { at: area.y, page: true },
        { at: area.y + area.h, page: true },
        ...others.flatMap((o) => [o.y, o.y + o.h / 2, o.y + o.h].map((at) => ({ at, page: false }))),
      ],
    );

    // Even spacing: the same gap as between the neighbouring lines, or centred between two lines.
    const cx = r.x + ox + r.w / 2;
    const mid = (a: BoxRect) => a.x + a.w / 2;
    const stack = [...others].sort((a, b) => a.y - b.y);
    const spaced: { top: number; gaps: Gap[] }[] = [];
    for (let i = 0; i + 1 < stack.length; i++) {
      const a = stack[i];
      const b = stack[i + 1];
      const g = b.y - (a.y + a.h);
      if (g <= 0) continue;
      const pair = { x: mid(a), y1: a.y + a.h, y2: b.y };
      const below = b.y + b.h + g; // under b, same gap
      spaced.push({ top: below, gaps: [pair, { x: cx, y1: b.y + b.h, y2: below }] });
      const above = a.y - g - r.h; // over a, same gap
      spaced.push({ top: above, gaps: [{ x: cx, y1: above + r.h, y2: a.y }, pair] });
      const centred = (a.y + a.h + b.y - r.h) / 2; // halfway between a and b
      if (centred > a.y + a.h)
        spaced.push({ top: centred, gaps: [{ x: cx, y1: a.y + a.h, y2: centred }, { x: cx, y1: centred + r.h, y2: b.y }] });
    }
    let even: { delta: number; gaps: Gap[] } | null = null;
    for (const c of spaced) {
      const delta = c.top - top;
      if (Math.abs(delta) < thr && (!even || Math.abs(delta) < Math.abs(even.delta))) even = { delta, gaps: c.gaps };
    }

    // Use whichever vertical snap is closer; an alignment guide wins a tie.
    const useEven = even && (!ys || Math.abs(even.delta) < Math.abs(ys.delta) - 0.5);
    if (useEven) oy += even!.delta;
    else if (ys) oy += ys.delta;

    setGuides({ x: xs ? [xs.guide] : [], y: !useEven && ys ? [ys.guide] : [], gaps: useEven ? even!.gaps : [] });
    const moves = [...d.starts].map(([id, s]) => ({ id, dx: Math.round(s.dx + ox), dy: Math.round(s.dy + oy) }));
    later(() => onMove(moves));
  }

  const single = selected.length === 1 && !group ? selected[0] : null;
  const allIds = items.map((it) => it.id);
  const startsOf = (ids: string[]) =>
    new Map(
      ids.map((id) => {
        const it = item(id);
        return [id, { dx: it?.dx ?? 0, dy: it?.dy ?? 0 }] as const;
      }),
    );
  // the whole block: one box around the symbol and every line
  const union: BoxRect | null = rects.length
    ? (() => {
        const x0 = Math.min(...rects.map((r) => r.x));
        const y0 = Math.min(...rects.map((r) => r.y));
        const x1 = Math.max(...rects.map((r) => r.x + r.w));
        const y1 = Math.max(...rects.map((r) => r.y + r.h));
        return { id: GROUP_ID, x: x0, y: y0, w: x1 - x0, h: y1 - y0, size: 0 };
      })()
    : null;
  const unionStyle = union && { left: union.x * scale - 10, top: union.y * scale - 8, width: union.w * scale + 20, height: union.h * scale + 16 };

  // Drags the whole block from anywhere inside it.
  const startGroupDrag = (e: React.PointerEvent<HTMLElement>, kind: Drag["kind"]) => {
    drag.current = { id: GROUP_ID, x: e.clientX, y: e.clientY, starts: startsOf(allIds), rect: union!, moved: false, was: true, kind };
  };
  const moveDrag = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || pinch.current) return;
    const mx = e.clientX - d.x;
    const my = e.clientY - d.y;
    if (!d.moved && Math.hypot(mx, my) < 5) return;
    if (!d.moved) {
      d.moved = true;
      cancelHold();
      setDragging(true);
      if (multi && !d.was) onSelect([...selected, d.id]);
    }
    snapMove(d, mx, my);
  };

  return (
    <div className={"text-overlay" + (dragging ? " dragging" : "")} ref={ref}>
      {/* the design's clear area, while dragging */}
      <div
        className="clear-area"
        style={{ left: area.x * scale, top: area.y * scale, width: area.w * scale, height: area.h * scale }}
        aria-hidden="true"
      />

      {/* alignment guides while dragging */}
      {guides.x.map((g, i) => (
        <div key={"gx" + i} className={"guide guide-v" + (g.page ? " page" : "")} style={{ left: g.at * scale }} />
      ))}
      {guides.y.map((g, i) => (
        <div key={"gy" + i} className={"guide guide-h" + (g.page ? " page" : "")} style={{ top: g.at * scale }} />
      ))}
      {guides.gaps.map((g, i) => (
        <div key={"gap" + i} className="gap" style={{ left: g.x * scale, top: g.y1 * scale, height: (g.y2 - g.y1) * scale }} />
      ))}

      {/* the whole block, when it's picked: drag anywhere inside, resize from the corner */}
      {group && unionStyle && (
        <>
          <div
            className="group-frame"
            style={unionStyle}
            onTouchStart={(e) => e.stopPropagation()}
            onPointerDown={(e) => {
              e.stopPropagation();
              capture(e);
              startGroupDrag(e, "group");
            }}
            onPointerMove={moveDrag}
          />
          {!dragging && (
            <div
              className="tbox-handle"
              style={{ left: unionStyle.left + unionStyle.width - 13, top: unionStyle.top - 13 }}
              onTouchStart={(e) => e.stopPropagation()}
              onPointerDown={(e) => {
                e.stopPropagation();
                capture(e);
                const o = ref.current!.getBoundingClientRect();
                const ax = o.left + union!.x * scale; // bottom-left corner stays put while measuring
                const ay = o.top + (union!.y + union!.h) * scale;
                groupResize.current = { ax, ay, dist: Math.max(10, Math.hypot(e.clientX - ax, e.clientY - ay)), start: groupScale };
              }}
              onPointerMove={(e) => {
                const z = groupResize.current;
                if (!z) return;
                const g = clampGroup((z.start * Math.hypot(e.clientX - z.ax, e.clientY - z.ay)) / z.dist);
                later(() => onGroupScale(g));
              }}
              aria-label="Drag to resize everything"
              title="Drag to resize everything"
            >
              <span aria-hidden="true">⤢</span>
            </div>
          )}
        </>
      )}

      {rects.map((r) => {
        const b = item(r.id);
        if (!b) return null;
        const isOn = selected.includes(r.id);
        const style = { left: r.x * scale - 6, top: r.y * scale - 4, width: r.w * scale + 12, height: r.h * scale + 8 };

        return (
          <div key={r.id}>
            <div
              className={"tbox" + (isOn && !group ? " on" : "") + (group ? " in-group" : "") + (multi ? " multi" : "") + (sizeMatch === r.id ? " match" : "")}
              style={style}
              onTouchStart={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
              onPointerDown={(e) => {
                e.stopPropagation();
                capture(e);
                if (group) {
                  // everything is picked (Select all): drag it all
                  startGroupDrag(e, "group");
                } else {
                  // one line (or several): drag it; an unpicked line gets picked (alone, unless picking several)
                  const ids = isOn ? selected : multi ? [...selected, r.id] : [r.id];
                  drag.current = { id: r.id, x: e.clientX, y: e.clientY, starts: startsOf(ids), rect: r, moved: false, was: isOn, kind: "item" };
                  if (!isOn && !multi) onSelect([r.id]);
                }
                cancelHold();
                hold.current = window.setTimeout(() => {
                  hold.current = null;
                  const d = drag.current;
                  if (!d || d.moved) return;
                  drag.current = null; // a hold isn't a tap
                  navigator.vibrate?.(15);
                  onHold(r.id);
                }, HOLD_MS);
              }}
              onPointerMove={moveDrag}
              onPointerUp={() => {
                const d = drag.current;
                cancelHold();
                if (!d || d.moved || d.kind === "fresh") return;
                if (d.kind === "group") {
                  onSelect([r.id]); // tap a line in the picked block: just that line
                } else if (multi) {
                  // picking several: a tap adds or removes this one
                  onSelect(d.was ? selected.filter((id) => id !== r.id) : [...selected, r.id]);
                } else if (d.was && b.kind === "text") {
                  onEdit(r.id); // second tap edits text
                }
              }}
            >
              {multi && <span className="tbox-check">{isOn ? "✓" : ""}</span>}
              {sizeMatch === r.id && <span className="tbox-tag">same size</span>}
            </div>

            {single === r.id && !dragging && (
              /* resize handle: drag the corner dot */
              <div
                className="tbox-handle"
                style={{ left: style.left + style.width - 11, top: style.top - 11 }}
                onTouchStart={(e) => e.stopPropagation()}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  capture(e);
                  const o = ref.current!.getBoundingClientRect();
                  const ax = o.left + r.x * scale; // bottom-left corner stays put while measuring
                  const ay = o.top + (r.y + r.h) * scale;
                  const start = b.scale;
                  resize.current = { id: r.id, ax, ay, dist: Math.max(10, Math.hypot(e.clientX - ax, e.clientY - ay)), start, base: r.size / start };
                }}
                onPointerMove={(e) => {
                  const z = resize.current;
                  if (!z || z.id !== r.id) return;
                  let s = Math.max(0.3, Math.min(4, (z.start * Math.hypot(e.clientX - z.ax, e.clientY - z.ay)) / z.dist));
                  // magnetic pull: match another line's size when close (the symbol resizes freely)
                  let match: string | null = null;
                  for (const o of rects) {
                    if (o.id === r.id || b.kind !== "text" || item(o.id)?.kind !== "text") continue;
                    if (Math.abs(z.base * s - o.size) / o.size < SIZE_SNAP) {
                      s = o.size / z.base;
                      match = o.id;
                      break;
                    }
                  }
                  setSizeMatch(match);
                  later(() => onScale(r.id, Math.round(s * 100) / 100));
                }}
                aria-label="Drag to resize"
                title="Drag to resize"
              >
                <span aria-hidden="true">⤢</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
