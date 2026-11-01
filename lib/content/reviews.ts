// Real reviews from the rating box under finished videos (they arrive in PostHog as "review_submitted").
// Copy a review here only if its author ticked "You can show my review on the website" (can_show: true),
// word for word. Never invent, edit the meaning of, or pay for reviews: fake reviews break Google's rules
// and India's consumer-protection rules on online reviews.

import reviewsJson from "@/data/reviews.json";

export type Review = { name: string; stars: number; text: string; date: string; event?: string };

export const REVIEWS = (reviewsJson as Review[]).filter((r) => r.text && r.stars >= 1 && r.stars <= 5);

// Star rating summary, only once there are enough real reviews to mean something.
export function ratingSummary(min = 5) {
  if (REVIEWS.length < min) return null;
  const avg = REVIEWS.reduce((s, r) => s + r.stars, 0) / REVIEWS.length;
  return { average: Math.round(avg * 10) / 10, count: REVIEWS.length };
}
