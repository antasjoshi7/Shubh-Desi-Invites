"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { startAnalytics, track } from "@/lib/track";

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    startAnalytics();
  }, []);

  useEffect(() => {
    if (pathname && typeof window !== "undefined") {
      let url = window.location.origin + pathname;
      const sp = searchParams?.toString();
      if (sp) url += `?${sp}`;
      track("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams]);

  return null;
}

// Tracks pageviews across client-side route changes, and initialises PostHog.
export function Analytics() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTracker />
    </Suspense>
  );
}
