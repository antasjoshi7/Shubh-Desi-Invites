import { SiteFooter } from "@/components/site/Footer";
import { SiteHeader } from "@/components/site/Header";
import { Ticker } from "@/components/site/Desi";
import "./site.css";

// The readable pages around the editor: landing pages, wording, designs, guides.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <SiteHeader />
      <Ticker items={["Ekdum free", "No watermark", "No sign-up", "PDF, pictures or video", "Made on your phone", "Hindi bhi chalega", "Never uploaded"]} />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
