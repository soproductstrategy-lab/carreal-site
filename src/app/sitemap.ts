import type { MetadataRoute } from "next";
import { getGuides, getRealisations, getServices, getZones } from "@/lib/content";
import { abs } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, zones, guides, realisations] = await Promise.all([getServices(), getZones(), getGuides(), getRealisations()]);
  const staticPages = ["/", "/prestations/", "/realisations/", "/zones-intervention/", "/conseils/", "/entreprise/", "/avis/", "/faq/", "/devis/"];
  return [
    ...staticPages.map((p) => ({ url: abs(p), changeFrequency: "monthly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...services.map((s) => ({ url: abs(`/prestations/${s.slug}/`), changeFrequency: "monthly" as const, priority: 0.9 })),
    ...zones.map((z) => ({ url: abs(`/zones-intervention/${z.slug}/`), changeFrequency: "monthly" as const, priority: 0.8 })),
    ...guides.map((g) => ({ url: abs(`/conseils/${g.slug}/`), lastModified: g.updated, changeFrequency: "yearly" as const, priority: 0.6 })),
    // Les exemples de démonstration ne sont pas indexés.
    ...realisations.filter((r) => !r.demo).map((r) => ({ url: abs(`/realisations/${r.slug}/`), changeFrequency: "yearly" as const, priority: 0.7 })),
    { url: abs("/mentions-legales/"), priority: 0.1 },
    { url: abs("/confidentialite/"), priority: 0.1 },
  ];
}
