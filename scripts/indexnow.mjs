// Tells Bing, Yandex and other IndexNow search engines (Bing also feeds ChatGPT search and Copilot)
// that pages are new or changed, so they crawl them within hours instead of weeks.
// Run after a deploy that adds or changes pages:  npm run indexnow
// The key file public/8c8b970e5032c0d23a6a37fa35d9d90b.txt proves the site is ours; don't delete it.

const KEY = "8c8b970e5032c0d23a6a37fa35d9d90b";
const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
if (!site) {
  console.error("Set NEXT_PUBLIC_SITE_URL first, e.g. NEXT_PUBLIC_SITE_URL=https://yourdomain.com npm run indexnow");
  process.exit(1);
}
const xml = await (await fetch(site + "/sitemap.xml")).text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(site).host, key: KEY, keyLocation: site + "/" + KEY + ".txt", urlList: urls }),
});
console.log(res.status, res.status < 300 ? `sent ${urls.length} pages` : await res.text());
