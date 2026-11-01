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
