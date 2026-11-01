// Builders for structured data (schema.org JSON-LD). See docs/SEO-PLAYBOOK.md for what each one does.

import type { Faq } from "./content/events";
import { SITE, absolute } from "./site";

export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": absolute("/#org"),
  name: SITE.name,
  url: SITE.url,
  logo: absolute("/icon-512.png"),
  ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}),
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absolute("/#website"),
  name: SITE.name,
  url: SITE.url,
  inLanguage: "en-IN",
  publisher: { "@id": absolute("/#org") },
});

// The tool itself, marked as a free web app.
export const appSchema = (opts: { name: string; description: string; path: string; image?: string }) => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: opts.name,
  description: opts.description,
  url: absolute(opts.path),
  applicationCategory: "DesignApplication",
  operatingSystem: "Any (works in the browser on Android, iPhone and computers)",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  ...(opts.image ? { image: absolute(opts.image) } : {}),
  publisher: { "@id": absolute("/#org") },
});

export const faqSchema = (items: Faq[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export const breadcrumbSchema = (trail: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: absolute(t.path) })),
});

export const howToSchema = (name: string, steps: { name: string; text: string }[], totalTime = "PT5M") => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name,
  totalTime,
  estimatedCost: { "@type": "MonetaryAmount", currency: "INR", value: "0" },
  step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
});

export const articleSchema = (a: { title: string; description: string; path: string; published: string; updated: string; image?: string }) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: a.title,
  description: a.description,
  url: absolute(a.path),
  datePublished: a.published,
  dateModified: a.updated,
  inLanguage: "en-IN",
  ...(a.image ? { image: absolute(a.image) } : {}),
  author: SITE.author ? { "@type": "Person", name: SITE.author, ...(SITE.sameAs.length ? { sameAs: SITE.sameAs } : {}) } : { "@id": absolute("/#org") },
  publisher: { "@id": absolute("/#org") },
});
