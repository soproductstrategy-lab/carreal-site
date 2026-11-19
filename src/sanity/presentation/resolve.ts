import { defineDocuments, defineLocations, type PresentationPluginOptions } from "sanity/presentation";

/**
 * Liaison entre les pages du site Next.js et les documents Sanity dans l'onglet « Visuel » (Presentation Tool).
 * Quand le client navigue sur son site dans l'aperçu, le bon document s'ouvre automatiquement à gauche.
 */
export const resolve: PresentationPluginOptions["resolve"] = {
  mainDocuments: defineDocuments([
    { route: "/", filter: `_id == "homePage"` },
    { route: "/entreprise", filter: `_id == "aboutPage"` },
    { route: "/entreprise/", filter: `_id == "aboutPage"` },
    { route: "/realisations/:slug", filter: `_type == "realisation" && slug.current == $slug` },
    { route: "/realisations/:slug/", filter: `_type == "realisation" && slug.current == $slug` },
    { route: "/prestations/:slug", filter: `_type == "service" && slug.current == $slug` },
    { route: "/prestations/:slug/", filter: `_type == "service" && slug.current == $slug` },
    { route: "/zones-intervention/:slug", filter: `_type == "zone" && slug.current == $slug` },
    { route: "/zones-intervention/:slug/", filter: `_type == "zone" && slug.current == $slug` },
    { route: "/conseils/:slug", filter: `_type == "guide" && slug.current == $slug` },
    { route: "/conseils/:slug/", filter: `_type == "guide" && slug.current == $slug` },
  ]),
  locations: {
    homePage: defineLocations({
      locations: [{ title: "Page d'accueil", href: "/" }],
    }),
    aboutPage: defineLocations({
      locations: [{ title: "Page L'entreprise", href: "/entreprise/" }],
    }),
    realisation: defineLocations({
      select: { title: "title", commune: "commune", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          ...(doc?.slug ? [{ title: [doc.title, doc.commune].filter(Boolean).join(" · ") || "Chantier", href: `/realisations/${doc.slug}/` }] : []),
          { title: "Toutes les réalisations", href: "/realisations/" },
          { title: "Page d'accueil", href: "/" },
        ],
      }),
    }),
    service: defineLocations({
      select: { title: "name", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          ...(doc?.slug ? [{ title: doc.title || "Prestation", href: `/prestations/${doc.slug}/` }] : []),
          { title: "Toutes les prestations", href: "/prestations/" },
        ],
      }),
    }),
    zone: defineLocations({
      select: { title: "name", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          ...(doc?.slug ? [{ title: doc.title || "Secteur", href: `/zones-intervention/${doc.slug}/` }] : []),
          { title: "Zones d'intervention", href: "/zones-intervention/" },
        ],
      }),
    }),
    guide: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          ...(doc?.slug ? [{ title: doc.title || "Article conseil", href: `/conseils/${doc.slug}/` }] : []),
          { title: "Prix et conseils", href: "/conseils/" },
        ],
      }),
    }),
    review: defineLocations({
      locations: [
        { title: "Slider sur la page d'accueil", href: "/" },
        { title: "Page Avis clients", href: "/avis/" },
      ],
    }),
    faqGroup: defineLocations({
      locations: [{ title: "Questions fréquentes", href: "/faq/" }],
    }),
  },
};
