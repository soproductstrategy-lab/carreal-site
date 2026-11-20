/**
 * Modèle de contenu. Volontairement proche de Portable Text (Sanity) pour une migration
 * sans réécriture : chaque page = métadonnées + liste de blocs typés.
 *
 * Texte inline : **gras** et [lien](/url) sont supportés dans toutes les chaînes.
 */
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "steps"; items: { title: string; text: string }[] }
  | { type: "table"; caption?: string; head: string[]; rows: string[][] }
  | { type: "callout"; title?: string; text: string; tone?: "info" | "warn" }
  | { type: "spec"; items: { label: string; value: string }[] }
  | { type: "image"; src: string; alt: string; caption?: string; width: number; height: number };

export type Faq = { q: string; a: string };

export type Img = { src: string; alt: string; width: number; height: number; caption?: string };

export type PatternName = "droit" | "decale" | "chevron" | "batons" | "opus" | "mosaique" | "grand";

export type Service = {
  slug: string;
  name: string;
  /** Nom court pour la navigation et les cartes. */
  short: string;
  /** H1 de la page. */
  h1: string;
  title: string;
  metaDescription: string;
  /** Réponse directe en 2-3 phrases (citée par les moteurs IA). */
  lead: string;
  pattern: PatternName;
  spec: string;
  /** Chiffre-étiquette du service (comme sur un carton de carrelage) : 60×60, 1 à 2 %, 20 mm… */
  format: string;
  formatNote: string;
  priceRange: string;
  body: Block[];
  faq: Faq[];
  related: string[];
  image?: Img;
};

export type Zone = {
  slug: string;
  name: string;
  h1: string;
  title: string;
  metaDescription: string;
  lead: string;
  communes: string[];
  postalCodes: string[];
  travel: string;
  /** Coordonnées approximatives pour la carte schématique (0-100). */
  map: { x: number; y: number };
  body: Block[];
  faq: Faq[];
  wikipedia?: string;
};

export type Realisation = {
  slug: string;
  title: string;
  commune: string;
  zone: string;
  services: string[];
  year: number;
  room: string;
  material: string;
  format: string;
  layout: string;
  joint: string;
  surface: string;
  duration: string;
  pattern: PatternName;
  summary: string;
  body: Block[];
  images: { src: string; alt: string; width: number; height: number }[];
  /** true = contenu de démonstration, exclu du sitemap et marqué noindex. À remplacer par de vrais chantiers. */
  demo?: boolean;
};

export type Guide = {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  lead: string;
  category: "Prix" | "Conseils techniques" | "Problèmes & réparations";
  published: string;
  updated: string;
  readingMinutes: number;
  pattern: PatternName;
  body: Block[];
  faq: Faq[];
  relatedServices: string[];
  image?: Img;
};

export type Review = {
  id?: string;
  author: string;
  date: string;
  dateLabel: string;
  rating: number;
  text: string;
  /** Phrase de l'avis à mettre en valeur (copiée telle quelle). */
  highlight?: string;
  /** Contexte facultatif affiché sous l'auteur (ex. « Salle de bain · Annecy »). */
  projectLabel?: string;
  /** Afficher cet avis dans le slider de la page d'accueil (vrai par défaut). */
  showInSlider?: boolean;
  /** Ordre d'affichage dans le slider. */
  order?: number;
  source: "Google";
};
