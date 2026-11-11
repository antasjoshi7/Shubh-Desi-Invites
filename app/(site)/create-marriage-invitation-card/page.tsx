import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs } from "@/components/site/Crumbs";
import { Cta } from "@/components/site/Cta";
import { Faq } from "@/components/site/Faq";
import { JsonLd } from "@/components/site/JsonLd";
import { Tiles } from "@/components/site/Tiles";
import { tilesFor } from "@/lib/content/gallery";
import { appSchema, howToSchema } from "@/lib/schema";
import { COUNTS } from "@/lib/site";
import { HeroPic, HeroStickers, Theme } from "@/components/site/Desi";

// Targets "create marriage invitation card" and "wedding cards online" (docs/keywords.md).
const TITLE = "Create Marriage Invitation Card Online, Free (Indian E-Card)";
const DESCRIPTION = `Create a marriage invitation card online in minutes: ${COUNTS.designsLabel} Indian designs, your names and dates, download as a picture or video for WhatsApp. Free, no watermark.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/create-marriage-invitation-card" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/create-marriage-invitation-card" },
};

const STEPS = [
  { name: "Pick a design", text: "Choose a card design: traditional, floral, royal or minimal." },
  { name: "Type your details", text: "Tap each line to change names, parents, date and venue." },
  { name: "Download your card", text: "Open the More menu (⋯), tap PDF or pictures, untick any pages you don't need, and download a print-ready PDF or pictures." },
];

export default function ECardPage() {
  return (
    <>
      <Crumbs trail={[{ name: "Create a marriage invitation card", path: "/create-marriage-invitation-card" }]} />
      <Theme name="card" />
      <section className="s-hero">
        <div>
          <h1>Create a marriage invitation card online</h1>
          <p className="s-lead">
            Make a digital wedding card (an e-card) to send on WhatsApp: the look of a printed Indian card, saved as a picture or an animated video. Ready in a few minutes on your phone.
          </p>
          <HeroStickers items={["Tap the venue, map opens", "Print-ready PDF", "Rishtedaar approved"]} />
          <Cta href="/create" label="Create your card" />
        </div>
        <HeroPic stamp={<><b>मुफ़्त</b>PDF!</>}>
          <Tiles tiles={tilesFor(["minimal", "wedding", "borders"], 3, "shaadi")} />
        </HeroPic>
      </section>

      <section className="s-section">
        <h2>How do I create a marriage invitation card for free?</h2>
        <div className="s-answer">
          <p>
            Open the <Link href="/create">editor</Link>, pick one of the <Link href="/wedding-card-design">wedding card designs</Link> and type your details. To get the card, press Download. Every page is ticked; untick the ones a group of guests doesn't need (say, a reception-only version for the office) and download a print-ready PDF or pictures. In the PDF, the venue opens the map and phone numbers call when tapped. For an animated version with music, tap Make it move in the same sheet.
          </p>
        </div>
      </section>

      <section className="s-section">
        <h2>E-card or video invite?</h2>
        <p>
          An <strong>e-card</strong> is a single picture: quick to open, easy to print, and good for elders who prefer something that looks like a card. A <strong>video invite</strong> plays every function one after another with music and animation, and feels more special when it arrives. Some guests find a video a slow way to check the date and venue, so many families send both: the video to everyone, then the main page as a picture that&apos;s quick to read, print or keep.
        </p>
      </section>

      <section className="s-section">
        <h2>Designs to start from</h2>
        <Tiles tiles={tilesFor(["minimal", "wedding", "borders", "florals", "palaces", "temple", "lotus", "paisley", "peacocks", "elephants"], 10)} />
        <p>
          You can also browse every <Link href="/wedding-card-design">wedding card design</Link> or <Link href="/wedding-invitation-wording">copy some wording</Link>.
        </p>
      </section>

      <section className="s-section">
        <h2>How to create a wedding card online</h2>
        <ol className="s-steps">
          {STEPS.map((s) => (
            <li key={s.name}>
              <h3>{s.name}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <JsonLd data={howToSchema("How to create a marriage invitation card online", STEPS)} />
      </section>

      <Faq
        items={[
          { q: "What size is the e-card?", a: "PDF pages are 1440 × 2560 (9:16, 5 × 8.9 inches), sharp enough to print. Pictures are 1080 × 1920, the shape of a phone screen, so they fill the screen on WhatsApp without cropping." },
          { q: "Can I print it?", a: "It's sized for phones. For a small print (like 4 × 7 inches) it looks fine; for large printed cards, a print designer is still the better choice." },
          { q: "Is there a watermark?", a: "No. The picture and video you download are clean." },
          { q: "Can I make cards for each function?", a: "Yes. Add a page for Haldi, Mehendi, Sangeet, the wedding and the reception, then download each page as its own picture." },
        ]}
      />
      <JsonLd data={appSchema({ name: "Marriage invitation card maker", description: DESCRIPTION, path: "/create-marriage-invitation-card" })} />
    </>
  );
}
