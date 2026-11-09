"use client";

import { useCallback, useRef, useState } from "react";

const LIMIT = 80; // how many steps back you can undo
const MERGE_MS = 600; // quick changes in a row (dragging, sliders) undo as one step

// State with undo and redo.
export function useHistory<T>(initial: () => T) {
  const [state, setState] = useState<{ past: T[]; now: T; future: T[] }>(() => ({ past: [], now: initial(), future: [] }));
  const lastChange = useRef(0);

  // Changes the value. Changes less than MERGE_MS apart replace each other in the history.
  const set = useCallback((next: T | ((prev: T) => T)) => {
    // timing is decided here, not inside the updater (React may run updaters twice)
    const t = Date.now();
    const merge = t - lastChange.current < MERGE_MS;
    lastChange.current = t;
    setState((s) => {
      const value = typeof next === "function" ? (next as (prev: T) => T)(s.now) : next;
      if (value === s.now) return s;
      return { past: merge && s.past.length > 0 ? s.past : [...s.past, s.now].slice(-LIMIT), now: value, future: [] };
    });
  }, []);

  // Changes the value without an undo step, for changes you can't see (pinning a page's layout).
  const replace = useCallback((fn: (prev: T) => T) => setState((s) => ({ ...s, now: fn(s.now) })), []);

  // Replaces the value without an undo step (e.g. loading a saved invite).
  const reset = useCallback((value: T) => setState({ past: [], now: value, future: [] }), []);

  const undo = useCallback(() => {
    lastChange.current = 0;
    setState((s) => (s.past.length ? { past: s.past.slice(0, -1), now: s.past[s.past.length - 1], future: [s.now, ...s.future] } : s));
  }, []);

  const redo = useCallback(() => {
    lastChange.current = 0;
    setState((s) => (s.future.length ? { past: [...s.past, s.now], now: s.future[0], future: s.future.slice(1) } : s));
  }, []);

  return { value: state.now, set, replace, reset, undo, redo, canUndo: state.past.length > 0, canRedo: state.future.length > 0 };
}
