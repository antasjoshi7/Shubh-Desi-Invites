"use client";

// Small building blocks for the editor panels. They live outside the editor so React keeps
// them between changes (a tapped thumbnail keeps its place, a dragged slider keeps going).

import type { Background } from "@/lib/catalog";

// "Apply to this page and the ones after"
export function SameBox({ checked, onChange }: { checked: boolean; onChange: (on: boolean) => void }) {
  return (
    <label className="same">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      Apply to this page and the ones after
    </label>
  );
}

// A round colour button. value null = "Original" (the design's own colour, shown with ↺).
export function Swatch({ value, on, onPick, name, original }: { value: string | null; on: boolean; onPick: () => void; name: string; original?: string }) {
  return (
    <button
      className={"swatch-btn" + (on ? " on" : "") + (value === null ? " swatch-original" : "")}
      style={{ background: value ?? original ?? "#ffffff" }}
      onClick={onPick}
      aria-label={name}
      title={name}
    >
      {value === null ? "↺" : ""}
    </button>
  );
}

export function BgThumb({ b, star, on, onPick }: { b: Background; star?: boolean; on: boolean; onPick: () => void }) {
  return (
    <button className={"thumb" + (on ? " on" : "")} onClick={onPick} aria-label="Choose background">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={b.thumb} alt="" loading="lazy" />
      {star && <span className="star">★</span>}
    </button>
  );
}

// A section title with a short plain description under it.
export function Label({ title, desc }: { title: string; desc?: React.ReactNode }) {
  return (
    <div className="sec">
      <span className="field-label">{title}</span>
      {desc && <span className="sec-desc">{desc}</span>}
    </div>
  );
}

export function Slider({
  label,
  desc,
  min,
  max,
  step,
  value,
  onChange,
  show,
}: {
  label: string;
  desc?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  show: string;
}) {
  return (
    <div className="slider-row">
      <Label title={label} desc={desc} />
      <div className="slider">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
        <span>{show}</span>
      </div>
    </div>
  );
}
