"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BgThumb, Label, SameBox, Slider, Swatch } from "@/components/Controls";
import { MiniPreview } from "@/components/MiniPreview";
import { PageStrip } from "@/components/PageStrip";
import { PreviewModal } from "@/components/PreviewModal";
import { SymbolTile } from "@/components/SymbolTile";
import { TextOverlay, type OverlayItem } from "@/components/TextOverlay";
import { Tip, useTips } from "@/components/Tip";
import { loadFont, loadImage } from "@/lib/assets";
import { playForVideo, playTrack } from "@/lib/audio";
import { MUSIC, musicFor } from "@/lib/music";
import {
  ANIMATIONS,
  BACKGROUNDS,
  CATEGORY_LABELS,
  DESIGN_COLOURS,
  DURATIONS,
  EVENT_LOOK,
  FONTS,
  MAX_PAGES,
  ORIGINAL_COLOURS,
  PALETTES,
  PAPER_COLOURS,
  DEFAULT_INITIALS,
  SYMBOL_STYLES,
  THEMES,
  TRANSITIONS,
  findBackground,
  lookFor,
  surfaceOf,
} from "@/lib/catalog";
import { rankPalettes } from "@/lib/colors";
import { EVENTS, defaultInvite, duplicatePage, makePage, newId, pageTitles, startFrom } from "@/lib/defaults";
import { exportVideo, type ExportResult } from "@/lib/export";
import { useHistory } from "@/lib/history";
import { track } from "@/lib/track";
import {
  DEFAULT_LINE_SPACING,
  H,
  HORSE,
  SYMBOL_ID,
  W,
  boxColor,
  clearArea,
  renderInvite,
  renderPageAt,
  renderTransition,
  textBoxRects,
  textFit,
  totalDuration,
  transitionLength,
} from "@/lib/render";
import { PAINTED_MOTIONS, motionAssets } from "@/lib/motions";
import { SYMBOL_FONTS } from "@/lib/symbols";
import { ROLES, ROLE_ORDER, baseSize, designSize, fontSlot, guessRole, lineLook } from "@/lib/textStyles";
import type { AnimationId, BgColours, EventId, Invite, Page, PageKind, SameEverywhere, TextBox, TextRole, TransitionId } from "@/lib/types";

// The panel that slides up above the toolbar.
type Panel =
  | "design"
  | "colours"
  | "symbol"
  | "motion"
  | "music"
  | "font"
  | "size"
  | "tcolour"
  | "style"
  | "edit"
  | "add"
  | "pagemenu"
  | "more"
  | null;
type Previewing = { kind: "animation"; id: AnimationId } | { kind: "transition"; id: TransitionId } | null;
type Toast = { text: string; undo?: boolean } | null;

// Which page settings each "Apply to this page and the ones after" box controls.
const SAME_KEYS: Record<keyof SameEverywhere, (keyof Page)[]> = {
  duration: ["duration"],
  background: ["background", "colours", "bgZoom", "palette", "layout"],
  animation: ["animation"],
};

// Settings that are always the same on every page.
const ALWAYS_SAME: (keyof Page)[] = ["symbolStyle", "initials", "transition"];
// Panels for the selected text: they stay open while you tap between lines.
const TEXT_PANELS: Panel[] = ["font", "size", "tcolour", "style", "edit"];
// Panels for browsing (designs, colours…): they take the whole screen, with a small live preview.
const TALL_PANELS: Panel[] = ["design", "colours", "symbol", "motion", "music", "add"];
const SAVE_KEY = "shaadi-invite-v2";
// One plain line at the top of each panel saying what it's for.
const PANEL_DESC: Record<string, string> = {
  design: "Pick the artwork behind your words. Your text always fits inside its plain middle.",
  colours: "Recolour this page: the paper, the artwork and your words.",
  font: "Changes the font of the selected text only.",
  size: "Make it bigger or smaller. You can also pinch it on the page.",
  tcolour: "Pick a colour for the selected text.",
  style: "Pick what this line is (names, date, details…) for a matching look, then fine-tune it.",
  edit: "Type your words. The page updates as you type.",
  symbol: "The sign at the top of every page: Ganesh ji, Om or your initials.",
  motion: "How words appear, how pages change, and how long each page shows.",
  music: "Background music for the whole video. Tap ▶ to listen first.",
  add: "Add a new page after this one. It starts with this page’s look.",
  pagemenu: "Copy or delete this page. To reorder, hold a page and slide it.",
  more: "Save this page as a picture, watch your last video, or start again.",
};
const MIN_SIZE = 12; // font size range in the Size panel (page units, the page is 720 wide)
const MAX_SIZE = 220;
// extra text colours offered next to the palette's two
const TEXT_SWATCHES = ["#ffffff", "#fbf6ec", "#1a1a1a", "#7a1630", "#c2185b", "#c9a03a", "#e8b923", "#1f7a52", "#2a4aa0"];

export default function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const history = useHistory<Invite>(defaultInvite);
  const invite = history.value;
  const setInvite = history.set;
  const [current, setCurrent] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);
  const [sel, setSel] = useState<string[]>([]); // selected text lines (and/or the symbol)
  const [multi, setMulti] = useState(false); // picking several
  const [group, setGroup] = useState(false); // the whole block (symbol + all text) is picked
  const [editing, setEditing] = useState<string | null>(null); // line being typed into
  const [previewing, setPreviewing] = useState<Previewing>(null);
  const [category, setCategory] = useState<string | null>(null); // design library section
  const [stageSize, setStageSize] = useState({ w: 300, h: 533 });
  const [ready, setReady] = useState(false);
  const [assetTick, setAssetTick] = useState(0); // bumps when an image finishes loading
  const [busy, setBusy] = useState<"" | "preview" | "export">("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<(ExportResult & { url: string }) | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<Toast>(null);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const tips = useTips();
  const stopTrackRef = useRef<(() => void) | null>(null);
  const stopPreview = useRef(false);
  const loaded = useRef(false);

  const page = invite.pages[current] ?? invite.pages[0];
  const nextPage = invite.pages[current + 1] ?? invite.pages[current - 1] ?? page;
  const total = totalDuration(invite);
  const titles = pageTitles(invite.pages);
  const eventLook = page.kind === "event" && page.event ? EVENT_LOOK[page.event] : null;
  const bg = findBackground(page.background);
  const surface = surfaceOf(page.colours, bg);
  const ranked = rankPalettes(PALETTES, surface, bg?.primary);
  const area = useMemo(() => clearArea(page), [page]);
  const boxRects = useMemo(() => (ready ? textBoxRects(page) : []), [ready, page]);
  const selBoxes = page.boxes.filter((b) => sel.includes(b.id));
  const firstSel = selBoxes[0];
  const symbolSelected = sel.includes(SYMBOL_ID);
  const mode: "page" | "text" | "symbol" = selBoxes.length ? "text" : symbolSelected ? "symbol" : "page";
  const locked = busy !== "";

  const overlayItems: OverlayItem[] = [
    ...(page.symbol !== "off"
      ? [{ id: SYMBOL_ID, kind: "symbol" as const, dx: page.symbolDx ?? 0, dy: page.symbolDy ?? 0, scale: page.symbolScale ?? 1 }]
      : []),
    ...page.boxes.map((b) => ({ id: b.id, kind: "text" as const, dx: b.dx ?? 0, dy: b.dy ?? 0, scale: designSize(b) / baseSize(b) })),
  ];
  // how much the page has shrunk the text to fit the design (shown, so sizes never change mysteriously)
  const fit = useMemo(() => (ready ? textFit(page) : 1), [ready, page]);

  // text moved by hand onto the decoration (offer to fit it back)
  const offDesign = boxRects.filter((r) => {
    const b = page.boxes.find((x) => x.id === r.id);
    if (!b || (!b.dx && !b.dy)) return false;
    const m = 6;
    return r.x < area.x - m || r.x + r.w > area.x + area.w + m || r.y < area.y - m || r.y + r.h > area.y + area.h + m;
  });

  // ----- loading, saving, sizing -----

  // Bring back the invite saved on this device.
  useEffect(() => {
    if (loaded.current) return; // once (React runs effects twice in development)
    let saved: Invite | null = null;
    try {
      const stored = JSON.parse(localStorage.getItem(SAVE_KEY) ?? "null") as Invite | null;
      if (stored?.pages?.length) history.reset((saved = stored));
    } catch {
      // nothing saved, or storage blocked
    }
    // arrived from a landing page: start on that event or design
    const params = new URLSearchParams(window.location.search);
    track("editor_opened", { event: params.get("event"), design: params.get("design"), motion: params.get("motion"), returning: !!saved });
    if (params.has("event") || params.has("design") || params.has("motion")) {
      const started = startFrom(saved ?? history.value, !saved, params.get("event"), params.get("design"), params.get("motion"));
      if (started) {
        history.set(started.invite);
        setCurrent(started.page);
      }
      window.history.replaceState(null, "", window.location.pathname);
    }
    loaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save as you go.
  useEffect(() => {
    if (!loaded.current) return;
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(invite));
      } catch {
        // storage full or blocked: keep working without saving
      }
    }, 400);
    return () => window.clearTimeout(id);
  }, [invite]);

  // Fonts and the horse illustration, once.
  useEffect(() => {
    Promise.all([...FONTS.map((f) => loadFont(f.family, f.regular, f.bold)), ...SYMBOL_FONTS.map((f) => loadFont(f.family, f.file)), loadImage(HORSE)])
      .catch((e) => setError(String(e)))
      .finally(() => setReady(true));
  }, []);

  // The painted motions' images, after start-up (redraw as they arrive).
  useEffect(() => {
    if (!ready) return;
    const srcs = [...new Set(PAINTED_MOTIONS.flatMap(motionAssets))];
    Promise.all(srcs.map((src) => loadImage(src).catch(() => null))).then(() => setAssetTick((n) => n + 1));
  }, [ready]);

  // Every background in use (redraw when each arrives).
  const bgKey = [...new Set(invite.pages.map((p) => p.background))].join("|");
  useEffect(() => {
    for (const src of bgKey.split("|")) loadImage(src).then(() => setAssetTick((n) => n + 1), () => {});
  }, [bgKey]);

  // Show the current page as a still whenever anything changes.
  useEffect(() => {
    if (!ready || busy) return;
    renderPageAt(canvasRef.current!.getContext("2d")!, page, page.duration);
  }, [ready, busy, page, assetTick]);

  // The page is as big as the space allows, at 9:16.
  useEffect(() => {
    const el = areaRef.current!;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth - 24;
      const h = el.clientHeight - 20;
      const fitW = Math.min(w, (h * 9) / 16);
      setStageSize({ w: Math.max(120, fitW), h: Math.max(213, (fitW * 16) / 9) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // On phones the keyboard shrinks the visible area: size the app to it.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const fit = () => document.documentElement.style.setProperty("--app-h", `${vv.height}px`);
    fit();
    vv.addEventListener("resize", fit);
    return () => vv.removeEventListener("resize", fit);
  }, []);

  // A new page starts with nothing selected.
  useEffect(() => {
    setSel([]);
    setMulti(false);
    setGroup(false);
    setEditing(null);
  }, [current]);

  // keep `current` valid after undo removes pages
  useEffect(() => {
    if (current >= invite.pages.length) setCurrent(invite.pages.length - 1);
  }, [current, invite.pages.length]);

  // toasts disappear on their own
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  // ----- editing -----

  // Changes the current page. Always-shared settings change on every page;
  // settings ticked "Apply to this page and the ones after" also change the later pages.
  const update = useCallback(
    (patch: Partial<Page>) => {
      setInvite((inv) => {
        const pick = (keys: (keyof Page)[]) => Object.fromEntries(keys.filter((k) => k in patch).map((k) => [k, patch[k]])) as Partial<Page>;
        const everywhere = pick(ALWAYS_SAME);
        const forward = pick((Object.keys(SAME_KEYS) as (keyof SameEverywhere)[]).filter((f) => inv.same[f]).flatMap((f) => SAME_KEYS[f]));
        const pages = inv.pages.map((p, i) => (i === current ? { ...p, ...patch } : { ...p, ...everywhere, ...(i > current ? forward : {}) }));
        return { ...inv, pages };
      });
    },
    [current, setInvite],
  );

  // Ticking a box copies this page's setting to the pages after it (never the ones before).
  function setSame(flag: keyof SameEverywhere, on: boolean) {
    setInvite((inv) => {
      const source = inv.pages[current];
      const copy = Object.fromEntries(SAME_KEYS[flag].map((k) => [k, source[k]])) as Partial<Page>;
      return { ...inv, same: { ...inv.same, [flag]: on }, pages: on ? inv.pages.map((p, i) => (i > current ? { ...p, ...copy } : p)) : inv.pages };
    });
  }

  // Changes the given lines (the selected ones by default).
  const setBoxes = (fn: (b: TextBox) => TextBox, ids: string[] = sel) =>
    update({ boxes: page.boxes.map((b) => (ids.includes(b.id) ? fn(b) : b)) });
  const patchSel = (patch: Partial<TextBox>) => setBoxes((b) => ({ ...b, ...patch }));

  // "Apply to all text": this look on every line of every page (and for new lines).
  // "Use for all headings": one of the invite's fonts (heading / body / script), everywhere.
  // Lines in that group stop using their own font so they all follow it.
  function applyFontToSlot(font: string, slot: "heading" | "body" | "script", label: string) {
    const key = slot === "heading" ? "font" : slot === "body" ? "bodyFont" : "scriptFont";
    setInvite((inv) => ({
      ...inv,
      pages: inv.pages.map((p) => ({ ...p, [key]: font, boxes: p.boxes.map((b) => (fontSlot(b) === slot ? { ...b, font: undefined } : b)) })),
    }));
    setToast({ text: `${font} now used for ${label}`, undo: true });
  }

  function applyToAll(patch: Partial<TextBox>, label: string) {
    setInvite((inv) => ({
      ...inv,
      pages: inv.pages.map((p) => ({
        ...p,
        ...(patch.font ? { font: patch.font } : {}),
        ...(patch.bold !== undefined ? { bold: patch.bold } : {}),
        ...(patch.spacing !== undefined ? { lineSpacing: patch.spacing } : {}),
        boxes: p.boxes.map((b) => ({ ...b, ...patch })),
      })),
    }));
    setToast({ text: `${label} applied to all text`, undo: true });
  }

  // "Add text": a new line under the others, ready to type into.
  function addText() {
    const like = page.boxes[page.boxes.length - 1];
    const box: TextBox = { id: newId(), label: "Text", text: "Your text", size: "s", role: "body", color: like && like.color !== "accent" ? like.color : "text" };
    update({ boxes: [...page.boxes, box] });
    setSel([box.id]);
    setMulti(false);
    setEditing(box.id);
    setPanel("edit");
  }

  function duplicateSel() {
    const boxes: TextBox[] = [];
    const copies: string[] = [];
    for (const b of page.boxes) {
      boxes.push(b);
      if (sel.includes(b.id)) {
        const id = newId();
        copies.push(id);
        boxes.push({ ...b, id });
      }
    }
    update({ boxes });
    setSel(copies);
    setToast({ text: copies.length > 1 ? `${copies.length} lines copied` : "Line copied" });
  }

  function deleteSel() {
    const n = selBoxes.length;
    update({ ...(symbolSelected ? { symbol: "off" as const } : {}), boxes: page.boxes.filter((b) => !sel.includes(b.id)) });
    setSel([]);
    setMulti(false);
    setPanel(null);
    setToast({ text: symbolSelected && !n ? "Symbol hidden" : n > 1 ? `${n} lines deleted` : "Deleted", undo: true });
  }

  function select(ids: string[]) {
    setSel(ids);
    setGroup(false);
    if (!ids.length) setMulti(false);
    // a text panel stays open while switching lines; page panels close
    if (ids.length && panel && !TEXT_PANELS.includes(panel)) setPanel(null);
    // while typing, tapping another line types into that one
    if (panel === "edit" && ids.length === 1 && ids[0] !== SYMBOL_ID) setEditing(ids[0]);
    if (ids.length) tips.done("tap-text");
  }

  function deselect() {
    setSel([]);
    setGroup(false);
    setMulti(false);
    setEditing(null);
    if (TEXT_PANELS.includes(panel)) setPanel(null);
  }

  // The best palette for a surface colour: keep the current one if it still reads well.
  function paletteFor(surface: string, primary?: string) {
    const r = rankPalettes(PALETTES, surface, primary);
    const stillReadable = r.find((x) => x.palette.id === page.palette.id)?.readable ?? true;
    return stillReadable || page.palette.id === "custom" ? page.palette : r[0].palette;
  }

  function setBackground(src: string) {
    track("design_picked", { category: findBackground(src)?.category });
    const info = findBackground(src);
    if (info) update({ background: src, layout: lookFor(info).layout, palette: paletteFor(surfaceOf(page.colours, info), info.primary) });
    else update({ background: src });
  }

  function setColours(patch: Partial<BgColours>) {
    const colours = { ...page.colours, ...patch };
    update({ colours, palette: paletteFor(surfaceOf(colours, bg), bg?.primary) });
  }

  // ----- pages -----

  function addPage(kind: PageKind, event?: EventId) {
    if (invite.pages.length >= MAX_PAGES) return;
    const fresh = makePage(kind, page, event);
    setInvite((inv) => {
      const pages = [...inv.pages];
      pages.splice(current + 1, 0, fresh);
      return { ...inv, pages };
    });
    setCurrent(current + 1);
    setPanel(null);
  }

  function duplicateCurrent() {
    if (invite.pages.length >= MAX_PAGES) return;
    setInvite((inv) => {
      const pages = [...inv.pages];
      pages.splice(current + 1, 0, duplicatePage(inv.pages[current]));
      return { ...inv, pages };
    });
    setCurrent(current + 1);
    setPanel(null);
    setToast({ text: "Page copied" });
  }

  function movePage(from: number, to: number) {
    if (to < 0 || to >= invite.pages.length || from === to) return;
    setInvite((inv) => {
      const pages = [...inv.pages];
      const [p] = pages.splice(from, 1);
      pages.splice(to, 0, p);
      return { ...inv, pages };
    });
    setCurrent(to);
  }

  function deleteCurrent() {
    if (invite.pages.length <= 1) return;
    setInvite((inv) => ({ ...inv, pages: inv.pages.filter((_, i) => i !== current) }));
    setCurrent(Math.max(0, current - 1));
    setPanel(null);
    setToast({ text: "Page deleted", undo: true });
  }

  function startOver() {
    if (!window.confirm("Start a new invite? This clears the current one.")) return;
    history.reset(defaultInvite());
    setCurrent(0);
    setPanel(null);
  }

  // ----- preview, PNG, video -----

  function preview() {
    if (busy === "preview") {
      stopPreview.current = true;
      return;
    }
    deselect();
    setPanel(null);
    stopPreview.current = false;
    setBusy("preview");
    stopTrack();
    const stopMusic = invite.music.track ? playForVideo(invite.music.track, total, invite.music.volume) : () => {};
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      renderInvite(canvasRef.current!.getContext("2d")!, invite, Math.min(t, total));
      if (t < total && !stopPreview.current) requestAnimationFrame(tick);
      else {
        stopMusic();
        setBusy("");
      }
    };
    requestAnimationFrame(tick);
  }

  function downloadPng() {
    track("png_downloaded");
    renderPageAt(canvasRef.current!.getContext("2d")!, page, page.duration);
    canvasRef.current!.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `shaadi-invite-page-${current + 1}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    }, "image/png");
    setPanel(null);
  }

  async function makeVideo() {
    deselect();
    setPanel(null);
    setBusy("export");
    setError("");
    setProgress(0);
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    try {
      await Promise.all([...invite.pages.map((p) => loadImage(p.background)), ...invite.pages.flatMap((p) => motionAssets(p.animation)).map(loadImage)]);
      stopTrack();
      const music = invite.music.track ? musicFor(invite.music.track, total, invite.music.volume) : null;
      track("video_export_started", { pages: invite.pages.length, seconds: Math.round(total) });
      const startedAt = performance.now();
      const r = await exportVideo(canvasRef.current!, total, (c, t) => renderInvite(c, invite, t), setProgress, music);
      track("video_export_done", { seconds: Math.round(total), took: Math.round((performance.now() - startedAt) / 1000), events: invite.pages.filter((p) => p.event).map((p) => p.event) });
      setResult({ ...r, url: URL.createObjectURL(r.blob) });
      setShowResult(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      track("video_export_failed", { error: e instanceof Error ? e.message.slice(0, 120) : "unknown" });
    } finally {
      setBusy("");
    }
  }

  // ----- music -----

  const setMusic = (patch: Partial<Invite["music"]>) => setInvite((inv) => ({ ...inv, music: { ...inv.music, ...patch } }));

  function toggleTrack(id: string) {
    const wasPlaying = playingTrack === id;
    stopTrack();
    if (wasPlaying) return;
    stopTrackRef.current = playTrack(id, invite.music.volume);
    setPlayingTrack(id);
  }

  function stopTrack() {
    stopTrackRef.current?.();
    stopTrackRef.current = null;
    setPlayingTrack(null);
  }

  // leaving the music panel stops the sample
  useEffect(() => {
    if (panel !== "music") stopTrack();
  }, [panel]);

  // ----- keyboard (computers) -----

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement).closest("input, textarea, select");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        if (e.shiftKey) history.redo();
        else history.undo();
      } else if ((e.key === "Delete" || e.key === "Backspace") && !typing && sel.length) {
        e.preventDefault();
        deleteSel();
      } else if (e.key === "Escape") {
        if (panel) setPanel(null);
        else deselect();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // ----- previews of animations and transitions -----

  const animationDraws = useMemo(() => {
    const out = {} as Record<AnimationId, (c: CanvasRenderingContext2D, t: number) => void>;
    for (const a of ANIMATIONS) {
      const p = { ...page, animation: a.id };
      const cycle = p.duration + 1;
      out[a.id] = (c, t) => renderPageAt(c, p, Math.min(t % cycle, p.duration));
    }
    return out;
  }, [page]);

  const transitionDraws = useMemo(() => {
    const out = {} as Record<TransitionId, (c: CanvasRenderingContext2D, t: number) => void>;
    for (const tr of TRANSITIONS) {
      const len = transitionLength(tr.id);
      const hold = 0.7;
      const cycle = hold + len + 2.5;
      out[tr.id] = (c, t) => {
        const u = t % cycle;
        if (u < hold) renderPageAt(c, page, page.duration);
        else if (u < hold + len) renderTransition(c, page, page.duration, nextPage, u - hold, tr.id, (u - hold) / len);
        else renderPageAt(c, nextPage, u - hold);
      };
    }
    return out;
  }, [page, nextPage]);

  // ----- small pieces of UI -----

  // the design library section shown: the event's designs first, else the current design's
  const shownCategory = category ?? eventLook?.category ?? bg?.category ?? "peacocks";
  const categories = CATEGORY_LABELS.filter((c) => BACKGROUNDS.some((b) => b.category === c.id));
  const firstLine = firstSel?.text.split("\n")[0] ?? "";
  const selText = group ? "Everything on this page" : selBoxes.length > 1 ? `${selBoxes.length} lines` : firstSel ? `“${firstLine.slice(0, 22)}${firstLine.length > 22 ? "…" : ""}”` : "";
  const sampleText = firstLine.slice(0, 28) || "Rohan & Aishwarya";
  // the size a line is actually drawn at (after fitting), and setting a new one
  // the size a line is set to (the page may show it a little smaller to fit; see `fit`)
  const selSize = firstSel ? Math.round(designSize(firstSel)) : 0;
  // several lines keep their sizes relative to each other (the first one gets the number)
  const setSize = (n: number) => {
    const factor = selSize ? n / designSize(firstSel) : 1;
    setBoxes((b) => ({ ...b, px: Math.max(8, Math.round(designSize(b) * factor)), scale: undefined }));
  };
  const selLook = firstSel ? lineLook(firstSel, page) : null;
  const slot = firstSel ? fontSlot(firstSel) : "heading";
  const slotName = slot === "heading" ? "all headings & names" : slot === "body" ? "all details & messages" : "all script text";
  // picking a style: the line takes that look cleanly (its own size, font and touches are reset)
  const setRole = (role: TextRole) =>
    setBoxes((b) => ({ ...b, role, px: undefined, scale: undefined, font: undefined, bold: undefined, italic: undefined, caps: undefined, tracking: undefined }));

  const selSpacing = firstSel?.spacing ?? page.lineSpacing ?? DEFAULT_LINE_SPACING;
  const selFont = selLook?.font ?? page.font;
  const editBox = page.boxes.find((b) => b.id === editing);
  const initials = page.initials ?? DEFAULT_INITIALS;
  const suggestion = editBox ? guessRole(editBox.text) : null;

  // one tip at a time, in order
  const tip =
    !ready || locked || panel
      ? null
      : mode === "page" && invite.pages.length > 1 && tips.show("pages")
        ? "pages"
        : null;

  const panelTitle: Record<Exclude<Panel, null>, string> = {
    design: "Design",
    colours: "Colours",
    symbol: "Symbol",
    motion: "Motion",
    music: "Music",
    font: "Font",
    size: "Size",
    tcolour: "Text colour",
    style: "Style",
    edit: "Edit text",
    add: "Add a page",
    pagemenu: `${titles[current]} · page ${current + 1}`,
    more: "More",
  };

  type ToolId = Panel | "dup" | "del" | "edit-now" | "add-text";
  const toolbar: { id: ToolId; icon: string; name: string }[] =
    mode === "text"
      ? [
          ...(selBoxes.length === 1 ? [{ id: "edit-now" as const, icon: "✎", name: "Edit" }] : []),
          { id: "font", icon: "Aa", name: "Font" },
          { id: "size", icon: "↕", name: "Size" },
          { id: "tcolour", icon: "●", name: "Colour" },
          { id: "style", icon: "B", name: "Style" },
          ...(group
            ? []
            : [
                { id: "dup" as const, icon: "⧉", name: "Copy" },
                { id: "del" as const, icon: "🗑", name: "Delete" },
              ]),
        ]
      : mode === "symbol"
        ? [
            { id: "symbol", icon: "ॐ", name: "Change" },
            { id: "del", icon: "🗑", name: "Remove" },
          ]
        : [
            { id: "design", icon: "▦", name: "Design" },
            { id: "colours", icon: "◐", name: "Colours" },
            { id: "add-text", icon: "T", name: "Add text" },
            { id: "symbol", icon: "ॐ", name: "Symbol" },
            { id: "motion", icon: "✦", name: "Motion" },
            { id: "music", icon: "♪", name: "Music" },
          ];

  function onTool(id: ToolId) {
    if (id === "dup") return duplicateSel();
    if (id === "del") return deleteSel();
    if (id === "add-text") return addText();
    if (id === "edit-now") {
      setEditing(firstSel.id);
      setPanel("edit");
      return;
    }
    setPanel(panel === id ? null : id);
  }

  const tall = TALL_PANELS.includes(panel);
  // the floating preview: the page as it ends, or playing its motion while choosing one
  const pipDraw = (c: CanvasRenderingContext2D, t: number) =>
    renderPageAt(c, page, panel === "motion" ? Math.min(t % (page.duration + 1), page.duration) : page.duration);

  function closePanel() {
    setPanel(null);
    setEditing(null);
  }

  return (
    // the frame never scrolls (focusing a text box can try to scroll it on phones)
    <main className={"editor" + (tall ? " tall" : "")} onScroll={(e) => (e.currentTarget.scrollTop = 0)}>
      {/* ---------- Top bar ---------- */}
      <header className="topbar">
        <div className="brand">
          <span className="brand-hi">शादी</span>
          <span className="brand-en">Video Maker</span>
        </div>
        <div className="topbar-mid">
          <button className="icon-btn labelled" onClick={history.undo} disabled={!history.canUndo || locked} aria-label="Undo" title="Undo">
            <span>↶</span>
            <small>Undo</small>
          </button>
          <button className="icon-btn labelled" onClick={history.redo} disabled={!history.canRedo || locked} aria-label="Redo" title="Redo">
            <span>↷</span>
            <small>Redo</small>
          </button>
        </div>
        <div className="topbar-right">
          <button className="icon-btn labelled" onClick={() => setPanel(panel === "more" ? null : "more")} disabled={locked} aria-label="More options">
            <span>⋯</span>
            <small>More</small>
          </button>
          <button className="icon-btn labelled play" onClick={preview} disabled={!ready || busy === "export"} aria-label={busy === "preview" ? "Stop preview" : "Play preview"}>
            <span>{busy === "preview" ? "■" : "▶"}</span>
            <small>{busy === "preview" ? "Stop" : "Play"}</small>
          </button>
          <button className="export-btn" onClick={makeVideo} disabled={!ready || locked}>
            {busy === "export" ? `${Math.round(progress * 100)}%` : "Export"}
          </button>
        </div>
      </header>

      {/* ---------- Canvas ---------- */}
      <div
        className="canvas-area"
        ref={areaRef}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) deselect();
        }}
      >
        <div className="stage" style={{ width: stageSize.w, height: stageSize.h }}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onPointerDown={() => {
              if (busy === "preview") stopPreview.current = true;
              else deselect();
            }}
          />
          {ready && !locked && (
            <TextOverlay
              rects={boxRects}
              items={overlayItems}
              area={area}
              selected={sel}
              multi={multi}
              group={group}
              groupScale={page.textScale}
              onSelect={select}
              onGroup={() => {
                setSel(overlayItems.map((it) => it.id));
                setGroup(true);
                if (panel && !TEXT_PANELS.includes(panel)) setPanel(null);
                tips.done("tap-text");
              }}
              onGroupScale={(s) => update({ textScale: s })}
              onHold={(id) => {
                setGroup(false);
                setMulti(true);
                setSel((s) => (s.includes(id) ? s : [...s, id]));
                tips.done("tap-text");
              }}
              onMove={(moves) => {
                const m = new Map(moves.map((x) => [x.id, x]));
                const sym = m.get(SYMBOL_ID);
                update({
                  ...(sym ? { symbolDx: sym.dx, symbolDy: sym.dy } : {}),
                  boxes: page.boxes.map((b) => (m.has(b.id) ? { ...b, dx: m.get(b.id)!.dx, dy: m.get(b.id)!.dy } : b)),
                });
                tips.done("drag");
              }}
              onScale={(id, scale) =>
                id === SYMBOL_ID ? update({ symbolScale: scale }) : setBoxes((b) => ({ ...b, px: Math.round(baseSize(b) * scale), scale: undefined }), [id])
              }
              onEdit={(id) => {
                setEditing(id);
                setPanel("edit");
              }}
              onDragging={setDragging}
            />
          )}
          {busy === "preview" && <div className="playing-hint">Tap to stop</div>}
        </div>

        {/* smart help */}
        {!locked && !dragging && offDesign.length > 0 && !panel && !sel.length && (
          <button className="nudge" onClick={() => setBoxes((b) => ({ ...b, dx: 0, dy: 0 }), offDesign.map((r) => r.id))}>
            ✨ Text is sitting on the design · <b>Fit it</b>
          </button>
        )}
        {multi && (
          <div className="multi-bar">
            <span>{sel.length} picked</span>
            <button onClick={() => setSel(page.boxes.map((b) => b.id))}>Select all</button>
            <button onClick={deselect}>Done</button>
          </div>
        )}
      </div>

      {/* ---------- What you can do right now ---------- */}
      {ready && !locked && !multi && (
        <p className="context" key={"ctx-" + mode}>
          {group
            ? "Drag to move all · Pull ⤢ to resize · Tap a line to edit it"
            : mode === "text"
            ? "Drag to move · Pull ⤢ to resize · Tap again to type"
            : mode === "symbol"
              ? "Drag to move · Pull ⤢ or pinch to resize"
              : fit < 0.8
                ? "Lots of text here, so it's shrunk to fit · Move a few lines to another page"
                : "Tap the text to move or resize it all · Hold to pick several"}
        </p>
      )}

      {/* ---------- Pages ---------- */}
      {!panel && (
        <div className="strip-wrap">
          {tip === "pages" && (
            <Tip className="tip-strip" text={<>Hold a page and slide it to reorder. Tap the open page to copy or delete it.</>} onDone={() => tips.done("pages")} />
          )}
          <PageStrip
            pages={invite.pages}
            titles={titles}
            current={current}
            tick={assetTick}
            canAdd={invite.pages.length < MAX_PAGES}
            disabled={locked}
            onGo={setCurrent}
            onMenu={() => setPanel("pagemenu")}
            onMove={movePage}
            onAdd={() => setPanel("add")}
          />
        </div>
      )}

      {/* ---------- Panel ---------- */}
      {panel && (
        <section className={"panel panel-" + panel} key={"panel-" + panel}>
          <div className="panel-head">
            <span className="panel-title">{panelTitle[panel]}</span>
            {mode === "text" && TEXT_PANELS.includes(panel) && panel !== "edit" && <span className="panel-sub">{selText}</span>}
            <button className="panel-done" onClick={closePanel}>
              Done
            </button>
          </div>
          {PANEL_DESC[panel] && <p className="panel-desc">✦ {PANEL_DESC[panel]}</p>}
          <div className="panel-body">
            {/* ----- Design ----- */}
            {panel === "design" && (
              <>
                <Label title="Designs" desc={eventLook ? `★ marks designs that suit ${titles[current]}` : "Tap a design to use it on this page"} />
                <div className="cat-row">
                  {eventLook && (
                    <button className={"chip suggested" + (shownCategory === eventLook.category ? " on" : "")} onClick={() => setCategory(eventLook.category)}>
                      ★ For {titles[current]}
                    </button>
                  )}
                  {categories
                    .filter((c) => c.id !== eventLook?.category)
                    .map((c) => (
                      <button key={c.id} className={"chip" + (shownCategory === c.id ? " on" : "")} onClick={() => setCategory(c.id)}>
                        {c.name}
                      </button>
                    ))}
                </div>
                <div className="lib-grid">
                  {BACKGROUNDS.filter((b) => b.category === shownCategory).map((b) => (
                    <BgThumb key={b.id} b={b} star={!!eventLook && b.category === eventLook.category} on={b.src === page.background} onPick={() => setBackground(b.src)} />
                  ))}
                </div>
                <Slider label="Zoom" desc="Zoom in to push the artwork away from your text" min={0.6} max={1.6} step={0.05} value={page.bgZoom} onChange={(v) => update({ bgZoom: v })} show={`${Math.round(page.bgZoom * 100)}%`} />
                <SameBox checked={invite.same.background} onChange={(on) => setSame("background", on)} />
              </>
            )}

            {/* ----- Colours ----- */}
            {panel === "colours" && (
              <>
                <Label title="Themes" desc={eventLook ? "One tap changes the paper colour · the artwork keeps its colours · ★ matches this event" : "One tap changes the paper colour · the artwork keeps its colours"} />
                <div className="chips">
                  {THEMES.map((t) => (
                    <button key={t.name} className={"chip chip-theme" + (eventLook?.theme === t.name ? " suggested" : "")} onClick={() => setColours({ paper: t.colours.paper })}>
                      <span className="swatch" style={{ background: t.colours.paper! }} />
                      {t.name}
                      {eventLook?.theme === t.name && <em className="tag">★ for this event</em>}
                    </button>
                  ))}
                  <button className="chip" onClick={() => setColours({ paper: ORIGINAL_COLOURS.paper })}>
                    ↺ Original
                  </button>
                </div>
                <Label title="Paper" desc="The plain colour behind the artwork" />
                <div className="swatches">
                  <Swatch value={null} on={page.colours.paper === null} original={bg?.paper} onPick={() => setColours({ paper: null })} name="Original" />
                  {PAPER_COLOURS.map((s) => (
                    <Swatch key={s.color} value={s.color} on={page.colours.paper === s.color} onPick={() => setColours({ paper: s.color })} name={s.name} />
                  ))}
                  <label className="swatch-btn swatch-custom" title="Any colour">
                    <input type="color" value={page.colours.paper ?? bg?.paper ?? "#ffffff"} onChange={(e) => setColours({ paper: e.target.value })} aria-label="Any background colour" />
                  </label>
                </div>
                <Label title="Artwork" desc="The flowers, borders and patterns" />
                <div className="swatches">
                  <Swatch value={null} on={page.colours.design === null} original={bg?.primary} onPick={() => setColours({ design: null })} name="Original" />
                  {DESIGN_COLOURS.map((s) => (
                    <Swatch key={s.color} value={s.color} on={page.colours.design === s.color} onPick={() => setColours({ design: s.color })} name={s.name} />
                  ))}
                  <label className="swatch-btn swatch-custom" title="Any colour">
                    <input type="color" value={page.colours.design ?? bg?.primary ?? "#c9a03a"} onChange={(e) => setColours({ design: e.target.value })} aria-label="Any design colour" />
                  </label>
                </div>
                <Slider label="Artwork strength" desc="Lower makes the artwork softer and lighter" min={0.2} max={1} step={0.05} value={page.colours.opacity} onChange={(v) => setColours({ opacity: v })} show={`${Math.round(page.colours.opacity * 100)}%`} />
                <Label title="Text colours" desc="Colours for your words · ★ easiest to read on this paper" />
                <div className="chips">
                  {ranked.slice(0, 8).map(({ palette: p, recommended: rec, readable }) => (
                    <button key={p.id} className={"chip chip-palette" + (p.id === page.palette.id ? " on" : "") + (readable ? "" : " dim")} onClick={() => update({ palette: p })}>
                      <span className="swatch" style={{ background: p.text }} />
                      <span className="swatch" style={{ background: p.accent }} />
                      {p.name}
                      {rec && <em className="tag">★</em>}
                    </button>
                  ))}
                </div>
                <SameBox checked={invite.same.background} onChange={(on) => setSame("background", on)} />
              </>
            )}

            {/* ----- Edit one line ----- */}
            {panel === "edit" && editBox && (
              <div className="edit-box">
                <textarea
                  key={editBox.id}
                  autoFocus
                  value={editBox.text}
                  rows={Math.min(4, Math.max(2, editBox.text.split("\n").length))}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) => setBoxes((x) => ({ ...x, text: e.target.value }), [editBox.id])}
                  style={{ fontFamily: `"${lineLook(editBox, page).font}", serif` }}
                  aria-label="Text"
                />
                {suggestion && suggestion !== editBox.role && (
                  <button className="suggest-chip" onClick={() => setBoxes((b) => ({ ...b, role: suggestion, px: undefined, scale: undefined, italic: undefined, caps: undefined, tracking: undefined, bold: undefined }), [editBox.id])}>
                    ✨ Looks like {ROLES[suggestion].name.toLowerCase()} · <b>Style it that way</b>
                  </button>
                )}
                <p className="sec-desc">Tap another line on the page to type into that one.</p>
              </div>
            )}

            {/* ----- Font ----- */}
            {panel === "font" && firstSel && (
              <>
                <button className="apply-all" onClick={() => applyFontToSlot(selFont, slot, slotName)}>
                  Use <b style={{ fontFamily: `"${selFont}", serif` }}>{selFont}</b> for {slotName}
                </button>
                <button className="link-btn" onClick={() => applyToAll({ font: selFont }, selFont)}>
                  or for all text
                </button>
                <div className="font-list">
                  {FONTS.map((f) => (
                    <button key={f.id} className={"font-row" + (f.family === selFont ? " on" : "")} onClick={() => patchSel({ font: f.family })}>
                      <span className="font-sample" style={{ fontFamily: `"${f.family}", serif` }}>
                        {sampleText}
                      </span>
                      <span className="font-name">{f.family}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ----- Size ----- */}
            {panel === "size" && group && (
              <Slider
                label="Size of everything"
                desc="Makes the symbol and all the text bigger or smaller together"
                min={0.4}
                max={2.5}
                step={0.05}
                value={page.textScale}
                onChange={(v) => update({ textScale: v })}
                show={`${Math.round(page.textScale * 100)}%`}
              />
            )}
            {panel === "size" && firstSel && !group && (
              <>
              <Label title="Font size" desc={selBoxes.length > 1 ? "Bigger number, bigger text · the lines keep their sizes relative to each other" : "Bigger number, bigger text"} />
              <div className="size-row">
                <input
                  type="range"
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  step={1}
                  value={Math.min(MAX_SIZE, Math.max(MIN_SIZE, selSize))}
                  onChange={(e) => setSize(Number(e.target.value))}
                  aria-label="Font size"
                />
                <input
                  className="size-num"
                  type="number"
                  inputMode="numeric"
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  value={selSize}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (n >= MIN_SIZE && n <= MAX_SIZE) setSize(n);
                  }}
                  aria-label="Font size number"
                />
              </div>
              {fit < 0.97 && (
                <p className="fit-note">
                  Shown at {Math.round(fit * 100)}% so all the text fits inside the design.{" "}
                  {fit < 0.8 ? "Lots of text on this page: try moving a few lines to another page." : ""}
                </p>
              )}
              </>
            )}

            {/* ----- Text colour ----- */}
            {panel === "tcolour" && firstSel && (
              <>
                <div className="swatches">
                  <Swatch value={page.palette.text} on={firstSel.color === "text"} onPick={() => patchSel({ color: "text" })} name="Main colour" />
                  <Swatch value={page.palette.accent} on={firstSel.color === "accent"} onPick={() => patchSel({ color: "accent" })} name="Accent colour" />
                  {TEXT_SWATCHES.map((c) => (
                    <Swatch key={c} value={c} on={firstSel.color === c} onPick={() => patchSel({ color: c })} name={c} />
                  ))}
                  <label className="swatch-btn swatch-custom" title="Any colour">
                    <input type="color" value={boxColor(firstSel, page)} onChange={(e) => patchSel({ color: e.target.value })} aria-label="Any text colour" />
                  </label>
                </div>
                <button className="apply-all" onClick={() => applyToAll({ color: firstSel.color }, "Colour")}>
                  Apply this colour to all text
                </button>
              </>
            )}

            {/* ----- Style ----- */}
            {panel === "style" && firstSel && selLook && (
              <>
                <Label title="What is this line?" desc="Each kind of line has a matching look, like a printed card" />
                <div className="role-grid">
                  {ROLE_ORDER.map((r) => {
                    const st = ROLES[r];
                    const fam = st.font === "heading" ? page.font : st.font === "body" ? page.bodyFont ?? "Cormorant Garamond" : page.scriptFont ?? "Pinyon Script";
                    return (
                      <button key={r} className={"role-chip" + (firstSel.role === r ? " on" : "")} onClick={() => setRole(r)}>
                        <span
                          style={{
                            fontFamily: `"${fam}", serif`,
                            fontStyle: st.italic ? "italic" : "normal",
                            fontWeight: st.bold ? 700 : 400,
                            textTransform: st.caps ? "uppercase" : "none",
                            letterSpacing: `${st.tracking}em`,
                          }}
                        >
                          {st.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <Label title="Touches" />
                <div className="format-row">
                  <button className={selLook.bold ? "on" : ""} onClick={() => patchSel({ bold: !selLook.bold })} aria-label="Bold" title="Bold">
                    <b>B</b>
                  </button>
                  <button className={selLook.italic ? "on" : ""} onClick={() => patchSel({ italic: !selLook.italic })} aria-label="Italic" title="Italic">
                    <i style={{ fontFamily: "Georgia, serif" }}>I</i>
                  </button>
                  <button className={selLook.caps ? "on" : ""} onClick={() => patchSel({ caps: !selLook.caps })} aria-label="Capitals" title="Capitals">
                    AA
                  </button>
                  <span className="format-sep" />
                  {(["left", "center", "right"] as const).map((al) => (
                    <button key={al} className={selLook.align === al ? "on" : ""} onClick={() => patchSel({ align: al })} aria-label={`Align ${al}`} title={`Align ${al}`}>
                      <span className={"align-icon " + al}>
                        <i />
                        <i />
                        <i />
                      </span>
                    </button>
                  ))}
                </div>
                <Slider
                  label="Letter spacing"
                  desc="Space between letters · capitals look best a little apart"
                  min={0}
                  max={0.3}
                  step={0.01}
                  value={selLook.tracking}
                  onChange={(v) => patchSel({ tracking: v })}
                  show={selLook.tracking.toFixed(2)}
                />
                <Slider label="Line spacing" desc="The gap between lines of the same text" min={0.9} max={1.8} step={0.05} value={selSpacing} onChange={(v) => patchSel({ spacing: v })} show={selSpacing.toFixed(2)} />
              </>
            )}

            {/* ----- Symbol ----- */}
            {panel === "symbol" && (
              <>
                <button className={"chip none-chip" + (page.symbol === "off" ? " on" : "")} onClick={() => update({ symbol: "off" })}>
                  ∅ No symbol on this page
                </button>
                {(
                  [
                    ["ganesh", "Ganesh ji"],
                    ["om", "Om"],
                    ["mono", "Initials"],
                  ] as const
                ).map(([group, label]) => (
                  <div key={group}>
                    <Label
                      title={label}
                      desc={group === "mono" ? "Type the couple’s initials, then pick a style" : group === "om" ? "The sacred Om sign" : "Lord Ganesh, for a blessed start"}
                    />
                    {group === "mono" && (
                      <div className="initials-row">
                        {[0, 1].map((i) => (
                          <input
                            key={i}
                            value={initials[i]}
                            maxLength={2}
                            autoCapitalize="characters"
                            onFocus={(e) => e.currentTarget.select()}
                            onChange={(e) => {
                              const next: [string, string] = [...initials];
                              next[i] = e.target.value.toUpperCase();
                              update({ initials: next, ...(page.symbolStyle.startsWith("mono-") ? {} : { symbolStyle: "mono-classic", symbol: page.symbol === "off" ? "small" : page.symbol }) });
                            }}
                            aria-label={i === 0 ? "First initial" : "Second initial"}
                          />
                        ))}
                      </div>
                    )}
                    <div className="mono-grid">
                      {SYMBOL_STYLES.filter((m) => m.id.startsWith(group + "-")).map((m) => (
                        <button
                          key={m.id}
                          className={"mono-tile" + (page.symbol !== "off" && m.id === page.symbolStyle ? " on" : "")}
                          onClick={() => update({ symbolStyle: m.id, symbol: page.symbol === "off" ? "small" : page.symbol })}
                        >
                          {ready && <SymbolTile page={page} style={m.id} surface={surface} />}
                          <span>{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ----- Motion ----- */}
            {panel === "motion" && (
              <>
                <Label title="Text animation" desc="How your words appear · tap one to preview" />
                <div className="scroller">
                  {ANIMATIONS.map((a) => (
                    <button key={a.id} className={"motion" + (a.id === page.animation ? " on" : "")} onClick={() => setPreviewing({ kind: "animation", id: a.id })}>
                      {ready && <MiniPreview draw={animationDraws[a.id]} playing={false} still={page.duration * 0.4} />}
                      <span>{a.name}</span>
                    </button>
                  ))}
                </div>
                <SameBox checked={invite.same.animation} onChange={(on) => setSame("animation", on)} />
                <Label title="Between pages" desc="The effect when one page changes to the next · used for every page" />
                <div className="scroller">
                  {TRANSITIONS.map((tr) => (
                    <button key={tr.id} className={"motion" + (tr.id === page.transition ? " on" : "")} onClick={() => setPreviewing({ kind: "transition", id: tr.id })}>
                      {ready && <MiniPreview draw={transitionDraws[tr.id]} playing={false} still={0.7 + transitionLength(tr.id) * 0.42} />}
                      <span>{tr.name}</span>
                    </button>
                  ))}
                </div>
                <Label title="Page length" desc="Seconds each page stays on screen" />
                <div className="segmented">
                  {DURATIONS.map((d) => (
                    <button key={d} className={d === page.duration ? "on" : ""} onClick={() => update({ duration: d })}>
                      {d}s
                    </button>
                  ))}
                </div>
                <SameBox checked={invite.same.duration} onChange={(on) => setSame("duration", on)} />
              </>
            )}

            {/* ----- Music ----- */}
            {panel === "music" && (
              <>
                <button className={"lib-row" + (invite.music.track === null ? " on" : "")} onClick={() => setMusic({ track: null })}>
                  <span className="play-btn play-none">–</span>
                  <span className="lib-row-name">No music</span>
                </button>
                {MUSIC.map((m) => (
                  <div key={m.id} className={"lib-row track" + (invite.music.track === m.id ? " on" : "")} onClick={() => setMusic({ track: m.id })}>
                    <button
                      className={"play-btn" + (playingTrack === m.id ? " playing" : "")}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTrack(m.id);
                      }}
                      aria-label={playingTrack === m.id ? `Stop ${m.name}` : `Play ${m.name}`}
                    >
                      {playingTrack === m.id ? "■" : "▶"}
                    </button>
                    <span className="lib-row-name">{m.name}</span>
                    <em className="tag">{m.mood}</em>
                  </div>
                ))}
                <Slider label="Volume" desc="How loud the music plays in the video" min={0.1} max={1} step={0.05} value={invite.music.volume} onChange={(v) => setMusic({ volume: v })} show={`${Math.round(invite.music.volume * 100)}%`} />
              </>
            )}

            {/* ----- Add a page ----- */}
            {panel === "add" && (
              <>
                <Label title="Events" desc="Ready-made text for each function" />
                <div className="kind-grid">
                  {EVENTS.map((e) => {
                    const theme = THEMES.find((t) => t.name === EVENT_LOOK[e.id].theme)!;
                    return (
                      <button key={e.id} className="kind-card" onClick={() => addPage("event", e.id)}>
                        <span className="kind-swatch" style={{ background: `linear-gradient(135deg, ${theme.colours.paper} 50%, ${theme.colours.design} 50%)` }} />
                        {e.info.name}
                      </button>
                    );
                  })}
                </div>
                <Label title="Other pages" desc="An opening, the main invitation, a thank you, or a blank page" />
                <div className="kind-grid">
                  {(
                    [
                      ["intro", "Intro"],
                      ["invite", "Invitation"],
                      ["outro", "Thank you"],
                      ["custom", "Blank"],
                    ] as [PageKind, string][]
                  ).map(([k, name]) => (
                    <button key={k} className="kind-card" onClick={() => addPage(k)}>
                      {name}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ----- Page menu ----- */}
            {panel === "pagemenu" && (
              <div className="menu-grid">
                <button onClick={duplicateCurrent} disabled={invite.pages.length >= MAX_PAGES}>
                  <span>⧉</span>Copy page
                </button>
                <button onClick={deleteCurrent} disabled={invite.pages.length <= 1}>
                  <span>🗑</span>Delete
                </button>
              </div>
            )}

            {/* ----- More ----- */}
            {panel === "more" && (
              <div className="menu-grid">
                <button onClick={downloadPng}>
                  <span>⤓</span>Page as PNG
                </button>
                {result && (
                  <button
                    onClick={() => {
                      setShowResult(true);
                      setPanel(null);
                    }}
                  >
                    <span>▶</span>Last video
                  </button>
                )}
                <button onClick={startOver}>
                  <span>✚</span>New invite
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ---------- Floating preview (while a tall panel covers the page) ---------- */}
      {tall && ready && (
        <button className="pip" onClick={closePanel} aria-label="Back to the page" title="Back to the page">
          <MiniPreview key={assetTick} draw={pipDraw} width={128} playing={panel === "motion"} still={page.duration} />
        </button>
      )}

      {/* ---------- Toolbar ---------- */}
      <nav className={"toolbar toolbar-" + mode} key={"tools-" + mode}>
        {toolbar.map((t) => (
          <button key={t.id} className={"tool" + (panel === t.id ? " on" : "")} onClick={() => onTool(t.id)} disabled={locked || !ready}>
            <span className="tool-icon">{t.icon}</span>
            <span className="tool-name">{t.name}</span>
          </button>
        ))}
      </nav>

      {/* ---------- Toast ---------- */}
      {toast && (
        <div className="toast-pop" role="status">
          {toast.text}
          {toast.undo && (
            <button
              onClick={() => {
                history.undo();
                setToast(null);
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
      {error && (
        <div className="toast-pop error" role="alert" onClick={() => setError("")}>
          {error}
        </div>
      )}

      {/* ---------- Exporting ---------- */}
      {busy === "export" && (
        <div className="modal-backdrop">
          <div className="modal export-modal">
            <span className="label">◆ Making your video ◆</span>
            <div className="progress">
              <div style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <p className="note">
              {Math.round(progress * 100)}% · {Math.round(total)}s, {invite.pages.length} page{invite.pages.length > 1 ? "s" : ""}. Keep this tab open.
            </p>
          </div>
        </div>
      )}

      {/* ---------- Finished video ---------- */}
      {showResult && result && (
        <div className="modal-backdrop" onClick={() => setShowResult(false)}>
          <div className="modal result-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <span className="label" style={{ margin: 0 }}>
                ◆ Your video is ready ◆
              </span>
              <button className="mini" onClick={() => setShowResult(false)} aria-label="Close">
                ×
              </button>
            </div>
            <video src={result.url} controls playsInline loop />
            <a className="btn" href={result.url} download={`shaadi-invite.${result.extension}`}>
              Download .{result.extension}
            </a>
            <p className="note">
              {result.method} · {(result.blob.size / 1024 / 1024).toFixed(1)} MB
              {invite.music.track && !result.withMusic ? " · music couldn't be added on this browser" : ""}
            </p>
          </div>
        </div>
      )}

      {/* ---------- Animation / transition preview ---------- */}
      {previewing && (
        <PreviewModal
          title={previewing.kind === "animation" ? ANIMATIONS.find((a) => a.id === previewing.id)!.name : TRANSITIONS.find((t) => t.id === previewing.id)!.name}
          draw={previewing.kind === "animation" ? animationDraws[previewing.id] : transitionDraws[previewing.id]}
          selected={previewing.kind === "animation" ? page.animation === previewing.id : page.transition === previewing.id}
          onUse={() => {
            update(previewing.kind === "animation" ? { animation: previewing.id } : { transition: previewing.id });
            setPreviewing(null);
          }}
          onClose={() => setPreviewing(null)}
        />
      )}
    </main>
  );
}
