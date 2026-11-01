"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motionLink, type MotionPreview } from "@/lib/content/motions";

// Looping, silent previews of the animations. A clip only downloads and plays while it's on screen.
export function MotionReel({ items, describe = false }: { items: MotionPreview[]; describe?: boolean }) {
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const videos = Array.from(list.current?.querySelectorAll("video") ?? []);
    const seen = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.35 },
    );
    videos.forEach((v) => seen.observe(v));
    return () => seen.disconnect();
  }, []);
  return (
    <ul ref={list} className={"s-reel" + (describe ? " s-reel-wide" : "")}>
      {items.map((m) => (
        <li key={m.id}>
          <Link href={motionLink(m)} aria-label={`Use the ${m.name} animation`}>
            <video src={m.video} poster={m.poster} muted loop playsInline preload="none" width={432} height={768} aria-label={m.description} />
          </Link>
          {describe ? (
            <>
              <h3>{m.name}</h3>
              <p>{m.description}</p>
              <Link href={motionLink(m)}>Use this animation</Link>
            </>
          ) : (
            <span>{m.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
