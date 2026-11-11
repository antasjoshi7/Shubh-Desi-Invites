import type { Metadata } from "next";
import Link from "next/link";
import { Cta } from "@/components/site/Cta";
import { Faq } from "@/components/site/Faq";
import { Reviews } from "@/components/site/Reviews";
import { MotionReel } from "@/components/site/MotionReel";
import { JsonLd } from "@/components/site/JsonLd";
import { Tiles } from "@/components/site/Tiles";
import { EVENT_PAGES, type Faq as FaqItem } from "@/lib/content/events";
import { tilesFor } from "@/lib/content/gallery";
import { MOTION_PREVIEWS, motionsById } from "@/lib/content/motions";
import { appSchema, howToSchema, organizationSchema, websiteSchema } from "@/lib/schema";
import { COUNTS, SITE } from "@/lib/site";
import { HeroPic, HeroStickers, Theme } from "@/components/site/Desi";

// Card first (10 Nov 2026): card searches are about 10x the video ones (docs/keywords.md), and families
// judge a PDF card like a printed one. The video cluster is still covered further down the page.
const TITLE = "Free Wedding Invitation Card Maker: Indian E-Cards, PDF and Video";
const DESCRIPTION = `Make a Hindu wedding invitation card on your phone in 5 minutes: ${COUNTS.designsLabel} designs, Ganesh ji, a page for each function. Download a sharp PDF where the venue opens the map, or a video. Free, no watermark, no sign-up.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/", images: ["/og/home.jpg"] },
};

const STEPS = [
  { name: "Pick a design", text: `Choose from ${COUNTS.designsLabel} designs, with new ones every week: peacocks, elephants, marigolds, palaces, Pichwai lotus and more.` },
  { name: "Add your details", text: "Tap any line to type names, dates and venues. Add a page for each function: Haldi, Mehendi, Sangeet, wedding, reception." },
  { name: "Download and share", text: "Download a PDF card to send on WhatsApp or print (tap the venue to open the map, tap a number to call), or pictures. Want it to move? Make a video of the same card." },
];

const FAQS: FaqItem[] = [
  { q: "Is it really free?", a: "Yes. Every design, animation and song is free, and there's no premium version holding anything back. There are no ads either." },
  { q: "Will there be a watermark on my card or video?", a: "No. The PDF, pictures and video you download are clean, with nothing added to them." },
  { q: "PDF or video: which should I send?", a: "Send the PDF card to everyone: it stays sharp on every phone, guests can zoom in to read the details, and the venue and phone numbers are tappable. Add the video for people who'll enjoy it, like friends and cousins. On WhatsApp, send the video as a Document so it doesn't get blurred." },
  { q: "Do I need to make an account?", a: "No. Open the editor and start. Your invite saves on your own phone as you go, so you can close it and come back later." },
  { q: "Does it work on my phone?", a: "Yes. It's made for phones first and works in Chrome and Safari on Android and iPhone, and on computers." },
  { q: "Do my guests have to click a link?", a: "No. You send the PDF, picture or video itself, so it opens right inside WhatsApp. Many people don't open invite links because of spam and fraud, and older relatives often find invite websites confusing, so a plain PDF or video is the easiest thing for every guest to open." },
  { q: "How much does a wedding invitation usually cost?", a: "From what couples share online in 2026, printed cards cost roughly ₹30 to ₹500 each, ready-made video templates ₹199 to ₹500, and custom digital invites from designers up to ₹20,000 to ₹30,000. This tool is free. Many families now print a few cards for elders and the temple and send the PDF card to everyone else." },
  { q: "Is it respectful to put Ganesh ji on a digital invite?", a: "Many families feel uneasy throwing away printed cards that carry Ganesh ji, deities or shlokas once the wedding is over, and a digital invite avoids that. If you'd still rather not use a deity, choose a monogram of the couple's initials instead." },
  { q: "Will someone else have the same design?", a: "The designs are shared by everyone who uses the tool, like any template. You can make yours your own by changing the paper and design colours, fonts, the symbol and where the text sits." },
  { q: "Is my invite uploaded anywhere?", a: "No. The card and video are made inside your browser, on your device. Names, dates and addresses never leave your phone." },
  { q: "Can I write the invite in Hindi?", a: "Yes. Type in Hindi or any language and choose a font with Devanagari letters, such as Yatra One, Rozha One or Amita." },
  { q: "How long is the video, and what size?", a: "Each page plays for 3 to 15 seconds and you can have up to 10 pages, so most invites are 20 to 60 seconds. Videos are full HD, 1080 × 1920 (9:16), the shape of a phone screen, which suits WhatsApp and Instagram stories. PDF pages are 1440 × 2560, sharp enough to print." },
  { q: "Can I add music? Is it copyright-free?", a: `Yes, ${COUNTS.music} tracks such as shehnai and dhol are included. They're original, composed for this tool, so they won't be muted on Instagram or WhatsApp.` },
  { q: "Can I add photos of the couple?", a: "Not yet. The designs are illustrated, in the style of printed Indian wedding cards. Photo support is planned." },
  { q: "Can I put Ganesh ji or Om on the invite?", a: `Yes. There are ${COUNTS.symbols} symbols: Ganesh ji and Om in several styles, plus monograms made from the couple's initials. You can move, resize or hide them.` },
];

export default function Home() {
  return (
    <>
      <Theme name="home" />
      <section className="s-hero">
        <div>
          <p className="s-kicker">Why pay ₹1,699 for an invite?</p>
          <h1><mark>Free</mark> Indian wedding invitation card maker</h1>
          <p className="s-lead">
            Make a wedding card as neat as a printed one, on your phone. Pick from {COUNTS.designsLabel} designs in the styles trending on Pinterest and Instagram, add a page for each function, and download a sharp PDF where the venue opens the map and the phone numbers call. Make a version for each group of guests in one tap, or turn the same card into a video. Free, with no watermark and no sign-up.
          </p>
          <HeroStickers items={["Muft hai, boss", "Mummy-approved", "Log kya kahenge? Wah wah!"]} />
          <Cta />
          <p className="s-updated">
            {COUNTS.designs} designs so far, with new ones every week. Updated{" "}
            {new Date(SITE.updated).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}.
          </p>
        </div>
        <HeroPic stamp={<><b>मुफ़्त</b>Free!</>}>
          <Tiles tiles={tilesFor(["wedding", "peacocks", "elephants"], 3, "shaadi")} />
        </HeroPic>
      </section>

      <section className="s-section">
        <h2>How do I make a wedding invitation card for free?</h2>
        <div className="s-answer">
          <p>
            Open the <Link href="/create">editor</Link>, pick a design, and tap the text to type your names, dates and venue. Add a page for each function, then press Download and choose PDF. The card is made on your phone: sharp enough to print, light enough for WhatsApp, with the venue and phone numbers tappable. It&apos;s free, has no watermark, and doesn&apos;t need an account.
          </p>
        </div>
      </section>

      <section className="s-section">
        <h2>Can I make it a video too?</h2>
        <div className="s-answer">
          <p>
            Yes. In the same Download sheet, tap &ldquo;Make it move&rdquo; to turn the card into a wedding invite video (some families call it a marriage invitation video or a wedding card video): the same pages with gentle motion and music, saved as a full HD MP4. Send it on WhatsApp as a Document so it stays sharp.
          </p>
        </div>
      </section>

      <section className="s-section">
        <h2>Pages that come alive</h2>
        <p>
          Hand-painted scenes made for Indian weddings, which general design apps don&apos;t have: elephants arriving with royal fans, chandeliers dropping in over a royal court, a marigold toran with swinging temple bells, a baraat ghodi that really gallops. Tap one to use it.
        </p>
        <MotionReel items={motionsById(["shahiSwagat", "royalCourt", "toranWelcome", "ghodi", "gardenCorners", "doors"])} />
        <p style={{ marginTop: 14 }}>
          <Link href="/animated-wedding-invitation">See all {MOTION_PREVIEWS.length} animated wedding invitation styles</Link>
        </p>
      </section>

      <section className="s-section">
        <h2>Three steps, about five minutes</h2>
        <ol className="s-steps">
          {STEPS.map((s) => (
            <li key={s.name}>
              <h3>{s.name}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <JsonLd data={howToSchema("How to make an Indian wedding invitation card", STEPS)} />
      </section>

      <section className="s-section">
        <h2>Invites for every function</h2>
        <p>Make one card with a page for each event, or a separate invite for each. Each page below has designs, wording and dress code ideas for that function.</p>
        <ul className="s-cards s-cards-events">
          {EVENT_PAGES.map((e) => (
            <li key={e.slug}>
              <h3>
                <Link href={`/${e.slug}`}>{e.name} invitation</Link>
              </h3>
              <p>{e.lead.split(":")[0]}.</p>
            </li>
          ))}
          <li>
            <h3>
              <Link href="/create-marriage-invitation-card">Marriage invitation card</Link>
            </h3>
            <p>Every page as a print-ready PDF or as pictures, with the venue and numbers tappable.</p>
          </li>
        </ul>
      </section>

      <section className="s-section">
        <h2>Wedding invitation video templates</h2>
        <p>
          Peacocks, elephants, the baraat horse, marigold garlands, temple bells, Pichwai lotus, palace arches and mehendi patterns. Each design leaves a big clear space for all your text, the way printed cards do.
        </p>
        <Tiles tiles={tilesFor(["wedding", "haldi", "sangeet", "mehendi", "reception", "peacocks", "elephants", "lotus", "palaces", "temple"], 10)} />
        <p>
          See all {COUNTS.designs} <Link href="/wedding-card-design">wedding card designs</Link>, with new ones added every week.
        </p>
      </section>

      <section className="s-section">
        <h2>Is this better than Canva for a wedding invite?</h2>
        <p>
          It depends on what you need. If you want full design freedom, your own photos, or a printed card, a general design app like Canva is the better choice. If you want a traditional Indian wedding card or invite video quickly, on your phone, free and without a watermark, with the venue and phone numbers tappable in the PDF, this tool is built for exactly that.
        </p>
        <div className="s-table-wrap">
          <table className="s-compare">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">{SITE.name}</th>
                <th scope="col">General design apps</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Made for</td><td>Indian wedding invites only</td><td>Any design</td></tr>
              <tr><td>Price</td><td>Free, everything included</td><td>Free plan, some elements paid</td></tr>
              <tr><td>Account</td><td>Not needed</td><td>Needed</td></tr>
              <tr><td>Ganesh ji, Om, monograms</td><td>Built in</td><td>Search for them</td></tr>
              <tr><td>Text fitting</td><td>Fits itself inside the design</td><td>You arrange it</td></tr>
              <tr><td>Your photos</td><td>Not yet</td><td>Yes</td></tr>
              <tr><td>Privacy</td><td>Made on your phone, never uploaded</td><td>Stored in your account</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="s-section">
        <h2>Why pay for an invite?</h2>
        <p>
          Video templates cost ₹199 to ₹500, invitation websites start around ₹1,699 plus GST, and designers charge up to ₹30,000. See what each one gets you in our <Link href="/digital-wedding-invitation-price">digital wedding invitation price</Link> comparison, or make yours here for free.
        </p>
      </section>

      <section className="s-section">
        <h2>Need the words?</h2>
        <p>
          Copy-ready wording for the main invite, invites from parents, RSVP lines and the WhatsApp message to send with your video is in the <Link href="/wedding-invitation-wording">wedding invitation wording</Link> collection.
        </p>
      </section>

      <section className="s-section">
        <h2>Planning the decor and outfits too?</h2>
        <p>
          Put the screenshots you&apos;ve saved for each function on one <Link href="/wedding-mood-board">wedding mood board</Link>, mark exactly what you love, and send your decorator a clear brief and your guests a what-to-wear card. Same free, no-sign-up way as the invite.
        </p>
        <div className="s-hero-art" style={{ justifyContent: "flex-start", marginTop: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/moodboard/landing/brief-haldi.jpg" alt="A decorator brief for a Haldi, with numbered notes on loved photos" width={360} height={640} loading="lazy" decoding="async" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/moodboard/landing/wear-haldi.jpg" alt="A what-to-wear card for a Haldi: shades of yellow, no white" width={360} height={640} loading="lazy" decoding="async" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/moodboard/landing/poster-wedding.jpg" alt="A wedding mood board poster with a red, gold and ivory palette" width={360} height={640} loading="lazy" decoding="async" />
        </div>
      </section>

      <Reviews />
      <Faq items={FAQS} />
      <Cta />

      <JsonLd data={[organizationSchema(), websiteSchema(), appSchema({ name: SITE.name, description: SITE.definition, path: "/", image: "/og/home.jpg" })]} />
    </>
  );
}
