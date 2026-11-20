import { defineArrayMember, defineField, defineType } from "sanity";
import { patternOptions } from "./objects";

const seoGroup = { name: "seo", title: "Référencement" };
const contentGroup = { name: "content", title: "Contenu", default: true };

const slugField = (source: string) =>
  defineField({
    name: "slug",
    title: "Adresse de la page (slug)",
    type: "slug",
    options: { source, maxLength: 80 },
    description: "Généré depuis le titre. Ne plus le modifier une fois la page publiée (sinon le lien Google est perdu).",
    validation: (r) => r.required(),
    group: "seo",
  });

const seoFields = [
  defineField({ name: "title", title: "Titre Google (balise title)", type: "string", description: "≈ 60 caractères, mot-clé + Annecy.", validation: (r) => r.max(70).warning("Trop long pour Google"), group: "seo" }),
  defineField({ name: "metaDescription", title: "Description Google", type: "text", rows: 2, description: "140 à 155 caractères.", validation: (r) => r.max(170).warning("Trop longue pour Google"), group: "seo" }),
];

const pattern = defineField({ name: "pattern", title: "Motif de calepinage (illustration)", type: "string", options: { list: patternOptions }, initialValue: "droit" });
const faq = defineField({ name: "faq", title: "Questions fréquentes", type: "array", of: [{ type: "faqItem" }], group: "content" });
const order = defineField({ name: "order", title: "Ordre d'affichage", type: "number", initialValue: 10 });

export const realisation = defineType({
  name: "realisation",
  title: "Réalisation",
  type: "document",
  groups: [contentGroup, { name: "tech", title: "Fiche technique" }, seoGroup],
  fields: [
    defineField({
      name: "photos",
      title: "Photos du chantier",
      type: "array",
      group: "content",
      description: "Ajoutez 3 à 8 photos : avant, pendant, après, et un gros plan. Photographiez bien de face.",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Description de la photo", type: "string", description: "Ex. : douche à l'italienne en grès cérame gris, Seynod" })],
        }),
      ],
      validation: (r) => r.min(1).warning("Une réalisation sans photo convainc beaucoup moins."),
    }),
    defineField({ name: "title", title: "Titre", type: "string", group: "content", description: "Ex. : Douche à l'italienne en remplacement d'une baignoire", validation: (r) => r.required() }),
    defineField({ name: "commune", title: "Commune", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({ name: "zone", title: "Secteur", type: "reference", to: [{ type: "zone" }], group: "content" }),
    defineField({ name: "services", title: "Prestations", type: "array", of: [{ type: "reference", to: [{ type: "service" }] }], group: "content" }),
    defineField({ name: "year", title: "Année", type: "number", group: "content", initialValue: () => new Date().getFullYear() }),
    defineField({ name: "summary", title: "Résumé (2 phrases)", type: "text", rows: 3, group: "content", description: "Le besoin et la solution, en clair." }),
    defineField({ name: "body", title: "Récit du chantier", type: "corps", group: "content" }),
    defineField({ name: "room", title: "Pièce", type: "string", group: "tech" }),
    defineField({ name: "material", title: "Matériau", type: "string", group: "tech" }),
    defineField({ name: "format", title: "Format", type: "string", group: "tech", description: "Ex. : 60×120" }),
    defineField({ name: "layout", title: "Type de pose", type: "string", group: "tech" }),
    defineField({ name: "joint", title: "Joint", type: "string", group: "tech" }),
    defineField({ name: "surface", title: "Surface", type: "string", group: "tech" }),
    defineField({ name: "duration", title: "Durée", type: "string", group: "tech" }),
    { ...pattern, group: "tech" },
    { ...slugField("title") },
    defineField({ name: "demo", title: "Exemple de démonstration", type: "boolean", group: "seo", description: "Coché = page masquée de Google. À supprimer quand les vrais chantiers sont en ligne.", initialValue: false }),
  ],
  orderings: [{ title: "Plus récentes", name: "yearDesc", by: [{ field: "year", direction: "desc" }] }],
  preview: {
    select: { title: "title", commune: "commune", year: "year", media: "photos.0", demo: "demo" },
    prepare: ({ title, commune, year, media, demo }) => ({ title: `${demo ? "[Exemple] " : ""}${title}`, subtitle: [commune, year].filter(Boolean).join(" · "), media }),
  },
});

export const service = defineType({
  name: "service",
  title: "Prestation",
  type: "document",
  groups: [contentGroup, seoGroup],
  fields: [
    defineField({ name: "name", title: "Nom complet", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({ name: "short", title: "Nom court (menu)", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({
      name: "image",
      title: "Photo principale (couverture / miniature)",
      type: "image",
      options: { hotspot: true },
      group: "content",
      fields: [
        defineField({ name: "alt", title: "Description de la photo (SEO)", type: "string" }),
        defineField({ name: "caption", title: "Légende affichée sous l'image", type: "string" }),
      ],
    }),
    defineField({ name: "h1", title: "Titre de la page (H1)", type: "string", group: "content" }),
    defineField({ name: "lead", title: "Réponse directe (introduction)", type: "text", rows: 4, group: "content", description: "2-3 phrases : quoi, où, comment. C'est ce que citent Google et les IA." }),
    defineField({ name: "spec", title: "Repères techniques", type: "string", group: "content", description: "Séparés par « · »" }),
    defineField({ name: "format", title: "Chiffre-étiquette", type: "string", group: "content", description: "Le chiffre mis en avant sur la carte, comme sur un carton : 60×60, 1 à 2 %, 20 mm…" }),
    defineField({ name: "formatNote", title: "Précision du chiffre", type: "string", group: "content", description: "Ex. : joint de 2 à 3 mm" }),
    defineField({ name: "priceRange", title: "Prix indicatif", type: "string", group: "content", description: "Ex. : 45 – 75 € / m² (pose seule)" }),
    defineField({ name: "body", title: "Contenu", type: "corps", group: "content" }),
    faq,
    defineField({ name: "related", title: "Prestations associées", type: "array", of: [{ type: "reference", to: [{ type: "service" }] }], group: "content" }),
    { ...pattern, group: "content" },
    { ...order, group: "content" },
    slugField("name"),
    ...seoFields,
  ],
  orderings: [{ title: "Ordre", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "priceRange" } },
});

export const zone = defineType({
  name: "zone",
  title: "Zone d'intervention",
  type: "document",
  groups: [contentGroup, seoGroup],
  fields: [
    defineField({ name: "name", title: "Nom", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({ name: "h1", title: "Titre de la page (H1)", type: "string", group: "content" }),
    defineField({ name: "lead", title: "Introduction", type: "text", rows: 4, group: "content" }),
    defineField({ name: "communes", title: "Communes couvertes", type: "array", of: [{ type: "string" }], group: "content" }),
    defineField({ name: "postalCodes", title: "Codes postaux", type: "array", of: [{ type: "string" }], group: "content" }),
    defineField({ name: "travel", title: "Temps de trajet", type: "string", group: "content" }),
    defineField({ name: "body", title: "Contenu local", type: "corps", group: "content", description: "Uniquement du contenu propre au secteur (bâti, climat, contraintes) : pas de texte copié d'une autre zone." }),
    faq,
    defineField({ name: "wikipedia", title: "Page Wikipédia de la commune", type: "url", group: "seo" }),
    { ...order, group: "content" },
    slugField("name"),
    ...seoFields,
  ],
  orderings: [{ title: "Ordre", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "travel" } },
});

export const guide = defineType({
  name: "guide",
  title: "Guide / conseil",
  type: "document",
  groups: [contentGroup, seoGroup],
  fields: [
    defineField({ name: "title", title: "Titre", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({ name: "h1", title: "Titre de la page (H1)", type: "string", group: "content" }),
    defineField({ name: "category", title: "Catégorie", type: "string", group: "content", options: { list: ["Prix", "Conseils techniques", "Problèmes & réparations"], layout: "radio" }, initialValue: "Conseils techniques" }),
    defineField({ name: "lead", title: "Réponse directe", type: "text", rows: 4, group: "content", description: "La réponse à la question en 2-3 phrases chiffrées." }),
    defineField({
      name: "image",
      title: "Photo principale (couverture / miniature)",
      type: "image",
      options: { hotspot: true },
      group: "content",
      fields: [
        defineField({ name: "alt", title: "Description de la photo (SEO)", type: "string" }),
        defineField({ name: "caption", title: "Légende affichée sous l'image", type: "string" }),
      ],
    }),
    defineField({ name: "body", title: "Contenu", type: "corps", group: "content" }),
    faq,
    defineField({ name: "relatedServices", title: "Prestations liées", type: "array", of: [{ type: "reference", to: [{ type: "service" }] }], group: "content" }),
    defineField({ name: "published", title: "Publié le", type: "date", group: "content", initialValue: () => new Date().toISOString().slice(0, 10) }),
    defineField({ name: "updated", title: "Mis à jour le", type: "date", group: "content", initialValue: () => new Date().toISOString().slice(0, 10) }),
    defineField({ name: "readingMinutes", title: "Temps de lecture (min)", type: "number", group: "content", initialValue: 5 }),
    { ...pattern, group: "content" },
    slugField("title"),
    defineField({ name: "metaDescription", title: "Description Google", type: "text", rows: 2, group: "seo" }),
  ],
  orderings: [{ title: "Plus récents", name: "updatedDesc", by: [{ field: "updated", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "category" } },
});

export const faqGroup = defineType({
  name: "faqGroup",
  title: "Groupe de FAQ",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titre du groupe", type: "string", validation: (r) => r.required() }),
    defineField({ name: "items", title: "Questions", type: "array", of: [{ type: "faqItem" }] }),
    order,
  ],
  preview: { select: { title: "title", items: "items" }, prepare: ({ title, items }) => ({ title, subtitle: `${items?.length ?? 0} questions` }) },
});
