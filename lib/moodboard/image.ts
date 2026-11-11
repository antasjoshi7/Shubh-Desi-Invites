// Takes a photo or screenshot the person picked and gets it ready for the board, all on the
// phone: shrinks it (so 30 photos don't fill the storage), makes a thumbnail, reads its colours,
// fingerprints it (to spot duplicates) and trims app bars off screenshots.

import { contentBand, dhash, extractPalette } from "./palette";

export type Ingested = {
  full: Blob;
  thumb: Blob;
  orig?: Blob; // the untrimmed picture, kept only when bars were trimmed
  w: number;
  h: number;
  colors: string[];
  dom: string;
  hash: string;
  trimmed: boolean;
};

const FULL = 1600; // longest side of the kept photo
const THUMB = 520; // width of the grid thumbnail

type Source = ImageBitmap | HTMLImageElement | HTMLCanvasElement;
const sizeOf = (s: Source) => ("naturalWidth" in s ? { w: s.naturalWidth, h: s.naturalHeight } : { w: s.width, h: s.height });

async function decode(blob: Blob): Promise<Source> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(blob, { imageOrientation: "from-image" });
    } catch { /* fall through to <img> */ }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}

function draw(src: Source, sx: number, sy: number, sw: number, sh: number, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const g = c.getContext("2d", { willReadFrequently: w <= 128 })!;
  g.imageSmoothingQuality = "high";
  g.drawImage(src, sx, sy, sw, sh, 0, 0, c.width, c.height);
  return c;
}

const toBlob = (c: HTMLCanvasElement, q: number) =>
  new Promise<Blob>((resolve, reject) => c.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not save the picture"))), "image/jpeg", q));

// Which rows of a tall screenshot are flat app background (white, black or near it)?
function flatRows(src: Source, w: number, h: number): boolean[] {
  const cw = 72, ch = Math.min(480, Math.round((h / w) * 72));
  const data = draw(src, 0, 0, w, h, cw, ch).getContext("2d")!.getImageData(0, 0, cw, ch).data;
  const rows: boolean[] = [];
  for (let y = 0; y < ch; y++) {
    // the row's typical colour: its middle-brightness pixel
    const lum: number[] = [];
    for (let x = 0; x < cw; x++) {
      const i = (y * cw + x) * 4;
      lum.push(data[i] + data[i + 1] + data[i + 2]);
    }
    const mid = [...lum].sort((a, b) => a - b)[cw >> 1];
    let same = 0, grey = 0;
    for (let x = 0; x < cw; x++) {
      const i = (y * cw + x) * 4;
      if (Math.abs(lum[x] - mid) < 40) same++;
      if (Math.max(data[i], data[i + 1], data[i + 2]) - Math.min(data[i], data[i + 1], data[i + 2]) < 22) grey++;
    }
    const extreme = mid > 690 || mid < 90; // app backgrounds are near white or near black
    rows.push(extreme && same / cw > 0.8 && grey / cw > 0.75);
  }
  return rows;
}

export async function ingest(blob: Blob, opts: { trim?: boolean } = {}): Promise<Ingested> {
  const src = await decode(blob);
  const { w: sw, h: sh } = sizeOf(src);
  if (!sw || !sh) throw new Error("That file isn't a picture");

  // only tall, phone-shaped pictures can be screenshots with bars
  let top = 0, bottom = 1;
  if (opts.trim !== false && sh / sw > 1.7) {
    const band = contentBand(flatRows(src, sw, sh));
    if (band) { top = band.top; bottom = band.bottom; }
  }
  const trimmed = top > 0.02 || bottom < 0.98;
  const cy = Math.round(top * sh), chh = Math.round((bottom - top) * sh);

  const scale = Math.min(1, FULL / Math.max(sw, chh));
  const fullC = draw(src, 0, cy, sw, chh, sw * scale, chh * scale);
  const thumbC = draw(fullC, 0, 0, fullC.width, fullC.height, Math.min(THUMB, fullC.width), (Math.min(THUMB, fullC.width) / fullC.width) * fullC.height);
  const px = draw(thumbC, 0, 0, thumbC.width, thumbC.height, 48, 48).getContext("2d")!.getImageData(0, 0, 48, 48).data;
  const g = draw(thumbC, 0, 0, thumbC.width, thumbC.height, 9, 8).getContext("2d")!.getImageData(0, 0, 9, 8).data;
  const grey: number[] = [];
  for (let i = 0; i < g.length; i += 4) grey.push(g[i] * 0.299 + g[i + 1] * 0.587 + g[i + 2] * 0.114);

  const { colors, dom } = extractPalette(px);
  const [full, thumb] = await Promise.all([toBlob(fullC, 0.86), toBlob(thumbC, 0.8)]);
  let orig: Blob | undefined;
  if (trimmed) {
    const os = Math.min(1, FULL / Math.max(sw, sh));
    orig = await toBlob(draw(src, 0, 0, sw, sh, sw * os, sh * os), 0.84);
  }
  if ("close" in src) src.close();
  return { full, thumb, orig, w: fullC.width, h: fullC.height, colors, dom, hash: dhash(grey), trimmed };
}

// A still from a video (a saved reel or screen recording) at the moment it is showing now.
export function grabFrame(video: HTMLVideoElement): Promise<Blob> {
  const c = document.createElement("canvas");
  c.width = video.videoWidth;
  c.height = video.videoHeight;
  c.getContext("2d")!.drawImage(video, 0, 0);
  return toBlob(c, 0.92);
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load a photo"));
    img.src = url;
  });
}
