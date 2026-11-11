# Wedding mood board (decided 11 November 2026, not built yet)

Came from your brother's wedding: the bride lives in another state, has clear views on decor, and the
groom ends up relaying her feedback to the decorator over calls. Replaces the 3D venue planner as the
wedge to test (3D is parked; the Lychee Bagh page stays as a demo and blog material).

## Version 1: simple, no AI, no login

- **One board per person.** Bride and groom each make their own.
- **Adding inspiration:** upload screenshots or photos from the gallery. Each upload first asks **which
  event** (General, Haldi, Mehendi, Sangeet, Wedding, Reception, or your own), then **what it is**
  (Decor, Outfit, Flowers, Colours and vibe, Other). Several images can be tagged at once.
- **Reels:** upload a screen recording or saved video, scrub to the frame you like, tap to capture it as a
  card. Optionally paste the reel link onto the card as a note; tapping it opens Instagram (nothing is
  fetched).
- **Board layout:** sections by event, rows by type inside each, cards snap into place. Built for one hand
  on a phone, same feel as the invite editor.
- **Notes on cards:** chips (Love, Love this part with a pin on the image, Not this, Maybe, Ask decorator,
  For the tailor) plus free text. Select two or three cards and tap **Love together** to frame them as a
  combination.
- **Scripts that keep it tidy:** trim Instagram and Pinterest bars off screenshots, catch duplicates,
  pull the main colours into a palette per event.
- **Make it final:** per event, the loved cards and combinations, the palette, and every note as a
  numbered list. Separate **decorator brief** and **outfit brief**.
- **Export:** the whole board, or one event, as a PDF or pictures for WhatsApp. Plus a **backup file** to
  keep the board safe or move it to another phone.
- Stored on the phone only. Photos never leave it.

## Later, only if people use it

1. **Login and cloud save**, so a board survives a cleared browser and opens on any device. Needs a
   small backend (Cloudflare free tier would do) and makes us responsible for storing people's photos.
2. **Shared boards** (bride, groom and families on one board).
3. **Android share menu**: share a post from Instagram or Pinterest straight into the board.
4. **WhatsApp number plus an agent**: people forward posts, reels and screenshots to a WhatsApp number
   and they land on the right event. Needs the WhatsApp Business API (Meta charges for some message
   types), a backend and accounts. A business of its own.
5. **On-device tag suggestions** (a small image model in the browser), always confirmed by the person.

Skipped on purpose: AI-generated "final look" images, reading Instagram or Pinterest links.

## How we test demand

- Entry points from the invite maker: after a download ("Planning decor and outfits too?") and on each
  event page.
- Measure: how many invite makers open the board, how many add 5+ cards, how many export. Needs PostHog
  switched on (pending action #5).
- Real test: your brother and his fiancée use it for the actual wedding.

## Why not just Pinterest? (decided 11 November 2026)

Pinterest is where people find and save ideas, and we don't compete with that. This is for what
comes after saving: deciding, and telling people. So the board is the workspace, and the product
leads with two things you send:

1. **Decorator brief** (per event): every loved decor and flower photo, whole, with numbered pins
   and notes, the colour names, "loved together" combinations and a "not this" strip. Goes out as a
   PDF or pictures on WhatsApp; the decorator needs no app.
2. **What to wear** (per event): a card for guests with the dress code in a line, the colours to
   wear with their names, and the loved outfit photos. Same shape as an invite page.

Also there: an outfit brief, a poster per event, the whole board as a PDF, a backup file.

## Status (11 November 2026): built and tested locally, not deployed

At `/moodboard` (hidden from Google, not linked from the site). Code in `app/moodboard/` and
`lib/moodboard/`; 29 Unsplash sample photos in `public/moodboard/s/`. Adding `?board=name` to the
address opens a separate board (for trying things, or two people on one phone).

Tested at phone size and working:
- Sample board; starting your own board; the board staying after a reload.
- Adding photos: tagging tray (event, then kind), duplicate caught, app bars trimmed off a
  made-up Instagram screenshot.
- Event page: the two outcome cards (they turn solid when ready), palette with names, filters,
  loving photos, sticky notes, press-and-hold to pick several, "loved together".
- Photo view: tap to pin a note with one-tap phrases, love / maybe / not this, colour names.
- Send sheet: decorator brief, what-to-wear card (line, ideas, colour picks) and poster all draw
  correctly, from sample photos and from added ones.

Not tested yet:
- The final hand-off when Send is tapped (the phone's share sheet, or the download on a laptop),
  the whole-board PDF and the backup file. Needs a real phone.
- Picking frames from a reel (needs a real video), Move, Remove with Undo, the events editor,
  opening a backup, "show the whole screenshot", real Instagram / Pinterest screenshots.
- A production build (`npm run build`) with this page in it.

Known gaps:
- The phone's Back button doesn't close an open photo or sheet (it leaves the page; nothing is lost).
- The "what to wear" card is a picture to send; it isn't yet a page inside the invite maker.
- No entry points from the invite maker yet, so no demand signal until those and PostHog are on.

## Marketing and SEO (11 November 2026)

In the launch plan (https://claude.ai/artifact/LdisrAbJhZiB2Yc5v9et9t): the brief maker rides on the
invite launch and gets no launch of its own. Order: real-phone test this week; a link from the invite
maker, the dress-code page and what-to-wear pins in weeks 3 to 7; the real story after bhai's wedding;
keep, fold in or cut in March. Stop line to start from: fewer than 1 in 20 invite downloaders opening
it by end of January. Keyword terms to look up first are in docs/keywords.md.

## Linked into the site (11 November 2026, not deployed)

- **Landing page `/wedding-mood-board`** (the page Google reads): title "Indian Wedding Mood Board:
  Decorator Brief and Dress Code", what you send (with real pictures from the sample board), three
  steps, an honest Pinterest comparison, colour ideas per function, what to put in a decorator brief,
  privacy, FAQ. Structured data: breadcrumb, how-to, FAQ, web app. Share image `public/og/moodboard.jpg`.
  In the sitemap.
- **The tool `/moodboard`** stays out of Google, like the invite editor at `/create`.
- **Links in:** header ("Mood board"), footer, a section on the home page, the dress-code section of each
  event page (which now has the anchor `#dress-code`), and a line in the invite's Download sheet after a
  download ("Planning the decor and outfits too? Make a mood board"), counted as `moodboard_from_invite`.
- **Pictures** in `public/moodboard/landing/` were rendered from the sample board's real briefs and cards.
- **Checked:** production build passes; titles, descriptions, canonical, share image, structured data,
  sitemap and noindex read from the built HTML; landing page at phone size with no sideways scroll; the
  Download-sheet link; the built tool page served as a static site.
- **Fixed on the way:** if a browser's storage never answers (some private windows), the board now opens
  after 3 seconds and works from memory instead of loading forever.
- **Still not checked:** tapping Send on a real phone. Search volumes for these terms are still unknown
  (action #20), so the title may change once they're in.
