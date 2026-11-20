import "server-only";

/**
 * Harness de génération d'images éditoriales SEO pour Carreal (carreleur à Annecy / Haute-Savoie).
 *
 * Objectifs :
 * 1. Zéro « AI slop » : rendu photographie documentaire d'architecture française (type AD France /
 *    Maison & Travaux), lumière naturelle alpine, textures céramiques/pierres honnêtes, joints réguliers.
 * 2. Strictement non identifiable : aucune personne, visage, main, marque, texte, panneau, numéro de rue,
 *    ni monument reconnaissable.
 * 3. SEO & Google Discover : couverture 4:3 (1200×896 ≥ 1200 px) et illustrations corps 16:9 (1376×768),
 *    noms de fichiers descriptifs en français, attributs alt contextualisés et légendes sobres.
 */

export const DEFAULT_GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-nano-banana-2.1";

export type ImageSlotRole = "hero" | "body";
export type ImageAspectRatio = "4:3" | "16:9";
export type ImageStyleType = "architectural" | "detail" | "material" | "exterior";

export type ImageRecommendationInput = {
  wordCount: number;
  h2Count: number;
  angle?: string;
  hasCover: boolean;
  existingInlineCount: number;
};

export type ImageRecommendation = {
  recommendedTotal: 1 | 2 | 3;
  recommendedNew: number;
  reason: string;
};

/**
 * Calcule le nombre optimal d'images pour un article selon les best practices SEO & UX :
 * - 1 image couverture minimum (Google Discover / Open Graph / vignette liste)
 * - +1 image corps tous les ~350–450 mots ou sections clés pour casser la densité visuelle
 * - Plafonné à 3 images au total pour préserver le ratio texte/poids page et la rapidité mobile (LCP).
 */
export function recommendArticleImageCount(input: ImageRecommendationInput): ImageRecommendation {
  const { wordCount, h2Count, angle = "auto", hasCover, existingInlineCount } = input;
  const existingTotal = (hasCover ? 1 : 0) + existingInlineCount;

  let recommendedTotal: 1 | 2 | 3 = 2;
  let reason = "";

  if (wordCount >= 820 || h2Count >= 4 || ((angle === "etapes" || angle === "comparatif") && h2Count >= 3)) {
    recommendedTotal = 3;
    reason =
      angle === "etapes"
        ? `Article technique détaillé (${h2Count} sections, ~${wordCount} mots) : 3 visuels recommandés (1 couverture 4:3 + 2 illustrations 16:9 dans le corps pour illustrer la mise en œuvre et les finitions).`
        : angle === "comparatif"
          ? `Guide comparatif riche (${h2Count} sections, ~${wordCount} mots) : 3 visuels recommandés (1 couverture 4:3 + 2 illustrations 16:9 pour comparer les matériaux et rendus).`
          : `Article long (${h2Count} sections, ~${wordCount} mots) : 3 visuels recommandés (1 couverture 4:3 Discover + 2 illustrations 16:9 pour aérer la lecture mobile).`;
  } else if (wordCount < 420 && h2Count <= 2) {
    recommendedTotal = 1;
    reason = `Format court (~${wordCount} mots, ${h2Count} section${h2Count > 1 ? "s" : ""}) : 1 photo de couverture 4:3 suffit pour garder une page rapide et équilibrée.`;
  } else {
    recommendedTotal = 2;
    reason = `Article structuré (${h2Count} sections, ~${wordCount} mots) : 2 visuels recommandés (1 couverture 4:3 pour Google Discover/vignette + 1 illustration 16:9 au cœur de l'article).`;
  }

  const recommendedNew = Math.max(0, recommendedTotal - existingTotal);
  if (existingTotal > 0) {
    const existingDesc = [
      hasCover ? "couverture déjà présente" : "pas encore de couverture",
      existingInlineCount > 0 ? `${existingInlineCount} image${existingInlineCount > 1 ? "s" : ""} dans le corps` : "aucune image dans le corps",
    ].join(", ");
    reason += ` État actuel : ${existingDesc}.`;
  }

  return { recommendedTotal, recommendedNew, reason };
}

/**
 * Normalise un nom de fichier image SEO en français (kebab-case ASCII sans accent, extension .jpg ou .png).
 */
export function sanitizeSeoFilename(raw: string, fallbackSlug = "carrelage-annecy", ext: "jpg" | "png" = "jpg"): string {
  const base = (raw || fallbackSlug)
    .replace(/\.(jpe?g|png|webp|avif)$/i, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 68);

  const safeBase = base.length >= 6 ? base : `carrelage-haute-savoie-${fallbackSlug.slice(0, 32)}`;
  return `${safeBase}.${ext}`;
}

const STYLE_PRESETS: Record<ImageStyleType, string> = {
  architectural: [
    "Editorial French architectural interior photography in the quiet documentary style of AD France and Maison & Travaux.",
    "Shot on a full-frame camera with a 35mm architectural tilt-shift lens, strictly vertical architectural lines, eye-level or slightly low perspective.",
    "Soft diffused natural northern daylight coming from an off-camera window, casting gentle honest shadows across matte porcelain stoneware or honed natural stone tiles.",
    "Subtle authentic Haute-Savoie contemporary home palette: warm mineral limestone greys, soft chalk plaster walls, untreated pale oak accents, brushed steel or matte mineral fittings.",
  ].join(" "),

  detail: [
    "Documentary craftsmanship close-up photograph of finished French tiling work, captured with a 50mm prime lens at f/4 from a subtle 30-degree oblique angle.",
    "Crisp focus on the physical reality of the trade: honest matte tile surface micro-texture, perfectly aligned 2 mm cement or epoxy grout joints, clean mitred corner or brushed aluminium threshold profile, natural light grazing the surface to reveal genuine relief.",
    "Natural daylight only, calm neutral palette, zero artificial studio glow.",
  ].join(" "),

  material: [
    "Quiet natural-light editorial flat-lay / 45-degree workbench photograph of authentic ceramic and natural stone tile samples arranged cleanly on a pale raw oak or mineral concrete surface.",
    "Shows genuine physical thickness, rectified edges, natural stone veining, unglazed stoneware body, or clean notched-trowel mortar texture with no brand packaging.",
    "Soft overcast window light from the side, honest documentary color fidelity, calm architectural styling.",
  ].join(" "),

  exterior: [
    "Authentic French Alpine residential exterior architectural photograph of a finished outdoor tiled terrace or balcony in crisp morning daylight.",
    "20 mm thick slip-resistant matte porcelain stoneware or frost-resistant stone slabs laid cleanly with narrow open drainage joints, neat threshold transition toward an aluminium bay window.",
    "Soft natural outdoor light, distant softly blurred Alpine greenery or understated hillside atmosphere with no recognizable landmark.",
  ].join(" "),
};

const STRICT_GUARDRAILS = [
  "STRICT AUTHENTICITY & NON-IDENTIFIABLE RULES (MANDATORY):",
  "- ZERO people, ZERO faces, ZERO hands, ZERO silhouettes, ZERO reflections of a photographer in glass or mirrors.",
  "- ZERO text, ZERO typography, ZERO letters, ZERO numbers, ZERO brand logos, ZERO product labels, ZERO watermarks, ZERO measurement lines or arrows.",
  "- ZERO recognizable landmarks, street signs, license plates, house numbers, or identifiable private exterior buildings.",
  "- NO glossy 3D ArchViz CGI rendering look, NO hyper-saturated HDR, NO futuristic LED neon strips, NO over-styled luxury hotel lobby clichés.",
  "- Keep micro-realism authentic: subtle natural variation in stone/ceramic tone, clean realistic grout lines, true-to-life matte reflections, natural French residential proportions, Kodak Portra / editorial architectural color science.",
].join("\n");

const LOCAL_AMBIENCE: Record<string, string> = {
  annecy: "Contemporary or renovated residential home atmosphere typical of Annecy, Haute-Savoie (clean French architectural proportions, pale plaster, oak, natural stone).",
  lac: "Bright contemporary lake-area residential atmosphere in Haute-Savoie (generous daylight, mineral stoneware, timber and aluminium frames, never showing identifiable landmarks).",
  aravis: "Modern renovated French Alpine chalet interior/exterior atmosphere (authentic brushed larch or pale spruce timber paired with matte dark slate, limestone, or stoneware tiles).",
  "haute-savoie": "Refined residential home in Haute-Savoie, France (honest mineral materials, crisp natural mountain-region daylight).",
};

export type HarnessPromptInput = {
  sceneDescriptionEn: string;
  styleType: ImageStyleType;
  role: ImageSlotRole;
  aspectRatio: ImageAspectRatio;
  localFocus?: string;
};

/**
 * Construit le prompt photographique final verrouillé par le harness Carreal.
 */
export function buildHarnessedImagePrompt(input: HarnessPromptInput): string {
  const preset = STYLE_PRESETS[input.styleType] ?? STYLE_PRESETS.architectural;
  const ambience = LOCAL_AMBIENCE[input.localFocus ?? "annecy"] ?? LOCAL_AMBIENCE.annecy;
  const framing =
    input.role === "hero"
      ? "Balanced 4:3 horizontal editorial hero composition with a clear focal subject and breathing room so it crops gracefully in thumbnails and Google Discover cards."
      : "Clean 16:9 widescreen editorial illustration composition designed to sit naturally inside a technical home-renovation article, visually explaining the exact concept without any text overlay.";

  return [
    `SUBJECT SCENE: ${input.sceneDescriptionEn.trim()}`,
    `PHOTOGRAPHIC DIRECTION: ${preset}`,
    `REGIONAL ARCHITECTURAL CONTEXT: ${ambience}`,
    `COMPOSITION: ${framing}`,
    STRICT_GUARDRAILS,
  ].join("\n\n");
}

export type ImageGenerationErrorCode = "IMAGE_BILLING_REQUIRED" | "RATE_LIMIT" | "CONFIG_MISSING" | "API_ERROR";

export class ImageGenerationError extends Error {
  code: ImageGenerationErrorCode;
  status: number;
  helpUrl?: string;

  constructor(message: string, opts: { code: ImageGenerationErrorCode; status: number; helpUrl?: string }) {
    super(message);
    this.name = "ImageGenerationError";
    this.code = opts.code;
    this.status = opts.status;
    this.helpUrl = opts.helpUrl;
  }
}

export type GeneratedImageResult = {
  base64: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
  model: string;
  durationMs: number;
};

const DIMENSIONS_1K: Record<ImageAspectRatio, { width: number; height: number }> = {
  "4:3": { width: 1200, height: 896 },
  "16:9": { width: 1376, height: 768 },
};

/**
 * Génère une image via l'API Gemini Interactions (`gemini-nano-banana-2.1` par défaut).
 * Utilise un appel `fetch` direct sur `v1/interactions` pour éviter le bug de retry Undici
 * sur les réponses 429 et renvoyer un diagnostic structuré au Studio.
 */
export async function generateHarnessedImage(opts: {
  prompt: string;
  aspectRatio: ImageAspectRatio;
  signal?: AbortSignal;
}): Promise<GeneratedImageResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new ImageGenerationError("Clé GEMINI_API_KEY absente sur le serveur.", {
      code: "CONFIG_MISSING",
      status: 503,
    });
  }

  const startedAt = Date.now();
  const model = DEFAULT_GEMINI_IMAGE_MODEL;
  const dims = DIMENSIONS_1K[opts.aspectRatio] ?? DIMENSIONS_1K["4:3"];

  const body = JSON.stringify({
    model,
    input: opts.prompt,
    response_format: {
      type: "image",
      aspect_ratio: opts.aspectRatio,
      image_size: "1K",
    },
    store: false,
  });

  let lastErr: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const timeoutSignal = AbortSignal.timeout(90_000);
      const signal = opts.signal ? AbortSignal.any([opts.signal, timeoutSignal]) : timeoutSignal;

      const res = await fetch("https://generativelanguage.googleapis.com/v1/interactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body,
        signal,
      });

      const rawText = await res.text();
      let parsed: Record<string, unknown> = {};
      try {
        const json = JSON.parse(rawText) as unknown;
        if (Array.isArray(json) && json[0] && typeof json[0] === "object") {
          parsed = json[0] as Record<string, unknown>;
        } else if (json && typeof json === "object") {
          parsed = json as Record<string, unknown>;
        }
      } catch {
        // non-JSON body
      }

      if (!res.ok) {
        const apiMessage =
          String((parsed.error as { message?: string } | undefined)?.message ?? parsed.message ?? rawText.slice(0, 300)).trim();

        if (res.status === 402 || /prepayment credits are depleted/i.test(apiMessage)) {
          throw new ImageGenerationError(
            `Votre clé API est bien passée en mode facturation, mais le solde prépayé AI Studio est actuellement à 0 \$ (« prepayment credits are depleted »). Ouvrez ai.studio/projects pour ajouter le dépôt minimal (5 \$) ou activer vos crédits prépayés sur ce projet.`,
            {
              code: "IMAGE_BILLING_REQUIRED",
              status: 402,
              helpUrl: "https://ai.studio/projects",
            },
          );
        }

        if (res.status === 429) {
          const isZeroFreeTier = /limit:\s*0|free tier/i.test(apiMessage);
          if (isZeroFreeTier) {
            throw new ImageGenerationError(
              `La génération d'images (${model}) n'est pas incluse dans le quota gratuit Google AI Studio (limite = 0 image/jour sur Free Tier). Activez la facturation « Pay-as-you-go / Tier 1 » (~0,04 €/image) sur Google AI Studio pour générer les visuels en 1 clic — ou importez directement vos propres photos de chantier ci-dessous avec le nom de fichier et le texte alt SEO déjà préparés !`,
              {
                code: "IMAGE_BILLING_REQUIRED",
                status: 402,
                helpUrl: "https://aistudio.google.com/apikey",
              },
            );
          }
          throw new ImageGenerationError(`Limite de débit Gemini atteinte (${apiMessage}). Réessayez dans quelques secondes.`, {
            code: "RATE_LIMIT",
            status: 429,
          });
        }

        if (res.status >= 500 && attempt < 2) {
          lastErr = new Error(apiMessage || `HTTP ${res.status}`);
          continue;
        }

        throw new ImageGenerationError(apiMessage || `Erreur API image Gemini (HTTP ${res.status}).`, {
          code: "API_ERROR",
          status: res.status >= 400 && res.status < 600 ? res.status : 502,
        });
      }

      const outputs = Array.isArray(parsed.outputs) ? (parsed.outputs as Record<string, unknown>[]) : [];
      const imgOutput = outputs.find((o) => o?.type === "image" && typeof o.data === "string" && o.data.length > 0);

      if (!imgOutput || typeof imgOutput.data !== "string") {
        throw new ImageGenerationError("Gemini n'a pas retourné d'image exploitable pour cette scène. Essayez de régénérer.", {
          code: "API_ERROR",
          status: 502,
        });
      }

      const mimeType = typeof imgOutput.mime_type === "string" && imgOutput.mime_type.startsWith("image/") ? imgOutput.mime_type : "image/jpeg";
      const base64 = imgOutput.data;

      return {
        base64,
        mimeType,
        dataUrl: `data:${mimeType};base64,${base64}`,
        width: dims.width,
        height: dims.height,
        model,
        durationMs: Date.now() - startedAt,
      };
    } catch (err) {
      if (err instanceof ImageGenerationError) throw err;
      if (opts.signal?.aborted) throw err;
      lastErr = err;
      if (attempt >= 2) break;
    }
  }

  throw new ImageGenerationError(lastErr instanceof Error ? lastErr.message : "Erreur réseau lors de la génération d'image.", {
    code: "API_ERROR",
    status: 502,
  });
}
