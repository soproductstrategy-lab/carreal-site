import type { Viewport } from "next";
import { MobileBar } from "@/components/MobileBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getServices, getSettings, getZones } from "@/lib/content";
import { JsonLd, siteGraph } from "@/lib/seo";

export const viewport: Viewport = {
  themeColor: "#ecedea",
  colorScheme: "light",
};

/** Tout le site public est statique (HTML prérendu) : rapide et lisible par les robots IA qui n'exécutent pas le JS. */
export const ensureStatic = "navigation";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [business, services, zones] = await Promise.all([getSettings(), getServices(), getZones()]);
  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-anthracite focus:px-4 focus:py-2 focus:text-blanc">
        Aller au contenu
      </a>
      <SiteHeader />
      <main id="contenu">{children}</main>
      <SiteFooter />
      <MobileBar />
      <JsonLd data={siteGraph(business, services, zones)} />
    </>
  );
}
