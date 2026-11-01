"use client";

import { MiniPreview } from "./MiniPreview";

// Pop-up with a bigger, looping preview of one animation or transition.
export function PreviewModal({
  title,
  draw,
  selected,
  onUse,
  onClose,
}: {
  title: string;
  draw: (ctx: CanvasRenderingContext2D, t: number) => void;
  selected: boolean;
  onUse: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="label" style={{ margin: 0 }}>
            ◆ {title} ◆
          </span>
          <button className="mini" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-stage">
          <MiniPreview draw={draw} width={230} />
        </div>
        <button className="btn" onClick={onUse}>
          {selected ? "✓ Selected" : "Use this"}
        </button>
      </div>
    </div>
  );
}
