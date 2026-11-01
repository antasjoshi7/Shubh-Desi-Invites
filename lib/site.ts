// Site-wide facts used by every page's title, description, share preview and structured data.
// Change the name or domain here (or set NEXT_PUBLIC_SITE_URL in Vercel) and every page follows.

import { ANIMATIONS, BACKGROUNDS, FONTS, SYMBOL_STYLES } from "./catalog";
import { MUSIC } from "./music";

export const SITE = {
  name: "Shaadi Video Maker",
  // the live address; set NEXT_PUBLIC_SITE_URL once the custom domain is connected
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://shaadi-video-maker.vercel.app").replace(/\/$/, ""),
  tagline: "Free Indian wedding invitation video maker",
  // one plain sentence: what it is, who it's for, what it does (read by Google and AI assistants)
  definition:
    "Shaadi Video Maker is a free online tool for making Indian wedding invitation videos and e-cards on your phone: pick a design, type your names and dates, and download an MP4 for WhatsApp, with no watermark and no sign-up.",
  locale: "en_IN",
  // HUMAN INPUT: your name as it should appear on guides you write (shown as the author)
  author: process.env.NEXT_PUBLIC_AUTHOR_NAME || "",
  // HUMAN INPUT: links to your public profiles (Twitter/X, GitHub, Pinterest), used to connect the site to you
  sameAs: (process.env.NEXT_PUBLIC_SAME_AS || "").split(",").filter(Boolean),
  // when the facts on the landing pages were last checked (shown as "Updated …")
  updated: "2026-11-01",
};

export const absolute = (path: string) => SITE.url + (path === "/" ? "" : path);

// How many designs, motions and so on the tool has, so pages never quote stale numbers.

export const COUNTS = {
  designs: BACKGROUNDS.length,
  motions: ANIMATIONS.length,
  fonts: FONTS.length,
  symbols: SYMBOL_STYLES.length,
  music: MUSIC.length,
};
