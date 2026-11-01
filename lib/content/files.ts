// Reads the Markdown pages and guides in content/ at build time.
// A file goes live only when its front matter says `status: published`; drafts build to a page
// that is hidden from Google (noindex) and left out of the sitemap, menus and RSS feed.

import fs from "node:fs";
import path from "node:path";
import { parseMarkdown, type Doc } from "../markdown";

export type ContentFile = Doc & {
  slug: string;
  title: string;
  description: string;
  published: boolean;
  date: string; // first published (YYYY-MM-DD)
  updated: string; // last meaningful change (YYYY-MM-DD)
  image?: string;
};

function readDir(dir: string): ContentFile[] {
  const full = path.join(process.cwd(), "content", dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .map((f) => {
      const doc = parseMarkdown(fs.readFileSync(path.join(full, f), "utf8"));
      const m = doc.meta;
      return {
        ...doc,
        slug: f.replace(/\.md$/, ""),
        title: m.title || f,
        description: m.description || "",
        published: m.status === "published",
        date: m.date || "",
        updated: m.updated || m.date || "",
        image: m.image || undefined,
      };
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export const allPages = () => readDir("pages");
export const publishedPages = () => allPages().filter((p) => p.published);
export const allGuides = () => readDir("guides");
export const publishedGuides = () => allGuides().filter((g) => g.published);
