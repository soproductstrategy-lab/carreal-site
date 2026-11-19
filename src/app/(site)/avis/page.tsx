import type { Metadata } from "next";
import { Avis } from "@/components/blocks";
import { Breadcrumbs, Button, Container } from "@/components/ui";
import { getPageHeader, getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Avis clients – Carreal, carreleur à Annecy",
  description:
    "Ce que les clients de Carreal disent de leur chantier : qualité de finition, suivi, propreté, respect des délais. Avis Google vérifiables, carreleur à Annecy.",
  path: "/avis/",
});

export default async function AvisPage() {
  const [h, business] = await Promise.all([getPageHeader("avis"), getSettings()]);
  return (
    <>
      <Container className="pt-6">
        <Breadcrumbs items={[{ name: "Avis clients", path: "/avis/" }]} />
      </Container>
      <Container className="mt-10">
        <Avis title={h.title} intro={h.lead} all asH1 headingId="avis-titre" />
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button href={business.googleMapsUrl} variant="trait" rel="noopener">
            Voir les avis sur Google
          </Button>
          <Button href={business.googleReviewUrl} rel="noopener">
            Vous êtes client ? Laissez un avis
          </Button>
        </div>
      </Container>
    </>
  );
}
