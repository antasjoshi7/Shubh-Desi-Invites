import Link from "next/link";
import { Cta } from "@/components/site/Cta";
import { SiteFooter } from "@/components/site/Footer";
import { SiteHeader } from "@/components/site/Header";
import "./(site)/site.css";

// Any address that doesn't exist: point people back to the main pages.
export default function NotFound() {
  return (
    <div className="site">
      <SiteHeader />
      <main>
        <section className="s-hero" style={{ gridTemplateColumns: "1fr" }}>
          <div>
            <h1>This page isn&apos;t here</h1>
            <p className="s-lead">
              It may have moved. Try the <Link href="/">home page</Link>, the <Link href="/designs">designs</Link> or the{" "}
              <Link href="/wedding-invitation-wording">wording collection</Link>.
            </p>
            <Cta />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
