import type { Faq } from "./types";

export const faqGroups: { title: string; items: Faq[] }[] = [
  {
    title: "Devis et visite",
    items: [
      { q: "Le devis est-il gratuit ?", a: "Oui. La visite sur place et le devis détaillé sont gratuits dans le bassin annécien." },
      { q: "Sous quel délai répondez-vous ?", a: "Nous rappelons sous 48 h ouvrées après une demande de devis, et proposons une visite généralement sous une à deux semaines." },
      { q: "Puis-je envoyer des photos de mon projet ?", a: "Oui, c'est même très utile : par WhatsApp au 06 72 70 49 90 ou en réponse à notre premier message. Une photo de la pièce et du support nous aide à préparer la visite." },
      { q: "Quelle zone couvrez-vous ?", a: "Annecy et ses communes déléguées, le nord du bassin (Épagny Metz-Tessy, Poisy, Argonay), les deux rives du lac, Rumilly et l'Albanais, Thônes et les Aravis." },
    ],
  },
  {
    title: "Chantier",
    items: [
      { q: "Fournissez-vous le carrelage ?", a: "Les deux sont possibles : nous fournissons le carrelage ou posons celui que vous avez choisi chez un négoce. Nous vérifions les quantités et les lots avant la pose." },
      { q: "Combien de temps dure un chantier ?", a: "De 1 à 2 jours pour une crédence à 1 à 2 semaines pour une salle de bain complète. Le planning précis figure sur le devis." },
      { q: "Le chantier est-il laissé propre ?", a: "Oui : protection des sols et parties communes, nettoyage quotidien et nettoyage de fin de chantier. C'est un point que nos clients soulignent dans leurs avis." },
      { q: "Travaillez-vous avec d'autres artisans ?", a: "Oui, avec des plombiers et électriciens du bassin annécien pour les rénovations de salle de bain. Nous coordonnons les interventions." },
    ],
  },
  {
    title: "Garanties et paiement",
    items: [
      { q: "Êtes-vous assurés ?", a: "Oui, Carreal est couvert par une assurance responsabilité civile décennale pour ses travaux de carrelage. L'attestation est jointe à chaque devis." },
      { q: "Quelles garanties après les travaux ?", a: "Garantie de parfait achèvement (1 an), garantie biennale de bon fonctionnement (2 ans) et garantie décennale (10 ans) pour les ouvrages concernés." },
      { q: "Quelle TVA s'applique ?", a: "En rénovation d'un logement de plus de 2 ans, la TVA est généralement de 10 %. En construction neuve, 20 %." },
    ],
  },
];

export const allFaq = faqGroups.flatMap((g) => g.items);
