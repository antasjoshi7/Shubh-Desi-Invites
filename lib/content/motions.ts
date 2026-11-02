// Preview clips of the painted motions (rendered by the tool itself into public/motions,
// listed in data/motions.json). Shown on the landing pages: the animations are what general
// design apps don't have.

import motionsJson from "@/data/motions.json";
import { absolute } from "../site";

export type MotionPreview = {
  id: string;
  name: string;
  description: string;
  event: string | null; // the event page the clip was made on (null = the main invitation page)
  design: string;
  video: string;
  poster: string;
  seconds: number;
  scene?: boolean; // a full scene (several painted elements together) rather than a single animation
};

export const MOTION_PREVIEWS = motionsJson as MotionPreview[];
export const SCENE_PREVIEWS = MOTION_PREVIEWS.filter((m) => m.scene);
export const SINGLE_PREVIEWS = MOTION_PREVIEWS.filter((m) => !m.scene);

export const motionsNamed = (names: string[]) =>
  names.map((n) => MOTION_PREVIEWS.find((m) => m.name === n)).filter((m): m is MotionPreview => !!m);

export const motionsById = (ids: string[]) =>
  ids.map((id) => MOTION_PREVIEWS.find((m) => m.id === id)).filter((m): m is MotionPreview => !!m);

// Opens the editor with this animation on the same design and page as the preview.
export function motionLink(m: MotionPreview) {
  const q = new URLSearchParams();
  if (m.event) q.set("event", m.event);
  q.set("design", m.design);
  q.set("motion", m.id);
  return `/create?${q}`;
}

// Video structured data, so the clips can show in Google's video results.
export const videoSchema = (m: MotionPreview) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  name: `${m.name}: animated Indian wedding invitation`,
  description: m.description,
  thumbnailUrl: absolute(m.poster),
  contentUrl: absolute(m.video),
  uploadDate: "2026-11-01",
  duration: `PT${Math.ceil(m.seconds)}S`,
});
