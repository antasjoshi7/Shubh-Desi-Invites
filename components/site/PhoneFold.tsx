"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// On phones, long sections fold to a short preview with a "Show more" button, so pages don't
// scroll forever. Every word stays in the page (search engines read it all); only the height
// changes. The hero, the first short answer and the questions (already tap-to-open) never fold.
const PHONE = "(max-width: 720px)";
const TALL = 760; // sections taller than this fold
const KEEP = 460; // to this preview height

export function PhoneFold() {
  const path = usePathname(); // run again on each page (the layout stays mounted between pages)
  useEffect(() => {
    if (!window.matchMedia(PHONE).matches) return;
    const sections = [...document.querySelectorAll<HTMLElement>("main section")].filter(
      (s, i) => i > 1 && !s.closest(".s-folded") && !s.querySelector(".s-faq") && !s.classList.contains("s-hero") && !s.dataset.nofold,
    );
    const added: HTMLElement[] = [];
    for (const s of sections) {
      if (s.scrollHeight <= TALL) continue;
      s.classList.add("s-folded");
      s.style.setProperty("--fold", `${KEEP}px`);
      const more = document.createElement("button");
      more.type = "button";
      more.className = "s-more";
      more.textContent = "Show more ↓";
      more.onclick = () => {
        s.classList.remove("s-folded");
        more.remove();
      };
      s.after(more);
      added.push(more);
    }
    return () => {
      added.forEach((b) => b.remove());
      document.querySelectorAll(".s-folded").forEach((s) => s.classList.remove("s-folded"));
    };
  }, [path]);
  return null;
}
