import { type NextRequest, NextResponse } from "next/server";
import type { Block, PatternName } from "@/content/types";
import {
  extractLivePreviewFromPartialJson,
  getCarrealSeoContext,
  sanitizeInternalLinks,
  type CarrealSeoContext,
} from "@/lib/carreal-seo-brain";
import {
  DEFAULT_GEMINI_MODEL,
  isGeminiConfigured,
  streamStructuredGemini,
  type GeminiThinkingLevel,
} from "@/lib/gemini";
import { blocksToPortable, key } from "@/sanity/portable";

/** Durée maximale sur Vercel Fluid Compute (jusqu'à 300 s même sur Hobby). */
export const maxDuration = 300;

type AiAction =
  | "suggest-guide-ideas"
  | "generate-realisation"
  | "generate-guide"
  | "optimize-seo"
  | "generate-alt-texts"
  | "improve-text";

type GuideAngle = "auto" | "prix" | "etapes" | "comparatif" | "probleme";
type LocalFocus = "annecy" | "lac" | "aravis" | "haute-savoie";
type IdeaTheme = "all" | "prix" | "salle-de-bain" | "terrasse" | "problemes" | "tendances";

type RequestBody = {
  action: AiAction;
  docType?: string;
  notes?: string;
  mode?: "clarify" | "seo" | "shorten";
  angle?: GuideAngle;
  localFocus?: LocalFocus;
  theme?: IdeaTheme;
  stream?: boolean;
  document?: Record<string, unknown>;
  photoUrls?: { key?: string; url: string }[];
};

const VALID_PATTERNS: PatternName[] = ["droit", "decale", "chevron", "batons", "opus", "mosaique", "grand"];

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 75);
}

function portableSummary(pt: unknown): string {
  if (!Array.isArray(pt)) return "";
  return pt
    .map((node) => {
      if (node && typeof node === "object" && "children" in node && Array.isArray((node as { children?: unknown[] }).children)) {
        return ((node as { children: { text?: string }[] }).children ?? []).map((c) => c.text ?? "").join("");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

type RawSection = {
  heading?: string;
  paragraphs?: string[];
  bullets?: string[];
  calloutTitle?: string;
  calloutText?: string;
  calloutTone?: "info" | "warn";
};

type RawTable = {
  caption?: string;
  head?: string[];
  rows?: string[][];
};

type RawStep = { title?: string; text?: string };
type RawSpecItem = { label?: string; value?: string };

function buildRichBlocks(opts: {
  sections: RawSection[];
  table?: RawTable;
  steps?: RawStep[];
  spec?: RawSpecItem[];
  allowedHrefs?: Set<string>;
  priceDisclaimer?: boolean;
}): Block[] {
  const clean = (s: string) => (opts.allowedHrefs ? sanitizeInternalLinks(s.trim(), opts.allowedHrefs) : s.trim());
  const out: Block[] = [];

  if (opts.priceDisclaimer) {
    out.push({
      type: "callout",
      tone: "warn",
      title: "Repères de prix indicatifs",
      text: "Fourchettes TTC indicatives constatées sur le bassin annécien (pose seule, hors fourniture sauf mention contraire). Seul un devis établi après visite gratuite sur place fait foi.",
    });
  }

  const sections = opts.sections ?? [];
  const validTable =
    opts.table && Array.isArray(opts.table.head) && opts.table.head.length >= 2 && Array.isArray(opts.table.rows) && opts.table.rows.length >= 2
      ? {
          caption: opts.table.caption?.trim() || undefined,
          head: opts.table.head.map((c) => c.trim()),
          rows: opts.table.rows
            .filter((r) => Array.isArray(r) && r.length > 0)
            .map((r) => r.slice(0, opts.table!.head!.length).map((c) => String(c ?? "").trim())),
        }
      : null;

  const validSteps = (opts.steps ?? [])
    .filter((s) => s.title?.trim() && s.text?.trim())
    .map((s) => ({ title: s.title!.trim(), text: clean(s.text!) }));

  const validSpec = (opts.spec ?? [])
    .filter((s) => s.label?.trim() && s.value?.trim())
    .map((s) => ({ label: s.label!.trim(), value: s.value!.trim() }));

  let insertedTable = false;
  let insertedSteps = false;

  sections.forEach((sec, idx) => {
    if (sec.heading?.trim()) out.push({ type: "h2", text: sec.heading.trim() });
    for (const p of sec.paragraphs ?? []) {
      if (p.trim()) out.push({ type: "p", text: clean(p) });
    }
    const items = (sec.bullets ?? []).map((b) => clean(b)).filter(Boolean);
    if (items.length) out.push({ type: "ul", items });

    // Place le tableau après la 1re section et les étapes après la 2e section pour une lecture fluide
    if (idx === 0 && validTable && !insertedTable) {
      out.push({ type: "table", ...validTable });
      insertedTable = true;
    }
    if (idx === 1 && validSteps.length >= 3 && !insertedSteps) {
      out.push({ type: "steps", items: validSteps });
      insertedSteps = true;
    }

    if (sec.calloutText?.trim()) {
      out.push({
        type: "callout",
        title: sec.calloutTitle?.trim() || "Conseil de carreleur",
        text: clean(sec.calloutText),
        tone: sec.calloutTone === "warn" ? "warn" : "info",
      });
    }
  });

  if (validTable && !insertedTable) out.push({ type: "table", ...validTable });
  if (validSteps.length >= 3 && !insertedSteps) out.push({ type: "steps", items: validSteps });
  if (validSpec.length >= 3) out.push({ type: "spec", items: validSpec });

  return out;
}

const LOCAL_FOCUS_LABEL: Record<LocalFocus, string> = {
  annecy: "Annecy et bassin annécien (Pringy, Seynod, Annecy-le-Vieux, Cran-Gevrier, Épagny)",
  lac: "Rives du lac d'Annecy (Sévrier, Saint-Jorioz, Veyrier-du-Lac, Menthon, Talloires — maisons contemporaines, terrasses vue lac)",
  aravis: "Thônes et massifs des Aravis (La Clusaz, Le Grand-Bornand — gel-dégel sévère, chalets à plancher bois, altitude)",
  "haute-savoie": "Toute la Haute-Savoie (bassin annécien, Albanais, lac et secteurs de montagne)",
};

const ANGLE_INSTRUCTIONS: Record<GuideAngle, string> = {
  auto: "Choisis automatiquement le meilleur format selon le sujet (inclus au moins un tableau comparatif/repères OU des étapes numérotées, ainsi qu'une fiche technique repères).",
  prix: "Format PRIX & BUDGET : donne les fourchettes TTC indicatives pose seule dès le chapeau, fournis OBLIGATOIREMENT un tableau de prix détaillé (3 à 6 lignes : poste / prix indicatif / ce qui fait varier), explique TVA 10 % rénovation (> 2 ans) ou aides si pertinent, et rappelle que seul un devis après visite fait foi.",
  etapes: "Format ÉTAPES & TECHNIQUE DTU 52.2 : fournis OBLIGATOIREMENT une séquence d'étapes numérotées (5 à 7 étapes concrètes du contrôle support aux joints) et une fiche repères techniques (norme DTU, colle, joint, séchage).",
  comparatif: "Format COMPARATIF : aide le client à trancher avec OBLIGATOIREMENT un tableau comparatif clair (3 à 5 options avec avantages, limites, budget/usage recommandé) et un verdict franc d'artisan selon la pièce.",
  probleme: "Format PROBLÈME & DIAGNOSTIC : commence par les causes les plus fréquentes dès le chapeau, fournis des étapes de diagnostic/réparation concrètes, distingue ce qu'un particulier peut vérifier de ce qui impose une intervention pro (infiltration, décollement, reprise chape).",
};

const THEME_LABELS: Record<IdeaTheme, string> = {
  all: "Mix équilibré : prix/budget, salle de bain/douche, terrasses montagne, problèmes fréquents, tendances grands formats",
  prix: "Prix, devis, budget, TVA 10 %, MaPrimeAdapt' et comparatifs coûts à Annecy",
  "salle-de-bain": "Salle de bain, douche à l'italienne, remplacement baignoire, étanchéité SPEC, faïence, zellige, joints époxy",
  terrasse: "Terrasse extérieure, balcon, contour piscine, pose sur plots 20 mm, résistance au gel en Haute-Savoie / Aravis",
  problemes: "Problèmes et réparations : carreau qui sonne creux, fissure, joint qui noircit ou s'effrite, infiltration, carrelage glissant",
  tendances: "Grands formats 120×120 / 120×280, carrelage imitation parquet, travertin/pierre naturelle, plancher chauffant, chalet bois",
};

type ExecutionPlan = {
  prompt: string;
  schema: Record<string, unknown>;
  imageUrls?: string[];
  thinkingLevel: GeminiThinkingLevel;
  buildResponse: (raw: unknown, durationMs: number, model: string) => Record<string, unknown>;
};

async function prepareExecution(payload: RequestBody): Promise<ExecutionPlan> {
  const {
    action,
    docType = "guide",
    notes = "",
    mode = "clarify",
    angle = "auto",
    localFocus = "annecy",
    theme = "all",
    document: doc = {},
    photoUrls = [],
  } = payload;
  const urls = photoUrls.map((p) => p.url).filter(Boolean).slice(0, 4);

  /* ---------- 0. Idées d'articles SEO local carreleur (anti-doublon) ---------- */
  if (action === "suggest-guide-ideas") {
    const ctx = await getCarrealSeoContext();
    type Idea = {
      title: string;
      targetKeyword: string;
      category: "Prix" | "Conseils techniques" | "Problèmes & réparations";
      angle: GuideAngle;
      localFocus: LocalFocus;
      searchIntent: string;
      whyItConverts: string;
      brief: string;
    };
    type Out = { ideas: Idea[] };

    const schema = {
      type: "object",
      properties: {
        ideas: {
          type: "array",
          minItems: 6,
          maxItems: 6,
          description: "Exactement 6 idées d'articles SEO local carreleur à fort potentiel de devis, SANS dupliquer les articles existants.",
          items: {
            type: "object",
            properties: {
              title: { type: "string", description: "Titre d'article accrocheur, clair et naturel (50 à 65 caractères)." },
              targetKeyword: { type: "string", description: "Requête Google principale tapée par les particuliers (ex. carrelage plancher chauffant annecy)." },
              category: { type: "string", enum: ["Prix", "Conseils techniques", "Problèmes & réparations"] },
              angle: { type: "string", enum: ["prix", "etapes", "comparatif", "probleme"] },
              localFocus: { type: "string", enum: ["annecy", "lac", "aravis", "haute-savoie"] },
              searchIntent: { type: "string", description: "Intention courte (ex. Budget avant travaux, Choix matériau, Dépannage urgent)." },
              whyItConverts: { type: "string", description: "1 phrase simple expliquant pourquoi cet article attire des demandes de devis qualifiées." },
              brief: { type: "string", description: "Consigne prête à l'emploi en 2 phrases avec les points techniques à couvrir dans l'article." },
            },
            required: ["title", "targetKeyword", "category", "angle", "localFocus", "searchIntent", "whyItConverts", "brief"],
          },
        },
      },
      required: ["ideas"],
    };

    const prompt = `Propose exactement 6 idées d'articles SEO local et GEO à fort retour sur investissement (demandes de devis) pour le site Carreal (artisan carreleur à Annecy / Haute-Savoie).

Thématique demandée : ${THEME_LABELS[theme] ?? THEME_LABELS.all}
${notes.trim() ? `Précisions / sujets mentionnés par l'artisan : ${notes.trim()}` : ""}

${ctx.promptBrief}

Règles strictes :
- NE JAMAIS proposer un sujet déjà couvert par les articles listés ci-dessus (zéro cannibalisation SEO).
- Chaque idée doit répondre à une vraie question que posent les propriétaires autour d'Annecy, du lac ou des Aravis avant de demander un devis à un carreleur.
- Privilégie les sujets à forte intention de travaux (rénovation salle de bain, plancher chauffant, chalet bois, balcon/terrasse gel, imitation parquet, travertin, grands formats, reprise joints/fissures, aides/TVA).`;

    return {
      prompt,
      schema,
      thinkingLevel: "minimal",
      buildResponse: (raw, durationMs, model) => {
        const res = raw as Out;
        return {
          summary: `${res.ideas?.length ?? 0} idées d'articles SEO local carreleur prêtes à rédiger (sans doublon avec vos articles existants).`,
          ideas: res.ideas ?? [],
          meta: { durationMs, model },
        };
      },
    };
  }

  /* ---------- 1. Générer un article « Prix & conseils » SEO & GEO riche ---------- */
  if (action === "generate-guide") {
    const ctx: CarrealSeoContext = await getCarrealSeoContext();
    type Out = {
      title: string;
      h1: string;
      category: "Prix" | "Conseils techniques" | "Problèmes & réparations";
      pattern: PatternName;
      readingMinutes: number;
      targetKeyword: string;
      lead: string;
      metaDescription: string;
      sections: RawSection[];
      table?: RawTable;
      steps?: RawStep[];
      spec?: RawSpecItem[];
      faq: { q: string; a: string }[];
      relatedServiceSlugs: string[];
      seoNotes: string[];
    };

    const schema = {
      type: "object",
      properties: {
        title: { type: "string", description: "Balise title SEO claire (50 à 64 caractères) incluant le mot-clé principal + Annecy ou Haute-Savoie si naturel." },
        h1: { type: "string", description: "Titre principal H1 affiché sur la page, clair et direct." },
        category: { type: "string", enum: ["Prix", "Conseils techniques", "Problèmes & réparations"] },
        pattern: { type: "string", enum: VALID_PATTERNS, description: "Motif géométrique de calepinage adapté au sujet." },
        readingMinutes: { type: "integer", description: "Temps de lecture estimé entre 4 et 8 minutes." },
        targetKeyword: { type: "string", description: "Requête Google principale visée par l'article." },
        lead: {
          type: "string",
          description:
            "Réponse directe GEO (2 à 3 phrases autonomes, 180 à 340 caractères) qui répond immédiatement et avec des repères concrets dès le début de page (citable tel quel par Google AI Overviews, ChatGPT et Perplexity).",
        },
        metaDescription: { type: "string", description: "Meta description Google entre 135 et 155 caractères, claire et incitative." },
        sections: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          description: "3 à 4 sections H2 concrètes et approfondies. Utilise **gras** sur les notions clés et insère 2 à 4 liens internes markdown [texte](/prestations/...) ou [texte](/zones-intervention/...) en utilisant EXCLUSIVEMENT les URLs du contexte.",
          items: {
            type: "object",
            properties: {
              heading: { type: "string", description: "Sous-titre H2 explicite (souvent formulé comme une vraie question ou un repère clair)." },
              paragraphs: { type: "array", minItems: 1, items: { type: "string" } },
              bullets: { type: "array", items: { type: "string" } },
              calloutTitle: { type: "string" },
              calloutText: { type: "string" },
              calloutTone: { type: "string", enum: ["info", "warn"] },
            },
            required: ["heading", "paragraphs"],
          },
        },
        table: {
          type: "object",
          description: "Tableau structuré (comparatif matériaux, grille de prix indicatifs ou critères de choix) — idéal pour les Featured Snippets Google.",
          properties: {
            caption: { type: "string" },
            head: { type: "array", items: { type: "string" } },
            rows: { type: "array", items: { type: "array", items: { type: "string" } } },
          },
          required: ["head", "rows"],
        },
        steps: {
          type: "array",
          description: "Étapes numérotées (4 à 7 étapes) si le sujet explique une méthode de pose, une rénovation ou un diagnostic.",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              text: { type: "string" },
            },
            required: ["title", "text"],
          },
        },
        spec: {
          type: "array",
          description: "3 à 5 repères techniques clés (ex. Norme → DTU 52.2, Colle → C2S1 double encollage, Joint → Époxy 2 mm, Séchage → 24 à 48 h).",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              value: { type: "string" },
            },
            required: ["label", "value"],
          },
        },
        faq: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          description: "3 à 5 vraies questions Google (People Also Ask) avec réponses directes de 2 phrases max (génèrent le JSON-LD FAQPage).",
          items: {
            type: "object",
            properties: {
              q: { type: "string" },
              a: { type: "string" },
            },
            required: ["q", "a"],
          },
        },
        relatedServiceSlugs: {
          type: "array",
          minItems: 2,
          maxItems: 3,
          description: "2 ou 3 slugs EXACTEMENT issus de la liste des prestations Carreal fournie (ex. pose-carrelage-sol, douche-italienne).",
          items: { type: "string" },
        },
        seoNotes: {
          type: "array",
          minItems: 2,
          maxItems: 3,
          description: "2 ou 3 conseils simples pour l'artisan avant de publier (ex. quelle photo prendre sur chantier pour illustrer cet article).",
          items: { type: "string" },
        },
      },
      required: [
        "title",
        "h1",
        "category",
        "pattern",
        "readingMinutes",
        "targetKeyword",
        "lead",
        "metaDescription",
        "sections",
        "spec",
        "faq",
        "relatedServiceSlugs",
        "seoNotes",
      ],
    };

    const prompt = `Rédige un guide pratique Carreal de référence, optimisé SEO local (Annecy / Haute-Savoie) et GEO (Google AI Overviews, ChatGPT, Perplexity).

Sujet / brief de l'artisan :
${notes.trim() || String(doc.title ?? "Guide pratique carrelage à Annecy")}

Angle éditorial demandé : ${ANGLE_INSTRUCTIONS[angle] ?? ANGLE_INSTRUCTIONS.auto}
Ancrage géographique prioritaire : ${LOCAL_FOCUS_LABEL[localFocus] ?? LOCAL_FOCUS_LABEL.annecy}
Catégorie actuelle du document : ${String(doc.category ?? "à déterminer selon le sujet")}

${ctx.promptBrief}

Checklist qualité OBLIGATOIRE :
1. Chapeau (lead) : réponds directement à la question dès la première phrase avec des repères concrets (fourchettes, épaisseurs, délais ou normes DTU 52.2).
2. Maillage interne naturel : insère 2 à 4 liens markdown vers nos pages prestations, zones ou guides existants (EXCLUSIVEMENT les URLs listées ci-dessus) et termine la dernière section par un renvoi naturel vers [demander un devis gratuit](/devis/).
3. Blocs riches : inclus au moins un tableau structuré (table) OU des étapes numérotées (steps) (les deux si pertinent), au moins un encadré conseil d'artisan (callout) et 3 à 5 repères techniques (spec).
4. FAQ (JSON-LD FAQPage) : 3 à 5 questions concrètes posées par les clients en Haute-Savoie, réponses directes sans blabla.
5. Prestations liées : renvoie 2 ou 3 slugs exacts parmi [${[...ctx.validServiceSlugs].join(", ")}] dans relatedServiceSlugs.`;

    return {
      prompt,
      schema,
      imageUrls: urls,
      thinkingLevel: "low",
      buildResponse: (raw, durationMs, model) => {
        const result = raw as Out;
        const isPriceGuide = result.category === "Prix" || angle === "prix";
        const blocks = buildRichBlocks({
          sections: result.sections ?? [],
          table: result.table,
          steps: result.steps,
          spec: result.spec,
          allowedHrefs: ctx.allowedHrefs,
          priceDisclaimer: isPriceGuide,
        });

        const safePattern: PatternName = VALID_PATTERNS.includes(result.pattern) ? result.pattern : "decale";
        const matchedServices = (result.relatedServiceSlugs ?? [])
          .filter((slug) => ctx.validServiceSlugs.has(slug))
          .slice(0, 3);

        const internalLinksCount = blocks.reduce((acc, b) => {
          const txt =
            b.type === "p"
              ? b.text
              : b.type === "ul"
                ? b.items.join(" ")
                : b.type === "callout"
                  ? b.text
                  : b.type === "steps"
                    ? b.items.map((i) => i.text).join(" ")
                    : "";
          return acc + (txt.match(/\[[^\]]+\]\(\/[^)]+\)/g)?.length ?? 0);
        }, 0);

        const patch: Record<string, unknown> = {
          title: result.title,
          h1: result.h1,
          slug: { _type: "slug", current: slugify(result.title) },
          category: result.category,
          pattern: safePattern,
          readingMinutes: Math.max(3, Math.min(10, Math.round(result.readingMinutes || 5))),
          lead: result.lead,
          metaDescription: result.metaDescription,
          body: blocksToPortable(blocks),
          faq: (result.faq ?? []).map((f) => ({ _type: "faqItem", _key: key(), q: f.q, a: f.a })),
          ...(matchedServices.length
            ? { relatedServices: matchedServices.map((s) => ({ _type: "reference", _ref: `service-${s}`, _key: key() })) }
            : {}),
          published: (doc.published as string) || new Date().toISOString().slice(0, 10),
          updated: new Date().toISOString().slice(0, 10),
        };

        const hasTable = blocks.some((b) => b.type === "table");
        const hasSteps = blocks.some((b) => b.type === "steps");
        const hasSpec = blocks.some((b) => b.type === "spec");

        return {
          summary: `Article SEO/GEO généré en ${(durationMs / 1000).toFixed(1)} s (${result.sections.length} sections, ${result.faq.length} FAQ, ${internalLinksCount} liens internes${hasTable ? ", tableau" : ""}${hasSteps ? ", étapes" : ""}).`,
          patch,
          meta: { durationMs, model },
          preview: {
            title: result.title,
            h1: result.h1,
            category: result.category,
            targetKeyword: result.targetKeyword,
            slug: (patch.slug as { current: string }).current,
            metaDescription: result.metaDescription,
            excerpt: result.lead,
            headings: (result.sections ?? []).map((s) => s.heading).filter(Boolean),
            faqCount: result.faq.length,
            faqQuestions: (result.faq ?? []).map((f) => f.q),
            hasTable,
            hasSteps,
            hasSpec,
            internalLinksCount,
            relatedServices: matchedServices,
            tips: result.seoNotes ?? [],
          },
        };
      },
    };
  }

  /* ---------- 2. Générer une fiche chantier complète (notes + photos Vision) ---------- */
  if (action === "generate-realisation") {
    const ctx = await getCarrealSeoContext();
    type Out = {
      title: string;
      commune: string;
      room: string;
      material: string;
      format: string;
      layout: string;
      joint: string;
      surface: string;
      duration: string;
      pattern: string;
      summary: string;
      sections: RawSection[];
      relatedServiceSlugs: string[];
      photoAlts: string[];
    };

    const schema = {
      type: "object",
      properties: {
        title: { type: "string", description: "Titre clair du chantier sans le nom de la ville s'il est redondant, 40 à 65 caractères." },
        commune: { type: "string", description: "Nom de la commune en Haute-Savoie (ex. Seynod, Annecy-le-Vieux, Sévrier, La Clusaz)." },
        room: { type: "string", description: "Type de pièce ou espace (ex. Salle de bain, Terrasse, Séjour-cuisine)." },
        material: { type: "string", description: "Matériau posé (ex. Grès cérame effet pierre, Travertin, Ardoise et zellige)." },
        format: { type: "string", description: "Format des carreaux avec le symbole × (ex. 60×120, 120×120, 30×60)." },
        layout: { type: "string", description: "Type de pose (ex. Pose droite, Pavé décalé 1/3, Opus romain)." },
        joint: { type: "string", description: "Largeur et type de joint si connus (ex. 2 mm époxy, 3 mm sur plots)." },
        surface: { type: "string", description: "Surface si mentionnée (ex. 14 m²), sinon chaîne vide." },
        duration: { type: "string", description: "Durée si mentionnée (ex. 5 jours), sinon chaîne vide." },
        pattern: { type: "string", enum: VALID_PATTERNS },
        summary: { type: "string", description: "Résumé en 2 phrases concrètes : le besoin initial et la solution réalisée." },
        sections: {
          type: "array",
          minItems: 2,
          description: "2 ou 3 sections courtes pour le récit du chantier (Le besoin, Nos choix techniques, Le résultat).",
          items: {
            type: "object",
            properties: {
              heading: { type: "string" },
              paragraphs: { type: "array", minItems: 1, items: { type: "string" } },
              bullets: { type: "array", items: { type: "string" } },
            },
            required: ["heading", "paragraphs"],
          },
        },
        relatedServiceSlugs: {
          type: "array",
          description: "1 à 3 slugs exacts parmi les prestations Carreal correspondant à ce chantier.",
          items: { type: "string" },
        },
        photoAlts: {
          type: "array",
          description:
            urls.length > 0
              ? `Exactement ${urls.length} descriptions SEO (attribut alt, 80 à 140 caractères) correspondant dans l'ordre aux photos fournies.`
              : "Aucune photo fournie : renvoyer un tableau vide [].",
          items: { type: "string" },
        },
      },
      required: [
        "title",
        "commune",
        "room",
        "material",
        "format",
        "layout",
        "joint",
        "surface",
        "duration",
        "pattern",
        "summary",
        "sections",
        "relatedServiceSlugs",
        "photoAlts",
      ],
    };

    const existing = {
      title: doc.title ?? "",
      commune: doc.commune ?? "",
      room: doc.room ?? "",
      material: doc.material ?? "",
      format: doc.format ?? "",
      surface: doc.surface ?? "",
      duration: doc.duration ?? "",
      summary: doc.summary ?? "",
    };

    const prompt = `Rédige une fiche chantier Carreal complète, fidèle et optimisée SEO local à partir des notes de l'artisan et des ${urls.length} photo(s) jointe(s).

Notes de l'artisan :
${notes || "(Aucune note saisie — base-toi sur les champs déjà remplis et les photos.)"}

Champs déjà saisis dans le formulaire :
${JSON.stringify(existing, null, 2)}

${ctx.promptBrief}

Consignes :
- Ne jamais inventer une surface ou une durée si elle n'est pas indiquée (laisse chaîne vide dans ce cas).
- Utilise le symbole « × » (et non x) pour les formats (ex. 60×120).
- Insère 1 ou 2 liens internes pertinents vers les prestations Carreal réalisées.
- Si des photos sont jointes, observe réellement le carrelage, la pièce, la couleur, la pose et les finitions pour enrichir la fiche et rédiger ${urls.length} balise(s) alt précises et sobres.`;

    return {
      prompt,
      schema,
      imageUrls: urls,
      thinkingLevel: "low",
      buildResponse: (raw, durationMs, model) => {
        const result = raw as Out;
        const blocks = buildRichBlocks({ sections: result.sections ?? [], allowedHrefs: ctx.allowedHrefs });
        const safePattern: PatternName = VALID_PATTERNS.includes(result.pattern as PatternName) ? (result.pattern as PatternName) : "droit";
        const matchedServices = (result.relatedServiceSlugs ?? []).filter((s) => ctx.validServiceSlugs.has(s)).slice(0, 3);

        const patch: Record<string, unknown> = {
          title: result.title,
          slug: { _type: "slug", current: slugify(`${result.commune || "annecy"}-${result.title}`) },
          commune: result.commune || doc.commune || "",
          room: result.room || doc.room || "",
          material: result.material || doc.material || "",
          format: result.format || doc.format || "",
          layout: result.layout || doc.layout || "",
          joint: result.joint || doc.joint || "",
          surface: result.surface || doc.surface || "",
          duration: result.duration || doc.duration || "",
          pattern: safePattern,
          summary: result.summary,
          body: blocksToPortable(blocks),
          ...(matchedServices.length
            ? { services: matchedServices.map((s) => ({ _type: "reference", _ref: `service-${s}`, _key: key() })) }
            : {}),
        };

        return {
          summary: `Fiche chantier générée en ${(durationMs / 1000).toFixed(1)} s (titre, fiche technique, récit et textes photos).`,
          patch,
          meta: { durationMs, model },
          photoAlts: (result.photoAlts ?? []).slice(0, photoUrls.length).map((alt, i) => ({
            key: photoUrls[i]?.key,
            alt,
          })),
          preview: {
            title: result.title,
            slug: (patch.slug as { current: string }).current,
            meta: [result.commune, result.room, result.format, result.surface, result.duration].filter(Boolean).join(" · "),
            excerpt: result.summary,
            headings: (result.sections ?? []).map((s) => s.heading).filter(Boolean),
            relatedServices: matchedServices,
            photoAlts: result.photoAlts ?? [],
          },
        };
      },
    };
  }

  /* ---------- 3. Optimiser le SEO Google & GEO sur n'importe quel document ---------- */
  if (action === "optimize-seo") {
    const ctx = await getCarrealSeoContext();
    type Out = {
      seoTitle: string;
      metaDescription: string;
      suggestedLeadOrSummary: string;
      tips: string[];
    };

    const schema = {
      type: "object",
      properties: {
        seoTitle: { type: "string", description: "Balise title Google idéale entre 48 et 62 caractères, mot-clé principal + Annecy/Carreal." },
        metaDescription: { type: "string", description: "Meta description Google entre 135 et 155 caractères, claire et incitative sans promesse exagérée." },
        suggestedLeadOrSummary: { type: "string", description: "Introduction / résumé optimisé en 2 phrases directes pour Google et les moteurs IA." },
        tips: {
          type: "array",
          minItems: 3,
          maxItems: 4,
          description: "3 conseils SEO/GEO ultra-concrets et faciles à appliquer par l'artisan sur cette page précise.",
          items: { type: "string" },
        },
      },
      required: ["seoTitle", "metaDescription", "suggestedLeadOrSummary", "tips"],
    };

    const textContext = {
      docType,
      title: doc.title ?? (doc.header as { title?: string } | undefined)?.title ?? doc.name ?? "",
      h1: doc.h1 ?? "",
      lead: doc.lead ?? doc.summary ?? (doc.header as { lead?: string } | undefined)?.lead ?? "",
      commune: doc.commune ?? "",
      bodyPreview: portableSummary(doc.body ?? doc.story).slice(0, 2200),
      notes,
    };

    const prompt = `Optimise le référencement Google et IA (GEO) de cette page du site Carreal (carreleur à Annecy / Haute-Savoie).

Contenu actuel de la page :
${JSON.stringify(textContext, null, 2)}

${ctx.promptBrief}

Consignes :
- Respecte strictement les longueurs Google : seoTitle entre 48 et 62 caractères, metaDescription entre 135 et 155 caractères.
- Évite toute cannibalisation avec les titres d'articles existants.
- Donne 3 conseils ultra-concrets en français simple (compréhensibles par un non-technicien).`;

    return {
      prompt,
      schema,
      thinkingLevel: "minimal",
      buildResponse: (raw, durationMs, model) => {
        const result = raw as Out;
        const patch: Record<string, unknown> = {};
        if (docType === "homePage" || docType === "aboutPage") {
          patch["seo.title"] = result.seoTitle;
          patch["seo.description"] = result.metaDescription;
        } else if (docType === "realisation") {
          if (!doc.title && result.seoTitle) patch.title = result.seoTitle;
          if (result.suggestedLeadOrSummary) patch.summary = result.suggestedLeadOrSummary;
        } else if (docType === "guide") {
          patch.title = result.seoTitle;
          patch.metaDescription = result.metaDescription;
          if (result.suggestedLeadOrSummary) patch.lead = result.suggestedLeadOrSummary;
        } else {
          patch.title = result.seoTitle;
          patch.metaDescription = result.metaDescription;
          if (result.suggestedLeadOrSummary && (docType === "service" || docType === "zone")) {
            patch.lead = result.suggestedLeadOrSummary;
          }
        }

        return {
          summary: `Balises SEO Google et conseils générés en ${(durationMs / 1000).toFixed(1)} s.`,
          patch,
          meta: { durationMs, model },
          preview: {
            seoTitle: result.seoTitle,
            metaDescription: result.metaDescription,
            excerpt: result.suggestedLeadOrSummary,
            tips: result.tips,
          },
        };
      },
    };
  }

  /* ---------- 4. Générer automatiquement les textes alternatifs (alt) des photos ---------- */
  if (action === "generate-alt-texts") {
    if (urls.length === 0) {
      throw Object.assign(new Error("Ajoutez d'abord au moins une photo sur ce document avant de lancer la description automatique."), {
        status: 400,
      });
    }

    type Out = { alts: string[] };
    const schema = {
      type: "object",
      properties: {
        alts: {
          type: "array",
          minItems: urls.length,
          maxItems: urls.length,
          description: `Exactement ${urls.length} descriptions visuelles sobres et précises en français (80 à 135 caractères chacune) pour l'attribut alt SEO.`,
          items: { type: "string" },
        },
      },
      required: ["alts"],
    };

    const prompt = `Observe attentivement ces ${urls.length} photo(s) du site Carreal (carreleur à Annecy) et rédige exactement ${urls.length} texte(s) alternatif(s) (attribut alt) en français, dans l'ordre exact des photos.

Contexte du document (${docType}) :
- Titre : ${String(doc.title ?? doc.name ?? "")}
- Commune : ${String(doc.commune ?? "Annecy")}
- Matériau / format : ${String(doc.material ?? "")} ${String(doc.format ?? "")}
- Notes : ${notes}

Consignes :
- Décris concrètement ce qu'on voit (pièce, matériau, format, pose, couleur, finitions) sans écrire « Photo de », « Image de » ni d'adjectifs creux (« superbe », « magnifique »).
- 80 à 135 caractères par description, naturel pour Google Images et l'accessibilité.`;

    return {
      prompt,
      schema,
      imageUrls: urls,
      thinkingLevel: "minimal",
      buildResponse: (raw, durationMs, model) => {
        const result = raw as Out;
        const mapped = (result.alts ?? []).slice(0, photoUrls.length).map((alt, i) => ({
          key: photoUrls[i]?.key,
          alt,
        }));
        return {
          summary: `${mapped.length} description(s) photo (alt) générée(s) en ${(durationMs / 1000).toFixed(1)} s depuis l'analyse visuelle Gemini.`,
          photoAlts: mapped,
          meta: { durationMs, model },
          preview: {
            photoAlts: mapped.map((m) => m.alt),
          },
        };
      },
    };
  }

  /* ---------- 5. Améliorer / corriger / enrichir le texte existant ---------- */
  if (action === "improve-text") {
    const ctx = mode === "seo" ? await getCarrealSeoContext() : null;
    type Out = {
      leadOrSummary?: string;
      sections: RawSection[];
      changesSummary: string;
    };

    const schema = {
      type: "object",
      properties: {
        leadOrSummary: { type: "string", description: "Version améliorée de l'introduction ou du résumé (si existant)." },
        sections: {
          type: "array",
          minItems: 1,
          description: "Contenu réécrit en sections claires (titre H2, paragraphes, listes à puces éventuelles).",
          items: {
            type: "object",
            properties: {
              heading: { type: "string" },
              paragraphs: { type: "array", minItems: 1, items: { type: "string" } },
              bullets: { type: "array", items: { type: "string" } },
            },
            required: ["heading", "paragraphs"],
          },
        },
        changesSummary: { type: "string", description: "Résumé en 1 phrase simple de ce qui a été amélioré." },
      },
      required: ["sections", "changesSummary"],
    };

    const modeLabel =
      mode === "seo"
        ? "Enrichir pour Google et les moteurs IA (SEO local Annecy/Haute-Savoie, précisions techniques DTU 52.2, 2 à 3 liens internes markdown vers nos pages prestations/zones vérifiées) tout en gardant un ton sobre d'artisan"
        : mode === "shorten"
          ? "Raccourcir et rendre plus direct et facile à scanner sur mobile, sans perdre les infos utiles"
          : "Corriger l'orthographe, la grammaire et clarifier les phrases tout en restant 100 % fidèle aux propos d'origine";

    const currentBody = portableSummary(doc.body ?? doc.story);
    const currentLead = String(doc.lead ?? doc.summary ?? "");

    const prompt = `Améliore le texte de ce document Carreal (${docType}).
Objectif demandé : ${modeLabel}.

Consignes supplémentaires du client :
${notes || "(Aucune consigne supplémentaire)"}

Introduction / résumé actuel :
${currentLead || "(Vide)"}

Texte actuel :
${currentBody || "(Vide — crée une trame propre à partir du titre et des consignes.)"}
${ctx ? `\n${ctx.promptBrief}` : ""}`;

    return {
      prompt,
      schema,
      thinkingLevel: mode === "seo" ? "low" : "minimal",
      buildResponse: (raw, durationMs, model) => {
        const result = raw as Out;
        const blocks = buildRichBlocks({
          sections: result.sections ?? [],
          allowedHrefs: ctx?.allowedHrefs,
        });
        const bodyField = docType === "aboutPage" ? "story" : "body";
        const patch: Record<string, unknown> = {
          [bodyField]: blocksToPortable(blocks),
        };
        if (result.leadOrSummary?.trim()) {
          if (docType === "realisation") patch.summary = result.leadOrSummary.trim();
          else if (docType === "guide" || docType === "service" || docType === "zone") patch.lead = result.leadOrSummary.trim();
        }
        return {
          summary: `${result.changesSummary} (${(durationMs / 1000).toFixed(1)} s)`,
          patch,
          meta: { durationMs, model },
          preview: {
            excerpt: result.leadOrSummary || result.sections?.[0]?.paragraphs?.[0] || "",
            headings: (result.sections ?? []).map((s) => s.heading).filter(Boolean),
            sectionsCount: result.sections?.length ?? 0,
            changesSummary: result.changesSummary,
          },
        };
      },
    };
  }

  throw Object.assign(new Error(`Action IA inconnue : ${String(action)}`), { status: 400 });
}

export async function GET() {
  return NextResponse.json({
    configured: isGeminiConfigured(),
    model: DEFAULT_GEMINI_MODEL,
    streaming: true,
  });
}

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }
  if (!isGeminiConfigured()) {
    return NextResponse.json(
      {
        error:
          "La clé API Gemini (GEMINI_API_KEY) n'est pas encore renseignée dans site/.env.local (ou dans les variables d'environnement du serveur).",
      },
      { status: 503 },
    );
  }

  let payload: RequestBody;
  try {
    payload = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
  }

  let plan: ExecutionPlan;
  try {
    plan = await prepareExecution(payload);
  } catch (err) {
    const status = typeof (err as { status?: number })?.status === "number" ? (err as { status: number }).status : 500;
    const msg = err instanceof Error ? err.message : "Requête invalide.";
    return NextResponse.json({ error: msg }, { status });
  }

  /* ---------- Mode Streaming SSE (temps réel pour le Studio) ---------- */
  if (payload.stream) {
    const encoder = new TextEncoder();
    const sse = (event: string, data: unknown) => encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

    const readable = new ReadableStream({
      async start(controller) {
        const startedAt = Date.now();
        let lastEmit = 0;
        let lastStage = "";
        let lastHeadings = 0;
        let lastFaq = 0;
        let lastIdeas = 0;

        try {
          controller.enqueue(
            sse("status", {
              stage: payload.action === "suggest-guide-ideas" ? "Analyse de vos articles et recherches Annecy…" : "Connexion à Gemini…",
              elapsedMs: 0,
              model: DEFAULT_GEMINI_MODEL,
            }),
          );

          const { data, durationMs, model } = await streamStructuredGemini({
            prompt: plan.prompt,
            schema: plan.schema,
            imageUrls: plan.imageUrls,
            thinkingLevel: plan.thinkingLevel,
            signal: req.signal,
            onRetry: (nextAttempt) => {
              lastEmit = 0;
              lastStage = "";
              lastHeadings = 0;
              lastFaq = 0;
              lastIdeas = 0;
              controller.enqueue(
                sse("status", {
                  stage:
                    nextAttempt === 2
                      ? "Reprise automatique du flux Gemini…"
                      : "Finalisation sécurisée en cours…",
                  elapsedMs: Date.now() - startedAt,
                  model: DEFAULT_GEMINI_MODEL,
                }),
              );
            },
            onDelta: (_delta, accumulated) => {
              const now = Date.now();
              const live = extractLivePreviewFromPartialJson(accumulated, payload.action);
              const structuralChange =
                live.stage !== lastStage ||
                live.headings.length !== lastHeadings ||
                live.faqQuestions.length !== lastFaq ||
                live.ideasTitles.length !== lastIdeas;

              if (structuralChange || now - lastEmit >= 140) {
                lastEmit = now;
                lastStage = live.stage;
                lastHeadings = live.headings.length;
                lastFaq = live.faqQuestions.length;
                lastIdeas = live.ideasTitles.length;
                controller.enqueue(
                  sse("progress", {
                    stage: live.stage,
                    chars: accumulated.length,
                    elapsedMs: now - startedAt,
                    live,
                  }),
                );
              }
            },
          });

          const proposal = plan.buildResponse(data, durationMs, model);
          controller.enqueue(sse("done", { proposal, elapsedMs: durationMs, model }));
        } catch (err) {
          if (!req.signal.aborted) {
            const msg = err instanceof Error ? err.message : "Erreur lors du streaming Gemini.";
            console.error("[studio-ai:stream]", msg);
            controller.enqueue(sse("error", { error: msg }));
          }
        } finally {
          try {
            controller.close();
          } catch {
            // Stream déjà fermé côté client
          }
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  /* ---------- Mode JSON classique (rétro-compatibilité) ---------- */
  try {
    const { data, durationMs, model } = await streamStructuredGemini({
      prompt: plan.prompt,
      schema: plan.schema,
      imageUrls: plan.imageUrls,
      thinkingLevel: plan.thinkingLevel,
      signal: req.signal,
    });
    return NextResponse.json(plan.buildResponse(data, durationMs, model));
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur lors de l'appel à Gemini.";
    console.error("[studio-ai]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
