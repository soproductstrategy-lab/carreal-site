import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Carreal, carreleur à Annecy depuis 2000";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const C = "M752.8 287.9A330 330 0 1 0 752.8 712.1L645.5 622.1A190 190 0 1 1 645.5 377.9Z";

/** Image de partage : le flanc du camion (alu, grand rond rouge coupé, frise, lettrage). */
export default async function OgImage() {
  const logo = await readFile(join(process.cwd(), "public/logo-carreal.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#ecedea", position: "relative", overflow: "hidden" }}>
        <svg width="760" height="760" viewBox="0 0 1000 1000" style={{ position: "absolute", right: -260, top: -40 }}>
          <circle cx="500" cy="500" r="500" fill="#e1251b" />
          <path d={C} fill="none" stroke="#fff" strokeWidth="7" />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 46, display: "flex" }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{ width: 46, height: 46, marginRight: 6, background: i > 13 ? "#8e1009" : "#a6aaad" }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", padding: "64px 72px", width: 900 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={56} height={56} alt="" />
            <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: 2, color: "#1f2124" }}>ARREAL</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 70, fontSize: 92, fontWeight: 900, lineHeight: 0.95, color: "#1f2124", letterSpacing: 1 }}>
            <span>CARRELEUR</span>
            <span>À ANNECY</span>
            <span>DEPUIS 2000</span>
          </div>
          <div style={{ fontSize: 30, marginTop: 36, color: "#555a5f" }}>Salles de bain, douches, sols, terrasses. 06 72 70 49 90</div>
        </div>
      </div>
    ),
    size,
  );
}
