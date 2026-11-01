"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "shaadi-tips-seen";

// Which one-time tips have been dismissed (remembered on this device).
export function useTips() {
  const [seen, setSeen] = useState<Set<string> | null>(null); // null until read, so tips don't flash

  useEffect(() => {
    let ids: string[] = [];
    try {
      ids = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    } catch {
      // private mode or blocked storage: show tips this visit
    }
    setSeen(new Set(ids));
  }, []);

  const done = useCallback((id: string) => {
    setSeen((s) => {
      if (!s || s.has(id)) return s;
      const next = new Set(s).add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify([...next]));
      } catch {
        // not remembered, that's fine
      }
      return next;
    });
  }, []);

  const show = useCallback((id: string) => seen !== null && !seen.has(id), [seen]);
  return { show, done };
}

// A small speech bubble that explains what to do next.
export function Tip({ text, onDone, className = "" }: { text: React.ReactNode; onDone: () => void; className?: string }) {
  return (
    <div className={"tip " + className} role="status">
      <span className="tip-spark" aria-hidden="true">
        ✦
      </span>
      <span className="tip-text">{text}</span>
      <button className="tip-ok" onClick={onDone}>
        Got it
      </button>
    </div>
  );
}
