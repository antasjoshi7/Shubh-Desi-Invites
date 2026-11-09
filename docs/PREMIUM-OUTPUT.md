# From slideshow to film: what paid invites do, and what we built

Written 10 November 2026, after studying paid Indian video invites and the user's own 63-second invite made in the editor.

## What people pay ₹1,000+ for

Prices from studio and marketplace pages:
- Template-style video invites: about ₹900 to ₹1,200.
- Animated GIF/MP4 cards: ₹1,500 to ₹4,000.
- Premium bundles: ₹4,500 to ₹15,000.
- Bespoke illustrated films: ₹18,000 and up.

The most-watched "luxury" invite on YouTube (105K views) is a 3D walk through a venue. It shows what the money buys:

1. **One continuous camera.** The camera never stops: it glides through a gate, past flowers and into each event's space. Nothing ever looks like a still card.
2. **Text inside the world.** Event details sit on easels, signboards and framed stands within the scene, not in a box over a background.
3. **Depth.** Near things blur and move faster, far things move slower, with warm light falling across the scene.
4. **One look throughout.** One colour story, one lettering style and one kind of art from the first second to the last.
5. **Music carries it**, with cuts landing on the beat. It fades in and out like a film.

## What was wrong with the editor's output (from the user's 2-hour invite)

- **Still cards.** After the words appear, each page holds completely still for 10 to 15 seconds. Frames 3 s to 14 s are identical.
- **Every page a different invite.** The names were magenta, the Haldi gold, the Sangeet maroon and navy. The Om circle changed colour per page, and the art styles changed too (chandeliers, marigolds, horses, bunting).
- **Thin, small type.** Light italic fonts at 20 to 24 px are unreadable on a phone (the addresses, the grandparents' names).
- **Too much on the cover.** Three address blocks in tiny type, on the page people see first.
- **Hard cuts.** Pages swapped like slides.

## What we built (10 Nov 2026)

**Film finish** (on by default; switch in Motion). It applies to the moving video only. Stills, PDFs and the editor stay exact.
- **Camera.** A slow push in with a gentle drift on every page, different for each design. The words move less than the artwork, which gives depth.
- **Light.** Warm light drifts across the top, gold dust floats up at three depths, and the edges get a soft vignette.
- **Gold shine.** A band of light sweeps across the big words (names and event titles), like foil catching the light.
- **Readable on any art.** Every letter gets a soft glow in the paper colour. Theme colours are deepened or lightened just enough to read.
- **Film grain**, light and changing 12 times a second.
- **Fades.** The video opens from dark and fades out at the end.
- **Two new transitions:**
  - **Fly through** (the default): the camera keeps moving forward, the old page rushes past and the new one settles in.
  - **Golden glow**: a warm bloom of light carries one page into the next.
- **Size.** A full 64-second film is now about 12 MB (under WhatsApp's 16 MB limit) and renders in about 12 seconds on a laptop.

## The user's invite, remade

Saved at `exports/kedar-ria-invite.mp4` (git-ignored: it has family names, numbers and addresses).

- Opens on royal maroon with palace doors parting.
- Then ivory watercolour pages, one per event.
- **One type system:** Cinzel capitals for names and events, EB Garamond for everything else (it stays readable small), and Great Vibes for "weds" and "followed by".
- **One colour story:** rani pink and maroon on ivory, gold on maroon.
- Same Om circle throughout.
- The addresses moved from the cover to a final "With love" page, laid out in clear sections.

## Next, ranked by how much more "premium" it buys

1. **Layered scenes (real depth).** Each design as 3 to 4 separate layers (back wall, middle, front flowers), so the camera move creates true parallax. Needs layered artwork (Recraft generation: ask before spending credits).
2. **Cuts on the beat.** Line up page changes and text reveals with the music's beats; each track would need beat times added.
3. **Couple illustration.** The most-requested paid feature (caricature of the couple). Needs a drawing approach that isn't a generic AI look.
4. **Text on objects.** Event details on an easel or signboard inside the scene, like the 3D invites.
5. **Continuous journey.** Pages stitched into one long scene, with the camera panning from the gate to the mandap.
