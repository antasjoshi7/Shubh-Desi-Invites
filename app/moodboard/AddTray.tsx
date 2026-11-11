"use client";

// After picking photos: a tray that asks the two things the board needs to stay organised,
// "which event is this for?" and "what does it show?", one tap each. Videos (a saved reel, a
// screen recording) open a scrubber first, to pick the frames worth keeping.

import { useEffect, useRef, useState } from "react";
import { grabFrame, ingest, type Ingested } from "@/lib/moodboard/image";
import { hashDistance } from "@/lib/moodboard/palette";
import { TYPES, uid, type CardType, type EventDef } from "@/lib/moodboard/types";
import { Chips, Icon, Sheet, cls } from "./parts";

export type NewCard = Ingested & { eventId: string; type: CardType };

type Item = {
  key: string;
  state: "work" | "ready" | "error";
  out?: Ingested;
  url?: string;
  eventId?: string;
  type?: CardType;
  sel: boolean;
  dup: boolean;
};

export default function AddTray(p: {
  files: File[];
  events: EventDef[];
  defaultEvent?: string;
  hashes: string[];
  onAdd: (cards: NewCard[]) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [open, setOpen] = useState(true);
  const seen = useRef<string[]>([...p.hashes]);
  const close = () => { setOpen(false); window.setTimeout(p.onClose, 260); };

  const take = async (key: string, blob: Blob, alive: () => boolean = () => true) => {
    try {
      const out = await ingest(blob);
      if (!alive()) return; // this batch was replaced while the photo was being read
      const dup = seen.current.some((h) => hashDistance(h, out.hash) <= 4);
      seen.current.push(out.hash);
      const url = URL.createObjectURL(out.thumb);
      setItems((list) => list.map((it) => (it.key === key ? { ...it, state: "ready", out, url, dup, sel: !dup } : it)));
    } catch {
      setItems((list) => list.map((it) => (it.key === key ? { ...it, state: "error", sel: false } : it)));
    }
  };

  useEffect(() => {
    let live = true;
    seen.current = [...p.hashes];
    const pics = p.files.filter((f) => !f.type.startsWith("video/"));
    setVideos(p.files.filter((f) => f.type.startsWith("video/")));
    const fresh: Item[] = pics.map(() => ({ key: uid(), state: "work", sel: true, dup: false, eventId: p.defaultEvent }));
    setItems(fresh);
    (async () => {
      // one at a time: big photos decoded together can run a phone out of memory
      for (let i = 0; i < pics.length && live; i++) await take(fresh[i].key, pics[i], () => live);
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.files]);

  const usable = items.filter((it) => it.state === "ready" && !it.dup);
  const working = items.some((it) => it.state === "work");
  const chosen = usable.filter((it) => it.sel);
  const target = chosen.length ? chosen : usable;
  const untagged = usable.filter((it) => !it.eventId || !it.type).length;

  const apply = (patch: Partial<Item>) => {
    setItems((list) => {
      const keys = new Set(target.map((t) => t.key));
      let next = list.map((it) => (keys.has(it.key) ? { ...it, ...patch } : it));
      // once the ticked ones are fully tagged, move the ticks to whatever is still untagged
      const done = next.filter((it) => keys.has(it.key)).every((it) => it.eventId && it.type);
      const rest = next.filter((it) => it.state === "ready" && !it.dup && (!it.eventId || !it.type));
      if (done && rest.length) next = next.map((it) => ({ ...it, sel: rest.some((r) => r.key === it.key) }));
      return next;
    });
  };
  const same = <K extends "eventId" | "type">(k: K): Item[K] | undefined => (target.length && target.every((t) => t[k] === target[0][k]) ? target[0][k] : undefined);

  const add = () => {
    const cards = usable.filter((it) => it.out && it.eventId && it.type).map((it) => ({ ...it.out!, eventId: it.eventId!, type: it.type! }));
    items.forEach((it) => it.url && URL.revokeObjectURL(it.url));
    p.onAdd(cards);
  };

  const count = usable.length;
  const title = videos.length ? "Pick the frames you like" : working && !count ? "Getting your photos ready" : `Add ${count} ${count === 1 ? "photo" : "photos"}`;

  return (
    <Sheet open={open} onClose={close} title={title} tall>
      {videos.length > 0 ? (
        <FrameGrab
          key={videos[0].name + videos[0].size}
          file={videos[0]}
          onFrame={(blob) => {
            const key = uid();
            setItems((list) => [...list, { key, state: "work", sel: true, dup: false, eventId: p.defaultEvent }]);
            void take(key, blob);
          }}
          taken={items.length}
          onDone={() => setVideos((v) => v.slice(1))}
        />
      ) : (
        <div className="mb-tray">
          <div className="mb-tray-grid">
            {items.map((it) => (
              <button
                key={it.key}
                className={cls("mb-tray-item", it.sel && "sel", it.dup && "dup", it.state)}
                disabled={it.state !== "ready" || it.dup}
                onClick={() => setItems((list) => list.map((x) => (x.key === it.key ? { ...x, sel: !x.sel } : x)))}
                aria-pressed={it.sel}
                aria-label={it.dup ? "Same photo, already added" : it.sel ? "Ticked photo" : "Photo, not ticked"}
              >
                {it.url && <img src={it.url} alt="" />}
                {it.state === "ready" && !it.dup && <span className="mb-tick">{it.sel && <Icon.check size={15} />}</span>}
                {it.dup && <em>Same photo, already added</em>}
                {it.state === "error" && <em>Couldn&rsquo;t read this one</em>}
                {it.eventId && it.type && !it.dup && <em className="mb-tagged">{p.events.find((e) => e.id === it.eventId)?.name} · {TYPES.find((t) => t.id === it.type)?.label}</em>}
              </button>
            ))}
          </div>
          {count > 1 && <p className="mb-fine">Your taps below tag the ticked photos. Untick a few to tag them differently.</p>}

          <h3>Which event is this for?</h3>
          <Chips label="Event" items={p.events.map((e) => ({ id: e.id, label: e.name }))} value={same("eventId")} onPick={(id) => apply({ eventId: id })} />
          <h3>What does it show?</h3>
          <Chips<CardType> label="Kind" items={TYPES.map((t) => ({ id: t.id, label: t.label }))} value={same("type")} onPick={(id) => apply({ type: id })} />

          <button className="mb-btn wide" disabled={working || !count || untagged > 0} onClick={add}>
            {working ? "Getting ready…" : !count ? "Nothing new to add" : untagged ? `Tag ${untagged === count ? "them" : `${untagged} more`} to add` : `Add to the board`}
          </button>
        </div>
      )}
    </Sheet>
  );
}

function FrameGrab({ file, onFrame, onDone, taken }: { file: File; onFrame: (b: Blob) => void; onDone: () => void; taken: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const [url, setUrl] = useState<string>();
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  const grab = async () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    v.pause();
    onFrame(await grabFrame(v));
    navigator.vibrate?.(10);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 260);
  };
  return (
    <div className="mb-frames">
      <div className={cls("mb-video", flash && "flash")}>{url && <video ref={video} src={url} controls playsInline muted preload="auto" />}</div>
      <p className="mb-fine">Play or drag to the moment you like, then keep that frame. You can keep several.</p>
      <div className="mb-row">
        <button className="mb-btn" onClick={grab}>Keep this frame</button>
        <button className="mb-btn ghost" onClick={onDone}>{taken ? `Done (${taken} kept)` : "Skip this video"}</button>
      </div>
    </div>
  );
}
