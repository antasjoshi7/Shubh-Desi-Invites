# Pending actions

The running to-do list for growing the site. Kept up to date at the end of every working session.
Last updated: 9 November 2026.

Marketing plan (wedges, channel playbooks, timeline): https://claude.ai/artifact/LdisrAbJhZiB2Yc5v9et9t

## Waiting on you

| # | What | Why it matters | Effort |
|---|---|---|---|
| 1 | **Buy shubhdesi.com on Cloudflare** (about $11.80/yr) and shubhdesi.in wherever renewal is cheapest (Porkbun or similar). Decided 9 Nov: **host on Cloudflare Pages** too (free, commercial use allowed). Then tell me | I move the site from Vercel to Cloudflare Pages, connect the domain in one click, and redeploy | 15 min |
| 2 | ~~Say "deploy"~~ **Done 9 Nov 2026**: everything is live at shubh-desi… (currently shaadi-video-maker.vercel.app until the domain is bought) | – | – |
| 3 | **Decide on the 7 restricted fonts** (Royal, Royal Glamour, Royal Moscow; Dehanna, Kharisna, Taj Mahal, Arivndr Pomt have no licence) | Their licences don't allow use on a website; matters more once the site gets traffic and the repo is public | Decision |
| 4 | **Create the GitHub repo** (empty, no README) and send me the URL, or push it yourself | CV proof; lets Vercel deploy on every change | 5 min |
| 5 | **PostHog**: sign up, create a project, turn on cookieless mode in its settings, send me the project key (starts `phc_`) | Visitor counts, which pages lead to exports, and the rating box (which only appears when PostHog is on) | 15 min |
| 6 | **Google Search Console**: add a Domain property for the new domain and verify it with the DNS record | Your SEO scoreboard: searches, clicks, positions | 15 min, after #1 |
| 7 | **Bing Webmaster Tools**: import from Search Console | Bing also feeds ChatGPT search and Copilot | 2 min, after #6 |
| 8 | **Read the Hindi wording once** (lib/content/wording.ts, the "hindi" group), or ask a parent | Wrong Hindi on a public page hurts trust | 10 min |
| 9 | **Finish the story page** (content/pages/about.md): add your **email** and **Twitter/X handle** in the last line (the two [brackets]), read it once, set `status: published`. If the brand name changes, change it in the first line too | A real person and a real reason behind the site is a trust signal for Google and for families | 5 min |
| 10 | **Review and publish Terms** (content/pages/terms.md) | Google expects privacy and terms pages; fix the font line after #3 | 10 min |
| 11 | **After the wedding: "how it went" post** (content/guides/how-i-made-my-brothers-wedding-invite.md): what relatives said, what you'd change, a few screenshots | Experience-based content is what Google rewards most now | 1 hr, after the wedding |
| 12 | **Pinterest Business account**: claim the website (send me the verification code), make boards, start pinning from `marketing/pinterest/` and the clips in `public/motions/` | Brides plan on Pinterest; pins send traffic for months | 30 min setup, then 10 min a day |
| 13 | **Submit to directories** (Product Hunt, AlternativeTo, SaaSHub, Indie Hackers, BetaList, Uneed, Microlaunch, Peerlist) | First links to the domain and first visitors | 2 hrs once |
| 14 | **Twitter**: launch thread with the story, then weekly build-in-public numbers | CV and early users | ongoing |
| 15 | **More Reddit threads as PDFs** in `research/reddit/` whenever you see good ones (questions people ask about invites, wording, costs, WhatsApp) | I can't open Reddit; your saved threads are how real questions get answered on the site | 1 min each |
| 17 | **Twitter/X handle**: make the account (your own name) and send me the handle | Goes in the site footer, the share cards (`twitter:site`) and the "who made this" data, so the site and your account point to each other | 10 min |
| 18 | **More keyword data**: the first screenshots are in docs/keywords.md and already used. Next, look up the event, wording and regional terms listed at the bottom of that file, ideally as a CSV download | Decides the next pages (regional invites? Canva comparison? wording deep dives?) | 20 min |
| 16 | **Recraft credits** (optional): when you have more, 3 to 5 designs a week keeps the "new designs every week" line true | The home page says new designs are added every week | ongoing |

## Page report cards (start when Search Console is live)

Every published page gets a row in **docs/page-tracker.csv** with four checkpoints, so no page is
"finished" and forgotten:

- **1 day:** is it indexed? (Search Console › URL inspection; request indexing if not)
- **1 week:** which searches it has started showing for
- **1 month:** impressions, clicks and average position: climbing, or stuck on page two?
- **3 months:** keep, refresh, merge or cut

**Every Monday (15 min):** export Search Console's Pages and Queries reports (last 28 days, CSV) into
`research/gsc/` and tell me. I fill the tracker, list pages that are slipping, and rank what to refresh.

**Rule that keeps it safe:** before 3 months, only fix things that are wrong (a stale price, a broken
link, a button name that changed). Real rewrites wait for the 3-month verdict, because Google needs
about 90 days to judge a page, and editing sooner restarts the clock. The price page is the exception
to watch: its prices are dated and should be rechecked every 3 months.

## Data goldmine (before and around launch)

Things only you can get that would put the site ahead of every competitor. Ranked by impact for the effort.

| # | What | How | Becomes |
|---|---|---|---|
| G1 | **Real card wording from 15 to 25 printed cards** at home or with relatives (the "card matter") | Photograph the text side; I'll transcribe and strip every name, number and address | The most authentic wording library online, by community and by who's inviting |
| G2 | **Vivah muhurat dates for 2027** from your family pandit or a panchang he trusts | Photo of the list with the source name | A "shubh vivah muhurat 2027" page: huge yearly searches, from exactly the people about to send invites |
| G3 | **A 10-question WhatsApp survey of 20 to 30 relatives and friends** (printed or digital? video or picture? what annoys them? when do they expect an invite?) | I'll write the questions; you send it and paste back the answers | Original data ("we asked 30 Indian families…") that bloggers and journalists quote and link to |
| G4 | **Two or three printer quotes** (price per card, minimum order, days needed) | Call or visit local card printers | Real prices for the price page and the digital-vs-printed guide |
| G5 | **Your brother's invite as it happens**: the pages you make, family feedback, how guests reacted (screenshots with permission) | Save as you go | The story page, a "how it went" post and your Twitter launch |
| G6 | **More keyword data**: events, wording, Hindi-script searches (शादी कार्ड), regional, and "vivah muhurat 2027" | Keyword Planner, Download keyword ideas (CSV) | Which pages to build next |
| G7 | **Pinterest Trends (India)** for wedding invitation, haldi, mehendi, shaadi card | trends.pinterest.com, screenshots | Which designs and pins to make, and when |
| G8 | **Regional helpers**: one Marathi, Gujarati, Punjabi or South Indian relative willing to check wording | WhatsApp them | Regional invite pages that are genuinely right, not find-and-replace |

## What I do next (once the matching item above is done)

| After | I will |
|---|---|
| #1 | Set up Cloudflare Pages (you log in once; I deploy the `out` folder), connect shubhdesi.com, point the site at it (`NEXT_PUBLIC_SITE_URL`), remake share images and pins with the domain, and redirect the old .vercel.app address |
| #2 | Deploy, check every page live, submit the sitemap, run IndexNow |
| #3 | Remove or replace the fonts, update Terms |
| #4 | Push, connect Vercel to GitHub, write the README with screenshots |
| #5 | Turn analytics on, build a simple weekly report: visitors, exports, exports per landing page, ratings |
| #6 | Each Monday (from about week 4): read Search Console, find queries at positions 5–20, fix titles or write the page that's missing |
| #15 | Turn each saved thread's questions into direct answers on the right page |
| Weekly | One or two new pages from the roadmap (docs/SEO-PLAYBOOK.md, section 8), never more |

## Product follow-ups (no rush)

Bigger product ideas (personal invites per guest, RSVP management, physical card commission model, other occasions and more) are scored in **docs/IDEAS.md**.

- **"All pages as pictures" button**: one tap to download every page as a PNG. Designers in the Reddit threads say still pictures are easier for guests to check details than video.
- **Photo of the couple** on a page (most-asked missing feature on competitor sites).
- **Small-event invites**: griha pravesh, baby shower, pooja (people in the threads use paid sites for these too).
- **Clouds on light designs**: the clouds are cream, so they barely show on cream paper; they look best on coloured designs. A darker-edged variant would need one more Recraft generation.

## Done recently

- 1 Nov: SEO site around the editor (home, 4 event pages, e-card, wording, designs, guides, privacy), sitemap, robots, structured data, share images, IndexNow, PostHog (off), git repo.
- 9 Nov: deployed to production; fixed page addresses on Vercel (cleanUrls in vercel.json).
- 9 Nov: page length up to 15 seconds (10s, 12s, 15s added), deployed.
- 2 Nov: PDF or pictures download with page ticks; camel walks on a leg rig; doli carried by two kahars; lake and floral arch scenes removed (25 scenes now, 45 animations in all); page report-card tracker.
- 2 Nov: 33 painted scene animations from 21 new Recraft sheets (66 + 8 credits used on the second account; 26 left), previews on the site.
- 1 Nov: keyword clusters mapped to pages (docs/keywords.md); designs page moved to /wedding-card-design, e-card page to /create-marriage-invitation-card, home tuned for "wedding invite video".
- 1 Nov: 16 animation previews incl. new Floating clouds, animated invitation page, price comparison page, marigold favicon, 201 designs, real rating box and review strip (empty until real reviews), answers from the two Reddit threads, bigger text in samples, no more dot-separated lists.
