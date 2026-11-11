import type { Metadata, Viewport } from "next";
import Board from "./Board";

// The mood board tool itself. Like the invite editor, it's drawn in the browser, so there's nothing on
// it for search engines to read: it stays out of the index and /wedding-mood-board does the ranking.
export const metadata: Metadata = {
  title: "Wedding mood board",
  description: "Mark up the decor and outfits you love for each wedding function, then send your decorator a clear brief and your guests a what-to-wear card.",
  alternates: { canonical: "/moodboard" },
  openGraph: { title: "Wedding mood board", images: ["/og/moodboard.jpg"] },
  robots: { index: false, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbf8f2",
};

export default function MoodboardPage() {
  return <Board />;
}
