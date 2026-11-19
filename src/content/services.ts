import type { Service } from "./types";

/**
 * Prestations. Une page par service = facteur n°2 de visibilité dans les réponses IA (Whitespark 2026).
 * Les fourchettes de prix sont INDICATIVES (pose seule, TTC, constatées sur le bassin annécien)
 * et doivent être validées par Carreal avant publication.
 */
export const services: Service[] = [
  {
    slug: "pose-carrelage-sol",
    name: "Pose de carrelage au sol",
    short: "Carrelage sol",
    h1: "Pose de carrelage au sol à Annecy",
    title: "Pose de carrelage sol à Annecy – Artisan carreleur | Carreal",
    metaDescription:
      "Pose de carrelage au sol à Annecy et en Haute-Savoie : grès cérame, pierre, grands formats. Préparation du support, pose DTU 52.2, garantie décennale. Devis gratuit.",
    lead:
      "Carreal pose du carrelage au sol dans les maisons et appartements d'Annecy et de Haute-Savoie depuis 2000 : séjours, cuisines, entrées, pièces d'eau. Nous préparons le support, réalisons le calepinage puis posons en colle selon le DTU 52.2, avec des joints réguliers au millimètre.",
    pattern: "decale",
    spec: "60×60 · 120×60 · DTU 52.2 · joint 2–3 mm",
    format: "60×60",
    formatNote: "joint de 2 à 3 mm",
    priceRange: "45 – 75 € / m² (pose seule)",
    body: [
      { type: "h2", text: "Ce que comprend une pose de carrelage au sol" },
      {
        type: "p",
        text: "Un beau sol carrelé se joue avant la première colle. À chaque chantier, nous vérifions la **planéité**, l'humidité et la solidité du support, puis nous dessinons le **calepinage** : point de départ, sens de pose, coupes en périphérie, alignement avec les portes et les murs. C'est ce qui évite les petites coupes disgracieuses et les joints qui « tournent ».",
      },
      {
        type: "steps",
        items: [
          { title: "Relevé et visite", text: "Métrés, contrôle du support (chape, ancien carrelage, plancher bois), choix du format avec vous." },
          { title: "Préparation", text: "Dépose si besoin, ragréage autolissant ou chape, primaire d'accrochage, désolidarisation sur plancher chauffant ou bois." },
          { title: "Calepinage", text: "Plan de pose validé ensemble : axes, coupes, joints de fractionnement." },
          { title: "Pose collée", text: "Double encollage pour les formats > 30×30 cm, croisillons ou système de nivellement pour un rendu sans désaffleur." },
          { title: "Joints et finitions", text: "Joints ciment ou époxy, plinthes, seuils et profilés, nettoyage de fin de chantier." },
        ],
      },
      { type: "h2", text: "Quel carrelage choisir pour un sol ?" },
      {
        type: "table",
        caption: "Repères pour choisir votre carrelage de sol",
        head: ["Matériau", "Points forts", "À savoir"],
        rows: [
          ["Grès cérame pleine masse", "Très résistant, peu poreux, imitations bois/pierre/béton", "Le plus polyvalent ; choisir PEI 4-5 pour une entrée"],
          ["Grès cérame grand format", "Peu de joints, effet contemporain", "Exige un support parfaitement plan (voir grand format)"],
          ["Pierre naturelle", "Matière unique, vieillit bien", "Traitement hydrofuge, pose adaptée à la pierre"],
          ["Carreaux de ciment", "Décoratifs, motifs", "Poreux : imprégnation obligatoire"],
        ],
      },
      {
        type: "callout",
        title: "Plancher chauffant",
        text: "Sur un plancher chauffant, la chape doit être sèche et le chauffage mis en route puis coupé selon le protocole avant la pose. Nous vous indiquons le calendrier exact au moment du devis.",
      },
    ],
    faq: [
      { q: "Combien de temps faut-il pour carreler une pièce de 30 m² ?", a: "Comptez en général 3 à 5 jours ouvrés pour 30 m², préparation du support comprise. Un ragréage ajoute 24 à 48 h de séchage avant la pose." },
      { q: "Peut-on poser du carrelage sur un ancien carrelage ?", a: "Oui, si l'ancien carrelage est sain, bien adhérent et plan. On le dégraisse, on applique un primaire spécifique et on utilise une colle adaptée. Il faut aussi vérifier la hauteur sous les portes." },
      { q: "Quelle largeur de joint prévoir ?", a: "Pour du grès cérame rectifié, un joint de 2 à 3 mm est le plus courant. Un carreau non rectifié ou une pose extérieure demandent un joint plus large, 4 à 8 mm." },
      { q: "Fournissez-vous le carrelage ?", a: "Nous pouvons le fournir ou poser le carrelage que vous avez choisi chez un négoce de la région. Dans les deux cas, nous vérifions les quantités et le lot avant la pose." },
    ],
    related: ["grand-format", "preparation-support", "pierre-naturelle"],
  },
  {
    slug: "salle-de-bain",
    name: "Carrelage de salle de bain",
    short: "Salle de bain",
    h1: "Carrelage de salle de bain à Annecy",
    title: "Carrelage salle de bain à Annecy – Rénovation | Carreal",
    metaDescription:
      "Rénovation et carrelage de salle de bain à Annecy : sol, faïence, douche à l'italienne, étanchéité sous carrelage. Artisan carreleur depuis 2000, garantie décennale.",
    lead:
      "Nous carrelons les salles de bain neuves et rénovées à Annecy et alentour : sol, murs, douche à l'italienne, habillage de baignoire et niches. L'étanchéité sous carrelage (SPEC) est systématique dans les zones exposées à l'eau, comme le demande le DTU 52.2.",
    pattern: "batons",
    spec: "SPEC · faïence 30×60 · sol R10 · joint époxy",
    format: "30×60",
    formatNote: "faïence murale, sol R10, joint époxy",
    priceRange: "2 500 – 6 000 € (salle de bain 4–6 m², pose seule)",
    body: [
      { type: "h2", text: "Une salle de bain carrelée qui reste étanche" },
      {
        type: "p",
        text: "Dans une salle de bain, le carrelage est un revêtement ; c'est le **système d'étanchéité** posé dessous qui protège votre logement. Nous appliquons une étanchéité liquide ou en natte (SPEC) avec bandes d'angle et manchettes autour des arrivées d'eau, avant de poser faïence et sol.",
      },
      {
        type: "steps",
        items: [
          { title: "Dépose et contrôle", text: "Retrait de l'ancien revêtement, vérification des cloisons (plaques hydrofuges) et des pentes." },
          { title: "Étanchéité", text: "SPEC sur sol et murs en zone douche, traitement des angles et traversées." },
          { title: "Pose murale", text: "Faïence ou grès cérame, alignée sur les axes de la robinetterie et des niches." },
          { title: "Pose au sol", text: "Carrelage antidérapant adapté (R10 minimum conseillé), raccord parfait avec la douche." },
          { title: "Joints", text: "Joint époxy recommandé en zone douche : imperméable et sans noircissement." },
        ],
      },
      {
        type: "p",
        text: "Pour la plomberie et l'électricité, nous travaillons avec des artisans de confiance du bassin annécien et coordonnons les interventions pour que le chantier avance sans temps mort.",
      },
      {
        type: "callout",
        title: "Remplacer une baignoire par une douche",
        text: "C'est la demande la plus fréquente. Pour les personnes de 60 ans et plus, l'aide **MaPrimeAdapt'** peut financer une partie des travaux d'adaptation (conditions de ressources). Voir notre page [douche à l'italienne](/prestations/douche-italienne/).",
      },
    ],
    faq: [
      { q: "Combien de temps dure la rénovation du carrelage d'une salle de bain ?", a: "Pour une salle de bain de 4 à 6 m², comptez 1 à 2 semaines de carrelage, étanchéité et séchages compris. La coordination avec le plombier peut allonger le planning global." },
      { q: "Faut-il refaire l'étanchéité si l'on change seulement le carrelage ?", a: "En zone douche, oui : une nouvelle étanchéité sous carrelage est la seule garantie contre les infiltrations. Hors zone d'eau, elle n'est pas toujours obligatoire." },
      { q: "Quel carrelage choisir pour le sol d'une salle de bain ?", a: "Un grès cérame avec une résistance à la glissance R10 au minimum, R11 dans une douche de plain-pied. Les finitions mates ou structurées sont plus sûres pieds mouillés." },
      { q: "Peut-on carreler sur de la faïence existante ?", a: "C'est possible si elle est saine et bien collée, avec un primaire adapté. En zone douche, nous préférons déposer pour refaire l'étanchéité correctement." },
    ],
    related: ["douche-italienne", "faience-credence", "renovation-reparation"],
  },
  {
    slug: "douche-italienne",
    name: "Douche à l'italienne",
    short: "Douche à l'italienne",
    h1: "Douche à l'italienne à Annecy",
    title: "Douche à l'italienne à Annecy – Artisan carreleur | Carreal",
    metaDescription:
      "Création de douche à l'italienne carrelée à Annecy : receveur à carreler, étanchéité SPEC, caniveau, carrelage antidérapant. Remplacement de baignoire. Devis gratuit.",
    lead:
      "Carreal crée des douches à l'italienne carrelées à Annecy et en Haute-Savoie, en neuf comme en remplacement de baignoire. Nous posons un receveur à carreler ou une forme de pente, une étanchéité sous carrelage (SPEC) et un carrelage antidérapant, pour une douche de plain-pied durable et sans infiltration.",
    pattern: "mosaique",
    spec: "receveur à carreler · SPEC · R11 · pente 1–2 %",
    format: "1 à 2 %",
    formatNote: "de pente vers la bonde",
    priceRange: "2 500 – 5 000 € (douche complète, pose seule)",
    body: [
      { type: "h2", text: "Les 3 points qui font une bonne douche à l'italienne" },
      {
        type: "ul",
        items: [
          "**La pente** : 1 à 2 % vers la bonde ou le caniveau, pour que l'eau ne stagne jamais.",
          "**L'étanchéité** : un système SPEC continu sol et murs, relevé d'au moins 20 cm au-delà de la zone de projection.",
          "**L'évacuation** : siphon de sol ou caniveau linéaire au bon débit, accessible pour l'entretien.",
        ],
      },
      { type: "h2", text: "Receveur à carreler ou forme de pente traditionnelle ?" },
      {
        type: "table",
        head: ["Solution", "Avantages", "Quand la choisir"],
        rows: [
          ["Receveur à carreler (panneau prêt à carreler)", "Pente intégrée, faible épaisseur, rapide", "Rénovation, plancher bois, hauteur limitée"],
          ["Forme de pente en mortier", "Sur mesure, toutes dimensions", "Construction neuve, grandes douches"],
          ["Caniveau linéaire", "Pente dans un seul sens, grands formats possibles", "Carrelage grand format, design minimal"],
        ],
      },
      {
        type: "h2",
        text: "Douche senior et accessibilité",
        id: "pmr",
      },
      {
        type: "p",
        text: "Une douche de plain-pied supprime l'enjambement de la baignoire : c'est l'aménagement le plus demandé pour rester chez soi en sécurité. Nous ajoutons sur demande un siège rabattable, des barres d'appui fixées dans des renforts et un carrelage **R11 / classe C**. L'aide publique **MaPrimeAdapt'** (Anah) peut prendre en charge une partie du coût selon vos revenus.",
      },
    ],
    faq: [
      { q: "Quel est le prix d'une douche à l'italienne à Annecy ?", a: "Pour la partie carrelage et étanchéité, comptez en général 2 500 à 5 000 € selon la taille, le receveur et le carrelage choisi. La plomberie et le carrelage fourni s'ajoutent. Seul un devis après visite fait foi." },
      { q: "Peut-on faire une douche à l'italienne à l'étage ou sur plancher bois ?", a: "Oui, avec un receveur à carreler extra-plat et une étanchéité adaptée. Il faut vérifier la hauteur disponible pour le siphon ; nous le contrôlons pendant la visite." },
      { q: "Combien de temps pour remplacer une baignoire par une douche ?", a: "En général 4 à 7 jours ouvrés pour la dépose, le receveur, l'étanchéité, le carrelage et les joints, hors délais de plomberie." },
      { q: "Quel carrelage pour une douche à l'italienne ?", a: "Un carrelage antidérapant R11 ou classe C pour pieds nus mouillés. Les petits formats et la mosaïque suivent mieux les pentes ; les grands formats demandent un caniveau linéaire." },
      { q: "Les joints vont-ils noircir ?", a: "Avec un joint époxy, non : il est imperméable et ne retient pas les moisissures. C'est ce que nous recommandons en zone douche." },
    ],
    related: ["salle-de-bain", "faience-credence", "preparation-support"],
  },
  {
    slug: "terrasse-exterieur",
    name: "Carrelage extérieur et terrasses",
    short: "Terrasse & extérieur",
    h1: "Carrelage de terrasse et extérieur à Annecy",
    title: "Terrasse carrelée à Annecy – Pose sur plots ou collée | Carreal",
    metaDescription:
      "Pose de carrelage extérieur à Annecy : terrasses, balcons, plages de piscine. Carrelage ingélif, antidérapant R11, pose collée ou sur plots adaptée au climat alpin.",
    lead:
      "Carreal pose des terrasses, balcons, escaliers extérieurs et plages de piscine autour d'Annecy. Le climat haut-savoyard impose un carrelage ingélif, antidérapant (R11) et une pose qui gère l'eau et le gel : collée sur chape drainante ou sur plots réglables, selon le support.",
    pattern: "grand",
    spec: "ingélif · R11 · 20 mm sur plots · pente 1,5 %",
    format: "20 mm",
    formatNote: "sur plots, grès ingélif R11",
    priceRange: "55 – 110 € / m² (pose seule)",
    body: [
      { type: "h2", text: "Une terrasse faite pour les hivers de Haute-Savoie" },
      {
        type: "p",
        text: "Entre les cycles gel-dégel, la neige et les pluies d'orage, une terrasse autour du lac ou en altitude travaille beaucoup. Les désordres les plus fréquents (carreaux qui sonnent creux, éclatés par le gel, traces blanches) viennent presque toujours d'une **eau mal évacuée**. Nous traitons donc d'abord les pentes et le drainage.",
      },
      {
        type: "table",
        caption: "Deux techniques de pose en extérieur",
        head: ["", "Pose collée sur chape", "Pose sur plots"],
        rows: [
          ["Support", "Dalle béton avec pente", "Dalle, étanchéité de toit-terrasse, gravier compacté"],
          ["Carrelage", "Grès cérame 10–12 mm, ingélif", "Dalles 20 mm spéciales extérieur"],
          ["Avantages", "Très stable, joints fermés", "Rapide, réseaux accessibles, pas de remontée d'eau"],
          ["Points d'attention", "Pente 1,5 % et joints de fractionnement", "Hauteur disponible, réglage des plots"],
        ],
      },
      {
        type: "ul",
        items: [
          "**Ingélif** : indispensable dès que le carrelage peut geler humide.",
          "**Antidérapant R11** (ou A+B+C autour d'une piscine) pour la sécurité.",
          "**Double encollage** et colle déformable (C2S1) en pose collée.",
          "Joints de fractionnement tous les 20 à 25 m² et en périphérie.",
        ],
      },
    ],
    faq: [
      { q: "Quel carrelage choisir pour une terrasse en montagne ?", a: "Un grès cérame ingélif, en 20 mm si la pose est sur plots, avec une résistance à la glissance R11. Les teintes claires chauffent moins l'été." },
      { q: "Pose sur plots ou pose collée ?", a: "Sur plots si vous posez sur une étanchéité (toit-terrasse) ou si vous voulez garder l'accès aux réseaux. Collée sur une dalle béton saine avec une bonne pente. Nous choisissons avec vous après la visite." },
      { q: "Quand faire une terrasse carrelée à Annecy ?", a: "Idéalement d'avril à octobre, hors gel et hors fortes chaleurs. Les colles ne doivent pas être appliquées sous 5 °C." },
      { q: "D'où viennent les traces blanches sur une terrasse ?", a: "Ce sont des efflorescences : l'eau traverse le support et ramène du calcaire en surface. Il faut traiter l'origine (pente, drainage), puis nettoyer avec un produit adapté." },
    ],
    related: ["pierre-naturelle", "grand-format", "renovation-reparation"],
  },
  {
    slug: "faience-credence",
    name: "Faïence murale, crédence et mosaïque",
    short: "Faïence & mosaïque",
    h1: "Faïence murale, crédence et mosaïque à Annecy",
    title: "Faïence et crédence carrelée à Annecy – Mosaïque | Carreal",
    metaDescription:
      "Pose de faïence murale, crédence de cuisine et mosaïque à Annecy : alignements parfaits, coupes nettes autour des prises et niches. Artisan carreleur depuis 2000.",
    lead:
      "Nous posons faïence, zellige, mosaïque et grès cérame mural dans les cuisines et salles de bain du bassin annécien. Sur un mur, chaque défaut se voit : nous alignons les joints sur les axes de la pièce et soignons les coupes autour des prises, niches et robinetteries.",
    pattern: "mosaique",
    spec: "zellige · métro 7,5×15 · mosaïque 2,5×2,5 · joint 1–2 mm",
    format: "2,5×2,5",
    formatNote: "mosaïque, zellige, métro",
    priceRange: "45 – 90 € / m² (pose seule)",
    body: [
      { type: "h2", text: "Crédence de cuisine" },
      {
        type: "p",
        text: "La crédence protège le mur derrière le plan de travail et donne le ton de la cuisine. Carreaux métro, zellige, grand format d'un seul tenant : nous calons le calepinage sur la hotte, les prises et les meubles hauts pour qu'aucune coupe ne tombe au mauvais endroit.",
      },
      { type: "h2", text: "Mosaïque et petits formats" },
      {
        type: "p",
        text: "La mosaïque suit les courbes, habille les niches et fonctionne très bien au sol des douches (meilleure adhérence grâce aux joints). Elle demande un support parfaitement plan et un jointoiement minutieux : c'est un travail de patience que nous aimons.",
      },
      {
        type: "ul",
        items: [
          "Niches de douche avec profilés d'angle discrets",
          "Habillage de baignoire avec trappe de visite",
          "Pose en chevron, à bâtons rompus, verticale ou décalée",
          "Joints époxy colorés pour les zones humides",
        ],
      },
    ],
    faq: [
      { q: "Faut-il un joint particulier pour une crédence ?", a: "Derrière une plaque de cuisson, un joint époxy ou un joint ciment hydrofugé facilite l'entretien et résiste mieux aux graisses." },
      { q: "Le zellige est-il compliqué à poser ?", a: "Ses variations d'épaisseur et de teinte font son charme, mais il se pose à joints serrés avec beaucoup de soin. Nous le traitons avant et après jointoiement." },
      { q: "Peut-on poser de la faïence sur de la peinture ?", a: "Non sans préparation : la peinture doit être poncée ou décapée et le support primairisé. Sur une plaque de plâtre neuve, la pose est directe." },
    ],
    related: ["salle-de-bain", "douche-italienne", "pose-carrelage-sol"],
  },
  {
    slug: "grand-format",
    name: "Carrelage grand format",
    short: "Grand format",
    h1: "Pose de carrelage grand format à Annecy",
    title: "Carrelage grand format à Annecy – 120×120, 120×280 | Carreal",
    metaDescription:
      "Pose de carrelage grand format à Annecy : 120×60, 120×120, 120×280, sol et murs. Support plan, double encollage, outillage de manutention. Artisan carreleur expérimenté.",
    lead:
      "Les grands formats (120×60, 120×120, jusqu'à 120×280 cm) donnent un rendu continu avec très peu de joints. Ils demandent un support parfaitement plan, un double encollage intégral et un outillage de manutention adapté : c'est un savoir-faire à part entière, que Carreal maîtrise sur sols et murs.",
    pattern: "grand",
    spec: "120×120 · 120×280 · planéité 3 mm / 2 m · double encollage",
    format: "120×280",
    formatNote: "double encollage, planéité contrôlée",
    priceRange: "60 – 120 € / m² (pose seule)",
    body: [
      { type: "h2", text: "Pourquoi le grand format ne pardonne pas l'approximation" },
      {
        type: "p",
        text: "Sur un carreau de 1,20 m, le moindre creux du support crée un **désaffleur** visible à la lumière rasante. Nous vérifions la planéité à la règle de 2 m, ragréons si nécessaire et utilisons un système de nivellement pendant la pose.",
      },
      {
        type: "steps",
        items: [
          { title: "Contrôle de planéité", text: "Tolérance de 3 mm sous la règle de 2 m ; ragréage si l'écart est supérieur." },
          { title: "Calepinage", text: "Placement des joints sur les axes architecturaux, anticipation des coupes et des seuils." },
          { title: "Manutention", text: "Ventouses, cadre de transport : un grand carreau fissuré à la pose est perdu." },
          { title: "Double encollage", text: "Colle sur le support et au dos du carreau, sans vide, pour éviter les sons creux." },
          { title: "Nivellement", text: "Clips et cales de nivellement pour des arêtes parfaitement alignées." },
        ],
      },
    ],
    faq: [
      { q: "Peut-on poser du grand format sur un plancher chauffant ?", a: "Oui, avec une colle déformable, une désolidarisation si besoin et le respect du protocole de mise en chauffe de la chape." },
      { q: "Le grand format convient-il aux petites pièces ?", a: "Oui : moins de joints agrandit visuellement l'espace. Il faut simplement prévoir les coupes et l'accès (escaliers, portes) pour la manutention." },
      { q: "Pourquoi la pose coûte-t-elle plus cher qu'un format classique ?", a: "Préparation du support plus exigeante, double encollage, manutention à deux et pertes plus coûteuses : le temps passé au m² est plus élevé." },
    ],
    related: ["pose-carrelage-sol", "preparation-support", "terrasse-exterieur"],
  },
  {
    slug: "pierre-naturelle",
    name: "Pierre naturelle et dallage",
    short: "Pierre naturelle",
    h1: "Pose de pierre naturelle et dallage à Annecy",
    title: "Pierre naturelle et dallage à Annecy – Pose | Carreal",
    metaDescription:
      "Pose de pierre naturelle, dallage et opus incertum à Annecy : intérieur, terrasses, plages de piscine. Choix de la pierre, traitement et entretien. Devis gratuit.",
    lead:
      "Carreal pose la pierre naturelle (calcaire, travertin, ardoise, granit) en intérieur comme en extérieur : dallages, opus romain ou incertum, plages de piscine. Chaque pierre a sa porosité et sa colle ; nous adaptons la pose et le traitement de protection à la matière.",
    pattern: "opus",
    spec: "opus romain · travertin · hydrofuge · colle blanche",
    format: "Opus",
    formatNote: "romain ou incertum, travertin, ardoise",
    priceRange: "70 – 130 € / m² (pose seule)",
    body: [
      { type: "h2", text: "Choisir une pierre adaptée à l'usage" },
      {
        type: "table",
        head: ["Pierre", "Usage conseillé", "Entretien"],
        rows: [
          ["Calcaire / pierre de Bourgogne", "Intérieur, terrasses abritées", "Hydrofuge + oléofuge"],
          ["Travertin", "Plages de piscine, terrasses", "Bouchage des pores selon finition"],
          ["Ardoise", "Sols intérieurs, entrées", "Imprégnation régulière"],
          ["Granit", "Extérieur exposé, escaliers", "Très faible"],
        ],
      },
      {
        type: "p",
        text: "La pierre claire se pose avec une **colle blanche** pour éviter les auréoles, et se protège avant jointoiement. Nous vous remettons une fiche d'entretien en fin de chantier.",
      },
    ],
    faq: [
      { q: "La pierre naturelle résiste-t-elle au gel ?", a: "Toutes les pierres ne sont pas ingélives. Pour l'extérieur en Haute-Savoie, choisissez une pierre dont la fiche technique garantit la résistance au gel." },
      { q: "Qu'est-ce que l'opus romain ?", a: "Une pose en modules de 4 à 6 tailles différentes qui se répètent, pour un aspect ancien et naturel. L'opus incertum utilise des morceaux irréguliers." },
    ],
    related: ["terrasse-exterieur", "pose-carrelage-sol", "renovation-reparation"],
  },
  {
    slug: "preparation-support",
    name: "Chape, ragréage et étanchéité",
    short: "Préparation du support",
    h1: "Chape, ragréage et étanchéité avant carrelage",
    title: "Ragréage, chape et étanchéité avant carrelage – Annecy | Carreal",
    metaDescription:
      "Préparation des supports avant carrelage à Annecy : chape, ragréage autolissant, désolidarisation, étanchéité SPEC. La base d'un carrelage durable. Devis gratuit.",
    lead:
      "Un carrelage ne vaut que par son support. Avant la pose, Carreal réalise les chapes, ragréages autolissants, nattes de désolidarisation et étanchéités sous carrelage (SPEC) nécessaires, pour un sol plan, sain et durable.",
    pattern: "droit",
    spec: "ragréage P3 · natte de désolidarisation · SPEC",
    format: "3 mm",
    formatNote: "d'écart maxi sous la règle de 2 m",
    priceRange: "15 – 35 € / m² (ragréage, selon épaisseur)",
    body: [
      { type: "h2", text: "Les préparations les plus courantes" },
      {
        type: "steps",
        items: [
          { title: "Ragréage autolissant", text: "Corrige les défauts de planéité de quelques millimètres à quelques centimètres." },
          { title: "Chape", text: "Pour créer une forme de pente, enrober un plancher chauffant ou rattraper de fortes différences de niveau." },
          { title: "Désolidarisation", text: "Natte posée sur plancher bois ou support fissuré pour éviter que les mouvements ne cassent le carrelage." },
          { title: "Étanchéité SPEC", text: "Système liquide ou en natte sous le carrelage des douches, salles de bain et balcons." },
        ],
      },
    ],
    faq: [
      { q: "Combien de temps sèche un ragréage ?", a: "La plupart des ragréages sont recouvrables par du carrelage après 24 à 48 h, selon l'épaisseur et la température." },
      { q: "Peut-on carreler sur un plancher bois ?", a: "Oui, s'il est rigide, avec des panneaux de renfort et une natte de désolidarisation. Nous vérifions la flèche du plancher à la visite." },
    ],
    related: ["pose-carrelage-sol", "grand-format", "douche-italienne"],
  },
  {
    slug: "renovation-reparation",
    name: "Rénovation, joints et réparation de carrelage",
    short: "Joints & réparations",
    h1: "Réparation de carrelage et réfection des joints à Annecy",
    title: "Réparation carrelage et joints à Annecy – Carreleur | Carreal",
    metaDescription:
      "Carreau fissuré, carrelage qui sonne creux, joints noircis ou fuite sous douche à Annecy : diagnostic, remplacement de carreaux, réfection des joints époxy.",
    lead:
      "Carreau fendu, carrelage qui sonne creux, joints noircis ou infiltration sous une douche : Carreal intervient aussi pour les réparations dans le bassin annécien. Nous cherchons d'abord la cause (support, eau, dilatation) pour réparer durablement, pas seulement masquer.",
    pattern: "droit",
    spec: "diagnostic · remplacement unitaire · joint époxy",
    format: "1 carreau",
    formatNote: "remplacé sans casser les voisins",
    priceRange: "Sur devis (petites interventions possibles)",
    body: [
      { type: "h2", text: "Les problèmes que nous traitons" },
      {
        type: "table",
        head: ["Symptôme", "Cause fréquente", "Solution"],
        rows: [
          ["Carreau fissuré", "Choc, support qui bouge, absence de joint de dilatation", "Remplacement du carreau, joint de fractionnement si besoin"],
          ["Carrelage qui sonne creux", "Encollage partiel, décollement", "Injection ou repose des carreaux concernés"],
          ["Joints noircis", "Humidité, joint ciment poreux", "Dégarnissage et rejointoiement époxy"],
          ["Fuite sous la douche", "Étanchéité absente ou rompue", "Dépose partielle et reprise de l'étanchéité"],
          ["Carreaux qui se soulèvent", "Dilatation bloquée, chauffage au sol", "Repose avec joints périphériques"],
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Gardez vos carreaux de réserve",
        text: "Pour un remplacement invisible, il faut le même lot de carreaux. Si vous n'en avez plus, envoyez-nous une photo : nous cherchons une référence équivalente auprès des négoces.",
      },
    ],
    faq: [
      { q: "Peut-on remplacer un seul carreau ?", a: "Oui : on découpe les joints, on retire le carreau sans abîmer les voisins, on nettoie et on recolle un carreau identique." },
      { q: "Refaire les joints suffit-il à stopper une fuite de douche ?", a: "Rarement. Le joint n'est pas l'étanchéité. Si l'eau passe, c'est que l'étanchéité sous carrelage est défaillante ; il faut la reprendre." },
    ],
    related: ["salle-de-bain", "douche-italienne", "terrasse-exterieur"],
  },
];

export const getService = (slug: string) => services.find((s) => s.slug === slug);
