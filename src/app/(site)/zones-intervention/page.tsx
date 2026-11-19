import type { Metadata } from "next";
import Link from "next/link";
import { AreaMap } from "@/components/AreaMap";
import { Pose, spans } from "@/components/blocks";
import { GoogleMapFacade } from "@/components/GoogleMapFacade";
import { PageHero } from "@/components/PageHero";
import { Container, Section, SectionHead } from "@/components/ui";
import { getPageHeader, getSettings, getZones } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { fr } from "@/lib/typo";

export const metadata: Metadata = pageMetadata({
  title: "Zones d'intervention – Carreleur Annecy, lac et Aravis | Carreal",
  description:
    "Carreal intervient dans tout le bassin annécien depuis Pringy : Annecy, Seynod, Épagny, rives du lac, Rumilly, Thônes et les Aravis. Visite et devis gratuits.",
  path: "/zones-intervention/",
});

export default async function Zones() {
  const [h, business, zones] = await Promise.all([getPageHeader("zones"), getSettings(), getZones()]);
  const sp = spans(zones.length);
  return (
    <>
      <PageHero crumbs={[{ name: "Zones d'intervention", path: "/zones-intervention/" }]} title={h.title} lead={h.lead} />

      <Container className="mt-12">
        <AreaMap zones={zones.map(({ slug, name, communes }) => ({ slug, name, communes }))} className="h-[26rem] sm:h-[36rem]" />
        <p className="t-etiquette mt-3 text-gris">Cliquez sur une commune pour voir le secteur. Fond de carte OpenStreetMap.</p>
      </Container>

      <Container className="mt-12">
        <Pose>
          {zones.map((z, i) => (
            <li key={z.slug} className={`flex ${sp[i]}`}>
              <Link href={`/zones-intervention/${z.slug}/`} className="group cabochon flex flex-1 flex-col gap-3 bg-blanc px-6 py-6 hover:bg-white">
                <h2 className="text-[1.45rem] leading-tight font-[720] decoration-2 underline-offset-4 group-hover:underline">{z.name.split(" (")[0]}</h2>
                <p className="text-[0.975rem] text-gris">{z.communes.join(", ")}</p>
                <p className="mt-auto border-t-2 border-alu-2 pt-3 text-[0.95rem] font-[650]">{fr(z.travel)}</p>
              </Link>
            </li>
          ))}
        </Pose>
      </Container>

      <Section labelledBy="depot">
        <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div>
            <SectionHead id="depot" title="Le dépôt, route des Rutys" />
            <address className="mt-6 leading-relaxed not-italic">
              <strong>{business.name}</strong>
              <br />
              {business.address.street}, {business.address.locality}
              <br />
              {business.address.postalCode} {business.address.city}
            </address>
            <p className="mt-4 text-gris">On vient chez vous pour la visite et le devis. Le dépôt n&apos;est pas un magasin.</p>
          </div>
          <GoogleMapFacade business={business} />
        </Container>
      </Section>
    </>
  );
}
