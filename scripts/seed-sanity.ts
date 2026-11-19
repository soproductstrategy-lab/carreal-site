/**
 * Importe le contenu local (src/content/*) dans Sanity. Idempotent : relancer écrase les documents
 * de même identifiant (service-xxx, zone-xxx…) sans toucher aux réalisations créées dans le Studio.
 *
 * Usage :  npm run sanity:seed                 crée les documents manquants (n'écrase rien)
 *          npm run sanity:seed -- --force       écrase avec le contenu local (attention aux modifications faites dans le Studio)
 *          npm run sanity:seed -- --no-demo     sans les 4 réalisations d'exemple
 *          npm run sanity:seed -- --force --only=homePage,aboutPage   n'écrase que ces documents
 *
 * Prérequis dans .env.local : NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN
 */
import { existsSync } from "node:fs";
import { createClient } from "@sanity/client";
import { business } from "../src/content/business";
import { faqGroups } from "../src/content/faq";
import { guides } from "../src/content/guides";
import { about, home, pageHeaders } from "../src/content/pages";
import { realisations } from "../src/content/realisations";
import { reviews } from "../src/content/reviews";
import { services } from "../src/content/services";
import { zones } from "../src/content/zones";
import { blocksToPortable, key } from "../src/sanity/portable";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  console.error("✗ NEXT_PUBLIC_SANITY_PROJECT_ID et SANITY_API_WRITE_TOKEN doivent être définis dans .env.local");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2026-11-01", useCdn: false });
const withDemo = !process.argv.includes("--no-demo");
const force = process.argv.includes("--force");
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",");

const ref = (id: string) => ({ _type: "reference", _ref: id, _key: key() });
const slug = (s: string) => ({ _type: "slug", current: s });
const faq = (items: { q: string; a: string }[]) => items.map((f) => ({ _type: "faqItem", _key: key(), ...f }));

const withKeys = <T extends object>(arr: T[], type: string) => arr.map((x) => ({ _key: key(), _type: type, ...x }));

const docs: Record<string, unknown>[] = [
  {
    _id: "settings",
    _type: "settings",
    name: business.name,
    legalName: business.legalName,
    tagline: business.tagline,
    description: business.description,
    foundingYear: business.foundingYear,
    founderName: business.founder.name,
    founderRole: business.founder.role,
    responsePromise: business.responsePromise,
    phoneDisplay: business.phone.display,
    phoneE164: business.phone.e164,
    landlineDisplay: business.landline.display,
    email: business.email,
    whatsapp: business.whatsapp,
    address: { street: business.address.street, locality: business.address.locality, postalCode: business.address.postalCode, city: business.address.city },
    hours: withKeys(business.hours.map((h) => ({ label: h.label, days: h.days, opens: h.opens, closes: h.closes })), "hoursRow"),
    legalForm: business.legal.form,
    capital: business.legal.capital,
    siren: business.legal.siren,
    siret: business.legal.siret,
    rcs: business.legal.rcs,
    vat: business.legal.vat,
    naf: business.legal.naf,
    publicationDirector: business.legal.publicationDirector,
    insurance: business.legal.insurance,
    mediator: { name: business.legal.mediator.name, address: business.legal.mediator.address },
    googleMapsUrl: business.googleMapsUrl,
    googleReviewUrl: business.googleReviewUrl,
    sameAs: business.sameAs,
  },
  {
    _id: "homePage",
    _type: "homePage",
    ...home,
    method: { ...home.method, steps: withKeys(home.method.steps, "methodStep") },
  },
  {
    _id: "aboutPage",
    _type: "aboutPage",
    header: about.header,
    story: blocksToPortable(about.story),
    photoCaption: about.photoCaption,
    valuesTitle: about.valuesTitle,
    values: withKeys(about.values, "value"),
    insuranceTitle: about.insuranceTitle,
    insuranceText: about.insuranceText,
    seo: about.seo,
  },
  { _id: "pageTexts", _type: "pageTexts", ...pageHeaders },
  ...reviews.map((r, i) => ({
    _id: `review-${i + 1}`,
    _type: "review",
    author: r.author,
    rating: r.rating,
    text: r.text,
    highlight: r.highlight,
    projectLabel: r.projectLabel,
    date: r.date,
    dateLabel: r.dateLabel,
    source: r.source,
    showInSlider: r.showInSlider ?? true,
    featured: i === 0,
    order: r.order ?? i + 1,
  })),
  ...services.map((s, i) => ({
    _id: `service-${s.slug}`,
    _type: "service",
    name: s.name,
    short: s.short,
    h1: s.h1,
    title: s.title,
    metaDescription: s.metaDescription,
    lead: s.lead,
    spec: s.spec,
    format: s.format,
    formatNote: s.formatNote,
    priceRange: s.priceRange,
    pattern: s.pattern,
    body: blocksToPortable(s.body),
    faq: faq(s.faq),
    related: s.related.map((r) => ref(`service-${r}`)),
    order: i + 1,
    slug: slug(s.slug),
  })),
  ...zones.map((z, i) => ({
    _id: `zone-${z.slug}`,
    _type: "zone",
    name: z.name,
    h1: z.h1,
    title: z.title,
    metaDescription: z.metaDescription,
    lead: z.lead,
    communes: z.communes,
    postalCodes: z.postalCodes,
    travel: z.travel,
    body: blocksToPortable(z.body),
    faq: faq(z.faq),
    wikipedia: z.wikipedia,
    order: i + 1,
    slug: slug(z.slug),
  })),
  ...guides.map((g) => ({
    _id: `guide-${g.slug}`,
    _type: "guide",
    title: g.title,
    h1: g.h1,
    category: g.category,
    lead: g.lead,
    metaDescription: g.metaDescription,
    body: blocksToPortable(g.body),
    faq: faq(g.faq),
    relatedServices: g.relatedServices.map((r) => ref(`service-${r}`)),
    published: g.published,
    updated: g.updated,
    readingMinutes: g.readingMinutes,
    pattern: g.pattern,
    slug: slug(g.slug),
  })),
  ...faqGroups.map((f, i) => ({ _id: `faq-${i + 1}`, _type: "faqGroup", title: f.title, items: faq(f.items), order: i + 1 })),
  ...(withDemo
    ? realisations.map((r) => ({
        _id: `realisation-demo-${r.slug}`,
        _type: "realisation",
        title: r.title,
        commune: r.commune,
        zone: { _type: "reference", _ref: `zone-${r.zone}` },
        services: r.services.map((s) => ref(`service-${s}`)),
        year: r.year,
        room: r.room,
        material: r.material,
        format: r.format,
        layout: r.layout,
        joint: r.joint,
        surface: r.surface,
        duration: r.duration,
        pattern: r.pattern,
        summary: r.summary,
        body: blocksToPortable(r.body),
        demo: true,
        slug: slug(r.slug),
      }))
    : []),
];

async function main() {
  const tx = client.transaction();
  for (const d of only ? docs.filter((x) => only.includes(String(x._id))) : docs) {
    const doc = d as { _id: string; _type: string };
    if (force) tx.createOrReplace(doc);
    else tx.createIfNotExists(doc);
  }
  const res = await tx.commit();
  // Champs ajoutés après coup : complétés sans écraser ce qui a été saisi dans le Studio.
  for (const sv of services) await client.patch(`service-${sv.slug}`).setIfMissing({ format: sv.format, formatNote: sv.formatNote }).commit();
  for (const [i, r] of reviews.entries()) if (r.highlight) await client.patch(`review-${i + 1}`).setIfMissing({ highlight: r.highlight }).commit();
  console.log(`✓ ${res.results.filter((r) => r.operation === "create" || force).length} document(s) créé(s)${force ? " ou remplacé(s)" : ""} sur ${docs.length} dans ${projectId}/${dataset}`);
}

main().catch((e) => {
  console.error("✗ Import échoué :", e.message ?? e);
  process.exit(1);
});
