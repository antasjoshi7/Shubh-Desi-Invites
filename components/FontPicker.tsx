"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ensureFonts, fontReady } from "@/lib/assets";
import type { FontInfo } from "@/lib/catalog";

// The font list, like Canva's: a search box, groups, the invite's own fonts first.
// Each font downloads only when its row scrolls into view, so 130+ fonts stay quick on a phone.

type Group = "invite" | "all" | "script" | "traditional" | "display" | "modern" | "hindi";
const GROUPS: { id: Group; name: string }[] = [
  { id: "invite", name: "In this invite" },
  { id: "all", name: "All" },
  { id: "script", name: "Script" },
  { id: "traditional", name: "Classic" },
  { id: "display", name: "Fancy" },
  { id: "modern", name: "Modern" },
  { id: "hindi", name: "हिंदी" },
];
const HINDI = /[ऀ-ॿ]/;

export function FontPicker({
  fonts,
  current,
  used,
  sample,
  onPick,
}: {
  fonts: FontInfo[];
  current: string;
  used: string[]; // fonts already in this invite
  sample: string;
  onPick: (family: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<Group>("all");
  const [, setTick] = useState(0); // redraw as fonts arrive
  const listRef = useRef<HTMLDivElement>(null);
  const hindiText = HINDI.test(sample);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = fonts;
    if (hindiText) list = list.filter((f) => f.hindi); // only fonts that can write the line
    if (q) return list.filter((f) => f.family.toLowerCase().includes(q));
    if (group === "invite") return list.filter((f) => used.includes(f.family));
    if (group === "hindi") return list.filter((f) => f.hindi);
    if (group !== "all") return list.filter((f) => f.style === group);
    return list;
  }, [fonts, query, group, used, hindiText]);

  // download fonts as their rows come into view
  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        const families = entries.filter((e) => e.isIntersecting).map((e) => (e.target as HTMLElement).dataset.family!);
        if (families.length) ensureFonts(families, fonts).then((any) => any && setTick((n) => n + 1));
      },
      { rootMargin: "200px 0px" },
    );
    root.querySelectorAll<HTMLElement>("[data-family]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [shown, fonts]);

  const text = group === "hindi" && !hindiText ? "शुभ विवाह" : sample;

  return (
    <div className="font-picker">
      <input
        className="font-search"
        type="search"
        placeholder={`Search ${fonts.length} fonts`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search fonts"
      />
      {!query && (
        <div className="cat-row font-groups">
          {GROUPS.filter((g) => !hindiText || g.id !== "hindi").map((g) => (
            <button key={g.id} className={"chip" + (group === g.id ? " on" : "")} onClick={() => setGroup(g.id)}>
              {g.name}
            </button>
          ))}
        </div>
      )}
      {hindiText && <p className="fit-note">Showing fonts that can write Hindi.</p>}
      <div className="font-list" ref={listRef}>
        {shown.map((f) => {
          const ready = fontReady(f.family);
          return (
            <button key={f.id} data-family={f.family} className={"font-row" + (f.family === current ? " on" : "")} onClick={() => onPick(f.family)}>
              <span className={"font-sample" + (ready ? "" : " loading")} style={{ fontFamily: ready ? `"${f.family}", serif` : "serif" }}>
                {text}
              </span>
              <span className="font-name">
                {f.family}
                {f.hindi && !hindiText && <em className="font-tag">हिंदी</em>}
              </span>
            </button>
          );
        })}
        {!shown.length && <p className="fit-note">No fonts match “{query}”.</p>}
      </div>
    </div>
  );
}
