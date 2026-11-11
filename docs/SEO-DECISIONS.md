# SEO decision log

Every SEO and site-optimisation decision made so far: what we did, why, and where you can see it on
the site. Written 9 November 2026, after the first full deploy. For the strategy and the jargon
explained, see SEO-PLAYBOOK.md; for what's next, ACTIONS.md.

---

## 1. How the site is put together

**1.1 The editor moved from `/` to `/create`, and `/` became a landing page.**
Why: the editor draws everything on a canvas, which Google reads as an empty page. The home page is
the strongest page on any site, so it had to be text Google can read.
On the site: `/` is the landing page; the "Make invite" buttons lead to `/create`.

**1.2 The editor is set to "noindex, follow".**
Why: an empty-looking page in Google's index does nothing for us and dilutes the site. "Follow" still
lets Google pass through its links.
On the site: invisible; it's a tag in `/create`'s page header.

**1.3 Every page is built ahead of time as plain HTML (static export).**
Why: Google and AI crawlers read raw HTML instantly. Pages that need JavaScript to show their text can
look blank to them.
On the site: open any page and "View source": all the words are there.

**1.4 The readable pages and the editor are kept apart.**
Why: the landing pages don't load the heavy editor code, so they open fast, which helps rankings and
keeps people from leaving.
On the site: the pages share a light header and footer (`app/(site)/`); the editor lives on its own.

**1.5 Addresses describe the search: `/haldi-invitation-video`, `/wedding-card-design`, and so on.**
Why: the words in an address are a small ranking signal and tell people what they'll get before they click.
On the site: every page address.

**1.6 Two addresses were renamed after the keyword data (`/designs` → `/wedding-card-design`,
`/wedding-e-card` → `/create-marriage-invitation-card`).**
Why: Keyword Planner showed "wedding card design" and "create marriage invitation card" at 100k–1M
searches a month. We renamed before launch, so no old links broke and no redirects were needed.

**1.7 One group of searches, one page (docs/keywords.md).**
Why: two pages aimed at the same search compete and both rank worse. So "Hindu wedding card design" and
"shadi card design" live on the same page as "wedding card design", not on pages of their own.
On the site: each page has a distinct job: card designs, creating a card, invite videos, animations,
each event, wording, prices.

**1.8 Clean addresses on Vercel (`cleanUrls` in `vercel.json`).**
Why: without it, only the home page loaded and every other page said "not found" (the files are
`create.html` and so on). Now `/create` works and `/create.html` redirects to it, so Google sees one
address per page.

**1.9 "Use this design" links open the editor ready to go (`/create?event=…&design=…&motion=…`).**
Why: the job of a landing page is to turn a visitor into someone making an invite. Landing on the exact
design and event they tapped removes a step. The extra bits are removed from the address once the
editor opens, so no duplicate addresses spread, and saved work is never overwritten (Undo takes the
change back).

**1.10 Drafts stay hidden.**
Why: thin or unfinished pages hurt the whole site's quality score. Pages marked `status: draft` are
kept out of Google ("noindex"), the sitemap, the menus and the RSS feed until they're ready.
On the site: `/about` and `/terms` load by their link but aren't in Google or the menus yet.

**1.11 A helpful 404 page.**
Why: a dead end loses the visitor. The "page isn't here" page links back to home, designs and wording.

---

## 2. On each page

**2.1 Titles start with the search phrase, stay under about 60 characters, and add one promise.**
Example: "Haldi Invitation Video Maker (Free, No Watermark)". Why: the title is the strongest on-page
signal and the headline in Google's results; "Free" and "No Watermark" are what people choose on.
Other pages get "| Shubh Desi Invites" added automatically, except where the name is already in the
title (that's why the About title doesn't say the name twice).

**2.2 Meta descriptions (the grey text under the title in Google) are under about 155 characters, with
the benefit and the search words.**
Why: they don't change rankings, but they decide whether people click.

**2.3 One main heading (H1) per page, containing the search phrase.**

**2.4 The first section heading is the reader's question, answered in under 100 words in a box.**
Example: "How do I make a Haldi invitation video for free?". Why: this is what Google lifts into featured
snippets and what AI assistants quote. (From the bookmarked post by @RobHoffman_.)

**2.5 A plain definition of the product** ("Shubh Desi Invites is a free online tool for making Indian
wedding invitation cards and videos on your phone…").
Why: assistants and Google both need to know what it is, who it's for and what it does; slogans
confuse them. It's used in descriptions and structured data site-wide.

**2.6 Honest "it depends" comparisons** (home: "Is this better than Canva for a wedding invite?" with a
table; price page: "Is it worth paying for an invite?").
Why: balanced answers get cited by AI assistants and trusted by readers; one-sided claims don't.

**2.7 FAQs as real text on the page,** in expandable sections that crawlers can read even when closed.
The questions come from real couples: the two Reddit threads you saved and forum research (links vs
files, elders, costs, Ganesh ji on digital cards, same designs, video vs picture).

**2.8 "Updated" dates and "as of" prices.**
Why: freshness is a signal, especially for AI assistants, and dated prices are honest.
On the site: "Updated November 2026" on landing pages; "Prices compared (November 2026)" on the price page.

**2.9 Numbers come from the tool itself, never typed by hand.**
Design counts, animation counts and so on update automatically. "200+ designs" only appears because
there really are 201; below 200 it would say "nearly 200".

**2.10 Keyword variants used once, naturally, never stuffed.**
Example: the home answer mentions "marriage invitation video" and "wedding card video" once each.
We rejected the "keyword in every H1–H6, 5% more than competitors" advice from one bookmarked post:
that's old-style stuffing that hurts readability and can trigger spam filters.

**2.11 Indian English and Hindi.**
Pages are marked `en-IN`; the wording page has Hindi (Devanagari) lines, because "shadi card matter
in hindi" is a big search.

**2.12 Honesty choices that protect rankings.**
- No made-up reviews or "used by celebrities" claims: fake review markup can get a site penalised, and
  it breaks India's consumer-protection rules on online reviews.
- No "stop paying for AI slop" line: our designs are AI-made too.
- No "photo to video" or "PDF to video" pages: the tool doesn't do photos, and off-topic tool pages
  dilute what the site is about.
- We say plainly that designs are shared templates.

**2.13 Plain sentences instead of "·" lists**, and no captions crowding the image grids.
Why: easier to read on a phone (your call), and cleaner pages keep people around longer.

---

## 3. Structured data (machine-readable summaries)

| Type | Where | What it does |
|---|---|---|
| Organization + WebSite | Home | Tells Google who's behind the site |
| WebApplication, price ₹0 | Home, event pages, animated page, card page | Marks it as a free web tool |
| FAQPage | Every page with an FAQ | Lets the questions show in results |
| HowTo | Home, event pages, card page | The 3-step "how to make it" |
| BreadcrumbList | Every page except home | Shows "Home › Haldi invitation video" in results |
| Article | Published guides | Dates and author (author appears once you add your name) |
| VideoObject | Every animation clip | Lets the previews appear in Google's video results |
| AggregateRating | Only once 5 real reviews exist | Star ratings; switched off until then |

---

## 4. Helping Google and AI assistants find and trust pages

**4.1 Sitemap** (`/sitemap.xml`): every published page with its last-changed date; drafts and the
editor left out. You submit it once in Search Console.

**4.2 robots.txt** (`/robots.txt`): everyone may read everything, and the AI crawlers are named and
allowed (ChatGPT, Claude, Perplexity, Gemini, Meta AI, Apple), so assistants can recommend the site.

**4.3 A canonical address on every page,** generated from one setting (`NEXT_PUBLIC_SITE_URL`).
Why: one official address per page. When the domain is bought, changing that one setting updates
every page, the sitemap and the share images. It stays on `.vercel.app` until then so we never point
Google at a domain we don't own.

**4.4 IndexNow** (`npm run indexnow` and a key file): tells Bing about new pages within hours. Bing
also powers ChatGPT search and Copilot.

**4.5 RSS feed** (`/feed.xml`) for guides, so feed readers and aggregators pick up new ones.

**4.6 Verification tags ready** for Google Search Console, Bing and Pinterest; each switches on when you
add its code.

**4.7 Not done on purpose: `llms.txt`.** It isn't a ranking lever (per the strongest of your bookmarked
posts); good HTML does the job.

---

## 5. Speed, images and video

**5.1 Light pages:** no editor code on landing pages, fonts served from our own site, no tracking
scripts unless analytics is switched on (and then only after the page has loaded).

**5.2 Images have fixed sizes, load lazily, and carry descriptive alt text,** e.g. "Haldi ceremony
invitation with date, time, venue and dress code on a marigold arch design".
Why: no layout jumping, faster pages, and Google Images can understand them. Sample files are named
by event (`haldi-1.jpg`).

**5.3 Real finished invites, not blank backgrounds.** 25 samples rendered by the tool itself, with
names, dates and venues filled in, and fewer, bigger lines so they read at thumbnail size.
Why: people searching "card design" want to see complete cards, and original images are something no
other site has.

**5.4 Animation previews built for speed:** small MP4s (432×768, about 600 KB each), not downloaded
until scrolled to, playing only while on screen, silent, with a still poster frame.
Why: video sells the animations, but heavy video would slow every page.

**5.5 Share images (1200×630) per page type,** showing real samples, so links look good on WhatsApp,
Twitter and Pinterest.

**5.6 The marigold favicon** appears next to the site in Google's results and on phone home screens;
a recognisable icon gets more clicks than a generic one.

**5.7 A web app manifest:** "Add to Home screen" opens the editor like an app.

**5.8 Built for phones first:** equal-width grids, a header that stays on one line, readable text sizes.

---

## 6. What content exists, and why each piece

| Page | Search it serves | Why it exists |
|---|---|---|
| Home `/` | wedding invite video, marriage invitation video, video maker (10k–100k each, rising for the season) | The main page for the video searches |
| `/wedding-card-design` | wedding card design and Hindu / shadi card design (the biggest group: 100k–1M) | Finished samples first, then all designs by style |
| `/create-marriage-invitation-card` | create marriage invitation card (100k–1M) | The "make a card" page; PDF download |
| `/animated-wedding-invitation` | animated wedding invitation | Where we're different from Canva and Adobe: every animation, with video |
| 4 event pages | haldi / mehendi / sangeet / reception invitation | Designs, wording, dress codes, timing, scenes for that function |
| `/wedding-invitation-wording` | wedding invitation wording / message, Hindi card matter | 23 examples to copy; a page other sites link to |
| `/digital-wedding-invitation-price` | digital wedding invitation price, wedding card price | Meets people at the moment they're about to pay; carries the "stop paying" message |
| One published guide | how to make a wedding invitation video on mobile | Step-by-step, checked against the real buttons |
| 6 draft guides + About | Story, timeline, Hindi card matter, real printer prices, WhatsApp etiquette, Ganesh ji | Need your experience to be worth publishing |
| `/privacy` | Trust | Google expects one; "never uploaded" is a selling point |

**6.1 AI-written content is used, with rules:** facts checked against the tool, nothing made up, and
the parts that need lived experience left for you. Google judges helpfulness, not who typed it.

**6.2 Pace:** 1–2 new pages a week, and pages aren't rewritten for about 90 days after publishing
(fixes only), because Google needs that long to judge a page.

**6.3 Report cards** (docs/page-tracker.csv): every page checked at 1 day, 1 week, 1 month and 3 months.

---

## 7. Turning visitors into invites (it feeds SEO too)

Google watches whether people find what they came for. These keep them on the site and using it:
- A clear "Make your invite, free" button on every page, plus event-specific ones.
- Every sample and animation opens the editor on that exact design and animation.
- PDF or pictures download with page ticks (it also answers the "wedding card PDF" search).
- A rating box after a video is made, to collect real reviews for the site.
- Privacy as a feature: nothing uploaded, cookieless analytics, a plain privacy page.

---

## 8. Name and domain

**8.1 Renamed to Shubh Desi Invites.** "Shaadi Video Maker" sounded like a photographer and undersold
the cards, which are the biggest search.

**8.2 Domain: shubhdesi.com** (plus .in). Short and easy to say aloud; "shubhdesiinvites" would be
mistyped because of the double "i".

**8.3 Pick www or not, and use that one version everywhere** (Pinterest, Twitter, directories).

---

## 9. Measuring it

**9.1 PostHog, cookieless, off until you add the key.** No cookie banner needed; nothing typed into an
invite is ever sent.

**9.2 What's recorded:** where people opened the editor from, designs picked, videos started and
finished, PDFs and pictures downloaded, ratings.

**9.3 The number that matters:** invites made per visitor, by landing page. It tells us which pages to
build more of.

**9.4 Search Console,** once the domain exists: searches, clicks and positions; the source for the
report cards.

---

## 10. Planned, not done yet (needs the domain or you)

Search Console and Bing setup; directory submissions; Pinterest (25 pins and 41 video clips ready);
Twitter build-in-public; your story and About page; the data goldmine (real card wording, 2027 muhurat
dates, a family survey, printer quotes).

## 11. Deliberately not done

| Not done | Why |
|---|---|
| llms.txt, keyword-density targets | Not ranking levers |
| Keyword in every heading H1–H6 | Stuffing; hurts readability |
| Buying links or press releases | Risky; Google discounts or penalises bought links |
| Dozens of city or regional pages | Thin template pages got hit in the March 2026 spam update; we'll add regional pages only with real regional wording |
| Photo-to-video / PDF-to-video pages | The tool doesn't do it; off-topic for the site |
| Fake reviews or celebrity claims | Penalty risk and against consumer rules |
| Paid "force indexing" services | Grey area; IndexNow and Search Console do it free |

## 12. Wedding mood board (11 November 2026)

`/wedding-mood-board` is the landing page and `/moodboard` is the tool, the same split as the home page
and `/create`: the tool is drawn in the browser, so it's `noindex` and the landing page carries the text,
the structured data and the links. Event pages link to it from their dress-code section (`#dress-code`),
which keeps the dress-code topic owned by the event pages for now. A separate dress-code hub waits for
the keyword lookup (docs/keywords.md).
