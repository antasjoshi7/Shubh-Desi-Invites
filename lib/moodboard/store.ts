// Where the board lives: the browser's own database (IndexedDB) on this phone. Photos are kept as
// files next to the board. Nothing is uploaded anywhere.

import type { Board, Card } from "./types";

// One board per browser by default. Adding ?board=name to the address opens a separate board
// (handy for trying things out, or for two people sharing one phone).
const boardName = () => {
  const n = typeof location === "undefined" ? "" : new URLSearchParams(location.search).get("board") ?? "";
  return "shubh-moodboard" + (n ? "-" + n.replace(/[^a-z0-9]/gi, "").slice(0, 24) : "");
};
let dbp: Promise<IDBDatabase> | null = null;
// if the browser refuses storage (some private windows), keep working from memory
const memory = new Map<string, unknown>();
let broken = false;

function open(): Promise<IDBDatabase> {
  if (!dbp) {
    dbp = new Promise((resolve, reject) => {
      const req = indexedDB.open(boardName(), 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore("kv");
        req.result.createObjectStore("blobs");
      };
      req.onsuccess = () => { window.clearTimeout(t); resolve(req.result); };
      req.onerror = () => { window.clearTimeout(t); reject(req.error); };
      req.onblocked = () => { window.clearTimeout(t); reject(new Error("storage blocked")); };
      // some browsers (private windows, headless) never answer; don't leave the board loading forever
      const t = window.setTimeout(() => reject(new Error("storage not answering")), 3000);
    });
  }
  return dbp;
}

async function tx<T>(store: "kv" | "blobs", mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function safe<T>(key: string, run: () => Promise<T>, fallback: () => T): Promise<T> {
  if (broken) return fallback();
  try {
    return await run();
  } catch {
    broken = true;
    return fallback();
  }
}

export const loadBoard = () =>
  safe("board", () => tx<Board | undefined>("kv", "readonly", (s) => s.get("board")), () => memory.get("kv:board") as Board | undefined);

export const saveBoard = (b: Board) => {
  memory.set("kv:board", b);
  return safe("board", () => tx("kv", "readwrite", (s) => s.put(b, "board")).then(() => undefined), () => undefined);
};

export const putBlob = (key: string, blob: Blob) => {
  memory.set(key, blob);
  return safe(key, () => tx("blobs", "readwrite", (s) => s.put(blob, key)).then(() => { memory.delete(key); }), () => undefined);
};

export const getBlob = (key: string) =>
  safe(key, async () => (memory.get(key) as Blob | undefined) ?? (await tx<Blob | undefined>("blobs", "readonly", (s) => s.get(key))), () => memory.get(key) as Blob | undefined);

export const delBlob = (key: string) => {
  memory.delete(key);
  return safe(key, () => tx("blobs", "readwrite", (s) => s.delete(key)).then(() => undefined), () => undefined);
};

export async function clearBlobs() {
  [...memory.keys()].filter((k) => !k.startsWith("kv:")).forEach((k) => memory.delete(k));
  await safe("clear", () => tx("blobs", "readwrite", (s) => s.clear()).then(() => undefined), () => undefined);
  urls.forEach((u) => URL.revokeObjectURL(u));
  urls.clear();
}

// ---- picture addresses ----
// Sample photos are ordinary files on the site. A person's own photos are read from the database
// and handed to the page as short-lived addresses, remembered so each is made once.

export type Size = "thumb" | "full";
const urls = new Map<string, string>();
const pending = new Map<string, Promise<string | undefined>>();

export const blobKey = (id: string, size: Size | "orig") => `${id}:${size}`;

export function cachedUrl(card: Card, size: Size): string | undefined {
  if (card.src) return card.src + (size === "thumb" ? "-t.jpg" : ".jpg");
  return urls.get(blobKey(card.id, size));
}

export function primeUrl(id: string, size: Size, blob: Blob) {
  const k = blobKey(id, size);
  const old = urls.get(k);
  if (old) URL.revokeObjectURL(old);
  urls.set(k, URL.createObjectURL(blob));
}

export function urlFor(card: Card, size: Size): Promise<string | undefined> {
  const hit = cachedUrl(card, size);
  if (hit) return Promise.resolve(hit);
  const k = blobKey(card.id, size);
  let p = pending.get(k);
  if (!p) {
    p = getBlob(k).then((blob) => {
      pending.delete(k);
      if (!blob) return undefined;
      const u = URL.createObjectURL(blob);
      urls.set(k, u);
      return u;
    });
    pending.set(k, p);
  }
  return p;
}

export function forgetUrls(id: string) {
  (["thumb", "full"] as Size[]).forEach((s) => {
    const k = blobKey(id, s);
    const u = urls.get(k);
    if (u) URL.revokeObjectURL(u);
    urls.delete(k);
  });
}
