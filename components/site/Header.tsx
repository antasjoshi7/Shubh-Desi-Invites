import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="s-header">
      <Link href="/" className="s-logo" aria-label={`${SITE.name} home`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/mark.png" alt="" width={30} height={30} className="s-logo-mark" />
        {SITE.name}
      </Link>
      <nav aria-label="Main">
        <Link href="/animated-wedding-invitation">Animations</Link>
        <Link href="/wedding-card-design">Designs</Link>
        <Link href="/wedding-invitation-wording">Wording</Link>
        <Link href="/create" className="s-btn s-btn-small">Make invite</Link>
      </nav>
    </header>
  );
}
