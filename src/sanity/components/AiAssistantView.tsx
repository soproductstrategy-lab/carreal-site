"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type SanityDocument, useDocumentOperation } from "sanity";
import type { UserViewComponent } from "sanity/structure";
import { dataset, projectId } from "@/sanity/env";
import {
  consumePendingGuideBrief,
  streamStudioAi,
  type AiProposal,
  type GuideAngle,
  type GuideIdea,
  type IdeaTheme,
  type LocalFocus,
  type StreamProgress,
} from "@/sanity/lib/studioAiClient";

type PhotoRef = { _key?: string; asset?: { _ref?: string }; alt?: string };

function sanityRefToUrl(ref?: string): string | null {
  if (!ref || !projectId) return null;
  const m = ref.match(/^image-([a-zA-Z0-9]+)-(\d+x\d+)-([a-z0-9]+)$/);
  if (!m) return null;
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${m[1]}-${m[2]}.${m[3]}`;
}

function extractPhotoRefs(doc: SanityDocument | null): { key?: string; url: string; alt?: string; field: "photos" | "image" | "photo" | "hero.photo" }[] {
  if (!doc) return [];
  const out: { key?: string; url: string; alt?: string; field: "photos" | "image" | "photo" | "hero.photo" }[] = [];

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
  return out;
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

/**
 * Onglet « ✨ Assistant IA » intégré dans chaque document Sanity Studio.
 * Streaming temps réel SSE + cerveau SEO local carreleur (anti-cannibalisation, maillage interne vérifié,
 * tableaux/étapes/FAQ JSON-LD, score SEO/GEO en direct).
 */
export const AiAssistantView: UserViewComponent = ({ document, documentId, schemaType }) => {
  const displayed = (document.displayed ?? document.draft ?? document.published) as SanityDocument | null;
  const cleanId = documentId.replace(/^drafts\./, "");
  const { patch } = useDocumentOperation(cleanId, schemaType.name);

  const [initialBrief] = useState(() => (schemaType.name === "guide" ? consumePendingGuideBrief() : null));
  const [status, setStatus] = useState<{ loading: boolean; configured: boolean; model?: string; streaming?: boolean }>({
    loading: true,
    configured: false,
  });
  const [notes, setNotes] = useState(() => initialBrief?.notes ?? "");
  const [angle, setAngle] = useState<GuideAngle>(() => initialBrief?.angle ?? "auto");
  const [localFocus, setLocalFocus] = useState<LocalFocus>(() => initialBrief?.localFocus ?? "annecy");
  const [ideaTheme, setIdeaTheme] = useState<IdeaTheme>("all");
  const [ideas, setIdeas] = useState<GuideIdea[]>([]);

  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [streamProgress, setStreamProgress] = useState<StreamProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null);
  const [proposal, setProposal] = useState<AiProposal | null>(null);
  const [applying, setApplying] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const autoTriggeredRef = useRef(false);

  const isRealisation = schemaType.name === "realisation";
  const isGuide = schemaType.name === "guide";
  const hasRichBody = ["realisation", "guide", "service", "zone", "aboutPage"].includes(schemaType.name);

  useEffect(() => {
    let active = true;
    fetch("/api/studio-ai/")
      .then((r) => r.json())
      .then((d: { configured?: boolean; model?: string; streaming?: boolean }) => {
        if (!active) return;
        const configured = Boolean(d.configured);
        setStatus({ loading: false, configured, model: d.model, streaming: Boolean(d.streaming) });
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const photos = useMemo(() => extractPhotoRefs(displayed), [displayed]);
  const seo = useMemo(() => getSeoSnapshot(displayed), [displayed]);
  const missingAlts = photos.filter((p) => !p.alt?.trim()).length;
  const seoAudit = useMemo(() => evaluateSeoScore(displayed, schemaType.name, photos.length, missingAlts), [displayed, schemaType.name, photos.length, missingAlts]);

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
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setAppliedMsg(null);
    if (action !== "suggest-guide-ideas") setProposal(null);
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

  function applyProposal() {
    if (!proposal) return;
    if (patch.disabled) {
      setError(`Impossible de modifier ce brouillon pour l'instant (${String(patch.disabled)}).`);
      return;
    }
    setApplying(true);
    setError(null);
    try {
      const setObj: Record<string, unknown> = { ...(proposal.patch ?? {}) };

      if (proposal.photoAlts?.length && photos.length > 0) {
        const firstField = photos[0].field;
        if (firstField === "photos" && Array.isArray(displayed?.photos)) {
          const altByKey = new Map(proposal.photoAlts.filter((a) => a.key).map((a) => [a.key!, a.alt]));
          const updatedPhotos = (displayed.photos as PhotoRef[]).map((item, idx) => {
            const nextAlt = (item._key && altByKey.get(item._key)) || proposal.photoAlts?.[idx]?.alt;
            return nextAlt ? { ...item, alt: nextAlt } : item;
          });
          setObj.photos = updatedPhotos;
        } else if (firstField === "image" && proposal.photoAlts[0]?.alt) {
          setObj["image.alt"] = proposal.photoAlts[0].alt;
        } else if (firstField === "photo" && proposal.photoAlts[0]?.alt) {
          setObj["photo.alt"] = proposal.photoAlts[0].alt;
        } else if (firstField === "hero.photo" && proposal.photoAlts[0]?.alt) {
          setObj["hero.photo.alt"] = proposal.photoAlts[0].alt;
        }
      }

      if (Object.keys(setObj).length > 0) {
        patch.execute([{ set: setObj }]);
        setAppliedMsg("Brouillon mis à jour par Gemini ! Relisez dans « Éditer », vérifiez dans « 👁 Aperçu », puis cliquez sur « Publier ».");
        setProposal(null);
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
                  ✨ {busyAction === "generate-guide" ? "Rédaction en direct…" : "Rédiger l'article complet (SEO, tableau & FAQ)"}
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
                  disabled={applying}
                  style={{ ...btnPrimary, background: "#15803d", borderColor: "#15803d" }}
                >
                  {applying ? "Application…" : "Appliquer dans le brouillon"}
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
          </div>
        )}

        {/* Aperçu Google (SERP) + Score SEO/GEO temps réel */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 800 }}>Aperçu dans Google & contrôle SEO / GEO</h3>
            <StatusPill tone={scoreTone}>Score SEO/GEO : {seoAudit.score} / 100</StatusPill>
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
