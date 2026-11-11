// A backup file: the whole board and its photos in one zip the person keeps (or opens on another
// phone). There are no accounts, so this is how a board survives a cleared browser.

import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { blobKey, getBlob, putBlob } from "./store";
import type { Board } from "./types";

export async function makeBackup(board: Board): Promise<Blob> {
  const files: Record<string, Uint8Array> = { "board.json": strToU8(JSON.stringify(board)) };
  for (const card of board.cards) {
    if (card.kind !== "image" || card.src) continue;
    for (const size of ["full", "thumb", "orig"] as const) {
      const blob = await getBlob(blobKey(card.id, size));
      if (blob) files[`photos/${card.id}.${size}.jpg`] = new Uint8Array(await blob.arrayBuffer());
    }
  }
  // photos are already compressed; store them as they are
  const zipped = zipSync(files, { level: 0 });
  return new Blob([zipped.buffer as ArrayBuffer], { type: "application/zip" });
}

export async function openBackup(file: Blob): Promise<Board> {
  const files = unzipSync(new Uint8Array(await file.arrayBuffer()));
  if (!files["board.json"]) throw new Error("This isn't a mood board backup");
  const board = JSON.parse(strFromU8(files["board.json"])) as Board;
  if (board.v !== 1 || !Array.isArray(board.cards)) throw new Error("This backup can't be read");
  for (const [name, bytes] of Object.entries(files)) {
    const m = name.match(/^photos\/(.+)\.(full|thumb|orig)\.jpg$/);
    if (m) await putBlob(blobKey(m[1], m[2] as "full" | "thumb" | "orig"), new Blob([bytes.buffer as ArrayBuffer], { type: "image/jpeg" }));
  }
  return board;
}
