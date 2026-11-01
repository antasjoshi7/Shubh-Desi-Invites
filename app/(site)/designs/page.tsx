import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs } from "@/components/site/Crumbs";
import { Cta } from "@/components/site/Cta";
import { designsByCategory } from "@/lib/content/gallery";
import { COUNTS } from "@/lib/site";

const TITLE = `Indian Wedding Invitation Designs: ${COUNTS.designs} Free Templates`;
const DESCRIPTION = `Browse ${COUNTS.designs} free Indian wedding invitation designs: peacocks, elephants, marigold, Pichwai lotus, palaces, mehendi and more. Tap one to make your invite.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/designs" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/designs" },
};

export default function DesignsPage() {
  const cats = designsByCategory();
  return (
    <>
      <Crumbs trail={[{ name: "Designs", path: "/designs" }]} />
      <section className="s-hero" style={{ gridTemplateColumns: "1fr" }}>
        <div>
          <h1>Indian wedding invitation designs</h1>
          <p className="s-lead">
            {COUNTS.designs} free designs so far, in the styles trending on Pinterest and Instagram, with new ones every week. Each leaves a large clear space for your text. Tap any design to open it in the <Link href="/create">invite maker</Link>; you can change its colours there.
          </p>
          <ul className="s-jump">
            {cats.map((c) => (
              <li key={c.id}>
                <a href={`#${c.id}`}>{c.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      {cats.map((c) => (
        <section key={c.id} id={c.id} className="s-section s-cat">
          <h2>{c.name} designs</h2>
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
      <Cta />
    </>
  );
}
