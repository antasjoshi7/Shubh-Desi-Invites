import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs } from "@/components/site/Crumbs";
import { publishedGuides } from "@/lib/content/files";
import { HeroPic, HeroStickers, Theme } from "@/components/site/Desi";

export const metadata: Metadata = {
  title: "Guides for Indian wedding invitations",
  description: "How to make, word and send Indian wedding invitations: practical guides from real weddings.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  const guides = publishedGuides();
  return (
    <>
      <Crumbs trail={[{ name: "Guides", path: "/guides" }]} />
      <Theme name="paper" />
      <section className="s-hero" style={{ gridTemplateColumns: "1fr" }}>
        <div>
          <h1>Guides</h1>
          <p className="s-lead">Practical help with Indian wedding invitations: what to write, when to send, and how to make them.</p>
          <HeroStickers items={["Seedhi baat", "Written by a family, for families"]} />
        </div>
      </section>
      <ul className="s-guides">
        {guides.map((g) => (
          <li key={g.slug}>
            <h2 style={{ fontSize: 22 }}>
              <Link href={`/guides/${g.slug}`}>{g.title}</Link>
            </h2>
            <p style={{ margin: 0 }}>{g.description}</p>
          </li>
        ))}
        {!guides.length && <li>New guides are on the way.</li>}
      </ul>
    </>
  );
}
