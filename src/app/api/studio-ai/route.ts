import { type NextRequest, NextResponse } from "next/server";
import { DEFAULT_GEMINI_MODEL, isGeminiConfigured, runStructuredGemini } from "@/lib/gemini";
import { blocksToPortable, key } from "@/sanity/portable";
import type { Block, PatternName } from "@/content/types";

/** Durée maximale sur Vercel Fluid Compute (jusqu'à 300 s même sur Hobby) pour les générations de guides complets. */
export const maxDuration = 300;

type AiAction =
  | "generate-realisation"
  | "generate-guide"
  | "optimize-seo"
  | "generate-alt-texts"
  | "improve-text";

type RequestBody = {
  action: AiAction;
  docType: string;
  notes?: string;
  mode?: "clarify" | "seo" | "shorten";
  document?: Record<string, unknown>;
  photoUrls?: { key?: string; url: string }[];
};

const VALID_PATTERNS: PatternName[] = ["droit", "decale", "chevron", "batons", "opus", "mosaique", "grand"];

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!origin || !host) return true; // requêtes same-origin ou SSR
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

function sectionsToBlocks(
  sections: { heading?: string; paragraphs?: string[]; bullets?: string[]; calloutTitle?: string; calloutText?: string }[],
): Block[] {
  const out: Block[] = [];
  for (const sec of sections) {
    if (sec.heading?.trim()) out.push({ type: "h2", text: sec.heading.trim() });
    for (const p of sec.paragraphs ?? []) {
      if (p.trim()) out.push({ type: "p", text: p.trim() });
    }
    const items = (sec.bullets ?? []).map((b) => b.trim()).filter(Boolean);
    if (items.length) out.push({ type: "ul", items });
    if (sec.calloutText?.trim()) {
      out.push({ type: "callout", title: sec.calloutTitle?.trim() || "Conseil de carreleur", text: sec.calloutText.trim(), tone: "info" });
    }
  }
  return out;
}

export async function GET() {
  return NextResponse.json({
    configured: isGeminiConfigured(),
    model: DEFAULT_GEMINI_MODEL,
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

  const { action, docType, notes = "", mode = "clarify", document: doc = {}, photoUrls = [] } = payload;
  const urls = photoUrls.map((p) => p.url).filter(Boolean).slice(0, 4);

  try {
    /* ---------- 1. Générer une fiche chantier complète (notes + photos) ---------- */
    if (action === "generate-realisation") {
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
        sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
        photoAlts: string[];
      };

      const schema = {
        type: "object",
        properties: {
          title: { type: "string", description: "Titre clair du chantier sans le nom de la ville s'il est redondant, 40 à 65 caractères." },
          commune: { type: "string", description: "Nom de la commune en Haute-Savoie (ex. Seynod, Annecy-le-Vieux, Sévrier, La Clusaz)." },
          room: { type: "string", description: "Type de pièce ou espace (ex. Salle de bain, Terrasse, Séjour-cuisine)." },
          material: { type: "string", description: "Matériau posé (ex. Grès cérame effet pierre, Travertin, Ardoise et zellige)." },
          format: { type: "string", description: "Format des carreaux (ex. 60×120, 120×120, 30×60)." },
          layout: { type: "string", description: "Type de pose (ex. Pose droite, Pavé décalé 1/3, Opus romain)." },
          joint: { type: "string", description: "Largeur et type de joint si connus (ex. 2 mm époxy, 3 mm sur plots)." },
          surface: { type: "string", description: "Surface si mentionnée (ex. 14 m², 48 m²), sinon chaîne vide." },
          duration: { type: "string", description: "Durée si mentionnée (ex. 5 jours), sinon chaîne vide." },
          pattern: {
            type: "string",
            enum: VALID_PATTERNS,
            description: "Motif géométrique le plus proche : droit, decale, chevron, batons, opus, mosaique ou grand.",
          },
          summary: { type: "string", description: "Résumé en 2 phrases concrètes : le besoin initial et la solution réalisée." },
          sections: {
            type: "array",
            minItems: 2,
            description: "2 ou 3 sections courtes pour le récit du chantier (ex. Le besoin, Nos choix techniques, Le résultat).",
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
          photoAlts: {
            type: "array",
            description:
              urls.length > 0
                ? `Exactement ${urls.length} descriptions SEO (attribut alt, 80 à 140 caractères) correspondant dans l'ordre aux photos fournies.`
                : "Aucune photo fournie : renvoyer un tableau vide [].",
            items: { type: "string" },
          },
        },
        required: ["title", "commune", "room", "material", "format", "layout", "joint", "surface", "duration", "pattern", "summary", "sections", "photoAlts"],
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

Consignes :
- Ne jamais inventer une surface ou une durée si elle n'est pas indiquée (laisse chaîne vide dans ce cas).
- Utilise le symbole « × » (et non x) pour les formats (ex. 60×120).
- Si des photos sont jointes, observe réellement le carrelage, la pièce, la couleur, la pose et les finitions pour enrichir la fiche et rédiger ${urls.length} balise(s) alt précises et naturelles.`;

      const result = await runStructuredGemini<Out>({ prompt, imageUrls: urls, schema });
      const blocks = sectionsToBlocks(result.sections ?? []);
      const safePattern: PatternName = VALID_PATTERNS.includes(result.pattern as PatternName) ? (result.pattern as PatternName) : "droit";

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
      };

      return NextResponse.json({
        summary: "Fiche chantier générée en brouillon (titre, fiche technique, récit et textes photos).",
        patch,
        photoAlts: (result.photoAlts ?? []).slice(0, photoUrls.length).map((alt, i) => ({
          key: photoUrls[i]?.key,
          alt,
        })),
        preview: {
          title: result.title,
          slug: (patch.slug as { current: string }).current,
          meta: [result.commune, result.room, result.format, result.surface, result.duration].filter(Boolean).join(" · "),
          excerpt: result.summary,
          photoAlts: result.photoAlts ?? [],
        },
      });
    }

    /* ---------- 2. Générer un article « Prix & conseils » SEO & GEO ---------- */
    if (action === "generate-guide") {
      type Out = {
        title: string;
        h1: string;
        category: "Prix" | "Conseils techniques" | "Problèmes & réparations";
        readingMinutes: number;
        lead: string;
        metaDescription: string;
        sections: { heading: string; paragraphs: string[]; bullets?: string[]; calloutTitle?: string; calloutText?: string }[];
        faq: { q: string; a: string }[];
      };

      const schema = {
        type: "object",
        properties: {
          title: { type: "string", description: "Titre SEO clair (50 à 65 caractères)." },
          h1: { type: "string", description: "Titre principal affiché sur la page." },
          category: { type: "string", enum: ["Prix", "Conseils techniques", "Problèmes & réparations"] },
          readingMinutes: { type: "integer", description: "Temps de lecture estimé entre 3 et 8 minutes." },
          lead: { type: "string", description: "Réponse directe et chiffrée en 2 à 3 phrases dès le début (format idéal Google & moteurs IA)." },
          metaDescription: { type: "string", description: "Meta description Google entre 135 et 155 caractères." },
          sections: {
            type: "array",
            minItems: 3,
            description: "Obligatoirement 3 à 4 sections pédagogiques avec sous-titres H2, paragraphes concrets, puces et au moins un conseil encadré.",
            items: {
              type: "object",
              properties: {
                heading: { type: "string" },
                paragraphs: { type: "array", minItems: 1, items: { type: "string" } },
                bullets: { type: "array", items: { type: "string" } },
                calloutTitle: { type: "string" },
                calloutText: { type: "string" },
              },
              required: ["heading", "paragraphs"],
            },
          },
          faq: {
            type: "array",
            minItems: 3,
            description: "Obligatoirement 3 ou 4 questions fréquentes concrètes avec réponses courtes et franches.",
            items: {
              type: "object",
              properties: {
                q: { type: "string" },
                a: { type: "string" },
              },
              required: ["q", "a"],
            },
          },
        },
        required: ["title", "h1", "category", "readingMinutes", "lead", "metaDescription", "sections", "faq"],
      };

      const prompt = `Rédige un guide pratique Carreal optimisé SEO local (Annecy / Haute-Savoie) et GEO (citable par Google AI Overviews, ChatGPT et Perplexity).

Sujet / notes de l'artisan :
${notes || String(doc.title ?? "Guide pratique carrelage")}

Catégorie actuelle : ${String(doc.category ?? "Conseils techniques")}

Consignes :
- Commence par la réponse directe dans le chapeau (lead) : concret, chiffré si pertinent, sans suspense inutile.
- Donne des conseils techniques fiables (DTU 52.2, support, étanchéité, gel en Haute-Savoie si extérieur).
- Précise toujours que les prix indiqués sont des repères et que seul un devis après visite fait foi si tu mentionnes des tarifs.`;

      const result = await runStructuredGemini<Out>({ prompt, imageUrls: urls, schema });
      const blocks = sectionsToBlocks(result.sections ?? []);

      const patch: Record<string, unknown> = {
        title: result.title,
        h1: result.h1,
        slug: { _type: "slug", current: slugify(result.title) },
        category: result.category,
        readingMinutes: Math.max(2, Math.min(12, Math.round(result.readingMinutes || 5))),
        lead: result.lead,
        metaDescription: result.metaDescription,
        body: blocksToPortable(blocks),
        faq: (result.faq ?? []).map((f) => ({ _type: "faqItem", _key: key(), q: f.q, a: f.a })),
        updated: new Date().toISOString().slice(0, 10),
      };

      return NextResponse.json({
        summary: `Article complet généré (${result.sections.length} sections + ${result.faq.length} questions FAQ + SEO).`,
        patch,
        preview: {
          title: result.title,
          slug: (patch.slug as { current: string }).current,
          metaDescription: result.metaDescription,
          excerpt: result.lead,
          faqCount: result.faq.length,
        },
      });
    }

    /* ---------- 3. Optimiser le SEO Google & GEO sur n'importe quel document ---------- */
    if (action === "optimize-seo") {
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
          suggestedLeadOrSummary: { type: "string", description: "Introduction / résumé optimisé en 2 phrases directes pour Google et les moteurs IA (laisser vide si non pertinent)." },
          tips: {
            type: "array",
            description: "3 conseils SEO concrets et faciles à appliquer pour l'artisan sur cette page précise.",
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

Consignes :
- Respecte strictement les longueurs Google : seoTitle entre 48 et 62 caractères, metaDescription entre 135 et 155 caractères.
- Donne 3 conseils ultra-concrets en français simple (compréhensibles par un non-technicien).`;

      const result = await runStructuredGemini<Out>({ prompt, schema });

      const patch: Record<string, unknown> = {};
      if (docType === "homePage" || docType === "aboutPage") {
        patch["seo.title"] = result.seoTitle;
        patch["seo.description"] = result.metaDescription;
      } else if (docType === "realisation") {
        if (result.suggestedLeadOrSummary) patch.summary = result.suggestedLeadOrSummary;
      } else if (docType === "guide") {
        patch.metaDescription = result.metaDescription;
        if (!doc.title) patch.title = result.seoTitle;
        if (result.suggestedLeadOrSummary) patch.lead = result.suggestedLeadOrSummary;
      } else {
        patch.title = result.seoTitle;
        patch.metaDescription = result.metaDescription;
        if (result.suggestedLeadOrSummary && (docType === "service" || docType === "zone")) {
          patch.lead = result.suggestedLeadOrSummary;
        }
      }

      return NextResponse.json({
        summary: "Balises SEO Google et conseils d'amélioration générés.",
        patch,
        preview: {
          seoTitle: result.seoTitle,
          metaDescription: result.metaDescription,
          excerpt: result.suggestedLeadOrSummary,
          tips: result.tips,
        },
      });
    }

    /* ---------- 4. Générer automatiquement les textes alternatifs (alt) des photos ---------- */
    if (action === "generate-alt-texts") {
      if (urls.length === 0) {
        return NextResponse.json(
          { error: "Ajoutez d'abord au moins une photo sur ce document avant de lancer la description automatique." },
          { status: 400 },
        );
      }

      type Out = { alts: string[] };
      const schema = {
        type: "object",
        properties: {
          alts: {
            type: "array",
            description: `Exactement ${urls.length} descriptions visuelles précises en français (80 à 140 caractères chacune) pour l'attribut alt SEO et l'accessibilité.`,
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
- Décris concrètement ce qu'on voit (type de pièce, type de carrelage, format/pose, finition, lumière) sans écrire « Photo de » ou « Image de ».
- 80 à 140 caractères par description, naturel pour Google Images et les lecteurs d'écran.`;

      const result = await runStructuredGemini<Out>({ prompt, imageUrls: urls, schema });
      const mapped = (result.alts ?? []).slice(0, photoUrls.length).map((alt, i) => ({
        key: photoUrls[i]?.key,
        alt,
      }));

      return NextResponse.json({
        summary: `${mapped.length} description(s) photo (alt) générée(s) depuis l'analyse visuelle Gemini.`,
        photoAlts: mapped,
        preview: {
          photoAlts: mapped.map((m) => m.alt),
        },
      });
    }

    /* ---------- 5. Améliorer / corriger / enrichir le texte existant ---------- */
    if (action === "improve-text") {
      type Out = {
        leadOrSummary?: string;
        sections: { heading: string; paragraphs: string[]; bullets?: string[] }[];
        changesSummary: string;
      };

      const schema = {
        type: "object",
        properties: {
          leadOrSummary: { type: "string", description: "Version améliorée de l'introduction ou du résumé (si existant)." },
          sections: {
            type: "array",
            description: "Contenu réécrit en sections claires (titre H2, paragraphes, listes à puces éventuelles).",
            items: {
              type: "object",
              properties: {
                heading: { type: "string" },
                paragraphs: { type: "array", items: { type: "string" } },
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
          ? "Enrichir pour Google et les moteurs IA (SEO local Annecy/Haute-Savoie, précisions techniques métier, structure claire) tout en gardant un ton sobre d'artisan"
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
${currentBody || "(Vide — crée une trame propre à partir du titre et des consignes.)"}`;

      const result = await runStructuredGemini<Out>({ prompt, schema });
      const blocks = sectionsToBlocks(result.sections ?? []);
      const bodyField = docType === "aboutPage" ? "story" : "body";
      const patch: Record<string, unknown> = {
        [bodyField]: blocksToPortable(blocks),
      };
      if (result.leadOrSummary?.trim()) {
        if (docType === "realisation") patch.summary = result.leadOrSummary.trim();
        else if (docType === "guide" || docType === "service" || docType === "zone") patch.lead = result.leadOrSummary.trim();
      }

      return NextResponse.json({
        summary: result.changesSummary,
        patch,
        preview: {
          excerpt: result.leadOrSummary || result.sections?.[0]?.paragraphs?.[0] || "",
          sectionsCount: result.sections?.length ?? 0,
          changesSummary: result.changesSummary,
        },
      });
    }

    return NextResponse.json({ error: `Action IA inconnue : ${action}` }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur lors de l'appel à Gemini.";
    console.error("[studio-ai]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
