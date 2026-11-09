// Downloads open-licence (OFL) fonts from Google Fonts into public/fonts as .woff2, with their
// licences, and writes data/font-meta.json (each font's look and whether it has Hindi letters).
// Then run `npm run assets` to rebuild data/fonts.json.
//
//   node scripts/fetch-fonts.mjs          fetch any that are missing
//
// Google serves the whole font (every letter, not a subset) as .ttf to unknown browsers,
// which is what the editor needs: it draws on a canvas, so the font must have every letter.

import fs from "node:fs";
import path from "node:path";
import wawoff2 from "wawoff2";

import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONTS_DIR = path.join(ROOT, "public/fonts");
const LICENSES_DIR = path.join(FONTS_DIR, "licenses");
const META = path.join(ROOT, "data/font-meta.json");

// [Google family name, look, has bold, has Hindi letters]
// look: traditional (classic serif), script (handwriting), display (decorative), modern (clean sans)
const LIST = [
  // script
  ["Great Vibes", "script"],
  ["Tangerine", "script", true],
  ["Dancing Script", "script", true],
  ["Sacramento", "script"],
  ["Satisfy", "script"],
  ["Italianno", "script"],
  ["Monsieur La Doulaise", "script"],
  ["Rouge Script", "script"],
  ["Mrs Saint Delafield", "script"],
  ["Herr Von Muellerhoff", "script"],
  ["Corinthia", "script", true],
  ["Ephesis", "script"],
  ["Imperial Script", "script"],
  ["Lovers Quarrel", "script"],
  ["Ms Madi", "script"],
  ["Birthstone", "script"],
  ["Kaushan Script", "script"],
  ["Cookie", "script"],
  ["Allison", "script"],
  ["Luxurious Script", "script"],
  ["WindSong", "script"],
  ["Arizonia", "script"],
  ["Clicker Script", "script"],
  ["The Nautigal", "script", true],
  ["Meddon", "script"],
  ["Qwigley", "script"],
  ["Mea Culpa", "script"],
  ["Fleur De Leah", "script"],
  ["Lavishly Yours", "script"],
  ["Style Script", "script"],
  ["Charm", "script", true],
  ["Niconne", "script"],
  ["Playball", "script"],
  ["Rochester", "script"],
  ["Yellowtail", "script"],
  ["Marck Script", "script"],
  ["Kalam", "script", true, true],
  // traditional (classic serif)
  ["EB Garamond", "traditional", true],
  ["Libre Baskerville", "traditional", true],
  ["Lora", "traditional", true],
  ["Cardo", "traditional", true],
  ["Crimson Pro", "traditional", true],
  ["Prata", "traditional"],
  ["Abhaya Libre", "traditional", true],
  ["DM Serif Display", "traditional"],
  ["Cormorant", "traditional", true],
  ["Cormorant SC", "traditional", true],
  ["Cormorant Upright", "traditional", true],
  ["Forum", "traditional"],
  ["Bellefair", "traditional"],
  ["Old Standard TT", "traditional", true],
  ["Spectral", "traditional", true],
  ["Rufina", "traditional", true],
  ["Playfair Display SC", "traditional", true],
  ["Marcellus SC", "traditional"],
  ["Philosopher", "traditional", true],
  ["Castoro", "traditional"],
  ["Lustria", "traditional"],
  ["Alice", "traditional"],
  ["Unna", "traditional", true],
  ["Gloock", "traditional"],
  ["Fraunces", "traditional", true],
  ["Della Respira", "traditional"],
  ["Martel", "traditional", true, true],
  ["Eczar", "traditional", true, true],
  ["Tiro Devanagari Hindi", "traditional", false, true],
  ["Noto Serif Devanagari", "traditional", true, true],
  ["Vesper Libre", "traditional", true, true],
  ["Kadwa", "traditional", true, true],
  ["Sura", "traditional", true, true],
  ["Sumana", "traditional", true, true],
  ["Halant", "traditional", true, true],
  ["Gotu", "traditional", false, true],
  ["Kurale", "traditional", false, true],
  // display (decorative)
  ["Abril Fatface", "display"],
  ["Poiret One", "display"],
  ["Federo", "display"],
  ["Limelight", "display"],
  ["Aboreto", "display"],
  ["Berkshire Swash", "display"],
  ["Lobster", "display"],
  ["Lobster Two", "display", true],
  ["Kalnia", "display", true],
  ["Elsie", "display", true],
  ["Elsie Swash Caps", "display", true],
  ["Almendra Display", "display"],
  ["Eagle Lake", "display"],
  ["Laila", "display", true, true],
  ["Baloo 2", "display", true, true],
  ["Khand", "display", true, true],
  ["Modak", "display", false, true],
  ["Arya", "display", true, true],
  // modern (clean sans)
  ["Montserrat", "modern", true],
  ["Raleway", "modern", true],
  ["Josefin Sans", "modern", true],
  ["Quicksand", "modern", true],
  ["Poppins", "modern", true, true],
  ["Lato", "modern", true],
  ["Nunito", "modern", true],
  ["Jost", "modern", true],
  ["Tenor Sans", "modern"],
  ["Didact Gothic", "modern"],
  ["Questrial", "modern"],
  ["Comfortaa", "modern", true],
  ["Urbanist", "modern", true],
  ["Outfit", "modern", true],
  ["DM Sans", "modern", true],
  ["Work Sans", "modern", true],
  ["Manrope", "modern", true],
  ["Mukta", "modern", true, true],
  ["Hind", "modern", true, true],
  ["Rajdhani", "modern", true, true],
  ["Teko", "modern", true, true],
];

// The fonts that were already here, so the picker knows which have Hindi letters.
const EXISTING_HINDI = ["Rozha One", "Yatra One", "Amita"];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function get(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r;
}

async function ttfUrls(family, bold) {
  const q = encodeURIComponent(family).replace(/%20/g, "+");
  const css = await (await get(`https://fonts.googleapis.com/css2?family=${q}${bold ? ":wght@400;700" : ""}`)).text();
  const faces = [...css.matchAll(/font-weight:\s*(\d+);[\s\S]*?url\((https:[^)]+\.ttf)\)/g)].map((m) => ({ weight: m[1], url: m[2] }));
  return { regular: faces.find((f) => f.weight === "400")?.url, bold: faces.find((f) => f.weight === "700")?.url };
}

async function save(url, file) {
  const buf = Buffer.from(await (await get(url)).arrayBuffer());
  fs.writeFileSync(file, Buffer.from(await wawoff2.compress(buf)));
}

async function licence(family) {
  const out = path.join(LICENSES_DIR, `${slug(family)}-OFL.txt`);
  if (fs.existsSync(out)) return;
  const dir = family.toLowerCase().replace(/[^a-z0-9]/g, "");
  try {
    const text = await (await get(`https://raw.githubusercontent.com/google/fonts/main/ofl/${dir}/OFL.txt`)).text();
    fs.writeFileSync(out, text);
  } catch {
    fs.writeFileSync(out, `${family}: SIL Open Font License 1.1, from Google Fonts (https://fonts.google.com/specimen/${family.replace(/ /g, "+")}).\n`);
  }
}

const meta = {};
for (const f of EXISTING_HINDI) meta[slug(f)] = { family: f, hindi: true };
let fetched = 0;
for (const [family, style, bold = false, hindi = false] of LIST) {
  const id = slug(family);
  meta[id] = { family, style, hindi };
  const reg = path.join(FONTS_DIR, `${id}-regular.woff2`);
  const bld = path.join(FONTS_DIR, `${id}-bold.woff2`);
  if (fs.existsSync(reg) && (!bold || fs.existsSync(bld))) continue;
  try {
    const urls = await ttfUrls(family, bold);
    if (!urls.regular) throw new Error("no regular weight");
    await save(urls.regular, reg);
    if (bold && urls.bold) await save(urls.bold, bld);
    await licence(family);
    fetched++;
    console.log(`  font  ${family}${bold && urls.bold ? " (+bold)" : ""}`);
  } catch (e) {
    delete meta[id];
    console.warn(`  ! ${family}: ${e.message}`);
  }
}
fs.writeFileSync(META, JSON.stringify(meta, null, 2) + "\n");
console.log(`Fetched ${fetched} fonts. Wrote data/font-meta.json. Now run: npm run assets`);
