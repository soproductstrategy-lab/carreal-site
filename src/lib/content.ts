import "server-only";
import { createClient } from "next-sanity";
import { cacheLife, cacheTag } from "next/cache";
import { faqGroups as localFaq } from "@/content/faq";
import { guides as localGuides } from "@/content/guides";
import { realisations as localRealisations } from "@/content/realisations";
import { services as localServices } from "@/content/services";
import { business as localBusiness, type Business } from "@/content/business";
import { about as localAbout, home as localHome, pageHeaders as localHeaders, type AboutContent, type HomeContent, type PageHeader, type PageKey } from "@/content/pages";
import { reviewNotice, reviews as localReviews } from "@/content/reviews";
import type { Faq, Guide, Img, Realisation, Review, Service, Zone } from "@/content/types";
import { zones as localZones } from "@/content/zones";
import { apiVersion, dataset, isSanityConfigured, projectId } from "@/sanity/env";
import { portableToBlocks, type PortableText } from "@/sanity/portable";

/**
 * Couche de données unique du site.
 * - Sans projet Sanity configuré : contenu local (src/content/*).
 * - Avec Sanity : lecture du contenu publié, mise en cache au build et invalidée par tag
 *   via le webhook /api/revalidate à chaque publication dans le Studio.
 */
/** En local : contenu relu chaque minute (pas de webhook). En production : en cache jusqu'à la prochaine publication. */
function life() {
  if (process.env.NODE_ENV === "development") cacheLife("minutes");
  else cacheLife("max");
}

const client = isSanityConfigured ? createClient({ projectId, dataset, apiVersion, useCdn: false, perspective: "published" }) : null;

async function fetchSanity<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  const res = await client!.fetch<T>(query, params);
  if (process.env.NODE_ENV === "development") {
    const type = query.match(/_type == "(\w+)"/)?.[1];
    console.info(`[contenu] Sanity ${projectId} · ${type} · ${Array.isArray(res) ? res.length : 1} document(s)`);
  }
  return res;
}

const orderBySlugs = <T extends { slug: string }>(items: T[]) => items;

/* ---------- Prestations ---------- */

type RawImg = { src?: string; alt?: string; width?: number; height?: number } | null;
const img = (i: RawImg, fallbackAlt: string): Img | undefined =>
  i?.src ? { src: i.src, alt: i.alt || fallbackAlt, width: i.width ?? 1600, height: i.height ?? 1200 } : undefined;

type RawService = Omit<Service, "body" | "image"> & { body: PortableText; image: RawImg };
const SERVICES_Q = `*[_type == "service" && defined(slug.current)] | order(order asc){
  "slug": slug.current, name, short, h1, title, metaDescription, lead, pattern, spec, format, formatNote, priceRange,
  body, "faq": coalesce(faq[]{q, a}, []), "related": coalesce(related[]->slug.current, []),
  "image": image{ "src": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }
}`;

export async function getServices(): Promise<Service[]> {
  "use cache";
  life();
  cacheTag("service");
  if (!client) return localServices;
  const raw = await fetchSanity<RawService[]>(SERVICES_Q);
  if (!raw.length) return localServices;
  return orderBySlugs(
    raw.map((s) => ({
      ...s,
      h1: s.h1 || s.name,
      title: s.title || `${s.name} à Annecy | Carreal`,
      metaDescription: s.metaDescription || s.lead?.slice(0, 155) || "",
      pattern: s.pattern || "droit",
      spec: s.spec || "",
      format: s.format || localServices.find((l) => l.slug === s.slug)?.format || "",
      formatNote: s.formatNote || localServices.find((l) => l.slug === s.slug)?.formatNote || "",
      priceRange: s.priceRange || "Sur devis",
      body: portableToBlocks(s.body),
      image: img(s.image, s.name),
    })),
  );
}

export async function getService(slug: string) {
  return (await getServices()).find((s) => s.slug === slug);
}

/* ---------- Zones ---------- */

type RawZone = Omit<Zone, "body" | "map"> & { body: PortableText };
const ZONES_Q = `*[_type == "zone" && defined(slug.current)] | order(order asc){
  "slug": slug.current, name, h1, title, metaDescription, lead, "communes": coalesce(communes, []),
  "postalCodes": coalesce(postalCodes, []), travel, body, "faq": coalesce(faq[]{q, a}, []), wikipedia
}`;

export async function getZones(): Promise<Zone[]> {
  "use cache";
  life();
  cacheTag("zone");
  if (!client) return localZones;
  const raw = await fetchSanity<RawZone[]>(ZONES_Q);
  if (!raw.length) return localZones;
  return raw.map((z) => ({
    ...z,
    h1: z.h1 || `Carreleur · ${z.name}`,
    title: z.title || `Carreleur ${z.name} | Carreal`,
    metaDescription: z.metaDescription || z.lead?.slice(0, 155) || "",
    travel: z.travel || "",
    map: localZones.find((l) => l.slug === z.slug)?.map ?? { x: 50, y: 50 },
    body: portableToBlocks(z.body),
  }));
}

export async function getZone(slug: string) {
  return (await getZones()).find((z) => z.slug === slug);
}

/* ---------- Réalisations ---------- */

type RawRealisation = Omit<Realisation, "body" | "images"> & {
  body: PortableText;
  images: { src: string; alt?: string; width?: number; height?: number }[] | null;
};
const REALISATIONS_Q = `*[_type == "realisation" && defined(slug.current)] | order(year desc, _createdAt desc){
  "slug": slug.current, title, commune, "zone": zone->slug.current, "services": coalesce(services[]->slug.current, []),
  year, room, material, format, layout, joint, surface, duration, pattern, summary, body, demo,
  "images": photos[]{ "src": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }
}`;

export async function getRealisations(): Promise<Realisation[]> {
  "use cache";
  life();
  cacheTag("realisation");
  if (!client) return localRealisations;
  // Pas de repli sur les exemples locaux : si l'artisan supprime les démos, elles ne doivent pas revenir.
  const raw = await fetchSanity<RawRealisation[]>(REALISATIONS_Q);
  return raw.map((r) => ({
    ...r,
    zone: r.zone ?? "",
    year: r.year ?? new Date().getFullYear(),
    room: r.room ?? "",
    material: r.material ?? "",
    format: r.format ?? "",
    layout: r.layout ?? "",
    joint: r.joint ?? "",
    surface: r.surface ?? "",
    duration: r.duration ?? "",
    pattern: r.pattern || "droit",
    summary: r.summary ?? "",
    demo: Boolean(r.demo),
    body: portableToBlocks(r.body),
    images: (r.images ?? [])
      .filter((i) => i.src)
      .map((i) => ({ src: i.src, alt: i.alt || `${r.title}, ${r.commune}`, width: i.width ?? 1600, height: i.height ?? 1200 })),
  }));
}

export async function getRealisation(slug: string) {
  return (await getRealisations()).find((r) => r.slug === slug);
}

/* ---------- Guides ---------- */

type RawGuide = Omit<Guide, "body" | "image"> & { body: PortableText; image: RawImg };
const GUIDES_Q = `*[_type == "guide" && defined(slug.current)] | order(updated desc){
  "slug": slug.current, title, h1, metaDescription, lead, category, published, updated, readingMinutes, pattern,
  body, "faq": coalesce(faq[]{q, a}, []), "relatedServices": coalesce(relatedServices[]->slug.current, []),
  "image": image{ "src": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }
}`;

export async function getGuides(): Promise<Guide[]> {
  "use cache";
  life();
  cacheTag("guide");
  if (!client) return localGuides;
  const raw = await fetchSanity<RawGuide[]>(GUIDES_Q);
  if (!raw.length) return localGuides;
  return raw.map((g) => ({
    ...g,
    h1: g.h1 || g.title,
    metaDescription: g.metaDescription || g.lead?.slice(0, 155) || "",
    category: g.category || "Conseils techniques",
    published: g.published || g.updated,
    updated: g.updated || g.published,
    readingMinutes: g.readingMinutes || 5,
    pattern: g.pattern || "droit",
    body: portableToBlocks(g.body),
    image: img(g.image, g.title),
  }));
}

export async function getGuide(slug: string) {
  return (await getGuides()).find((g) => g.slug === slug);
}

/* ---------- FAQ ---------- */

export async function getFaqGroups(): Promise<{ title: string; items: Faq[] }[]> {
  "use cache";
  life();
  cacheTag("faqGroup");
  if (!client) return localFaq;
  const raw = await fetchSanity<{ title: string; items: Faq[] }[]>(`*[_type == "faqGroup"] | order(order asc){ title, "items": coalesce(items[]{q, a}, []) }`);
  return raw.length ? raw : localFaq;
}

/* ---------- Entreprise & coordonnées ---------- */

type RawSettings = Partial<{
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  foundingYear: number;
  founderName: string;
  founderRole: string;
  responsePromise: string;
  phoneDisplay: string;
  phoneE164: string;
  landlineDisplay: string;
  email: string;
  whatsapp: string;
  address: Partial<Business["address"]>;
  hours: Partial<Business["hours"][number]>[];
  legalForm: string;
  capital: string;
  siren: string;
  siret: string;
  rcs: string;
  vat: string;
  naf: string;
  publicationDirector: string;
  insurance: Partial<Business["legal"]["insurance"]>;
  mediator: Partial<Business["legal"]["mediator"]>;
  googleMapsUrl: string;
  googleReviewUrl: string;
  sameAs: string[];
}>;

/** Fusion champ par champ : un champ laissé vide dans Sanity garde la valeur locale. */
function pick<T>(v: T | null | undefined, d: T): T {
  return v === undefined || v === null || v === "" ? d : v;
}
function merge<T extends object>(v: Partial<T> | null | undefined, d: T): T {
  const src = (v ?? {}) as Record<string, unknown>;
  return Object.fromEntries(Object.entries(d).map(([k, dv]) => [k, pick(src[k], dv)])) as T;
}

export async function getSettings(): Promise<Business> {
  "use cache";
  life();
  cacheTag("settings");
  if (!client) return localBusiness;
  const s = (await fetchSanity<RawSettings | null>(`*[_type == "settings" && _id == "settings"][0]`)) ?? {};
  const b = localBusiness;
  return {
    ...b,
    name: pick(s.name, b.name),
    legalName: pick(s.legalName, b.legalName),
    tagline: pick(s.tagline, b.tagline),
    description: pick(s.description, b.description),
    foundingYear: pick(s.foundingYear, b.foundingYear),
    founder: { name: pick(s.founderName, b.founder.name), role: pick(s.founderRole, b.founder.role) },
    responsePromise: pick(s.responsePromise, b.responsePromise),
    phone: { display: pick(s.phoneDisplay, b.phone.display), e164: pick(s.phoneE164, b.phone.e164) },
    landline: { ...b.landline, display: pick(s.landlineDisplay, b.landline.display) },
    email: pick(s.email, b.email),
    whatsapp: pick(s.whatsapp, b.whatsapp),
    address: merge(s.address, b.address),
    hours: s.hours?.length ? s.hours.map((h) => ({ label: h.label ?? "", days: h.days ?? [], opens: h.opens ?? "", closes: h.closes ?? "" })) : b.hours,
    legal: {
      ...b.legal,
      form: pick(s.legalForm, b.legal.form),
      capital: pick(s.capital, b.legal.capital),
      siren: pick(s.siren, b.legal.siren),
      siret: pick(s.siret, b.legal.siret),
      rcs: pick(s.rcs, b.legal.rcs),
      vat: pick(s.vat, b.legal.vat),
      naf: pick(s.naf, b.legal.naf),
      publicationDirector: pick(s.publicationDirector, b.legal.publicationDirector),
      insurance: merge(s.insurance, b.legal.insurance),
      mediator: merge(s.mediator, b.legal.mediator),
    },
    googleMapsUrl: pick(s.googleMapsUrl, b.googleMapsUrl),
    googleReviewUrl: pick(s.googleReviewUrl, b.googleReviewUrl),
    sameAs: s.sameAs?.length ? s.sameAs : b.sameAs,
  };
}

/* ---------- Pages éditoriales ---------- */

export async function getHome(): Promise<HomeContent & { heroPhoto?: Img }> {
  "use cache";
  life();
  cacheTag("homePage");
  if (!client) return localHome;
  const h = await fetchSanity<
    (Partial<HomeContent> & {
      heroPhoto?: RawImg;
      reviewSliderIds?: (string | null)[];
    }) | null
  >(
    `*[_id == "homePage"][0]{..., "heroPhoto": hero.photo{ "src": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }, "reviewSliderIds": reviews.sliderItems[]->_id}`,
  );
  if (!h) return localHome;
  const d = localHome;
  const sliderIds = (h.reviewSliderIds ?? []).filter((id): id is string => Boolean(id));
  return {
    hero: merge(h.hero, d.hero),
    heroPhoto: img(h.heroPhoto ?? null, "Photo Carreal"),
    services: merge(h.services, d.services),
    method: {
      ...merge(h.method, d.method),
      steps: h.method?.steps?.length ? h.method.steps.map((x) => merge(x, { title: "", text: "" })) : d.method.steps,
    },
    realisations: merge(h.realisations, d.realisations),
    reviews: {
      ...merge(h.reviews, d.reviews),
      autoplay: h.reviews?.autoplay ?? d.reviews.autoplay ?? true,
      autoplaySeconds: h.reviews?.autoplaySeconds ?? d.reviews.autoplaySeconds ?? 7,
      sliderIds: sliderIds.length ? sliderIds : undefined,
    },
    zones: merge(h.zones, d.zones),
    guides: merge(h.guides, d.guides),
    faq: merge(h.faq, d.faq),
    cta: merge(h.cta, d.cta),
    seo: merge(h.seo, d.seo),
  };
}

type RawAbout = Partial<Omit<AboutContent, "story">> & { story?: PortableText; photo?: RawImg };

export async function getAbout(): Promise<AboutContent & { photo?: Img }> {
  "use cache";
  life();
  cacheTag("aboutPage");
  if (!client) return localAbout;
  const a = await fetchSanity<RawAbout | null>(
    `*[_id == "aboutPage"][0]{..., "photo": photo{ "src": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height }}`,
  );
  if (!a) return localAbout;
  const d = localAbout;
  return {
    header: merge(a.header, d.header),
    story: a.story?.length ? portableToBlocks(a.story) : d.story,
    photo: img(a.photo ?? null, d.photoCaption),
    photoCaption: pick(a.photoCaption, d.photoCaption),
    valuesTitle: pick(a.valuesTitle, d.valuesTitle),
    values: a.values?.length ? a.values.map((v) => merge(v, { title: "", text: "" })) : d.values,
    insuranceTitle: pick(a.insuranceTitle, d.insuranceTitle),
    insuranceText: pick(a.insuranceText, d.insuranceText),
    seo: merge(a.seo, d.seo),
  };
}

export async function getPageHeader(key: PageKey): Promise<PageHeader> {
  "use cache";
  life();
  cacheTag("pageTexts");
  if (!client) return localHeaders[key];
  const t = await fetchSanity<Partial<Record<PageKey, Partial<PageHeader>>> | null>(`*[_id == "pageTexts"][0]`);
  return merge(t?.[key], localHeaders[key]);
}

/* ---------- Avis ---------- */

export type ReviewsData = { list: Review[]; average: number; count: number; notice: string };

export async function getReviews(): Promise<ReviewsData> {
  "use cache";
  life();
  cacheTag("review");
  let list: Review[] = localReviews.map((r, i) => ({
    ...r,
    id: r.id ?? `review-${i + 1}`,
    showInSlider: r.showInSlider ?? true,
    order: r.order ?? i + 1,
  }));
  if (client) {
    const raw = await fetchSanity<(Review & { _id: string })[]>(
      `*[_type == "review"] | order(featured desc, coalesce(order, 10) asc, date desc){ _id, author, rating, text, highlight, projectLabel, date, dateLabel, "showInSlider": coalesce(showInSlider, true), "order": coalesce(order, 10), "source": coalesce(source, "Google") }`,
    );
    if (raw.length) {
      list = raw.map((r) => ({
        ...r,
        id: r._id,
        rating: r.rating ?? 5,
        dateLabel: r.dateLabel ?? r.date ?? "",
        showInSlider: r.showInSlider !== false,
        order: r.order ?? 10,
      }));
    }
  }
  const average = list.length ? list.reduce((a, r) => a + r.rating, 0) / list.length : 0;
  return { list, average, count: list.length, notice: reviewNotice };
}
