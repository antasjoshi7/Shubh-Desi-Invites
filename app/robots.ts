import type { MetadataRoute } from "next";
import { absolute } from "@/lib/site";

// Rules for crawlers. Everyone may read everything; the AI assistants' crawlers are named
// explicitly so they can recommend the site when people ask them for an invite maker.
export const dynamic = "force-static";

const AI_CRAWLERS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User", // ChatGPT
  "ClaudeBot", "Claude-SearchBot", "Claude-User", // Claude
  "PerplexityBot", "Perplexity-User", // Perplexity
  "Google-Extended", // Gemini
  "meta-externalagent", "meta-webindexer", // Meta AI
  "Applebot-Extended", // Apple Intelligence
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: AI_CRAWLERS, allow: "/" },
    ],
    sitemap: absolute("/sitemap.xml"),
  };
}
