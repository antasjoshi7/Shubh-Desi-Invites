import Link from "next/link";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="s-header">
      <Link href="/" className="s-logo" aria-label={`${SITE.name} home`}>
        <span className="s-logo-mark" aria-hidden="true">✦</span>
        {SITE.name}
      </Link>
      <nav aria-label="Main">
        <Link href="/designs">Designs</Link>
        <Link href="/wedding-invitation-wording">Wording</Link>
        <Link href="/create" className="s-btn s-btn-small">Make invite</Link>
      </nav>
    </header>
  );
}
