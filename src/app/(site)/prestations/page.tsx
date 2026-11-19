import type { Metadata } from "next";
import { ServiceGrid } from "@/components/blocks";
import { PageHero } from "@/components/PageHero";
import { Container, Preuves } from "@/components/ui";
import { getPageHeader, getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Prestations de carrelage à Annecy – Sol, salle de bain, terrasse | Carreal",
  description:
    "Toutes les prestations de Carreal, carreleur à Annecy : carrelage sol, salle de bain, douche à l'italienne, terrasse, faïence, grand format, pierre naturelle, réparations.",
  path: "/prestations/",
});

export default async function Prestations() {
  const [h, services] = await Promise.all([getPageHeader("prestations"), getServices()]);
  return (
    <>
      <PageHero crumbs={[{ name: "Prestations", path: "/prestations/" }]} title={h.title} lead={h.lead}>
        <Preuves className="mt-6" />
      </PageHero>
      <Container className="mt-12">
        <ServiceGrid services={services} />
        <p className="mt-4 text-[0.9rem] text-gris">Prix TTC constatés sur nos chantiers 2026, pose seule. Seul le devis après visite fait foi.</p>
      </Container>
    </>
  );
}
