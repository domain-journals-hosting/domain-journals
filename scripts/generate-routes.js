import fs from "fs";
import path from "path";

// 1. Load local journals data directly
const journalsPath = path.resolve(process.cwd(), "src/data/journals.json");
const journals = JSON.parse(fs.readFileSync(journalsPath, "utf8"));

// 2. Ensure API URL is explicitly resolved
const API_BASE_URL =
  process.env.VITE_API_BASE_URL || "https://api.domainjournals.com";

export async function getRoutesToPrerender() {
  const staticRoutes = [
    "/",
    "/journals",
    "/articles",
    "/contact",
    "/publication-ethics",
    "/review-process",
    "/support",
    "/submit",
    "/signup",
    "/login",
  ];

  const journalRoutes = journals.flatMap((j) => [
    `/journals/${j.slug}`,
    `/journals/${j.slug}/current-issue`,
    `/journals/${j.slug}/editorial-board`,
    `/journals/${j.slug}/guidelines`,
    `/journals/${j.slug}/archive`,
  ]);

  let articleRoutes = [];
  try {
    const ARTICLES_URL = `${API_BASE_URL}/accepted/all`;
    console.log(`📡 Fetching published articles from: ${ARTICLES_URL}`);
    const res = await fetch(ARTICLES_URL);

    if (!res.ok) {
      console.error(`❌ API returned status: ${res.status} ${res.statusText}`);
    } else {
      const articles = await res.json();
      console.log(`✅ Articles fetched count: ${articles.length}`);

      // Map over the articles to build the URLs
      articleRoutes = articles
        .filter((article) => article.slug)
        .map((article) => `/articles/${article.slug}`);
    }
  } catch (err) {
    console.error("❌ Failed to fetch articles for prerendering:", err.message);
  }

  return [...staticRoutes, ...journalRoutes, ...articleRoutes];
}
