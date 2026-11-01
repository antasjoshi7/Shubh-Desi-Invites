# Growth playbook: SEO, Pinterest, Twitter, GitHub

Written 1 November 2026. Goal: as many families as possible find the tool before the
February–March 2027 wedding season, while you learn SEO and end up with a project worth putting on a CV.

Contents
1. The thesis in one paragraph
2. What the research says (with weights)
3. Can AI write the content? The verdict
4. The strategy: five levers, in order
5. Everything that was built today, and why
6. SEO jargon, explained
7. The site map
8. Content roadmap (what to publish, week by week)
9. Backlinks: the plan
10. Pinterest
11. Twitter / X
12. What fast-growing tool sites did
13. Setup checklist: what only you can do
14. GitHub and the CV

---

## 1. The thesis in one paragraph

General tools (Canva, VEED, FlexClip) can make a wedding invite, but they're built for everything, so
an Indian family has to hunt through templates, fight a layout, hit paywalls or watermarks, and make
an account. Paid Indian invite sites charge ₹499 to ₹5,000 per video. We're the iLovePDF of Indian
wedding invites: one job, free, no sign-up, no watermark, private, great on a phone. There's no moat
in the code; the moat is **ranking first and being the one people forward**. That comes from SEO
(slow, compounding), Pinterest (medium, visual, built for weddings), and word of mouth (every invite
is seen by 100 to 300 guests).

---

## 2. What the research says (with weights)

How each source was weighted:
- **High** = primary source or large data (Google's own docs, a 600k-page study, the competitors' live pages).
- **Medium** = experienced practitioners describing their own method, where the claims hang together.
- **Low** = marketing threads selling a product, single anecdotes, unverifiable numbers.

Reddit blocks my access (it refuses AI crawlers), so "real user" evidence came from Hacker News
threads, practitioner write-ups, and the replies under your bookmarked question on X.

| # | Source | Weight | What we took from it |
|---|---|---|---|
| A | Google Search Central: *Using generative AI content* | **High** | AI content is allowed. Mass-producing pages "without adding value for users" is spam (*scaled content abuse*). Fact-check everything, including titles, descriptions and alt text. |
| B | Ahrefs study, 600k ranking pages (July 2025) | **High** | Correlation between AI share and ranking: 0.011, effectively zero. 87% of top pages contain some AI. Top-1 pages lean slightly more human. |
| C | Competitor pages (Crafty Art, Pikaaso, VEED, FlexClip, Canva) | **High** | Crafty Art ranks with a template grid + ~1,500 words + FAQ + regional sub-pages (`/create/gujarati-wedding-invitation-video`…). Pikaaso charges ₹499–5,000. Nobody leads with "free, no watermark, no sign-up, private" as a fact they actually deliver. |
| D | @VengeonsP (Paul, ChatSEO): *How to build an SEO team* | **Medium–High** | The single most useful piece. Five levers carry rankings, in order: **search intent → keyword in title → internal links → site authority → links to the page.** Everything else is polish. One keyword, one page. Pace: 1–2 new pages a week on a young site. Don't edit a page for ~90 days after a change. Under 50 referring domains: long-tail only, and start free homepage links now. "Does any competitor have this exact keyword in its title?" is the fastest opportunity test. Fill-in-the-blank city pages got hit in the March 2026 spam update. |
| E | @BuildingWaves (Voicy, $12k MRR from SEO) | **Medium** | Content must be readable (7th-grade level, no jargon, no AI tells like em dashes), fact-checked, with images and CTAs. Use **PostHog** to see which pages lead to the action you care about (for us: video exported), then write more of those. Give it 3 months. (It's also an ad for his product.) |
| F | @RobHoffman_ (AI search / "AEO") | **Medium** | AI assistants read raw HTML, so key facts must be in text, not images or JavaScript. First H2 = the reader's question; answer it in under 100 words; give honest "it depends" comparisons; define the product plainly (what, who, does what); add "updated" dates; allow AI crawlers in robots.txt; use semantic HTML and labels. |
| G | @wespreadjam (HubSpot's AI search case) | **Low–Medium** | Pattern worth copying at our scale: answer early "what is / how to" questions, build specific comparison pages, and get mentioned on the third-party pages AI already cites (lists, Reddit threads). Big-company numbers don't transfer. |
| H | @tarasshyn (force-index backlinks) | **Low–Medium** | New backlinks can take weeks to be noticed. Cheap fix we used: **IndexNow** for our own pages (free, official). Paid "indexer" services are a grey area; skip for now. |
| I | @sven_ai (free open-source SEO tools) | **Medium** | Free tools instead of Ahrefs/Semrush: SEOnaut (site audit), SerpBear (rank tracking). Use Search Console first; add these later if useful. |
| J | Replies under @2whazzuup's question | **Medium** | "Intent matching does the work"; "ship genuinely useful free tools or data pages, then use them as the reason to ask for links"; "directories help early"; "organic Reddit comments where people ask for what you solve"; "social/video is the kindling, organic is the log". |
| K | Hacker News: one-feature tool to $7k/mo | **Medium** | Top channel was **web directories** (50%+ of paying users), then helpful replies in communities, then cross-links. Directory submissions are a legitimate, fast first step. |
| L | Smallpdf / iLovePDF (company blog, Ahrefs, OneSky case study) | **Medium–High** | iLovePDF: no launch, no ads, word of mouth, **no account needed** (they call it "a big part of why the number is what it is"); about 46% of traffic from Google, 43% direct. Smallpdf: one page per tool, then **translation into 20+ languages** (+60% organic; Thai alone +500%). |
| N | @chrissimpson (local-SEO checklist) | **Low–Medium** | Mostly for local businesses (Google Business Profile, press releases): skip those, and skip "keyword in every H1–H6, 5% more than competitors" (outdated stuffing). Useful: a video on the page gets **video structured data and a text description** (done for the animations); start **3–4 months before your season** (that's now); plain HTML, because a JavaScript-only page can look blank to Google; pick **www or non-www** and use it everywhere; first backlinks should use the **brand name** as link text; one page per service, with a hub linking to all of them. |
| M | Pinterest data (Pinterest reports via press) | **Medium** | Wedding is one of Pinterest's biggest categories: billions of wedding searches a year; Indian searches like "desi wedding decor" and "dulha haldi" up sharply. Pins keep sending traffic for months. Timelines for new accounts (2 weeks to 3 months) are anecdotal. |

**What I deliberately didn't take:** the "nine bots" automation (overkill until you have data), paid
indexers, buying links, llms.txt (Paul: "not a lever"), keyword density scores, and launching
dozens of pages at once.

---

## 3. Can AI write the content? The verdict

**Yes, with three conditions.** Google judges *the page*, not *who typed it* (A, B). What gets
punished is the pattern: many similar pages, no original value, nobody checked them (A, D).

1. **Every page must add something.** For us that's real things: the tool itself, sample invites
   rendered by the tool, wording people actually use, honest answers. A guide that only says what ten
   other pages say won't rank, whoever wrote it.
2. **A human checks every fact.** Dates, customs, Hindi spelling, prices. AI drafts are confidently wrong.
3. **The parts only you can add go in by hand:** your brother's wedding, real printer quotes, what
   relatives said, photos. This is "experience", the first E of Google's E-E-A-T quality guidelines,
   and it's exactly what the 2026 updates protect (D).

How it was applied today:
- Landing pages, wording and the how-to guide: drafted by AI, every product claim checked against the
  code (sizes, limits, menu names). **Published.**
- Hindi wording: standard card phrases, rendered and checked visually. **Published, but have a native
  speaker read it once** (lib/content/wording.ts, "hindi" group).
- Guides that need your experience: written as **drafts with a writing brief** in content/guides/.
  They stay hidden from Google until you fill them in and set `status: published`.

---

## 4. The strategy: five levers, in order

From source D, mapped to us:

1. **Search intent.** One page per kind of search, in the shape Google already shows. "haldi
   invitation video" wants a tool with examples; "wedding invitation wording" wants a list to copy;
   "hindi wedding card matter" wants text in Hindi. *Done for 8 searches today.*
2. **Keyword in the title.** Every title starts with its exact search phrase: "Haldi Invitation Video
   Maker (Free, No Watermark)". *Done.*
3. **Internal links.** Every page links to its siblings inside sentences, with the exact phrase as the
   link text, and the footer links to everything. *Done; keep doing it in every guide.*
4. **Site authority (links to the domain).** You have zero today. Start the free ones now (section 9).
5. **Links to specific pages.** Later, for competitive terms, once a page has done its 90 days.

**Pace and patience.** A new domain usually takes 2 to 4 months to get steady Google traffic. For
February weddings, pages need to be live and linked **this month**. Then add 1 to 2 strong pages a
week, and don't tinker with a page for 90 days after publishing.

**Channels by speed:**
- This week: directories + Twitter + WhatsApp (people you know) → first users and first links.
- 2 to 8 weeks: Pinterest pins start sending visitors.
- 2 to 4 months: Google traffic builds and compounds.

---

## 5. Everything that was built today, and why

### Site structure
| What | Where | Why |
|---|---|---|
| The editor moved from `/` to `/create` | `app/create/` | The editor is drawn on a canvas, which Google can't read. The home page is now readable text that ranks; the editor is one tap away. `/create` is marked **noindex** so Google doesn't index an empty-looking page. |
| Home page = "Free Indian wedding invitation video maker" | `app/(site)/page.tsx` | Targets the main search. Definition sentence, question-as-first-H2 with a <100-word answer, steps, events, designs, an honest "is this better than Canva?" comparison, FAQ. |
| 4 event pages | `/haldi-`, `/mehendi-`, `/sangeet-`, `/reception-invitation-video` (content in `lib/content/events.ts`) | One search each. Each has sample invites, what to write, 5 wordings to copy (incl. Hinglish), a WhatsApp message, dress codes, timing, motions, how-to steps and FAQs. |
| Wedding e-card page | `/wedding-e-card` | "digital wedding card / e-invite" is a different search from "video". Explains PNG export. |
| Wording collection | `/wedding-invitation-wording` (`lib/content/wording.ts`) | 23 examples: traditional, from parents, from the couple, Hindi, RSVP, WhatsApp messages. "Wording" searches are huge, and the page is a natural thing for other sites to link to. |
| Designs gallery | `/designs` | All 197 designs by category; each opens the editor on that design. |
| Guides | `/guides`, `content/guides/*.md` | Written in Markdown so you can write them like a doc. 1 published, 6 drafts with briefs. |
| About, Privacy, Terms | `content/pages/*.md` | Trust pages. Privacy is published (accurate to what the site does). About and Terms are drafts for you. |
| 404 page | `app/not-found.tsx` | Sends lost visitors back to the main pages instead of a dead end. |
| Deep links into the editor | `/create?event=haldi&design=…` (`startFrom` in `lib/defaults.ts`) | "Use this design" on any page opens the editor on that event and design. Saved work is kept: the new page is added, and Undo removes it. |

### Technical SEO
| What | Where | Why |
|---|---|---|
| Titles, descriptions, canonical URLs | each page's `metadata` | What shows in Google results; canonical says "this is the official address of this page". |
| Share previews (Open Graph + Twitter cards) | `public/og/*.jpg` (made by `npm run brand`) | The picture and title that appear when a link is posted on WhatsApp, Twitter or Pinterest. Each event has its own, showing real sample invites. |
| Structured data (JSON-LD) | `lib/schema.ts` | Organization, WebSite, WebApplication (free, price ₹0), FAQPage, HowTo, BreadcrumbList, Article. Helps Google and AI assistants understand each page. |
| Sitemap | `/sitemap.xml` (`app/sitemap.ts`) | The list of pages for Google and Bing. Drafts and the editor are left out automatically. |
| robots.txt | `/robots.txt` (`app/robots.ts`) | Allows all crawlers, and names the AI crawlers (ChatGPT, Claude, Perplexity, Gemini, Meta AI, Apple) explicitly so assistants can recommend us. |
| RSS feed | `/feed.xml` | New guides get picked up by feed readers and aggregators. |
| IndexNow | `scripts/indexnow.mjs`, key file in `public/` | Pings Bing (which also powers ChatGPT search and Copilot) about new pages; crawled in hours, not weeks. Run `npm run indexnow` after each deploy that adds pages. |
| Favicon and app icons | `app/icon.svg`, `app/apple-icon.png`, `public/icon-*.png` | Shows next to your result in Google and on phones' home screens. |
| Web app manifest | `/manifest.webmanifest` | "Add to Home screen" opens the editor like an app. |
| Verification tags | `app/layout.tsx` (env vars) | One-line ownership checks for Google Search Console, Bing and Pinterest. |
| Breadcrumbs | `components/site/Crumbs.tsx` | "Home › Haldi invitation video" on every page, plus the structured version Google shows in results. |
| Semantic HTML | site components | Real `<header>`, `<nav>`, `<main>`, `<footer>`, one `<h1>` per page, ordered headings, alt text on every image, FAQs as plain text. Easy for crawlers and screen readers. |
| "Updated" dates | pages + `SITE.updated` in `lib/site.ts` | Freshness signal for people and AI assistants (F). |
| One place for name and domain | `lib/site.ts` | Change the brand or domain once; every page, sitemap and share image follows. |

### Animation previews (the main difference from Canva and Adobe)
- **15 preview clips** (5.6 s, 432×768 MP4, ~600 KB each) and poster frames in `public/motions/`,
  rendered by the tool itself; descriptions in `data/motions.json`.
- **New page `/animated-wedding-invitation`**: all 15 with descriptions, a "which animation for which
  function" table, FAQ, and a **VideoObject** structured-data entry per clip (lets them show in Google's
  video results).
- **Home** has an "Invites that come alive" strip (6 clips); **each event page** shows 6 suitable ones.
- Clips only download and play while on screen (`components/site/MotionReel.tsx`), so pages stay fast.
- Tapping a clip opens the editor with that design and animation: `/create?design=…&motion=doors`.
- The same clips make good **Pinterest video pins** and Twitter posts.

### Images and marketing assets
- **25 sample invites** rendered by the tool itself (`public/samples/`): real names, dates and venues
  on real designs, including one in Hindi. Used across the pages and share images.
- **25 Pinterest pins** (1000×1500) in `marketing/pinterest/`, with `pins.tsv` listing each pin's
  title, the page to link to, and a description.

### Analytics (PostHog), ready but off
- `lib/track.ts` + `components/Analytics.tsx`. Turns on only when `NEXT_PUBLIC_POSTHOG_KEY` is set.
- **Cookieless mode**: no cookies, no local storage, no cookie banner. Nothing typed into an invite is
  ever sent.
- Events recorded: `editor_opened` (with which event or design it came from), `design_picked`,
  `video_export_started`, `video_export_done` (length, time taken, which events),
  `video_export_failed`, `png_downloaded`.
- The number that matters: **exports per visitor, by landing page.** That tells you which pages to
  write more of (E).

### Product fix found on the way
- Hindi names in the "Names" style rendered broken because letter spacing drew one character at a
  time, which breaks Devanagari joining. Letter spacing is now skipped for Indian scripts and Urdu
  (`lib/render.ts`). The Hindi sample shows it fixed.

---

## 6. SEO jargon, explained

- **SEO**: making pages that Google can read, trusts, and finds the best answer for a search.
- **Crawling / indexing**: Google's robot (Googlebot) visits pages (crawling) and stores them in its
  library (indexing). Only indexed pages can appear in results.
- **Title tag**: the blue headline in Google results (`<title>`). The strongest on-page signal.
  Keyword first, under ~60 characters.
- **Meta description**: the grey text under the title in results. Doesn't affect ranking directly,
  but a good one gets more clicks. Under ~155 characters.
- **Meta tags**: hidden lines in a page's `<head>` that describe it to machines: title, description,
  robots (index or not), canonical, Open Graph. "Meta tagging" = filling these in properly.
- **Canonical URL**: "if you find this page at several addresses, this is the real one." Prevents
  duplicate-page confusion.
- **noindex**: "you may visit, but don't put this page in results." Used for `/create` and drafts.
- **Sitemap**: an XML list of all your pages and when they changed, submitted to Search Console.
- **robots.txt**: a file at the root telling crawlers what they may visit.
- **Structured data / schema / JSON-LD**: a machine-readable summary of the page (e.g. "this is a
  FAQ with these questions"). Can earn rich results and helps AI assistants quote you.
- **Open Graph (OG)**: the tags that control the preview card when a link is shared.
- **H1, H2…**: headings. One H1 (the page's main title), H2s for sections. Google and AI use them to
  understand structure.
- **Alt text**: a description of an image for blind users and for Google Images.
- **Internal links**: links between your own pages. Free, fully in your control, and they tell Google
  which pages matter. **Anchor text** is the clickable words.
- **Backlinks / referring domains**: links from other websites to yours. Each one is a vote of
  trust. "Referring domains" counts unique sites.
- **Domain Rating / Authority (DR/DA)**: third-party scores (Ahrefs, Moz) estimating a site's link
  strength. Not used by Google itself, but a useful gauge.
- **Search intent**: what the searcher actually wants (a tool, a list, an explanation, a place).
- **Long-tail keywords**: longer, specific searches ("haldi invitation message in hindi"). Lower volume,
  much easier to rank for. A new site should start here.
- **E-E-A-T**: Experience, Expertise, Authoritativeness, Trust. Google's quality yardstick.
- **Impressions / clicks / CTR / position**: Search Console numbers: times you appeared, times
  you were clicked, clicks ÷ impressions, average rank.
- **Core Web Vitals**: Google's speed and stability measures. Our landing pages are light static HTML,
  so they're fast.
- **Programmatic SEO**: generating many pages from a template + data (e.g. one per region). Works when
  each page is genuinely different; gets penalised when it's thin.
- **AEO / GEO**: "answer engine" / "generative engine" optimisation: getting cited by ChatGPT,
  Perplexity and Google's AI answers. Mostly the same as good SEO, plus clear text definitions.
- **IndexNow**: a free protocol to tell Bing and others instantly that a page is new or changed.
- **RSS**: a feed of new posts that readers and aggregators subscribe to.

---

## 7. The site map

```
/                                   Free Indian wedding invitation video maker   (main keyword)
├── /haldi-invitation-video         Haldi …                                      (event pages)
├── /mehendi-invitation-video
├── /sangeet-invitation-video
├── /reception-invitation-video
├── /animated-wedding-invitation    15 animation previews (video structured data)
├── /wedding-e-card                 digital card / e-invite
├── /wedding-invitation-wording     wording hub (23 examples)  → links to each event's #wording
├── /designs                        all 197 designs → each opens the editor
├── /guides                         articles (Markdown, content/guides)
│   └── /guides/how-to-make-wedding-invitation-video-on-phone   (published)
├── /about  /privacy  /terms        trust pages (content/pages)
├── /create                         the editor (noindex)
├── /sitemap.xml  /robots.txt  /feed.xml  /manifest.webmanifest
```

Next patterns to add (each one page at a time, only when each page can be genuinely different):
- **More events**: engagement / roka / sagai, tilak, mata ki chowki, griha pravesh (needs new page
  types in the tool or a custom page), save the date.
- **Regional**: Marathi, Gujarati, Punjabi, Marwari, Bengali, South Indian wedding invitations.
  Crafty Art ranks with exactly this pattern. Each needs real regional wording and customs checked by
  someone from that community; never a find-and-replace page.
- **Wording deep dives**: Hindi card matter (draft ready), invite for colleagues, invite from
  grandparents, RSVP lines.
- **Comparisons** (lever 1 for "best/alternative" searches): "free Canva alternative for Indian
  wedding invites", "best free wedding invitation video maker (2027)". Honest, with a table.
- **Translations** (Smallpdf's move): a Hindi version of the home page and event pages, later.

---

## 8. Content roadmap

Rule: **1 to 2 pages a week**, each better than what Google shows today. Don't edit a published page
for ~90 days unless something is wrong. Track each in a simple list (page, date, target search).

| Week | Publish | Who |
|---|---|---|
| Now | Everything built today (8 pages + 1 guide) | done |
| 1 | About page; How I made my brother's invite (story, also your Twitter launch post) | you |
| 2 | Hindi wedding card wording (needs a native speaker) | you + family |
| 3 | When to send wedding invitations (timeline) | AI draft + your family's practice |
| 4 | Digital vs printed cards: real prices (call 2–3 printers first) | you |
| 5 | WhatsApp invitation etiquette | you + relatives |
| 6 | Why Ganesh ji is on wedding cards (check with an elder or pandit) | you |
| 7+ | Next patterns from section 7, guided by Search Console: write for queries where you already get impressions at positions 5–20 | |

Before writing anything new, check Search Console (after ~4 weeks): **queries with many impressions
and few clicks at positions 5–20 are your quick wins.** Usually the fix is putting that query in the
title of the page that's already showing.

**Keyword list (you).** In Google Keyword Planner, export the volumes for these seeds and save the CSV
as `docs/keywords.csv`: wedding invitation video, wedding invitation video maker, haldi invitation,
haldi invitation message, mehndi invitation, sangeet invitation, reception invitation, wedding card
design, e invite wedding, digital wedding invitation, shadi card matter, wedding card matter in hindi,
wedding invitation message for whatsapp, save the date video, engagement invitation video, plus
regional variants (marathi/gujarati/punjabi/south indian wedding invitation). That tells us which
pattern to build next.

---

## 9. Backlinks: the plan

Under ~50 referring domains, only long-tail searches are reachable (D), so start now, free, in
parallel with content. Order by effort:

**This week (free, ~2 hours):**
1. **Product directories**: Product Hunt (launch on a Tuesday–Thursday), AlternativeTo (list as an
   alternative to Canva / InVideo / VEED for invites), SaaSHub, Indie Hackers
   (product page), BetaList, Uneed, Microlaunch, Peerlist (Indian builders).
   A directory link is weak alone, but they add up and get you first visitors (K).
2. **Your own profiles**: GitHub repo (website field), Twitter bio, LinkedIn "projects", Pinterest
   profile. Real, permanent links you control.
3. **Show HN**: "Show HN: A free Indian wedding invite video maker that runs entirely in the browser".
   The privacy angle (no upload, no server) and the code-drawn horse are what HN likes.

**Next weeks (earned links):**
4. **Linkable asset**: the wording page and the Hindi wording guide are what wedding blogs link to.
   Email 10–20 Indian wedding bloggers or planners: "free tool for your readers, no sign-up". Expect
   1 in 5 to reply (J).
5. **Communities, genuinely**: answer questions where people ask for invite help (Quora, wedding
   Facebook groups, r/IndianWeddings, r/india wedding threads). Help first; link only when it answers
   the question (J, K).
6. **Your story**: a "built this for my brother's wedding" post on LinkedIn and Twitter. Personal
   stories get shared and occasionally picked up by newsletters.
7. **Local press / college**: alumni newsletters and student media love "student builds free tool
   used by X families".

**Don't:** buy links, use link farms, swap links in bulk, or "disavow" junk links (Google ignores bad
links rather than punishing them (D)).

---

## 10. Pinterest

Why it fits: Pinterest is a visual search engine and wedding is one of its biggest categories; pins
keep sending traffic for months (M). Our product *is* pictures.

Setup (30 minutes, you):
1. Create a **Pinterest Business** account (free) with the site's name.
2. **Claim the website**: Pinterest gives a verification code; add it in Vercel as
   `NEXT_PUBLIC_PINTEREST_VERIFICATION` and redeploy. Claimed sites get attribution and analytics.
3. **Rich Pins** work automatically from our Open Graph tags once the site is claimed.
4. Make boards named like searches: "Haldi Invitation Ideas", "Mehendi Invitation", "Sangeet
   Invitation", "Indian Wedding Invitation Video", "Hindi Wedding Card", "Wedding Invitation Wording".

Pinning:
- Upload the 25 pins in `marketing/pinterest/`. Use `pins.tsv` for each pin's title, description
  and link (put your domain in front of the path).
- Pace: a few fresh pins a day beats 25 at once. New design, new wording, or a new crop counts as fresh.
- Titles and descriptions use the search words people type ("Haldi invitation card design, free
  video maker, yellow marigold").
- **Video pins now**: the 15 animation clips in `public/motions/*.mp4` are ready-made video pins;
  link each to `/animated-wedding-invitation` or the matching event page.
- Later: screen recordings of making an invite (6–15 seconds) and
  **wording pins** (an invite with the wording visible, linking to the wording page).
- Pinterest Trends (trends.pinterest.com) shows what Indian brides search each month. Check it
  before making new pins.

To regenerate pins after adding samples: `npm run brand`.

---

## 11. Twitter / X

Use your **own name**. The CV value only exists if the result is attached to you.

- **Build in public**: weekly posts with real numbers ("Week 3: 41 impressions, 2 clicks, 7 videos
  exported"). Screenshots of Search Console and PostHog.
- **Video beats text**: a 20-second screen recording of making an invite; the horse animation.
- **Replies before posts**: thoughtful replies under SEO/indie-builder accounts (like the ones you
  bookmarked) get a new account seen.
- **Wedding-season moments**: Indian Twitter jokes about weddings all season; a funny, useful demo
  reply can reach real users.
- Launch thread = the "how I made my brother's invite" story + link.
- Hold off on ads until you know which page turns visitors into exports.

---

## 12. What fast-growing tool sites did

- **iLovePDF** (860M visitors a year, no investors, no ad campaigns): one tool per job, works without
  an account, word of mouth; about half the traffic from Google, nearly half direct (people come back
  by typing the name). **Lesson: never add a sign-up wall; make the name memorable.**
- **Smallpdf** (500M users): one landing page per tool, then translated into 20+ languages; the Thai
  version grew 500% in a year. **Lesson: one page per job; Hindi (and later regional) versions are a
  real growth lever once the English pages work.**
- **Crafty Art** (Indian competitor, ranks for our terms): template grid + long copy + FAQ + regional
  pages. Weak spots: keyword stuffing, vague about watermarks, typos. **Lesson: same structure, but
  honest, cleaner, and actually free.**
- **Pikaaso / SeeMyMarriage**: paid per video (₹499–5,000). **Lesson: "free and made in 5 minutes"
  is the headline.**
- **Index Rusher (HN case)**: directories brought 50%+ of users in month one.

To see traffic for any site yourself: **Similarweb** (free, rough monthly visits, traffic sources),
**Ahrefs free Website Traffic Checker / Backlink Checker**, and **Semrush free tier** (10 lookups a
day). Compare craftyartapp.com, pikaaso.com, veed.io/create/… and canva.com/create/wedding-invitation-videos
every month to see what grows.

---

## 13. Setup checklist: what only you can do

In this order:

0. **Decide about 7 fonts before going public.** Royal, Royal Glamour and Royal Moscow are licensed
   for *personal use only* and their licences forbid putting them on any website
   (`public/fonts/licenses/`). Dehanna, Kharisna, Taj Mahal and Arivndr Pomt have no licence file, so
   their terms are unknown. The live site already serves them, and a public GitHub repo would share
   them too. Either remove them (the other 16 fonts are open-licence) or buy commercial licences.
   The Terms page says fonts are open-licensed, which is only true once this is sorted.
1. **Buy the domain.** Then in Vercel: Project › Settings › Domains › add it; follow the DNS
   instructions at your registrar.
   Pick **one** version of the address (`yourdomain.com` *or* `www.yourdomain.com`), let Vercel
   redirect the other to it, and use that exact version everywhere (Pinterest, Twitter, directories).
2. **Set environment variables** in Vercel (Project › Settings › Environment Variables), then redeploy:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |
   | `NEXT_PUBLIC_AUTHOR_NAME` | your name (shown on guides) |
   | `NEXT_PUBLIC_SAME_AS` | your profile links, comma-separated (Twitter, GitHub, LinkedIn, Pinterest) |
   | `NEXT_PUBLIC_POSTHOG_KEY` | from PostHog › Project settings (starts `phc_`) |
   | `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` or `https://eu.i.posthog.com` (match your PostHog region) |
   | `NEXT_PUBLIC_GOOGLE_VERIFICATION` | only if you verify Search Console with the HTML-tag method |
   | `NEXT_PUBLIC_BING_VERIFICATION` | only if you use Bing's meta-tag method |
   | `NEXT_PUBLIC_PINTEREST_VERIFICATION` | the code from Pinterest's "claim website" |

   (A copy of this list is in `.env.example`.)
3. **If you rename the brand**, change `name` in `lib/site.ts` (and `short_name` in `app/manifest.ts`),
   then run `npm run brand` to remake the share images and pins.
4. **PostHog**: sign up (free tier: 1M events a month), create a project, and **turn on cookieless
   mode in the project settings** (required, or cookieless events are dropped). Copy the key into Vercel.
5. **Google Search Console** (search.google.com/search-console): add a **Domain property**, verify
   with the DNS TXT record your registrar lets you add, then Sitemaps › submit `sitemap.xml`. Use
   URL Inspection › Request indexing for the home page and event pages.
6. **Bing Webmaster Tools** (bing.com/webmasters): "Import from Google Search Console" (one click),
   then run `NEXT_PUBLIC_SITE_URL=https://yourdomain.com npm run indexnow`.
7. **Read the Hindi lines once** (lib/content/wording.ts, "hindi"), or ask a parent.
8. **Write the About page** (content/pages/about.md) and set it to `status: published`. Review
   Terms and publish them too.
9. **Directories, Pinterest, Twitter**: sections 9–11.
10. **Later, every Monday (30 min)**: Search Console (queries at positions 5–20), PostHog (exports
    by landing page), then decide the week's one page.

---

## 14. GitHub and the CV

**Your understanding is right**, with three small additions:

1. **The local repository is already set up** (this folder is now a git repository with a first
   commit, and `.gitignore` keeps out build files, `node_modules` and secrets).
2. **You make the repo on GitHub**: github.com › New repository › name it (e.g. `shaadi-video-maker`)
   › **don't** tick "add README" (we have one). Public is better for a CV. Then either tell me the URL
   or run:
   ```bash
   git remote add origin https://github.com/<you>/shaadi-video-maker.git
   ```
   ```bash
   git push -u origin main
   ```
   The first push asks you to sign in to GitHub (a browser window or a token).
3. **Connect Vercel to the GitHub repo** (Vercel › Project › Settings › Git). From then on, every
   push deploys automatically, and you get a preview link for every change.

Also worth doing: put the live link in the repo's "About" box, and add 2–3 screenshots or a GIF to
the README.

**How it shows on a CV:**
- One line: "Built and grew a free Indian wedding invite video maker to N monthly users via SEO and
  Pinterest, with no ad spend" (fill in N from PostHog / Search Console).
- Proof: GitHub repo + live site + a one-page case study (problem, thesis, what you built, how you
  grew it, numbers, mistakes) + screenshots of Search Console clicks over time.
- Be upfront that you built it with an AI coding agent; directing AI to ship and grow a real product
  is the skill.
