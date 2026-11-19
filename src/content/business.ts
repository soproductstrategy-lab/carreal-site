/**
 * Source unique de vérité pour l'identité de l'entreprise (NAP, horaires, mentions légales).
 * Toute citation externe (Google Business Profile, PagesJaunes, Bing Places…) doit reprendre
 * EXACTEMENT ces valeurs pour garder un NAP cohérent.
 *
 * Champs marqués TODO = à confirmer avec Xavier Basso avant mise en ligne.
 */
const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
  "https://www.carreal.fr";

export const SITE_URL = rawSiteUrl.replace(/\/$/, "");

/**
 * Mode démo / prévisualisation : bloque toute indexation (robots.txt, meta robots, X-Robots-Tag)
 * tant que NEXT_PUBLIC_NOINDEX=true, que le déploiement est une preview Vercel ou que le domaine est en *.vercel.app.
 */
export const IS_NOINDEX =
  process.env.NEXT_PUBLIC_NOINDEX === "true" ||
  process.env.VERCEL_ENV === "preview" ||
  SITE_URL.includes(".vercel.app");

export type Business = {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  foundingYear: number;
  founder: { name: string; role: string };
  phone: { display: string; e164: string };
  landline: { display: string; e164: string };
  email: string;
  whatsapp: string;
  address: { street: string; locality: string; postalCode: string; city: string; region: string; country: string };
  geo: { lat: number; lng: number };
  googleMapsUrl: string;
  googleReviewUrl: string;
  hours: { days: string[]; label: string; opens: string; closes: string }[];
  legal: {
    form: string;
    capital: string;
    siren: string;
    siret: string;
    rcs: string;
    vat: string;
    naf: string;
    publicationDirector: string;
    insurance: { insurer: string; address: string; policy: string; coverage: string };
    mediator: { name: string; address: string; url: string };
    host: { name: string; address: string; url: string };
  };
  sameAs: string[];
  responsePromise: string;
};

export const business: Business = {
  name: "Carreal",
  legalName: "CARREAL SARL",
  tagline: "Carreleur à Annecy depuis 2000",
  description:
    "Artisan carreleur à Annecy depuis 2000 : pose de carrelage sols et murs, intérieur et extérieur, salles de bain, douches à l'italienne, terrasses et grands formats en Haute-Savoie.",
  foundingYear: 2000,
  founder: {
    name: "Xavier Basso",
    role: "Gérant et fondateur",
  },
  phone: {
    display: "06 72 70 49 90",
    e164: "+33672704990",
  },
  /** Ligne fixe vue sur PagesJaunes / Cylex — TODO: confirmer si toujours active. */
  landline: {
    display: "04 50 09 73 16",
    e164: "+33450097316",
  },
  /** TODO: passer à une adresse sur le domaine (contact@carreal.fr) après achat du domaine. */
  email: "carreal.sarl@orange.fr",
  whatsapp: "33672704990",
  address: {
    street: "618 route des Rutys",
    locality: "Pringy",
    postalCode: "74370",
    city: "Annecy",
    region: "Haute-Savoie",
    country: "FR",
  },
  geo: { lat: 45.9402038, lng: 6.1235261 },
  googleMapsUrl: "https://www.google.com/maps?cid=13503728654469347385",
  googleReviewUrl: "https://www.google.com/maps?cid=13503728654469347385",
  hours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], label: "Lundi – vendredi", opens: "07:00", closes: "19:00" },
    { days: ["Saturday"], label: "Samedi", opens: "09:00", closes: "12:30" },
  ],
  legal: {
    form: "SARL",
    capital: "15 000 €",
    siren: "430 255 745",
    siret: "430 255 745 00027",
    rcs: "RCS Annecy 430 255 745",
    vat: "FR81430255745",
    naf: "43.33Z – Travaux de revêtement des sols et des murs",
    publicationDirector: "Xavier Basso",
    /** TODO: nom, adresse et n° de contrat de l'assureur décennale (obligation art. L.132-1 Code de l'artisanat). */
    insurance: {
      insurer: "[Assureur décennale à compléter]",
      address: "[Adresse de l'assureur à compléter]",
      policy: "[N° de contrat à compléter]",
      coverage: "France métropolitaine",
    },
    /** TODO: médiateur de la consommation (ex. via CAPEB / FFB). Obligatoire (art. L.612-1 Code de la consommation). */
    mediator: {
      name: "[Médiateur de la consommation à compléter]",
      address: "[Adresse à compléter]",
      url: "",
    },
    host: {
      name: "Vercel Inc.",
      address: "440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
      url: "https://vercel.com",
    },
  },
  /** Profils externes (sameAs). Ajouter chaque nouvelle fiche créée : Bing Places, Apple Plans, Houzz… */
  sameAs: [
    "https://www.google.com/maps?cid=13503728654469347385",
    "https://www.pagesjaunes.fr/pros/08452817",
    "https://annuaire-entreprises.data.gouv.fr/entreprise/430255745",
  ],
  responsePromise: "Réponse sous 48 h ouvrées",
};

/** Calculé au build (le site est régénéré à chaque publication). */
export const YEARS = new Date().getFullYear() - business.foundingYear;

export const telHref = `tel:${business.phone.e164}`;
export const whatsappHref = (text = "Bonjour, je souhaite un devis pour des travaux de carrelage.") =>
  `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(text)}`;

/** Variantes qui prennent les coordonnées éditées dans Sanity. */
export const tel = (b: Business) => `tel:${b.phone.e164}`;
export const whatsapp = (b: Business, text = "Bonjour, je souhaite un devis pour des travaux de carrelage.") =>
  `https://wa.me/${b.whatsapp}?text=${encodeURIComponent(text)}`;
export const yearsSince = (year: number) => CURRENT_YEAR - year;
const CURRENT_YEAR = new Date().getFullYear();
