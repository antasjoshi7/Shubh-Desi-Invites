# Editor: phone-first, Canva-level editing

About 95% of use will be on phones. The laptop layout stays as it is; only the important Canva
ideas come over, tuned for a phone. This file lists every flaw found by using the editor at phone
size (375 × 812) and comparing it with Canva's editor, and what was done about each.

Last updated: 10 November 2026.

## Fixed (10 Nov 2026)

| # | Flaw | Fix |
|---|---|---|
| 1 | **Changing one line's font or size messed up the whole page.** Every line was part of one automatic stack that shrank to fit, so making the date bigger or wider shrank and moved Ganesh ji, the names and everything else. | **Pinned layout.** The first time you tap any text on a page, the page is "pinned": it looks exactly the same, but every line now keeps its own place and size, like a Canva text box. Changing a line only pushes the lines *below* it by exactly how much it grew, so the gaps stay the same. Nothing above moves, and nothing shrinks. |
| 2 | **Three taps to reach the text.** The first tap picked the whole block (symbol and every line together). | One tap picks that line; tapping it again lets you type. Hold to pick several. |
| 3 | **No copy and paste.** The "Copy" button actually duplicated the line. | Separate **Copy**, **Paste** and **Duplicate**. Copied lines paste on any page, even after a reload; pasting onto another page drops the line under the existing text instead of on top of it. Duplicates appear slightly down and to the right, like Canva. |
| 4 | **No way to line things up neatly.** | A new **Position** panel: move the selection to the left, centre or right of the design, or to its top, middle or bottom. With several lines picked: line up lefts, centres or rights; space evenly; same size. Plus **Tidy this page**, which puts everything back in a neat centred stack when it's a mess. |
| 5 | **Colours you picked yourself vanished from the swatches.** | **This invite's colours** come first in the text colour panel: the theme's two colours, then every colour you've picked or used anywhere in the invite. They also show in the paper and artwork swatches. Remembered on the phone. |
| 6 | **Text colour combos didn't read**, e.g. a pale gold title on light paper. | The theme's colours are now automatically deepened or lightened just enough to read on the paper (the hue stays the same). Only combos that read are offered, and there are 22 of them now instead of 10. Colours you pick by hand are never changed. |
| 7 | **Only 23 fonts, mostly similar.** | **136 fonts**: 113 new free-licence (OFL) Google fonts, 25 of them with Hindi letters. Fonts load only when they're shown or used, so the editor opens as fast as before. |
| 8 | **The font list had no search or groups.** | A search box and groups: In this invite, All, Script, Classic, Fancy, Modern and हिंदी. If the line is in Hindi, only fonts that can write it are shown. |
| 9 | **Text panels shrank the invite to a thumbnail.** With Font open it was about 150 px wide. | Text panels are shorter (the size and typing panels most of all), and the hint lines inside them are gone, so the invite stays big enough to see each change. |
| 10 | **Text tools didn't all fit.** | The toolbar scrolls sideways when the selection has many tools, like Canva's: Edit, Font, Size, Colour, Style, Position, Duplicate, Copy, Paste, Copy style, Paste style, Delete. |
| 11 | **No way to copy a look to other lines.** | **Copy style** and **Paste style**, like Canva's paint roller: font, size, colour, spacing and alignment. |
| 12 | **Changing a design on an edited page.** | The arrangement is kept and moves into the new design's clear area, shrinking only if it no longer fits. |
| 13 | **Keyboard (for the 5% on laptops).** | Cmd/Ctrl+C, X, V, D, A and Z (and Shift+Z or Y to redo), arrow keys to nudge (Shift for bigger steps), Delete, Esc. |
| 14 | **Tip bubble overlapped the hint line.** | The hint hides while a tip shows. |
| 15 | **"Your colours" filled up with colours nobody chose** (11 Nov): every pause while dragging the picker saved a shade, old colours stayed forever, paper colours showed up for text, and tapping a ready-made swatch looked like adding a new colour. | The row now shows only your own colours that are actually on this invite, newest pick first, at most 8. Text colours and paper/artwork colours are kept apart, and ready-made swatches stay in their own row. |

## Full test pass (11 Nov 2026)

Every feature was used at phone size (375 × 812) from a brand-new invite: pages (add, copy, delete, reorder, the 10-page limit), every text tool, multi-select and Position, symbol and initials, colours and themes, motion, music, Play, PDF, pictures, video (all pages and a subset), reload, and links from the landing pages. All 22 site pages were checked at phone width (no sideways scroll, no broken images) and 286 internal links were crawled (none broken).

| # | Found | Fix |
|---|---|---|
| 16 | **A new invite opened on an Intro page with no names, date or venue.** A card-first tool should start on a complete card. | A new invite now starts on the Invitation page, which also gained a date and venue line. Intro, events and thank you are one tap away. |
| 17 | **Tapping back into a text box selected all the text**, so fixing one typo could wipe a whole paragraph. | Only the first open of a short line (a name, a date) selects it; long text gets the cursor at the end, and tapping back in leaves the cursor where you tap. |
| 18 | **Emptying a line left an invisible line** that couldn't be tapped or removed. | Empty lines are removed when you finish typing. |
| 19 | **Pasting onto a page with a big symbol put the text on top of Ganesh ji.** | The symbol now counts as taken space, so pasted text goes under everything. |
| 20 | **The monogram kept "R & A"** after the names were changed. | While the initials still match the names, they follow the names as you type. Initials you type yourself are kept. |
| 21 | **Opening any panel made the page spill over the top bar** for a moment. | The page area no longer animates its size and is clipped. |
| 22 | **The "2 picked" bar covered the words** in the middle of the card, and the dark checkboxes sat on letters. | The bar sits at the top over the artwork; the checkboxes are smaller and light. |
| 23 | **The floating preview hid part of sliders and swatches** in Colours and Design. | It's smaller (100 px wide). |
| 24 | **The video progress note counted every page** even when making a video of some pages. | It counts the pages and seconds actually in the video. |
| 25 | **At 10 pages the + button just vanished.** | It stays, greyed, and says "Full". |
| 26 | **Event buttons in Add a page showed colours** the new page wouldn't get (it keeps the invite's look). | Each event has a small sign instead (🌼 🌿 🎶 🪔 ✨). |
| 27 | **Lines could end on a joining word** ("at Lakeside Mandap, The / Leela Palace"). | A short joining word at the end of a line (the, of, at, &, Mr…) moves down to the word it belongs with. |
| 28 | **Pictures came as a .zip, which phones handle badly.** | After a PDF or pictures are made, phones show **Send on WhatsApp or anywhere**, which opens the share sheet with the actual PDF or images. The finished video has **Send it** too. |
| 29 | **A venue without a place word** ("at Taj Lands End") wasn't tappable in the PDF. | A line starting "at Name…", or the template's venue line, opens the map too. |
| 30 | **A black box while the editor loads** on a slow connection. | "Opening your card…" shows until it's ready. |
| 31 | **The size number box kept a half-typed number.** | It shows the real size again when you leave it. |
| 32 | **Old "video maker" wording** in the default page title (the 404 page used it), the site description and the editor's label. | Now "card maker", with the PDF described first. The event pages still target "invitation video" searches on purpose. |

## Still to do (ranked)

1. **Side handles to change a line's width** (where it wraps). Lines now store a width, so this is a small addition to the selection box.
2. **Type on the page itself** instead of in the panel's text box (Canva types in place). Harder on phones because of the keyboard; the panel works.
3. **Layers**: bring forward or send back, for overlapping text.
4. **Rotate.** Rare on invites; low priority.
5. **Laptop layout** (left rail, side panel): deliberately not done, because almost everyone is on a phone.
