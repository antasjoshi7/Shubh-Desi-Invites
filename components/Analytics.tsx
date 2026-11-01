"use client";

import { useEffect } from "react";
import { startAnalytics } from "@/lib/track";

// Starts analytics after the page has loaded, so it never slows the first paint.
export function Analytics() {
  useEffect(() => {
    const id = window.setTimeout(startAnalytics, 1500);
    return () => window.clearTimeout(id);
  }, []);
  return null;
}
