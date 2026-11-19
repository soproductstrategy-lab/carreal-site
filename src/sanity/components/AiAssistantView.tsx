"use client";

import { useEffect, useMemo, useState } from "react";
import { type SanityDocument, useDocumentOperation } from "sanity";
import type { UserViewComponent } from "sanity/structure";
import { dataset, projectId } from "@/sanity/env";

type PhotoRef = { _key?: string; asset?: { _ref?: string }; alt?: string };

type AiProposal = {
  summary: string;
  patch?: Record<string, unknown>;
  photoAlts?: { key?: string; alt: string }[];
  preview?: {
    title?: string;
    slug?: string;
    meta?: string;
    seoTitle?: string;
    metaDescription?: string;
    excerpt?: string;
    photoAlts?: string[];
    tips?: string[];
    faqCount?: number;
    sectionsCount?: number;
    changesSummary?: string;
  };
};

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
  if (!doc) return { title: "", description: "", slug: "" };
  const t = doc._type;
  const slug = (doc.slug as { current?: string } | undefined)?.current ?? "";
  if (t === "homePage" || t === "aboutPage") {
    const seo = (doc.seo as { title?: string; description?: string } | undefined) ?? {};
    return { title: seo.title ?? "", description: seo.description ?? "", slug: t === "homePage" ? "" : "entreprise" };
  }
  if (t === "realisation") {
    const title = [doc.title, doc.commune].filter(Boolean).join(" à ");
    return { title: title ? `${title} – Réalisation Carreal` : "", description: String(doc.summary ?? ""), slug: slug ? `realisations/${slug}` : "" };
  }
  return {
    title: String(doc.title ?? doc.name ?? ""),
    description: String(doc.metaDescription ?? doc.lead ?? ""),
    slug: slug ? `${t === "service" ? "prestations" : t === "zone" ? "zones-intervention" : "conseils"}/${slug}` : "",
  };
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
        fontWeight: 600,
        background: colors.bg,
        color: colors.fg,
        border: `1px solid ${colors.border}`,
      }}
    >
      {children}
    </span>
  );
}

function LengthStatus({ value, min, max }: { value: number; min: number; max: number }) {
  if (value === 0) return <StatusPill tone="warn">À remplir</StatusPill>;
  if (value >= min && value <= max) return <StatusPill tone="ok">{value} car. (idéal)</StatusPill>;
  if (value < min) return <StatusPill tone="warn">{value} car. (un peu court)</StatusPill>;
  return <StatusPill tone="bad">{value} car. (trop long)</StatusPill>;
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
  fontWeight: 600,
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

/**
 * Onglet « Assistant IA » intégré dans chaque document Sanity Studio.
 * Connecté à /api/studio-ai (Gemini API côté serveur) pour rédiger, corriger, décrire les photos
 * et optimiser le SEO directement dans le brouillon Sanity, sans copier-coller.
 */
export const AiAssistantView: UserViewComponent = ({ document, documentId, schemaType }) => {
  const displayed = (document.displayed ?? document.draft ?? document.published) as SanityDocument | null;
  const cleanId = documentId.replace(/^drafts\./, "");
  const { patch } = useDocumentOperation(cleanId, schemaType.name);

  const [status, setStatus] = useState<{ loading: boolean; configured: boolean; model?: string }>({
    loading: true,
    configured: false,
  });
  const [notes, setNotes] = useState("");
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null);
  const [proposal, setProposal] = useState<AiProposal | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/studio-ai")
      .then((r) => r.json())
      .then((d: { configured?: boolean; model?: string }) => {
        if (active) setStatus({ loading: false, configured: Boolean(d.configured), model: d.model });
      })
      .catch(() => {
        if (active) setStatus({ loading: false, configured: false });
      });
    return () => {
      active = false;
    };
  }, []);

  const photos = useMemo(() => extractPhotoRefs(displayed), [displayed]);
  const seo = useMemo(() => getSeoSnapshot(displayed), [displayed]);
  const missingAlts = photos.filter((p) => !p.alt?.trim()).length;

  const isRealisation = schemaType.name === "realisation";
  const isGuide = schemaType.name === "guide";
  const hasRichBody = ["realisation", "guide", "service", "zone", "aboutPage"].includes(schemaType.name);

  async function runAction(action: string, extra?: { mode?: "clarify" | "seo" | "shorten" }) {
    setError(null);
    setAppliedMsg(null);
    setProposal(null);
    setBusyAction(action + (extra?.mode ?? ""));
    try {
      const res = await fetch("/api/studio-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          docType: schemaType.name,
          notes,
          mode: extra?.mode,
          document: displayed ?? {},
          photoUrls: photos.slice(0, 4).map((p) => ({ key: p.key, url: p.url })),
        }),
      });
      const data = (await res.json()) as AiProposal & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Impossible de contacter l'assistant Gemini.");
      }
      setProposal(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue.");
    } finally {
      setBusyAction(null);
    }
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
        setAppliedMsg("Brouillon mis à jour par Gemini ! Relisez les champs dans l'onglet « Éditer », puis cliquez sur « Publier » quand c'est bon.");
        setProposal(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'appliquer les modifications.");
    } finally {
      setApplying(false);
    }
  }

  const disabled = !status.configured || Boolean(busyAction);

  return (
    <div style={{ padding: 24, maxWidth: 860, margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif", color: "#1f2124" }}>
      <div style={{ display: "grid", gap: 18 }}>
        {/* En-tête + statut Gemini */}
        <div style={{ ...cardStyle, borderTop: "4px solid #e1251b" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 750 }}>✨ Assistant rédaction & SEO (Gemini)</h2>
              <p style={{ margin: "6px 0 0", fontSize: 13.5, color: "#555a5f" }}>
                Rédigez un brouillon propre, décrivez vos photos et optimisez Google en un clic. Rien n&apos;est publié sans votre validation.
              </p>
            </div>
            {status.loading ? (
              <StatusPill tone="neutral">Vérification…</StatusPill>
            ) : status.configured ? (
              <StatusPill tone="ok">IA prête · {status.model}</StatusPill>
            ) : (
              <StatusPill tone="warn">Clé GEMINI_API_KEY requise</StatusPill>
            )}
          </div>

          {!status.loading && !status.configured && (
            <div style={{ marginTop: 14, padding: 12, borderRadius: 3, background: "#fef3c7", border: "1px solid #fcd34d", fontSize: 13, color: "#78350f" }}>
              Pour activer l&apos;assistant IA, ajoutez <code>GEMINI_API_KEY=votre_cle</code> dans <code>site/.env.local</code> (ou dans les variables d&apos;environnement de votre hébergeur) puis redémarrez le serveur.
            </div>
          )}
        </div>

        {/* Formulaire notes + actions */}
        <div style={cardStyle}>
          <label htmlFor="carreal-ai-notes" style={{ display: "block", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
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
                  ? "Ex. : Prix d'une douche à l'italienne à Annecy en 2026, expliquer le receveur à carreler, l'étanchéité SPEC et les délais…"
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

          {photos.length > 0 && (
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "#555a5f" }}>
              📷 <strong>{photos.length} photo{photos.length > 1 ? "s" : ""}</strong> détectée{photos.length > 1 ? "s" : ""} sur ce document — Gemini peut les analyser directement
              {missingAlts > 0 ? ` (${missingAlts} sans description SEO)` : " (descriptions SEO déjà remplies)"}.
            </p>
          )}

          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>2. Choisissez une action</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {isRealisation && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => runAction("generate-realisation")}
                  style={{ ...btnPrimary, opacity: disabled ? 0.55 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
                >
                  ✨ {busyAction === "generate-realisation" ? "Rédaction en cours…" : "Rédiger toute la fiche chantier"}
                </button>
              )}

              {isGuide && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => runAction("generate-guide")}
                  style={{ ...btnPrimary, opacity: disabled ? 0.55 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
                >
                  ✨ {busyAction === "generate-guide" ? "Rédaction en cours…" : "Rédiger l'article complet (SEO & FAQ)"}
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
                  📷 {busyAction === "generate-alt-texts" ? "Analyse des photos…" : `Décrire ${photos.length > 1 ? `les ${photos.length} photos` : "la photo"} (SEO)`}
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
                  ✏️ {busyAction === "improve-textclarify" ? "Correction…" : "Corriger & clarifier le texte"}
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => runAction("improve-text", { mode: "seo" })}
                  style={{ ...btnSubtle, opacity: disabled ? 0.55 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
                >
                  🔎 {busyAction === "improve-textseo" ? "Enrichissement…" : "Enrichir pour Google & IA"}
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

        {/* États chargement / succès / erreur */}
        {busyAction && (
          <div style={{ ...cardStyle, background: "#eff6ff", borderColor: "#93c5fd", color: "#1e3a8a", fontSize: 14, fontWeight: 600 }}>
            ⏳ Gemini analyse vos informations{photos.length > 0 ? " et vos photos" : ""}… (quelques secondes)
          </div>
        )}

        {appliedMsg && (
          <div style={{ ...cardStyle, background: "#dcfce7", borderColor: "#86efac", color: "#166534", fontSize: 14, fontWeight: 600 }}>
            ✅ {appliedMsg}
          </div>
        )}

        {error && (
          <div style={{ ...cardStyle, background: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b", fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Proposition avant application */}
        {proposal && (
          <div style={{ ...cardStyle, background: "#f0fdf4", border: "2px solid #22c55e" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 750, color: "#14532d" }}>✅ Proposition prête à appliquer</h3>
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

            <p style={{ margin: "0 0 12px", fontSize: 14 }}>{proposal.summary}</p>

            {proposal.preview && (
              <div style={{ background: "#ffffff", border: "1px solid #bbf7d0", borderRadius: 3, padding: 14, display: "grid", gap: 10, fontSize: 13.5 }}>
                {(proposal.preview.title || proposal.preview.seoTitle) && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555a5f", textTransform: "uppercase" }}>Titre proposé</div>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>{proposal.preview.title || proposal.preview.seoTitle}</div>
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
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555a5f", textTransform: "uppercase" }}>Extrait / résumé</div>
                    <div style={{ marginTop: 2 }}>{proposal.preview.excerpt}</div>
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
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#555a5f", textTransform: "uppercase" }}>Conseils SEO pour cette page</div>
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

        {/* Aperçu Google (SERP) + contrôle rapide */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 750 }}>Aperçu dans Google & contrôle SEO</h3>
          <div style={{ background: "#ffffff", border: "1px solid #dadce0", borderRadius: 4, padding: 14 }}>
            <div style={{ fontSize: 12, color: "#4d5156" }}>https://www.carreal.fr/{seo.slug ? `${seo.slug}/` : ""}</div>
            <div style={{ fontSize: 18, color: "#1a0dab", fontWeight: 500, marginTop: 3 }}>{seo.title || "(Titre Google non renseigné)"}</div>
            <div style={{ fontSize: 13.5, color: "#4d5156", marginTop: 4, lineHeight: 1.45 }}>
              {seo.description || "Ajoutez une description claire de 135 à 155 caractères pour donner envie de cliquer dans Google."}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 14 }}>
            <div style={{ background: "#ffffff", border: "1px solid #e0e2de", borderRadius: 3, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#555a5f", fontWeight: 600, marginBottom: 6 }}>Titre Google</div>
              <LengthStatus value={seo.title.length} min={35} max={65} />
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #e0e2de", borderRadius: 3, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#555a5f", fontWeight: 600, marginBottom: 6 }}>Description Google</div>
              <LengthStatus value={seo.description.length} min={110} max={160} />
            </div>
            <div style={{ background: "#ffffff", border: "1px solid #e0e2de", borderRadius: 3, padding: 12 }}>
              <div style={{ fontSize: 12, color: "#555a5f", fontWeight: 600, marginBottom: 6 }}>Photos & textes SEO</div>
              {photos.length === 0 ? (
                <StatusPill tone="warn">Aucune photo</StatusPill>
              ) : missingAlts === 0 ? (
                <StatusPill tone="ok">{photos.length} photo(s) décrite(s)</StatusPill>
              ) : (
                <StatusPill tone="warn">{missingAlts} alt manquant(s)</StatusPill>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
