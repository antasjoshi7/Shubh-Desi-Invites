import Link from "next/link";

// The one action every page leads to: open the editor (optionally on an event or design).
export function Cta({ href = "/create", label = "Make your invite, free", note = "No sign-up · No watermark · Works on your phone" }: { href?: string; label?: string; note?: string }) {
  return (
    <div className="s-cta">
      <Link href={href} className="s-btn">{label}</Link>
      {note && <p>{note}</p>}
    </div>
  );
}
