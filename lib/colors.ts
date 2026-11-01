// Small colour helpers: contrast, mixing, and ranking palettes against a background + tint.

import type { Palette } from "./types";

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]: RGB): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

// a → b by amount t (0..1)
export function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}

// WCAG relative luminance (0 = black, 1 = white)
export function luminance(hex: string): number {
  const c = hexToRgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

// WCAG contrast ratio, 1–21. 4.5+ reads comfortably.
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function isLight(hex: string): boolean {
  return luminance(hex) > 0.4;
}

export function hue(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return h * 60;
}

const hueGap = (a: number, b: number) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

export type RankedPalette = { palette: Palette; score: number; readable: boolean; recommended: boolean };

// Best palettes first: readable text on `surface` (the colour behind the text) first of all,
// then accents that match the background's main colour.
export function rankPalettes(palettes: Palette[], surface: string, primary?: string): RankedPalette[] {
  const bgHue = primary ? hue(primary) : null;
  const ranked = palettes.map((palette) => {
    const textC = contrast(palette.text, surface);
    const accentC = contrast(palette.accent, surface);
    let score = Math.min(textC, 10) + 0.4 * Math.min(accentC, 6);
    if (bgHue !== null && hueGap(hue(palette.accent), bgHue) < 40) score += 1.5; // accent echoes the background
    if (hueGap(hue(palette.accent), 42) < 15) score += 0.5; // gold always works at a shaadi
    return { palette, score, readable: textC >= 4.5, recommended: false };
  });
  ranked.sort((a, b) => b.score - a.score);
  ranked.filter((r) => r.readable).slice(0, 3).forEach((r) => (r.recommended = true));
  return ranked;
}
