import Link from "next/link";
import type { Tile } from "@/lib/content/gallery";

// A grid of invite pictures; each opens the editor on that design.
export function Tiles({ tiles }: { tiles: Tile[] }) {
  return (
    <ul className="s-tiles">
      {tiles.map((t) => (
        <li key={t.href}>
          <Link href={t.href} aria-label={`${t.label}: ${t.alt}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.src} alt={t.alt} width={360} height={640} loading="lazy" decoding="async" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
