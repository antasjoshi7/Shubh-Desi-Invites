import { publishedGuides } from "@/lib/content/files";
import { SITE, absolute } from "@/lib/site";

// RSS feed of the guides, so feed readers and aggregators pick up new ones.
export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const items = publishedGuides()
    .map(
      (g) => `    <item>
      <title>${esc(g.title)}</title>
      <link>${absolute(`/guides/${g.slug}`)}</link>
      <guid>${absolute(`/guides/${g.slug}`)}</guid>
      <pubDate>${new Date(g.date || SITE.updated).toUTCString()}</pubDate>
      <description>${esc(g.description)}</description>
    </item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(SITE.name)} guides</title>
    <link>${SITE.url}</link>
    <description>${esc(SITE.definition)}</description>
    <language>en-in</language>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
