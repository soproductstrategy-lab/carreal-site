"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type SanityDocument, useClient, useDocumentOperation } from "sanity";
import type { UserViewComponent } from "sanity/structure";
import { ArticleImageStudio } from "@/sanity/components/ArticleImageStudio";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import {
  base64ToBlob,
  consumePendingGuideBrief,
  generateArticleSlotImage,
  readLocalImageFile,
  streamStudioAi,
  StudioImageApiError,
  type AiProposal,
  type ArticleImagePlan,
  type ArticleImagePreference,
  type ExistingImageScope,
  type GuideAngle,
  type GuideIdea,
  type IdeaTheme,
  type ImagePlanSlot,
  type LocalFocus,
  type SlotImageState,
  type StreamProgress,
} from "@/sanity/lib/studioAiClient";

type PhotoRef = { _key?: string; _type?: string; asset?: { _ref?: string }; alt?: string };

let sanityKeyCounter = 0;
function makeSanityKey(): string {
  sanityKeyCounter += 1;
  return `img${sanityKeyCounter.toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function sanityRefToUrl(ref?: string): string | null {
  if (!ref || !projectId) return null;
  const m = ref.match(/^image-([a-zA-Z0-9]+)-(\d+x\d+)-([a-z0-9]+)$/);
  if (!m) return null;
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${m[1]}-${m[2]}.${m[3]}`;
}

function extractPhotoRefs(
  doc: SanityDocument | null,
): { key?: string; url: string; alt?: string; field: "photos" | "image" | "photo" | "hero.photo" | "body" }[] {
  if (!doc) return [];
  const out: { key?: string; url: string; alt?: string; field: "photos" | "image" | "photo" | "hero.photo" | "body" }[] = [];

  if (Array.isArray(doc.photos)) {
    for (const item of doc.photos as PhotoRef[]) {
      const url = sanityRefToUrl(item?.asset?._ref);
      if (url) out.push({ key: item._key, url, alt: item.alt, field: "photos" });
    }
  }
  const singleImage = doc.image as PhotoRef | undefined;
  if (singleImage?.asset?._ref) {
    const url = sanityRefToUrl(singleImage.asset._ref);
    if (url) out.push({ url, alt: singleImage.alt, field: "image" });
  }
  const singlePhoto = doc.photo as PhotoRef | undefined;
  if (singlePhoto?.asset?._ref) {
    const url = sanityRefToUrl(singlePhoto.asset._ref);
    if (url) out.push({ url, alt: singlePhoto.alt, field: "photo" });
  }
  const heroPhoto = (doc.hero as { photo?: PhotoRef } | undefined)?.photo;
  if (heroPhoto?.asset?._ref) {
    const url = sanityRefToUrl(heroPhoto.asset._ref);
    if (url) out.push({ url, alt: heroPhoto.alt, field: "hero.photo" });
  }
  if (Array.isArray(doc.body)) {
    for (const item of doc.body as PhotoRef[]) {
      if (item?._type === "illustration" && item.asset?._ref) {
        const url = sanityRefToUrl(item.asset._ref);
        if (url) out.push({ key: item._key, url, alt: item.alt, field: "body" });
      }
    }
  }
  return out;
}

function portableNodeHeadingText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const o = node as Record<string, unknown>;
  if (o._type !== "block" || o.style !== "h2" || !Array.isArray(o.children)) return "";
  return (o.children as { text?: string }[])
    .map((c) => c.text ?? "")
    .join("")
    .trim();
}

/**
 * Insère proprement des blocs `illustration` dans un tableau Portable Text `body`,
 * juste après le premier paragraphe suivant le sous-titre H2 cible (ou au milieu si aucun H2 ne correspond).
 */
function insertIllustrationsIntoBody(
  baseBody: unknown[],
  insertions: { afterHeading?: string; block: Record<string, unknown> }[],
): unknown[] {
  const next = [...baseBody];
  for (const ins of insertions) {
    const target = (ins.afterHeading ?? "").trim().toLowerCase();
    let insertAt = -1;

    if (target) {
      const h2Index = next.findIndex((node) => {
        const text = portableNodeHeadingText(node).toLowerCase();
        return text === target || (text.length > 8 && (text.includes(target) || target.includes(text)));
      });
      if (h2Index >= 0) {
        // Place l'image après le 1er bloc de contenu sous ce H2 (sans dépasser le H2 suivant)
        let cursor = h2Index + 1;
        while (cursor < next.length) {
          const cur = next[cursor] as Record<string, unknown> | undefined;
          if (cur?._type === "block" && cur.style === "h2") break;
          cursor += 1;
          if (cur?._type === "block" && cur.style === "normal") break;
        }
        insertAt = cursor;
      }
    }

    if (insertAt < 0) {
      insertAt = Math.min(next.length, Math.max(1, Math.floor(next.length / 2)));
    }

    next.splice(insertAt, 0, ins.block);
  }
  return next;
}

function getSeoSnapshot(doc: SanityDocument | null) {
  if (!doc) return { title: "", description: "", slug: "", lead: "" };
  const t = doc._type;
  const slug = (doc.slug as { current?: string } | undefined)?.current ?? "";
  if (t === "homePage" || t === "aboutPage") {
    const seo = (doc.seo as { title?: string; description?: string } | undefined) ?? {};
    const header = (doc.header as { lead?: string } | undefined) ?? {};
    return { title: seo.title ?? "", description: seo.description ?? "", slug: t === "homePage" ? "" : "entreprise", lead: header.lead ?? "" };
  }
  if (t === "realisation") {
    const title = [doc.title, doc.commune].filter(Boolean).join(" à ");
    return {
      title: title ? `${title} – Réalisation Carreal` : "",
      description: String(doc.summary ?? ""),
      slug: slug ? `realisations/${slug}` : "",
      lead: String(doc.summary ?? ""),
    };
  }
  return {
    title: String(doc.title ?? doc.name ?? ""),
    description: String(doc.metaDescription ?? doc.lead ?? ""),
    slug: slug ? `${t === "service" ? "prestations" : t === "zone" ? "zones-intervention" : "conseils"}/${slug}` : "",
    lead: String(doc.lead ?? ""),
  };
}

type SeoCheck = { label: string; ok: boolean; detail: string; points: number; max: number };

function evaluateSeoScore(doc: SanityDocument | null, schemaName: string, photosCount: number, missingAlts: number) {
  const seo = getSeoSnapshot(doc);
  const body = Array.isArray(doc?.body) ? (doc.body as Record<string, unknown>[]) : Array.isArray(doc?.story) ? (doc.story as Record<string, unknown>[]) : [];
  const faq = Array.isArray(doc?.faq) ? doc.faq : [];
  const related = Array.isArray(doc?.relatedServices) ? doc.relatedServices : Array.isArray(doc?.services) ? doc.services : [];

  let h2Count = 0;
  let wordCount = 0;
  let internalLinks = 0;
  let hasRichBlock = false;

  for (const node of body) {
    const type = String(node._type ?? "");
    if (type === "block") {
      if (node.style === "h2") h2Count++;
      const children = Array.isArray(node.children) ? (node.children as { text?: string }[]) : [];
      const text = children.map((c) => c.text ?? "").join(" ");
      wordCount += text.trim() ? text.trim().split(/\s+/).length : 0;
      const markDefs = Array.isArray(node.markDefs) ? (node.markDefs as { _type?: string; href?: string }[]) : [];
      internalLinks += markDefs.filter((m) => m._type === "link" && m.href?.startsWith("/")).length;
    } else if (["tableau", "steps", "callout", "spec"].includes(type)) {
      hasRichBlock = true;
    }
  }

  const localRegex = /annecy|pringy|seynod|s[ée]vrier|veyrier|th[ôo]nes|aravis|haute-savoie|rumilly|[ée]pagny|clusaz|carreal/i;
  const hasLocalTitle = localRegex.test(seo.title);

  const checks: SeoCheck[] = [
    {
      label: "Titre Google",
      ok: seo.title.length >= 38 && seo.title.length <= 68,
      detail: seo.title.length === 0 ? "À remplir" : `${seo.title.length} car.${hasLocalTitle ? " · ancrage local ✓" : " · ajouter Annecy"}`,
      points: seo.title.length >= 38 && seo.title.length <= 68 ? (hasLocalTitle ? 15 : 10) : seo.title.length > 0 ? 5 : 0,
      max: 15,
    },
    {
      label: "Description Google",
      ok: seo.description.length >= 115 && seo.description.length <= 165,
      detail: seo.description.length === 0 ? "À remplir (135–155 car.)" : `${seo.description.length} car.`,
      points: seo.description.length >= 115 && seo.description.length <= 165 ? 15 : seo.description.length > 40 ? 7 : 0,
      max: 15,
    },
    {
      label: "Réponse directe (GEO / IA)",
      ok: seo.lead.length >= 130 && seo.lead.length <= 420,
      detail: seo.lead.length === 0 ? "Chapeau 2–3 phrases manquant" : `${seo.lead.length} car.`,
      points: seo.lead.length >= 130 && seo.lead.length <= 420 ? 15 : seo.lead.length > 40 ? 8 : 0,
      max: 15,
    },
    {
      label: "Structure & profondeur",
      ok: h2Count >= 2 && wordCount >= 220,
      detail: `${h2Count} H2 · ~${wordCount} mots${hasRichBlock ? " · bloc riche ✓" : ""}`,
      points: (h2Count >= 2 ? 8 : h2Count > 0 ? 4 : 0) + (wordCount >= 220 ? 7 : wordCount >= 80 ? 3 : 0) + (hasRichBlock ? 5 : 0),
      max: 20,
    },
    {
      label: "Maillage interne",
      ok: internalLinks >= 2 || related.length >= 2,
      detail: `${internalLinks} lien(s) dans le texte · ${related.length} prestation(s) liée(s)`,
      points: (internalLinks >= 2 ? 10 : internalLinks >= 1 ? 5 : 0) + (related.length >= 1 ? 5 : 0),
      max: 15,
    },
    {
      label: "Photos & textes alt",
      ok: photosCount > 0 && missingAlts === 0,
      detail: photosCount === 0 ? "Ajouter au moins 1 photo" : missingAlts === 0 ? `${photosCount} photo(s) décrite(s)` : `${missingAlts} alt manquant(s)`,
      points: photosCount > 0 ? (missingAlts === 0 ? 10 : 5) : 0,
      max: 10,
    },
  ];

  if (["guide", "service", "zone"].includes(schemaName)) {
    checks.push({
      label: "FAQ Google (JSON-LD)",
      ok: faq.length >= 3,
      detail: faq.length >= 3 ? `${faq.length} questions` : `${faq.length}/3 questions recommandées`,
      points: faq.length >= 3 ? 10 : faq.length > 0 ? 5 : 0,
      max: 10,
    });
  } else {
    // Rebalance à 100 pour les types sans FAQ (realisation, homePage, aboutPage)
    checks[3].max += 10;
    if (h2Count >= 2 && wordCount >= 120) checks[3].points += 10;
  }

  const total = checks.reduce((s, c) => s + c.points, 0);
  const max = checks.reduce((s, c) => s + c.max, 0);
  const score = max > 0 ? Math.round((total / max) * 100) : 0;
  return { score, checks };
}

function StatusPill({ tone, children }: { tone: "ok" | "warn" | "bad" | "neutral"; children: React.ReactNode }) {
  const colors = {
    ok: { bg: "#dcfce7", fg: "#166534", border: "#86efac" },
    warn: { bg: "#fef3c7", fg: "#92400e", border: "#fcd34d" },
    bad: { bg: "#fee2e2", fg: "#991b1b", border: "#fca5a5" },
    neutral: { bg: "#f1f5f9", fg: "#334155", border: "#cbd5e1" },
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 3,
        fontSize: 12,
        fontWeight: 650,
        background: colors.bg,
        color: colors.fg,
        border: `1px solid ${colors.border}`,
      }}
    >
      {children}
    </span>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#fbfbf9",
  border: "1px solid #d4d6d2",
  borderRadius: 4,
  padding: 20,
  color: "#1f2124",
};

const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 16px",
  borderRadius: 3,
  border: "2px solid #e1251b",
  background: "#e1251b",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};

const btnSecondary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 14px",
  borderRadius: 3,
  border: "1.5px solid #1f2124",
  background: "#ffffff",
  color: "#1f2124",
  fontWeight: 650,
  fontSize: 13.5,
  cursor: "pointer",
};

const btnSubtle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "7px 12px",
  borderRadius: 3,
  border: "1px solid #c4c7c3",
  background: "#ffffff",
  color: "#2c2f33",
  fontWeight: 600,
  fontSize: 13,
  cursor: "pointer",
};

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: "6px 11px",
    borderRadius: 3,
    border: active ? "1.5px solid #1f2124" : "1px solid #c4c7c3",
    background: active ? "#1f2124" : "#ffffff",
    color: active ? "#ffffff" : "#2c2f33",
    fontWeight: active ? 700 : 600,
    fontSize: 12.5,
    cursor: "pointer",
  };
}

const ANGLE_OPTIONS: { value: GuideAngle; label: string; hint: string }[] = [
  { value: "auto", label: "✨ Auto", hint: "L'IA choisit le meilleur format" },
  { value: "prix", label: "💰 Prix & tableau", hint: "Fourchettes TTC + tableau de prix" },
  { value: "etapes", label: "🔧 Étapes DTU", hint: "Étapes numérotées + fiche technique" },
  { value: "comparatif", label: "⚖️ Comparatif", hint: "Tableau comparatif + verdict artisan" },
  { value: "probleme", label: "🚨 Problème & solution", hint: "Diagnostic + causes + réparation" },
];

const LOCAL_OPTIONS: { value: LocalFocus; label: string }[] = [
  { value: "annecy", label: "Annecy & bassin" },
  { value: "lac", label: "Rives du lac" },
  { value: "aravis", label: "Aravis / Montagne" },
  { value: "haute-savoie", label: "Haute-Savoie" },
];

const IDEA_THEMES: { value: IdeaTheme; label: string }[] = [
  { value: "all", label: "Tous sujets" },
  { value: "prix", label: "💰 Prix & aides" },
  { value: "salle-de-bain", label: "🚿 Salle de bain" },
  { value: "terrasse", label: "🏔️ Terrasse & gel" },
  { value: "problemes", label: "🔧 Problèmes" },
  { value: "tendances", label: "📐 Grand format" },
];

const NEW_ARTICLE_IMAGE_OPTIONS: { value: ArticleImagePreference; label: string; hint: string }[] = [
  { value: "auto", label: "✨ Recommandé (auto)", hint: "L'IA recommande 1 à 3 visuels selon la longueur" },
  { value: "none", label: "Sans image", hint: "Texte + SEO uniquement" },
  { value: "1", label: "1 (couverture)", hint: "Couverture 4:3 Google Discover" },
  { value: "2", label: "2 images", hint: "1 couverture 4:3 + 1 dans le corps" },
  { value: "3", label: "3 images", hint: "1 couverture 4:3 + 2 dans le corps" },
];

const EXISTING_IMAGE_SCOPES: { value: ExistingImageScope; label: string }[] = [
  { value: "auto", label: "✨ Recommandé" },
  { value: "cover-only", label: "Couverture seule" },
  { value: "body-only", label: "Corps uniquement" },
  { value: "2", label: "2 images" },
  { value: "3", label: "3 images" },
];

function mergePatchForPreview(
  baseDoc: SanityDocument | null,
  patchObj: Record<string, unknown> | undefined,
  schemaName: string,
): SanityDocument {
  const merged: Record<string, unknown> = {
    _id: baseDoc?._id ?? "drafts.preview",
    _type: baseDoc?._type ?? schemaName,
    _createdAt: baseDoc?._createdAt ?? "",
    _updatedAt: baseDoc?._updatedAt ?? "",
    _rev: baseDoc?._rev ?? "",
    ...(baseDoc ?? {}),
  };
  if (!patchObj) return merged as SanityDocument;
  for (const [k, v] of Object.entries(patchObj)) {
    if (k.includes(".")) {
      const [root, child] = k.split(".");
      const prev = merged[root] && typeof merged[root] === "object" ? (merged[root] as Record<string, unknown>) : {};
      merged[root] = { ...prev, [child]: v };
    } else {
      merged[k] = v;
    }
  }
  return merged as SanityDocument;
}

/**
 * Onglet « ✨ Assistant IA » intégré dans chaque document Sanity Studio.
 * Streaming temps réel SSE + cerveau SEO local carreleur (anti-cannibalisation, maillage interne vérifié,
 * tableaux/étapes/FAQ JSON-LD, score SEO/GEO en direct).
 */
export const AiAssistantView: UserViewComponent = ({ document, documentId, schemaType }) => {
  const displayed = (document.displayed ?? document.draft ?? document.published) as SanityDocument | null;
  const cleanId = documentId.replace(/^drafts\./, "");
  const client = useClient({ apiVersion });
  const { patch, commit } = useDocumentOperation(cleanId, schemaType.name);

  const [initialBrief] = useState(() => (schemaType.name === "guide" ? consumePendingGuideBrief() : null));
  const [status, setStatus] = useState<{ loading: boolean; configured: boolean; model?: string; imageModel?: string; streaming?: boolean }>({
    loading: true,
    configured: false,
  });
  const [notes, setNotes] = useState(() => initialBrief?.notes ?? "");
  const [angle, setAngle] = useState<GuideAngle>(() => initialBrief?.angle ?? "auto");
  const [localFocus, setLocalFocus] = useState<LocalFocus>(() => initialBrief?.localFocus ?? "annecy");
  const [imagePref, setImagePref] = useState<ArticleImagePreference>("auto");
  const [existingImageScope, setExistingImageScope] = useState<ExistingImageScope>("auto");
  const [ideaTheme, setIdeaTheme] = useState<IdeaTheme>("all");
  const [ideas, setIdeas] = useState<GuideIdea[]>([]);

  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [streamProgress, setStreamProgress] = useState<StreamProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null);
  const [proposal, setProposal] = useState<AiProposal | null>(null);
  const [appliedDoc, setAppliedDoc] = useState<SanityDocument | null>(null);
  const [applying, setApplying] = useState(false);

  const [imagePlan, setImagePlan] = useState<ArticleImagePlan | null>(null);
  const [imageSlots, setImageSlots] = useState<SlotImageState[]>([]);
  const [generatingImages, setGeneratingImages] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const imageAbortRef = useRef<AbortController | null>(null);
  const autoTriggeredRef = useRef(false);

  const isRealisation = schemaType.name === "realisation";
  const isGuide = schemaType.name === "guide";
  const hasRichBody = ["realisation", "guide", "service", "zone", "aboutPage"].includes(schemaType.name);

  useEffect(() => {
    let active = true;
    fetch("/api/studio-ai/")
      .then((r) => r.json())
      .then((d: { configured?: boolean; model?: string; imageModel?: string; streaming?: boolean }) => {
        if (!active) return;
        const configured = Boolean(d.configured);
        setStatus({ loading: false, configured, model: d.model, imageModel: d.imageModel, streaming: Boolean(d.streaming) });
        if (configured && initialBrief?.autoRun && !autoTriggeredRef.current) {
          autoTriggeredRef.current = true;
          void runAction("generate-guide", {
            notesOverride: initialBrief.notes,
            angleOverride: initialBrief.angle,
            localFocusOverride: initialBrief.localFocus,
          });
        }
      })
      .catch(() => {
        if (active) setStatus({ loading: false, configured: false });
      });
    return () => {
      active = false;
      abortRef.current?.abort();
      imageAbortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const photos = useMemo(() => extractPhotoRefs(displayed), [displayed]);
  const missingAlts = photos.filter((p) => !p.alt?.trim()).length;
  const readyIncludedImages = useMemo(
    () => imageSlots.filter((s) => s.included && s.status === "ready" && s.image),
    [imageSlots],
  );

  // Document effectif pour l'aperçu Google & le score SEO/GEO :
  // - si une proposition IA est prête, on prévisualise immédiatement son impact,
  // - sinon, on prend le brouillon Sanity (ou le snapshot optimiste juste après clic sur Appliquer).
  const baseForAudit = displayed && (displayed.title || displayed.lead || displayed.summary || displayed.seo) ? displayed : appliedDoc ?? displayed;
  const effectiveDoc = useMemo(
    () => (proposal?.patch ? mergePatchForPreview(baseForAudit, proposal.patch, schemaType.name) : baseForAudit),
    [baseForAudit, proposal?.patch, schemaType.name],
  );
  const projectedPhotoCount = photos.length + readyIncludedImages.length;
  const effectiveMissingAlts = proposal?.photoAlts?.length ? Math.max(0, missingAlts - proposal.photoAlts.length) : missingAlts;
  const seo = useMemo(() => getSeoSnapshot(effectiveDoc), [effectiveDoc]);
  const seoAudit = useMemo(
    () => evaluateSeoScore(effectiveDoc, schemaType.name, projectedPhotoCount, effectiveMissingAlts),
    [effectiveDoc, schemaType.name, projectedPhotoCount, effectiveMissingAlts],
  );
  const currentAudit = useMemo(
    () => evaluateSeoScore(baseForAudit, schemaType.name, photos.length, missingAlts),
    [baseForAudit, schemaType.name, photos.length, missingAlts],
  );

  async function generateImagesForSlotIds(targetSlots: ImagePlanSlot[], focusOverride?: LocalFocus) {
    if (!targetSlots.length) return;
    imageAbortRef.current?.abort();
    const controller = new AbortController();
    imageAbortRef.current = controller;
    setGeneratingImages(true);

    try {
      for (const slot of targetSlots) {
        if (controller.signal.aborted) break;
        setImageSlots((prev) =>
          prev.map((item) =>
            item.slot.id === slot.id ? { ...item, status: "generating", error: undefined, errorCode: undefined } : item,
          ),
        );
        try {
          const generated = await generateArticleSlotImage(slot, {
            localFocus: focusOverride ?? localFocus,
            signal: controller.signal,
          });
          setImageSlots((prev) =>
            prev.map((item) =>
              item.slot.id === slot.id
                ? {
                    ...item,
                    status: "ready",
                    image: generated,
                    slot: { ...item.slot, seoFilename: generated.seoFilename },
                    error: undefined,
                    errorCode: undefined,
                  }
                : item,
            ),
          );
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") break;
          const isApiErr = err instanceof StudioImageApiError;
          const msg = err instanceof Error ? err.message : "Erreur lors de la génération d'image.";
          const code = isApiErr ? err.code : undefined;
          const helpUrl = isApiErr ? err.helpUrl : undefined;

          setImageSlots((prev) =>
            prev.map((item) =>
              item.slot.id === slot.id ? { ...item, status: "error", error: msg, errorCode: code, helpUrl } : item,
            ),
          );

          // Si Google AI Studio renvoie Free Tier limit: 0, inutile de boucler sur les slots suivants
          if (code === "IMAGE_BILLING_REQUIRED") break;
        }
      }
    } finally {
      setGeneratingImages(false);
    }
  }

  async function planArticleImages(
    targetDoc: Record<string, unknown>,
    scope: ExistingImageScope | ArticleImagePreference,
    opts: { autoGenerate: boolean; focusOverride?: LocalFocus; angleOverride?: GuideAngle } = { autoGenerate: true },
  ) {
    if (scope === "none") return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setAppliedMsg(null);
    setBusyAction("plan-article-images");
    setStreamProgress({ stage: "Analyse de l'article et calcul des visuels SEO recommandés…", chars: 0, elapsedMs: 0 });

    try {
      const data = await streamStudioAi(
        {
          action: "plan-article-images",
          docType: "guide",
          notes,
          angle: opts.angleOverride ?? angle,
          localFocus: opts.focusOverride ?? localFocus,
          imageScope: scope,
          document: targetDoc,
        },
        {
          signal: controller.signal,
          onProgress: (p) => setStreamProgress(p),
        },
      );

      if (data.imagePlan) {
        const initialStates: SlotImageState[] = data.imagePlan.slots.map((slot) => ({
          slot,
          status: "planned",
          included: true,
        }));
        setImagePlan(data.imagePlan);
        setImageSlots(initialStates);
        setBusyAction(null);
        setStreamProgress(null);

        if (opts.autoGenerate && data.imagePlan.slots.length > 0) {
          void generateImagesForSlotIds(data.imagePlan.slots, opts.focusOverride);
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        setError("Planification des images interrompue.");
      } else {
        setError(e instanceof Error ? e.message : "Impossible de planifier les images.");
      }
    } finally {
      setBusyAction(null);
      setStreamProgress(null);
    }
  }

  async function runAction(
    action: string,
    extra?: {
      mode?: "clarify" | "seo" | "shorten";
      notesOverride?: string;
      angleOverride?: GuideAngle;
      localFocusOverride?: LocalFocus;
      themeOverride?: IdeaTheme;
    },
  ) {
    abortRef.current?.abort();
    imageAbortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setAppliedMsg(null);
    if (action !== "suggest-guide-ideas") {
      setProposal(null);
      setImagePlan(null);
      setImageSlots([]);
    }
    setStreamProgress({ stage: "Connexion à Gemini…", chars: 0, elapsedMs: 0 });
    setBusyAction(action + (extra?.mode ?? ""));

    try {
      const data = await streamStudioAi(
        {
          action,
          docType: schemaType.name,
          notes: extra?.notesOverride ?? notes,
          mode: extra?.mode,
          angle: extra?.angleOverride ?? angle,
          localFocus: extra?.localFocusOverride ?? localFocus,
          theme: extra?.themeOverride ?? ideaTheme,
          document: displayed ?? {},
          photoUrls: photos.slice(0, 4).map((p) => ({ key: p.key, url: p.url })),
        },
        {
          signal: controller.signal,
          onProgress: (p) => setStreamProgress(p),
        },
      );

      if (action === "suggest-guide-ideas") {
        setIdeas(data.ideas ?? []);
      } else {
        setProposal(data);
        // Si c'est un nouvel article et que les illustrations sont activées, enchaîne la planification + génération d'images SEO
        if (action === "generate-guide" && data.patch && imagePref !== "none") {
          const mergedArticle = mergePatchForPreview(displayed, data.patch, schemaType.name);
          setBusyAction(null);
          setStreamProgress(null);
          void planArticleImages(mergedArticle as Record<string, unknown>, imagePref, {
            autoGenerate: true,
            focusOverride: extra?.localFocusOverride ?? localFocus,
            angleOverride: extra?.angleOverride ?? angle,
          });
          return;
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        setError("Génération interrompue.");
      } else {
        setError(e instanceof Error ? e.message : "Erreur inattendue.");
      }
    } finally {
      setBusyAction(null);
      setStreamProgress(null);
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
    imageAbortRef.current?.abort();
  }

  function pickIdeaAndWrite(idea: GuideIdea) {
    const fullBrief = `${idea.title} (mot-clé ciblé : ${idea.targetKeyword}). ${idea.brief}`;
    setNotes(fullBrief);
    setAngle(idea.angle);
    setLocalFocus(idea.localFocus);
    void runAction("generate-guide", {
      notesOverride: fullBrief,
      angleOverride: idea.angle,
      localFocusOverride: idea.localFocus,
    });
  }

  function handleGenerateSingleSlot(slotId: string) {
    const target = imageSlots.find((s) => s.slot.id === slotId);
    if (!target) return;
    void generateImagesForSlotIds([target.slot]);
  }

  function handleGenerateAllMissing() {
    const targets = imageSlots.filter((s) => s.included && (s.status === "planned" || s.status === "error")).map((s) => s.slot);
    if (!targets.length) return;
    void generateImagesForSlotIds(targets);
  }

  async function handleUploadLocalFile(slotId: string, file: File) {
    try {
      const { dataUrl, width, height } = await readLocalImageFile(file);
      const ext = file.type === "image/png" ? "png" : "jpg";
      setImageSlots((prev) =>
        prev.map((item) => {
          if (item.slot.id !== slotId) return item;
          const baseFilename = item.slot.seoFilename.replace(/\.(jpe?g|png|webp)$/i, "");
          const seoFilename = `${baseFilename || "carrelage-annecy"}.${ext}`;
          return {
            ...item,
            status: "ready",
            error: undefined,
            errorCode: undefined,
            slot: { ...item.slot, seoFilename },
            image: {
              dataUrl,
              file,
              mimeType: file.type || "image/jpeg",
              width,
              height,
              seoFilename,
              source: "upload",
            },
          };
        }),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'importer cette photo.");
    }
  }

  function handleUpdateSlotMeta(slotId: string, metaPatch: Partial<Pick<ImagePlanSlot, "alt" | "caption" | "seoFilename">>) {
    setImageSlots((prev) =>
      prev.map((item) => (item.slot.id === slotId ? { ...item, slot: { ...item.slot, ...metaPatch } } : item)),
    );
  }

  function handleToggleInclude(slotId: string) {
    setImageSlots((prev) => prev.map((item) => (item.slot.id === slotId ? { ...item, included: !item.included } : item)));
  }

  /** Upload sur le CDN Sanity (avec session Studio connectée + nom de fichier SEO). */
  async function uploadReadySlotsToSanity(entries: SlotImageState[]) {
    let heroImage: Record<string, unknown> | undefined;
    const bodyInsertions: { afterHeading?: string; block: Record<string, unknown> }[] = [];

    for (const entry of entries) {
      if (!entry.image) continue;
      const filename = entry.slot.seoFilename.trim() || "carrelage-annecy.jpg";
      const contentType = entry.image.mimeType || "image/jpeg";
      const payloadBlob: Blob | File = entry.image.file ?? base64ToBlob(entry.image.base64 ?? "", contentType);

      const asset = await client.assets.upload("image", payloadBlob, {
        filename,
        contentType,
      });

      if (entry.slot.role === "hero") {
        heroImage = {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
          alt: entry.slot.alt.trim(),
          ...(entry.slot.caption.trim() ? { caption: entry.slot.caption.trim() } : {}),
        };
      } else {
        bodyInsertions.push({
          afterHeading: entry.slot.afterHeading,
          block: {
            _type: "illustration",
            _key: makeSanityKey(),
            asset: { _type: "reference", _ref: asset._id },
            alt: entry.slot.alt.trim(),
            ...(entry.slot.caption.trim() ? { caption: entry.slot.caption.trim() } : {}),
          },
        });
      }
    }

    return { heroImage, bodyInsertions };
  }

  async function applyProposal() {
    if (!proposal && readyIncludedImages.length === 0) return;
    if (patch.disabled) {
      setError(`Impossible de modifier ce brouillon pour l'instant (${String(patch.disabled)}).`);
      return;
    }
    setApplying(true);
    setError(null);
    try {
      const setObj: Record<string, unknown> = { ...(proposal?.patch ?? {}) };

      if (proposal?.photoAlts?.length && photos.length > 0) {
        const altByKey = new Map(proposal.photoAlts.filter((a) => a.key).map((a) => [a.key!, a.alt]));
        const firstField = photos[0].field;
        if (firstField === "photos" && Array.isArray(displayed?.photos)) {
          const updatedPhotos = (displayed.photos as PhotoRef[]).map((item, idx) => {
            const nextAlt = (item._key && altByKey.get(item._key)) || proposal.photoAlts?.[idx]?.alt;
            return nextAlt ? { ...item, alt: nextAlt } : item;
          });
          setObj.photos = updatedPhotos;
        } else {
          const coverPhotoIdx = photos.findIndex((p) => p.field === "image");
          if (coverPhotoIdx >= 0 && proposal.photoAlts[coverPhotoIdx]?.alt) {
            setObj["image.alt"] = proposal.photoAlts[coverPhotoIdx].alt;
          } else if (firstField === "photo" && proposal.photoAlts[0]?.alt) {
            setObj["photo.alt"] = proposal.photoAlts[0].alt;
          } else if (firstField === "hero.photo" && proposal.photoAlts[0]?.alt) {
            setObj["hero.photo.alt"] = proposal.photoAlts[0].alt;
          }

          // Met aussi à jour les alt des illustrations inline dans `body`
          if (Array.isArray(displayed?.body) && photos.some((p) => p.field === "body")) {
            let changedBody = false;
            const updatedBody = (displayed.body as PhotoRef[]).map((node) => {
              if (node?._type === "illustration" && node._key && altByKey.has(node._key)) {
                changedBody = true;
                return { ...node, alt: altByKey.get(node._key) };
              }
              return node;
            });
            if (changedBody) setObj.body = updatedBody;
          }
        }
      }

      // Upload des visuels IA / importés vers Sanity CDN et injection dans `image` + `body`
      let uploadedCount = 0;
      if (readyIncludedImages.length > 0) {
        const { heroImage, bodyInsertions } = await uploadReadySlotsToSanity(readyIncludedImages);
        uploadedCount = (heroImage ? 1 : 0) + bodyInsertions.length;
        if (heroImage) {
          setObj.image = heroImage;
        }
        if (bodyInsertions.length > 0) {
          const baseBody = Array.isArray(setObj.body)
            ? (setObj.body as unknown[])
            : Array.isArray(displayed?.body)
              ? (displayed.body as unknown[])
              : [];
          setObj.body = insertIllustrationsIntoBody(baseBody, bodyInsertions);
        }
      }

      if (Object.keys(setObj).length > 0) {
        patch.execute([{ set: setObj }]);
        if (!commit.disabled) {
          commit.execute();
        }
        setAppliedDoc(mergePatchForPreview(displayed, setObj, schemaType.name));
        setAppliedMsg(
          uploadedCount > 0
            ? `Brouillon enregistré dans Sanity avec ${uploadedCount} image${uploadedCount > 1 ? "s" : ""} SEO uploadée${uploadedCount > 1 ? "s" : ""} ! Relisez dans « Éditer », vérifiez dans « 👁 Aperçu », puis cliquez sur « Publier ».`
            : "Brouillon enregistré dans Sanity ! Relisez dans « Éditer », vérifiez dans « 👁 Aperçu », puis cliquez sur « Publier ».",
        );
        setProposal(null);
        if (uploadedCount > 0) {
          setImagePlan(null);
          setImageSlots([]);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'appliquer les modifications.");
    } finally {
      setApplying(false);
    }
  }

  const disabled = !status.configured || Boolean(busyAction);
  const live = streamProgress?.live;
  const scoreTone = seoAudit.score >= 80 ? "ok" : seoAudit.score >= 55 ? "warn" : "bad";

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif", color: "#1f2124" }}>
      <div style={{ display: "grid", gap: 18 }}>
        {/* En-tête + statut Gemini */}
        <div style={{ ...cardStyle, borderTop: "4px solid #e1251b" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>✨ Assistant rédaction & SEO local Carreal</h2>
              <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#555a5f" }}>
                Streaming temps réel, ton d&apos;artisan carreleur, maillage interne vérifié, tableaux, étapes DTU 52.2 et FAQ Google. Rien n&apos;est publié sans votre validation.
              </p>
            </div>
            {status.loading ? (
              <StatusPill tone="neutral">Vérification…</StatusPill>
            ) : status.configured ? (
              <StatusPill tone="ok">⚡ Prêt · {status.model} · Streaming</StatusPill>
            ) : (
              <StatusPill tone="warn">Clé GEMINI_API_KEY requise</StatusPill>
            )}
          </div>

          {!status.loading && !status.configured && (
            <div style={{ marginTop: 14, padding: 12, borderRadius: 3, background: "#fef3c7", border: "1px solid #fcd34d", fontSize: 13, color: "#78350f" }}>
              Pour activer l&apos;assistant IA, ajoutez <code>GEMINI_API_KEY=votre_cle</code> dans <code>site/.env.local</code> (ou dans Vercel) puis redémarrez.
            </div>
          )}
        </div>

        {/* Bloc Idées d'articles SEO (uniquement sur les guides) */}
        {isGuide && (
          <div style={{ ...cardStyle, background: "#ffffff" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 750 }}>💡 Besoin d&apos;une idée d&apos;article qui ramène des devis ?</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#555a5f" }}>
                  Gemini analyse vos articles déjà publiés et propose 6 sujets carreleur sans doublon pour Annecy et la Haute-Savoie.
                </p>
              </div>
              <button
                type="button"
                disabled={disabled}
                onClick={() => runAction("suggest-guide-ideas")}
                style={{ ...btnSecondary, opacity: disabled ? 0.55 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
              >
                {busyAction === "suggest-guide-ideas" ? "Recherche d'idées…" : "💡 Trouver 6 idées SEO"}
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {IDEA_THEMES.map((t) => (
                <button key={t.value} type="button" onClick={() => setIdeaTheme(t.value)} style={pillStyle(ideaTheme === t.value)}>
                  {t.label}
                </button>
              ))}
            </div>

            {ideas.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginTop: 14 }}>
                {ideas.map((idea, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#fbfbf9",
                      border: "1px solid #d4d6d2",
                      borderRadius: 4,
                      padding: 14,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
                        <StatusPill tone="neutral">{idea.category}</StatusPill>
                        <StatusPill tone="ok">{idea.searchIntent}</StatusPill>
                      </div>
                      <div style={{ fontWeight: 750, fontSize: 14, lineHeight: 1.35 }}>{idea.title}</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: "#b8180f", fontWeight: 650 }}>🔎 « {idea.targetKeyword} »</div>
                      <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#555a5f", lineHeight: 1.45 }}>{idea.whyItConverts}</p>
                    </div>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => pickIdeaAndWrite(idea)}
                      style={{ ...btnPrimary, padding: "8px 12px", fontSize: 13, justifyContent: "center", opacity: disabled ? 0.55 : 1 }}
                    >
                      ✍️ Rédiger cet article
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Formulaire brief + options SEO + actions */}
        <div style={cardStyle}>
          <label htmlFor="carreal-ai-notes" style={{ display: "block", fontWeight: 750, fontSize: 14, marginBottom: 8 }}>
            {isRealisation
              ? "1. Vos notes rapides sur le chantier (même en vrac ou dictées au téléphone)"
              : isGuide
                ? "1. Sujet de l'article ou question que posent vos clients"
                : "1. Consignes facultatives pour guider Gemini"}
          </label>
          <textarea
            id="carreal-ai-notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
            placeholder={
              isRealisation
                ? "Ex. : Douche à l'italienne à Seynod, remplacement baignoire, grès cérame effet pierre 60×120 posé en décalé, 12 m², 5 jours, joint époxy gris clair, niche encastrée…"
                : isGuide
                  ? "Ex. : Poser du carrelage sur plancher chauffant à Annecy : compatibilité, colle C2S1, protocole de mise en chauffe DTU 52.2 et prix au m²…"
                  : "Ex. : Insister sur la garantie décennale, la pose sur plancher chauffant et nos chantiers autour du lac d'Annecy…"
            }
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 12,
              borderRadius: 3,
              border: "1.5px solid #9ca3af",
              background: "#ffffff",
              fontSize: 14,
              lineHeight: 1.5,
              color: "#1f2124",
              resize: "vertical",
            }}
          />

          {isGuide && (
            <div style={{ display: "grid", gap: 12, marginTop: 14, padding: 12, background: "#ffffff", border: "1px solid #e0e2de", borderRadius: 3 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 750, color: "#555a5f", textTransform: "uppercase", marginBottom: 6 }}>
                  Format de l&apos;article (blocs Google Featured Snippets)
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ANGLE_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button" title={opt.hint} onClick={() => setAngle(opt.value)} style={pillStyle(angle === opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 750, color: "#555a5f", textTransform: "uppercase", marginBottom: 6 }}>
                  Ancrage géographique prioritaire
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {LOCAL_OPTIONS.map((opt) => (
                    <button key={opt.value} type="button" onClick={() => setLocalFocus(opt.value)} style={pillStyle(localFocus === opt.value)}>
                      📍 {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 750, color: "#555a5f", textTransform: "uppercase", marginBottom: 6 }}>
                  🖼️ Illustrations SEO à la création de l&apos;article (couverture 4:3 + corps 16:9)
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {NEW_ARTICLE_IMAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      title={opt.hint}
                      onClick={() => setImagePref(opt.value)}
                      style={pillStyle(imagePref === opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {photos.length > 0 && (
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "#555a5f" }}>
              📷 <strong>{photos.length} photo{photos.length > 1 ? "s" : ""}</strong> détectée{photos.length > 1 ? "s" : ""} sur ce document — Gemini peut les analyser directement
              {missingAlts > 0 ? ` (${missingAlts} sans description SEO)` : " (descriptions SEO déjà remplies)"}.
            </p>
          )}

          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 750, fontSize: 14, marginBottom: 10 }}>2. Choisissez une action</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {isRealisation && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => runAction("generate-realisation")}
                  style={{ ...btnPrimary, opacity: disabled ? 0.55 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
                >
                  ✨ {busyAction === "generate-realisation" ? "Rédaction en direct…" : "Rédiger toute la fiche chantier"}
                </button>
              )}

              {isGuide && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => runAction("generate-guide")}
                  style={{ ...btnPrimary, opacity: disabled ? 0.55 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
                >
                  ✨{" "}
                  {busyAction === "generate-guide"
                    ? "Rédaction en direct…"
                    : imagePref === "none"
                      ? "Rédiger l'article complet (sans image)"
                      : "Rédiger l'article complet + illustrations SEO"}
                </button>
              )}

              {isGuide && (
                <button
                  type="button"
                  disabled={disabled || generatingImages}
                  onClick={() =>
                    planArticleImages((effectiveDoc ?? {}) as Record<string, unknown>, existingImageScope, {
                      autoGenerate: true,
                    })
                  }
                  style={{
                    ...btnSecondary,
                    opacity: disabled || generatingImages ? 0.55 : 1,
                    cursor: disabled || generatingImages ? "not-allowed" : "pointer",
                  }}
                >
                  🖼️{" "}
                  {busyAction === "plan-article-images"
                    ? "Planification SEO…"
                    : "Illustrer cet article (couverture + corps)"}
                </button>
              )}

              <button
                type="button"
                disabled={disabled}
                onClick={() => runAction("optimize-seo")}
                style={{
                  ...(!isRealisation && !isGuide ? btnPrimary : btnSecondary),
                  opacity: disabled ? 0.55 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              >
                🎯 {busyAction === "optimize-seo" ? "Analyse SEO…" : "Optimiser le SEO Google"}
              </button>

              {photos.length > 0 && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => runAction("generate-alt-texts")}
                  style={{ ...btnSecondary, opacity: disabled ? 0.55 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
                >
                  📷 {busyAction === "generate-alt-texts" ? "Analyse Vision…" : `Décrire ${photos.length > 1 ? `les ${photos.length} photos` : "la photo"} (SEO)`}
                </button>
              )}
            </div>

            {isGuide && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 12px",
                  background: "#ffffff",
                  border: "1px dashed #c4c7c3",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: 12.5, color: "#475569", fontWeight: 600 }}>
                  Article déjà en brouillon ou publié ? Choisissez quoi illustrer sans toucher au texte :
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {EXISTING_IMAGE_SCOPES.map((sc) => (
                    <button
                      key={sc.value}
                      type="button"
                      onClick={() => setExistingImageScope(sc.value)}
                      style={pillStyle(existingImageScope === sc.value)}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasRichBody && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => runAction("improve-text", { mode: "clarify" })}
                  style={{ ...btnSubtle, opacity: disabled ? 0.55 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
                >
                  ✏️ {busyAction === "improve-textclarify" ? "Correction…" : "Corriger & clarifier"}
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => runAction("improve-text", { mode: "seo" })}
                  style={{ ...btnSubtle, opacity: disabled ? 0.55 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
                >
                  🔎 {busyAction === "improve-textseo" ? "Enrichissement…" : "Enrichir SEO & liens internes"}
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => runAction("improve-text", { mode: "shorten" })}
                  style={{ ...btnSubtle, opacity: disabled ? 0.55 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
                >
                  ✂️ {busyAction === "improve-textshorten" ? "Synthèse…" : "Raccourcir & dynamiser"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Aperçu en direct pendant le streaming SSE */}
        {busyAction && streamProgress && (
          <div style={{ ...cardStyle, background: "#eff6ff", border: "2px solid #3b82f6", color: "#1e3a8a" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 99, background: "#e1251b" }} />
                <strong style={{ fontSize: 14.5 }}>{streamProgress.stage}</strong>
                <span style={{ fontSize: 12.5, color: "#1d4ed8", fontWeight: 600 }}>
                  {(streamProgress.elapsedMs / 1000).toFixed(1)} s · {streamProgress.chars} car.
                </span>
              </div>
              <button type="button" onClick={stopStreaming} style={{ ...btnSubtle, padding: "5px 10px", fontSize: 12 }}>
                ⏹ Arrêter
              </button>
            </div>

            {live && (live.title || live.lead || live.headings.length > 0 || live.ideasTitles.length > 0) && (
              <div style={{ marginTop: 12, background: "#ffffff", border: "1px solid #bfdbfe", borderRadius: 3, padding: 14, color: "#1f2124", display: "grid", gap: 8, fontSize: 13.5 }}>
                {live.title && busyAction !== "suggest-guide-ideas" && (
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{live.h1 || live.title}</div>
                )}
                {live.lead && <div style={{ color: "#374151", lineHeight: 1.45 }}>{live.lead}</div>}

                {live.headings.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555a5f", textTransform: "uppercase" }}>Plan rédigé en direct</div>
                    <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                      {live.headings.map((h, i) => (
                        <li key={i} style={{ marginTop: 2 }}>
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {live.ideasTitles.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555a5f", textTransform: "uppercase" }}>Idées en cours d&apos;affichage</div>
                    <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                      {live.ideasTitles.map((t, i) => (
                        <li key={i} style={{ marginTop: 2 }}>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(live.hasTable || live.hasSteps || live.faqQuestions.length > 0) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                    {live.hasTable && <StatusPill tone="ok">📊 Tableau généré</StatusPill>}
                    {live.hasSteps && <StatusPill tone="ok">🔢 Étapes numérotées</StatusPill>}
                    {live.faqQuestions.length > 0 && <StatusPill tone="ok">❓ {live.faqQuestions.length} question(s) FAQ</StatusPill>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {appliedMsg && (
          <div style={{ ...cardStyle, background: "#dcfce7", borderColor: "#86efac", color: "#166534", fontSize: 14, fontWeight: 650 }}>
            ✅ {appliedMsg}
          </div>
        )}

        {error && (
          <div style={{ ...cardStyle, background: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b", fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Plan visuel & génération d'images SEO (nouveau ou article existant) */}
        {imagePlan && imageSlots.length > 0 && (
          <ArticleImageStudio
            plan={imagePlan}
            slots={imageSlots}
            busyGenerating={generatingImages}
            applying={applying}
            hasTextProposal={Boolean(proposal)}
            onGenerateSlot={handleGenerateSingleSlot}
            onGenerateAllMissing={handleGenerateAllMissing}
            onUploadLocalFile={handleUploadLocalFile}
            onUpdateSlotMeta={handleUpdateSlotMeta}
            onToggleInclude={handleToggleInclude}
            onDismissPlan={() => {
              imageAbortRef.current?.abort();
              setImagePlan(null);
              setImageSlots([]);
            }}
            onApplyImagesOnly={applyProposal}
          />
        )}

        {/* Proposition finale prête à appliquer */}
        {proposal && (
          <div style={{ ...cardStyle, background: "#f0fdf4", border: "2px solid #22c55e" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#14532d" }}>✅ Proposition prête à appliquer</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setProposal(null)} disabled={applying} style={btnSubtle}>
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={applyProposal}
                  disabled={applying || generatingImages}
                  style={{ ...btnPrimary, background: "#15803d", borderColor: "#15803d", opacity: applying || generatingImages ? 0.65 : 1 }}
                >
                  {applying
                    ? "Enregistrement & upload…"
                    : readyIncludedImages.length > 0
                      ? `Appliquer article + ${readyIncludedImages.length} image${readyIncludedImages.length > 1 ? "s" : ""}`
                      : "Appliquer dans le brouillon"}
                </button>
              </div>
            </div>

            <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 600, color: "#166534" }}>{proposal.summary}</p>

            {proposal.preview && (
              <div style={{ background: "#ffffff", border: "1px solid #bbf7d0", borderRadius: 3, padding: 14, display: "grid", gap: 12, fontSize: 13.5 }}>
                {/* Badges des blocs SEO générés */}
                {(proposal.preview.hasTable ||
                  proposal.preview.hasSteps ||
                  proposal.preview.hasSpec ||
                  (proposal.preview.faqCount ?? 0) > 0 ||
                  (proposal.preview.internalLinksCount ?? 0) > 0 ||
                  (proposal.preview.relatedServices?.length ?? 0) > 0) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {proposal.preview.category && <StatusPill tone="neutral">{proposal.preview.category}</StatusPill>}
                    {proposal.preview.hasTable && <StatusPill tone="ok">📊 Tableau comparatif / prix</StatusPill>}
                    {proposal.preview.hasSteps && <StatusPill tone="ok">🔢 Étapes numérotées</StatusPill>}
                    {proposal.preview.hasSpec && <StatusPill tone="ok">📋 Fiche repères DTU</StatusPill>}
                    {(proposal.preview.internalLinksCount ?? 0) > 0 && (
                      <StatusPill tone="ok">🔗 {proposal.preview.internalLinksCount} lien(s) interne(s) vérifié(s)</StatusPill>
                    )}
                    {(proposal.preview.relatedServices?.length ?? 0) > 0 && (
                      <StatusPill tone="ok">🛠️ {proposal.preview.relatedServices!.length} prestation(s) liée(s)</StatusPill>
                    )}
                    {(proposal.preview.faqCount ?? 0) > 0 && <StatusPill tone="ok">❓ {proposal.preview.faqCount} FAQ JSON-LD</StatusPill>}
                  </div>
                )}

                {(proposal.preview.title || proposal.preview.seoTitle) && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555a5f", textTransform: "uppercase" }}>Titre Google proposé</div>
                    <div style={{ fontWeight: 750, marginTop: 2 }}>{proposal.preview.title || proposal.preview.seoTitle}</div>
                    {proposal.preview.targetKeyword && (
                      <div style={{ fontSize: 12, color: "#b8180f", marginTop: 3 }}>Mot-clé ciblé : « {proposal.preview.targetKeyword} »</div>
                    )}
                  </div>
                )}

                {proposal.preview.meta && (
                  <div style={{ color: "#555a5f" }}>
                    <strong>Fiche technique :</strong> {proposal.preview.meta}
                  </div>
                )}

                {proposal.preview.metaDescription && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555a5f", textTransform: "uppercase" }}>
                      Description Google ({proposal.preview.metaDescription.length} car.)
                    </div>
                    <div style={{ marginTop: 2 }}>{proposal.preview.metaDescription}</div>
                  </div>
                )}

                {proposal.preview.excerpt && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555a5f", textTransform: "uppercase" }}>Chapeau réponse directe (GEO)</div>
                    <div style={{ marginTop: 2, lineHeight: 1.5 }}>{proposal.preview.excerpt}</div>
                  </div>
                )}

                {proposal.preview.headings && proposal.preview.headings.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555a5f", textTransform: "uppercase" }}>
                      Plan de l&apos;article ({proposal.preview.headings.length} sections H2)
                    </div>
                    <ol style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                      {proposal.preview.headings.map((h, i) => (
                        <li key={i} style={{ marginTop: 3 }}>
                          {h}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {proposal.preview.faqQuestions && proposal.preview.faqQuestions.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555a5f", textTransform: "uppercase" }}>
                      Questions FAQ incluses ({proposal.preview.faqQuestions.length})
                    </div>
                    <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                      {proposal.preview.faqQuestions.map((q, i) => (
                        <li key={i} style={{ marginTop: 3 }}>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {proposal.preview.photoAlts && proposal.preview.photoAlts.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555a5f", textTransform: "uppercase" }}>Descriptions photos (SEO)</div>
                    <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                      {proposal.preview.photoAlts.map((alt, idx) => (
                        <li key={idx} style={{ marginTop: 3 }}>
                          Photo {idx + 1} : {alt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {proposal.preview.tips && proposal.preview.tips.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555a5f", textTransform: "uppercase" }}>Conseils avant publication</div>
                    <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                      {proposal.preview.tips.map((tip, idx) => (
                        <li key={idx} style={{ marginTop: 3 }}>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
              <span style={{ fontSize: 12.5, color: "#166534", fontWeight: 600 }}>
                👇 L&apos;aperçu Google et le score SEO ci-dessous simulent déjà cette proposition.
              </span>
              <button
                type="button"
                onClick={applyProposal}
                disabled={applying || generatingImages}
                style={{ ...btnPrimary, background: "#15803d", borderColor: "#15803d", opacity: applying || generatingImages ? 0.65 : 1 }}
              >
                {applying
                  ? "Enregistrement & upload…"
                  : readyIncludedImages.length > 0
                    ? `✅ Appliquer article + ${readyIncludedImages.length} image${readyIncludedImages.length > 1 ? "s" : ""} dans le brouillon`
                    : "✅ Appliquer dans le brouillon"}
              </button>
            </div>
          </div>
        )}

        {/* Aperçu Google (SERP) + Score SEO/GEO temps réel */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 800 }}>Aperçu dans Google & contrôle SEO / GEO</h3>
              {proposal?.patch && (
                <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "#15803d", fontWeight: 650 }}>
                  Simulation avec la proposition IA (brouillon actuel : {currentAudit.score}/100 → après application : {seoAudit.score}/100)
                </p>
              )}
            </div>
            <StatusPill tone={scoreTone}>
              {proposal?.patch ? `Score projeté : ${seoAudit.score} / 100` : `Score SEO/GEO : ${seoAudit.score} / 100`}
            </StatusPill>
          </div>

          <div style={{ background: "#ffffff", border: "1px solid #dadce0", borderRadius: 4, padding: 14 }}>
            <div style={{ fontSize: 12, color: "#4d5156" }}>https://www.carreal.fr/{seo.slug ? `${seo.slug}/` : ""}</div>
            <div style={{ fontSize: 18, color: "#1a0dab", fontWeight: 500, marginTop: 3 }}>{seo.title || "(Titre Google non renseigné)"}</div>
            <div style={{ fontSize: 13.5, color: "#4d5156", marginTop: 4, lineHeight: 1.45 }}>
              {seo.description || "Ajoutez une description claire de 135 à 155 caractères pour donner envie de cliquer dans Google."}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10, marginTop: 14 }}>
            {seoAudit.checks.map((c, idx) => (
              <div key={idx} style={{ background: "#ffffff", border: "1px solid #e0e2de", borderRadius: 3, padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1f2124" }}>{c.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.ok ? "#166534" : "#92400e" }}>{c.ok ? "✓" : "○"}</span>
                </div>
                <div style={{ fontSize: 12, color: "#555a5f" }}>{c.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
