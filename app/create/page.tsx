import type { Metadata } from "next";
import Editor from "./Editor";

// The editor itself. It's drawn on a canvas, so there's nothing here for search engines to read:
// it stays out of Google's index and the landing pages (which link here) do the ranking.
export const metadata: Metadata = {
  title: "Make your invite",
  description: "Design your Indian wedding invitation video: pick a design, add your names and dates, download an MP4.",
  alternates: { canonical: "/create" },
  robots: { index: false, follow: true },
};

export default function CreatePage() {
  return <Editor />;
}
