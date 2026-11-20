import { defineArrayMember, defineField, defineType } from "sanity";

export const patternOptions = [
  { title: "Pose droite", value: "droit" },
  { title: "Pavé décalé", value: "decale" },
  { title: "Chevron", value: "chevron" },
  { title: "Bâtons rompus", value: "batons" },
  { title: "Opus romain", value: "opus" },
  { title: "Mosaïque", value: "mosaique" },
  { title: "Grand format", value: "grand" },
];

export const faqItem = defineType({
  name: "faqItem",
  title: "Question / réponse",
  type: "object",
  fields: [
    defineField({ name: "q", title: "Question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "a", title: "Réponse", type: "text", rows: 3, description: "Commencez par la réponse directe.", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "q", subtitle: "a" } },
});

const steps = defineArrayMember({
  name: "steps",
  title: "Étapes numérotées",
  type: "object",
  fields: [
    defineField({
      name: "items",
      title: "Étapes",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "step",
          fields: [
            defineField({ name: "title", title: "Titre", type: "string" }),
            defineField({ name: "text", title: "Texte", type: "text", rows: 2 }),
          ],
        }),
      ],
    }),
  ],
  preview: { select: { items: "items" }, prepare: ({ items }) => ({ title: `Étapes (${items?.length ?? 0})` }) },
});

const tableau = defineArrayMember({
  name: "tableau",
  title: "Tableau",
  type: "object",
  fields: [
    defineField({ name: "caption", title: "Légende", type: "string" }),
    defineField({ name: "head", title: "En-têtes de colonnes", type: "array", of: [{ type: "string" }] }),
    defineField({
      name: "rows",
      title: "Lignes",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "row", fields: [defineField({ name: "cells", title: "Cellules", type: "array", of: [{ type: "string" }] })], preview: { select: { cells: "cells" }, prepare: ({ cells }) => ({ title: (cells ?? []).join(" | ") }) } })],
    }),
  ],
  preview: { select: { caption: "caption" }, prepare: ({ caption }) => ({ title: `Tableau${caption ? ` : ${caption}` : ""}` }) },
});

const callout = defineArrayMember({
  name: "callout",
  title: "Encadré",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Titre", type: "string" }),
    defineField({ name: "text", title: "Texte", type: "text", rows: 3 }),
    defineField({ name: "tone", title: "Style", type: "string", options: { list: [{ title: "Information", value: "info" }, { title: "Attention", value: "warn" }], layout: "radio" }, initialValue: "info" }),
  ],
  preview: { select: { title: "title", subtitle: "text" } },
});

const spec = defineArrayMember({
  name: "spec",
  title: "Fiche technique",
  type: "object",
  fields: [
    defineField({
      name: "items",
      title: "Lignes",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "specItem", fields: [defineField({ name: "label", title: "Libellé", type: "string" }), defineField({ name: "value", title: "Valeur", type: "string" })] })],
    }),
  ],
  preview: { prepare: () => ({ title: "Fiche technique" }) },
});

const illustration = defineArrayMember({
  name: "illustration",
  title: "Image dans le corps",
  type: "image",
  options: { hotspot: true },
  fields: [
    defineField({
      name: "alt",
      title: "Description SEO (attribut alt)",
      type: "string",
      description: "80 à 135 caractères décrivant concrètement la scène pour Google Images et l'accessibilité.",
    }),
    defineField({
      name: "caption",
      title: "Légende sous l'image",
      type: "string",
      description: "Courte légende éditoriale affichée sous la photo dans l'article.",
    }),
  ],
  preview: {
    select: { title: "caption", subtitle: "alt", media: "asset" },
    prepare: ({ title, subtitle, media }) => ({
      title: title || subtitle || "Image d'illustration",
      subtitle: title && subtitle ? subtitle : "Illustration dans le corps",
      media,
    }),
  },
});

/** Corps de texte riche : paragraphes, titres, listes, liens + blocs spécialisés. */
export const corps = defineType({
  name: "corps",
  title: "Contenu",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Paragraphe", value: "normal" },
        { title: "Titre de section", value: "h2" },
        { title: "Sous-titre", value: "h3" },
      ],
      lists: [{ title: "Liste à puces", value: "bullet" }],
      marks: {
        decorators: [{ title: "Gras", value: "strong" }],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Lien",
            fields: [defineField({ name: "href", title: "Adresse (ex. /prestations/douche-italienne/)", type: "string", validation: (r) => r.required() })],
          },
        ],
      },
    }),
    illustration,
    steps,
    tableau,
    callout,
    spec,
  ],
});
