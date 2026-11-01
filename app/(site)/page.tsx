import type { Metadata } from "next";
import Link from "next/link";
import { Cta } from "@/components/site/Cta";
import { Faq } from "@/components/site/Faq";
import { JsonLd } from "@/components/site/JsonLd";
import { Tiles } from "@/components/site/Tiles";
import { EVENT_PAGES, type Faq as FaqItem } from "@/lib/content/events";
import { tilesFor } from "@/lib/content/gallery";
import { appSchema, howToSchema, organizationSchema, websiteSchema } from "@/lib/schema";
import { COUNTS, SITE } from "@/lib/site";

const TITLE = "Free Indian Wedding Invitation Video Maker (No Watermark)";
const DESCRIPTION = `Make an Indian wedding invitation video on your phone in 5 minutes. ${COUNTS.designs} traditional designs, Ganesh ji and Om symbols, music and animations. Free, no watermark, no sign-up.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/", images: ["/og/home.jpg"] },
};

const STEPS = [
  { name: "Pick a design", text: `Choose from ${COUNTS.designs} designs: peacocks, elephants, marigolds, palaces, Pichwai lotus and more.` },
  { name: "Add your details", text: "Tap any line to type names, dates and venues. Add a page for each function: Haldi, Mehendi, Sangeet, wedding, reception." },
  { name: "Download and share", text: "Pick music and an animation, then export an MP4 (or a picture) to send on WhatsApp or post as a story." },
];

const FAQS: FaqItem[] = [
  { q: "Is it really free?", a: "Yes. Every design, animation and song is free, and there's no premium version holding anything back. There are no ads either." },
  { q: "Will there be a watermark on my video?", a: "No. The video you download is clean, with nothing added to it." },
  { q: "Do I need to make an account?", a: "No. Open the editor and start. Your invite saves on your own phone as you go, so you can close it and come back later." },
  { q: "Does it work on my phone?", a: "Yes. It's made for phones first and works in Chrome and Safari on Android and iPhone, and on computers." },
  { q: "Is my invite uploaded anywhere?", a: "No. The video is made inside your browser, on your device. Names, dates and addresses never leave your phone." },
  { q: "Can I write the invite in Hindi?", a: "Yes. Type in Hindi or any language and choose a font with Devanagari letters, such as Yatra One, Rozha One or Amita." },
  { q: "How long is the video, and what size?", a: "Each page plays for 3 to 8 seconds and you can have up to 10 pages, so most invites are 20 to 60 seconds. Videos are 720 × 1280 (9:16), the shape of a phone screen, which suits WhatsApp and Instagram stories." },
  { q: "Can I add music? Is it copyright-free?", a: `Yes, ${COUNTS.music} tracks such as shehnai and dhol are included. They're original, composed for this tool, so they won't be muted on Instagram or WhatsApp.` },
  { q: "Can I add photos of the couple?", a: "Not yet. The designs are illustrated, in the style of printed Indian wedding cards. Photo support is planned." },
  { q: "Can I put Ganesh ji or Om on the invite?", a: `Yes. There are ${COUNTS.symbols} symbols: Ganesh ji and Om in several styles, plus monograms made from the couple's initials. You can move, resize or hide them.` },
];

export default function Home() {
  return (
    <>
      <section className="s-hero">
        <div>
          <p className="s-kicker">For Indian weddings, made with love</p>
          <h1>Free Indian wedding invitation video maker</h1>
          <p className="s-lead">
            Make a beautiful wedding invitation video on your phone in about five minutes. Traditional designs, Ganesh ji and Om, music and animations included. No watermark, no sign-up, nothing to pay.
          </p>
          <Cta />
          <p className="s-updated">
            {COUNTS.designs} designs · {COUNTS.motions} animations · {COUNTS.music} songs · Updated{" "}
            {new Date(SITE.updated).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>
        <Tiles tiles={tilesFor(["wedding", "peacocks", "elephants"], 3, "shaadi")} />
      </section>

      <section className="s-section">
        <h2>How do I make a wedding invitation video for free?</h2>
        <div className="s-answer">
          <p>
            Open the <Link href="/create">editor</Link>, pick a design, and tap the text to type your names, dates and venue. Add a page for each function, choose music and an animation, and press Export. The video is made on your phone and saved as an MP4 you can send on WhatsApp. It&apos;s free, has no watermark, and doesn&apos;t need an account.
          </p>
        </div>
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
        <JsonLd data={howToSchema("How to make an Indian wedding invitation video", STEPS)} />
      </section>

      <section className="s-section">
        <h2>Invites for every function</h2>
        <p>Make one video with a page for each event, or a separate invite for each. Each page below has designs, wording and dress code ideas for that function.</p>
        <ul className="s-cards">
          {EVENT_PAGES.map((e) => (
            <li key={e.slug}>
              <h3>
                <Link href={`/${e.slug}`}>{e.name} invitation video</Link>
              </h3>
              <p>{e.lead.split(":")[0]}.</p>
            </li>
          ))}
          <li>
            <h3>
              <Link href="/wedding-e-card">Wedding e-card</Link>
            </h3>
            <p>Need a picture instead of a video? Download any page as a PNG card.</p>
          </li>
        </ul>
      </section>

      <section className="s-section">
        <h2>Designs made for Indian weddings</h2>
        <p>
          Peacocks, elephants, the baraat horse, marigold garlands, temple bells, Pichwai lotus, palace arches and mehendi patterns. Each design leaves a big clear space for all your text, the way printed cards do.
        </p>
        <Tiles tiles={tilesFor(["wedding", "haldi", "sangeet", "mehendi", "reception", "peacocks", "elephants", "lotus", "palaces", "temple"], 10)} />
        <p>
          <Link href="/designs">See all {COUNTS.designs} designs</Link>
        </p>
      </section>

      <section className="s-section">
        <h2>Is this better than Canva for a wedding invite?</h2>
        <p>
          It depends on what you need. If you want full design freedom, your own photos, or a printed card, a general design app like Canva is the better choice. If you want a traditional Indian wedding invite video quickly, on your phone, free and without a watermark, this tool is built for exactly that.
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
        <h2>Need the words?</h2>
        <p>
          Copy-ready wording for the main invite, invites from parents, RSVP lines and the WhatsApp message to send with your video is in the <Link href="/wedding-invitation-wording">wedding invitation wording</Link> collection.
        </p>
      </section>

      <Faq items={FAQS} />
      <Cta />

      <JsonLd data={[organizationSchema(), websiteSchema(), appSchema({ name: SITE.name, description: SITE.definition, path: "/", image: "/og/home.jpg" })]} />
    </>
  );
}
