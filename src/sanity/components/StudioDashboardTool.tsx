"use client";

import { useEffect, useState } from "react";
import { useClient } from "sanity";
import { useRouter } from "sanity/router";
import { apiVersion } from "@/sanity/env";

type Stats = {
  realCount: number;
  demoCount: number;
  guideCount: number;
  reviewCount: number;
  missingLegal: boolean;
};

/** Icône Carreal (rond rouge + C blanc) pour la barre supérieure du Studio. */
export function CarrealStudioIcon() {
  return (
    <svg viewBox="0 0 1000 1000" width={24} height={24} aria-hidden="true">
      <circle cx="500" cy="500" r="500" fill="#e1251b" />
      <path d="M752.8 287.9A330 330 0 1 0 752.8 712.1L645.5 622.1A190 190 0 1 1 645.5 377.9Z" fill="#fff" />
    </svg>
  );
}

const panel: React.CSSProperties = {
  background: "#fbfbf9",
  border: "1px solid #d4d6d2",
  borderRadius: 4,
  padding: 22,
};

const btnRed: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "10px 16px",
  borderRadius: 3,
  border: "2px solid #e1251b",
  background: "#e1251b",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
  textDecoration: "none",
};

const btnOutline: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "9px 15px",
  borderRadius: 3,
  border: "1.5px solid #1f2124",
  background: "#ffffff",
  color: "#1f2124",
  fontWeight: 650,
  fontSize: 13.5,
  cursor: "pointer",
  textDecoration: "none",
};

function Badge({ tone, children }: { tone: "ok" | "warn" | "info"; children: React.ReactNode }) {
  const c = {
    ok: { bg: "#dcfce7", fg: "#166534", border: "#86efac" },
    warn: { bg: "#fef3c7", fg: "#92400e", border: "#fcd34d" },
    info: { bg: "#f1f5f9", fg: "#1f2124", border: "#cbd5e1" },
  }[tone];
  return (
    <span style={{ padding: "3px 10px", borderRadius: 3, fontSize: 12.5, fontWeight: 650, background: c.bg, color: c.fg, border: `1px solid ${c.border}` }}>
      {children}
    </span>
  );
}

/**
 * Tableau de bord d'accueil Carreal dans /studio :
 * pensé pour un artisan sans bagage technique (3 actions clés, statut du site, guide IA en 3 étapes).
 */
export function StudioDashboardTool() {
  const client = useClient({ apiVersion });
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; model?: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    client
      .fetch<{
        realCount: number;
        demoCount: number;
        guideCount: number;
        reviewCount: number;
        insurer?: string;
        mediator?: string;
      }>(
        `{
          "realCount": count(*[_type == "realisation" && demo != true]),
          "demoCount": count(*[_type == "realisation" && demo == true]),
          "guideCount": count(*[_type == "guide"]),
          "reviewCount": count(*[_type == "review"]),
          "insurer": *[_id == "settings"][0].insurance.insurer,
          "mediator": *[_id == "settings"][0].mediator.name
        }`,
      )
      .then((res) => {
        if (!active) return;
        const missingLegal =
          !res.insurer || res.insurer.includes("à compléter") || !res.mediator || res.mediator.includes("à compléter");
        setStats({
          realCount: res.realCount ?? 0,
          demoCount: res.demoCount ?? 0,
          guideCount: res.guideCount ?? 0,
          reviewCount: res.reviewCount ?? 0,
          missingLegal,
        });
      })
      .catch(() => {});

    fetch("/api/studio-ai")
      .then((r) => r.json())
      .then((d: { configured?: boolean; model?: string }) => {
        if (active) setAiStatus({ configured: Boolean(d.configured), model: d.model });
      })
      .catch(() => {
        if (active) setAiStatus({ configured: false });
      });

    return () => {
      active = false;
    };
  }, [client]);

  const createDoc = (type: "realisation" | "guide" | "review") => {
    const id =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    router.navigateIntent("create", { id, type, template: type, mode: "structure" });
  };

  const editSingleton = (id: string, type: string) => {
    router.navigateIntent("edit", { id, type, mode: "structure" });
  };

  async function refreshPublicSite() {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      await fetch("/api/studio-revalidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      setRefreshMsg("Toutes les pages du site public ont été actualisées.");
    } catch {
      setRefreshMsg("Impossible d'actualiser le cache.");
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div style={{ overflowY: "auto", height: "100%", background: "#ecedea", padding: "28px 20px 48px", fontFamily: "system-ui, -apple-system, sans-serif", color: "#1f2124" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gap: 22 }}>
        {/* Bandeau de bienvenue */}
        <div style={{ ...panel, borderTop: "5px solid #e1251b" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <svg viewBox="0 0 1000 1000" width={48} height={48} aria-hidden="true" style={{ flexShrink: 0 }}>
                <circle cx="500" cy="500" r="500" fill="#e1251b" />
                <path d="M752.8 287.9A330 330 0 1 0 752.8 712.1L645.5 622.1A190 190 0 1 1 645.5 377.9Z" fill="#fff" />
              </svg>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Bienvenue dans votre espace Carreal</h1>
                <p style={{ margin: "6px 0 0", fontSize: 14.5, color: "#555a5f", maxWidth: 580 }}>
                  Ajoutez vos chantiers, avis clients et articles en quelques clics — avec l&apos;assistant IA Gemini intégré pour rédiger et optimiser Google.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" onClick={refreshPublicSite} disabled={refreshing} style={btnOutline}>
                {refreshing ? "Actualisation…" : "↻ Actualiser le site"}
              </button>
              <a href="/" target="_blank" rel="noopener noreferrer" style={btnRed}>
                Voir le site ↗
              </a>
            </div>
          </div>

          {refreshMsg && (
            <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 3, background: "#dcfce7", border: "1px solid #86efac", color: "#166534", fontSize: 13.5, fontWeight: 600 }}>
              ✅ {refreshMsg}
            </div>
          )}
        </div>

        {/* 3 gros boutons d'action */}
        <div>
          <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 750 }}>Que souhaitez-vous ajouter aujourd&apos;hui ?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            <div style={{ ...panel, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 750 }}>📷 Nouveau chantier</h3>
                <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "#555a5f", lineHeight: 1.5 }}>
                  Glissez vos photos, notez 2 infos et laissez l&apos;onglet <strong>Assistant IA</strong> rédiger la fiche complète et les textes photos.
                </p>
              </div>
              <button type="button" onClick={() => createDoc("realisation")} style={btnRed}>
                + Ajouter un chantier
              </button>
            </div>

            <div style={{ ...panel, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 750 }}>✍️ Nouvel article conseil</h3>
                <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "#555a5f", lineHeight: 1.5 }}>
                  Partagez un repère de prix ou un conseil technique : l&apos;IA structure l&apos;article, la FAQ et les balises Google pour le SEO local.
                </p>
              </div>
              <button type="button" onClick={() => createDoc("guide")} style={btnOutline}>
                + Écrire un conseil
              </button>
            </div>

            <div style={{ ...panel, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 750 }}>⭐ Nouvel avis Google</h3>
                <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "#555a5f", lineHeight: 1.5 }}>
                  Recopiez un avis client : il s&apos;ajoute automatiquement dans le slider de la page d&apos;accueil et sur la page Avis.
                </p>
              </div>
              <button type="button" onClick={() => createDoc("review")} style={btnOutline}>
                + Ajouter un avis
              </button>
            </div>
          </div>
        </div>

        {/* État du site + Mode d'emploi express */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          <div style={panel}>
            <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 750 }}>État de votre site</h2>
            {!stats ? (
              <p style={{ fontSize: 13.5, color: "#555a5f" }}>Chargement…</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14 }}>Assistant IA Gemini</span>
                  {aiStatus?.configured ? (
                    <Badge tone="ok">Actif ({aiStatus.model})</Badge>
                  ) : (
                    <Badge tone="warn">Clé GEMINI_API_KEY à ajouter</Badge>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14 }}>Vrais chantiers publiés</span>
                  <Badge tone={stats.realCount > 0 ? "ok" : "warn"}>
                    {stats.realCount} publié{stats.realCount > 1 ? "s" : ""}
                    {stats.demoCount > 0 ? ` · ${stats.demoCount} exemple(s)` : ""}
                  </Badge>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14 }}>Avis clients (slider)</span>
                  <Badge tone="ok">{stats.reviewCount} avis</Badge>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14 }}>Articles « Prix & conseils »</span>
                  <Badge tone="info">{stats.guideCount} article(s)</Badge>
                </div>

                {stats.missingLegal && (
                  <div
                    style={{
                      marginTop: 6,
                      padding: 12,
                      borderRadius: 3,
                      background: "#fef3c7",
                      border: "1px solid #fcd34d",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "#78350f", fontWeight: 600 }}>⚠️ Assureur décennale ou médiateur à compléter.</span>
                    <button
                      type="button"
                      onClick={() => editSingleton("settings", "settings")}
                      style={{ ...btnOutline, padding: "6px 12px", fontSize: 12.5 }}
                    >
                      Compléter →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={panel}>
            <h2 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 750 }}>✨ Publier un chantier en 2 minutes</h2>
            <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 10, fontSize: 13.5, lineHeight: 1.5, color: "#2c2f33" }}>
              <li>
                Cliquez sur <strong>+ Ajouter un chantier</strong> et glissez 2 à 6 photos prises sur place.
              </li>
              <li>
                Ouvrez l&apos;onglet <strong>Assistant IA</strong> en haut du formulaire, notez 2 lignes en vrac et cliquez sur <strong>Rédiger toute la fiche chantier</strong>, puis <strong>Appliquer dans le brouillon</strong>.
              </li>
              <li>
                Relisez dans <strong>Éditer</strong>, vérifiez le rendu dans <strong>Aperçu</strong>, puis cliquez sur le bouton vert <strong>Publier</strong>.
              </li>
            </ol>
            <p style={{ margin: "14px 0 0", fontSize: 12.5, color: "#166534", fontWeight: 600 }}>
              ✓ Vous ne pouvez jamais casser le design : le site met tout en page automatiquement.
            </p>
          </div>
        </div>

        {/* Raccourcis pages principales */}
        <div style={panel}>
          <h2 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 750 }}>Modifier les pages principales</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <button type="button" onClick={() => editSingleton("homePage", "homePage")} style={btnOutline}>
              🏠 Page d&apos;accueil & slider avis
            </button>
            <button type="button" onClick={() => editSingleton("aboutPage", "aboutPage")} style={btnOutline}>
              🧱 Page « L&apos;entreprise »
            </button>
            <button type="button" onClick={() => editSingleton("settings", "settings")} style={btnOutline}>
              📞 Téléphone, horaires & mentions
            </button>
            <button type="button" onClick={() => editSingleton("pageTexts", "pageTexts")} style={btnOutline}>
              🏷️ Titres des autres pages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
