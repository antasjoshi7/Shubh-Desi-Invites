import { REVIEWS, ratingSummary } from "@/lib/content/reviews";

// What families said, as plain text (readable by Google), gently scrolling sideways.
// Shows nothing until there are real reviews in data/reviews.json.
export function Reviews() {
  if (!REVIEWS.length) return null;
  const summary = ratingSummary();
  const row = REVIEWS.map((r, i) => (
    <figure key={i} className="s-review">
      <div className="s-review-stars" aria-label={`${r.stars} out of 5 stars`}>
        {"★".repeat(r.stars)}
        <span>{"★".repeat(5 - r.stars)}</span>
      </div>
      <blockquote>{r.text}</blockquote>
      <figcaption>
        {r.name}
        {r.event ? `, ${r.event}` : ""}
      </figcaption>
    </figure>
  ));
  return (
    <section className="s-section" aria-labelledby="reviews">
      <h2 id="reviews">What families say</h2>
      {summary && (
        <p>
          Rated {summary.average} out of 5 by {summary.count} families who made their invite here.
        </p>
      )}
      <div className="s-reviews">
        <div className={"s-reviews-track" + (REVIEWS.length > 2 ? " moving" : "")}>
          {row}
          {REVIEWS.length > 2 && <div aria-hidden="true" className="s-reviews-copy">{row}</div>}
        </div>
      </div>
    </section>
  );
}
