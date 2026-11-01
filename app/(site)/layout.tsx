import { SiteFooter } from "@/components/site/Footer";
import { SiteHeader } from "@/components/site/Header";
import "./site.css";

// The readable pages around the editor: landing pages, wording, designs, guides.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
