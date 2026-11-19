import type { Review } from "./types";

/**
 * Avis Google (relevés le 19/11/2026 sur la fiche Google Business Profile « Carréal »).
 * Affichage : prénom + initiale, date de l'expérience (obligation L.111-7-2 / D.111-17 Code conso).
 * PAS de balisage aggregateRating : Google interdit les avis « auto-publiés » sur sa propre fiche.
 * TODO : remplacer par un flux synchronisé (Places API) ou mettre à jour à chaque nouvel avis.
 */
export const reviews: Review[] = [
  {
    author: "Dominique B.",
    date: "2025-07",
    dateLabel: "juillet 2025",
    rating: 5,
    text: "Entreprise de très grande qualité tant au niveau du conseil, des délais, de l'exécution, du suivi de chantier, de la minutie des ouvriers (comme du patron) et de la propreté ! Rien à redire ! Nous sommes entièrement satisfaits et recommandons vivement à tous ceux qui aiment la rigueur et le travail soigné. Ce fut pour nous une agréable découverte ! Le prix, certes un peu élevé, est justifié par la qualité du service rendu.",
    highlight: "Le prix, certes un peu élevé, est justifié par la qualité du service rendu.",
    source: "Google",
  },
  {
    author: "Anne C.",
    date: "2024-05",
    dateLabel: "mai 2024",
    rating: 5,
    text: "Travaux et suivi de qualité. Excellente communication très bon professionnel. Je recommande les yeux fermés.",
    source: "Google",
  },
  {
    author: "Jonathan R.",
    date: "2021-02",
    dateLabel: "février 2021",
    rating: 5,
    text: "Excellent travail .",
    source: "Google",
  },
  {
    author: "Gwen S.",
    date: "2018",
    dateLabel: "2018",
    rating: 5,
    text: "Suivi des travaux, qualité d'exécution et de finition irréprochable. Les travaux on été réalisés dans les délais convenus. les 2 carreleurs intervenant sur le chantier on fait preuve d'une délicatesse et d'un sens de l'écoute rare. Entreprise à conseiller !!!",
    source: "Google",
  },
];

export const reviewStats = {
  average: 5,
  count: reviews.length,
  checkedOn: "19 novembre 2026",
};

export const reviewNotice =
  "Avis publiés par les clients sur Google, reproduits sans modification ni sélection par Carreal. Google ne vérifie pas systématiquement que l'auteur a fait appel à l'entreprise. Date indiquée : date de l'expérience.";
