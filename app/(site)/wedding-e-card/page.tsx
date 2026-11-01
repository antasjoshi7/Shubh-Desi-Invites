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

const TITLE = "Wedding E-Card Maker: Free Indian Digital Wedding Card";
const DESCRIPTION = `Make a digital Indian wedding card (e-invite) for WhatsApp in minutes. ${COUNTS.designsLabel} traditional designs, download as a picture or video. Free, no watermark.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/wedding-e-card" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/wedding-e-card" },
};

const STEPS = [
  { name: "Pick a design", text: "Choose a card design: traditional, floral, royal or minimal." },
  { name: "Type your details", text: "Tap each line to change names, parents, date and venue." },
  { name: "Download as a picture", text: "Open the More menu (⋯) and tap Page as PNG to save the card, or press Export for a video." },
];

export default function ECardPage() {
  return (
    <>
      <Crumbs trail={[{ name: "Wedding e-card", path: "/wedding-e-card" }]} />
      <section className="s-hero">
        <div>
          <h1>Indian wedding e-card maker</h1>
          <p className="s-lead">
            Make a digital wedding card to send on WhatsApp: the look of a printed Indian card, saved as a picture (PNG) or an animated video. Ready in a few minutes on your phone.
          </p>
          <Cta href="/create" label="Make your e-card" />
        </div>
        <Tiles tiles={tilesFor(["minimal", "wedding", "borders"], 3, "shaadi")} />
      </section>

      <section className="s-section">
        <h2>How do I make a digital wedding card for free?</h2>
        <div className="s-answer">
          <p>
            Open the <Link href="/create">editor</Link>, pick a design and type your details. To get a picture, open the More menu (⋯) and tap Page as PNG. Every page of your invite can be its own card, so you can send the main card, then the Haldi or Sangeet card separately. For an animated version with music, press Export instead.
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
        <h2>Wedding card designs</h2>
        <Tiles tiles={tilesFor(["minimal", "wedding", "borders", "florals", "palaces", "temple", "lotus", "paisley", "peacocks", "elephants"], 10)} />
        <p>
          You can also <Link href="/designs">browse every design</Link> or <Link href="/wedding-invitation-wording">copy some wording</Link>.
        </p>
      </section>

      <section className="s-section">
        <h2>How to make a wedding e-card</h2>
        <ol className="s-steps">
          {STEPS.map((s) => (
            <li key={s.name}>
              <h3>{s.name}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <JsonLd data={howToSchema("How to make an Indian wedding e-card", STEPS)} />
      </section>

      <Faq
        items={[
          { q: "What size is the e-card?", a: "720 × 1280 pixels (9:16), the shape of a phone screen, so it fills the screen on WhatsApp without cropping." },
          { q: "Can I print it?", a: "It's sized for phones. For a small print (like 4 × 7 inches) it looks fine; for large printed cards, a print designer is still the better choice." },
          { q: "Is there a watermark?", a: "No. The picture and video you download are clean." },
          { q: "Can I make cards for each function?", a: "Yes. Add a page for Haldi, Mehendi, Sangeet, the wedding and the reception, then download each page as its own picture." },
        ]}
      />
      <JsonLd data={appSchema({ name: "Indian wedding e-card maker", description: DESCRIPTION, path: "/wedding-e-card" })} />
    </>
  );
}
