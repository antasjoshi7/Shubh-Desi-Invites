// A tiny PDF writer: one JPEG picture per page, nothing else. Enough for print-ready invite cards
// without pulling in a PDF library. Pages are 5 × 8.9 inches (the invite's 9:16 shape).

const PAGE_W = 360; // points (1/72 inch): 5 inches wide
const PAGE_H = 640;

export async function makePdf(jpegs: { bytes: Uint8Array; width: number; height: number }[], title: string): Promise<Blob> {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let size = 0;
  const push = (p: Uint8Array | string) => {
    const b = typeof p === "string" ? enc.encode(p) : p;
    parts.push(b);
    size += b.length;
  };
  const obj = (n: number, body: () => void) => {
    offsets[n] = size;
    push(`${n} 0 obj\n`);
    body();
    push("\nendobj\n");
  };

  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  // objects: 1 catalog, 2 pages, 3 info, then three per page (page, contents, image)
  const pageNo = (i: number) => 4 + i * 3;
  obj(1, () => push("<< /Type /Catalog /Pages 2 0 R >>"));
  obj(2, () => push(`<< /Type /Pages /Count ${jpegs.length} /Kids [${jpegs.map((_, i) => `${pageNo(i)} 0 R`).join(" ")}] >>`));
  obj(3, () => push(`<< /Title (${title.replace(/[()\\]/g, "")}) /Producer (Shubh Desi Invites) >>`));
  jpegs.forEach((img, i) => {
    const n = pageNo(i);
    obj(n, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /XObject << /Im0 ${n + 2} 0 R >> >> /Contents ${n + 1} 0 R >>`));
    const draw = `q ${PAGE_W} 0 0 ${PAGE_H} 0 0 cm /Im0 Do Q`;
    obj(n + 1, () => push(`<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`));
    obj(n + 2, () => {
      push(`<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.bytes.length} >>\nstream\n`);
      push(img.bytes);
      push("\nendstream");
    });
  });
  const count = 4 + jpegs.length * 3;
  const xref = size;
  push(`xref\n0 ${count}\n0000000000 65535 f \n`);
  for (let n = 1; n < count; n++) push(`${String(offsets[n]).padStart(10, "0")} 00000 n \n`);
  push(`trailer\n<< /Size ${count} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts as BlobPart[], { type: "application/pdf" });
}
