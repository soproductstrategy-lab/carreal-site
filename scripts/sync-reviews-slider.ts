/**
 * Initialise les champs du slider d'avis dans Sanity (`showInSlider`, `order` sur chaque avis
 * et `autoplay` / `autoplaySeconds` sur `homePage.reviews`) sans écraser les autres champs.
 *
 * Usage (depuis site/) : npx tsx scripts/sync-reviews-slider.ts
 */
import { createClient } from "@sanity/client";

process.loadEnvFile(".env.local");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  token: process.env.SANITY_API_WRITE_TOKEN!,
  apiVersion: "2026-11-01",
  useCdn: false,
});

async function main() {
  const reviews = await client.fetch<{ _id: string; author: string }[]>(
    `*[_type == "review"] | order(featured desc, date desc){ _id, author }`,
  );

  for (let i = 0; i < reviews.length; i++) {
    const r = reviews[i];
    await client
      .patch(r._id)
      .setIfMissing({ showInSlider: true })
      .set({ order: i + 1 })
      .commit();
    console.log(`✓ ${r._id} (${r.author}) → showInSlider: true, order: ${i + 1}`);
  }

  await client
    .patch("homePage")
    .setIfMissing({ reviews: {} })
    .set({
      "reviews.autoplay": true,
      "reviews.autoplaySeconds": 7,
    })
    .commit();
  console.log("✓ homePage.reviews (autoplay: true, autoplaySeconds: 7) mis à jour");
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
