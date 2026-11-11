import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs } from "@/components/site/Crumbs";
import { Cta } from "@/components/site/Cta";
import { Faq } from "@/components/site/Faq";
import { JsonLd } from "@/components/site/JsonLd";
import { EVENT_PAGES, type Faq as FaqItem } from "@/lib/content/events";
import { SAMPLE_CREDITS } from "@/lib/moodboard/samples";
import { appSchema, howToSchema } from "@/lib/schema";
import { HeroPic, HeroStickers, Theme } from "@/components/site/Desi";

// The page Google reads for the mood board. The tool itself lives at /moodboard and, like the invite
// editor, stays out of the index: it's drawn in the browser, so there's nothing on it to read.
// Positioning (docs/MOODBOARD.md): Pinterest is where people find ideas; this is where a family decides
// and tells people. Search volumes for these terms aren't looked up yet (docs/keywords.md); recheck the
// title once they are.
const PATH = "/wedding-mood-board";
const TITLE = "Indian Wedding Mood Board: Decorator Brief and Dress Code";
const DESCRIPTION =
  "Put your saved screenshots for each function on one board, mark what you love, and send your decorator a brief and guests a what-to-wear card. Free.";
const IMAGE = "/og/moodboard.jpg";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PATH, images: [IMAGE] },
};

const STEPS = [
  { name: "Add what you've saved", text: "Add screenshots and photos for one function at a time: Pinterest pins, Instagram posts, the decorator's own photos on WhatsApp, or a frame from a reel. Say which function each is for and whether it's decor, an outfit, flowers or a detail." },
  { name: "Mark what you love", text: "Tap the heart on the ones you want. Tap a photo right on the part you mean to pin a note there: “these flowers”, “this backdrop”, “not this colour”. The board reads the colours from your photos and names them." },
  { name: "Send it", text: "Send the decorator brief to your decorator and the what-to-wear card to your guests, as a PDF or pictures on WhatsApp. Nobody needs an app to open them." },
];

const PALETTES = [
  { fn: "Haldi", colours: ["#f4c430", "#f2a20c", "#f6efdf"], words: "Haldi yellow, marigold and white", note: "Marigold strings, low seating and a lot of yellow. Many families ask guests not to wear white, because of the turmeric." },
  { fn: "Mehendi", colours: ["#63b83c", "#d81b72", "#f28a3c"], words: "Parrot green, rani pink and orange", note: "Bright prints, floor cushions and parasols. Greens and florals are the usual dress code." },
  { fn: "Sangeet", colours: ["#4a2259", "#b5187c", "#d4a534"], words: "Jamun purple, magenta and gold", note: "An evening function, so fairy lights and a stage. Jewel tones, sparkle or Indo-western for guests." },
  { fn: "Wedding", colours: ["#c81e2c", "#d4a534", "#f6efdf"], words: "Sindoor red, gold and ivory", note: "The classic, though pastel weddings in peach, ivory and blush are common now." },
  { fn: "Reception", colours: ["#1c2550", "#b08a3c", "#f7f5f0"], words: "Navy, antique gold and pearl white", note: "Often the most formal: suits, sarees and gowns, with fewer rules on colour." },
];

const FAQS: FaqItem[] = [
  { q: "Is the wedding mood board free?", a: "Yes. Making a board, the decorator brief, the what-to-wear card, the poster and the PDF of your whole board are all free, with no watermark and no ads." },
  { q: "Do I need an account?", a: "No. Open it and start. Your board saves on your own phone as you go, so you can close it and come back later." },
  { q: "Can I use screenshots from Pinterest and Instagram?", a: "Yes. Add the screenshots you've saved for your own planning. The board trims the app's bars off screenshots, spots the same picture added twice, and asks which function each one is for." },
  { q: "Does my decorator need to download anything?", a: "No. The brief is a PDF or a set of pictures you send on WhatsApp. Each photo shows numbered pins and the note for each pin next to it, so the decorator knows exactly which part you mean." },
  { q: "Can I add reels?", a: "Yes. Add a saved reel or a screen recording, play it to the moment you like and keep that frame. You can keep several frames from one video." },
  { q: "Is it AI? Does it change my photos?", a: "No. It doesn't generate or edit pictures. It reads the main colours from your photos with simple maths on your phone, and everything else is what you mark." },
  { q: "Where are my photos stored?", a: "Only on your phone, inside your browser. Nothing is uploaded. Use “A backup file” in Send to keep a copy or to move your board to another phone." },
  { q: "Can the bride and groom both make one?", a: "Yes. Each person makes their own board on their own phone and sends the parts they want to the other, to family, or to the decorator." },
  { q: "Can I still use Pinterest?", a: "Yes, and you should. Pinterest is the best place to find ideas. This is for the step after: picking from what you saved, and telling people clearly." },
];

const pick = (src: string, alt: string) => ({ src: `/moodboard/landing/${src}.jpg`, alt });

export default function MoodBoardPage() {
  return (
    <>
      <Crumbs trail={[{ name: "Wedding mood board", path: PATH }]} />
      <Theme name="moodboard" />

      <section className="s-hero">
        <div>
          <p className="s-kicker">Pinterest is for finding ideas. This is for deciding.</p>
          <h1>Wedding mood board for every function</h1>
          <p className="s-lead">
            Put everything you&apos;ve saved for the Haldi, Mehendi, Sangeet and wedding in one place. Mark exactly what you love, and the board finds your colours. Then send your decorator a brief they can act on, and your guests a card that answers &ldquo;what do we wear?&rdquo;. Free on your phone, with no sign-up.
          </p>
          <HeroStickers items={["No more 3 video calls", "Decorator will get it", "Nazar na lage"]} />
          <Cta href="/moodboard" label="Make your mood board, free" note="Opens with a sample board, so you can see how it works first." />
        </div>
        <HeroPic stamp={<><b>शुभ</b>Brief!</>}>
          <div className="s-hero-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/moodboard/landing/brief-haldi.jpg" alt="A decorator brief for a Haldi: loved photos with numbered notes and the colour names" width={360} height={640} fetchPriority="high" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/moodboard/landing/wear-haldi.jpg" alt="A what-to-wear card for a Haldi: shades of yellow, no white, with gold, rust and saffron swatches" width={360} height={640} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/moodboard/landing/poster-sangeet.jpg" alt="A Sangeet mood board: a collage of fairy lights and outfits with a purple and gold palette" width={360} height={640} />
        </div>
        </HeroPic>
      </section>

      <section className="s-section">
        <h2>How do I make a wedding mood board?</h2>
        <div className="s-answer">
          <p>
            Collect pictures for one function at a time, mark the ones you love and the exact parts you mean, and keep the colours that keep coming up. On this <Link href="/moodboard">mood board maker</Link>, you add your screenshots, tap which function each is for, tap a heart and pin notes on the photo. It sorts the board by function, names your colour palette, and turns it into a brief for your decorator and a dress-code card for your guests.
          </p>
        </div>
      </section>

      <section className="s-section">
        <h2>Two things a family actually needs to send</h2>
        <div className="s-out">
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pick("brief-haldi", "").src} alt="Decorator brief: each loved photo shown whole, with numbered pins and the note for each" width={360} height={640} loading="lazy" decoding="async" />
            <figcaption>
              <h3>A brief for your decorator</h3>
              <p>
                Every photo you loved, shown whole, with numbered pins on the exact spots and your note for each: &ldquo;1. genda phool strings like this&rdquo;, &ldquo;2. a gold lotus seat for the bride&rdquo;. The colour names go on top, combinations you love together go below, and the ones you don&apos;t want are crossed out. It replaces three video calls and a long voice note.
              </p>
            </figcaption>
          </figure>
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pick("wear-sangeet", "").src} alt="What to wear card for a Sangeet: jewel tones and a little sparkle, with three colour swatches and an example photo" width={360} height={640} loading="lazy" decoding="async" />
            <figcaption>
              <h3>A what-to-wear card for your guests</h3>
              <p>
                The function, the dress code in one line, the colours to wear with their names, and an example outfit. Send it to the family group with the invite and stop answering &ldquo;what do we wear for the Haldi?&rdquo; one person at a time.
              </p>
            </figcaption>
          </figure>
        </div>
        <p>You can also share a poster of any function&apos;s mood board, an outfit brief for the tailor, or your whole board as a PDF.</p>
      </section>

      <section className="s-section">
        <h2>Three steps</h2>
        <ol className="s-steps">
          {STEPS.map((s) => (
            <li key={s.name}>
              <h3>{s.name}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
        <JsonLd data={howToSchema("How to make a wedding mood board and decorator brief", STEPS, "PT10M")} />
      </section>

      <section className="s-section">
        <h2>Why not just use Pinterest?</h2>
        <p>
          Keep using it to find ideas. A Pinterest board is good at collecting and bad at deciding: after a few weeks it holds hundreds of pins, and none of them says which part you liked or what you want built. This picks up where Pinterest stops.
        </p>
        <div className="s-table-wrap">
          <table className="s-compare">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col">Pinterest board</th>
                <th scope="col">This mood board</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Finding new ideas</td><td>Excellent</td><td>Not what it&apos;s for</td></tr>
              <tr><td>Instagram screenshots and the decorator&apos;s WhatsApp photos</td><td>Upload one pin at a time</td><td>Add them all at once</td></tr>
              <tr><td>Sorted by function</td><td>Board sections, by hand</td><td>Asked as you add</td></tr>
              <tr><td>Point at the exact part you love</td><td>A note on the whole pin</td><td>Numbered pins on the photo</td></tr>
              <tr><td>Your colours</td><td>You work them out</td><td>Read from your photos and named</td></tr>
              <tr><td>Telling the decorator</td><td>Send a link to the board</td><td>A numbered brief as a PDF</td></tr>
              <tr><td>Telling guests what to wear</td><td>No</td><td>A card per function</td></tr>
              <tr><td>Account</td><td>Needed</td><td>Not needed</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="s-section">
        <h2>Colour ideas for each function</h2>
        <p>
          Common starting points, not rules. Your own board will find your palette from the photos you love; these are here if you&apos;re starting from nothing.
        </p>
        <ul className="s-palettes">
          {PALETTES.map((p) => (
            <li key={p.fn}>
              <span className="s-swatches" aria-hidden="true">
                {p.colours.map((c) => <i key={c} style={{ background: c }} />)}
              </span>
              <h3>{p.fn}</h3>
              <p><strong>{p.words}.</strong> {p.note}</p>
            </li>
          ))}
        </ul>
        <p>
          Each function&apos;s page has more dress code ideas and wording for the invite:{" "}
          {EVENT_PAGES.map((e, i) => (
            <span key={e.slug}>
              {i > 0 && (i === EVENT_PAGES.length - 1 ? " and " : ", ")}
              <Link href={`/${e.slug}#dress-code`}>{e.name}</Link>
            </span>
          ))}
          .
        </p>
      </section>

      <section className="s-section">
        <h2>What to put in a brief for your wedding decorator</h2>
        <ul className="s-list">
          <li><strong>One brief per function.</strong> The Haldi and the reception are different jobs, often on different days and in different places.</li>
          <li><strong>The exact part, not the whole photo.</strong> &ldquo;This backdrop&rdquo; with a pin on it is clearer than a photo and &ldquo;like this&rdquo;.</li>
          <li><strong>Your colours by name.</strong> &ldquo;Marigold and white, no pink&rdquo; settles more than a mood.</li>
          <li><strong>Real or artificial flowers,</strong> and which flowers. It changes the price more than almost anything else.</li>
          <li><strong>What you don&apos;t want.</strong> One crossed-out photo saves a whole round of changes.</li>
          <li><strong>Things you love together.</strong> A backdrop from one photo with the flower strings from another.</li>
          <li><strong>A photo of the venue,</strong> so the decorator can say what will and won&apos;t fit.</li>
        </ul>
        <p>The brief the board makes covers the first six. Add a photo of your venue to the board and it goes in too.</p>
      </section>

      <section className="s-section">
        <h2>Private by default</h2>
        <p>
          Your board lives on your phone, inside your browser, and nothing is uploaded: not your photos, not your notes. You choose what to send and who gets it. There&apos;s no account to lose and no one else can open your board.
        </p>
      </section>

      <Faq items={FAQS} />
      <Cta href="/moodboard" label="Make your mood board, free" note="Then make the invite: the same functions, the same colours." />
      <p className="s-updated">Sample photos from Unsplash, by {SAMPLE_CREDITS.join(", ")}.</p>

      <JsonLd data={appSchema({ name: "Wedding mood board maker", description: DESCRIPTION, path: PATH, image: IMAGE })} />
    </>
  );
}
