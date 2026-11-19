"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { communeCoords, depot } from "@/content/geo";

type ZoneLite = { slug: string; name: string; communes: string[] };

/**
 * Carte interactive des zones d'intervention.
 * - MapLibre + tuiles OpenFreeMap : aucune clé d'API, aucun cookie → pas de bannière de consentement.
 * - Chargée uniquement quand elle entre à l'écran (n'impacte pas le temps de chargement).
 * - La liste des communes reste en HTML à côté : les robots lisent le texte, pas la carte.
 */
export function AreaMap({ zones, active, className = "" }: { zones: ZoneLite[]; active?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let map: import("maplibre-gl").Map | undefined;
    let cancelled = false;

    const init = async () => {
      setState("loading");
      try {
        const maplibregl = await import("maplibre-gl");
        maplibregl.setWorkerUrl(`${window.location.origin}/maplibre/maplibre-gl-worker.mjs`);
        if (cancelled) return;
        const features = zones.flatMap((z) =>
          z.communes
            .filter((c) => communeCoords[c])
            .map((c) => ({
              type: "Feature" as const,
              geometry: { type: "Point" as const, coordinates: communeCoords[c] },
              properties: { name: c, zone: z.slug, active: !active || z.slug === active ? 1 : 0 },
            })),
        );
        const focus = features.filter((f) => f.properties.active);
        const bounds = new maplibregl.LngLatBounds();
        (focus.length ? focus : features).forEach((f) => bounds.extend(f.geometry.coordinates as [number, number]));
        bounds.extend(depot);

        const m = new maplibregl.Map({
          container: el,
          style: "https://tiles.openfreemap.org/styles/positron",
          bounds,
          fitBoundsOptions: { padding: 48, maxZoom: 12.5 },
          cooperativeGestures: true,
          attributionControl: { compact: true },
          locale: {
            "CooperativeGesturesHandler.WindowsHelpText": "Utilisez Ctrl + molette pour zoomer",
            "CooperativeGesturesHandler.MacHelpText": "Utilisez ⌘ + molette pour zoomer",
            "CooperativeGesturesHandler.MobileHelpText": "Utilisez deux doigts pour déplacer la carte",
          },
        });
        map = m;
        m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

        m.on("load", () => {
          // Habillage aux couleurs du site : fond calcaire, lac teinté
          for (const layer of m.getStyle().layers ?? []) {
            try {
              if (layer.type === "background") m.setPaintProperty(layer.id, "background-color", "#ecedea");
              else if (layer.type === "fill" && /water/.test(layer.id)) m.setPaintProperty(layer.id, "fill-color", "#d3dde0");
              else if (layer.type === "line" && /waterway/.test(layer.id)) m.setPaintProperty(layer.id, "line-color", "#bccbd0");
            } catch {}
          }
          // Rayon d'intervention ≈ 30 km autour du dépôt
          const ring: [number, number][] = [];
          for (let i = 0; i <= 64; i++) {
            const a = (i / 64) * Math.PI * 2;
            ring.push([depot[0] + (30 / (111.32 * Math.cos((depot[1] * Math.PI) / 180))) * Math.cos(a), depot[1] + (30 / 110.57) * Math.sin(a)]);
          }
          m.addSource("rayon", { type: "geojson", data: { type: "Feature", geometry: { type: "Polygon", coordinates: [ring] }, properties: {} } });
          m.addLayer({ id: "rayon-fill", type: "fill", source: "rayon", paint: { "fill-color": "#e1251b", "fill-opacity": 0.05 } });
          m.addLayer({ id: "rayon-line", type: "line", source: "rayon", paint: { "line-color": "#e1251b", "line-width": 2, "line-opacity": 0.55 } });

          // Repères carrés (cabochons) : rouge pour le secteur affiché, anthracite pour les autres
          const square = (color: string, size: number) => {
            const data = new Uint8Array(size * size * 4);
            const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
            for (let i = 0; i < size * size; i++) data.set([r, g, b, 255], i * 4);
            return { width: size, height: size, data };
          };
          m.addImage("carre-rouge", square("#e1251b", 11));
          m.addImage("carre-gris", square("#1f2124", 9));

          m.addSource("communes", { type: "geojson", data: { type: "FeatureCollection", features } });
          m.addLayer({
            id: "communes-pt",
            type: "symbol",
            source: "communes",
            layout: { "icon-image": ["case", ["==", ["get", "active"], 1], "carre-rouge", "carre-gris"], "icon-allow-overlap": true, "icon-padding": 2 },
          });
          m.addLayer({
            id: "communes-label",
            type: "symbol",
            source: "communes",
            layout: {
              "text-field": ["get", "name"],
              "text-font": ["Noto Sans Regular"],
              "text-size": ["case", ["==", ["get", "active"], 1], 12, 10.5],
              "text-variable-anchor": ["top", "bottom", "left", "right"],
              "text-radial-offset": 0.9,
              "text-padding": 4,
              "text-optional": true,
            },
            paint: { "text-color": ["case", ["==", ["get", "active"], 1], "#1f2124", "#555a5f"], "text-halo-color": "#fbfbf9", "text-halo-width": 2 },
          });

          // Dépôt : le rond rouge Carreal
          const dot = document.createElement("div");
          dot.setAttribute("aria-label", "Dépôt Carreal, Pringy");
          dot.innerHTML =
            '<svg viewBox="0 0 1000 1000" width="36" height="36"><circle cx="500" cy="500" r="500" fill="#e1251b"/><path d="M752.8 287.9A330 330 0 1 0 752.8 712.1L645.5 622.1A190 190 0 1 1 645.5 377.9Z" fill="#fff"/></svg>';
          new maplibregl.Marker({ element: dot })
            .setLngLat(depot)
            .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML("<strong>Carreal</strong><br/>618 route des Rutys, Pringy"))
            .addTo(m);

          m.on("click", "communes-pt", (e) => {
            const zone = e.features?.[0]?.properties?.zone;
            if (zone) router.push(`/zones-intervention/${zone}/`);
          });
          m.on("mouseenter", "communes-pt", () => (m.getCanvas().style.cursor = "pointer"));
          m.on("mouseleave", "communes-pt", () => (m.getCanvas().style.cursor = ""));
          setState("ready");
        });
        m.on("error", (e) => console.warn("[carte]", e.error?.message));
      } catch (e) {
        console.warn("[carte] échec de chargement", e);
        if (!cancelled) setState("error");
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((en) => en.isIntersecting)) {
          io.disconnect();
          void init();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      map?.remove();
    };
  }, [zones, active, router]);

  return (
    <div className={`relative overflow-hidden bg-alu-2 ${className}`}>
      <div ref={ref} className="size-full" role="region" aria-label="Carte des communes desservies par Carreal" />
      {state !== "ready" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
          <span className="t-etiquette text-gris">{state === "error" ? "Carte indisponible" : "Chargement de la carte…"}</span>
        </div>
      )}
    </div>
  );
}
