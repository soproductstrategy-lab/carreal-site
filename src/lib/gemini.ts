import "server-only";
import { GoogleGenAI } from "@google/genai";

/**
 * Client Gemini centralisé côté serveur (SDK officiel @google/genai v3+ · Interactions API).
 * Modèle par défaut : gemini-3.5-flash-lite (TTFT < 1 s, streaming fluide, multimodal Vision, coût minimal).
 * Surchargeable via GEMINI_MODEL (ex. gemini-4-hydrogen).
 * Ne jamais exposer GEMINI_API_KEY côté client.
 */
export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export type GeminiThinkingLevel = "minimal" | "low" | "medium" | "high";

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Clé API Gemini manquante. Ajoutez GEMINI_API_KEY dans le fichier .env.local (ou dans les variables d'environnement de votre hébergeur).",
    );
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Certains modèles (ex. gemini-4-hydrogen) n'acceptent pas "minimal" et demandent au minimum "low".
 */
function resolveThinkingLevel(model: string, requested?: GeminiThinkingLevel): GeminiThinkingLevel | undefined {
  if (!requested) return undefined;
  if (requested === "minimal" && model.startsWith("gemini-4-")) {
    return "low";
  }
  return requested;
}

export const CARREAL_SYSTEM_INSTRUCTION = `Tu es l'assistant éditorial et SEO/GEO local de Carreal, une entreprise artisanale de carrelage fondée en 2000 par Xavier Basso à Pringy (Annecy, Haute-Savoie).

Règles de ton et de style (STRICTES) :
- Français naturel, clair, direct, concret et professionnel : la voix d'un artisan carreleur expérimenté depuis plus de 25 ans.
- Zéro formule creuse, zéro superlatif marketing (INTERDITS : « superbe », « magnifique », « d'exception », « sublimer », « incontournable », « révolutionnaire », « clé en main magique », « leader »).
- Vocabulaire technique juste et expliqué simplement : DTU 52.2, calepinage, ragréage, étanchéité SPEC, double encollage, colle déformable C2S1/C2S2, joint époxy, grès cérame rectifié ingélif, glissance R10/R11, classement UPEC, pose sur plots, natte de désolidarisation, mise en chauffe plancher chauffant.
- Ancrage local authentique en Haute-Savoie : Annecy, Pringy, Seynod, Annecy-le-Vieux, Sévrier, Veyrier, lac d'Annecy, Épagny, Rumilly, Thônes, Aravis (contraintes réelles : cycles gel-dégel en altitude, chalets à plancher bois, copropriétés anciennes d'Annecy, résidences secondaires).
- Optimisation SEO & GEO (Google, Google AI Overviews, ChatGPT, Perplexity) :
  * Répondre franchement et avec des repères concrets dès la première phrase du chapeau (lead).
  * Structurer pour la lecture rapide : sous-titres explicites (H2), listes courtes, tableaux comparatifs ou étapes numérotées, encadrés pratiques, FAQ courte reprenant de vraies questions clients.
  * Utiliser le gras (**terme**) avec parcimonie sur les points clés et tisser des liens internes UNIQUEMENT vers les URLs Carreal fournies dans le contexte.
  * Ne jamais inventer un chiffre, une surface ou une garantie : pour tout prix, toujours rappeler qu'il s'agit de repères indicatifs et que seul un devis après visite gratuite fait foi.
- Toujours respecter exactement le schéma JSON demandé, sans texte ni balise markdown autour.`;

type ImageInputBlock = {
  type: "image";
  mime_type: "image/jpeg" | "image/png" | "image/webp";
  data: string;
};

/**
 * Télécharge de façon sécurisée une image hébergée uniquement sur le CDN Sanity (cdn.sanity.io),
 * redimensionnée à 900 px pour rester rapide et peu coûteuse en tokens vision.
 */
export async function fetchSanityImageForGemini(rawUrl: string): Promise<ImageInputBlock | null> {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname !== "cdn.sanity.io") return null;
    parsed.searchParams.set("w", "900");
    parsed.searchParams.set("q", "80");
    parsed.searchParams.set("fm", "jpg");

    const res = await fetch(parsed.toString(), { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > 4 * 1024 * 1024) return null;
    return {
      type: "image",
      mime_type: "image/jpeg",
      data: buf.toString("base64"),
    };
  } catch {
    return null;
  }
}

async function buildInput(prompt: string, imageUrls?: string[]) {
  const images = (
    await Promise.all((imageUrls ?? []).slice(0, 4).map((url) => fetchSanityImageForGemini(url)))
  ).filter((img): img is ImageInputBlock => Boolean(img));

  return images.length > 0
    ? [
        {
          type: "user_input" as const,
          content: [{ type: "text" as const, text: prompt }, ...images],
        },
      ]
    : prompt;
}

export async function runStructuredGemini<T>(opts: {
  prompt: string;
  imageUrls?: string[];
  schema: Record<string, unknown>;
  systemInstruction?: string;
  model?: string;
  thinkingLevel?: GeminiThinkingLevel;
}): Promise<T> {
  const ai = getGeminiClient();
  const model = opts.model || DEFAULT_GEMINI_MODEL;
  const thinkingLevel = resolveThinkingLevel(model, opts.thinkingLevel ?? "low");
  const input = await buildInput(opts.prompt, opts.imageUrls);

  const interaction = await ai.interactions.create({
    model,
    system_instruction: opts.systemInstruction ?? CARREAL_SYSTEM_INSTRUCTION,
    input,
    ...(thinkingLevel ? { generation_config: { thinking_level: thinkingLevel } } : {}),
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: opts.schema,
    },
    store: false,
  });

  const text = interaction.output_text?.trim();
  if (!text) {
    throw new Error("Gemini n'a renvoyé aucun contenu. Réessayez dans quelques secondes.");
  }
  return JSON.parse(text) as T;
}

/**
 * Exécute Gemini Interactions API en vrai streaming SSE (stream: true) avec sortie JSON structurée.
 * Permet d'afficher la progression et l'aperçu de l'article en direct dès les premières millisecondes.
 */
export async function streamStructuredGemini<T>(opts: {
  prompt: string;
  imageUrls?: string[];
  schema: Record<string, unknown>;
  systemInstruction?: string;
  model?: string;
  thinkingLevel?: GeminiThinkingLevel;
  signal?: AbortSignal;
  onDelta?: (deltaText: string, accumulated: string) => void;
}): Promise<{ data: T; raw: string; durationMs: number; model: string }> {
  const ai = getGeminiClient();
  const model = opts.model || DEFAULT_GEMINI_MODEL;
  const thinkingLevel = resolveThinkingLevel(model, opts.thinkingLevel ?? "low");
  const input = await buildInput(opts.prompt, opts.imageUrls);
  const startedAt = Date.now();

  const stream = await ai.interactions.create(
    {
      model,
      system_instruction: opts.systemInstruction ?? CARREAL_SYSTEM_INSTRUCTION,
      input,
      ...(thinkingLevel ? { generation_config: { thinking_level: thinkingLevel } } : {}),
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: opts.schema,
      },
      stream: true,
      store: false,
    },
    opts.signal ? { signal: opts.signal } : undefined,
  );

  let accumulated = "";
  for await (const event of stream) {
    if (opts.signal?.aborted) {
      throw new Error("Génération annulée.");
    }
    if (event.event_type === "step.delta" && event.delta?.type === "text" && event.delta.text) {
      accumulated += event.delta.text;
      opts.onDelta?.(event.delta.text, accumulated);
    }
  }

  const trimmed = accumulated.trim();
  if (!trimmed) {
    throw new Error("Gemini n'a renvoyé aucun contenu. Réessayez dans quelques secondes.");
  }
  return {
    data: JSON.parse(trimmed) as T,
    raw: trimmed,
    durationMs: Date.now() - startedAt,
    model,
  };
}
