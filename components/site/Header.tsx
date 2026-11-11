import Link from "next/link";
import { SITE } from "@/lib/site";
import { Marigold, NimbuMirchi, Toran } from "./Desi";

export function SiteHeader() {
  return (
    <div className="s-top">
      <Toran />
      <header className="s-header">
        <Link href="/" className="s-logo" aria-label={`${SITE.name} home`}>
          <Marigold size={34} />
          {SITE.name}
        </Link>
        <nav aria-label="Main">
          <Link href="/animated-wedding-invitation">Animations</Link>
          <Link href="/wedding-card-design">Designs</Link>
          <Link href="/wedding-invitation-wording">Wording</Link>
          <Link href="/wedding-mood-board">Mood board</Link>
          <Link href="/create" className="s-btn s-btn-small">Make invite</Link>
        </nav>
        <NimbuMirchi className="s-hang" />
      </header>
      {/* phones: the same links in a row that scrolls sideways (the header only has room for the button) */}
      <nav className="s-mnav" aria-label="Main (phone)">
        <Link href="/wedding-card-design">Designs</Link>
        <Link href="/wedding-invitation-wording">Wording</Link>
        <Link href="/wedding-mood-board">Mood board</Link>
        <Link href="/animated-wedding-invitation">Animations</Link>
        <Link href="/guides">Guides</Link>
      </nav>
    </div>
  );
}
