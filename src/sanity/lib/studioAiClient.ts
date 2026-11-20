export type GuideAngle = "auto" | "prix" | "etapes" | "comparatif" | "probleme";
export type LocalFocus = "annecy" | "lac" | "aravis" | "haute-savoie";
export type IdeaTheme = "all" | "prix" | "salle-de-bain" | "terrasse" | "problemes" | "tendances";
export type ArticleImagePreference = "none" | "auto" | "1" | "2" | "3";
export type ExistingImageScope = "auto" | "cover-only" | "body-only" | "2" | "3";

export type ImagePlanSlot = {
  id: string;
  role: "hero" | "body";
  aspectRatio: "4:3" | "16:9";
  width: number;
  height: number;
  afterHeading?: string;
  styleType: "architectural" | "detail" | "material" | "exterior";
  seoFilename: string;
  alt: string;
  caption: string;
  sceneDescriptionEn: string;
  harnessedPrompt: string;
  editorialRationale: string;
};

export type ArticleImagePlan = {
  recommendedTotal: 1 | 2 | 3;
  recommendedNew: number;
  recommendationReason: string;
  existingCover: boolean;
  existingInlineCount: number;
  wordCount: number;
  h2Count: number;
  imageModel: string;
  slots: ImagePlanSlot[];
};

export type GeneratedSlotImage = {
  dataUrl: string;
  base64?: string;
  file?: File;
  mimeType: string;
  width: number;
  height: number;
  seoFilename: string;
  model?: string;
  durationMs?: number;
  source: "ai" | "upload";
};

export type SlotImageState = {
  slot: ImagePlanSlot;
  status: "planned" | "generating" | "ready" | "error";
  image?: GeneratedSlotImage;
  error?: string;
  errorCode?: string;
  helpUrl?: string;
  included: boolean;
};

export type GuideIdea = {
  title: string;
  targetKeyword: string;
  category: "Prix" | "Conseils techniques" | "Problèmes & réparations";
  angle: GuideAngle;
  localFocus: LocalFocus;
  searchIntent: string;
  whyItConverts: string;
  brief: string;
};

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
};

export type StreamProgress = {
  stage: string;
  chars: number;
  elapsedMs: number;
  live?: LiveStreamPreview;
};

export type AiProposal = {
  summary: string;
  patch?: Record<string, unknown>;
  photoAlts?: { key?: string; alt: string }[];
  ideas?: GuideIdea[];
  imagePlan?: ArticleImagePlan;
  meta?: { durationMs: number; model: string };
  preview?: {
    title?: string;
    h1?: string;
    category?: string;
    targetKeyword?: string;
    slug?: string;
    meta?: string;
    seoTitle?: string;
    metaDescription?: string;
    excerpt?: string;
    headings?: string[];
    photoAlts?: string[];
    tips?: string[];
    faqCount?: number;
    faqQuestions?: string[];
    hasTable?: boolean;
    hasSteps?: boolean;
    hasSpec?: boolean;
    internalLinksCount?: number;
    relatedServices?: string[];
    sectionsCount?: number;
    changesSummary?: string;
  };
};

export type PendingGuideBrief = {
  title: string;
  notes: string;
  angle: GuideAngle;
  localFocus: LocalFocus;
  autoRun?: boolean;
};

const BRIEF_KEY = "carreal_pending_guide_brief_v1";

export function savePendingGuideBrief(brief: PendingGuideBrief) {
  try {
    sessionStorage.setItem(BRIEF_KEY, JSON.stringify(brief));
  } catch {
    // Ignore storage quota / private mode
  }
}

export function consumePendingGuideBrief(): PendingGuideBrief | null {
  try {
    const raw = sessionStorage.getItem(BRIEF_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(BRIEF_KEY);
    return JSON.parse(raw) as PendingGuideBrief;
  } catch {
    return null;
  }
}

/**
 * Consomme le flux SSE de /api/studio-ai en temps réel (tokens + aperçu progressif + résultat final).
 */
export async function streamStudioAi(
  body: Record<string, unknown>,
  opts: {
    signal?: AbortSignal;
    onProgress?: (p: StreamProgress) => void;
  } = {},
): Promise<AiProposal> {
  const res = await fetch("/api/studio-ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, stream: true }),
    signal: opts.signal,
  });

  if (!res.ok) {
    let message = "Impossible de contacter l'assistant Gemini.";
    try {
      const err = (await res.json()) as { error?: string };
      if (err.error) message = err.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("text/event-stream") || !res.body) {
    return (await res.json()) as AiProposal;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalProposal: AiProposal | null = null;
  let streamError: string | null = null;

  const processBlock = (block: string) => {
    const lines = block.split(/\r?\n/);
    let eventName = "message";
    const dataLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith("event:")) eventName = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) return;
    const rawData = dataLines.join("\n");
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawData) as Record<string, unknown>;
    } catch {
      return;
    }

    if (eventName === "status") {
      opts.onProgress?.({
        stage: String(parsed.stage ?? "Connexion à Gemini…"),
        chars: 0,
        elapsedMs: Number(parsed.elapsedMs ?? 0),
      });
    } else if (eventName === "progress") {
      opts.onProgress?.({
        stage: String(parsed.stage ?? "Rédaction en cours…"),
        chars: Number(parsed.chars ?? 0),
        elapsedMs: Number(parsed.elapsedMs ?? 0),
        live: parsed.live as LiveStreamPreview | undefined,
      });
    } else if (eventName === "done") {
      finalProposal = (parsed.proposal as AiProposal) ?? null;
    } else if (eventName === "error") {
      streamError = String(parsed.error ?? "Erreur lors du streaming Gemini.");
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split(/\r?\n\r?\n/);
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed) processBlock(trimmed);
    }
  }

  if (buffer.trim()) processBlock(buffer.trim());
  if (streamError) throw new Error(streamError);
  if (!finalProposal) throw new Error("Le flux Gemini s'est terminé sans résultat complet.");
  return finalProposal;
}

export class StudioImageApiError extends Error {
  code?: string;
  helpUrl?: string;
  status: number;

  constructor(message: string, opts: { code?: string; helpUrl?: string; status: number }) {
    super(message);
    this.name = "StudioImageApiError";
    this.code = opts.code;
    this.helpUrl = opts.helpUrl;
    this.status = opts.status;
  }
}

/**
 * Génère une image SEO via /api/studio-ai/image/ (Gemini Nano Banana 2.1 + harness Carreal).
 */
export async function generateArticleSlotImage(
  slot: ImagePlanSlot,
  opts: { localFocus?: LocalFocus; signal?: AbortSignal } = {},
): Promise<GeneratedSlotImage> {
  const res = await fetch("/api/studio-ai/image/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sceneDescriptionEn: slot.sceneDescriptionEn,
      harnessedPrompt: slot.harnessedPrompt,
      styleType: slot.styleType,
      role: slot.role,
      aspectRatio: slot.aspectRatio,
      localFocus: opts.localFocus ?? "annecy",
      seoFilename: slot.seoFilename,
      alt: slot.alt,
      caption: slot.caption,
      afterHeading: slot.afterHeading,
    }),
    signal: opts.signal,
  });

  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    code?: string;
    helpUrl?: string;
    dataUrl?: string;
    base64?: string;
    mimeType?: string;
    width?: number;
    height?: number;
    seoFilename?: string;
    model?: string;
    durationMs?: number;
  };

  if (!res.ok || !data.dataUrl || !data.base64) {
    throw new StudioImageApiError(data.error || "Impossible de générer cette image.", {
      code: data.code,
      helpUrl: data.helpUrl,
      status: res.status,
    });
  }

  return {
    dataUrl: data.dataUrl,
    base64: data.base64,
    mimeType: data.mimeType || "image/jpeg",
    width: data.width || slot.width,
    height: data.height || slot.height,
    seoFilename: data.seoFilename || slot.seoFilename,
    model: data.model,
    durationMs: data.durationMs,
    source: "ai",
  };
}

/**
 * Convertit une image base64 générée en Blob prêt pour `client.assets.upload("image", blob, { filename })`.
 */
export function base64ToBlob(base64: string, mimeType = "image/jpeg"): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

/**
 * Lit un fichier photo importé par l'artisan pour prévisualisation instantanée avant upload Sanity.
 */
export function readLocalImageFile(file: File): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Impossible de lire le fichier photo."));
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      const img = new Image();
      img.onload = () => resolve({ dataUrl, width: img.naturalWidth || 1200, height: img.naturalHeight || 896 });
      img.onerror = () => resolve({ dataUrl, width: 1200, height: 896 });
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
