// Copie le worker MapLibre dans public/ (le bundler ne le résout pas seul). Lancé après chaque npm install.
import { copyFileSync, mkdirSync } from "node:fs";
mkdirSync("public/maplibre", { recursive: true });
copyFileSync("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", "public/maplibre/maplibre-gl-worker.mjs");
console.log("✓ worker MapLibre copié dans public/maplibre/");
