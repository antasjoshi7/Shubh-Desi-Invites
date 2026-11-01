import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Crumbs } from "@/components/site/Crumbs";
import { Cta } from "@/components/site/Cta";
import { Faq } from "@/components/site/Faq";
import { MotionReel } from "@/components/site/MotionReel";
import { JsonLd } from "@/components/site/JsonLd";
import { Tiles } from "@/components/site/Tiles";
import { Wordings } from "@/components/site/Wordings";
import { EVENT_PAGES, eventPage } from "@/lib/content/events";
import { allPages } from "@/lib/content/pages";
import { tilesFor } from "@/lib/content/gallery";
import { motionsNamed } from "@/lib/content/motions";
import { appSchema, howToSchema } from "@/lib/schema";
import { COUNTS, SITE } from "@/lib/site";
import { Prose } from "@/components/site/Prose";

// One page per event (/haldi-invitation-video …) plus the Markdown pages in content/pages (/about …).
export const dynamicParams = false;
export function generateStaticParams() {
  return [...EVENT_PAGES.map((p) => ({ slug: p.slug })), ...allPages().map((p) => ({ slug: p.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = eventPage(slug);
  if (e) {
    return {
      title: { absolute: e.title },
      description: e.description,
      alternates: { canonical: `/${slug}` },
      openGraph: { title: e.title, description: e.description, url: `/${slug}`, images: [`/og/${e.event}.jpg`] },
    };
  }
  const p = allPages().find((x) => x.slug === slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/${slug}` },
    robots: p.published ? undefined : { index: false, follow: true },
  };
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = eventPage(slug);
  if (!e) {
    const p = allPages().find((x) => x.slug === slug);
    if (!p) notFound();
    return <Prose doc={p} trail={[{ name: p.title, path: `/${slug}` }]} />;
  }
  const start = `/create?event=${e.event}`;
  const steps = [
    { name: `Pick a ${e.name} design`, text: `Choose one of the ${e.name} designs below, or any of the ${COUNTS.designs} designs in the library.` },
    { name: "Type your details", text: "Tap the text on the invite to change names, date, time and venue. It fits itself to the design." },
    { name: "Download the video", text: "Add music and an animation, then press Export. You get an MP4 for WhatsApp and Instagram stories." },
  ];
  const others = EVENT_PAGES.filter((x) => x.slug !== slug);
  return (
    <>
      <Crumbs trail={[{ name: `${e.name} invitation video`, path: `/${slug}` }]} />
      <section className="s-hero">
        <div>
          <h1>{e.h1}</h1>
          <p className="s-lead">{e.lead}</p>
          <Cta href={start} label={`Make a ${e.name} invite`} />
          <p className="s-updated">Updated {new Date(SITE.updated).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
        </div>
        <Tiles tiles={tilesFor(e.categories, 3, e.event)} />
      </section>

      <section className="s-section">
        <h2>{e.question}</h2>
        <div className="s-answer">
          <p>{e.answer}</p>
        </div>
      </section>

      <section className="s-section">
        <h2>{e.name} invitation designs</h2>
        <p>Tap a design to open it in the editor with {e.name} wording ready to change.</p>
        <Tiles tiles={tilesFor(e.categories, 10, e.event)} />
        <p>
          Want something else? Browse all {COUNTS.designs} <Link href="/wedding-card-design">wedding card designs</Link>.
        </p>
      </section>

      <section className="s-section">
        <h2>What to write on a {e.name} invitation</h2>
        <ul className="s-list">
          {e.include.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      </section>

      <section className="s-section s-cat" id="wording">
        <h2>{e.name} invitation wording you can copy</h2>
        <p>Copy one, change the names and details, and paste it into the editor. Each line goes on its own line of the invite.</p>
        <Wordings items={e.wording} />
        <h3 style={{ marginTop: 24 }}>Message to send with the video on WhatsApp</h3>
        <div className="s-answer">
          <p>{e.whatsapp}</p>
        </div>
        <p style={{ marginTop: 14 }}>
          More wording for every function is in the <Link href="/wedding-invitation-wording">wedding invitation wording</Link> collection.
        </p>
      </section>

      <section className="s-section">
        <h2>{e.name} dress code ideas</h2>
        <ul className="s-chips">
          {e.dress.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <h3 style={{ marginTop: 22 }}>When to send it</h3>
        <p>{e.timing}</p>
      </section>

      <section className="s-section">
        <h2>Animations for a {e.name} invite</h2>
        <p>
          Painted animations that move around your text. Tap one to start your {e.name} page with it, or see{" "}
          <Link href="/animated-wedding-invitation">all animated invitation styles</Link>.
        </p>
        <MotionReel items={motionsNamed(e.motions)} />
      </section>

      <section className="s-section">
        <h2>How to make a {e.name} invitation video</h2>
        <ol className="s-steps">
          {steps.map((s) => (
            <li key={s.name}>
              <h3>{s.name}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <Cta href={start} label={`Start your ${e.name} invite`} />
        <JsonLd data={howToSchema(`How to make a ${e.name} invitation video`, steps)} />
      </section>

      <Faq items={e.faqs} />

      <section className="s-section">
        <h2>Invites for the other functions</h2>
        <ul className="s-cards">
          {others.map((o) => (
            <li key={o.slug}>
              <h3>
                <Link href={`/${o.slug}`}>{o.name} invitation video</Link>
              </h3>
              <p>{o.lead.split(":")[0]}.</p>
            </li>
          ))}
          <li>
            <h3>
              <Link href="/">Wedding invitation video</Link>
            </h3>
            <p>The full invite: every function in one video.</p>
          </li>
        </ul>
      </section>
      <JsonLd data={appSchema({ name: `${e.name} invitation video maker`, description: e.description, path: `/${slug}`, image: `/og/${e.event}.jpg` })} />
    </>
  );
}
