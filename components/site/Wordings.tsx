import type { Wording } from "@/lib/content/events";

// Ready-to-copy invite wording, shown like a card.
export function Wordings({ items }: { items: Wording[] }) {
  return (
    <div className="s-wordings">
      {items.map((w) => (
        <figure key={w.label} className="s-wording">
          <figcaption>{w.label}</figcaption>
          <blockquote>{w.text}</blockquote>
        </figure>
      ))}
    </div>
  );
}
