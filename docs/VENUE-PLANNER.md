# Venue planner (idea, not built, not deployed)

Added 10 November 2026. Starting point: your brother's wedding.

## The idea

Upload a few ordinary photos of the venue. Get back:

1. A rough 3D model of the space (doesn't need to be exact).
2. Decor drawn onto it: colour theme per area, where the flowers, lights, drapes and mandap go. You
   refine it by typing ("make the entrance marigold and white", "more fairy lights over the lawn").
3. The plan for the day: where and when the sangeet dances happen, when the fireworks go and from where
   (with a safe distance from guests and the stage), which areas change for each event.
4. A shareable page or PDF the family, decorator and choreographer all look at, so everyone has the same picture.

Why it could be a wedge: invites tell guests *when*. This tells the family and vendors *what it will look
like and what happens where*. Nobody in the invite space does it, and the decorator conversation is
where families spend the most money and argue the most.

## Can it run on scripts with no live API?

**For your brother's wedding: yes, completely.** I can do it here in a working session: you drop the
photos into the project, I look at them, write the layout and decor plan as data, build a 3D page with
Three.js, and make the timeline. No API key needed, because I'm the one reading the photos.

**For a self-serve feature on the site: it needs a vision model at the moment someone uploads photos.**
Everything else can run in the browser for free.

| Step | Without any API (local scripts / browser) | With Gemini |
|---|---|---|
| Photos to rough 3D | Possible locally on your Mac: Apple's Object Capture (built into macOS), or newer "few photos, no camera info" models like VGGT or MASt3R, or Depth Anything for one-photo depth. Works best with 20+ overlapping photos; with 5 to 10 casual ones expect a rough shell | Not needed; Gemini doesn't make 3D |
| Simpler 3D that's often better | A blocky model: floor shape, stage, mandap, entrance, tables, trees, built from the photos plus a few measurements (or paces). Cleaner to decorate and works on phones | Gemini can read the photos and suggest that layout as data |
| Understanding the space (which part is stage, lawn, entrance) | Me, by hand, per wedding | Gemini Flash vision, very cheap |
| Decor on the photos ("show it decorated") | Not realistically | Gemini's image editing model repaints the real photo with the decor: the most impressive part, and the one that sells it |
| Decor in 3D (flowers, lights, drapes, colours per zone) | Yes: a small library of 3D pieces placed by rules | Gemini turns "more marigolds at the entrance" into changes to the plan |
| Timeline, dances, fireworks, explanation text | Template plus me writing it | Gemini writes and adjusts it |

## Is your Gemini key enough?

Yes, for testing and your brother's wedding. Rough cost per venue: a handful of vision calls (fractions of a
cent each) plus 10 to 20 decorated photo images (a few cents each), so well under a dollar a venue.
For the public site it would need a small server function so the key isn't exposed in the browser, and
a daily limit per visitor. Check current Gemini prices before switching it on.

## Status (11 November 2026)

Step 1 has a first draft: **Lychee Bagh** (by Moniack Garden, Dehradun), private page at
https://claude.ai/artifact/4R53FbG9E4FeKzp39ecx8g, source `research/venue/lychee-bagh-3d.html`.

- Built by hand from Google Images, Google Maps and the venue's public Instagram grid. No API.
- What's from the photos: L-shaped two-storey brick room block with white chevrons and a roof terrace
  around the courtyard lawn (≈16,000 sq ft), paved chowk with a stepped brick platform, white colonial
  bungalow with a red roof, smaller cottages, lychee grove, paved drive from New Cantonment Road.
- What's guessed: how these sit relative to each other (the satellite view is mostly tree canopy), sizes
  other than the lawn and hall, where the platform is.
- Sample events: Mehendi (lawn, dusk), Haldi (grove, morning), Sangeet (lawn, night, stage + LED floor +
  fireworks from the chowk), Wedding (baraat on the drive, varmala before the bungalow, dinner, pheras in
  the grove). Timings keep loud music and fireworks before 22:00.
- Learned: making it by hand is quick for one venue. For a product, the slow part is layout, not 3D: a
  vision model needs to turn photos into the zone list this page already uses as data.

## Suggested order

1. **Brother's wedding, by hand (no API):** you add venue photos and a rough size; I build the blocky 3D
   page, the zones, decor plan, colour themes and the day's timeline. Not deployed; a private page.
2. **Decorated photos with Gemini:** repaint 3 to 5 real venue photos per event (haldi, mehendi, sangeet,
   wedding). Show the family and decorator. This is the moment that tells us if it's a wedge.
3. **Try real 3D from photos** locally (Object Capture or VGGT) only if the blocky version feels too fake.
4. **Self-serve on the site**, only if 1 and 2 got a strong reaction. Link it from the invite maker
   ("planning the decor too?").

## What I need from you to start

- 10 to 30 photos of the venue (walk around it, overlapping shots, include the floor and corners). A slow
  walk-around video works too; I can pull frames from it.
- Rough size (length and width in metres or paces), where the stage/mandap is meant to go.
- The events at that venue, rough timings, and any colour themes already decided.
- Whether fireworks are allowed there (venue and local rules) and who's doing them.
- Your Gemini API key, only when we reach step 2, kept in `.env.local` (never committed or deployed).
