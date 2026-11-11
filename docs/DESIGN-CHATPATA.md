# The chatpata look (11 November 2026)

Desi maximalist poster art (nimbu-mirchi, nazar, filmi lettering, sunburst rays, halftone print)
meets neo-brutalism (thick ink outlines, hard offset shadows, flat colour, buttons that press in).
It replaced the purple glow-and-gradient look, which read as AI-made.

Style sample with the reasoning: https://claude.ai/artifact/TnP44kU8oExEw1ojpYCKm4

## Rules

1. **Bold around, calm inside.** Invites and videos sit on a cream mat with a thin gold line and a
   hard shadow. They never get a thick outline, a sticker on top or a tilt beyond about 1 degree.
   Mood board photos are the exception: they are inspiration, so they get the ink outline.
2. **Ink and paper never change**: ink `#1f0a1d`, paper `#fff8ea` / kagaz `#fff3dc`. Only the page's
   colour set changes.
3. **Each page has its own colour set**, set with `<Theme name="…" />` (components/site/Desi.tsx) and
   read in app/(site)/site.css with `:has()`:

   | Page | Ground | Accents |
   |---|---|---|
   | Home | mustard | hot pink, chilli red, nazar blue |
   | Haldi | pale haldi | marigold, sindoor red, leaf green |
   | Mehendi | pista | gulabi pink, mehendi green, yellow |
   | Sangeet | jamun night (dark) | yellow, hot pink, teal |
   | Reception | rose | gold, wine, blue |
   | Animations | truck-art sky blue | yellow, cobalt, pink |
   | Designs | lilac | mango, purple, yellow |
   | Wording | terracotta-light | yellow, terracotta, green |
   | Prices | matchbox orange | mustard, jamun, pink |
   | Card maker | pink | yellow, chilli, blue |
   | Mood board landing | gulabi | mango, rani, blue |
   | Guides, about, legal | kagaz | pink, blue, yellow |

   The mood board app takes each event's colour from its own photos instead.
4. **Fonts**: Yatra One for headlines (signboard), Khand for labels and buttons (made for Indian
   signs), Mukta for reading. All three write Hindi. No Inter, no Space Grotesk.
5. **Headlines** get the filmi double shadow (accent, then ink), lighter on phones.
6. **Hinglish lives in stickers, the ticker and small labels** ("Muft hai, boss", "Seedhi baat",
   "Nazar na lage", "Mummy-approved"). Headings, body text and anything Google reads stay plain
   English, so SEO and clarity don't suffer.
7. **Our shapes, not generic stars**: toran, marigold sticker, nimbu-mirchi, nazar, sunburst,
   ticket, mehrab. All drawn in the same thick ink line. No emoji or arrow characters as icons.
8. **Motion is small**: the ticker scrolls, the nimbu-mirchi swings, buttons press in. All of it stops
   for people who turn off motion.

## Where it lives

- `components/site/Desi.tsx`: Theme, Toran, Ticker, Sticker, HeroStickers, HeroPic, Marigold,
  NimbuMirchi, Nazar.
- `app/(site)/site.css`: every readable page.
- `app/moodboard/board.css`: the "chatpata" block at the end restyles the mood board.
- `app/globals.css`: the "Chatpata" block at the end restyles the invite editor's pieces. The
  editor's layout and canvas are unchanged.

## Not done yet

- Share images (`public/og/*.jpg`) and Pinterest pins are still in the old purple look. Remake them
  with `npm run brand` after updating scripts/build-brand.mjs.
- The mood board's posters and briefs (drawn on canvas in lib/moodboard/poster.ts) keep their calm
  paper look on purpose: they go to decorators and guests.
