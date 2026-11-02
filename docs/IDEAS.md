# Ideas to explore

Product ideas beyond "make an invite", scored roughly. None are committed; we pick after launch, with
data. Constraint to remember: the tool has no server or database today, so anything that needs one is
marked, and the first version of each idea should work without one where possible.

Competitor context: WedMeGood (very popular wedding site) sells paid video invites; template sites charge
₹199–500 per video; invitation websites ₹1,699+; designers ₹2,000–30,000 (docs/keywords.md, research/reddit).

| Idea | What it solves | Value | Effort | No server? | Revenue later |
|---|---|---|---|---|---|
| **Personal invites per guest** | Bulk forwards feel cold. Paste the guest list, get a card and message per guest with their name, sent via the phone's share sheet (about 4 taps each) | High | ~1 day | Yes | Indirect (word of mouth) |
| **Function-wise guest groups** | Not everyone is invited to everything (Haldi/Mehendi = close family, reception = office). Each group gets only its pages | High | Part of the above | Yes | – |
| **RSVP management** | Headcount for the caterer, per function. Light version: a WhatsApp link in the message ("Reply: 4 of us for the Sangeet") that opens a chat with the host, pre-filled; the tool tallies replies you paste back | High | 1–2 days light; much more for a full tracker | Light version yes; a live dashboard needs a server | Possible premium later |
| **Reminders** | The day before each function, a list of who to remind, with the message and location pin ready | Medium | Half a day | Yes | – |
| **Physical card commission model** | Families still print a few cards for elders and the temple. Print-ready PDF (5×7 in, 300 dpi) of the same design, plus "order prints" through a partner printer for a 10–15% commission | Medium–High | 2–3 days (high-res export) + finding a printer partner | Export yes; ordering through the partner's site | **Yes: the most natural revenue that keeps the tool free** |
| **Card as PDF / for print** | People search "wedding card PDF" and many families print a few cards. Download a page or the whole invite as a print-quality PDF; pairs with the print commission idea | Medium–High | ~1 day | Yes | Feeds print commission |
| **Your own card to video** | Upload a card you already have (designed elsewhere or scanned) and add our animations and music around it. A genuine "card to video" feature for the same audience | Medium | 1–2 days | Yes | – |
| **Other occasions** | Griha pravesh, baby shower, mundan, pooja, birthday. Same engine; people in the Reddit threads pay for these too | Medium | Designs + wording per occasion | Yes | – (big SEO surface) |
| **Shagun diary** | After the wedding, families note who gave what (the lifafa list) to return it later. A simple private list linked to the guest list | Medium | 1 day | Yes (stays on the phone) | – (keeps people coming back) |
| **Add to calendar + map for elders** | Per-function calendar file and location link in each guest's message | Medium | Half a day | Yes | – |
| **Wedding website lite** | One page with all functions, maps, RSVP | Medium | Large | No (needs hosting) | Paid tier possible; competes with ₹1,699 sites |
| **Planner / printer white-label** | Give the tool to card printers and planners to make invites for their clients | Medium | Medium | Yes | Partnerships |

## Suggested wedge (to decide after launch)

**"The family invite kit"**: personal invite per guest + function-wise groups + WhatsApp RSVP +
reminders. It turns the tool from "make a video" into "send all your invites properly and know who's
coming", which no free tool does and which WedMeGood-style paid cards don't do either. It needs no
server. Later, **print commission** is the revenue that doesn't require putting anything behind a paywall.

## The personalisation wedge: "the digital nyota"

The custom being replaced: elders go home to home with the card (and often sweets) and invite each
family by name. A WhatsApp forward loses exactly that. The wedge is to bring the visit back, with almost
no extra work for the family:

1. **Name on the opening.** Each guest's video opens with their name: the palace doors open on a name
   plate reading "Sharma Parivar", or an envelope addressed to them. Only that short opening is made per
   guest; the rest of the video is shared, so making 200 personal videos stays fast.
2. **Relation-aware greeting.** The salutation follows Indian etiquette from a one-word tag the tool can
   mostly guess from the name typed: "Aadarniya Mamaji evam Mamiji" for elders, "Dear Rahul" for
   friends, "Dear Mr. Mehta" for the office. No free tool gets honorifics right; it's the culture-first part.
3. **Parents' voice saying the name** (version 2). A parent reads the guest list aloud once; the tool cuts
   it into names by the pauses and places each one into a short spoken line ("Namaste ___, aapko zaroor
   aana hai") over the music. To an elder, it sounds like a personal phone call.
4. **Send list.** One tap per guest opens the share sheet with that guest's video or card and message.

Input from the family: paste the guest list (or pick from contacts on Android), check the guessed tags,
optionally read the names aloud once. Version 1 (1–3 + send list, without voice) is about two days;
voice is about two or three more. No server needed.
