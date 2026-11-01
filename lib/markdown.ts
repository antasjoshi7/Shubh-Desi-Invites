// A small Markdown reader for the pages and guides in content/ (so they can be written like a doc).
// Supports: front matter, # headings, paragraphs, - and 1. lists, **bold**, *italic*, [links](/x),
// ![images](/x.jpg), > quotes, and <!-- notes --> (writing notes that never appear on the page).

export type Doc = { meta: Record<string, string>; html: string; text: string; headings: { id: string; text: string }[] };

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function inline(s: string): string {
  return escape(s)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) => `<a href="${href}"${/^https?:/.test(href) ? ' rel="noopener"' : ""}>${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
}

export function parseMarkdown(source: string): Doc {
  const meta: Record<string, string> = {};
  let body = source.replace(/\r\n/g, "\n");
  const fm = body.match(/^---\n([\s\S]*?)\n---\n?/);
  if (fm) {
    for (const line of fm[1].split("\n")) {
      const m = line.match(/^([\w-]+):\s*(.*)$/);
      if (m) meta[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    body = body.slice(fm[0].length);
  }
  body = body.replace(/<!--[\s\S]*?-->/g, ""); // writing notes
  const out: string[] = [];
  const headings: Doc["headings"] = [];
  const blocks = body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  for (const b of blocks) {
    const lines = b.split("\n");
    const h = b.match(/^(#{1,4})\s+(.+)$/);
    if (h && lines.length === 1) {
      const level = Math.max(2, h[1].length); // the page title is the only h1
      const id = slugify(h[2]);
      if (level === 2) headings.push({ id, text: h[2] });
      out.push(`<h${level} id="${id}">${inline(h[2])}</h${level}>`);
    } else if (lines.every((l) => /^[-*]\s+/.test(l))) {
      out.push(`<ul>${lines.map((l) => `<li>${inline(l.replace(/^[-*]\s+/, ""))}</li>`).join("")}</ul>`);
    } else if (lines.every((l) => /^\d+\.\s+/.test(l))) {
      out.push(`<ol>${lines.map((l) => `<li>${inline(l.replace(/^\d+\.\s+/, ""))}</li>`).join("")}</ol>`);
    } else if (lines.every((l) => l.startsWith(">"))) {
      out.push(`<blockquote>${lines.map((l) => inline(l.replace(/^>\s?/, ""))).join("<br />")}</blockquote>`);
    } else {
      out.push(`<p>${lines.map(inline).join("<br />")}</p>`);
    }
  }
  const text = body.replace(/[#>*_`\[\]()!-]/g, " ").replace(/\s+/g, " ").trim();
  return { meta, html: out.join("\n"), text, headings };
}
