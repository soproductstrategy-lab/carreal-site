"use client";

import { useState } from "react";
import type { ArticleImagePlan, ImagePlanSlot, SlotImageState } from "@/sanity/lib/studioAiClient";

const STYLE_LABELS: Record<ImagePlanSlot["styleType"], string> = {
  architectural: "Vue architecturale",
  detail: "Gros plan pose & joints",
  material: "Échantillons & matière",
  exterior: "Terrasse / extérieur",
};

const btnMini: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "6px 10px",
  borderRadius: 3,
  border: "1px solid #c4c7c3",
  background: "#ffffff",
  color: "#1f2124",
  fontWeight: 650,
  fontSize: 12.5,
  cursor: "pointer",
};

const btnMiniPrimary: React.CSSProperties = {
  ...btnMini,
  border: "1.5px solid #1f2124",
  background: "#1f2124",
  color: "#ffffff",
};

type Props = {
  plan: ArticleImagePlan;
  slots: SlotImageState[];
  busyGenerating: boolean;
  applying: boolean;
  hasTextProposal: boolean;
  onGenerateSlot: (slotId: string) => void;
  onGenerateAllMissing: () => void;
  onUploadLocalFile: (slotId: string, file: File) => void;
  onUpdateSlotMeta: (slotId: string, patch: Partial<Pick<ImagePlanSlot, "alt" | "caption" | "seoFilename">>) => void;
  onToggleInclude: (slotId: string) => void;
  onDismissPlan: () => void;
  onApplyImagesOnly: () => void;
};

export function ArticleImageStudio({
  plan,
  slots,
  busyGenerating,
  applying,
  hasTextProposal,
  onGenerateSlot,
  onGenerateAllMissing,
  onUploadLocalFile,
  onUpdateSlotMeta,
  onToggleInclude,
  onDismissPlan,
  onApplyImagesOnly,
}: Props) {
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const readyIncluded = slots.filter((s) => s.included && s.status === "ready" && s.image);
  const pendingSlots = slots.filter((s) => s.included && (s.status === "planned" || s.status === "error"));
  const billingErrorSlot = slots.find((s) => s.errorCode === "IMAGE_BILLING_REQUIRED");

  async function copyPrompt(slot: ImagePlanSlot) {
    try {
      await navigator.clipboard.writeText(slot.harnessedPrompt);
      setCopiedId(slot.id);
      setTimeout(() => setCopiedId((prev) => (prev === slot.id ? null : prev)), 2200);
    } catch {
      // Clipboard API unavailable
    }
  }

  return (
    <div
      style={{
        background: "#fafaf7",
        border: "2px solid #1f2124",
        borderRadius: 4,
        padding: 20,
        color: "#1f2124",
      }}
    >
      {/* En-tête + recommandation SEO */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
            🖼️ Plan visuel SEO Carreal ({slots.length} emplacement{slots.length > 1 ? "s" : ""})
          </h3>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#374151", lineHeight: 1.45 }}>
            <strong>Recommandation SEO : {plan.recommendedTotal} image{plan.recommendedTotal > 1 ? "s" : ""}</strong> — {plan.recommendationReason}
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {pendingSlots.length > 0 && (
            <button
              type="button"
              disabled={busyGenerating || applying}
              onClick={onGenerateAllMissing}
              style={{ ...btnMiniPrimary, opacity: busyGenerating || applying ? 0.55 : 1 }}
            >
              {busyGenerating ? "🎨 Génération en cours…" : `🎨 Générer ${pendingSlots.length} image${pendingSlots.length > 1 ? "s" : ""} (IA)`}
            </button>
          )}
          {!hasTextProposal && readyIncluded.length > 0 && (
            <button
              type="button"
              disabled={busyGenerating || applying}
              onClick={onApplyImagesOnly}
              style={{
                ...btnMiniPrimary,
                background: "#15803d",
                borderColor: "#15803d",
                opacity: busyGenerating || applying ? 0.55 : 1,
              }}
            >
              {applying
                ? "Upload vers Sanity…"
                : `✅ Appliquer ${readyIncluded.length} image${readyIncluded.length > 1 ? "s" : ""} dans le brouillon`}
            </button>
          )}
          <button type="button" disabled={busyGenerating || applying} onClick={onDismissPlan} style={btnMini}>
            Fermer
          </button>
        </div>
      </div>

      {/* Garanties du harness Carreal */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginTop: 12,
          padding: "8px 10px",
          background: "#ffffff",
          border: "1px solid #d4d6d2",
          borderRadius: 3,
          fontSize: 12,
          color: "#334155",
        }}
      >
        <span>🛡️ Harness anti-IA générique actif :</span>
        <span>✓ 0 visage / main / personne</span>
        <span>· ✓ 0 texte / logo / marque</span>
        <span>· ✓ 0 lieu identifiable</span>
        <span>· ✓ Couverture 4:3 (1200 px Discover)</span>
        <span>· ✓ Corps 16:9 lazy-load</span>
      </div>

      {/* Alerte facturation Google AI Studio Free Tier (si limit = 0) */}
      {billingErrorSlot && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 3,
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            color: "#78350f",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <strong>⚡ Génération d&apos;images IA bloquée par le palier gratuit Google AI Studio :</strong> {billingErrorSlot.error}
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            {billingErrorSlot.helpUrl && (
              <a
                href={billingErrorSlot.helpUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "5px 10px",
                  borderRadius: 3,
                  background: "#78350f",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: 12.5,
                  textDecoration: "none",
                }}
              >
                Activer Tier 1 sur Google AI Studio →
              </a>
            )}
            <span style={{ fontSize: 12.5 }}>
              💡 En attendant, vous pouvez cliquer sur <strong>« 📁 Importer une vraie photo »</strong> sur chaque carte : elle sera envoyée dans Sanity avec le nom de fichier SEO, le texte <code>alt</code> et l&apos;insertion automatique dans l&apos;article !
            </span>
          </div>
        </div>
      )}

      {/* Liste des emplacements visuels */}
      <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
        {slots.map((entry, idx) => {
          const { slot, status, image, error, included } = entry;
          const isHero = slot.role === "hero";
          const showPrompt = expandedPromptId === slot.id;

          return (
            <div
              key={slot.id}
              style={{
                background: included ? "#ffffff" : "#f3f4f6",
                border: status === "ready" && included ? "1.5px solid #22c55e" : "1px solid #d4d6d2",
                borderRadius: 4,
                padding: 14,
                opacity: included ? 1 : 0.65,
              }}
            >
              {/* En-tête de la carte */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 3,
                      fontSize: 11.5,
                      fontWeight: 750,
                      background: isHero ? "#1f2124" : "#e2e8f0",
                      color: isHero ? "#ffffff" : "#1f2124",
                    }}
                  >
                    {isHero ? "📌 Couverture & miniature (4:3 · 1200×896)" : `📄 Corps #${idx} (16:9 · 1376×768)`}
                  </span>
                  <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>{STYLE_LABELS[slot.styleType]}</span>
                  {slot.afterHeading && (
                    <span style={{ fontSize: 12, color: "#b8180f", fontWeight: 650 }}>↳ Après « {slot.afterHeading} »</span>
                  )}
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  <button
                    type="button"
                    disabled={busyGenerating || applying || !included}
                    onClick={() => onGenerateSlot(slot.id)}
                    style={{ ...btnMiniPrimary, opacity: busyGenerating || applying || !included ? 0.5 : 1 }}
                  >
                    {status === "generating" ? "⏳ Génération…" : image ? "🔄 Régénérer (IA)" : "🎨 Générer (IA)"}
                  </button>

                  <label
                    style={{
                      ...btnMini,
                      opacity: busyGenerating || applying || !included ? 0.5 : 1,
                      pointerEvents: busyGenerating || applying || !included ? "none" : "auto",
                    }}
                  >
                    📁 Importer une vraie photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.currentTarget.files?.[0];
                        if (file) onUploadLocalFile(slot.id, file);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>

                  <button type="button" disabled={applying} onClick={() => onToggleInclude(slot.id)} style={btnMini}>
                    {included ? "✕ Exclure" : "↩ Inclure"}
                  </button>
                </div>
              </div>

              {/* Corps de la carte : aperçu + champs SEO */}
              <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 280px) 1fr", gap: 14, alignItems: "start" }}>
                {/* Zone aperçu visuel */}
                <div
                  style={{
                    aspectRatio: isHero ? "4 / 3" : "16 / 9",
                    background: "#eef0ec",
                    border: "1px solid #d4d6d2",
                    borderRadius: 3,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.dataUrl}
                        alt={slot.alt}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          bottom: 6,
                          left: 6,
                          padding: "2px 7px",
                          borderRadius: 3,
                          background: "rgba(31,33,36,0.82)",
                          color: "#ffffff",
                          fontSize: 11,
                          fontWeight: 650,
                        }}
                      >
                        {image.source === "upload" ? "📷 Photo chantier" : `✨ IA · ${image.width}×${image.height}`}
                      </span>
                    </>
                  ) : status === "generating" ? (
                    <div style={{ padding: 14, textAlign: "center", fontSize: 12.5, color: "#1d4ed8", fontWeight: 650 }}>
                      ⏳ Génération Nano Banana en cours…
                      <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4, fontWeight: 400 }}>8 à 18 secondes</div>
                    </div>
                  ) : (
                    <div style={{ padding: 14, textAlign: "center", fontSize: 12, color: "#64748b", lineHeight: 1.45 }}>
                      Prêt à générer par IA
                      <br />
                      ou à remplacer par une vraie photo
                    </div>
                  )}
                </div>

                {/* Métadonnées SEO éditables */}
                <div style={{ display: "grid", gap: 8, fontSize: 12.5 }}>
                  {slot.editorialRationale && (
                    <div style={{ color: "#475569", lineHeight: 1.4 }}>
                      <strong>Rôle éditorial :</strong> {slot.editorialRationale}
                    </div>
                  )}

                  {error && entry.errorCode !== "IMAGE_BILLING_REQUIRED" && (
                    <div style={{ padding: "6px 8px", borderRadius: 3, background: "#fee2e2", color: "#991b1b", fontSize: 12 }}>
                      ⚠️ {error}
                    </div>
                  )}

                  <div style={{ display: "grid", gap: 3 }}>
                    <label style={{ fontSize: 11, fontWeight: 750, color: "#555a5f", textTransform: "uppercase" }}>
                      Nom de fichier SEO (Sanity CDN)
                    </label>
                    <input
                      type="text"
                      value={slot.seoFilename}
                      onChange={(e) => onUpdateSlotMeta(slot.id, { seoFilename: e.currentTarget.value })}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "6px 8px",
                        border: "1px solid #cbd5e1",
                        borderRadius: 3,
                        fontFamily: "ui-monospace, SFMono-Regular, monospace",
                        fontSize: 12,
                        color: "#1f2124",
                        background: "#ffffff",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gap: 3 }}>
                    <label style={{ fontSize: 11, fontWeight: 750, color: "#555a5f", textTransform: "uppercase" }}>
                      Texte alternatif (alt SEO · {slot.alt.length} car.)
                    </label>
                    <input
                      type="text"
                      value={slot.alt}
                      onChange={(e) => onUpdateSlotMeta(slot.id, { alt: e.currentTarget.value })}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "6px 8px",
                        border: "1px solid #cbd5e1",
                        borderRadius: 3,
                        fontSize: 12.5,
                        color: "#1f2124",
                        background: "#ffffff",
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gap: 3 }}>
                    <label style={{ fontSize: 11, fontWeight: 750, color: "#555a5f", textTransform: "uppercase" }}>
                      Légende affichée sous l&apos;image
                    </label>
                    <input
                      type="text"
                      value={slot.caption}
                      onChange={(e) => onUpdateSlotMeta(slot.id, { caption: e.currentTarget.value })}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "6px 8px",
                        border: "1px solid #cbd5e1",
                        borderRadius: 3,
                        fontSize: 12.5,
                        color: "#1f2124",
                        background: "#ffffff",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 2 }}>
                    <button
                      type="button"
                      onClick={() => setExpandedPromptId(showPrompt ? null : slot.id)}
                      style={{ ...btnMini, padding: "4px 8px", fontSize: 11.5 }}
                    >
                      {showPrompt ? "Masquer le prompt harness" : "🔍 Voir le prompt harness"}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyPrompt(slot)}
                      style={{ ...btnMini, padding: "4px 8px", fontSize: 11.5 }}
                    >
                      {copiedId === slot.id ? "✓ Prompt copié" : "📋 Copier le prompt"}
                    </button>
                  </div>

                  {showPrompt && (
                    <pre
                      style={{
                        margin: "4px 0 0",
                        padding: 10,
                        background: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        borderRadius: 3,
                        fontSize: 11.5,
                        lineHeight: 1.45,
                        whiteSpace: "pre-wrap",
                        color: "#334155",
                        maxHeight: 180,
                        overflowY: "auto",
                      }}
                    >
                      {slot.harnessedPrompt}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pied de carte quand il s'agit d'illustrer un article déjà existant (sans réécrire le texte) */}
      {!hasTextProposal && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px solid #d4d6d2",
          }}
        >
          <span style={{ fontSize: 12.5, color: "#475569" }}>
            {readyIncluded.length > 0
              ? `${readyIncluded.length} image${readyIncluded.length > 1 ? "s" : ""} prête${readyIncluded.length > 1 ? "s" : ""} à être envoyée${readyIncluded.length > 1 ? "s" : ""} sur le CDN Sanity (noms de fichiers SEO + alt + insertion H2).`
              : "Générez les visuels par IA ou importez vos photos de chantier, puis appliquez dans le brouillon."}
          </span>
          {readyIncluded.length > 0 && (
            <button
              type="button"
              disabled={busyGenerating || applying}
              onClick={onApplyImagesOnly}
              style={{
                ...btnMiniPrimary,
                padding: "9px 14px",
                fontSize: 13.5,
                background: "#15803d",
                borderColor: "#15803d",
                opacity: busyGenerating || applying ? 0.55 : 1,
              }}
            >
              {applying
                ? "Upload vers Sanity…"
                : `✅ Appliquer ${readyIncluded.length} image${readyIncluded.length > 1 ? "s" : ""} dans le brouillon`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
