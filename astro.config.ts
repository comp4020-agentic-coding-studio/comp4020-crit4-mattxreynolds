import { defineConfig } from "astro/config";

// Written by the course stack skill; values derived from this repo's origin
// remote. The dev server serves under the base too, so a path bug reproduces
// locally instead of only on the live URL. build.format "file" keeps
// page.astro building to dist/page.html, so hand-written relative links and
// asset paths keep working; compressHTML true because the default ("jsx")
// strips the space before line-broken inline elements in hand-written prose.
export default defineConfig({
  site: "https://comp4020-agentic-coding-studio.github.io",
  base: "/comp4020-crit4-mattxreynolds",
  build: { format: "file" },
  compressHTML: true,
  // Vite inlines built scripts under 4kb straight into the HTML instead of
  // emitting a `.js` file (it reuses assetsInlineLimit, meant for images).
  // Our own spec tests scan shipped `.js` files for `AudioContext`, so a
  // small bundle would silently pass that scan by disappearing into the
  // HTML rather than by containing the thing being checked for. Force every
  // script to its own file so "shipped JS" always means a real .js asset.
  vite: { build: { assetsInlineLimit: 0 } },
});
