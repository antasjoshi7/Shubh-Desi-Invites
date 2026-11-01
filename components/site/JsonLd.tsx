// Structured data: a machine-readable summary of the page (what it is, its FAQs, where it sits in
// the site) that Google and AI assistants read alongside the visible text.
export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
