// Product analytics (PostHog), off unless NEXT_PUBLIC_POSTHOG_KEY is set.
// Cookieless: no cookies or local storage, so no cookie banner is needed. Nothing typed into an
// invite (names, dates, venues) is ever sent, only what happened: "picked a design", "downloaded a video".

import type { PostHog } from "posthog-js";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

let client: PostHog | null = null;
let queued: [string, Record<string, unknown>?][] = [];

export async function startAnalytics() {
  if (!KEY || client || typeof window === "undefined") return;
  const { default: posthog } = await import("posthog-js");
  posthog.init(KEY, {
    api_host: HOST,
    cookieless_mode: "always",
    person_profiles: "never",
    autocapture: false, // only the events below, and page views
    capture_pageview: false,
    disable_session_recording: true,
  });
  client = posthog;
  (window as unknown as { posthog?: PostHog }).posthog = posthog;
  queued.forEach(([e, p]) => posthog.capture(e, p));
  queued = [];
}

// Whether analytics (and so the rating box) is switched on for this site.
export const analyticsOn = () => !!KEY;

// Records one thing that happened. Never pass text typed into an invite (feedback the person
// chooses to send in the rating box is the one exception).
export function track(event: string, props?: Record<string, unknown>) {
  if (!KEY) return;
  if (client) client.capture(event, props);
  else queued.push([event, props]);
}
