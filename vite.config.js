import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import prerender from "@prerenderer/rollup-plugin";
import path from "path";
import { fileURLToPath } from "url";
import { getRoutesToPrerender } from "./scripts/generate-routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    prerender({
      routes: await getRoutesToPrerender(),
      renderer: "@prerenderer/renderer-puppeteer",
      postProcess(renderedRoute) {
        // Clean up formatting or meta tags if needed
        renderedRoute.html = renderedRoute.html.replace(
          /<script type="module" crossorigin src="\/assets\/index-.*\.js"><\/script>/,
          (match) => match,
        );
      },
      rendererOptions: {
        maxConcurrentRoutes: 4,
        renderAfterDocumentEvent: "custom-post-render", // or simple timeout
        renderAfterTime: 500, // Waits half a second for API calls to settle
      },
    }),
  ],
});
