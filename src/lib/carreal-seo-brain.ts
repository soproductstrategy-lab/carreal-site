import "server-only";
import { getGuides, getRealisations, getServices, getZones } from "@/lib/content";

export type CarrealSeoContext = {
  services: { slug: string; name: string; short: string; priceRange: string; spec: string; href: string }[];
  zones: { slug: string; name: string; communes: string[]; travel: string; href: string }[];
  guides: { slug: string; title: string; category: string; href: string }[];
  realisations: { slug: string; title: string; commune: string; href: string }[];
  allowedHrefs: Set<string>;
  validServiceSlugs: Set<string>;
  promptBrief: string;
};

/**
 * Charge dynamiquement le catalogue réel Carreal (prestations, zones, articles existants, réalisations)
 * pour alimenter Gemini : anti-cannibalisation SEO, maillage interne 100 % vérifié et cohérence des tarifs.
 */
export async function getCarrealSeoContext(): Promise<CarrealSeoContext> {
  const [servicesRaw, zonesRaw, guidesRaw, realisationsRaw] = await Promise.all([
    getServices(),
    getZones(),
    getGuides(),
    getRealisations(),
  ]);

  const services = servicesRaw.map((s) => ({
    slug: s.slug,
    name: s.name,
    short: s.short,
    priceRange: s.priceRange,
    spec: s.spec,
    href: `/prestations/${s.slug}/`,
  }));

  const zones = zonesRaw.map((z) => ({
    slug: z.slug,
    name: z.name,
    communes: z.communes.slice(0, 6),
    travel: z.travel,
    href: `/zones-intervention/${z.slug}/`,
  }));

  const guides = guidesRaw.map((g) => ({
    slug: g.slug,
    title: g.title,
    category: g.category,
    href: `/conseils/${g.slug}/`,
  }));

  const realisations = realisationsRaw
    .filter((r) => !r.demo)
    .slice(0, 8)
    .map((r) => ({
      slug: r.slug,
      title: r.title,
      commune: r.commune,
      href: `/realisations/${r.slug}/`,
    }));

  const allowedHrefs = new Set<string>([
    "/",
    "/devis/",
    "/prestations/",
    "/zones-intervention/",
    "/realisations/",
    "/conseils/",
    "/entreprise/",
    "/avis/",
    "/faq/",
    ...services.map((s) => s.href),
    ...zones.map((z) => z.href),
    ...guides.map((g) => g.href),
    ...realisations.map((r) => r.href),
  ]);

  const validServiceSlugs = new Set(services.map((s) => s.slug));

  const promptBrief = [
    "CONTEXTE RÉEL DU SITE CARREAL (à utiliser pour le maillage interne et les repères de prix — ne JAMAIS inventer d'autre URL) :",
    "",
    "1. Prestations Carreal (URL · tarif indicatif pose seule TTC · repères) :",
    ...services.map((s) => `- slug="${s.slug}" | ${s.name} → ${s.href} | ${s.priceRange}${s.spec ? ` | ${s.spec}` : ""}`),
    "",
    "2. Zones d'intervention Haute-Savoie :",
    ...zones.map((z) => `- ${z.name} → ${z.href} (${z.communes.join(", ")} · ${z.travel})`),
    "",
    "3. Articles déjà publiés sur le site (NE PAS dupliquer ces sujets ; tu peux y faire référence en lien interne) :",
    ...guides.map((g) => `- [${g.category}] ${g.title} → ${g.href}`),
    "",
    "4. Page de conversion principale : [demander un devis gratuit](/devis/) (visite gratuite, réponse sous 48 h ouvrées).",
  ].join("\n");

  return {
    services,
    zones,
    guides,
    realisations,
    allowedHrefs,
    validServiceSlugs,
    promptBrief,
  };
}

/**
 * Supprime toute syntaxe markdown (**gras**, [lien](/url)) des champs texte brut (title, h1, lead, summary, metaDescription, faq, alt)
 * pour ne jamais afficher de crochets ou d'astérisques bruts sur le site public.
 */
export function stripMarkdownPlainText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Vérifie chaque lien markdown [texte](url) généré par l'IA :
 * - normalise le slash final,
 * - conserve uniquement les URLs internes vérifiées dans `allowedHrefs`,
 * - remplace tout lien inventé ou externe non autorisé par son texte brut (zéro lien 404).
 */
export function sanitizeInternalLinks(text: string, allowedHrefs: Set<string>): string {
  if (!text) return "";
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_full, label: string, rawHref: string) => {
    const trimmed = rawHref.trim();
    if (!trimmed.startsWith("/")) return label;
    const withoutHash = trimmed.split("#")[0];
    const normalized = withoutHash.endsWith("/") ? withoutHash : `${withoutHash}/`;
    if (allowedHrefs.has(normalized)) {
      const hash = trimmed.includes("#") ? `#${trimmed.split("#")[1]}` : "";
      return `[${label}](${normalized}${hash})`;
    }
    return label;
  });
}

export type LiveStreamPreview = {
  stage: string;
  title?: string;
  h1?: string;
  category?: string;
  lead?: string;
  metaDescription?: string;
  headings: string[];
  hasTable: boolean;
  hasSteps: boolean;
  faqQuestions: string[];
  ideasTitles: string[];
  summary?: string;
};

function unescapePartialJsonString(raw: string): string {
  return raw
    .replace(/\\n/g, " ")
    .replace(/\\r/g, "")
    .replace(/\\t/g, " ")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\")
    .trim();
}

function extractJsonStringField(buf: string, field: string): string | undefined {
  const re = new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)(?:"|$)`);
  const m = buf.match(re);
  if (!m?.[1]) return undefined;
  return unescapePartialJsonString(m[1]);
}

function extractAllJsonStringFields(buf: string, field: string): string[] {
  const re = new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "g");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(buf))) {
    const val = unescapePartialJsonString(m[1]);
    if (val) out.push(val);
  }
  return out;
}

/**
 * Extrait un aperçu éditorial lisible en temps réel depuis le JSON partiel streamé par Gemini.
 * L'artisan voit le titre, le chapeau, les sections H2 et la FAQ apparaître en direct sans jamais voir de JSON brut.
 */
export function extractLivePreviewFromPartialJson(buf: string, action: string): LiveStreamPreview {
  const title = extractJsonStringField(buf, "title") ?? extractJsonStringField(buf, "seoTitle");
  const h1 = extractJsonStringField(buf, "h1");
  const category = extractJsonStringField(buf, "category");
  const lead =
    extractJsonStringField(buf, "lead") ??
    extractJsonStringField(buf, "summary") ??
    extractJsonStringField(buf, "suggestedLeadOrSummary") ??
    extractJsonStringField(buf, "leadOrSummary");
  const metaDescription = extractJsonStringField(buf, "metaDescription");
  const headings = extractAllJsonStringFields(buf, "heading");
  const faqQuestions = extractAllJsonStringFields(buf, "q");
  const ideasTitles = action === "suggest-guide-ideas" ? extractAllJsonStringFields(buf, "title") : [];
  const hasTable = /"table"\s*:\s*\{/.test(buf) && /"rows"\s*:\s*\[/.test(buf);
  const hasSteps = /"steps"\s*:\s*\[/.test(buf) && /"title"\s*:\s*"/.test(buf.split('"steps"')[1] ?? "");

  let stage = "Initialisation Gemini…";
  if (action === "suggest-guide-ideas") {
    stage = ideasTitles.length > 0 ? `Idées SEO trouvées (${ideasTitles.length}/6)…` : "Analyse des recherches clients à Annecy…";
  } else if (action === "plan-article-images") {
    const slotsCount = extractAllJsonStringFields(buf, "seoFilename").length;
    stage =
      slotsCount > 0
        ? `Plan visuel SEO préparé (${slotsCount} emplacement${slotsCount > 1 ? "s" : ""})…`
        : "Analyse de l'article et calcul du nombre d'images recommandé…";
  } else if (action === "generate-alt-texts") {
    const count = (buf.match(/"(?:[^"\\]|\\.)+"/g) ?? []).length;
    stage = count > 1 ? `Rédaction des descriptions photos…` : "Analyse visuelle des photos…";
  } else if (action === "optimize-seo") {
    stage = metaDescription ? "Finalisation des conseils SEO…" : title ? "Rédaction de la description Google…" : "Analyse SEO de la page…";
  } else if (action === "improve-text") {
    stage = headings.length > 0 ? `Réécriture en cours (${headings.length} section(s))…` : "Relecture et structuration du texte…";
  } else {
    if (faqQuestions.length > 0) stage = `Rédaction de la FAQ Google (${faqQuestions.length} question(s))…`;
    else if (hasTable) stage = "Construction du tableau comparatif / repères…";
    else if (hasSteps) stage = "Rédaction des étapes chantier…";
    else if (headings.length > 0) stage = `Rédaction des sections (${headings.length})…`;
    else if (lead) stage = "Rédaction du chapeau réponse directe (GEO)…";
    else if (title) stage = "Création du titre et du plan SEO…";
  }

  return {
    stage,
    title,
    h1,
    category,
    lead,
    metaDescription,
    headings,
    hasTable,
    hasSteps,
    faqQuestions,
    ideasTitles,
  };
}
