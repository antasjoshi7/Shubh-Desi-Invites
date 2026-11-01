# Shaadi Video Maker

Makes Indian wedding invite videos (9:16 MP4) entirely in the browser.
No server, no database, no account. Optional cookieless analytics (PostHog), off until a key is set.

The site has two halves:

- **The editor** at `/create`: drawn on a canvas, everything happens on the visitor's device.
- **The readable pages** around it (home, event pages, wording, designs, guides): plain HTML that
  Google and AI assistants can read. Strategy and every SEO piece are explained in
  [docs/SEO-PLAYBOOK.md](docs/SEO-PLAYBOOK.md).

## Run it on your Mac

You only need to do this once:

```bash
npm install
```

Then, every time you want to work on it:

```bash
npm run dev
```

Open http://localhost:3000 in your browser. Press `Ctrl + C` in the terminal to stop it.

## Adding backgrounds or fonts

1. Drop images (`.png`, `.jpg`, `.webp`) into `public/backgrounds/`.
   Drop fonts (`.zip`, `.ttf`, `.otf`) into `public/fonts/`.
2. Run:

```bash
npm run assets
```

This:

- makes a web-sized copy and a thumbnail of each background in `public/generated/`;
- works out each background's main colour and how busy it is, and picks a recommended tint
  (busy designs get 70–80%);
- unzips fonts, keeps Regular (+ Bold), converts them to `.woff2`, moves licence files to
  `public/fonts/licenses/`, and deletes the zips;
- writes `data/backgrounds.json` and `data/fonts.json`.

It also runs automatically before every build, so deploying always picks up new files.

To say how a new font feels (traditional, script, display, modern), add it to `FONT_STYLES`
at the top of `scripts/build-assets.mjs`.

Palettes live in `data/palettes.json` and layouts in `data/layouts.json`. Edit them by hand.

## The simple backgrounds

The `simple-*.png` designs in `public/backgrounds/` (flowers, birds, arches, toran, lotus,
peacock — decorated at the sides, clear in the middle) are drawn in code by
`scripts/make-backgrounds.mjs`. To change colours or add designs, edit that file, then run:

```bash
npm run make-backgrounds
```

```bash
npm run assets
```

## Background music

The 10 music tracks are composed and synthesised in code in `lib/music.ts` (tanpura, santoor,
sitar, bansuri, shehnai, harmonium, tabla, dholak, dhol, bells, ghungroo). There are no audio
files and nothing to license. Each track is an exact loop of 12–15 seconds, so it repeats
seamlessly for longer videos; the video fades the music out over its last 1.5 seconds.

## Put it online

```bash
npx vercel --prod
```

Then open https://shaadi-video-maker.vercel.app. Once the repo is connected to Vercel through
GitHub, every `git push` deploys automatically instead.

## Where things live

- `lib/render.ts`: `render(page, time)` draws a page at any moment. Stills, preview and export all use it.
- `lib/decorations.ts`: the hand-drawn flower, petals and chariot.
- `lib/colors.ts`: contrast checks and palette recommendations.
- `lib/export.ts`: turns frames into an MP4 (Mediabunny first, MediaRecorder as backup).
- `lib/catalog.ts`: loads the JSON files and lists the picker options.
- `lib/defaults.ts`: the starting pages (intro, invitation, events, thank you).
- `app/create/Editor.tsx`: the editor screen (`/create`).
- `app/(site)/`: the readable pages: home, event pages (`[slug]`), wording, designs, guides.
- `lib/content/`: the text of the landing pages (`events.ts`, `wording.ts`) and the Markdown reader.
- `content/`: guides and pages written in Markdown (see [content/README.md](content/README.md)).
- `lib/site.ts`: site name, domain and counts used everywhere.
- `lib/schema.ts`: structured data. `app/sitemap.ts`, `app/robots.ts`, `app/feed.xml/`: crawler files.
- `lib/track.ts`: analytics events (only when `NEXT_PUBLIC_POSTHOG_KEY` is set).
- `scripts/build-assets.mjs`: the asset scanner described above.
- `scripts/build-brand.mjs` (`npm run brand`): icons, share images and Pinterest pins (`marketing/pinterest/`).
- `scripts/indexnow.mjs` (`npm run indexnow`): tells Bing about new pages after a deploy.
