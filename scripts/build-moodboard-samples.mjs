// Prepares the sample photos for the mood board's starter board.
// Reads the originals from "research:moodboard-samples:" (Unsplash photos, kept on this computer),
// writes a web-sized copy and a small thumbnail of each to public/moodboard/s/, and records each
// photo's size, colours and fingerprint in lib/moodboard/samples.json.
// Run: node scripts/build-moodboard-samples.mjs

import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { extractPalette, dhash } from "../lib/moodboard/palette.ts";

const SRC = "research:moodboard-samples:";
const OUT = "public/moodboard/s";
mkdirSync(OUT, { recursive: true });

const files = readdirSync(SRC).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const rows = [];
for (let i = 0; i < files.length; i++) {
  const id = String(i).padStart(2, "0");
  const src = sharp(join(SRC, files[i])).rotate();
  const full = await src.clone().resize({ width: 1400, height: 1400, fit: "inside" }).jpeg({ quality: 76, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  writeFileSync(join(OUT, `${id}.jpg`), full.data);
  const thumb = await src.clone().resize({ width: 520 }).jpeg({ quality: 70, mozjpeg: true }).toBuffer();
  writeFileSync(join(OUT, `${id}-t.jpg`), thumb);
  const px = await src.clone().resize(48, 48, { fit: "fill" }).ensureAlpha().raw().toBuffer();
  const grey = await src.clone().resize(9, 8, { fit: "fill" }).greyscale().raw().toBuffer();
  const { colors, dom } = extractPalette(px);
  // "ajoy-das-MK0H-nJGCtc-unsplash.jpg" -> "Ajoy Das"
  const credit = files[i].replace(/-unsplash\..*$/, "").split("-").slice(0, -1).filter((w) => /^[a-z]+$/.test(w)).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  rows.push({ id, w: full.info.width, h: full.info.height, colors, dom, hash: dhash(grey), credit });
  console.log(id, files[i], full.info.width + "x" + full.info.height, colors.join(" "));
}
writeFileSync("lib/moodboard/samples.json", JSON.stringify(rows, null, 1));
console.log(`${rows.length} sample photos ready`);
