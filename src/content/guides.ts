import { guidesExtra } from "./guides-extra";
import type { Guide } from "./types";

/**
 * Guides (« Le carnet »). Cible : requêtes informationnelles à fort volume + citations par les IA.
 * Format : réponse directe en tête, données chiffrées datées, structure Q/R.
 */
const baseGuides: Guide[] = [
  {
    slug: "prix-pose-carrelage-m2-annecy",
    title: "Prix de pose de carrelage au m² à Annecy : tarifs 2026",
    h1: "Prix de la pose de carrelage au m² à Annecy en 2026",
    metaDescription:
      "Combien coûte la pose de carrelage à Annecy ? Fourchettes 2026 par type de pose (sol, faïence, grand format, terrasse, douche) et ce qui fait varier le prix.",
    lead:
      "À Annecy en 2026, la pose de carrelage au sol coûte en général entre 45 et 75 € TTC du m² hors fourniture, la faïence murale entre 45 et 90 €/m², le grand format entre 60 et 120 €/m² et une terrasse entre 55 et 110 €/m². Le support, le format et les découpes font varier le prix plus que la surface.",
    category: "Prix",
    published: "2026-11-19",
    updated: "2026-11-19",
    readingMinutes: 6,
    pattern: "decale",
    body: [
      {
        type: "callout",
        tone: "warn",
        title: "Prix indicatifs",
        text: "Fourchettes TTC, pose seule (hors fourniture du carrelage), constatées sur le bassin annécien. Elles servent à budgéter ; seul un devis après visite fait foi.",
      },
      { type: "h2", text: "Tableau des prix de pose à Annecy (2026)" },
      {
        type: "table",
        caption: "Prix de pose indicatifs, TTC, hors fourniture",
        head: ["Prestation", "Prix indicatif", "Ce qui fait varier"],
        rows: [
          ["Carrelage sol intérieur (30×60, 60×60)", "45 – 75 € / m²", "Support, nombre de coupes, plinthes"],
          ["Carrelage grand format (120×120 et +)", "60 – 120 € / m²", "Planéité, manutention, double encollage"],
          ["Faïence murale / crédence", "45 – 90 € / m²", "Format, niches, angles, zellige"],
          ["Mosaïque", "80 – 140 € / m²", "Surface, formes, jointoiement"],
          ["Terrasse collée ou sur plots", "55 – 110 € / m²", "Pente, plots, accès"],
          ["Douche à l'italienne complète", "2 500 – 5 000 €", "Receveur, étanchéité, caniveau"],
          ["Ragréage autolissant", "15 – 35 € / m²", "Épaisseur"],
          ["Dépose d'ancien carrelage", "15 – 30 € / m²", "Colle ou scellé, évacuation"],
        ],
      },
      { type: "h2", text: "Ce qui fait vraiment varier le prix" },
      {
        type: "ul",
        items: [
          "**L'état du support** : un ragréage ou une chape peut représenter 20 à 40 % du budget.",
          "**Le format** : les très petits (mosaïque) et très grands formats demandent plus de temps au m².",
          "**Le nombre de découpes** : une petite salle de bain avec niches coûte plus cher au m² qu'un grand séjour.",
          "**L'accès** : étage sans ascenseur, Vieille Ville, chalet en altitude.",
          "**Les finitions** : plinthes, profilés, joints époxy, nez de marche.",
        ],
      },
      { type: "h2", text: "TVA à 10 % pour la rénovation" },
      {
        type: "p",
        text: "Dans un logement achevé depuis plus de deux ans, les travaux de rénovation de carrelage bénéficient en général d'une **TVA à 10 %** (au lieu de 20 %) sur la pose et la fourniture par l'artisan, sur attestation du client.",
      },
    ],
    faq: [
      { q: "Quel est le prix moyen d'un carreleur au m² à Annecy ?", a: "Entre 45 et 75 € TTC du m² pour une pose de sol classique hors fourniture, en 2026. Le grand format et la mosaïque sont plus chers." },
      { q: "Le prix comprend-il le carrelage ?", a: "Les prix de pose s'entendent hors fourniture. Le carrelage lui-même coûte de 20 à plus de 100 € le m² selon la gamme." },
      { q: "Pourquoi les prix varient-ils autant d'un devis à l'autre ?", a: "Un devis bas oublie souvent la préparation du support, l'étanchéité ou les finitions. Comparez les postes ligne par ligne." },
    ],
    relatedServices: ["pose-carrelage-sol", "grand-format", "douche-italienne"],
  },
  {
    slug: "douche-italienne-etapes-etancheite",
    title: "Douche à l'italienne : étapes et étanchéité (guide carreleur)",
    h1: "Douche à l'italienne : les étapes et l'étanchéité, expliquées par un carreleur",
    metaDescription:
      "Comment est faite une douche à l'italienne durable ? Pente, receveur à carreler, étanchéité SPEC, carrelage R11 et joints époxy : les étapes expliquées par un artisan.",
    lead:
      "Une douche à l'italienne durable repose sur trois éléments : une pente de 1 à 2 % vers l'évacuation, une étanchéité continue sous le carrelage (système SPEC) et un carrelage antidérapant. Le carrelage et les joints ne sont pas étanches : c'est la couche posée dessous qui protège le logement.",
    category: "Conseils techniques",
    published: "2026-11-19",
    updated: "2026-11-19",
    readingMinutes: 7,
    pattern: "mosaique",
    body: [
      { type: "h2", text: "Les 7 étapes d'une douche à l'italienne" },
      {
        type: "steps",
        items: [
          { title: "Vérifier la hauteur disponible", text: "Le siphon doit tenir sous le niveau fini : c'est ce qui décide du type de receveur." },
          { title: "Créer la pente", text: "Receveur à carreler prêt à l'emploi ou forme de pente en mortier, 1 à 2 % vers la bonde." },
          { title: "Poser l'évacuation", text: "Siphon de sol ou caniveau linéaire, raccordé et testé avant de refermer." },
          { title: "Étancher", text: "SPEC liquide ou en natte : sol de douche, murs jusqu'à 2 m au minimum, bandes d'angle, manchettes." },
          { title: "Carreler les murs", text: "En partant d'une ligne de niveau, alignée sur les axes de la robinetterie." },
          { title: "Carreler le sol", text: "Carreau antidérapant R11 ; petits formats si pente en pointe de diamant, grands formats si caniveau." },
          { title: "Jointoyer et siliconer", text: "Joint époxy en zone d'eau, mastic silicone sanitaire dans les angles." },
        ],
      },
      { type: "h2", text: "Ce que dit le DTU 52.2" },
      {
        type: "p",
        text: "Le DTU 52.2 (pose collée des revêtements céramiques) encadre les douches de plain-pied : support adapté, système d'étanchéité sous carrelage bénéficiant d'un avis technique ou d'une évaluation, et pente vers l'évacuation. Un artisan qui le respecte peut engager sa garantie décennale.",
      },
    ],
    faq: [
      { q: "Le joint de carrelage est-il étanche ?", a: "Non. Un joint ciment est poreux. L'étanchéité est assurée par le système posé sous le carrelage." },
      { q: "Quelle pente pour une douche à l'italienne ?", a: "Entre 1 et 2 % vers l'évacuation, soit 1 à 2 cm par mètre." },
    ],
    relatedServices: ["douche-italienne", "salle-de-bain", "preparation-support"],
  },
  {
    slug: "carrelage-terrasse-montagne-gel",
    title: "Carrelage de terrasse en montagne : résister au gel",
    h1: "Quel carrelage pour une terrasse en montagne qui résiste au gel ?",
    metaDescription:
      "Terrasse à Annecy ou dans les Aravis : comment choisir un carrelage ingélif, antidérapant et une pose qui résiste au gel. Conseils d'un carreleur haut-savoyard.",
    lead:
      "Pour une terrasse en Haute-Savoie, choisissez un grès cérame ingélif (absorption d'eau inférieure à 0,5 %), antidérapant R11, et une pose qui évacue l'eau : pente de 1,5 % et double encollage en pose collée, ou dalles de 20 mm sur plots. Le gel n'abîme pas un carreau sec ; il fait éclater l'eau piégée dessous.",
    category: "Conseils techniques",
    published: "2026-11-19",
    updated: "2026-11-19",
    readingMinutes: 5,
    pattern: "grand",
    body: [
      { type: "h2", text: "Pourquoi les terrasses se dégradent en hiver" },
      {
        type: "p",
        text: "L'eau s'infiltre par les joints ou par un encollage incomplet, gèle, augmente de volume d'environ 9 % et décolle ou fait éclater le carreau. Autour du lac d'Annecy comme dans les Aravis, les **cycles gel-dégel** se répètent des dizaines de fois par hiver.",
      },
      { type: "h2", text: "Les 4 critères pour choisir" },
      {
        type: "ul",
        items: [
          "**Ingélif** : grès cérame avec absorption d'eau inférieure à 0,5 % (groupe BIa).",
          "**Antidérapant** : R11 minimum ; A+B+C autour d'une piscine.",
          "**Épaisseur** : 20 mm pour une pose sur plots ou sur gravier.",
          "**Teinte** : les teintes claires chauffent moins en été et marquent moins le calcaire.",
        ],
      },
    ],
    faq: [
      { q: "Peut-on poser une terrasse en hiver ?", a: "Non : les colles et mortiers ne doivent pas être appliqués sous 5 °C ni sur support gelé. En Haute-Savoie, on pose d'avril à octobre." },
    ],
    relatedServices: ["terrasse-exterieur", "pierre-naturelle"],
  },
];

export const guides: Guide[] = [...baseGuides, ...guidesExtra];

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);
