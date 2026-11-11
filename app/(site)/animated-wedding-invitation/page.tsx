import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs } from "@/components/site/Crumbs";
import { Cta } from "@/components/site/Cta";
import { Faq } from "@/components/site/Faq";
import { JsonLd } from "@/components/site/JsonLd";
import { MotionReel } from "@/components/site/MotionReel";
import { EVENT_PAGES } from "@/lib/content/events";
import { MOTION_PREVIEWS, SCENE_PREVIEWS, SINGLE_PREVIEWS, motionsNamed, videoSchema } from "@/lib/content/motions";
import { appSchema } from "@/lib/schema";
import { HeroPic, HeroStickers, Theme } from "@/components/site/Desi";

const COUNT = MOTION_PREVIEWS.length;
const TITLE = `Animated Wedding Invitation Maker: ${COUNT} Indian Animations, Free`;
const DESCRIPTION = `Make an animated Indian wedding invitation video: a baraat horse that gallops, palace doors that open, diyas that light up and ${COUNT - 3} more. Free, no watermark.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/animated-wedding-invitation" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/animated-wedding-invitation", images: ["/og/home.jpg"] },
};

export default function AnimatedPage() {
  return (
    <>
      <Crumbs trail={[{ name: "Animated wedding invitation", path: "/animated-wedding-invitation" }]} />
      <Theme name="animated" />
      <section className="s-hero" style={{ gridTemplateColumns: "1fr" }}>
        <div>
          <h1>Animated Indian wedding invitations</h1>
          <p className="s-lead">
            {COUNT} hand-painted animations made for Indian weddings: a baraat ghodi that really gallops, elephants that meet and raise their trunks, palace doors that swing open, diyas that light one by one. Pick one for each page of your invite and download the video.
          </p>
          <HeroStickers items={["Ghodi really gallops", "Hand-painted", "No watermark"]} />
          <Cta href="/create?motion=ghodi" label="Make an animated invite" />
        </div>
      </section>

      <section className="s-section">
        <h2>How do I make an animated wedding invitation for free?</h2>
        <div className="s-answer">
          <p>
            Open the <Link href="/create">invite maker</Link>, pick a design and type your details, then tap <strong>Motion</strong> and choose an animation for each page. Press <strong>Play</strong> to watch it, then <strong>Download</strong> and <strong>Make it move</strong> for a full HD MP4 with music. The animations are painted illustrations brought to life in the tool, not stock clips, and they always move around your text, never over it.
          </p>
        </div>
      </section>

      {SCENE_PREVIEWS.length > 0 && (
        <section className="s-section">
          <h2>Scenes: invites that play like a film</h2>
          <p>
            Several hand-painted elements arrive together and stay gently alive: elephants with royal fans, chandeliers over a royal court, a marigold toran with swinging temple bells. Tap any preview to use it.
          </p>
          <MotionReel items={SCENE_PREVIEWS} describe />
        </section>
      )}

      <section className="s-section">
        <h2>Single animations</h2>
        <p>One painted element bringing the page to life. Tap any preview to open it in the editor with that animation on the same design.</p>
        <MotionReel items={SINGLE_PREVIEWS} describe />
      </section>

      <section className="s-section">
        <h2>Which animation suits which function?</h2>
        <div className="s-table-wrap">
          <table className="s-compare">
            <thead>
              <tr>
                <th scope="col">Function</th>
                <th scope="col">Animations that fit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><Link href="/">Wedding invitation</Link></td>
                <td>Baraat ghodi, Elephant procession, Palace doors, Kalash blessing, Lotus bloom</td>
              </tr>
              {EVENT_PAGES.map((e) => (
                <tr key={e.slug}>
                  <td><Link href={`/${e.slug}`}>{e.name}</Link></td>
                  <td>{motionsNamed(e.motions).map((m) => m.name).join(", ") || e.motions.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Faq
        items={[
          { q: "Can each page have a different animation?", a: "Yes. Pick an animation per page: a palace-doors opening for the intro, marigolds for the Haldi page, lanterns for the Sangeet, and so on." },
          { q: "Does the animation cover my text?", a: "No. Each animation is built around the text: the horse runs below it, garlands hang beside it, and petals fall behind it. The finished page is always clean and readable." },
          { q: "Is there music with the animation?", a: "Yes. Choose a track like shehnai or dhol; it's original music made for the tool, so it won't be muted on Instagram or WhatsApp." },
          { q: "How long does each animation play?", a: "Each page shows for 3 to 15 seconds (you choose). The animation fits itself to that length." },
          { q: "Can I use a simple animation instead?", a: "Yes. There are also quiet ones: fade up, wipe, typewriter and blur in." },
          { q: "Do I need an app or a powerful phone?", a: "No app. It runs in Chrome or Safari; the video is made on your phone, so older phones just take a little longer to export." },
        ]}
      />
      <Cta href="/create?motion=ghodi" label="Make an animated invite" />
      <JsonLd data={[appSchema({ name: "Animated wedding invitation maker", description: DESCRIPTION, path: "/animated-wedding-invitation", image: "/og/home.jpg" }), ...MOTION_PREVIEWS.map(videoSchema)]} />
    </>
  );
}
