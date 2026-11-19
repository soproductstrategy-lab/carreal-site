export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion = "2026-11-01";

/** Tant qu'aucun projet Sanity n'est configuré, le site lit le contenu local de src/content/. */
export const isSanityConfigured = projectId.length > 0;
