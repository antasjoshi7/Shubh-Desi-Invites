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

## Still to do (ranked)

1. **Side handles to change a line's width** (where it wraps). Lines now store a width, so this is a small addition to the selection box.
2. **Type on the page itself** instead of in the panel's text box (Canva types in place). Harder on phones because of the keyboard; the panel works.
3. **Layers**: bring forward or send back, for overlapping text.
4. **Rotate.** Rare on invites; low priority.
5. **Laptop layout** (left rail, side panel): deliberately not done, because almost everyone is on a phone.
