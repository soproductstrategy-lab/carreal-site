import type { Realisation } from "./types";

/**
 * Réalisations = le moteur de preuve du site (contenu de première main, unique, local).
 *
 * ⚠️ Les entrées ci-dessous sont des EXEMPLES DE DÉMONSTRATION (demo: true) qui montrent la
 * structure attendue. Elles sont exclues du sitemap et marquées noindex. À remplacer par les vrais
 * chantiers de Carreal (photos + fiche) via le CMS.
 */
export const realisations: Realisation[] = [
  {
    slug: "seynod-douche-italienne-remplacement-baignoire",
    title: "Remplacement d'une baignoire par une douche à l'italienne",
    commune: "Seynod",
    zone: "annecy",
    services: ["douche-italienne", "salle-de-bain"],
    year: 2026,
    room: "Salle de bain",
    material: "Grès cérame effet pierre",
    format: "60×120 mur · 30×60 sol",
    layout: "Pavé décalé 1/3",
    joint: "2 mm époxy",
    surface: "14 m²",
    duration: "6 jours",
    pattern: "decale",
    summary:
      "Appartement des années 1980 : baignoire déposée, receveur à carreler extra-plat, étanchéité SPEC et grès cérame grand format pour une douche de plain-pied de 140 × 90 cm.",
    body: [
      { type: "h2", text: "Le besoin" },
      { type: "p", text: "Une baignoire difficile à enjamber et une faïence d'origine fatiguée. Objectif : une douche de plain-pied sûre, facile à entretenir, sans toucher au reste de la salle de bain." },
      { type: "h2", text: "Nos choix techniques" },
      { type: "ul", items: ["Receveur à carreler extra-plat (hauteur de siphon limitée en appartement)", "Étanchéité liquide SPEC relevée à 2 m sur les murs de douche", "Sol 30×60 R11 pour l'adhérence pieds nus", "Joint époxy gris clair, sans entretien"] },
    ],
    images: [
      {
        src: "/images/realisations/seynod-douche-italienne-vue-ensemble.jpg",
        alt: "Salle de bain rénovée à Seynod : douche à l'italienne de plain-pied, grès cérame effet pierre 60×120 en pavé décalé 1/3 aux murs, sol 30×60 mat et niche encastrée (illustration)",
        width: 1200,
        height: 896,
      },
      {
        src: "/images/realisations/seynod-douche-italienne-detail-caniveau.jpg",
        alt: "Détail de la douche à l'italienne : caniveau linéaire affleurant, joints époxy 2 mm gris clair et coupes en onglet de la niche (illustration)",
        width: 1200,
        height: 896,
      },
    ],
    demo: true,
  },
  {
    slug: "sevrier-terrasse-plots-gres-ingelif",
    title: "Terrasse sur plots en grès cérame 20 mm face au lac",
    commune: "Sévrier",
    zone: "rive-ouest-lac",
    services: ["terrasse-exterieur"],
    year: 2025,
    room: "Terrasse",
    material: "Grès cérame 20 mm ingélif",
    format: "60×120",
    layout: "Pose droite à joints alignés",
    joint: "3 mm (plots)",
    surface: "48 m²",
    duration: "4 jours",
    pattern: "grand",
    summary:
      "Terrasse sur toit-terrasse étanché : pose sur plots réglables pour préserver l'étanchéité et laisser l'eau s'écouler, dalles 20 mm ingélives R11.",
    body: [
      { type: "h2", text: "La contrainte" },
      { type: "p", text: "Une étanchéité de toit-terrasse récente à ne surtout pas percer, et une pente de 1,5 % à rattraper pour obtenir une surface parfaitement plane." },
      { type: "h2", text: "La solution" },
      { type: "p", text: "Plots autoréglables à tête inclinable, dalles 20 mm en 60×120, calepinage aligné sur la baie vitrée pour une continuité avec le séjour." },
    ],
    images: [
      {
        src: "/images/realisations/sevrier-terrasse-plots-lac-annecy.jpg",
        alt: "Terrasse sur plots en dalles grès cérame 60×120 épaisseur 20 mm, joints ouverts de 3 mm alignés sur la baie vitrée, vue sur le lac d'Annecy (illustration)",
        width: 1200,
        height: 896,
      },
    ],
    demo: true,
  },
  {
    slug: "annecy-le-vieux-sol-grand-format-120x120",
    title: "Séjour ouvert en grand format 120 × 120",
    commune: "Annecy-le-Vieux",
    zone: "annecy",
    services: ["grand-format", "pose-carrelage-sol", "preparation-support"],
    year: 2025,
    room: "Séjour-cuisine",
    material: "Grès cérame rectifié effet béton",
    format: "120×120",
    layout: "Pose droite",
    joint: "2 mm",
    surface: "62 m²",
    duration: "7 jours",
    pattern: "grand",
    summary:
      "Sol continu sur plancher chauffant : ragréage, contrôle de planéité à 3 mm sous 2 m, double encollage intégral et système de nivellement.",
    body: [
      { type: "h2", text: "Le défi" },
      { type: "p", text: "62 m² d'un seul tenant, cuisine ouverte comprise, sur plancher chauffant. Aucun désaffleur toléré à la lumière rasante des baies vitrées." },
    ],
    images: [
      {
        src: "/images/realisations/annecy-le-vieux-sejour-120x120.jpg",
        alt: "Séjour et cuisine ouverte à Annecy-le-Vieux avec sol continu en grès cérame rectifié 120×120 effet béton, pose droite joints 2 mm sous lumière rasante (illustration)",
        width: 1200,
        height: 896,
      },
    ],
    demo: true,
  },
  {
    slug: "la-clusaz-chalet-salle-de-bain-pierre",
    title: "Salle de bain de chalet en pierre et zellige",
    commune: "La Clusaz",
    zone: "thones-aravis",
    services: ["salle-de-bain", "faience-credence", "pierre-naturelle"],
    year: 2025,
    room: "Salle de bain",
    material: "Ardoise et zellige",
    format: "Opus romain · zellige 10×10",
    layout: "Opus romain au sol, zellige droit au mur",
    joint: "1 mm (zellige) · 3 mm (ardoise)",
    surface: "18 m²",
    duration: "8 jours",
    pattern: "opus",
    summary:
      "Plancher bois de chalet renforcé et désolidarisé, sol en ardoise en opus romain, murs en zellige vert posé à joints serrés. Chantier planifié hors saison.",
    body: [
      { type: "h2", text: "Particularités" },
      { type: "p", text: "Un plancher bois souple à rigidifier avant toute pose, et un chantier à terminer avant l'ouverture de la saison d'hiver." },
    ],
    images: [
      {
        src: "/images/realisations/la-clusaz-chalet-ardoise-zellige.jpg",
        alt: "Salle de bain de chalet à La Clusaz : sol en ardoise naturelle posée en opus romain, murs en zellige vert 10×10 à joints serrés et charpente bois brossé (illustration)",
        width: 1200,
        height: 896,
      },
      {
        src: "/images/realisations/la-clusaz-chalet-detail-zellige-ardoise.jpg",
        alt: "Détail de la jonction entre les murs en zellige vert artisanal 10×10 (joints 1 mm), le caniveau linéaire et le dallage ardoise en opus romain (illustration)",
        width: 1200,
        height: 896,
      },
    ],
    demo: true,
  },
];

export const getRealisation = (slug: string) => realisations.find((r) => r.slug === slug);
export const realisationsForService = (slug: string) => realisations.filter((r) => r.services.includes(slug));
export const realisationsForZone = (slug: string) => realisations.filter((r) => r.zone === slug);
