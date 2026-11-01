import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Lets people "Add to Home screen" and open the editor like an app.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "Shubh Desi",
    description: SITE.definition,
    start_url: "/create",
    display: "standalone",
    background_color: "#1a0620",
    theme_color: "#1a0620",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
