# Pending actions

The running to-do list for growing the site. Kept up to date at the end of every working session.
Last updated: 1 November 2026 (evening).

## Waiting on you

| # | What | Why it matters | Effort |
|---|---|---|---|
| 1 | **Buy the domain** and tell me the name | Everything (Google, Pinterest, links) builds on the final address; the `.vercel.app` one can't rank well | 10 min, about ₹1,000/yr |
| 2 | **Say "deploy"** | Nothing since the first deploy is live yet: new pages, animations, favicon, 201 designs | 1 word |
| 3 | **Decide on the 7 restricted fonts** (Royal, Royal Glamour, Royal Moscow; Dehanna, Kharisna, Taj Mahal, Arivndr Pomt have no licence) | Their licences don't allow use on a website; matters more once the site gets traffic and the repo is public | Decision |
| 4 | **Create the GitHub repo** (empty, no README) and send me the URL, or push it yourself | CV proof; lets Vercel deploy on every change | 5 min |
| 5 | **PostHog**: sign up, create a project, turn on cookieless mode in its settings, send me the project key (starts `phc_`) | Visitor counts, which pages lead to exports, and the rating box (which only appears when PostHog is on) | 15 min |
| 6 | **Google Search Console**: add a Domain property for the new domain and verify it with the DNS record | Your SEO scoreboard: searches, clicks, positions | 15 min, after #1 |
| 7 | **Bing Webmaster Tools**: import from Search Console | Bing also feeds ChatGPT search and Copilot | 2 min, after #6 |
| 8 | **Read the Hindi wording once** (lib/content/wording.ts, the "hindi" group), or ask a parent | Wrong Hindi on a public page hurts trust | 10 min |
| 9 | **Finish the story page** (content/pages/about.md is drafted): fill in your name, the wedding month, email and Twitter handle, read it once, set `status: published` | A real person and a real reason behind the site is a trust signal for Google and for families | 10 min |
| 10 | **Review and publish Terms** (content/pages/terms.md) | Google expects privacy and terms pages; fix the font line after #3 | 10 min |
| 11 | **After the wedding: "how it went" post** (content/guides/how-i-made-my-brothers-wedding-invite.md): what relatives said, what you'd change, a few screenshots | Experience-based content is what Google rewards most now | 1 hr, after the wedding |
| 12 | **Pinterest Business account**: claim the website (send me the verification code), make boards, start pinning from `marketing/pinterest/` and the clips in `public/motions/` | Brides plan on Pinterest; pins send traffic for months | 30 min setup, then 10 min a day |
| 13 | **Submit to directories** (Product Hunt, AlternativeTo, SaaSHub, Indie Hackers, BetaList, Uneed, Microlaunch, Peerlist) | First links to the domain and first visitors | 2 hrs once |
| 14 | **Twitter**: launch thread with the story, then weekly build-in-public numbers | CV and early users | ongoing |
| 15 | **More Reddit threads as PDFs** in `research/reddit/` whenever you see good ones (questions people ask about invites, wording, costs, WhatsApp) | I can't open Reddit; your saved threads are how real questions get answered on the site | 1 min each |
| 17 | **Twitter/X handle**: make the account (your own name) and send me the handle | Goes in the site footer, the share cards (`twitter:site`) and the "who made this" data, so the site and your account point to each other | 10 min |
| 18 | **More keyword data**: the first screenshots are in docs/keywords.md and already used. Next, look up the event, wording and regional terms listed at the bottom of that file, ideally as a CSV download | Decides the next pages (regional invites? Canva comparison? wording deep dives?) | 20 min |
| 16 | **Recraft credits** (optional): when you have more, 3 to 5 designs a week keeps the "new designs every week" line true | The home page says new designs are added every week | ongoing |

## What I do next (once the matching item above is done)

| After | I will |
|---|---|
| #1 | Set the domain everywhere (`NEXT_PUBLIC_SITE_URL`), remake share images and pins with it, redirect the old address |
| #2 | Deploy, check every page live, submit the sitemap, run IndexNow |
| #3 | Remove or replace the fonts, update Terms |
| #4 | Push, connect Vercel to GitHub, write the README with screenshots |
| #5 | Turn analytics on, build a simple weekly report: visitors, exports, exports per landing page, ratings |
| #6 | Each Monday (from about week 4): read Search Console, find queries at positions 5–20, fix titles or write the page that's missing |
| #15 | Turn each saved thread's questions into direct answers on the right page |
| Weekly | One or two new pages from the roadmap (docs/SEO-PLAYBOOK.md, section 8), never more |

## Product follow-ups (no rush)

- **"All pages as pictures" button**: one tap to download every page as a PNG. Designers in the Reddit threads say still pictures are easier for guests to check details than video.
- **Photo of the couple** on a page (most-asked missing feature on competitor sites).
- **Small-event invites**: griha pravesh, baby shower, pooja (people in the threads use paid sites for these too).
- **Clouds on light designs**: the clouds are cream, so they barely show on cream paper; they look best on coloured designs. A darker-edged variant would need one more Recraft generation.

## Done recently

- 1 Nov: SEO site around the editor (home, 4 event pages, e-card, wording, designs, guides, privacy), sitemap, robots, structured data, share images, IndexNow, PostHog (off), git repo.
- 1 Nov: keyword clusters mapped to pages (docs/keywords.md); designs page moved to /wedding-card-design, e-card page to /create-marriage-invitation-card, home tuned for "wedding invite video".
- 1 Nov: 16 animation previews incl. new Floating clouds, animated invitation page, price comparison page, marigold favicon, 201 designs, real rating box and review strip (empty until real reviews), answers from the two Reddit threads, bigger text in samples, no more dot-separated lists.
