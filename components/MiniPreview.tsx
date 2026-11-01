"use client";

import { useEffect, useRef } from "react";

// A small canvas that shows draw(ctx, seconds).
// playing: loops the animation (pauses while scrolled off screen).
// not playing: shows a single frame at `still` seconds.
export function MiniPreview({
  draw,
  width = 84,
  playing = true,
  still = 0,
}: {
  draw: (ctx: CanvasRenderingContext2D, t: number) => void;
  width?: number;
  playing?: boolean;
  still?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = ref.current!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(((width * 16) / 9) * dpr);
    const ctx = canvas.getContext("2d")!;

    if (!playing) {
      drawRef.current(ctx, still);
      return;
    }

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);

    let raf = 0;
    let last = 0;
    const start = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible || now - last < 33) return; // ~30fps is plenty
      last = now;
      drawRef.current(ctx, (now - start) / 1000);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [width, playing, still, draw]);

  return <canvas ref={ref} style={{ width, height: (width * 16) / 9, display: "block" }} />;
}
