import { type NextRequest, NextResponse } from "next/server";
import {
  buildHarnessedImagePrompt,
  DEFAULT_GEMINI_IMAGE_MODEL,
  generateHarnessedImage,
  ImageGenerationError,
  sanitizeSeoFilename,
  type ImageAspectRatio,
  type ImageSlotRole,
  type ImageStyleType,
} from "@/lib/carreal-image-harness";
import { isGeminiConfigured } from "@/lib/gemini";

/** Durée maximale sur Vercel Fluid Compute. */
export const maxDuration = 120;

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

type GenerateImagePayload = {
  sceneDescriptionEn?: string;
  harnessedPrompt?: string;
  styleType?: ImageStyleType;
  role?: ImageSlotRole;
  aspectRatio?: ImageAspectRatio;
  localFocus?: string;
  seoFilename?: string;
  alt?: string;
  caption?: string;
  afterHeading?: string;
};

export async function GET() {
  return NextResponse.json({
    configured: isGeminiConfigured(),
    model: DEFAULT_GEMINI_IMAGE_MODEL,
  });
}

export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }
  if (!isGeminiConfigured()) {
    return NextResponse.json(
      {
        error: "La clé API Gemini (GEMINI_API_KEY) n'est pas configurée sur le serveur.",
        code: "CONFIG_MISSING",
      },
      { status: 503 },
    );
  }

  let payload: GenerateImagePayload;
  try {
    payload = (await req.json()) as GenerateImagePayload;
  } catch {
    return NextResponse.json({ error: "Requête JSON invalide." }, { status: 400 });
  }

  const role: ImageSlotRole = payload.role === "body" ? "body" : "hero";
  const aspectRatio: ImageAspectRatio = payload.aspectRatio === "16:9" ? "16:9" : role === "body" ? "16:9" : "4:3";
  const styleType: ImageStyleType =
    payload.styleType && ["architectural", "detail", "material", "exterior"].includes(payload.styleType)
      ? payload.styleType
      : "architectural";

  const prompt =
    payload.sceneDescriptionEn?.trim()
      ? buildHarnessedImagePrompt({
          sceneDescriptionEn: payload.sceneDescriptionEn,
          styleType,
          role,
          aspectRatio,
          localFocus: payload.localFocus,
        })
      : payload.harnessedPrompt?.trim() || "";

  if (!prompt) {
    return NextResponse.json({ error: "Description de scène manquante pour générer l'image." }, { status: 400 });
  }

  try {
    const result = await generateHarnessedImage({
      prompt,
      aspectRatio,
      signal: req.signal,
    });

    const ext: "jpg" | "png" = result.mimeType.includes("png") ? "png" : "jpg";
    const seoFilename = sanitizeSeoFilename(payload.seoFilename ?? "carrelage-annecy", "carrelage-annecy", ext);

    return NextResponse.json({
      ...result,
      seoFilename,
      role,
      aspectRatio,
      alt: payload.alt ?? "",
      caption: payload.caption ?? "",
      afterHeading: payload.afterHeading,
    });
  } catch (err) {
    if (err instanceof ImageGenerationError) {
      return NextResponse.json(
        {
          error: err.message,
          code: err.code,
          helpUrl: err.helpUrl,
          model: DEFAULT_GEMINI_IMAGE_MODEL,
        },
        { status: err.status },
      );
    }
    const msg = err instanceof Error ? err.message : "Erreur inattendue lors de la génération d'image.";
    console.error("[studio-ai:image]", msg);
    return NextResponse.json({ error: msg, code: "API_ERROR" }, { status: 500 });
  }
}
