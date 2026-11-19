/**
 * Envoie les photos d'illustration (research/photos/final) dans Sanity.
 *  - réalisations : remplace le champ `photos` des documents ciblés (alt suffixé « (photo d'illustration) ») ;
 *  - services et atelier : upload seul, l'_id de l'asset est réécrit dans research/photos/manifest.json (`assetId`).
 * Idempotent : un fichier dont l'entrée du manifeste a déjà un assetId n'est pas ré-uploadé.
 *
 * Usage (depuis site/) :  npx tsx scripts/upload-photos.ts
 * Prérequis dans .env.local : NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN
 */
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@sanity/client";

type Entry = {
  file: string;
  usage: "realisation" | "service" | "atelier";
  target: string | null;
  alt: string;
  source: string;
  photographer: string;
  license: string;
  assetId?: string;
};

const PHOTOS_DIR = path.resolve(__dirname, "../../research/photos");
const MANIFEST = path.join(PHOTOS_DIR, "manifest.json");
const FINAL = path.join(PHOTOS_DIR, "final");

async function main() {
  process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID / SANITY_API_WRITE_TOKEN manquants dans .env.local");

  const client = createClient({ projectId, dataset, token, apiVersion: "2026-11-01", useCdn: false });
  const manifest: Entry[] = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
  const save = () => fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  // 1. Upload (ou réutilisation) de chaque image
  for (const entry of manifest) {
    if (entry.assetId) {
      console.log(`= ${entry.file} (déjà envoyé)`);
      continue;
    }
    const file = path.join(FINAL, entry.file);
    const asset = await client.assets.upload("image", fs.createReadStream(file), {
      filename: entry.file,
      title: entry.alt,
      description: `${entry.photographer} — ${entry.license}`,
      source: { name: entry.license.startsWith("Unsplash") ? "unsplash" : "pexels", id: entry.source, url: entry.source },
    });
    entry.assetId = asset._id;
    save(); // écrit au fil de l'eau pour rester idempotent en cas d'interruption
    console.log(`+ ${entry.file} → ${asset._id}`);
  }

  // 2. Rattachement aux réalisations
  const byRealisation = new Map<string, Entry[]>();
  for (const e of manifest) {
    if (e.usage !== "realisation" || !e.target) continue;
    byRealisation.set(e.target, [...(byRealisation.get(e.target) ?? []), e]);
  }
  for (const [id, entries] of byRealisation) {
    const photos = entries.map((e) => ({
      _type: "image",
      _key: randomUUID().replace(/-/g, "").slice(0, 12),
      asset: { _type: "reference", _ref: e.assetId! },
      alt: `${e.alt} (photo d'illustration)`,
    }));
    await client.patch(id).set({ photos }).commit();
    console.log(`✓ ${id} : ${photos.length} photo(s)`);
  }

  // 3. Vérification
  const ids = [...byRealisation.keys()];
  const check = await client.fetch<{ _id: string; n: number }[]>(`*[_id in $ids]{_id, "n": count(photos)}`, { ids });
  console.table(check);
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
