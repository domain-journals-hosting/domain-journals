import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getRoutesToPrerender } from "./generate-routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = "https://domainjournals.com";

async function buildSitemap() {
  const routes = await getRoutesToPrerender();

  const xmlUrls = routes
    .map((route) => {
      let priority = "0.7";
      let changefreq = "weekly";

      if (route === "/") {
        priority = "1.0";
        changefreq = "daily";
      } else if (route.startsWith("/articles/")) {
        priority = "0.9";
        changefreq = "monthly";
      } else if (route.startsWith("/journals/")) {
        priority = "0.8";
      }

      return `  <url>
    <loc>${DOMAIN}${route}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

  const publicDir = path.resolve(__dirname, "../public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf8");
  console.log(`✅ sitemap.xml generated with ${routes.length} routes.`);
}

buildSitemap();
