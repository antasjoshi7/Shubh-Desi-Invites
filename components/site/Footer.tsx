import Link from "next/link";
import { EVENT_PAGES } from "@/lib/content/events";
import { publishedPages } from "@/lib/content/pages";
import { SITE } from "@/lib/site";
import { Nazar, Toran } from "./Desi";

// Every page links to every other main page from here, so search engines find them all.
export function SiteFooter() {
  const pages = publishedPages();
  return (
    <footer className="s-footer">
      <Toran id="s-toran-f" />
      <div className="s-footer-sign">
        <Nazar size={58} />
        <p lang="hi">नज़र न लगे</p>
        <span>Shaadi mubarak, in advance</span>
      </div>
      <div className="s-footer-cols">
        <div>
          <h2>Invitation videos</h2>
          <ul>
            <li><Link href="/">Wedding invitation video</Link></li>
            {EVENT_PAGES.map((p) => (
              <li key={p.slug}><Link href={`/${p.slug}`}>{p.name} invitation video</Link></li>
            ))}
            <li><Link href="/animated-wedding-invitation">Animated wedding invitation</Link></li>
            <li><Link href="/create-marriage-invitation-card">Marriage invitation card</Link></li>
          </ul>
        </div>
        <div>
          <h2>Ideas</h2>
          <ul>
            <li><Link href="/wedding-invitation-wording">Invitation wording</Link></li>
            <li><Link href="/digital-wedding-invitation-price">What invites cost</Link></li>
            <li><Link href="/wedding-card-design">Wedding card designs</Link></li>
            <li><Link href="/wedding-mood-board">Wedding mood board</Link></li>
            <li><Link href="/guides">Guides</Link></li>
          </ul>
        </div>
        <div>
          <h2>About</h2>
          <ul>
            {pages.map((p) => (
              <li key={p.slug}><Link href={`/${p.slug}`}>{p.title}</Link></li>
            ))}
            <li><a href="/feed.xml">RSS feed</a></li>
          </ul>
        </div>
      </div>
      <p className="s-fineprint">{SITE.name} is free to use. Your invite is made on your own device and never uploaded.</p>
    </footer>
  );
}
