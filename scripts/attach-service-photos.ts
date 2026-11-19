/**
 * Associe les photos (déjà importées dans Sanity) aux prestations, d'après research/photos/manifest.json.
 * N'écrase pas une photo déjà choisie dans le Studio. Usage : npx tsx scripts/attach-service-photos.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@sanity/client";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

type Entry = { usage: string; target: string | null; alt: string; assetId?: string };

async function main() {
  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    token: process.env.SANITY_API_WRITE_TOKEN,
    apiVersion: "2026-11-01",
    useCdn: false,
  });
  const manifest: Entry[] = JSON.parse(readFileSync("../research/photos/manifest.json", "utf8"));
  let n = 0;
  for (const e of manifest.filter((x) => x.usage === "service" && x.target && x.assetId)) {
    await client
      .patch(`service-${e.target}`)
      .setIfMissing({ image: { _type: "image", asset: { _type: "reference", _ref: e.assetId }, alt: `${e.alt} (photo d'illustration)` } })
      .commit();
    n++;
  }
  console.log(`✓ ${n} prestation(s) avec photo`);
}

main().catch((e) => {
  console.error("✗", e.message ?? e);
  process.exit(1);
});
