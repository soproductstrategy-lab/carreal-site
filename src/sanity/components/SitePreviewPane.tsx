"use client";

import { useState } from "react";
import type { SanityDocument } from "sanity";
import type { UserViewComponent } from "sanity/structure";
import { resolveDocPath } from "@/sanity/lib/docUrl";

const btnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 11px",
  borderRadius: 3,
  border: "1px solid #c4c7c3",
  background: "#ffffff",
  color: "#1f2124",
  fontSize: 12.5,
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
};

/**
 * Volet « Aperçu » directement dans chaque document du Studio :
 * permet au client de voir sa page en format Ordinateur ou Mobile et de rafraîchir le cache en 1 clic après publication.
 */
export const SitePreviewPane: UserViewComponent = ({ document, schemaType }) => {
  const displayed = (document.displayed ?? document.published ?? document.draft) as SanityDocument | null;
  const slug = (displayed?.slug as { current?: string } | undefined)?.current ?? null;
  const path = resolveDocPath(schemaType.name, slug);
  const hasDraft = Boolean(document.draft);

  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [bust, setBust] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  async function refreshSite() {
    setRefreshing(true);
    try {
      await fetch("/api/studio-revalidate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docType: schemaType.name, path }),
      });
    } finally {
      setBust((n) => n + 1);
      setRefreshing(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ padding: "12px 16px", background: "#fbfbf9", borderBottom: "1px solid #d4d6d2", color: "#1f2124" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                padding: "3px 9px",
                borderRadius: 3,
                fontSize: 12,
                fontWeight: 700,
                background: hasDraft ? "#fef3c7" : "#dcfce7",
                color: hasDraft ? "#92400e" : "#166534",
                border: `1px solid ${hasDraft ? "#fcd34d" : "#86efac"}`,
              }}
            >
              {hasDraft ? "Modifications non publiées" : "Page à jour"}
            </span>
            <code style={{ fontSize: 12.5, color: "#555a5f" }}>{path}</code>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              style={{
                ...btnStyle,
                background: viewport === "desktop" ? "#1f2124" : "#ffffff",
                color: viewport === "desktop" ? "#ffffff" : "#1f2124",
                borderColor: viewport === "desktop" ? "#1f2124" : "#c4c7c3",
              }}
            >
              Ordinateur
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              style={{
                ...btnStyle,
                background: viewport === "mobile" ? "#1f2124" : "#ffffff",
                color: viewport === "mobile" ? "#ffffff" : "#1f2124",
                borderColor: viewport === "mobile" ? "#1f2124" : "#c4c7c3",
              }}
            >
              Mobile
            </button>
            <button type="button" onClick={refreshSite} disabled={refreshing} style={btnStyle}>
              {refreshing ? "Actualisation…" : "↻ Rafraîchir"}
            </button>
            <a href={path} target="_blank" rel="noopener noreferrer" style={btnStyle}>
              Ouvrir ↗
            </a>
          </div>
        </div>
        {hasDraft && (
          <p style={{ margin: "8px 0 0", fontSize: 12, color: "#555a5f" }}>
            Cliquez sur le bouton vert <strong>Publier</strong> en bas à droite, puis sur <strong>Rafraîchir</strong> pour voir vos modifications ici.
          </p>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", background: "#e0e2de", overflow: "auto", padding: viewport === "mobile" ? 16 : 0 }}>
        <iframe
          key={`${path}-${bust}`}
          src={path}
          title={`Aperçu de ${path}`}
          style={{
            width: viewport === "mobile" ? 390 : "100%",
            height: "100%",
            border: viewport === "mobile" ? "2px solid #1f2124" : "none",
            background: "#ecedea",
          }}
        />
      </div>
    </div>
  );
};
