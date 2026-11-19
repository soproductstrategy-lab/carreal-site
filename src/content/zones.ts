import type { Zone } from "./types";

/**
 * Zones d'intervention. Règle anti « doorway pages » (Google spam policies) :
 * chaque page porte un contenu local réellement unique (bâti, climat, contraintes, temps de trajet)
 * et sera enrichie automatiquement par les réalisations de la zone.
 * Annecy = commune nouvelle depuis 2017 → une page forte avec ses communes déléguées.
 */
export const zones: Zone[] = [
  {
    slug: "annecy",
    name: "Annecy",
    h1: "Carreleur à Annecy",
    title: "Carreleur à Annecy (74) – Seynod, Cran-Gevrier, Pringy | Carreal",
    metaDescription:
      "Votre carreleur à Annecy depuis 2000 : Annecy-le-Vieux, Seynod, Cran-Gevrier, Meythet, Pringy. Salles de bain, sols, terrasses. Dépôt à Pringy, devis gratuit.",
    lead:
      "Carreal est installé à Pringy, au nord d'Annecy, depuis 2000. Nous intervenons dans toute la commune nouvelle d'Annecy (Annecy centre, Annecy-le-Vieux, Seynod, Cran-Gevrier, Meythet et Pringy), le plus souvent à moins de 20 minutes du dépôt.",
    communes: ["Annecy", "Annecy-le-Vieux", "Seynod", "Cran-Gevrier", "Meythet", "Pringy"],
    postalCodes: ["74000", "74370", "74600", "74940", "74960"],
    travel: "5 à 20 min depuis notre dépôt de Pringy",
    map: { x: 50, y: 40 },
    wikipedia: "https://fr.wikipedia.org/wiki/Annecy",
    body: [
      { type: "h2", text: "Annecy centre et Vieille Ville", id: "annecy-centre" },
      {
        type: "p",
        text: "Dans les immeubles du centre et de la Vieille Ville, les chantiers demandent de l'organisation : stationnement réglementé, accès par escaliers étroits, horaires de copropriété, évacuation des gravats. Nous planifions les livraisons de carrelage en amont et protégeons les parties communes. Les planchers anciens imposent souvent une **désolidarisation** avant la pose.",
      },
      { type: "h2", text: "Annecy-le-Vieux", id: "annecy-le-vieux" },
      {
        type: "p",
        text: "Résidences proches du lac, maisons avec terrasses exposées : nous y posons beaucoup de **grands formats** en intérieur et de terrasses ingélives, souvent sur plots pour préserver l'étanchéité des toits-terrasses.",
      },
      { type: "h2", text: "Seynod", id: "seynod" },
      {
        type: "p",
        text: "Le bâti de Seynod mêle copropriétés des années 1970-1990 et lotissements plus récents. La demande la plus fréquente : la **rénovation de salle de bain** avec remplacement de baignoire par une douche à l'italienne, et la pose de carrelage sur carrelage existant pour limiter la poussière.",
      },
      { type: "h2", text: "Cran-Gevrier et Meythet", id: "cran-gevrier" },
      {
        type: "p",
        text: "Appartements aux salles de bain compactes : chaque centimètre compte. Receveurs à carreler extra-plats, niches encastrées et faïence claire en grand format pour agrandir visuellement l'espace.",
      },
      { type: "h2", text: "Pringy, notre base", id: "pringy" },
      {
        type: "p",
        text: "Notre dépôt et nos véhicules sont route des Rutys à Pringy. Les maisons individuelles du secteur (Pringy, Argonay) nous confient sols de pièces de vie, garages et terrasses.",
      },
    ],
    faq: [
      { q: "Intervenez-vous dans la Vieille Ville d'Annecy ?", a: "Oui. Nous organisons l'accès, le stationnement et l'évacuation des gravats, et respectons le règlement de copropriété." },
      { q: "Quel délai pour une visite à Annecy ?", a: "Nous proposons généralement une visite sous une à deux semaines. Le délai de démarrage du chantier dépend de la saison ; il est indiqué sur le devis." },
      { q: "Y a-t-il des frais de déplacement à Annecy ?", a: "Non, la visite et le devis sont gratuits sur toute la commune d'Annecy." },
    ],
  },
  {
    slug: "epagny-metz-tessy",
    name: "Épagny Metz-Tessy et nord d'Annecy",
    h1: "Carreleur à Épagny Metz-Tessy, Poisy et Argonay",
    title: "Carreleur à Épagny Metz-Tessy, Poisy, Argonay | Carreal",
    metaDescription:
      "Carreleur à Épagny Metz-Tessy, Poisy, Sillingy, Argonay et Fillière : maisons neuves, grands formats, terrasses. À 10 minutes de notre dépôt de Pringy.",
    lead:
      "Le nord du bassin annécien est notre voisinage immédiat : Épagny Metz-Tessy, Poisy, Sillingy, Argonay et Fillière sont à 5 à 15 minutes du dépôt de Pringy. On y construit beaucoup de maisons neuves, avec des sols en grand format et des terrasses.",
    communes: ["Épagny Metz-Tessy", "Poisy", "Sillingy", "Argonay", "Fillière", "La Balme-de-Sillingy"],
    postalCodes: ["74330", "74370", "74570"],
    travel: "5 à 15 min depuis Pringy",
    map: { x: 34, y: 26 },
    wikipedia: "https://fr.wikipedia.org/wiki/%C3%89pagny_Metz-Tessy",
    body: [
      { type: "h2", text: "Constructions neuves : poser au bon moment" },
      {
        type: "p",
        text: "En construction neuve, le carrelage intervient après la chape et souvent sur **plancher chauffant**. Nous nous coordonnons avec le constructeur ou le maître d'œuvre pour respecter les temps de séchage et le protocole de mise en chauffe, condition de la garantie.",
      },
      {
        type: "ul",
        items: [
          "Grands formats 120×120 dans les pièces de vie ouvertes",
          "Continuité intérieur / extérieur avec une même gamme en 10 et 20 mm",
          "Garages et buanderies en grès cérame résistant",
        ],
      },
    ],
    faq: [
      { q: "Travaillez-vous avec les constructeurs de maisons ?", a: "Oui, en sous-traitance ou directement pour les particuliers qui gèrent leur projet en lots séparés." },
    ],
  },
  {
    slug: "rive-ouest-lac",
    name: "Rive ouest du lac (Sévrier, Saint-Jorioz, Duingt)",
    h1: "Carreleur sur la rive ouest du lac d'Annecy",
    title: "Carreleur à Sévrier, Saint-Jorioz, Duingt – Lac d'Annecy | Carreal",
    metaDescription:
      "Carrelage de terrasses, plages de piscine et salles de bain à Sévrier, Saint-Jorioz, Duingt et Doussard. Carrelage ingélif et antidérapant adapté au bord du lac.",
    lead:
      "De Sévrier à Doussard, la rive ouest du lac d'Annecy concentre villas, résidences secondaires et piscines. Carreal y pose des terrasses et plages de piscine ingélives et antidérapantes, et rénove salles de bain et pièces de vie, à 20 à 35 minutes de Pringy.",
    communes: ["Sévrier", "Saint-Jorioz", "Duingt", "Doussard", "Saint-Eustache"],
    postalCodes: ["74320", "74410", "74210"],
    travel: "20 à 35 min depuis Pringy",
    map: { x: 40, y: 62 },
    body: [
      { type: "h2", text: "Au bord de l'eau : humidité et gel" },
      {
        type: "p",
        text: "La proximité du lac entretient une humidité élevée et des gelées matinales en hiver. Pour les terrasses et plages de piscine, nous recommandons un grès cérame **ingélif**, une résistance à la glissance adaptée aux pieds nus (classe A+B+C) et une pose qui laisse l'eau s'évacuer.",
      },
      {
        type: "p",
        text: "Les communes riveraines sont soumises à la **loi Littoral** : pour des travaux extérieurs modifiant l'aspect d'une construction, renseignez-vous en mairie avant de lancer le chantier. Nous vous aidons à préparer les éléments techniques.",
      },
      { type: "h2", text: "Résidences secondaires" },
      {
        type: "p",
        text: "Vous n'êtes pas sur place ? Nous organisons les visites avec un gardien ou une agence, et envoyons des photos à chaque étape du chantier.",
      },
    ],
    faq: [
      { q: "Quel carrelage autour d'une piscine ?", a: "Un grès cérame ou une pierre ingélive avec une classe antidérapante pieds nus (A+B+C), et des margelles assorties à bord arrondi." },
    ],
  },
  {
    slug: "rive-est-lac",
    name: "Rive est du lac (Veyrier, Menthon, Talloires)",
    h1: "Carreleur à Veyrier-du-Lac, Menthon et Talloires",
    title: "Carreleur à Veyrier-du-Lac, Menthon, Talloires | Carreal",
    metaDescription:
      "Carrelage haut de gamme sur la rive est du lac d'Annecy : Veyrier-du-Lac, Menthon-Saint-Bernard, Talloires-Montmin. Pierre naturelle, grands formats, terrasses.",
    lead:
      "Sur la rive est du lac (Veyrier-du-Lac, Menthon-Saint-Bernard, Talloires-Montmin), les projets sont souvent haut de gamme : pierre naturelle, très grands formats, terrasses panoramiques. Carreal y intervient à 20 à 35 minutes de Pringy.",
    communes: ["Veyrier-du-Lac", "Menthon-Saint-Bernard", "Talloires-Montmin", "Bluffy", "Alex"],
    postalCodes: ["74290"],
    travel: "20 à 35 min depuis Pringy",
    map: { x: 62, y: 58 },
    body: [
      { type: "h2", text: "Matières nobles et terrains en pente" },
      {
        type: "p",
        text: "Les maisons à flanc de coteau multiplient les terrasses étagées, escaliers extérieurs et murets. Nous y posons pierre naturelle et grès cérame 20 mm, avec des nez de marche antidérapants et des pentes soignées pour que l'eau de ruissellement ne stagne pas.",
      },
      {
        type: "p",
        text: "En intérieur, la demande porte sur les **très grands formats** (jusqu'à 120×280) et les poses continues sol-mur, où la précision du calepinage fait toute la différence.",
      },
    ],
    faq: [
      { q: "Posez-vous des escaliers extérieurs ?", a: "Oui, en pierre ou en grès cérame avec nez de marche antidérapants et pente vers l'extérieur sur chaque marche." },
    ],
  },
  {
    slug: "rumilly-albanais",
    name: "Rumilly et l'Albanais",
    h1: "Carreleur à Rumilly et dans l'Albanais",
    title: "Carreleur à Rumilly et dans l'Albanais (74) | Carreal",
    metaDescription:
      "Carreleur à Rumilly, Alby-sur-Chéran, Vallières et dans l'Albanais : rénovation de salles de bain, sols de maisons, terrasses. Devis gratuit, garantie décennale.",
    lead:
      "Carreal intervient à Rumilly et dans l'Albanais (Alby-sur-Chéran, Vallières-sur-Fier, Hauteville-sur-Fier), à 25 à 35 minutes de Pringy. Fermes rénovées, maisons individuelles et pavillons : nous adaptons la pose aux supports anciens comme aux constructions récentes.",
    communes: ["Rumilly", "Alby-sur-Chéran", "Vallières-sur-Fier", "Hauteville-sur-Fier", "Marcellaz-Albanais"],
    postalCodes: ["74150", "74540"],
    travel: "25 à 35 min depuis Pringy",
    map: { x: 14, y: 30 },
    body: [
      { type: "h2", text: "Rénover une ferme ou une maison ancienne" },
      {
        type: "p",
        text: "Les fermes de l'Albanais réhabilitées ont souvent des sols en terre battue, des dalles anciennes ou des planchers bois. Avant de carreler, il faut traiter les remontées d'humidité et créer un support stable : hérisson, dalle, chape ou désolidarisation selon les cas.",
      },
    ],
    faq: [
      { q: "Peut-on carreler sur une ancienne dalle sans isolation ?", a: "Oui, mais c'est l'occasion de réfléchir à l'isolation et aux remontées d'humidité. Nous vous conseillons lors de la visite." },
    ],
  },
  {
    slug: "thones-aravis",
    name: "Thônes et les Aravis",
    h1: "Carreleur à Thônes, La Clusaz et dans les Aravis",
    title: "Carreleur à Thônes, La Clusaz, Grand-Bornand – Chalets | Carreal",
    metaDescription:
      "Carrelage de chalets et résidences secondaires à Thônes, La Clusaz, Le Grand-Bornand : carrelage ingélif, terrasses en altitude, salles de bain. Suivi à distance.",
    lead:
      "Dans la vallée de Thônes et les Aravis (La Clusaz, Le Grand-Bornand, Saint-Jean-de-Sixt), Carreal carrelle chalets et résidences secondaires, à 30 à 50 minutes de Pringy. L'altitude impose des matériaux ingélifs et un planning qui tient compte de la saison de ski.",
    communes: ["Thônes", "La Clusaz", "Le Grand-Bornand", "Saint-Jean-de-Sixt", "Manigod", "Les Villards-sur-Thônes"],
    postalCodes: ["74230", "74220", "74450"],
    travel: "30 à 50 min depuis Pringy",
    map: { x: 84, y: 40 },
    body: [
      { type: "h2", text: "Chantiers en altitude : le calendrier compte" },
      {
        type: "p",
        text: "Entre 600 et 1 300 m d'altitude, les cycles gel-dégel sont nombreux. Les terrasses doivent être posées entre fin avril et octobre avec des colles hors gel, et les chantiers intérieurs des résidences de location planifiés **hors saison** (printemps, automne) pour ne pas bloquer les réservations.",
      },
      {
        type: "ul",
        items: [
          "Carrelage ingélif obligatoire en extérieur, idéalement 20 mm",
          "Sols de ski-rooms et entrées en grès cérame très résistant (PEI 5)",
          "Planchers bois de chalets : panneaux de renfort et natte de désolidarisation",
          "Compte rendu photo pour les propriétaires non résidents",
        ],
      },
    ],
    faq: [
      { q: "Intervenez-vous l'hiver dans les Aravis ?", a: "Oui pour les travaux intérieurs, selon l'accès. Les terrasses extérieures se font de fin avril à octobre." },
      { q: "Je ne suis pas sur place, comment suivre le chantier ?", a: "Nous organisons la remise des clés avec vous ou votre agence et envoyons des photos à chaque étape clé." },
    ],
  },
];

export const getZone = (slug: string) => zones.find((z) => z.slug === slug);
