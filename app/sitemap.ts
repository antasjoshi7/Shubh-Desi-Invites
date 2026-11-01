import type { MetadataRoute } from "next";
import { EVENT_PAGES } from "@/lib/content/events";
import { publishedGuides, publishedPages } from "@/lib/content/files";
import { SITE, absolute } from "@/lib/site";

// The list of every page we want in Google, with when it last changed. Drafts and the editor are left out.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const landing = ["/", ...EVENT_PAGES.map((p) => `/${p.slug}`), "/animated-wedding-invitation", "/wedding-e-card", "/wedding-invitation-wording", "/digital-wedding-invitation-price", "/designs", "/guides"];
  return [
    ...landing.map((path) => ({ url: absolute(path), lastModified: SITE.updated, changeFrequency: "monthly" as const, priority: path === "/" ? 1 : 0.8 })),
    ...publishedGuides().map((g) => ({ url: absolute(`/guides/${g.slug}`), lastModified: g.updated || SITE.updated, changeFrequency: "yearly" as const, priority: 0.6 })),
    ...publishedPages().map((p) => ({ url: absolute(`/${p.slug}`), lastModified: p.updated || SITE.updated, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
