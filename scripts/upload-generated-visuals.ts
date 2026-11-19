/**
 * Envoie les visuels générés (illustration BD du dépôt + photos réalistes des 4 chantiers) dans Sanity.
 * Usage (depuis site/) : npx tsx scripts/upload-generated-visuals.ts
 */
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createClient } from "@sanity/client";

type PhotoSpec = { file: string; alt: string };

const HERO_BD: PhotoSpec = {
  file: "carreal-depot-pringy-bd.jpg",
  alt: "Illustration ligne claire du dépôt Carreal à Pringy, route des Rutys : les utilitaires floqués Carreal partent vers Annecy à 7 h du matin face aux montagnes",
};

const REALISATIONS: Record<string, PhotoSpec[]> = {
  "realisation-demo-seynod-douche-italienne-remplacement-baignoire": [
    {
      file: "realisations/seynod-douche-italienne-vue-ensemble.jpg",
      alt: "Salle de bain rénovée à Seynod : douche à l'italienne de plain-pied, grès cérame effet pierre 60×120 en pavé décalé 1/3 aux murs, sol 30×60 mat et niche encastrée (illustration)",
    },
    {
      file: "realisations/seynod-douche-italienne-detail-caniveau.jpg",
      alt: "Détail de la douche à l'italienne : caniveau linéaire affleurant, joints époxy 2 mm gris clair et coupes en onglet de la niche (illustration)",
    },
  ],
  "realisation-demo-annecy-le-vieux-sol-grand-format-120x120": [
    {
      file: "realisations/annecy-le-vieux-sejour-120x120.jpg",
      alt: "Séjour et cuisine ouverte à Annecy-le-Vieux avec sol continu en grès cérame rectifié 120×120 effet béton, pose droite joints 2 mm sous lumière rasante (illustration)",
    },
  ],
  "realisation-demo-la-clusaz-chalet-salle-de-bain-pierre": [
    {
      file: "realisations/la-clusaz-chalet-ardoise-zellige.jpg",
      alt: "Salle de bain de chalet à La Clusaz : sol en ardoise naturelle posée en opus romain, murs en zellige vert 10×10 à joints serrés et charpente bois brossé (illustration)",
    },
    {
      file: "realisations/la-clusaz-chalet-detail-zellige-ardoise.jpg",
      alt: "Détail de la jonction entre les murs en zellige vert artisanal 10×10 (joints 1 mm), le caniveau linéaire et le dallage ardoise en opus romain (illustration)",
    },
  ],
  "realisation-demo-sevrier-terrasse-plots-gres-ingelif": [
    {
      file: "realisations/sevrier-terrasse-plots-lac-annecy.jpg",
      alt: "Terrasse sur plots en dalles grès cérame 60×120 épaisseur 20 mm, joints ouverts de 3 mm alignés sur la baie vitrée, vue sur le lac d'Annecy (illustration)",
    },
  ],
};

async function main() {
  process.loadEnvFile(".env.local");
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!projectId || !token) throw new Error("Variables Sanity manquantes dans .env.local");

  const client = createClient({ projectId, dataset, token, apiVersion: "2026-11-01", useCdn: false });
  const publicImages = path.resolve(__dirname, "../public/images");

  const upload = async (spec: PhotoSpec) => {
    const abs = path.join(publicImages, spec.file);
    const asset = await client.assets.upload("image", fs.createReadStream(abs), {
      filename: path.basename(spec.file),
      title: spec.alt,
      description: "Visuel d'illustration Carreal",
    });
    console.log(`+ ${spec.file} → ${asset._id}`);
    return asset._id;
  };

  // 1. Hero BD sur homePage
  const heroId = await upload(HERO_BD);
  await client
    .patch("homePage")
    .set({
      "hero.photo": {
        _type: "image",
        asset: { _type: "reference", _ref: heroId },
        alt: HERO_BD.alt,
      },
    })
    .commit();
  console.log("✓ homePage.hero.photo mis à jour");

  // 2. Photos des 4 réalisations de démonstration
  for (const [docId, specs] of Object.entries(REALISATIONS)) {
    const photos = [];
    for (const s of specs) {
      const refId = await upload(s);
      photos.push({
        _type: "image",
        _key: randomUUID().replace(/-/g, "").slice(0, 12),
        asset: { _type: "reference", _ref: refId },
        alt: s.alt,
      });
    }
    await client.patch(docId).set({ photos }).commit();
    console.log(`✓ ${docId} : ${photos.length} photo(s)`);
  }
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
