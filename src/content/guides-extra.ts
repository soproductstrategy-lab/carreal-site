import type { Guide } from "./types";

/**
 * Guides complémentaires (« Le carnet », lot 2).
 * Prix cohérents avec services.ts (fourchettes indicatives TTC, pose seule, à valider par Carreal).
 * MaPrimeAdapt' : chiffres vérifiés le 19/11/2026 sur le guide Anah « Les aides financières en 2026 »
 * (édition septembre 2026) et la fiche service-public.gouv.fr F37501.
 */
export const guidesExtra: Guide[] = [
  // ---------------------------------------------------------------------------
  // 1. Prix douche à l'italienne
  // ---------------------------------------------------------------------------
  {
    slug: "prix-douche-italienne-annecy",
    title: "Prix d'une douche à l'italienne posée à Annecy (2026)",
    h1: "Combien coûte une douche à l'italienne posée à Annecy en 2026 ?",
    metaDescription:
      "Prix d'une douche à l'italienne posée à Annecy en 2026 : 2 500 à 5 000 € selon receveur, caniveau ou baignoire à remplacer. Ce qui est inclus ou non.",
    lead:
      "À Annecy en 2026, la création d'une douche à l'italienne carrelée coûte en général entre 2 500 et 5 000 € TTC pour la partie carrelage et étanchéité, hors fourniture du carrelage et hors plomberie. Un receveur à carreler avec siphon central se situe plutôt en bas de fourchette ; un caniveau linéaire, un grand format ou le remplacement d'une baignoire tirent le prix vers le haut.",
    category: "Prix",
    published: "2026-11-19",
    updated: "2026-11-19",
    readingMinutes: 6,
    pattern: "grand",
    body: [
      {
        type: "callout",
        tone: "warn",
        title: "Prix indicatifs",
        text: "Fourchettes TTC, pose seule (hors fourniture du carrelage et hors plomberie), constatées sur le bassin annécien en 2026. Elles servent à budgéter ; seul un devis après visite fait foi.",
      },
      { type: "h2", text: "Combien coûte une douche à l'italienne selon la configuration ?" },
      {
        type: "p",
        text: "Le prix dépend d'abord de la façon dont on crée la pente et dont on évacue l'eau. Pour une douche de taille courante, voici les fourchettes que l'on retrouve sur les devis du bassin annécien pour la partie carrelage : préparation, pente, étanchéité, pose et joints.",
      },
      {
        type: "table",
        caption: "Douche à l'italienne : prix de pose indicatifs 2026, TTC, hors fourniture du carrelage et hors plomberie",
        head: ["Configuration", "Prix indicatif", "Pour quel projet"],
        rows: [
          ["Receveur à carreler + siphon central", "2 500 – 3 500 €", "Rénovation, hauteur limitée, plancher bois"],
          ["Forme de pente en mortier sur mesure", "3 000 – 4 500 €", "Grande douche, forme irrégulière, construction neuve"],
          ["Caniveau linéaire + carrelage grand format", "3 500 – 5 000 €", "Pente dans un seul sens, très peu de joints"],
          ["Remplacement d'une baignoire par une douche", "3 000 – 5 000 €", "Dépose de la baignoire et de la faïence, reprise des murs"],
        ],
      },
      {
        type: "p",
        text: "Pour comprendre ce qui se cache derrière chaque ligne (pente, système d'étanchéité SPEC, carrelage R11), lisez notre guide [douche à l'italienne : étapes et étanchéité](/conseils/douche-italienne-etapes-etancheite/).",
      },
      { type: "h2", text: "Qu'est-ce qui est inclus dans le prix, et qu'est-ce qui ne l'est pas ?" },
      {
        type: "table",
        caption: "Postes d'un devis de douche à l'italienne",
        head: ["Poste", "Dans le prix de pose ?", "À vérifier sur le devis"],
        rows: [
          ["Dépose de l'existant (faïence, receveur, baignoire)", "Oui en cas de remplacement", "Évacuation des gravats comprise ou non"],
          ["Receveur à carreler ou forme de pente", "Oui pour la main-d'œuvre", "Le panneau receveur et le caniveau sont parfois chiffrés en fourniture à part"],
          ["Étanchéité sous carrelage (SPEC)", "Oui", "Sol et murs de la zone de douche, bandes d'angle, manchettes"],
          ["Pose du carrelage sol et murs, joints", "Oui", "Joint époxy parfois en option"],
          ["Fourniture du carrelage", "Non", "De 20 à plus de 100 € le m² selon la gamme"],
          ["Plomberie (évacuation, mitigeur, alimentation)", "Non", "Chiffrée par le plombier"],
          ["Paroi vitrée, électricité, ventilation", "Non", "Autres corps de métier"],
        ],
      },
      {
        type: "p",
        text: "Les produits de mise en œuvre (colle, primaire, kit d'étanchéité, joints) sont en général compris dans la prestation du carreleur. Le receveur à carreler, le siphon ou le caniveau linéaire, eux, varient beaucoup selon le modèle : un devis honnête les fait apparaître sur une ligne distincte.",
      },
      { type: "h2", text: "Qu'est-ce qui fait monter le prix ?" },
      {
        type: "ul",
        items: [
          "**La hauteur disponible sous le siphon** : s'il n'y en a pas assez, il faut rehausser le sol de la salle de bain ou choisir un receveur extra-plat. Dans un immeuble, entailler la dalle béton est rarement possible.",
          "**Le plancher** : dans un chalet ou une maison ancienne sur plancher bois, on renforce et on choisit un receveur adapté avant d'étancher.",
          "**La surface murale carrelée** : faïence jusqu'à 2 m ou toute hauteur, niche maçonnée, banc.",
          "**Le format** : la mosaïque et le très grand format demandent plus de temps au m² que le 30×60.",
          "**L'état des murs** : cloisons à remplacer par des plaques hydrofuges, murs hors d'aplomb.",
          "**L'accès** : étage sans ascenseur, Vieille Ville d'Annecy où le stationnement et l'évacuation des gravats prennent du temps.",
        ],
      },
      { type: "h2", text: "Pourquoi la plomberie est-elle chiffrée à part ?" },
      {
        type: "p",
        text: "L'évacuation d'une douche de plain-pied doit avoir une pente suffisante jusqu'à la chute (de l'ordre de 1 à 3 cm par mètre) et un débit adapté au siphon ou au caniveau. Déplacer l'évacuation, poser un mitigeur thermostatique encastré ou reprendre une alimentation relève du plombier. Nous coordonnons son intervention avec la nôtre : le siphon est posé et testé avant l'étanchéité, puis la robinetterie est raccordée après la faïence.",
      },
      { type: "h2", text: "Combien de temps et quelle TVA ?" },
      {
        type: "p",
        text: "Pour un remplacement de baignoire, comptez en général **4 à 7 jours ouvrés** de carrelage (dépose, receveur, étanchéité, faïence, sol, joints), hors délais de plomberie. Dans un logement achevé depuis plus de deux ans, la **TVA à 10 %** s'applique en principe à la pose et aux fournitures facturées par l'artisan. Pour une personne âgée ou en situation de handicap, l'aide MaPrimeAdapt' peut réduire le reste à charge : voir notre guide [douche senior et MaPrimeAdapt'](/conseils/douche-senior-maprimeadapt/).",
      },
      {
        type: "p",
        text: "Pour un chiffrage précis, consultez notre page [douche à l'italienne](/prestations/douche-italienne/) ou, si toute la pièce est à refaire, la page [carrelage de salle de bain](/prestations/salle-de-bain/). Les tarifs au m² des autres poses sont détaillés dans le guide [prix de pose de carrelage au m² à Annecy](/conseils/prix-pose-carrelage-m2-annecy/).",
      },
    ],
    faq: [
      {
        q: "Quel est le prix d'une douche à l'italienne posée à Annecy ?",
        a: "Entre 2 500 et 5 000 € TTC en 2026 pour le carrelage et l'étanchéité, hors fourniture du carrelage et hors plomberie. Le receveur, le caniveau et la surface de faïence font la différence.",
      },
      {
        q: "Un caniveau linéaire coûte-t-il plus cher qu'un siphon central ?",
        a: "Oui, en général : le caniveau lui-même est plus cher et la pente en un seul sens demande une préparation soignée. En contrepartie, il permet de poser un grand format sans découpe en pointe de diamant.",
      },
      {
        q: "Le prix comprend-il le carrelage et la paroi de douche ?",
        a: "Non. Les prix de pose s'entendent hors fourniture du carrelage, hors paroi vitrée et hors plomberie. Le carrelage coûte de 20 à plus de 100 € le m² selon la gamme.",
      },
      {
        q: "Remplacer une baignoire par une douche coûte-t-il plus cher qu'une douche neuve ?",
        a: "Souvent un peu plus, entre 3 000 et 5 000 € pour la partie carrelage, car il faut déposer la baignoire et la faïence, reprendre les murs et parfois le sol avant de créer la douche.",
      },
    ],
    relatedServices: ["douche-italienne", "salle-de-bain", "preparation-support"],
  },

  // ---------------------------------------------------------------------------
  // 2. Douche senior + MaPrimeAdapt'
  // ---------------------------------------------------------------------------
  {
    slug: "douche-senior-maprimeadapt",
    title: "Douche senior et MaPrimeAdapt' : remplacer sa baignoire",
    h1: "Remplacer une baignoire par une douche senior : comment fonctionne MaPrimeAdapt' ?",
    metaDescription:
      "Remplacer sa baignoire par une douche de plain-pied avec MaPrimeAdapt' : qui y a droit, 50 ou 70 % des travaux, démarches avec l'AMO et points techniques.",
    lead:
      "MaPrimeAdapt' est l'aide de l'Anah pour adapter le logement des personnes de 70 ans et plus, de 60 à 69 ans en perte d'autonomie (GIR) ou en situation de handicap, sous conditions de ressources. En 2026, selon l'Anah, elle finance 50 % ou 70 % des travaux selon les revenus, dans la limite de 22 000 € HT de travaux, avec un accompagnateur (AMO) obligatoire et un accord à obtenir avant de commencer.",
    category: "Conseils techniques",
    published: "2026-11-19",
    updated: "2026-11-19",
    readingMinutes: 7,
    pattern: "droit",
    body: [
      { type: "h2", text: "Pourquoi remplacer la baignoire par une douche de plain-pied ?" },
      {
        type: "p",
        text: "Enjamber le rebord d'une baignoire devient difficile, puis risqué, avec l'âge ou après une opération. Une douche de plain-pied, sans marche ni ressaut, permet d'entrer debout, avec une aide ou en fauteuil. C'est l'un des aménagements les plus courants pour rester chez soi, et il figure en tête des travaux cités par l'Anah pour MaPrimeAdapt'.",
      },
      { type: "h2", text: "Qui peut bénéficier de MaPrimeAdapt' ?" },
      {
        type: "p",
        text: "En 2026, selon l'Anah, l'aide s'adresse aux **propriétaires occupants et aux locataires du parc privé** (le locataire informe son bailleur des travaux), pour leur résidence principale, lorsqu'une personne du foyer remplit l'un de ces critères :",
      },
      {
        type: "ul",
        items: [
          "avoir **70 ans ou plus**, sans autre condition d'autonomie ;",
          "avoir **entre 60 et 69 ans** et une perte d'autonomie évaluée par un **GIR** (grille AGGIR) ;",
          "être en situation de **handicap** avec un taux d'incapacité d'au moins 50 % ou bénéficier de la PCH.",
        ],
      },
      {
        type: "p",
        text: "Seuls les ménages aux revenus **modestes** ou **très modestes** au sens du barème de l'Anah sont éligibles. Les plafonds dépendent du revenu fiscal de référence et du nombre de personnes du foyer ; la Haute-Savoie relève du barème « hors Île-de-France ». Le simulateur de france-renov.gouv.fr donne la réponse en quelques minutes.",
      },
      { type: "h2", text: "Combien finance l'aide en 2026 ?" },
      {
        type: "table",
        caption: "MaPrimeAdapt' en 2026 selon l'Anah (guide des aides financières, édition septembre 2026)",
        head: ["Revenus du foyer", "Prise en charge", "Plafond de travaux subventionnables"],
        rows: [
          ["Très modestes", "70 % des travaux", "22 000 € HT"],
          ["Modestes", "50 % des travaux", "22 000 € HT"],
          ["Au-dessus du barème « modestes »", "Non éligible", "—"],
        ],
      },
      {
        type: "p",
        text: "**Exemple de calcul** : pour 8 000 € HT de travaux éligibles, un foyer très modeste peut recevoir 5 600 € (70 %), un foyer modeste 4 000 € (50 %). L'Anah précise que les travaux induits sont éligibles : si remplacer la baignoire oblige à refaire le carrelage, celui-ci est pris en charge dans la limite du plafond. Une avance de 30 % maximum du montant de l'aide peut être demandée avant le début des travaux, sur présentation d'un devis signé prévoyant un acompte.",
      },
      {
        type: "p",
        text: "L'aide se cumule avec l'APA, la PCH et les aides d'autres financeurs (caisses de retraite, collectivités). Si le plafond de 22 000 € n'est pas atteint, une seconde demande reste possible dans les 5 ans, pour le montant restant.",
      },
      { type: "h2", text: "Quelles sont les étapes, du premier contact au versement ?" },
      {
        type: "steps",
        items: [
          { title: "Créer son dossier", text: "En ligne sur france-renov.gouv.fr ou en version papier. Le ménage est orienté vers un assistant à maîtrise d'ouvrage (AMO) habilité de son secteur." },
          { title: "Visite de l'AMO", text: "L'accompagnement est obligatoire. L'AMO réalise à domicile un diagnostic logement autonomie, parfois avec un ergothérapeute, et préconise les travaux. Selon l'Anah, son forfait (600 € TTC, 800 € avec rapport d'ergothérapie) est pris en charge par l'Anah, ou par la collectivité en opération programmée." },
          { title: "Devis des artisans", text: "Vous demandez des devis détaillés : dépose, receveur, étanchéité, carrelage, barres d'appui, plomberie. Les postes séparés facilitent l'instruction du dossier." },
          { title: "Accord de l'Anah", text: "La demande est déposée avec l'AMO. Il faut attendre la décision d'attribution avant de commencer les travaux, sinon l'aide peut être refusée." },
          { title: "Travaux", text: "En général une semaine pour remplacer une baignoire par une douche, plomberie comprise si elle est bien coordonnée." },
          { title: "Versement", text: "Factures à l'appui, l'AMO aide à constituer la demande de solde ; l'Anah verse l'aide." },
        ],
      },
      {
        type: "callout",
        tone: "info",
        title: "Faut-il un artisan labellisé ?",
        text: "MaPrimeAdapt' n'exige pas de label RGE. France Rénov' indique que l'on peut choisir un artisan labellisé (Handibat, par exemple) ou non. Vérifiez surtout l'assurance décennale et la précision du devis.",
      },
      { type: "h2", text: "Une douche senior bien conçue, c'est quoi ?" },
      {
        type: "ul",
        items: [
          "**Zéro ressaut** : le sol de la douche est au niveau de la salle de bain, la pente (1 à 2 %) se fait vers le siphon ou un caniveau linéaire.",
          "**Un carrelage antidérapant R11 ou classe C** (pieds nus mouillés), mat ou structuré. La mosaïque, grâce à ses nombreux joints, adhère bien sous le pied.",
          "**Des barres d'appui fixées dans des renforts** : sur une cloison en plaque de plâtre, on prévoit le renfort avant de poser la faïence. Une barre vissée dans le vide ne tient pas une chute.",
          "**Un siège de douche rabattable**, lui aussi fixé dans un renfort, à hauteur d'assise confortable.",
          "**Un mitigeur thermostatique** (plombier) pour éviter les brûlures, placé à portée depuis le siège.",
          "**Un contraste de couleur** entre sol et murs, qui aide les personnes malvoyantes à se repérer.",
          "Pour un fauteuil roulant : une entrée large et, si possible, un espace de manœuvre de 1,50 m de diamètre, la référence des règles d'accessibilité.",
        ],
      },
      {
        type: "p",
        text: "Sous le carrelage, une douche senior reste une douche à l'italienne : même pente, même étanchéité continue, conformément au DTU 52.2. Les étapes sont détaillées dans notre guide [douche à l'italienne : étapes et étanchéité](/conseils/douche-italienne-etapes-etancheite/) et les fourchettes de prix dans le guide [prix d'une douche à l'italienne à Annecy](/conseils/prix-douche-italienne-annecy/).",
      },
      { type: "h2", text: "À qui s'adresser en Haute-Savoie ?" },
      {
        type: "p",
        text: "Le point d'entrée est le service public France Rénov' (site et numéro national), qui oriente vers un conseiller et un AMO du secteur. Certaines communes ou intercommunalités mènent des opérations programmées d'amélioration de l'habitat : l'accompagnement y est alors financé par la collectivité. Côté travaux, nous réalisons la partie carrelage et étanchéité de la [douche de plain-pied](/prestations/douche-italienne/#pmr) et pouvons fournir un devis détaillé pour votre dossier.",
      },
    ],
    faq: [
      {
        q: "MaPrimeAdapt' peut-elle financer le remplacement d'une baignoire par une douche ?",
        a: "Oui. L'installation d'une douche de plain-pied à la place d'une baignoire figure parmi les travaux cités par l'Anah, tout comme le carrelage antidérapant et les barres d'appui.",
      },
      {
        q: "Quel est le montant de MaPrimeAdapt' en 2026 ?",
        a: "Selon l'Anah, 70 % des travaux pour les foyers très modestes et 50 % pour les foyers modestes, dans la limite de 22 000 € HT de travaux subventionnables.",
      },
      {
        q: "Peut-on commencer les travaux avant l'accord de l'Anah ?",
        a: "Non. Il faut attendre la décision d'attribution de l'aide avant de démarrer, sinon le dossier peut être refusé. Le devis, lui, est établi avant.",
      },
      {
        q: "L'accompagnement par un AMO est-il obligatoire ?",
        a: "Oui, pour un dossier MaPrimeAdapt'. L'AMO réalise le diagnostic du logement, aide à monter le dossier et suit les travaux ; son forfait est pris en charge par l'Anah ou par la collectivité.",
      },
      {
        q: "Quel carrelage pour une douche de personne âgée ?",
        a: "Un carrelage antidérapant R11 ou classe C pour pieds nus, de finition mate ou structurée. Les petits formats et la mosaïque offrent une très bonne adhérence en pente.",
      },
    ],
    relatedServices: ["douche-italienne", "salle-de-bain", "renovation-reparation"],
  },

  // ---------------------------------------------------------------------------
  // 3. Carrelage sur carrelage
  // ---------------------------------------------------------------------------
  {
    slug: "poser-carrelage-sur-carrelage",
    title: "Poser du carrelage sur du carrelage : conditions et limites",
    h1: "Peut-on poser du carrelage sur un ancien carrelage ?",
    metaDescription:
      "Poser du carrelage sur un ancien carrelage : adhérence, planéité, primaire, colle C2, hauteur des portes. Quand c'est possible, quand il vaut mieux déposer.",
    lead:
      "Oui, si l'ancien carrelage est sain, bien adhérent (aucun carreau qui sonne creux) et plan : en pose collée courante, le DTU 52.2 admet un écart de 5 mm au plus sous la règle de 2 m. On le dégraisse, on applique un primaire d'accrochage et on colle avec un mortier-colle amélioré C2. Comptez 1 à 1,5 cm de hauteur en plus, à anticiper pour les portes et les seuils.",
    category: "Conseils techniques",
    published: "2026-11-19",
    updated: "2026-11-19",
    readingMinutes: 6,
    pattern: "decale",
    body: [
      { type: "h2", text: "Quelles conditions doit remplir l'ancien carrelage ?" },
      {
        type: "p",
        text: "Recouvrir un carrelage évite la dépose, la poussière et le bruit, un vrai avantage dans un appartement occupé ou un immeuble du centre d'Annecy. Mais le nouveau revêtement ne sera jamais plus solide que l'ancien : s'il bouge, tout bouge. Avant de chiffrer, nous contrôlons quatre points.",
      },
      {
        type: "steps",
        items: [
          { title: "Adhérence", text: "On sonne chaque carreau au manche de maillet ou de tournevis. Un son plein : le carreau est collé. Un son creux : il est décollé et doit être retiré puis rebouché au mortier. Si les carreaux creux sont nombreux, on dépose tout." },
          { title: "Planéité", text: "Règle de 2 m dans tous les sens. Au-delà de 5 mm d'écart en pose collée courante (moins pour un grand format), on applique un ragréage compatible avec un support carrelé, après primaire." },
          { title: "Propreté", text: "Dégraissage à la lessive alcaline (cuisines surtout), rinçage, séchage. Cire, vernis ou produit d'entretien filmogène empêchent la colle d'accrocher." },
          { title: "Fissures et humidité", text: "Une fissure qui traverse plusieurs carreaux trahit un support qui bouge ; un sol humide en permanence aussi. Dans les deux cas, on traite la cause avant de recouvrir." },
        ],
      },
      { type: "h2", text: "Quel primaire et quelle colle utiliser ?" },
      {
        type: "p",
        text: "Un carreau émaillé est un support **fermé** : il n'absorbe rien, la colle ne peut pas s'y ancrer comme sur une chape. On applique donc un **primaire d'accrochage** spécifique aux supports non poreux (souvent une résine chargée de grains qui crée une surface rugueuse), en respectant son temps de séchage. Sur un émail très brillant, un léger ponçage améliore encore l'accroche.",
      },
      {
        type: "p",
        text: "La colle doit être un **mortier-colle amélioré C2** (classification de la norme NF EN 12004), et **C2 S1 déformable** sur plancher chauffant, en extérieur ou en grand format. Au-delà du 30×30 cm, on travaille en **double encollage** : colle sur le support et au dos du carreau, pour un contact sans vide. Le DTU 52.2 encadre cette pose sur ancien revêtement en rénovation ; c'est elle qui conditionne la garantie.",
      },
      { type: "h2", text: "Que faire pour les portes, les seuils et les plinthes ?" },
      {
        type: "p",
        text: "Un carreau de 8 à 10 mm et sa couche de colle ajoutent en général 1 à 1,5 cm au niveau du sol. Ça paraît peu, mais il faut l'anticiper partout :",
      },
      {
        type: "ul",
        items: [
          "**Portes intérieures** : à détalonner (raboter le bas) pour qu'elles ne frottent pas.",
          "**Porte d'entrée, porte-fenêtre** : vérifier le jeu sous l'ouvrant et le raccord avec le seuil existant.",
          "**Seuils entre pièces** : une barre de seuil ou un profilé de transition rattrape l'écart avec un parquet ou un sol non recouvert.",
          "**Cuisine** : le lave-vaisselle et le réfrigérateur encastrés doivent encore passer sous le plan de travail.",
          "**WC** : la cuvette est déposée puis reposée sur le nouveau sol, raccord d'évacuation à adapter.",
          "**Plinthes** : les anciennes sont déposées et remplacées par des plinthes assorties.",
          "**Escalier** : à éviter. Si la première ou la dernière marche change de hauteur, l'escalier devient irrégulier et dangereux.",
        ],
      },
      { type: "h2", text: "Recouvrir ou déposer : que choisir ?" },
      {
        type: "table",
        caption: "Repères pour décider, prix indicatifs TTC 2026",
        head: ["", "Recouvrir l'ancien carrelage", "Déposer puis reposer"],
        rows: [
          ["Préparation", "Dégraissage, primaire, reprise des carreaux creux", "Dépose 15 – 30 € / m², ragréage éventuel 15 – 35 € / m²"],
          ["Hauteur", "+ 1 à 1,5 cm", "Hauteur d'origine conservée"],
          ["Bruit et poussière", "Faibles", "Importants (burinage)"],
          ["Délai", "Plus court", "1 à 2 jours de plus, plus le séchage"],
          ["Fiabilité", "Dépend entièrement de l'ancienne pose", "Support remis à neuf et contrôlé"],
        ],
      },
      { type: "h2", text: "Dans quels cas vaut-il mieux déposer ?" },
      {
        type: "ul",
        items: [
          "**Dans une douche** : l'étanchéité sous carrelage (SPEC) doit être continue et refaite. On ne la pose pas sur un vieux carrelage dont on ignore l'état dessous. Voir [douche à l'italienne : étapes et étanchéité](/conseils/douche-italienne-etapes-etancheite/).",
          "**Quand l'ancien carrelage sonne creux** sur plus de quelques carreaux, ou que des fissures traversent la pièce : le problème est dans le support. Notre guide [carrelage fissuré ou qui sonne creux](/conseils/carrelage-fissure-ou-qui-sonne-creux/) aide à faire la différence.",
          "**Quand il y a déjà deux couches** : on ne superpose pas indéfiniment, la charge et l'épaisseur deviennent excessives.",
          "**En terrasse** : l'eau et le gel s'infiltrent entre les couches. En Haute-Savoie, on repart d'un support sain (voir [carrelage de terrasse en montagne](/conseils/carrelage-terrasse-montagne-gel/)).",
          "**Quand la hauteur manque** : porte d'entrée impossible à reprendre, raccord avec un parquet ancien.",
        ],
      },
      {
        type: "p",
        text: "Sur **plancher chauffant**, recouvrir reste possible si l'ancien carrelage est parfaitement adhérent et que les joints périphériques existent, avec une colle déformable C2 S1. La surépaisseur ralentit un peu la montée en température. Au mur, la faïence sur faïence suit les mêmes règles : adhérence, propreté, primaire, colle C2. Pour la préparation, voir notre page [chape, ragréage et étanchéité](/prestations/preparation-support/) ; pour la pose elle-même, [carrelage au sol](/prestations/pose-carrelage-sol/).",
      },
    ],
    faq: [
      {
        q: "Peut-on poser du carrelage sur du carrelage sans primaire ?",
        a: "Non, ce n'est pas recommandé. Le carreau émaillé n'absorbe pas la colle ; un primaire d'accrochage pour support non poreux est nécessaire pour une adhérence durable.",
      },
      {
        q: "Quelle colle pour poser du carrelage sur du carrelage ?",
        a: "Un mortier-colle amélioré C2, et C2 S1 déformable sur plancher chauffant, en extérieur ou pour un grand format, appliqué en double encollage au-delà du 30×30 cm.",
      },
      {
        q: "Combien de hauteur ajoute un carrelage sur un ancien carrelage ?",
        a: "En général 1 à 1,5 cm, colle comprise. Il faut détalonner les portes et prévoir des seuils de transition.",
      },
      {
        q: "Peut-on recouvrir le carrelage d'une douche à l'italienne ?",
        a: "Ce n'est pas une bonne idée. En zone de douche, il faut refaire une étanchéité continue sous le carrelage, ce qui suppose de déposer l'ancien revêtement.",
      },
    ],
    relatedServices: ["pose-carrelage-sol", "preparation-support", "salle-de-bain"],
  },

  // ---------------------------------------------------------------------------
  // 4. Joints noircis
  // ---------------------------------------------------------------------------
  {
    slug: "joints-carrelage-noircis-douche",
    title: "Joints de carrelage noircis dans la douche : causes et solutions",
    h1: "Pourquoi les joints de ma douche noircissent-ils, et que faire ?",
    metaDescription:
      "Joints de douche noircis : moisissures, joint ciment poreux, ventilation. Comment nettoyer, quand refaire les joints en époxy et quand suspecter une fuite.",
    lead:
      "Des joints de douche qui noircissent sont presque toujours colonisés par des moisissures : le joint ciment est poreux, reste humide et la pièce sèche mal. Un nettoyage suffit tant que le noir reste en surface ; s'il est incrusté, on dégarnit les joints sur au moins les deux tiers de leur profondeur et on les refait, idéalement en joint époxy, imperméable. Des joints qui restent noirs et humides en pied de paroi peuvent signaler de l'eau derrière le carrelage.",
    category: "Problèmes & réparations",
    published: "2026-11-19",
    updated: "2026-11-19",
    readingMinutes: 6,
    pattern: "mosaique",
    body: [
      { type: "h2", text: "D'où vient le noir sur les joints de douche ?" },
      {
        type: "p",
        text: "Un joint ciment classique est un mortier fin : il absorbe l'eau comme une éponge très lente. S'il ne sèche jamais complètement entre deux douches, des moisissures s'y installent, nourries par les résidus de savon. Dans une salle de bain aveugle, fréquente dans les appartements anciens, ou avec une ventilation encrassée, c'est quasi inévitable. Selon les communes du bassin annécien, l'eau peut aussi être calcaire : le dépôt rend la surface rugueuse et retient la saleté.",
      },
      {
        type: "table",
        caption: "Diagnostiquer des joints noircis",
        head: ["Cause", "Comment la reconnaître", "Solution"],
        rows: [
          ["Moisissures en surface", "Points noirs qui partent en partie à la brosse", "Nettoyage, séchage, ventilation"],
          ["Joint ciment usé ou poreux", "Noir en profondeur, joint friable ou creusé", "Rejointoiement, idéalement époxy"],
          ["Ventilation insuffisante", "Buée persistante, taches au plafond", "Nettoyer ou faire vérifier la VMC, aérer"],
          ["Calcaire et savon", "Voile gris ou blanchâtre qui retient la saleté", "Nettoyage doux régulier, raclette"],
          ["Silicone noirci", "Angles, bas des parois, contour du receveur", "Remplacer le mastic : il ne se nettoie pas en profondeur"],
          ["Eau derrière le carrelage", "Joints humides en permanence, carreaux qui sonnent creux", "Diagnostic de l'étanchéité"],
        ],
      },
      { type: "h2", text: "Comment nettoyer des joints noircis sans les abîmer ?" },
      {
        type: "steps",
        items: [
          { title: "Brosser", text: "Brosse à dents ou brosse à joints à poils synthétiques et nettoyant ménager neutre. Jamais de brosse métallique : elle creuse le joint et raye l'émail." },
          { title: "Traiter les moisissures", text: "Produit anti-moisissure ou eau de Javel diluée, en aérant. Ne jamais mélanger la Javel avec un produit acide ou ammoniaqué." },
          { title: "Rincer et sécher", text: "Rinçage à l'eau claire, puis séchage avec une raclette et un chiffon. Un joint qui sèche vite noircit moins." },
          { title: "Éviter les acides répétés", text: "Le vinaigre pur et les anticalcaires acides attaquent le ciment du joint : à réserver ponctuellement au calcaire sur l'émail, puis rincer." },
        ],
      },
      {
        type: "p",
        text: "Si le noir revient en quelques semaines ou ne part plus du tout, il est dans la masse du joint : aucun produit ne le fera disparaître durablement.",
      },
      { type: "h2", text: "Quand et comment refaire les joints ?" },
      {
        type: "steps",
        items: [
          { title: "Dégarnir", text: "Retirer l'ancien joint sur au moins les deux tiers de sa profondeur, avec un outil adapté, sans ébrécher les arêtes des carreaux." },
          { title: "Dépoussiérer et laisser sécher", text: "Aspirer, nettoyer, puis laisser le support sécher : un joint neuf posé sur un fond humide noircit à nouveau." },
          { title: "Rejointoyer", text: "Joint ciment ou époxy, serré dans toute l'épaisseur, puis lissé et nettoyé dans le temps ouvert du produit." },
          { title: "Refaire les silicones", text: "Angles, pied de paroi, contour du receveur et de la robinetterie : mastic silicone sanitaire neuf, sur support propre et sec." },
          { title: "Respecter le séchage", text: "Pas de douche avant le délai indiqué par le fabricant du joint." },
        ],
      },
      { type: "h2", text: "Joint ciment ou joint époxy ?" },
      {
        type: "table",
        caption: "Comparatif pour une zone de douche",
        head: ["Critère", "Joint ciment", "Joint époxy"],
        rows: [
          ["Absorption d'eau", "Poreux, même hydrofugé", "Imperméable"],
          ["Noircissement", "Fréquent en zone humide", "Rare, se nettoie en surface"],
          ["Résistance aux produits", "Sensible aux acides", "Très bonne"],
          ["Mise en œuvre", "Simple", "Technique : temps ouvert court, nettoyage immédiat"],
          ["Coût", "Moins cher", "Plus cher (produit et temps de pose)"],
        ],
      },
      {
        type: "p",
        text: "En zone de douche, nous recommandons l'époxy : il ne retient ni l'eau ni les moisissures. Mais attention, même époxy, **le joint n'est pas l'étanchéité**. Ce rôle revient au système posé sous le carrelage, comme expliqué dans notre guide [douche à l'italienne : étapes et étanchéité](/conseils/douche-italienne-etapes-etancheite/).",
      },
      { type: "h2", text: "Quand des joints noirs signalent-ils un problème d'étanchéité ?" },
      {
        type: "p",
        text: "Le noircissement est un problème d'entretien dans la grande majorité des cas. Il devient un symptôme quand il s'accompagne d'autres signes :",
      },
      {
        type: "ul",
        items: [
          "joints noirs et **humides en permanence** en pied de paroi, même après une journée sans douche ;",
          "joints qui **se creusent ou s'effritent** rapidement après réfection ;",
          "carreaux qui **sonnent creux** ou bougent dans la zone de douche ;",
          "silicone qui se décolle, cloison qui gonfle ou peinture qui cloque de l'autre côté du mur ;",
          "auréole au plafond du voisin du dessous, odeur de moisi persistante.",
        ],
      },
      {
        type: "callout",
        tone: "warn",
        title: "Refaire les joints ne stoppe pas une fuite",
        text: "Si l'eau passe derrière le carrelage, c'est que l'étanchéité est absente ou rompue. Il faut déposer la zone concernée et reprendre l'étanchéité ; de nouveaux joints ne feraient que masquer le problème quelques mois.",
      },
      {
        type: "p",
        text: "Nous intervenons pour le diagnostic, la réfection des joints et la reprise d'étanchéité : voir [réparation de carrelage et joints](/prestations/renovation-reparation/) et, si la douche est à refaire, [douche à l'italienne](/prestations/douche-italienne/).",
      },
    ],
    faq: [
      {
        q: "Pourquoi les joints de douche deviennent-ils noirs ?",
        a: "À cause de moisissures qui se développent dans le joint ciment, poreux, quand il reste humide. Une mauvaise ventilation et les résidus de savon accélèrent le phénomène.",
      },
      {
        q: "Peut-on blanchir des joints noircis ?",
        a: "Oui si le noir est en surface : brosse souple et produit anti-moisissure ou Javel diluée. S'il est incrusté dans la masse, seul un rejointoiement règle le problème.",
      },
      {
        q: "Faut-il refaire les joints en époxy ?",
        a: "En zone de douche, c'est la meilleure option : l'époxy est imperméable et ne noircit pratiquement pas. Il est plus cher et plus technique à poser qu'un joint ciment.",
      },
      {
        q: "Des joints noirs peuvent-ils indiquer une fuite ?",
        a: "Parfois. S'ils restent humides en permanence en bas de paroi, avec des carreaux qui sonnent creux ou des traces de l'autre côté du mur, l'étanchéité sous carrelage est à vérifier.",
      },
    ],
    relatedServices: ["renovation-reparation", "douche-italienne", "salle-de-bain"],
  },

  // ---------------------------------------------------------------------------
  // 5. Carrelage fissuré ou qui sonne creux
  // ---------------------------------------------------------------------------
  {
    slug: "carrelage-fissure-ou-qui-sonne-creux",
    title: "Carrelage fissuré ou qui sonne creux : causes et réparation",
    h1: "Carrelage fissuré ou qui sonne creux : est-ce grave et comment réparer ?",
    metaDescription:
      "Carreau fendu, fissure qui traverse le sol, carrelage qui sonne creux : causes, gravité, remplacement d'un carreau, injection et garanties qui s'appliquent.",
    lead:
      "Un carreau fêlé isolé vient souvent d'un choc et se remplace à l'unité ; une fissure qui traverse plusieurs carreaux en ligne trahit un mouvement du support. Un carrelage qui sonne creux a perdu tout ou partie de son collage : sans fissure ni mouvement, on surveille ; s'il s'étend ou se soulève, il faut reposer les carreaux concernés. La première année après réception, la garantie de parfait achèvement couvre les désordres signalés.",
    category: "Problèmes & réparations",
    published: "2026-11-19",
    updated: "2026-11-19",
    readingMinutes: 7,
    pattern: "batons",
    body: [
      { type: "h2", text: "Fissure, décollement ou support : comment faire la différence ?" },
      {
        type: "p",
        text: "La forme du désordre dit presque toujours d'où il vient. Avant de remplacer quoi que ce soit, il faut savoir si le problème est dans le carreau, dans la colle ou dans le support, sinon la réparation casse à nouveau.",
      },
      {
        type: "table",
        caption: "Lire les symptômes",
        head: ["Symptôme", "Cause probable", "Gravité", "Réparation"],
        rows: [
          ["Un carreau fêlé, souvent en étoile", "Choc (chute d'objet lourd)", "Faible", "Remplacement du carreau"],
          ["Fissure rectiligne qui traverse carreaux et joints", "Fissure de la dalle ou de la chape, plancher qui fléchit, joint de fractionnement absent", "À diagnostiquer", "Traiter le support (joint, désolidarisation), puis reposer"],
          ["Son creux localisé, carreaux stables", "Encollage partiel (simple encollage sur grand format, colle trop sèche)", "Modérée", "Surveiller, injection ou repose"],
          ["Son creux étendu, joints qui sautent, carreaux qui bougent", "Décollement en cours", "Sérieuse", "Dépose et repose de la zone"],
          ["Carreaux soulevés en « toit »", "Dilatation bloquée : pas de joint périphérique, chauffage au sol, soleil", "Urgente (chute, éclats)", "Repose avec joints périphériques et de fractionnement"],
          ["Fines craquelures dans l'émail", "Tressaillage de l'émail (faïence)", "Esthétique", "Remplacement si gênant"],
        ],
      },
      {
        type: "p",
        text: "En Haute-Savoie, deux situations reviennent souvent : les **planchers bois** de chalets ou de maisons anciennes, qui fléchissent et fissurent un carrelage posé sans désolidarisation, et les **terrasses** où l'eau piégée sous les carreaux gèle et les décolle (voir [carrelage de terrasse en montagne](/conseils/carrelage-terrasse-montagne-gel/)).",
      },
      { type: "h2", text: "Comment vérifier un carrelage qui sonne creux ?" },
      {
        type: "steps",
        items: [
          { title: "Sonner", text: "Tapoter chaque carreau avec le manche d'un tournevis ou un petit maillet, en comparant avec un carreau voisin au son plein." },
          { title: "Repérer", text: "Marquer les carreaux creux au crayon ou au ruban adhésif et prendre une photo datée." },
          { title: "Surveiller", text: "Refaire le test quelques semaines plus tard : une zone qui s'étend ou des joints qui se fissurent indiquent un décollement actif." },
          { title: "Chercher la cause", text: "Chauffage au sol, eau (salle de bain, terrasse), forte exposition au soleil derrière une baie : ce sont les déclencheurs les plus fréquents." },
        ],
      },
      {
        type: "p",
        text: "Un carreau qui sonne creux sur un coin, sans bouger ni fissurer, n'est pas une urgence. Au DTU 52.2, la pose collée vise un contact complet entre colle et carreau ; un son creux révèle un défaut d'encollage, mais pas toujours un risque immédiat.",
      },
      { type: "h2", text: "Comment remplacer un carreau fissuré ?" },
      {
        type: "steps",
        items: [
          { title: "Trouver le carreau de remplacement", text: "Idéalement un carreau du même lot, gardé en réserve. Sinon, une référence équivalente cherchée auprès des négoces." },
          { title: "Dégarnir les joints", text: "Retirer le joint autour du carreau, sans toucher aux arêtes des voisins." },
          { title: "Retirer le carreau", text: "Le fractionner depuis le centre et extraire les morceaux vers l'intérieur, pour ne pas transmettre de choc aux carreaux adjacents." },
          { title: "Nettoyer le support", text: "Gratter l'ancienne colle pour retrouver l'épaisseur disponible ; c'est l'étape qui conditionne l'affleurement." },
          { title: "Recoller", text: "Double encollage, carreau calé exactement au niveau de ses voisins." },
          { title: "Rejointoyer", text: "Joint de même teinte, après le séchage de la colle." },
        ],
      },
      { type: "h2", text: "L'injection, pour quels cas ?" },
      {
        type: "p",
        text: "L'injection consiste à faire pénétrer une résine ou un mortier fluide sous les carreaux creux, par de petits perçages dans les joints, pour combler le vide. Elle évite la dépose et convient à des **creux localisés, en intérieur, sur des carreaux stables et non fissurés**. Elle ne règle rien si le support bouge, si la cause est une dilatation bloquée ou si de l'eau circule sous le carrelage (douche, terrasse) : là, il faut déposer et reposer.",
      },
      { type: "h2", text: "La réparation est-elle couverte par une garantie ?" },
      {
        type: "table",
        caption: "Garanties des travaux de carrelage (Code civil)",
        head: ["Garantie", "Durée après réception", "Ce qu'elle couvre en pratique"],
        rows: [
          ["Parfait achèvement", "1 an", "Tous les désordres signalés à la réception ou notifiés pendant l'année : carreau fissuré, son creux, joints"],
          ["Biennale (bon fonctionnement)", "2 ans", "Les équipements dissociables ; un carrelage collé y est rarement rattaché"],
          ["Décennale", "10 ans", "Les désordres qui compromettent la solidité ou rendent l'ouvrage impropre à sa destination : décollement généralisé, carreaux soulevés dangereux, douche qui laisse passer l'eau"],
        ],
      },
      {
        type: "p",
        text: "Un carreau fêlé isolé relève rarement de la décennale ; hors parfait achèvement, il peut engager la responsabilité contractuelle de l'entreprise si une faute de pose est démontrée. Un choc ou un mauvais usage n'est couvert par aucune garantie. Les tribunaux apprécient au cas par cas.",
      },
      {
        type: "callout",
        tone: "info",
        title: "Les bons réflexes",
        text: "Photographiez le désordre avec la date, retrouvez la facture et l'attestation d'assurance décennale de l'artisan, puis signalez-le par lettre recommandée avec accusé de réception. Gardez toujours quelques carreaux de réserve après un chantier.",
      },
      {
        type: "p",
        text: "Pour un diagnostic sur place et une réparation, voir notre page [réparation de carrelage et joints](/prestations/renovation-reparation/). Si le support est en cause, la reprise passe par [chape, ragréage et désolidarisation](/prestations/preparation-support/).",
      },
    ],
    faq: [
      {
        q: "Un carrelage qui sonne creux est-il grave ?",
        a: "Pas toujours. Un son creux localisé sur des carreaux stables peut rester sans suite ; s'il s'étend, si les joints se fissurent ou si les carreaux bougent, il faut reposer la zone.",
      },
      {
        q: "Peut-on remplacer un seul carreau fissuré ?",
        a: "Oui : on dégarnit les joints, on retire le carreau par morceaux sans abîmer les voisins, on nettoie la colle et on recolle un carreau identique, idéalement du même lot.",
      },
      {
        q: "Pourquoi une fissure traverse-t-elle plusieurs carreaux ?",
        a: "Parce que le support a bougé : fissure de dalle ou de chape, plancher qui fléchit, absence de joint de fractionnement. Remplacer les carreaux sans traiter le support ne tient pas.",
      },
      {
        q: "La garantie décennale couvre-t-elle un carrelage fissuré ?",
        a: "Seulement si le désordre compromet la solidité ou rend l'ouvrage impropre à sa destination, comme un décollement généralisé. Un carreau fêlé isolé relève plutôt de la garantie de parfait achèvement la première année.",
      },
    ],
    relatedServices: ["renovation-reparation", "preparation-support", "pose-carrelage-sol"],
  },

  // ---------------------------------------------------------------------------
  // 6. Format et type de pose
  // ---------------------------------------------------------------------------
  {
    slug: "choisir-format-et-type-de-pose",
    title: "Format de carrelage et type de pose : bien choisir (2026)",
    h1: "Quel format de carrelage et quel type de pose choisir ?",
    metaDescription:
      "60×60, 60×120 ou 120×120 ; pose droite, décalée, chevron, bâtons rompus ou opus : comment choisir, pourquoi décaler au tiers et l'impact sur le prix de pose.",
    lead:
      "Le format et le motif de pose se choisissent ensemble. Un 60×60 en pose droite est la solution la plus simple, autour de 45 à 75 € TTC le m² de pose à Annecy ; un 60×120 ou plus exige un support très plan et, s'il est rectangulaire, un décalage limité au tiers. Chevron, bâtons rompus et opus demandent plus de coupes et de chutes (souvent 10 à 15 % contre 5 à 10 % en pose droite), donc plus de temps.",
    category: "Conseils techniques",
    published: "2026-11-19",
    updated: "2026-11-19",
    readingMinutes: 7,
    pattern: "chevron",
    body: [
      { type: "h2", text: "Quel format de carrelage pour quel usage ?" },
      {
        type: "p",
        text: "Plus le carreau est grand, moins il y a de joints, mais plus le support doit être parfait : un carreau de 1,20 m révèle le moindre creux. À l'inverse, les petits formats suivent les pentes et pardonnent davantage, au prix d'un jointoiement plus long.",
      },
      {
        type: "table",
        caption: "Formats courants, exigences et prix de pose indicatifs 2026 (TTC, hors fourniture)",
        head: ["Format", "Usages", "Exigence de support", "Prix de pose"],
        rows: [
          ["Mosaïque, petits formats (métro 7,5×15, 10×10)", "Douches, murs, niches, pentes", "Plan et propre, jointoiement minutieux", "80 – 140 € / m² (mosaïque)"],
          ["Formats moyens (30×60, 45×45, 60×60)", "Sols de toutes les pièces", "5 mm sous la règle de 2 m (DTU 52.2)", "45 – 75 € / m²"],
          ["Grands formats (60×120, lames 20×120)", "Séjours, effet bois ou pierre", "Plus stricte, double encollage", "60 – 120 € / m²"],
          ["Très grands formats (120×120 à 120×280)", "Sols continus, murs, plans", "Nous visons 3 mm sous la règle de 2 m, manutention à deux", "60 – 120 € / m²"],
        ],
      },
      {
        type: "callout",
        tone: "warn",
        title: "Prix indicatifs",
        text: "Fourchettes TTC, pose seule, hors fourniture du carrelage, constatées sur le bassin annécien en 2026. Les poses complexes (chevron, bâtons rompus, opus) sont chiffrées sur devis ; seul un devis après visite fait foi.",
      },
      { type: "h2", text: "Quels sont les principaux types de pose ?" },
      {
        type: "table",
        caption: "Types de pose : rendu et contraintes",
        head: ["Pose", "Rendu", "Contraintes", "Chutes à prévoir"],
        rows: [
          ["Droite (joints alignés)", "Sobre, contemporain", "Alignement parfait des joints dans les deux sens", "5 – 10 %"],
          ["Décalée 1/2", "Classique, effet brique", "À éviter pour les rectangulaires longs (tuilage)", "5 – 10 %"],
          ["Décalée 1/3", "Plus dynamique", "Recommandée dès 60 cm de long", "5 – 10 %"],
          ["Diagonale", "Agrandit, masque les murs de travers", "Coupes en biais sur tout le pourtour", "10 – 15 %"],
          ["Chevron", "Élégant, directionnel", "Lames à extrémités coupées en biais, axe central à tracer", "10 – 15 %"],
          ["Bâtons rompus", "Parquet ancien, chaleureux", "Lames à angle droit, alignement rigoureux des axes", "10 – 15 %"],
          ["Opus romain", "Aspect ancien, pierre", "Modules de 4 à 6 tailles à répartir sans répétition visible", "Selon calepinage"],
        ],
      },
      { type: "h2", text: "Pourquoi décaler un grand carreau rectangulaire d'un tiers au maximum ?" },
      {
        type: "p",
        text: "Un carreau de grès cérame n'est jamais parfaitement plat : la cuisson lui donne une légère courbure dans la longueur, appelée **tuilage**, tolérée par les normes de fabrication. Sur un 30×60, elle est imperceptible ; sur un 60×120, elle se mesure. En décalage d'une demi-longueur, le milieu légèrement bombé d'un carreau se retrouve face à l'extrémité de son voisin : on obtient un **désaffleur** qui accroche le pied et se voit à la lumière rasante d'une baie vitrée.",
      },
      {
        type: "p",
        text: "C'est pourquoi les fabricants recommandent en général, pour les formats rectangulaires longs, un **décalage d'un tiers au plus** (parfois moins : vérifiez la fiche technique). Les systèmes de nivellement aident à aligner les arêtes, mais ne corrigent pas une courbure. Si vous tenez à l'effet « coupe de pierre » à mi-longueur, choisissez un format plus court.",
      },
      { type: "h2", text: "Le calepinage : l'étape qui fait le rendu" },
      {
        type: "steps",
        items: [
          { title: "Choisir l'axe", text: "La ligne de vue depuis l'entrée ou la baie principale, ou l'axe d'un couloir en enfilade." },
          { title: "Équilibrer les coupes", text: "Centrer le motif pour obtenir des coupes égales de part et d'autre et éviter les fines bandes de quelques centimètres contre un mur." },
          { title: "Caler sur les points visibles", text: "Seuils, îlot de cuisine, receveur de douche, cheminée : les joints tombent dans l'alignement, pas au hasard." },
          { title: "Placer les joints de mouvement", text: "Joint périphérique sous la plinthe et joints de fractionnement : en intérieur, le DTU 52.2 en prévoit notamment pour les grandes surfaces (de l'ordre de 40 m² ou 8 m de long) et au droit des joints du support." },
          { title: "Valider ensemble", text: "Un plan coté avant la première colle, surtout pour un chevron ou un opus." },
        ],
      },
      {
        type: "p",
        text: "Dans les appartements anciens d'Annecy, les murs sont rarement d'équerre : une pose diagonale ou un calepinage centré masque mieux les écarts qu'une pose droite alignée sur un mur en biais. Dans un chalet, les lames effet bois en bâtons rompus ou à l'anglaise décalée au tiers prolongent bien l'esprit du lieu.",
      },
      { type: "h2", text: "Quelle largeur de joint prévoir ?" },
      {
        type: "p",
        text: "Pour un grès cérame **rectifié** (bords usinés), un joint de **2 à 3 mm** est le plus courant. Un carreau non rectifié, une pierre ou une pose extérieure demandent un joint plus large, de **4 à 8 mm**. La pose sans joint n'est pas admise : le joint absorbe les tolérances de fabrication et les mouvements du sol.",
      },
      { type: "h2", text: "Comment le format et la pose changent-ils le prix ?" },
      {
        type: "p",
        text: "La pose droite ou décalée d'un format moyen sert de base : 45 à 75 € TTC le m² hors fourniture. Le grand format monte à 60 à 120 € pour la préparation, le double encollage et la manutention. Diagonale, chevron, bâtons rompus et opus multiplient les coupes : ils se situent en haut de fourchette, voire au-delà, et il faut commander davantage de carrelage. Le détail est dans notre guide [prix de pose de carrelage au m² à Annecy](/conseils/prix-pose-carrelage-m2-annecy/), et nos pages [carrelage au sol](/prestations/pose-carrelage-sol/) et [carrelage grand format](/prestations/grand-format/) décrivent notre méthode.",
      },
    ],
    faq: [
      {
        q: "Quel format de carrelage choisir pour une petite pièce ?",
        a: "Un format moyen ou grand, posé droit avec peu de joints, agrandit visuellement l'espace. Il faut simplement anticiper les coupes et l'accès pour la manutention.",
      },
      {
        q: "Peut-on décaler un carrelage 60×120 à moitié ?",
        a: "C'est déconseillé : le léger tuilage des carreaux longs crée un désaffleur au centre. Les fabricants recommandent en général un décalage d'un tiers au maximum.",
      },
      {
        q: "Quelle différence entre chevron et bâtons rompus ?",
        a: "En chevron, les lames ont des extrémités coupées en biais et forment une pointe continue ; en bâtons rompus, les lames rectangulaires se croisent à angle droit, comme un parquet ancien.",
      },
      {
        q: "Combien de carrelage en plus faut-il commander ?",
        a: "En général 5 à 10 % pour une pose droite ou décalée, 10 à 15 % pour une diagonale, un chevron ou des bâtons rompus. Gardez quelques carreaux en réserve pour les réparations.",
      },
      {
        q: "Quelle planéité pour poser du grand format ?",
        a: "Plus stricte que pour un format courant : nous visons 3 mm sous la règle de 2 m pour le grand format, contre 5 mm admis en pose collée courante. Un ragréage est souvent nécessaire.",
      },
    ],
    relatedServices: ["pose-carrelage-sol", "grand-format", "pierre-naturelle"],
  },
];
