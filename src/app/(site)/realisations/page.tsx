import type { Metadata } from "next";
import { RealisationGrid } from "@/components/blocks";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
import { getPageHeader, getRealisations } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Réalisations – Chantiers de carrelage à Annecy | Carreal",
  description:
    "Chantiers de carrelage réalisés par Carreal à Annecy et en Haute-Savoie : salles de bain, douches à l'italienne, terrasses, grands formats. Format, pose, durée, photos.",
  path: "/realisations/",
});

export default async function Realisations() {
  const [h, realisations] = await Promise.all([getPageHeader("realisations"), getRealisations()]);
  return (
    <>
      <PageHero crumbs={[{ name: "Réalisations", path: "/realisations/" }]} title={h.title} lead={h.lead} />
      <Container className="mt-12">
        {realisations.length ? <RealisationGrid items={realisations} /> : <p className="text-gris">Les premiers chantiers arrivent bientôt.</p>}
      </Container>
    </>
  );
}
