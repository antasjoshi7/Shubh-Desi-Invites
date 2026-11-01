import Link from "next/link";
import { breadcrumbSchema } from "@/lib/schema";
import { JsonLd } from "./JsonLd";

// "Home › Haldi invitation video": shows where the page sits, for people and for Google.
export function Crumbs({ trail }: { trail: { name: string; path: string }[] }) {
  const all = [{ name: "Home", path: "/" }, ...trail];
  return (
    <nav className="s-crumbs" aria-label="Breadcrumb">
      <ol>
        {all.map((t, i) => (
          <li key={t.path}>{i < all.length - 1 ? <Link href={t.path}>{t.name}</Link> : <span aria-current="page">{t.name}</span>}</li>
        ))}
      </ol>
      <JsonLd data={breadcrumbSchema(all)} />
    </nav>
  );
}
