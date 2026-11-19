import { defineArrayMember, defineField, defineType } from "sanity";

const sectionText = (name: string, title: string, withIntro = true) =>
  defineField({
    name,
    title,
    type: "object",
    options: { collapsible: true, collapsed: true },
    fields: [
      defineField({ name: "title", title: "Titre", type: "string" }),
      ...(withIntro ? [defineField({ name: "intro", title: "Introduction", type: "text", rows: 3 })] : []),
    ],
  });

const pageHeader = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "object",
    options: { collapsible: true, collapsed: true },
    fields: [
      defineField({ name: "title", title: "Titre (H1)", type: "string" }),
      defineField({ name: "lead", title: "Introduction", type: "text", rows: 3 }),
    ],
  });

const seo = defineField({
  name: "seo",
  title: "Référencement Google",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: "title", title: "Titre Google", type: "string", validation: (r) => r.max(70).warning("Trop long") }),
    defineField({ name: "description", title: "Description Google", type: "text", rows: 2, validation: (r) => r.max(170).warning("Trop longue") }),
  ],
});


/** Coordonnées, horaires et mentions légales : alimente le pied de page, les données Google et les mentions légales. */
export const settings = defineType({
  name: "settings",
  title: "Entreprise & coordonnées",
  type: "document",
  groups: [
    { name: "identite", title: "Identité", default: true },
    { name: "contact", title: "Contact & horaires" },
    { name: "legal", title: "Mentions légales" },
    { name: "web", title: "Profils en ligne" },
  ],
  fields: [
    defineField({ name: "name", title: "Nom commercial", type: "string", group: "identite" }),
    defineField({ name: "legalName", title: "Raison sociale", type: "string", group: "identite" }),
    defineField({ name: "tagline", title: "Accroche", type: "string", group: "identite" }),
    defineField({ name: "description", title: "Description courte (Google, réseaux)", type: "text", rows: 3, group: "identite" }),
    defineField({ name: "foundingYear", title: "Année de création", type: "number", group: "identite" }),
    defineField({ name: "founderName", title: "Dirigeant", type: "string", group: "identite" }),
    defineField({ name: "founderRole", title: "Fonction du dirigeant", type: "string", group: "identite" }),
    defineField({ name: "responsePromise", title: "Engagement de réponse", type: "string", group: "contact", description: "Ex. : Réponse sous 48 h ouvrées" }),
    defineField({ name: "phoneDisplay", title: "Téléphone (affiché)", type: "string", group: "contact", description: "Doit être identique à la fiche Google." }),
    defineField({ name: "phoneE164", title: "Téléphone (format international)", type: "string", group: "contact", description: "Ex. : +33672704990" }),
    defineField({ name: "landlineDisplay", title: "Téléphone fixe (affiché)", type: "string", group: "contact" }),
    defineField({ name: "email", title: "E-mail", type: "string", group: "contact" }),
    defineField({ name: "whatsapp", title: "Numéro WhatsApp", type: "string", group: "contact", description: "Format : 33672704990 (sans + ni espaces)" }),
    defineField({
      name: "address",
      title: "Adresse",
      type: "object",
      group: "contact",
      fields: [
        defineField({ name: "street", title: "Rue", type: "string" }),
        defineField({ name: "locality", title: "Commune déléguée / lieu-dit", type: "string" }),
        defineField({ name: "postalCode", title: "Code postal", type: "string" }),
        defineField({ name: "city", title: "Ville", type: "string" }),
      ],
    }),
    defineField({
      name: "hours",
      title: "Horaires",
      type: "array",
      group: "contact",
      of: [
        defineArrayMember({
          type: "object",
          name: "hoursRow",
          fields: [
            defineField({ name: "label", title: "Libellé", type: "string", description: "Ex. : Lundi – vendredi" }),
            defineField({
              name: "days",
              title: "Jours",
              type: "array",
              of: [{ type: "string" }],
              options: {
                list: [
                  { title: "Lundi", value: "Monday" },
                  { title: "Mardi", value: "Tuesday" },
                  { title: "Mercredi", value: "Wednesday" },
                  { title: "Jeudi", value: "Thursday" },
                  { title: "Vendredi", value: "Friday" },
                  { title: "Samedi", value: "Saturday" },
                  { title: "Dimanche", value: "Sunday" },
                ],
              },
            }),
            defineField({ name: "opens", title: "Ouverture (HH:MM)", type: "string" }),
            defineField({ name: "closes", title: "Fermeture (HH:MM)", type: "string" }),
          ],
          preview: { select: { title: "label", o: "opens", c: "closes" }, prepare: ({ title, o, c }) => ({ title, subtitle: `${o} – ${c}` }) },
        }),
      ],
    }),
    defineField({ name: "legalForm", title: "Forme juridique", type: "string", group: "legal" }),
    defineField({ name: "capital", title: "Capital social", type: "string", group: "legal" }),
    defineField({ name: "siren", title: "SIREN", type: "string", group: "legal" }),
    defineField({ name: "siret", title: "SIRET", type: "string", group: "legal" }),
    defineField({ name: "rcs", title: "RCS", type: "string", group: "legal" }),
    defineField({ name: "vat", title: "N° TVA intracommunautaire", type: "string", group: "legal" }),
    defineField({ name: "naf", title: "Code NAF", type: "string", group: "legal" }),
    defineField({ name: "publicationDirector", title: "Directeur de la publication", type: "string", group: "legal" }),
    defineField({
      name: "insurance",
      title: "Assurance décennale (obligatoire)",
      type: "object",
      group: "legal",
      fields: [
        defineField({ name: "insurer", title: "Assureur", type: "string" }),
        defineField({ name: "address", title: "Adresse de l'assureur", type: "string" }),
        defineField({ name: "policy", title: "N° de contrat", type: "string" }),
        defineField({ name: "coverage", title: "Couverture géographique", type: "string" }),
      ],
    }),
    defineField({
      name: "mediator",
      title: "Médiateur de la consommation (obligatoire)",
      type: "object",
      group: "legal",
      fields: [
        defineField({ name: "name", title: "Nom", type: "string" }),
        defineField({ name: "address", title: "Adresse", type: "string" }),
        defineField({ name: "url", title: "Site web", type: "url" }),
      ],
    }),
    defineField({ name: "googleMapsUrl", title: "Lien de la fiche Google", type: "url", group: "web" }),
    defineField({ name: "googleReviewUrl", title: "Lien pour laisser un avis Google", type: "url", group: "web" }),
    defineField({ name: "sameAs", title: "Autres profils (PagesJaunes, Houzz, Facebook…)", type: "array", of: [{ type: "url" }], group: "web" }),
  ],
  preview: { prepare: () => ({ title: "Entreprise & coordonnées" }) },
});

export const homePage = defineType({
  name: "homePage",
  title: "Page d'accueil",
  type: "document",
  fields: [
    defineField({
      name: "hero",
      title: "Haut de page",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Titre (une ligne par ligne du lettrage)", type: "text", rows: 3, description: "Écrit en grandes capitales, comme sur le camion." }),
        defineField({ name: "intro", title: "Introduction", type: "text", rows: 3 }),
        defineField({ name: "proof", title: "Phrase de preuve", type: "text", rows: 2, description: "Mettre la première partie entre **…** pour la passer en gras." }),
        defineField({ name: "photo", title: "Photo", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Description", type: "string" })] }),
        defineField({ name: "photoCaption", title: "Légende de la photo", type: "string" }),
      ],
    }),
    sectionText("services", "Section prestations"),
    defineField({
      name: "method",
      title: "Section méthode",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
          defineField({ name: "title", title: "Titre", type: "string" }),
        defineField({ name: "intro", title: "Introduction", type: "text", rows: 3 }),
        defineField({
          name: "steps",
          title: "Étapes",
          type: "array",
          of: [defineArrayMember({ type: "object", name: "methodStep", fields: [defineField({ name: "title", title: "Titre", type: "string" }), defineField({ name: "text", title: "Texte", type: "text", rows: 2 })] })],
        }),
      ],
    }),
    sectionText("realisations", "Section réalisations"),
    defineField({
      name: "reviews",
      title: "Section avis (slider)",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({ name: "title", title: "Titre", type: "string" }),
        defineField({ name: "intro", title: "Introduction", type: "text", rows: 3 }),
        defineField({
          name: "sliderItems",
          title: "Sélection et ordre des avis dans le slider (facultatif)",
          type: "array",
          description: "Choisissez et réordonnez les avis affichés sur l'accueil. Si la liste est vide, tous les avis cochés « Afficher dans le slider » tournent automatiquement.",
          of: [defineArrayMember({ type: "reference", to: [{ type: "review" }] })],
        }),
        defineField({
          name: "autoplay",
          title: "Défilement automatique du slider",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "autoplaySeconds",
          title: "Temps par avis (secondes)",
          type: "number",
          initialValue: 7,
          validation: (r) => r.min(3).max(20),
          hidden: ({ parent }) => parent?.autoplay === false,
        }),
      ],
    }),
    sectionText("zones", "Section zones"),
    sectionText("guides", "Section conseils"),
    sectionText("faq", "Section FAQ", false),
    defineField({
      name: "cta",
      title: "Bandeau « demander un devis »",
      type: "object",
      options: { collapsible: true, collapsed: true },
      fields: [defineField({ name: "title", title: "Titre", type: "string" }), defineField({ name: "text", title: "Texte", type: "text", rows: 3 })],
    }),
    seo,
  ],
  preview: { prepare: () => ({ title: "Page d'accueil" }) },
});

export const aboutPage = defineType({
  name: "aboutPage",
  title: "Page « L'entreprise »",
  type: "document",
  fields: [
    defineField({ ...pageHeader("header", "Haut de page"), description: "Astuce : « {annees} » est remplacé par le nombre d'années depuis la création." }),
    defineField({ name: "story", title: "Histoire et méthode", type: "corps" }),
    defineField({ name: "photo", title: "Photo principale", type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", title: "Description", type: "string" })] }),
    defineField({ name: "photoCaption", title: "Légende de la photo", type: "string" }),
    defineField({ name: "valuesTitle", title: "Titre des engagements", type: "string" }),
    defineField({
      name: "values",
      title: "Engagements",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "value", fields: [defineField({ name: "title", title: "Titre", type: "string" }), defineField({ name: "text", title: "Texte", type: "text", rows: 2 })] })],
    }),
    defineField({ name: "insuranceTitle", title: "Titre assurances", type: "string" }),
    defineField({ name: "insuranceText", title: "Texte assurances", type: "text", rows: 3 }),
    seo,
  ],
  preview: { prepare: () => ({ title: "Page « L'entreprise »" }) },
});

export const pageTexts = defineType({
  name: "pageTexts",
  title: "Titres des autres pages",
  type: "document",

  fields: [
    pageHeader("prestations", "Prestations"),
    pageHeader("realisations", "Réalisations"),
    pageHeader("zones", "Zones d'intervention"),
    pageHeader("conseils", "Prix & conseils"),
    pageHeader("avis", "Avis clients"),
    pageHeader("faq", "Questions fréquentes"),
    pageHeader("devis", "Devis"),
  ],
  preview: { prepare: () => ({ title: "Titres des autres pages" }) },
});

export const review = defineType({
  name: "review",
  title: "Avis client",
  type: "document",
  description: "Recopier les avis Google tels quels (obligation légale : pas de modification).",
  fields: [
    defineField({ name: "author", title: "Auteur (prénom + initiale)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "rating", title: "Note", type: "number", options: { list: [5, 4, 3, 2, 1] }, initialValue: 5 }),
    defineField({ name: "text", title: "Texte de l'avis", type: "text", rows: 5, validation: (r) => r.required() }),
    defineField({ name: "highlight", title: "Phrase à souligner", type: "string", description: "Copier-coller une phrase exacte de l'avis (facultatif)." }),
    defineField({ name: "projectLabel", title: "Chantier ou commune (facultatif)", type: "string", description: "Ex. : Salle de bain · Annecy" }),
    defineField({ name: "date", title: "Date de l'expérience (AAAA-MM)", type: "string" }),
    defineField({ name: "dateLabel", title: "Date affichée", type: "string", description: "Ex. : juillet 2025" }),
    defineField({ name: "source", title: "Source", type: "string", options: { list: ["Google"] }, initialValue: "Google" }),
    defineField({ name: "showInSlider", title: "Afficher dans le slider de l'accueil", type: "boolean", initialValue: true }),
    defineField({ name: "featured", title: "Mettre en avant (premier avis)", type: "boolean", initialValue: false }),
    defineField({ name: "order", title: "Ordre dans le slider", type: "number", description: "Plus le chiffre est petit, plus l'avis apparaît tôt.", initialValue: 10 }),
  ],
  orderings: [
    { title: "Ordre du slider", name: "sliderOrder", by: [{ field: "featured", direction: "desc" }, { field: "order", direction: "asc" }, { field: "date", direction: "desc" }] },
    { title: "Plus récents", name: "dateDesc", by: [{ field: "date", direction: "desc" }] },
  ],
  preview: {
    select: { title: "author", subtitle: "dateLabel", rating: "rating", showInSlider: "showInSlider", featured: "featured" },
    prepare: ({ title, subtitle, rating = 5, showInSlider = true, featured }) => ({
      title: `${"★".repeat(rating)} ${title}`,
      subtitle: [subtitle, featured ? "Mis en avant" : null, showInSlider === false ? "Masqué du slider" : "Dans le slider"].filter(Boolean).join(" · "),
    }),
  },
});
