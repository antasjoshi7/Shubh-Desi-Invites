"use client";

import { useState } from "react";
import { analyticsOn, track } from "@/lib/track";

const DONE_KEY = "shaadi-rated";

// "How was it?" after a video is made. Real ratings only: what people send arrives in PostHog,
// and only reviews whose authors ticked "you can show this" may go on the site (data/reviews.json).
export function RatingBox() {
  const [stars, setStars] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [share, setShare] = useState(true);
  const [sent, setSent] = useState(() => {
    try {
      return localStorage.getItem(DONE_KEY) === "1";
    } catch {
      return false;
    }
  });
  if (!analyticsOn() || sent) return null;

  function submit() {
    track("review_submitted", { stars, text: text.trim().slice(0, 500), name: name.trim().slice(0, 40), can_show: share });
    try {
      localStorage.setItem(DONE_KEY, "1");
    } catch {
      // storage blocked: they may be asked again next time
    }
    setSent(true);
  }

  return (
    <div className="rating-box">
      <p className="rating-q">How was making your invite?</p>
      <div className="rating-stars" role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} role="radio" aria-checked={stars === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} className={n <= stars ? "on" : ""} onClick={() => setStars(n)}>
            ★
          </button>
        ))}
      </div>
      {stars > 0 && (
        <>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Anything you loved, or anything that annoyed you? (optional)" rows={2} maxLength={500} />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your first name and city (optional)" maxLength={40} />
          <label className="rating-share">
            <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} /> You can show my review on the website
          </label>
          <button className="btn" onClick={submit}>
            Send
          </button>
        </>
      )}
    </div>
  );
}
