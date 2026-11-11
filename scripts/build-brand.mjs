// Makes the site icon (favicon, home-screen icons) and the share images (the picture shown when a
// link is posted on WhatsApp, Twitter or Pinterest). Run with `npm run brand` after changing designs.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const backgrounds = JSON.parse(fs.readFileSync(path.join(root, "data/backgrounds.json"), "utf8"));
const samples = JSON.parse(fs.readFileSync(path.join(root, "data/samples.json"), "utf8"));

// ----- icon: the marigold mark made in Recraft (assets/brand-icon-recraft.png), corners rounded off -----
const SOURCE_ICON = path.join(root, "assets/brand-icon-recraft.png");
const mask = Buffer.from(`<svg width="1024" height="1024"><rect width="1024" height="1024" rx="256" fill="#fff"/></svg>`);
const rounded = await sharp(SOURCE_ICON).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
const onPlum = await sharp({ create: { width: 1024, height: 1024, channels: 4, background: "#5a1a2e" } }).composite([{ input: rounded }]).png().toBuffer();
fs.rmSync(path.join(root, "app/icon.svg"), { force: true });
await sharp(rounded).resize(512, 512).png().toFile(path.join(root, "app/icon.png")); // favicon (browsers and Google results)
await sharp(onPlum).resize(180, 180).png().toFile(path.join(root, "app/apple-icon.png")); // iPhone home screen rounds its own corners
for (const s of [192, 512]) await sharp(onPlum).resize(s, s).png().toFile(path.join(root, `public/icon-${s}.png`));
fs.mkdirSync(path.join(root, "public/brand"), { recursive: true });
await sharp(rounded).resize(96, 96).png().toFile(path.join(root, "public/brand/mark.png")); // the logo in the site header

// ----- share images (1200 x 630): three invites side by side and a title -----
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const pick = (event, categories) => {
  const own = samples.filter((s) => (event ? s.event === event : true)).map((s) => path.join(root, "public", s.src));
  const plain = backgrounds.filter((b) => categories.includes(b.category)).map((b) => path.join(root, "public", b.src));
  return [...own, ...plain].slice(0, 2);
};

async function shareImage(file, title, subtitle, images) {
  const W = 1200, H = 630, cardW = 215, cardH = Math.round((cardW * 16) / 9);
  const cards = await Promise.all(
    images.map(async (img) => sharp(img).resize(cardW, cardH, { fit: "cover" }).composite([{ input: Buffer.from(`<svg width="${cardW}" height="${cardH}"><rect width="100%" height="100%" rx="14" fill="#fff"/></svg>`), blend: "dest-in" }]).png().toBuffer()),
  );
  const text = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><radialGradient id="g" cx="0.3" cy="0" r="1"><stop offset="0" stop-color="#4a0f3d"/><stop offset="1" stop-color="#1a0620"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <text x="64" y="120" font-family="Georgia, serif" font-style="italic" font-size="30" fill="#ff88b8">Free, with no watermark</text>
    ${title.map((l, i) => `<text x="64" y="${205 + i * 70}" font-family="Georgia, serif" font-size="62" fill="#f5e6c8">${esc(l)}</text>`).join("")}
    <text x="64" y="${230 + title.length * 70}" font-family="Helvetica, Arial, sans-serif" font-size="28" fill="#f5e6c8" opacity="0.8">${esc(subtitle)}</text>
    <rect x="64" y="${270 + title.length * 70}" width="270" height="62" rx="31" fill="#ff2e7e"/>
    <text x="199" y="${310 + title.length * 70}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="bold" font-size="26" fill="#fff">Make your invite</text>
  </svg>`;
  const x0 = W - 64 - cards.length * cardW - (cards.length - 1) * 16;
  await sharp(Buffer.from(text))
    .composite(cards.map((c, i) => ({ input: c, left: x0 + i * (cardW + 16), top: Math.round((H - cardH) / 2) + (i === 1 ? -14 : 14) })))
    .jpeg({ quality: 86 })
    .toFile(path.join(root, "public/og", file));
}

fs.mkdirSync(path.join(root, "public/og"), { recursive: true });
await shareImage("home.jpg", ["Indian wedding", "invitation video"], "Made on your phone in 5 minutes", pick("shaadi", ["wedding", "peacocks", "elephants"]));
const EVENTS = [
  ["haldi", "Haldi", ["haldi", "marigold"]],
  ["mehendi", "Mehendi", ["mehendi", "paisley"]],
  ["sangeet", "Sangeet", ["sangeet", "lights"]],
  ["reception", "Reception", ["reception", "minimal"]],
];
for (const [id, name, cats] of EVENTS) await shareImage(`${id}.jpg`, [name, "invitation video"], "Designs, wording and music included", pick(id, cats));
console.log("icons and share images written");

// ----- Pinterest pins (1000 x 1500, the 2:3 shape Pinterest prefers), one per sample invite -----
// Written to marketing/pinterest (not part of the site). Upload them with the link to the matching page.
const PIN_TITLE = { haldi: "Haldi invitation video", mehendi: "Mehendi invitation video", sangeet: "Sangeet invitation video", reception: "Reception invitation video", shaadi: "Wedding invitation video" };
const PIN_PAGE = { haldi: "/haldi-invitation-video", mehendi: "/mehendi-invitation-video", sangeet: "/sangeet-invitation-video", reception: "/reception-invitation-video", shaadi: "/" };
const pinDir = path.join(root, "marketing/pinterest");
fs.mkdirSync(pinDir, { recursive: true });
const site = (process.env.NEXT_PUBLIC_SITE_URL || "www.shubhdesi.in").replace(/^https?:\/\//, "").replace(/\/$/, "");
const pinList = [];
for (const s of samples) {
  const title = s.src.includes("hindi") ? "Hindi wedding card" : PIN_TITLE[s.event];
  const card = await sharp(path.join(root, "public", s.src)).resize(640, 1138).composite([{ input: Buffer.from(`<svg width="640" height="1138"><rect width="100%" height="100%" rx="24" fill="#fff"/></svg>`), blend: "dest-in" }]).png().toBuffer();
  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1500">
    <defs><radialGradient id="g" cx="0.5" cy="0" r="1"><stop offset="0" stop-color="#5a1349"/><stop offset="1" stop-color="#1a0620"/></radialGradient></defs>
    <rect width="1000" height="1500" fill="url(#g)"/>
    <text x="500" y="1290" text-anchor="middle" font-family="Georgia, serif" font-size="62" fill="#f5e6c8">${esc(title)}</text>
    <text x="500" y="1360" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="34" fill="#ff88b8">Free and made on your phone</text>
    <text x="500" y="1440" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="#ffb400">${esc(site)}</text>
  </svg>`;
  const name = path.basename(s.src, ".jpg") + "-pin.jpg";
  await sharp(Buffer.from(bg)).composite([{ input: card, left: 180, top: 70 }]).jpeg({ quality: 85 }).toFile(path.join(pinDir, name));
  pinList.push(`${name}\t${title} (free, no watermark)\t${PIN_PAGE[s.event]}\t${s.alt}`);
}
fs.writeFileSync(path.join(pinDir, "pins.tsv"), "file\tpin title\tlink to (add your domain)\talt text / description\n" + pinList.join("\n") + "\n");
console.log(`${pinList.length} Pinterest pins written to marketing/pinterest`);
