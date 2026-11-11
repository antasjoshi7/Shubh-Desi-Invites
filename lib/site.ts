// Site-wide facts used by every page's title, description, share preview and structured data.
// Change the name or domain here (or set NEXT_PUBLIC_SITE_URL in Vercel) and every page follows.

import { ANIMATIONS, BACKGROUNDS, FONTS, SYMBOL_STYLES } from "./catalog";
import { MUSIC } from "./music";

export const SITE = {
  name: "Shubh Desi Invites",
  // the live address; set NEXT_PUBLIC_SITE_URL to https://shubhdesi.com once that domain is bought and connected
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://shaadi-video-maker.vercel.app").replace(/\/$/, ""),
  tagline: "Free Indian wedding invitation card maker",
  // one plain sentence: what it is, who it's for, what it does (read by Google and AI assistants)
  definition:
    "Shubh Desi Invites is a free online tool for making Indian wedding invitation cards on your phone: pick a design, type your names and dates, and download a sharp PDF card (tap the venue for the map, a number to call) or pictures for WhatsApp, or turn it into a video, with no watermark and no sign-up.",
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
  // how the design count reads in copy: "200+" once there are 200, "nearly 200" until then
  designsLabel: BACKGROUNDS.length >= 200 ? `${Math.floor(BACKGROUNDS.length / 50) * 50}+` : `nearly ${Math.ceil(BACKGROUNDS.length / 50) * 50}`,
  motions: ANIMATIONS.length,
  fonts: FONTS.length,
  symbols: SYMBOL_STYLES.length,
  music: MUSIC.length,
};
