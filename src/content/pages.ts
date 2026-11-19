import type { Block } from "./types";

/**
 * Textes éditoriaux des pages (valeurs par défaut, importées dans Sanity).
 * Ton : un artisan savoyard qui fait ça depuis 25 ans. Phrases courtes, chiffres, pas de slogans.
 * « {annees} » est remplacé automatiquement par le nombre d'années depuis la création.
 */
export type SectionText = { title: string; intro?: string };
export type PageHeader = { title: string; lead?: string };

export type ReviewsSection = SectionText & {
  autoplay?: boolean;
  autoplaySeconds?: number;
  sliderIds?: string[];
};

export type HomeContent = {
  hero: { title: string; intro: string; proof: string; photoCaption: string };
  services: SectionText;
  method: SectionText & { steps: { title: string; text: string }[] };
  realisations: SectionText;
  reviews: ReviewsSection;
  zones: SectionText;
  guides: SectionText;
  faq: SectionText;
  cta: { title: string; text: string };
  seo: { title: string; description: string };
};

export type AboutContent = {
  header: PageHeader;
  story: Block[];
  photoCaption: string;
  values: { title: string; text: string }[];
  valuesTitle: string;
  insuranceTitle: string;
  insuranceText: string;
  seo: { title: string; description: string };
};

export type PageKey = "prestations" | "realisations" | "zones" | "conseils" | "avis" | "faq" | "devis";

export const home: HomeContent = {
  hero: {
    // Une ligne = une ligne du lettrage (comme sur le camion)
    title: "Carreleur\nà Annecy\ndepuis 2000",
    intro:
      "Salles de bain, douches à l'italienne, sols, terrasses et grands formats. On vient voir, on mesure, on vous chiffre poste par poste. Ensuite on pose, et on laisse le chantier propre le soir.",
    proof: "**SARL artisanale, dépôt à Pringy.** Assurée en décennale, attestation jointe au devis. Visite gratuite, réponse sous 48 h ouvrées.",
    photoCaption: "**Le dépôt, route des Rutys.** Les camions partent d'ici à 7 h.",
  },
  services: {
    title: "Ce que nous posons",
    intro: "Du carreau de 2,5 cm au panneau de 120 × 280. Les prix sont ceux de nos chantiers 2026, pose seule, TTC. Le devis après visite fait foi.",
  },
  method: {
    title: "Comment se passe un chantier",
    intro: "Six étapes, toujours dans le même ordre. La moitié du travail est faite avant de poser le premier carreau.",
    steps: [
      { title: "On vient voir", text: "On mesure la pièce et on contrôle le support : planéité, humidité, ce qu'il y a dessous. C'est gratuit." },
      { title: "On dessine le calepinage", text: "On place les coupes avant de commander le carrelage. Pas de bande de 3 cm contre un mur." },
      { title: "On chiffre", text: "Un devis poste par poste, avec l'attestation décennale jointe. Pas de ligne « divers »." },
      { title: "On prépare", text: "Ragréage, chape, étanchéité. C'est ce qu'on ne voit plus après, et c'est ce qui tient." },
      { title: "On pose", text: "Sols et parties communes protégés, chantier nettoyé chaque soir." },
      { title: "On réceptionne", text: "On fait le tour ensemble. Vous gardez la fiche d'entretien et les garanties." },
    ],
  },
  realisations: { title: "Chantiers récents", intro: "Commune, format, type de pose et temps passé, pour chaque chantier." },
  reviews: { title: "Ce qu'en disent les clients", intro: "Reproduits tels quels, fautes comprises.", autoplay: true, autoplaySeconds: 7 },
  zones: {
    title: "Où nous intervenons",
    intro:
      "Autour d'Annecy, jusqu'à 50 minutes du dépôt de Pringy. Copropriétés en ville, maisons au bord du lac, chalets dans les Aravis. Plus loin, appelez quand même : ça dépend du chantier.",
  },
  guides: { title: "Prix et conseils", intro: "Les prix qu'on pratique, les problèmes qu'on répare et comment on s'y prend." },
  faq: { title: "Les questions qu'on nous pose" },
  cta: {
    title: "Un carrelage à refaire ?",
    text: "Envoyez deux ou trois photos et les dimensions de la pièce. Xavier Basso vous rappelle pour fixer la visite. Elle est gratuite.",
  },
  seo: {
    title: "Carreleur à Annecy depuis 2000 – Carreal, artisan carreleur",
    description:
      "Artisan carreleur à Annecy depuis 2000 : salles de bain, douches à l'italienne, sols, terrasses, grands formats. Garantie décennale. Visite et devis gratuits.",
  },
};

export const about: AboutContent = {
  header: {
    title: "{annees} ans de carrelage en Haute-Savoie",
    lead: "Une petite équipe de carreleurs salariés et un dépôt à Pringy. Xavier Basso a créé l'entreprise en 2000 et passe sur chaque chantier.",
  },
  story: [
    { type: "h2", text: "L'histoire de Carreal et de Xavier Basso" },
    {
      type: "p",
      text: "Carreal est une entreprise spécialisée dans la pose de carrelage, implantée à Annecy et au service de ses environs depuis plus de deux décennies. Fondée en 2000, l'entreprise est née de la passion de son fondateur, **Xavier Basso**, pour le savoir-faire artisanal et d'une volonté de répondre aux besoins croissants de finitions soignées et durables. Depuis ses débuts, Carreal s'est imposée comme une référence en matière de pose de carrelage pour sols et murs, aussi bien en intérieur qu'en extérieur.",
    },
    {
      type: "p",
      text: "Ses clients décrivent Xavier Basso comme un patron présent sur ses chantiers, aussi minutieux que ses ouvriers. Pour lui, la réussite d'un carrelage se joue autant dans ce qui ne se voit plus après — la **préparation du support**, l'étanchéité et le **calepinage** — que dans la régularité des joints.",
    },
    { type: "h2", text: "Une équipe construite sur la rigueur" },
    {
      type: "p",
      text: "L'histoire de Carreal, c'est avant tout celle d'une équipe qui s'est construite sur des valeurs de rigueur, de discipline et d'une volonté de satisfaire le client tout au long de la réalisation des travaux. Au fil des années, l'entreprise a surmonté divers défis, des évolutions dans les tendances jusqu'aux exigences accrues en matière de qualité. Chaque obstacle a été l'occasion de renforcer notre expertise et d'affiner notre offre pour garantir un service qui dépasse les attentes de nos clients.",
    },
    {
      type: "p",
      text: "Pas de sous-traitance en cascade : ce sont les carreleurs salariés de Carreal qui posent votre carrelage. Pour une salle de bain complète, nous coordonnons le plombier et l'électricien afin que vous gardiez **un seul interlocuteur**, du devis à la réception.",
    },
    { type: "h2", text: "Maîtrise technique et finitions durables" },
    {
      type: "p",
      text: "Ce qui distingue Carreal, c'est sa maîtrise technique alliée à une approche personnalisée en fonction du souhait du client. Nous ne nous contentons pas de poser du carrelage : nous transformons les espaces en veillant à chaque détail, de la sélection des matériaux à la qualité des finitions. En choisissant Carreal, vous optez pour une équipe de professionnels qui comprend l'importance de l'esthétique et de la durabilité dans chaque projet.",
    },
    {
      type: "p",
      text: "Que vous cherchiez à moderniser votre cuisine, embellir votre terrasse ou rénover votre salle de bain, nous nous engageons à fournir un travail à la hauteur de vos attentes, en respectant les normes les plus élevées (DTU 52.2) et en restant fidèles à notre mission : embellir les espaces et faciliter la vie de nos clients.",
    },
    {
      type: "p",
      text: "Nous croyons en l'impact de notre travail sur la qualité de vie de nos clients et la valeur de leurs biens. Chaque projet est une nouvelle opportunité pour Carreal de démontrer son engagement envers l'excellence et de faire briller les valeurs qui nous animent : **passion, qualité et satisfaction durable**.",
    },
  ],
  photoCaption: "**Le dépôt Carreal.** 618 route des Rutys, Pringy.",
  valuesTitle: "Ce qui revient dans les avis",
  values: [
    { title: "La rigueur", text: "Calepinage dessiné avant le chantier, support contrôlé, règles de pose (DTU) respectées." },
    { title: "La propreté", text: "Sols et parties communes protégés, nettoyage chaque soir." },
    { title: "Le suivi", text: "Un seul interlocuteur, et le patron passe sur le chantier." },
    { title: "Les délais", text: "Le planning est écrit sur le devis. Il est tenu." },
  ],
  insuranceTitle: "Assurances et garanties",
  insuranceText: "Carreal est assurée en **responsabilité civile décennale** pour ses travaux de carrelage. L'attestation est jointe à chaque devis.",
  seo: {
    title: "Carreal, artisan carreleur à Annecy depuis 2000 – L'entreprise",
    description: "{annees} ans de chantiers en Haute-Savoie : l'histoire de Carreal, son gérant Xavier Basso, sa façon de travailler, ses assurances et garanties.",
  },
};

export const pageHeaders: Record<PageKey, PageHeader> = {
  prestations: {
    title: "Ce que nous posons",
    lead: "Sols et murs, intérieur et extérieur, du carreau de mosaïque au grand format. Pour chaque prestation : la méthode, les matériaux, les prix constatés et les questions fréquentes.",
  },
  realisations: {
    title: "Chantiers récents",
    lead: "Pour chaque chantier : la commune, le besoin, les choix techniques, le format, la pose, le joint et le temps passé.",
  },
  zones: {
    title: "Où nous intervenons",
    lead: "Autour d'Annecy, jusqu'à 50 minutes du dépôt de Pringy. Chaque secteur a ses contraintes : copropriétés du centre, bord du lac, chalets d'altitude.",
  },
  conseils: {
    title: "Prix et conseils",
    lead: "Les prix qu'on pratique, les problèmes qu'on répare et comment on s'y prend. Chaque article commence par la réponse.",
  },
  avis: {
    title: "Ce qu'en disent les clients",
    lead: "Les avis laissés sur Google, reproduits tels quels. Ce qui revient : le suivi, la minutie, la propreté et les délais tenus.",
  },
  faq: { title: "Les questions qu'on nous pose", lead: "Devis, chantier, garanties : l'essentiel avant de lancer vos travaux." },
  devis: { title: "Demander un devis", lead: "Trois questions sur votre projet. Xavier Basso vous rappelle sous 48 h ouvrées pour fixer la visite." },
};

/** Année courante figée au chargement du module (le site est régénéré à chaque publication). */
const CURRENT_YEAR = new Date().getFullYear();
export const fillYears = (s: string, foundingYear: number) => s.replaceAll("{annees}", String(CURRENT_YEAR - foundingYear));
