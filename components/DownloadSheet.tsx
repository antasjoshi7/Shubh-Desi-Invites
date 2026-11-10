"use client";

import { useState } from "react";
import { MiniPreview } from "@/components/MiniPreview";

// Download: the card first (PDF or pictures), the video second. Every page is ticked; untick the ones a
// guest group shouldn't get (e.g. a reception-only version for the office).
export function DownloadSheet({
  count,
  titles,
  drawPage,
  busy,
  onPdf,
  onPictures,
  onVideo,
  onClose,
}: {
  count: number;
  titles: string[];
  drawPage: (index: number) => (ctx: CanvasRenderingContext2D) => void;
  busy: "" | "pdf" | "pictures";
  onPdf: (pages: number[]) => void;
  onPictures: (pages: number[]) => void;
  onVideo: (pages: number[]) => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<boolean[]>(() => Array.from({ length: count }, () => true));
  const chosen = picked.flatMap((on, i) => (on ? [i] : []));
  const toggle = (i: number) => setPicked((p) => p.map((on, j) => (j === i ? !on : on)));
  const all = chosen.length === count;
  return (
    <div className="modal-backdrop" onClick={busy ? undefined : onClose}>
      <div className="modal download-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="label" style={{ margin: 0 }}>
            Download your invite
          </span>
          <button className="mini" onClick={onClose} disabled={!!busy} aria-label="Close">
            ×
          </button>
        </div>
        <p className="note" style={{ marginTop: 0 }}>
          Untick pages to make a version for a group of guests, like reception only.{" "}
          <button className="link-btn" onClick={() => setPicked(picked.map(() => !all))}>
            {all ? "Untick all" : "Tick all"}
          </button>
        </p>
        <ul className="download-pages">
          {titles.map((t, i) => (
            <li key={i}>
              <button className={picked[i] ? "on" : ""} onClick={() => toggle(i)} aria-pressed={picked[i]} aria-label={`${t}, page ${i + 1}`}>
                <MiniPreview draw={drawPage(i)} width={78} playing={false} />
                <span className="tick" aria-hidden="true">
                  ✓
                </span>
              </button>
              <small>{t}</small>
            </li>
          ))}
        </ul>
        <div className="download-actions">
          <button className="btn" onClick={() => onPdf(chosen)} disabled={!chosen.length || !!busy}>
            {busy === "pdf" ? "Making PDF…" : `Download PDF${chosen.length ? ` (${chosen.length})` : ""}`}
          </button>
          <button className="btn secondary" onClick={() => onPictures(chosen)} disabled={!chosen.length || !!busy}>
            {busy === "pictures" ? "Saving…" : chosen.length > 1 ? "Download pictures" : "Download picture"}
          </button>
        </div>
        <p className="note">
          The PDF is the card: sharp on any phone and ready to print. Tap the venue in it to open the map, or a phone
          number to call. Pictures are phone-size images, in a .zip when there are several.
        </p>
        <div className="download-video">
          <button className="btn secondary" onClick={() => onVideo(chosen)} disabled={!chosen.length || !!busy}>
            ▶ Make it move: video{chosen.length < count ? ` of ${chosen.length} page${chosen.length > 1 ? "s" : ""}` : ""}
          </button>
          <p className="note">The same card with gentle motion and music, in full HD. Send it on WhatsApp as a Document so it stays sharp.</p>
        </div>
      </div>
    </div>
  );
}
