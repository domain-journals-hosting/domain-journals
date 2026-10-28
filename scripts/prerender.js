import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import puppeteer from "puppeteer";
import { getRoutesToPrerender } from "./generate-routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_PATH = path.resolve(__dirname, "../dist");
const PORT = 4567;

async function prerender() {
  const app = express();
  app.use(express.static(DIST_PATH));
  app.get("*", (req, res) => res.sendFile(path.join(DIST_PATH, "index.html")));
  const server = app.listen(PORT);

  const routes = await getRoutesToPrerender();
  console.log(`🚀 Prerendering ${routes.length} static HTML pages...`);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const route of routes) {
    if (route === "/") continue;

    const page = await browser.newPage();

    page.on("response", (response) => {
      if (response.status() === 401) {
        // Quietly ignore expected auth check 401s during SSR
      }
    });

    try {
      // Navigate using domcontentloaded instead of networkidle0 (which gets delayed by background auth checks)
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // If it's an article page, wait for the actual article content container to render in React
      if (route.startsWith("/articles/")) {
        await page
          .waitForSelector("h1, .article-container, .article-details", {
            timeout: 10000,
          })
          .catch(() =>
            console.warn(`⚠️ Timeout waiting for DOM content on ${route}`),
          );
      }

      // Give @unhead/react 500ms to insert the <meta name="citation_*"> tags into <head>
      await new Promise((r) => setTimeout(r, 500));

      const html = await page.content();

      // Clean destination directory creation
      const targetDir = path.join(DIST_PATH, route);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(path.join(targetDir, "index.html"), html, "utf8");
      console.log(`  └─ Built: ${route}/index.html`);
    } catch (err) {
      console.error(`❌ Failed prerendering ${route}: ${err.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  server.close();
  console.log("✅ All static HTML pages pre-rendered successfully!");
}

prerender();
