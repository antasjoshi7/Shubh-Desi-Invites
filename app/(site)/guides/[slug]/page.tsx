import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cta } from "@/components/site/Cta";
import { JsonLd } from "@/components/site/JsonLd";
import { Prose } from "@/components/site/Prose";
import { allGuides } from "@/lib/content/files";
import { articleSchema } from "@/lib/schema";

// Guides written in Markdown in content/guides. Drafts build too (so you can preview them) but stay out of Google.
export const dynamicParams = false;
export function generateStaticParams() {
  const guides = allGuides();
  return guides.length ? guides.map((g) => ({ slug: g.slug })) : [{ slug: "_none" }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = allGuides().find((x) => x.slug === slug);
  if (!g) return { robots: { index: false } };
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: `/guides/${slug}` },
    openGraph: { type: "article", title: g.title, description: g.description, url: `/guides/${slug}`, ...(g.image ? { images: [g.image] } : {}) },
    robots: g.published ? undefined : { index: false, follow: true },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = allGuides().find((x) => x.slug === slug);
  if (!g) notFound();
  return (
    <>
      <Prose doc={g} trail={[{ name: "Guides", path: "/guides" }, { name: g.title, path: `/guides/${slug}` }]}>
        <Cta />
      </Prose>
      {g.published && <JsonLd data={articleSchema({ title: g.title, description: g.description, path: `/guides/${slug}`, published: g.date, updated: g.updated, image: g.image })} />}
    </>
  );
}
