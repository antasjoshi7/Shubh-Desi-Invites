"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_INITIALS } from "@/lib/catalog";
import { drawSymbol } from "@/lib/symbols";
import type { Page, SymbolStyle } from "@/lib/types";

const SIZE = 84;

// A square tile showing one symbol style in the page's colours (monograms with the page's initials).
export function SymbolTile({ page, style, surface }: { page: Page; style: SymbolStyle; surface: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = surface;
    ctx.fillRect(0, 0, SIZE, SIZE);
    drawSymbol(ctx, SIZE / 2, SIZE / 2, SIZE * 0.86, style, {
      main: page.palette.text,
      accent: page.palette.accent,
      surface,
      initials: page.initials ?? DEFAULT_INITIALS,
    });
  }, [page.palette, page.initials, style, surface]);

  return <canvas ref={ref} style={{ width: SIZE, height: SIZE, display: "block" }} />;
}
