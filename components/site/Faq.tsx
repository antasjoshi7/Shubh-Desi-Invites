import type { Faq as FaqItem } from "@/lib/content/events";
import { faqSchema } from "@/lib/schema";
import { JsonLd } from "./JsonLd";

// Questions people ask, as plain text on the page (and as FAQ structured data).
export function Faq({ items, title = "Questions people ask" }: { items: FaqItem[]; title?: string }) {
  return (
    <section className="s-section" aria-labelledby="faq">
      <h2 id="faq">{title}</h2>
      <div className="s-faq">
        {items.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      <JsonLd data={faqSchema(items)} />
    </section>
  );
}
