import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs } from "@/components/site/Crumbs";
import { Cta } from "@/components/site/Cta";
import { Faq } from "@/components/site/Faq";
import { Tiles } from "@/components/site/Tiles";
import { designsByCategory, tilesFor } from "@/lib/content/gallery";
import { COUNTS } from "@/lib/site";
import { HeroPic, HeroStickers, Theme } from "@/components/site/Desi";

// Targets the biggest search cluster: "wedding card design" and "Hindu / shadi card design" (docs/keywords.md).
const TITLE = `Wedding Card Design: ${COUNTS.designsLabel} Free Hindu Wedding Invitation Designs`;
const DESCRIPTION = `Free Hindu wedding card designs: peacocks, elephants, marigold, Pichwai lotus, palaces and more. Add your names and download a shadi card or invite video, no watermark.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/wedding-card-design" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/wedding-card-design" },
};

export default function DesignsPage() {
  const cats = designsByCategory();
  return (
    <>
      <Crumbs trail={[{ name: "Wedding card designs", path: "/wedding-card-design" }]} />
      <Theme name="designs" />
      <section className="s-hero" style={{ gridTemplateColumns: "1fr" }}>
        <div>
          <h1>Wedding card designs</h1>
          <p className="s-lead">
            {COUNTS.designs} free Hindu wedding card designs so far, in the styles trending on Pinterest and Instagram, with new ones every week. Tap any design to add your names, dates and venues, then download it as a shadi card picture or an animated invite video.
          </p>
          <HeroStickers items={["201 designs", "New every week", "Pinterest wala look"]} />
          <ul className="s-jump">
            {cats.map((c) => (
              <li key={c.id}>
                <a href={`#${c.id}`}>{c.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="s-section">
        <h2>How do I design a wedding card for free?</h2>
        <div className="s-answer">
          <p>
            Pick a design below and it opens in the <Link href="/create">invite maker</Link> with sample wording. Tap the text to type your names, parents&apos; names, dates and venues; it fits itself inside the design. Change the colours, add Ganesh ji, Om or your initials, then download the card as a picture or <Link href="/create-marriage-invitation-card">create the marriage invitation card</Link> and an invite video together. It&apos;s free, with no watermark and no sign-up.
          </p>
        </div>
      </section>

      <section className="s-section">
        <h2>Finished wedding card designs</h2>
        <p>Real examples made with the tool, with names, dates and venues filled in. Tap one to start from it.</p>
        <Tiles tiles={tilesFor(["wedding"], 10, "shaadi")} />
      </section>

      <section className="s-section">
        <h2>Hindu wedding card designs by style</h2>
        <p>
          Every design keeps a large clear space for all the text a Hindu shadi card needs, the way printed cards do: the blessing, both families, every function. Jump to a style:
        </p>
      </section>
      {cats.map((c) => (
        <section key={c.id} id={c.id} className="s-section s-cat">
          <h2>{c.name} wedding card designs</h2>
          <ul className="s-tiles">
            {c.designs.map((d) => (
              <li key={d.id}>
                <Link href={d.href} aria-label={`Use this design: ${d.alt}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.src} alt={d.alt} width={180} height={320} loading="lazy" decoding="async" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <Faq
        items={[
          { q: "What should a Hindu wedding card include?", a: "Usually Ganesh ji or a shloka at the top, the blessing of the elders, the couple's names with their parents' names, every function's date, time and venue, and an RSVP contact. Our wedding invitation wording page has examples to copy." },
          { q: "Can I download the wedding card as a PDF?", a: "Yes. Open the design, add your details, then press Download. You get a print-ready PDF (or pictures for WhatsApp) of the pages you choose, with the venue and phone numbers tappable. Tap Make it move in the same sheet for an animated invite video." },
          { q: "Are these shadi card designs free to use?", a: "Yes, every design is free, with no watermark and no sign-up. You can share, post and print what you make." },
          { q: "Can I change the colours of a design?", a: "Yes. In the editor, Colours changes the paper and the artwork, with themes for each function such as yellow for Haldi and green for Mehendi." },
        ]}
      />
      <Cta />
    </>
  );
}
