// Loads background images and fonts so render() can draw them instantly.

const images = new Map<string, HTMLImageElement>();

export function getImage(src: string): HTMLImageElement | undefined {
  return images.get(src);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = images.get(src);
  if (cached && cached.complete) return Promise.resolve(cached);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      images.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error("Could not load image " + src));
    img.src = encodeURI(src); // file names contain spaces
  });
}

const loadedFonts = new Set<string>();

export async function loadFont(family: string, url: string, boldUrl?: string): Promise<void> {
  if (loadedFonts.has(family)) return;
  const faces = [new FontFace(family, `url("${encodeURI(url)}")`)];
  if (boldUrl) faces.push(new FontFace(family, `url("${encodeURI(boldUrl)}")`, { weight: "700" }));
  await Promise.all(faces.map((f) => f.load()));
  faces.forEach((f) => document.fonts.add(f));
  loadedFonts.add(family);
}

export function fontReady(family: string): boolean {
  return loadedFonts.has(family);
}

// Loads the given fonts from the catalogue (skipping ones already loaded or unknown).
// Resolves true if anything new arrived, so the caller can redraw.
export async function ensureFonts(families: Iterable<string>, catalogue: { family: string; regular: string; bold?: string }[]): Promise<boolean> {
  const todo = [...new Set(families)].filter((f) => !loadedFonts.has(f));
  if (!todo.length) return false;
  await Promise.all(
    todo.map((family) => {
      const info = catalogue.find((f) => f.family === family);
      return info ? loadFont(info.family, info.regular, info.bold).catch(() => undefined) : undefined;
    }),
  );
  return true;
}
