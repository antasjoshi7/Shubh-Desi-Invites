# Editor redesign: laptop first, Canva-style editing

Written 9 November 2026 after a hands-on comparison: our editor at 1440 × 860 against Canva's
editor with an Indian wedding invite template open. The goal is that anyone who has used Canva
once can use ours without reading a hint.

## What's wrong today (laptop)

| # | Problem | What Canva does instead |
|---|---|---|
| 1 | **There is no laptop layout.** The phone app sits in a 310 px column in the middle of the screen, with two thirds of the screen empty and 10 px button labels. | Left rail of tools, a side panel that opens beside the canvas, and a big canvas filling the rest. |
| 2 | **Panels open under the canvas and shrink it.** Opening Font cuts the invite down to about 100 px wide, so you can't see what the font change did. | Panels open on the left. The canvas never changes size. |
| 3 | **Three clicks to get to typing.** The first click selects the whole block (symbol and every line together), the second selects the line, and the third lets you type. | One click selects that one thing; a double click types into it. |
| 4 | **The symbol and the text move as one block** by default, so "move this line" moves Ganesh ji too. | Every element is separate. You group things only when you choose to. |
| 5 | **The text tools are at the bottom of the screen**, as icons with labels (Edit, Font, Size, Colour, Style), far from what you selected. Each one opens a panel. | A single toolbar above the canvas: a font dropdown, size − 16 +, colour, B, I, align, spacing, Position. Most changes take one click with no panel. |
| 6 | **One small resize dot** (↗). You can't change how wide a line is (where it wraps). | Four corner handles change the size; two side handles change the width and the wrapping; plus rotate and move handles. |
| 7 | **Two different "colour" tools.** "Colours" (the design) sits in the main bar and "Colour" (text) sits in the text bar. The text colour picker has 12 fixed swatches. | One colour picker with "Colours in this design" first, then a custom colour or hex code. |
| 8 | **Fonts are a long list of sample lines** with no search and no "fonts already in this invite" group. | "Document fonts" at the top, a search box, and categories (Handwriting, Display…). |
| 9 | **No keyboard.** Delete, arrow-key nudges, Cmd+D, copy and paste, and Esc to deselect either don't work or only partly work. | All of the above. |
| 10 | **Hint pills** ("Tap the text to move or resize it all, or hold to pick several") explain how the editor works because it isn't obvious. | Nothing to explain; tooltips appear on hover. |

The root cause behind 3, 4 and part of "restructuring is confusing": text lines aren't free
elements. They form an automatic stack (top, centre or bottom layout), and a hand move is
stored as an offset from where the stack would have put the line. Adding or resizing one line
moves the others. That suits a phone (the layout stays tidy without effort), but on a laptop
it feels like the editor is fighting you.

## The plan, in order

**Phase 1: laptop shell (biggest win).** At 1024 px and wider:
- a left rail: Design, Colours, Text, Symbol, Motion, Music
- a 340 px side panel next to the rail, reusing today's panel contents
- the canvas as large as the height allows
- the page strip under the canvas
- a top bar with undo, redo, Play and Export

Phones keep today's layout.

**Phase 2: one toolbar for whatever is selected,** above the canvas, on laptop:
- for text: font dropdown, size − n +, colour, bold, italic, capitals, align, spacing, Position, duplicate, delete
- for the symbol: style, size, colour, Position, delete

The bottom text bar goes away on laptop.

**Phase 3: Canva selection rules.** These apply on phones too, because they're simpler everywhere:
- a click selects one line or the symbol, never the whole block
- a double click types into the line on the canvas
- Shift-click or dragging a box over things picks several
- Cmd+A picks everything
- clicking empty space deselects

**Phase 4: handles and keyboard.**
- Four corner handles change the size and two side handles change the width (lines get a stored width).
- A small floating bar sits above the selection: duplicate, delete, lock.
- Keys: Delete, arrows (Shift for bigger steps), Cmd+D, Cmd+C/V, Esc.

**Phase 5: colour and font pickers.**
- Colour: "Colours in this invite" first, then the full picker with a hex field.
- Fonts: "Fonts in this invite" first, a search box, groups (Script, Serif, Display, Hindi), and a live preview on the canvas when you hover.

**Phase 6: stop the stack from reshuffling.** Once a line has been moved by hand, it stays where
you put it. Adding a line or changing another line's size no longer moves it. A Position panel
has "align to page" buttons (top, middle, bottom, left, centre, right) and forward and backward.

**Leave as they are:** the export, the motion system, the designs library, the page strip
logic and the PDF sheet. Those work.
