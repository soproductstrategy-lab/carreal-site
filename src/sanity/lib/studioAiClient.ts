export type GuideAngle = "auto" | "prix" | "etapes" | "comparatif" | "probleme";
export type LocalFocus = "annecy" | "lac" | "aravis" | "haute-savoie";
export type IdeaTheme = "all" | "prix" | "salle-de-bain" | "terrasse" | "problemes" | "tendances";

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
  const res = await fetch("/api/studio-ai", {
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
    let sep = buffer.indexOf("\n\n");
    while (sep !== -1) {
      const block = buffer.slice(0, sep).trim();
      buffer = buffer.slice(sep + 2);
      if (block) processBlock(block);
      sep = buffer.indexOf("\n\n");
    }
  }

  if (buffer.trim()) processBlock(buffer.trim());
  if (streamError) throw new Error(streamError);
  if (!finalProposal) throw new Error("Le flux Gemini s'est terminé sans résultat complet.");
  return finalProposal;
}
