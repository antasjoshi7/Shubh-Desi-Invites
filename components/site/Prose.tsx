import type { ContentFile } from "@/lib/content/files";
import { Crumbs } from "./Crumbs";
import { Theme } from "./Desi";

// A page written in Markdown (content/pages, content/guides).
export function Prose({ doc, trail, children }: { doc: ContentFile; trail: { name: string; path: string }[]; children?: React.ReactNode }) {
  return (
    <>
      <Crumbs trail={trail} />
      <Theme name="paper" />
      <article className="s-prose">
        <h1 style={{ marginTop: 24 }}>{doc.title}</h1>
        {!doc.published && <p className="s-draft">Draft: hidden from Google and the menus until its front matter says <code>status: published</code>.</p>}
        {doc.updated && doc.published && <p className="s-updated">Updated {new Date(doc.updated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>}
        <div dangerouslySetInnerHTML={{ __html: doc.html }} />
        {children}
      </article>
    </>
  );
}
