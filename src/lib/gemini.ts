import "server-only";
import { GoogleGenAI } from "@google/genai";

/**
 * Client Gemini centralisé côté serveur (SDK officiel @google/genai v3+ · Interactions API).
 * Modèle par défaut : gemini-4-hydrogen (rapide, multimodal, haute qualité rédactionnelle FR).
 * Ne jamais exposer GEMINI_API_KEY côté client.
 */
export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-4-hydrogen";

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

export const CARREAL_SYSTEM_INSTRUCTION = `Tu es l'assistant éditorial et SEO local de Carreal, une entreprise artisanale de carrelage fondée en 2000 par Xavier Basso à Pringy (Annecy, Haute-Savoie).

Règles de ton et de style (STRICTES) :
- Français naturel, clair, direct, concret et professionnel : la voix d'un artisan carreleur expérimenté depuis plus de 25 ans.
- Zéro formule creuse, zéro superlatif marketing exagéré (évite « leader incontournable », « révolutionnaire », « d'exception », « sublimer vos espaces », « clé en main magique »).
- Vocabulaire technique juste quand c'est utile : DTU 52.2, calepinage, ragréage, étanchéité SPEC, double encollage, joint époxy, grès cérame rectifié, ingélif, R10/R11, pose sur plots, désolidarisation.
- Ancrage local naturel : Annecy, Pringy, Seynod, Annecy-le-Vieux, Sévrier, lac d'Annecy, Thônes, Aravis, Haute-Savoie (contraintes climatiques gel-dégel, chalets bois, copropriétés anciennes).
- Optimisation SEO & GEO (moteurs IA) : répondre clairement dès l'introduction avec des repères concrets, structurer avec des sous-titres explicites, rester factuel sans jamais inventer un prix ou une donnée technique absente des notes (si une info manque, rester général ou laisser vide).
- Toujours respecter exactement le schéma JSON demandé.`;

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
    // Garde-fou taille max 4 Mo
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

export async function runStructuredGemini<T>(opts: {
  prompt: string;
  imageUrls?: string[];
  schema: Record<string, unknown>;
  systemInstruction?: string;
}): Promise<T> {
  const ai = getGeminiClient();
  const images = (
    await Promise.all((opts.imageUrls ?? []).slice(0, 4).map((url) => fetchSanityImageForGemini(url)))
  ).filter((img): img is ImageInputBlock => Boolean(img));

  const input =
    images.length > 0
      ? [
          {
            type: "user_input" as const,
            content: [{ type: "text" as const, text: opts.prompt }, ...images],
          },
        ]
      : opts.prompt;

  const interaction = await ai.interactions.create({
    model: DEFAULT_GEMINI_MODEL,
    system_instruction: opts.systemInstruction ?? CARREAL_SYSTEM_INSTRUCTION,
    input,
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
