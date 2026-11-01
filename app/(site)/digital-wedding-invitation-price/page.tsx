import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs } from "@/components/site/Crumbs";
import { Cta } from "@/components/site/Cta";
import { Faq } from "@/components/site/Faq";
import { MotionReel } from "@/components/site/MotionReel";
import { Tiles } from "@/components/site/Tiles";
import { tilesFor } from "@/lib/content/gallery";
import { motionsById } from "@/lib/content/motions";
import { COUNTS } from "@/lib/site";

// Prices people actually pay, so this page answers "how much does a digital wedding invite cost" honestly.
// Sources: couples' threads on r/DesiWeddings and r/IndianWeddings (saved in research/reddit) and
// invite sites' own price pages, checked November 2026. Recheck every few months and update AS_OF.
const AS_OF = "November 2026";
const TITLE = "Digital Wedding Invitation Price in India (2026): What Invites Cost";
const DESCRIPTION =
  "What wedding invites really cost in India in 2026: printed cards, video templates, invitation websites and designers, compared. Plus how to make a beautiful one free.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/digital-wedding-invitation-price" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/digital-wedding-invitation-price" },
};

const PRICES = [
  { what: "Printed cards", price: "₹30 to ₹500 per card, more for boxed invites", note: "Couples report paying around ₹140 a card for mid-range printing." },
  { what: "Video invite templates", price: "₹199 to ₹500 per video", note: "You fill in a form and get the video. Some apps charge ₹49 to ₹99 just to remove a watermark." },
  { what: "Invitation websites", price: "From about ₹1,699 plus GST", note: "Usually live for a limited time, often around two months." },
  { what: "Designer-made digital invite", price: "₹2,000 to ₹30,000", note: "Custom illustration, caricatures or a hosted link, depending on the designer." },
  { what: "This tool", price: "Free", note: `${COUNTS.designsLabel} designs and ${COUNTS.motions} animations, no watermark, no sign-up.` },
];

export default function PricePage() {
  return (
    <>
      <Crumbs trail={[{ name: "Digital wedding invitation price", path: "/digital-wedding-invitation-price" }]} />
      <section className="s-hero" style={{ gridTemplateColumns: "1fr" }}>
        <div>
          <p className="s-kicker">Stop paying for wedding invites</p>
          <h1>How much does a digital wedding invitation cost?</h1>
          <p className="s-lead">
            Anywhere from nothing to ₹30,000. Here&apos;s what printed cards, video templates, invitation websites and designers really charge in India as of {AS_OF}, and how to make a beautiful invite for free.
          </p>
        </div>
      </section>

      <section className="s-section">
        <h2>What does a digital wedding invite cost in India?</h2>
        <div className="s-answer">
          <p>
            Video invite templates cost about ₹199 to ₹500, invitation websites start around ₹1,699 plus GST, and designers charge ₹2,000 to ₹30,000 for a custom digital invite. Printed cards add ₹30 to ₹500 per card. If you want a traditional Indian design with your names, dates and venues, you can make one free with the <Link href="/">wedding invitation video maker</Link> on this site.
          </p>
        </div>
      </section>

      <section className="s-section">
        <h2>Prices compared ({AS_OF})</h2>
        <div className="s-table-wrap">
          <table className="s-compare">
            <thead>
              <tr>
                <th scope="col">Type of invite</th>
                <th scope="col">Typical price</th>
                <th scope="col">Good to know</th>
              </tr>
            </thead>
            <tbody>
              {PRICES.map((p) => (
                <tr key={p.what}>
                  <td>{p.what}</td>
                  <td>{p.price}</td>
                  <td>{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 12, fontSize: 14, opacity: 0.75 }}>
          Prices come from couples comparing quotes in Indian wedding communities and from invite sites&apos; own price lists, checked in {AS_OF}. They vary by city and vendor.
        </p>
      </section>

      <section className="s-section">
        <h2>Is it worth paying for an invite?</h2>
        <p>
          It depends on what you want. Paying makes sense for a one-of-a-kind illustration, a caricature of the couple, or a website with RSVP forms and maps. If you want a beautiful traditional invite with Ganesh ji, your names and every function&apos;s details, ready today, you don&apos;t need to pay: that&apos;s exactly what this tool makes.
        </p>
        <p>
          One honest catch: our designs are shared by everyone who uses the tool, like any template. You can make yours your own with colours, fonts, the symbol and an animation.
        </p>
      </section>

      <section className="s-section">
        <h2>Free invites that don&apos;t look free</h2>
        <p>Every sample below was made with the tool, with real names, dates and venues.</p>
        <Tiles tiles={tilesFor(["wedding", "peacocks", "elephants"], 5, "shaadi")} />
        <p style={{ marginTop: 18 }}>And they move: these are a few of the animations.</p>
        <MotionReel items={motionsById(["ghodi", "doors", "clouds", "peacock", "diyaRow", "elephants"])} />
      </section>

      <section className="s-section">
        <h2>Video, picture or link: what should you send?</h2>
        <p>
          A <strong>video</strong> feels special and plays straight inside WhatsApp. A <strong>picture</strong> is quickest for guests checking the date and venue later, and easy to print for elders. A <strong>link</strong> to a website can hold RSVPs and maps, but many guests are wary of opening links because of spam and fraud, and older relatives can find websites hard to use.
        </p>
        <p>
          What works for most families: send the video to everyone, then the details page as a picture. You can make both here: press Export for the video, and use More, then Page as PNG, for the <Link href="/wedding-e-card">picture card</Link>.
        </p>
      </section>

      <Faq
        items={[
          { q: "How much does a wedding invitation video cost?", a: "Template sites charge about ₹199 to ₹500 per video and designers ₹2,000 or more. You can make one free here, with no watermark." },
          { q: "How much does a wedding card cost per piece in India?", a: "Couples report ₹30 to ₹500 per printed card, with ₹100 to ₹150 common for mid-range cards. Boxed invites cost more." },
          { q: "Are free invite makers really free?", a: "Many add a watermark or charge to download. This one doesn't: every design, animation and song is free, the video has no watermark, and there's no sign-up." },
          { q: "Do I still need printed cards?", a: "Many families print a few for elders, the family temple and close relatives, and send the digital invite to everyone else. That keeps the cost low without leaving anyone out." },
        ]}
      />
      <Cta label="Make your invite, free" />
    </>
  );
}
