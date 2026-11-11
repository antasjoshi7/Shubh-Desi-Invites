"use client";

// The wedding mood board. One board per person, kept on their phone: photos and screenshots
// sorted by event, with love / maybe / not-this, pinned notes, sticky notes, "love together"
// combinations, a colour palette per event read from the photos, and posters to share.

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ElementType } from "react";
import { flushSync } from "react-dom";
import { openBackup } from "@/lib/moodboard/backup";
import { ingest } from "@/lib/moodboard/image";
import { boardPalette, collagePicks, dressColors, eventPalette, imagesOf, masonry } from "@/lib/moodboard/layout";
import { briefCards } from "@/lib/moodboard/poster";
import { lightness, mix, nameColor, paletteSentence } from "@/lib/moodboard/palette";
import { SAMPLE_CREDITS, sampleBoard } from "@/lib/moodboard/samples";
import { blobKey, clearBlobs, delBlob, forgetUrls, getBlob, loadBoard, primeUrl, putBlob, saveBoard } from "@/lib/moodboard/store";
import { PAPERS, TYPES, emptyBoard, uid, type Board as BoardT, type Card, type CardType, type EventDef } from "@/lib/moodboard/types";
import { track } from "@/lib/track";
import AddTray, { type NewCard } from "./AddTray";
import Detail from "./Detail";
import ShareSheet, { type SendTab } from "./ShareSheet";
import { CardTile, Chips, Collage, Dots, Icon, NoteTile, Sheet, Sticky, cls } from "./parts";
import "./board.css";

const PAPER = "#fff3dc";
type SheetName = "share" | "palette" | "events" | "menu" | "note" | "combo" | "move" | "start" | "credits";

// Runs a change as a smooth transition where the browser can do it (photos glide to their new place).
function transition(fn: () => void) {
  const d = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (!d.startViewTransition || document.visibilityState !== "visible" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { fn(); return; }
  d.startViewTransition(() => flushSync(fn));
}

// A heading or line the person can type straight into.
function Editable({ value, onCommit, className, placeholder, as = "p", label }: { value: string; onCommit: (v: string) => void; className: string; placeholder: string; as?: ElementType; label: string }) {
  const Tag = as;
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.textContent !== value && document.activeElement !== el) el.textContent = value;
  }, [value]);
  return (
    <Tag
      ref={ref}
      className={className}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={label}
      data-placeholder={placeholder}
      spellCheck={false}
      onBlur={(e: React.FocusEvent<HTMLElement>) => onCommit((e.currentTarget.textContent ?? "").trim())}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur(); } }}
      onPaste={(e: React.ClipboardEvent<HTMLElement>) => { e.preventDefault(); document.execCommand("insertText", false, e.clipboardData.getData("text/plain").replace(/\s+/g, " ")); }}
    />
  );
}

// The gentlest colour of a palette to wash the page with (not the darkest, not near-white).
const washOf = (colors: string[]) => colors.find((c) => { const l = lightness(c); return l > 0.5 && l < 0.92; }) ?? colors[0];

export default function Board() {
  const [board, setBoard] = useState<BoardT | null>(null);
  const [view, setView] = useState("all");
  const [filter, setFilter] = useState<CardType | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [heroId, setHeroId] = useState<string | null>(null);
  const [sel, setSel] = useState<string[] | null>(null);
  const [sheet, setSheet] = useState<SheetName | null>(null);
  const [sendTab, setSendTab] = useState<SendTab>("decor");
  const [picked, setPicked] = useState<File[] | null>(null);
  const [after, setAfter] = useState<"pick" | File[] | null>(null);
  const [noteEdit, setNoteEdit] = useState<{ id?: string; text: string; paper: number; eventId: string }>({ text: "", paper: 0, eventId: "overall" });
  const [comboEdit, setComboEdit] = useState<{ id?: string; ids: string[]; note: string }>({ ids: [], note: "" });
  const [name, setName] = useState("");
  const [sure, setSure] = useState(false);
  const [toast, setToast] = useState<{ k: number; text: string; undo?: () => void } | null>(null);
  const [cols, setCols] = useState(2);
  const root = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const backupInput = useRef<HTMLInputElement>(null);
  const boardRef = useRef<BoardT | null>(null);
  boardRef.current = board;

  // ---- load, save ----
  useEffect(() => {
    loadBoard().then((b) => {
      // an untouched sample is always shown fresh, so it picks up improvements to the sample itself
      const start = b && !b.sample ? b : sampleBoard();
      setBoard(start);
      track("moodboard_open", { sample: start.sample, cards: start.cards.length });
    });
  }, []);
  useEffect(() => {
    if (!board) return;
    const t = window.setTimeout(() => void saveBoard(board), 250);
    return () => window.clearTimeout(t);
  }, [board]);

  const update = useCallback((fn: (b: BoardT) => void) => {
    setBoard((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }, []);

  const say = useCallback((text: string, undo?: () => void) => setToast({ k: Date.now(), text, undo }), []);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), toast.undo ? 6000 : 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  // ---- page plumbing: columns, keyboard, scroll lock, paste ----
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fit = () => setCols(el.clientWidth < 560 ? 2 : el.clientWidth < 920 ? 3 : 4);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    // how much of the screen the on-screen keyboard covers, so sheets can sit above it
    const fit = () => document.documentElement.style.setProperty("--mb-kb", `${Math.max(0, window.innerHeight - vv.height - vv.offsetTop)}px`);
    fit();
    vv.addEventListener("resize", fit);
    vv.addEventListener("scroll", fit);
    return () => { vv.removeEventListener("resize", fit); vv.removeEventListener("scroll", fit); };
  }, []);
  // keep the open event's pill in sight in the bar
  useEffect(() => {
    root.current?.querySelector(".mb-pill.on")?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [view, board === null]);
  const overlay = !!openId || !!sheet || !!picked;
  useEffect(() => {
    document.documentElement.classList.toggle("mb-lock", overlay);
    return () => document.documentElement.classList.remove("mb-lock");
  }, [overlay]);

  // ---- what the board works out ----
  const palettes = useMemo(() => {
    const m: Record<string, string[]> = {};
    if (board) for (const e of board.events) m[e.id] = eventPalette(board, e);
    return m;
  }, [board]);
  const overall = useMemo(() => (board ? boardPalette(board, 6) : []), [board]);
  const ev = board?.events.find((e) => e.id === view);
  const wash = washOf(ev ? palettes[ev.id] ?? [] : overall);
  const tint = wash ? mix(PAPER, wash, 0.3) : PAPER;
  useEffect(() => {
    document.documentElement.style.setProperty("--mb-tint", tint);
  }, [tint]);

  const eventCards = useMemo(() => (board && ev ? board.cards.filter((c) => c.eventId === ev.id).sort((a, b) => b.at - a.at) : []), [board, ev]);
  const shown = useMemo(() => eventCards.filter((c) => filter === "all" || c.type === filter), [eventCards, filter]);
  const shownImages = useMemo(() => shown.filter((c) => c.kind === "image"), [shown]);
  const columns = useMemo(() => masonry(shown.map((c) => ({ ...c, w: c.kind === "note" ? 4 : c.w, h: c.kind === "note" ? 3 : c.h, extra: c.note && c.kind === "image" ? 0.14 : 0 })), cols), [shown, cols]);
  const openCard = board?.cards.find((c) => c.id === openId);

  // ---- moving around ----
  const go = (id: string) => {
    transition(() => { setView(id); setFilter("all"); setSel(null); });
    window.scrollTo({ top: 0 });
  };
  const open = (id: string) => {
    flushSync(() => setHeroId(id));
    transition(() => setOpenId(id));
  };
  const closeCard = useCallback(() => transition(() => setOpenId(null)), []);

  // ---- adding ----
  const startAdd = (files?: File[]) => {
    if (!board) return;
    if (board.sample) { setAfter(files ?? "pick"); setName(""); setSheet("start"); return; }
    if (files) setPicked(files);
    else fileInput.current?.click();
  };
  const startAddRef = useRef(startAdd);
  startAddRef.current = startAdd;
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = [...(e.clipboardData?.files ?? [])].filter((f) => f.type.startsWith("image/"));
      if (files.length) { e.preventDefault(); startAddRef.current(files); }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const addCards = async (items: NewCard[]) => {
    const now = Date.now();
    const cards: Card[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i], id = uid();
      await putBlob(blobKey(id, "full"), it.full);
      await putBlob(blobKey(id, "thumb"), it.thumb);
      if (it.orig) await putBlob(blobKey(id, "orig"), it.orig);
      primeUrl(id, "thumb", it.thumb);
      primeUrl(id, "full", it.full);
      cards.push({ id, kind: "image", eventId: it.eventId, type: it.type, w: it.w, h: it.h, colors: it.colors, dom: it.dom, hash: it.hash, pins: [], trimmed: it.trimmed || undefined, at: now + (items.length - i) });
    }
    const first = cards[0]?.eventId;
    transition(() => {
      setPicked(null);
      update((b) => { b.cards.push(...cards); });
      if (first) { setView(first); setFilter("all"); }
    });
    window.scrollTo({ top: 0 });
    if (cards.length) {
      const where = boardRef.current?.events.find((e) => e.id === first)?.name;
      say(`${cards.length} added${where ? ` to ${where}` : ""}`);
      track("moodboard_add", { count: cards.length, trimmed: cards.filter((c) => c.trimmed).length });
    }
  };

  const beginOwn = (keepSamples: boolean) => {
    const next = after;
    setAfter(null);
    setSheet(null);
    if (keepSamples) update((b) => { b.sample = false; });
    else {
      void clearBlobs();
      const fresh = emptyBoard(name.trim() ? `${name.trim()}'s wedding board` : "My wedding board");
      setBoard(fresh);
      setView("all");
      track("moodboard_start", { named: !!name.trim() });
    }
    if (next === "pick") fileInput.current?.click();
    else if (next) setPicked(next);
  };

  // ---- changing cards ----
  const love = (id: string) => {
    navigator.vibrate?.(8);
    update((b) => { const c = b.cards.find((x) => x.id === id); if (c) c.react = c.react === "love" ? undefined : "love"; });
  };
  const removeCards = (ids: string[]) => {
    const before = boardRef.current;
    if (!before) return;
    update((b) => {
      b.cards = b.cards.filter((c) => !ids.includes(c.id));
      b.combos = b.combos.map((k) => ({ ...k, cardIds: k.cardIds.filter((id) => !ids.includes(id)) })).filter((k) => k.cardIds.length >= 2);
    });
    say(ids.length === 1 ? "Removed from the board" : `${ids.length} removed`, () => setBoard(before));
    // once the chance to undo has passed, free the photos' storage
    window.setTimeout(() => {
      ids.forEach((id) => {
        if (boardRef.current?.cards.some((c) => c.id === id)) return;
        (["full", "thumb", "orig"] as const).forEach((s) => void delBlob(blobKey(id, s)));
        forgetUrls(id);
      });
    }, 9000);
  };
  const restoreTrim = async (card: Card) => {
    const orig = await getBlob(blobKey(card.id, "orig"));
    if (!orig) return;
    const out = await ingest(orig, { trim: false });
    await putBlob(blobKey(card.id, "full"), out.full);
    await putBlob(blobKey(card.id, "thumb"), out.thumb);
    primeUrl(card.id, "full", out.full);
    primeUrl(card.id, "thumb", out.thumb);
    update((b) => {
      const c = b.cards.find((x) => x.id === card.id);
      if (c) Object.assign(c, { w: out.w, h: out.h, colors: out.colors, dom: out.dom, trimmed: undefined, pins: [] });
    });
  };
  const pinColor = (eventId: string, hex: string) => {
    const e = boardRef.current?.events.find((x) => x.id === eventId);
    if (!e) return;
    const had = e.pinned.includes(hex);
    update((b) => {
      const x = b.events.find((y) => y.id === eventId)!;
      x.pinned = had ? x.pinned.filter((c) => c !== hex) : [...x.pinned, hex].slice(-5);
    });
    say(had ? `${nameColor(hex)} is no longer kept` : `${nameColor(hex)} kept in ${e.name}'s colours`);
  };

  // ---- notes, combinations ----
  const newNote = () => {
    if (!board) return;
    setNoteEdit({ text: "", paper: Math.floor(Math.random() * PAPERS.length), eventId: ev?.id ?? board.events[0].id });
    setSheet("note");
  };
  const saveNote = () => {
    const text = noteEdit.text.trim();
    setSheet(null);
    if (!text) return;
    update((b) => {
      if (b.sample) b.sample = false;
      const c = noteEdit.id ? b.cards.find((x) => x.id === noteEdit.id) : undefined;
      if (c) Object.assign(c, { note: text, paper: noteEdit.paper, eventId: noteEdit.eventId });
      else b.cards.push({ id: uid(), kind: "note", eventId: noteEdit.eventId, type: "vibe", w: 4, h: 3, colors: [], dom: PAPERS[noteEdit.paper], pins: [], note: text, paper: noteEdit.paper, at: Date.now() });
    });
    if (!noteEdit.id && view !== "all" && view !== noteEdit.eventId) go(noteEdit.eventId);
  };
  const saveCombo = () => {
    setSheet(null);
    update((b) => {
      const k = comboEdit.id ? b.combos.find((x) => x.id === comboEdit.id) : undefined;
      if (k) k.note = comboEdit.note.trim();
      else if (ev) b.combos.push({ id: uid(), eventId: ev.id, cardIds: comboEdit.ids, note: comboEdit.note.trim() });
    });
    if (!comboEdit.id) { setSel(null); say("Saved as a combination"); }
  };

  const openSend = (tab: SendTab) => { setSendTab(tab); setSheet("share"); };

  if (!board) {
    return (
      <div className="mb" ref={root}>
        <div className="mb-loading" aria-label="Opening your board"><span /><span /><span /></div>
      </div>
    );
  }

  const images = imagesOf(board);
  const lovedCount = images.filter((c) => c.react === "love").length;
  const selCards = sel ? board.cards.filter((c) => sel.includes(c.id)) : [];
  const selImages = selCards.filter((c) => c.kind === "image");
  const typesHere = TYPES.filter((t) => eventCards.some((c) => c.type === t.id));
  const combos = ev ? board.combos.filter((k) => k.eventId === ev.id) : [];
  const emptyEvents = board.events.filter((e) => !board.cards.some((c) => c.eventId === e.id));
  const toggleSel = (id: string) => setSel((s) => (s ? (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]) : [id]));
  let n = 0;

  return (
    <div
      className="mb"
      ref={root}
      style={{ "--tint": tint } as CSSProperties}
      onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) e.preventDefault(); }}
      onDrop={(e) => { const files = [...e.dataTransfer.files].filter((f) => /^(image|video)\//.test(f.type)); if (files.length) { e.preventDefault(); startAdd(files); } }}
    >
      <header className="mb-top">
        <nav className="mb-pills" aria-label="Events">
          <button className={cls("mb-pill", view === "all" && "on")} onClick={() => go("all")} aria-current={view === "all"}>Board</button>
          {board.events.map((e) => (
            <button key={e.id} className={cls("mb-pill", view === e.id && "on")} onClick={() => go(e.id)} aria-current={view === e.id}>
              {palettes[e.id]?.[0] && <i style={{ background: palettes[e.id][0] }} />}
              {e.name}
            </button>
          ))}
        </nav>
        <button className="mb-round" onClick={() => { setSure(false); setSheet("menu"); }} aria-label="More"><Icon.more /></button>
      </header>

      {view === "all" || !ev ? (
        <main className="mb-main" key="all">
          <section className="mb-hero">
            <p className="mb-eyebrow">Decide it. Brief it. Send it.</p>
            <Editable as="h1" className="mb-title" value={board.title} label="Board name" placeholder="Name your board" onCommit={(v) => update((b) => { b.title = v || "My wedding board"; })} />
            <Editable className="mb-line" value={board.line} label="One line about the feeling" placeholder="Add a line about the feeling…" onCommit={(v) => update((b) => { b.line = v; })} />
            {overall.length > 0 && <Dots colors={overall} size={34} overlap={0.22} />}
            {images.length > 0 && <p className="mb-count">{images.length} ideas<i>·</i>{lovedCount} loved</p>}
          </section>

          {board.sample && (
            <div className="mb-banner">
              <p><b>This is a sample.</b> Open Haldi, see the brief it makes for a decorator, then start yours.</p>
              <button className="mb-btn small" onClick={() => { setAfter(null); setName(""); setSheet("start"); }}>Start mine</button>
            </div>
          )}

          {images.length === 0 && !board.cards.length ? (
            <div className="mb-blank">
              <p className="mb-blank-big">Tell your decorator exactly what you want, in ten minutes.</p>
              <ol className="mb-steps">
                <li>Add 5 to 15 screenshots for one function, from Pinterest, Instagram or WhatsApp.</li>
                <li>Tap what you love. Pin a note on the exact spot.</li>
                <li>Send the brief to the decorator, and a &ldquo;what to wear&rdquo; card to your guests.</li>
              </ol>
              <button className="mb-btn" onClick={() => startAdd()}><Icon.plus /> Add your first photos</button>
              <button className="mb-text" onClick={() => { void clearBlobs(); setBoard(sampleBoard()); }}>See a sample board</button>
            </div>
          ) : (
            <div className="mb-chapters">
              {board.events.map((e) => {
                const picks = collagePicks(board, e.id, 7);
                const total = board.cards.filter((c) => c.eventId === e.id).length;
                if (!total) return null;
                const sentence = paletteSentence(palettes[e.id] ?? []);
                const briefN = briefCards(board, e, "decor").wanted.length;
                return (
                  <button key={e.id} className="mb-chapter" onClick={() => go(e.id)} style={{ "--i": n++ } as CSSProperties}>
                    {picks.length > 0 ? <Collage cards={picks} /> : <span className="mb-collage none" />}
                    <span className="mb-plaque">{e.name}</span>
                    {(palettes[e.id]?.length ?? 0) > 0 && (
                      <span className="mb-strip" aria-hidden="true">{palettes[e.id].map((c, i) => <i key={c + i} style={{ background: c }} />)}</span>
                    )}
                    <span className="mb-chapter-meta">{total} {total === 1 ? "idea" : "ideas"}{sentence && <><i>·</i>{sentence}</>}</span>
                    {(briefN > 0 || e.dress?.line) && (
                      <span className="mb-tags">
                        {briefN > 0 && <em><Icon.check size={13} /> Decor brief ready</em>}
                        {e.dress?.line && <em><Icon.check size={13} /> What to wear</em>}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {emptyEvents.length > 0 && board.cards.length > 0 && (
            <div className="mb-nothing">
              <p>Nothing yet for</p>
              <div className="mb-chips">{emptyEvents.map((e) => <button key={e.id} className="mb-chip" onClick={() => go(e.id)}>{e.name}</button>)}</div>
            </div>
          )}
        </main>
      ) : (
        <main className="mb-main" key={ev.id}>
          <section className="mb-evhead">
            <h1 className="mb-evname">{ev.name}</h1>
            {(palettes[ev.id]?.length ?? 0) > 0 ? (
              <button className="mb-palette" onClick={() => setSheet("palette")} aria-label={`${ev.name} colours: ${paletteSentence(palettes[ev.id], 5)}. Open`}>
                <Dots colors={palettes[ev.id]} size={30} overlap={0.2} />
                <span>{paletteSentence(palettes[ev.id])}</span>
              </button>
            ) : (
              <p className="mb-count">Colours appear here as you add photos</p>
            )}
            <Outcomes board={board} ev={ev} onOpen={openSend} />
            {typesHere.length > 1 && (
              <Chips<CardType | "all">
                label="Show"
                items={[{ id: "all", label: "All" }, ...typesHere.map((t) => ({ id: t.id, label: t.label }))]}
                value={filter}
                onPick={(id) => transition(() => setFilter(id))}
              />
            )}
          </section>

          {combos.length > 0 && filter === "all" && (
            <section className="mb-combos" aria-label="Loved together">
              <h2>Loved together</h2>
              <div className="mb-combo-row">
                {combos.map((k) => {
                  const cards = k.cardIds.map((id) => board.cards.find((c) => c.id === id)).filter((c): c is Card => !!c && c.kind === "image");
                  if (cards.length < 2) return null;
                  return (
                    <button key={k.id} className="mb-combo" onClick={() => { setComboEdit({ id: k.id, ids: k.cardIds, note: k.note }); setSheet("combo"); }}>
                      <Collage cards={cards} ratio={0.66} gap={1.6} />
                      {k.note && <Sticky text={k.note} id={k.id} paper={2} small />}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {shown.length === 0 ? (
            <div className="mb-blank">
              <p className="mb-blank-big">Nothing for {ev.name} yet.</p>
              <p>Add screenshots, photos or a frame from a reel. Or stick a note here to start.</p>
              <button className="mb-btn" onClick={() => startAdd()}><Icon.plus /> Add to {ev.name}</button>
            </div>
          ) : (
            <div className="mb-grid" style={{ "--cols": cols } as CSSProperties}>
              {columns.map((col, ci) => (
                <div key={ci} className="mb-col">
                  {col.map((c) => {
                    const card = board.cards.find((x) => x.id === c.id)!;
                    const i = n++;
                    return card.kind === "note" ? (
                      <NoteTile key={card.id} card={card} i={i} selecting={!!sel} selected={!!sel?.includes(card.id)} onHold={() => setSel((s) => s ?? [card.id])} onPick={() => toggleSel(card.id)}
                        onOpen={() => { setNoteEdit({ id: card.id, text: card.note ?? "", paper: card.paper ?? 0, eventId: card.eventId }); setSheet("note"); }} />
                    ) : (
                      <CardTile key={card.id} card={card} i={i} hero={heroId === card.id && !openId} selecting={!!sel} selected={!!sel?.includes(card.id)}
                        onOpen={() => open(card.id)} onLove={() => love(card.id)} onHold={() => setSel((s) => s ?? [card.id])} onPick={() => toggleSel(card.id)} />
                    );
                  })}
                </div>
              ))}
            </div>
          )}
          {shown.length > 0 && !sel && <p className="mb-tip">Press and hold a photo to pick several, then save the ones you love together.</p>}
        </main>
      )}

      {/* the dock: note, add, share. While picking several cards it becomes the actions for them. */}
      {sel ? (
        <div className="mb-dock picking" role="toolbar" aria-label="Picked cards">
          <span className="mb-dock-count">{sel.length} picked</span>
          <button onClick={() => { setComboEdit({ ids: selImages.map((c) => c.id).slice(0, 4), note: "" }); setSheet("combo"); }} disabled={selImages.length < 2}><Icon.together /><span>Together</span></button>
          <button onClick={() => setSheet("move")} disabled={!sel.length}><Icon.move /><span>Move</span></button>
          <button onClick={() => { removeCards(sel); setSel(null); }} disabled={!sel.length}><Icon.trash /><span>Remove</span></button>
          <button onClick={() => setSel(null)} aria-label="Stop picking"><Icon.close /></button>
        </div>
      ) : (
        <div className="mb-dock">
          <button className="mb-dock-side" onClick={newNote}><Icon.note /><span>Note</span></button>
          <button className="mb-fab" onClick={() => startAdd()} aria-label="Add photos, screenshots or a reel"><Icon.plus size={28} /></button>
          <button className="mb-dock-side" onClick={() => openSend(ev && briefCards(board, ev, "decor").wanted.length ? "decor" : "poster")}><Icon.share /><span>Send</span></button>
        </div>
      )}

      <input ref={fileInput} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => { const files = [...(e.target.files ?? [])]; e.target.value = ""; if (files.length) setPicked(files); }} />
      <input
        ref={backupInput}
        type="file"
        accept=".zip,application/zip"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          try {
            const b = await openBackup(file);
            setBoard(b);
            setView("all");
            say("Backup opened");
          } catch (err) {
            say((err as Error).message || "That file couldn't be opened");
          }
        }}
      />

      {openCard && openCard.kind === "image" && (
        <Detail
          card={openCard}
          list={shownImages.some((c) => c.id === openCard.id) ? shownImages : [openCard]}
          board={board}
          onClose={closeCard}
          onNav={(id) => { setHeroId(id); setOpenId(id); }}
          onChange={(fn) => update((b) => { const c = b.cards.find((x) => x.id === openCard.id); if (c) fn(c); })}
          onDelete={() => { closeCard(); removeCards([openCard.id]); }}
          onPinColor={(hex) => pinColor(openCard.eventId, hex)}
          onRestore={() => void restoreTrim(openCard)}
        />
      )}

      {picked && (
        <AddTray
          files={picked}
          events={board.events}
          defaultEvent={ev?.id}
          hashes={board.cards.map((c) => c.hash).filter((h): h is string => !!h)}
          onAdd={(cards) => void addCards(cards)}
          onClose={() => setPicked(null)}
        />
      )}

      <ShareSheet open={sheet === "share"} board={board} view={view} tab={sendTab} onClose={() => setSheet(null)} toast={say} update={update} />

      <Sheet open={sheet === "start"} onClose={() => { setSheet(null); setAfter(null); }} title="Your own board">
        <div className="mb-form">
          <label htmlFor="mb-name">Whose board is it?</label>
          <input id="mb-name" value={name} maxLength={24} placeholder="Your name (optional)" autoComplete="given-name" onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") beginOwn(false); }} />
          <button className="mb-btn wide" onClick={() => beginOwn(false)}>{after ? "Start my board and add photos" : "Start my board"}</button>
          {board.sample && <button className="mb-text" onClick={() => beginOwn(true)}>Keep the sample photos and build on them</button>}
          <p className="mb-fine">Your board stays on this phone. Nothing is uploaded.</p>
        </div>
      </Sheet>

      <Sheet open={sheet === "note"} onClose={() => setSheet(null)} title={noteEdit.id ? "Note" : "New note"}>
        <div className="mb-form">
          <textarea
            id="mb-note-text"
            className="mb-notepad"
            style={{ background: PAPERS[noteEdit.paper % PAPERS.length] }}
            rows={3}
            maxLength={140}
            placeholder="Pastels for the sisters. No white at the sangeet…"
            value={noteEdit.text}
            onChange={(e) => setNoteEdit({ ...noteEdit, text: e.target.value })}
            aria-label="Note"
          />
          <span className="mb-papers" role="group" aria-label="Note colour">
            {PAPERS.map((col, i) => <button key={col} style={{ background: col }} className={noteEdit.paper === i ? "on" : ""} onClick={() => setNoteEdit({ ...noteEdit, paper: i })} aria-label={`Note colour ${i + 1}`} aria-pressed={noteEdit.paper === i} />)}
          </span>
          <h3>Which event is this for?</h3>
          <Chips label="Event" items={board.events.map((e) => ({ id: e.id, label: e.name }))} value={noteEdit.eventId} onPick={(id) => setNoteEdit({ ...noteEdit, eventId: id })} />
          <div className="mb-row">
            <button className="mb-btn" onClick={saveNote} disabled={!noteEdit.text.trim()}>{noteEdit.id ? "Save" : "Stick it on the board"}</button>
            {noteEdit.id && <button className="mb-text danger" onClick={() => { setSheet(null); removeCards([noteEdit.id!]); }}>Remove</button>}
          </div>
        </div>
      </Sheet>

      <Sheet open={sheet === "combo"} onClose={() => setSheet(null)} title="Loved together">
        <div className="mb-form">
          <div className="mb-combo big">
            <Collage cards={comboEdit.ids.map((id) => board.cards.find((c) => c.id === id)).filter((c): c is Card => !!c && c.kind === "image")} ratio={0.6} gap={1.4} />
          </div>
          <label htmlFor="mb-combo-note">What do you love about these together?</label>
          <input id="mb-combo-note" value={comboEdit.note} maxLength={70} placeholder="this backdrop with these flowers" onChange={(e) => setComboEdit({ ...comboEdit, note: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") saveCombo(); }} />
          <div className="mb-row">
            <button className="mb-btn" onClick={saveCombo}>{comboEdit.id ? "Save" : "Save this combination"}</button>
            {comboEdit.id && <button className="mb-text danger" onClick={() => { setSheet(null); update((b) => { b.combos = b.combos.filter((k) => k.id !== comboEdit.id); }); }}>Split them up</button>}
          </div>
        </div>
      </Sheet>

      <Sheet open={sheet === "move"} onClose={() => setSheet(null)} title={`Move ${sel?.length ?? 0} ${sel?.length === 1 ? "card" : "cards"}`}>
        <div className="mb-form">
          <h3>To which event?</h3>
          <Chips label="Event" items={board.events.map((e) => ({ id: e.id, label: e.name }))} value={null}
            onPick={(id) => {
              const ids = sel ?? [];
              update((b) => {
                b.cards.forEach((c) => { if (ids.includes(c.id)) c.eventId = id; });
                b.combos = b.combos.filter((k) => !k.cardIds.some((x) => ids.includes(x)) || k.eventId === id);
              });
              setSheet(null);
              setSel(null);
              say(`Moved to ${board.events.find((e) => e.id === id)?.name}`);
            }} />
          <h3>Or change what they show</h3>
          <Chips<CardType> label="Kind" items={TYPES.map((t) => ({ id: t.id, label: t.label }))} value={null}
            onPick={(id) => {
              const ids = sel ?? [];
              update((b) => { b.cards.forEach((c) => { if (ids.includes(c.id) && c.kind === "image") c.type = id; }); });
              setSheet(null);
              setSel(null);
              say(`Marked as ${TYPES.find((t) => t.id === id)?.label}`);
            }} />
        </div>
      </Sheet>

      <Sheet open={sheet === "palette"} onClose={() => setSheet(null)} title={ev ? `${ev.name} colours` : "Colours"}>
        {ev && <PaletteBody ev={ev} colors={palettes[ev.id] ?? []} onToggle={(hex) => pinColor(ev.id, hex)} say={say} title={board.title} />}
      </Sheet>

      <Sheet open={sheet === "events"} onClose={() => setSheet(null)} title="Your events" tall>
        <EventsBody board={board} update={update} onGone={(id) => { if (view === id) setView("all"); }} />
      </Sheet>

      <Sheet open={sheet === "credits"} onClose={() => setSheet(null)} title="Sample photos">
        <div className="mb-form">
          <p>The sample board uses free-to-use photos from Unsplash. Thank you to the photographers:</p>
          <p className="mb-fine">{SAMPLE_CREDITS.join(", ")}.</p>
        </div>
      </Sheet>

      <Sheet open={sheet === "menu"} onClose={() => setSheet(null)} title="More">
        <div className="mb-menu">
          <button onClick={() => setSheet("events")}><b>Edit events</b><small>Rename, add, remove or reorder them</small></button>
          <button onClick={() => { setSheet(null); backupInput.current?.click(); }}><b>Open a backup file</b><small>Bring a board in from another phone</small></button>
          {board.sample ? (
            <button onClick={() => { setAfter(null); setName(""); setSheet("start"); }}><b>Start my own board</b><small>Clears the samples</small></button>
          ) : (
            <button
              className={sure ? "danger" : ""}
              onClick={() => {
                if (!sure && board.cards.length) { setSure(true); return; }
                void clearBlobs();
                setBoard(sampleBoard());
                setView("all");
                setSheet(null);
              }}
            >
              <b>{sure ? "Tap again to clear this board" : "Start over"}</b>
              <small>{sure ? "Everything on this board will be removed from this phone" : "Clears the board and shows the sample again"}</small>
            </button>
          )}
          {board.cards.some((c) => c.credit) && <button onClick={() => setSheet("credits")}><b>About the sample photos</b><small>Who took them</small></button>}
          <a href="/create"><b>Make the wedding invite</b><small>Free invitation card and video maker</small></a>
        </div>
      </Sheet>

      {toast && (
        <div className="mb-toast" role="status" key={toast.k}>
          <span>{toast.text}</span>
          {toast.undo && <button onClick={() => { toast.undo!(); setToast(null); }}>Undo</button>}
        </div>
      )}
    </div>
  );
}

// The two things an event is for: a brief the decorator can act on, and a dress code for guests.
// Each card says how ready it is and opens exactly what would be sent.
function Outcomes({ board, ev, onOpen }: { board: BoardT; ev: EventDef; onOpen: (tab: SendTab) => void }) {
  const decor = briefCards(board, ev, "decor").wanted;
  const notes = decor.reduce((a, c) => a + c.pins.length + (c.note?.trim() ? 1 : 0), 0);
  const wear = dressColors(board, ev);
  const line = ev.dress?.line.trim();
  return (
    <div className="mb-outs">
      <button className={cls("mb-out", decor.length > 0 && "ready")} onClick={() => onOpen("decor")}>
        <span className="mb-out-k">For the decorator</span>
        <b>Decor brief</b>
        <small>{decor.length ? `${decor.length} ${decor.length === 1 ? "photo" : "photos"} · ${notes} ${notes === 1 ? "note" : "notes"}` : "Love a few decor photos to start"}</small>
      </button>
      <button className={cls("mb-out", !!line && "ready")} onClick={() => onOpen("wear")}>
        <span className="mb-out-k">For the guests</span>
        <b>What to wear</b>
        <small>{line || "Add a dress code"}</small>
        {line && wear.length > 0 && <Dots colors={wear.slice(0, 4)} size={16} overlap={0.2} />}
      </button>
    </div>
  );
}

function PaletteBody({ ev, colors, onToggle, say, title }: { ev: EventDef; colors: string[]; onToggle: (hex: string) => void; say: (t: string) => void; title: string }) {
  const copy = async () => {
    const text = `${ev.name} colours (${title}):\n` + colors.map((c) => `${nameColor(c)} ${c.toUpperCase()}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      say("Colours copied. Paste them in WhatsApp.");
    } catch {
      say("Couldn't copy. Take a screenshot instead.");
    }
  };
  return (
    <div className="mb-form">
      <div className="mb-bigswatches">
        {colors.map((c) => {
          const kept = ev.pinned.includes(c);
          return (
            <button key={c} onClick={() => onToggle(c)} aria-pressed={kept} style={{ background: c, color: lightness(c) > 0.68 ? "#1d1a16" : "#fff" }}>
              <b>{nameColor(c)}</b>
              <small>{c.toUpperCase()}</small>
              {kept && <em>Kept</em>}
            </button>
          );
        })}
      </div>
      <p className="mb-fine">These come from your photos. The ones you love count most, and &ldquo;not this&rdquo; photos don&rsquo;t count. Tap a colour to keep it even when the photos change.</p>
      <button className="mb-btn ghost wide" onClick={copy}>Copy the colour names</button>
    </div>
  );
}

function EventsBody({ board, update, onGone }: { board: BoardT; update: (fn: (b: BoardT) => void) => void; onGone: (id: string) => void }) {
  const [fresh, setFresh] = useState("");
  const add = () => {
    const name = fresh.trim();
    if (!name) return;
    update((b) => { b.events.push({ id: uid(), name, pinned: [] }); });
    setFresh("");
  };
  return (
    <div className="mb-form">
      <ul className="mb-events">
        {board.events.map((e, i) => {
          const count = board.cards.filter((c) => c.eventId === e.id).length;
          return (
            <li key={e.id}>
              <input value={e.name} maxLength={22} aria-label="Event name" onChange={(ev2) => update((b) => { b.events[i].name = ev2.target.value; })} onBlur={() => { if (!e.name.trim()) update((b) => { b.events[i].name = "Event"; }); }} />
              <button className="mb-round small" disabled={i === 0} aria-label={`Move ${e.name} up`} onClick={() => update((b) => { [b.events[i - 1], b.events[i]] = [b.events[i], b.events[i - 1]]; })}><Icon.up /></button>
              <button className="mb-round small" disabled={i === board.events.length - 1} aria-label={`Move ${e.name} down`} onClick={() => update((b) => { [b.events[i + 1], b.events[i]] = [b.events[i], b.events[i + 1]]; })}><Icon.dn /></button>
              <button
                className="mb-round small"
                disabled={board.events.length < 2}
                aria-label={count ? `Remove ${e.name} and move its ${count} cards to ${board.events[i === 0 ? 1 : 0]?.name}` : `Remove ${e.name}`}
                onClick={() => {
                  update((b) => {
                    const to = b.events[i === 0 ? 1 : 0].id;
                    b.cards.forEach((c) => { if (c.eventId === e.id) c.eventId = to; });
                    b.combos.forEach((k) => { if (k.eventId === e.id) k.eventId = to; });
                    b.events.splice(i, 1);
                  });
                  onGone(e.id);
                }}
              >
                <Icon.trash />
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mb-fine">Removing an event moves its photos to the first event in the list.</p>
      <div className="mb-linkrow">
        <input id="mb-new-event" value={fresh} maxLength={22} placeholder="Add an event: Cocktail, Roka, Griha Pravesh…" onChange={(e) => setFresh(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") add(); }} aria-label="New event name" />
        <button className="mb-btn small" onClick={add} disabled={!fresh.trim()}>Add</button>
      </div>
    </div>
  );
}
