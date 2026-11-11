import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs } from "@/components/site/Crumbs";
import { Cta } from "@/components/site/Cta";
import { Faq } from "@/components/site/Faq";
import { Wordings } from "@/components/site/Wordings";
import { EVENT_PAGES } from "@/lib/content/events";
import { WORDING_FAQS, WORDING_GROUPS } from "@/lib/content/wording";
import { HeroPic, HeroStickers, Theme } from "@/components/site/Desi";

const TITLE = "Wedding Invitation Wording: 20+ Indian Examples to Copy";
const DESCRIPTION =
  "Indian wedding invitation wording to copy: traditional Hindu, from the bride's or groom's parents, from the couple, Hindi lines, RSVP and WhatsApp messages.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/wedding-invitation-wording" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/wedding-invitation-wording" },
};

export default function WordingPage() {
  const count = WORDING_GROUPS.reduce((n, g) => n + g.items.length, 0);
  return (
    <>
      <Crumbs trail={[{ name: "Wedding invitation wording", path: "/wedding-invitation-wording" }]} />
      <Theme name="wording" />
      <section className="s-hero" style={{ gridTemplateColumns: "1fr" }}>
        <div>
          <h1>Wedding invitation wording</h1>
          <p className="s-lead">
            {count} ready-to-copy examples for Indian wedding invitations: traditional, from parents, from the couple, Hindi, RSVP lines and the WhatsApp message to send with your invite. Swap in your names and paste into the{" "}
            <Link href="/create">invite maker</Link>.
          </p>
          <HeroStickers items={["Copy-paste ready", "Hindi + Hinglish", "Mummy will check anyway"]} />
          <ul className="s-jump">
            {WORDING_GROUPS.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`}>{g.title.replace(/ wedding invitation wording| wording.*$/i, "")}</a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="s-section">
        <h2>What should a wedding invitation say?</h2>
        <div className="s-answer">
          <p>
            Who is inviting (parents, both families or the couple), the couple&apos;s names with their parents&apos; names, the date and time, the venue, and an RSVP contact. Traditional Hindu invites open with Ganesh ji&apos;s blessing. Keep each piece on its own line so it reads well on a phone screen.
          </p>
        </div>
      </section>

      {WORDING_GROUPS.map((g) => (
        <section key={g.id} id={g.id} className="s-section s-cat">
          <h2>{g.title}</h2>
          <p>{g.intro}</p>
          <Wordings items={g.items} />
        </section>
      ))}

      <section className="s-section">
        <h2>Wording for each function</h2>
        <ul className="s-cards">
          {EVENT_PAGES.map((e) => (
            <li key={e.slug}>
              <h3>
                <Link href={`/${e.slug}#wording`}>{e.name} invitation wording</Link>
              </h3>
              <p>{e.wording.length} examples, plus a WhatsApp message.</p>
            </li>
          ))}
        </ul>
      </section>

      <Faq items={WORDING_FAQS} />
      <Cta label="Put your wording on an invite" />
    </>
  );
}
