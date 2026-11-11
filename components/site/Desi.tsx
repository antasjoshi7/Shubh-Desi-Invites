// The chatpata pieces (11 Nov 2026): desi maximalist poster art meets neo-brutalism. Toran bunting,
// a shop-sign ticker, stickers, nimbu-mirchi, nazar and marigolds, all drawn in the same thick ink
// line. Colours come from the page's theme (see Theme and site.css), so one set of pieces dresses
// every page differently.

import type { CSSProperties, ReactNode } from "react";

export type PageTheme =
  | "home" | "haldi" | "mehendi" | "sangeet" | "reception" | "animated" | "designs"
  | "wording" | "price" | "card" | "moodboard" | "paper";

// Sets the page's colour pair. One per page, anywhere inside it; site.css reads it with :has().
export function Theme({ name }: { name: PageTheme }) {
  return <span className="s-theme" data-theme-page={name} hidden />;
}

// The festive triangle flags along the top of every page.
export function Toran({ className = "", id = "s-toran-p" }: { className?: string; id?: string }) {
  return (
    <svg className={`s-toran ${className}`} width="100%" height="34" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={id} x="0" y="0" width="72" height="34" patternUnits="userSpaceOnUse">
          <path className="t1" d="M1 6 L35 6 L18 31 Z" />
          <path className="t2" d="M37 6 L71 6 L54 31 Z" />
          <circle className="t3" cx="18" cy="13" r="3.2" />
          <circle className="t3" cx="54" cy="13" r="3.2" />
        </pattern>
      </defs>
      <rect width="100%" height="34" fill={`url(#${id})`} />
      <rect width="100%" height="6" className="t-string" />
    </svg>
  );
}

// A scrolling shop-sign strip of short facts. The text is in the page once for screen readers and
// search engines; the moving copy is decorative.
export function Ticker({ items }: { items: string[] }) {
  const row = items.map((t, i) => (
    <span key={i} className="s-ticker-item">
      {t}
      <Marigold size={22} className="s-ticker-dot" />
    </span>
  ));
  return (
    <div className="s-ticker">
      <p className="s-sr">{items.join(". ")}.</p>
      <div className="s-ticker-track" aria-hidden="true">
        <div className="s-ticker-run">{row}</div>
        <div className="s-ticker-run">{row}</div>
      </div>
    </div>
  );
}

// A tilted label stuck on the page. tone picks the page's colours: a (main), b (second), ink, paper.
export function Sticker({ children, tone = "a", tilt = -4, className = "", style }: { children: ReactNode; tone?: "a" | "b" | "c" | "ink" | "paper"; tilt?: number; className?: string; style?: CSSProperties }) {
  return (
    <span className={`s-sticker s-sticker-${tone} ${className}`} style={{ ...style, "--tilt": `${tilt}deg` } as CSSProperties}>
      {children}
    </span>
  );
}

// A marigold flower; with children it becomes a round sticker with the words in the middle.
export function Marigold({ size = 120, className = "", children, tilt = 0 }: { size?: number; className?: string; children?: ReactNode; tilt?: number }) {
  const petals = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return <circle key={i} cx={60 + Math.cos(a) * 44} cy={60 + Math.sin(a) * 44} r="17" />;
  });
  return (
    <span className={`s-marigold ${className}`} style={{ width: size, height: size, "--tilt": `${tilt}deg` } as CSSProperties} aria-hidden={children ? undefined : true}>
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true" focusable="false">
        <g className="m-petals">{petals}</g>
        <circle className="m-heart" cx="60" cy="60" r={children ? 37 : 30} />
      </svg>
      {children && <span className="s-marigold-text">{children}</span>}
    </span>
  );
}

// Nimbu-mirchi: the lemon and chillies hung at the door so no bad eye falls on the house.
export function NimbuMirchi({ className = "" }: { className?: string }) {
  return (
    <svg className={`s-nimbu ${className}`} viewBox="0 0 80 220" width="80" height="220" aria-hidden="true" focusable="false">
      <path className="n-thread" d="M40 0 V200" />
      <path className="n-chilli" d="M40 40 C24 46 14 62 10 84 C22 70 30 60 40 54 Z" />
      <path className="n-chilli" d="M40 40 C56 46 66 62 70 84 C58 70 50 60 40 54 Z" />
      <path className="n-stem" d="M36 38 L44 38 L42 30 L38 30 Z" />
      <ellipse className="n-lemon" cx="40" cy="78" rx="17" ry="20" />
      <path className="n-chilli" d="M40 104 C26 110 18 128 16 150 C26 134 32 124 40 118 Z" />
      <path className="n-chilli" d="M40 104 C54 110 62 128 64 150 C54 134 48 124 40 118 Z" />
      <path className="n-chilli" d="M40 106 C38 126 40 150 44 172 C46 150 46 128 44 108 Z" />
      <ellipse className="n-lemon" cx="40" cy="190" rx="15" ry="18" />
    </svg>
  );
}

// Nazar: the blue eye that keeps the bad eye away.
export function Nazar({ size = 64, className = "" }: { size?: number; className?: string }) {
  return (
    <svg className={`s-nazar ${className}`} viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
      <circle className="z1" cx="32" cy="32" r="29" />
      <circle className="z2" cx="32" cy="32" r="20" />
      <circle className="z3" cx="32" cy="32" r="12" />
      <circle className="z4" cx="32" cy="32" r="6" />
      <circle className="z5" cx="27" cy="27" r="2.6" />
    </svg>
  );
}

// A row of stickers under a page's intro: short, plain facts with a little masala.
export function HeroStickers({ items }: { items: string[] }) {
  const tones = ["a", "paper", "ink", "b"] as const;
  const tilts = [-4, 3, -2, 4];
  return (
    <div className="s-stickers">
      {items.map((t, i) => (
        <Sticker key={t} tone={tones[i % tones.length]} tilt={tilts[i % tilts.length]}>{t}</Sticker>
      ))}
    </div>
  );
}

// The invite pictures in a hero: a sunburst behind them, a marigold stamp on the corner.
export function HeroPic({ children, stamp }: { children: ReactNode; stamp?: ReactNode }) {
  return (
    <div className="s-hero-pic">
      {children}
      {stamp && <Marigold size={112} tilt={10} className="s-hero-stamp">{stamp}</Marigold>}
    </div>
  );
}
