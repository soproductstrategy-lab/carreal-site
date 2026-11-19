import type { Metadata } from "next";
import { FaqList } from "@/components/blocks";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
import { getFaqGroups, getPageHeader } from "@/lib/content";
import { faqLd, JsonLd, pageMetadata } from "@/lib/seo";
import { fr } from "@/lib/typo";

export const metadata: Metadata = pageMetadata({
  title: "Questions fréquentes sur la pose de carrelage | Carreal Annecy",
  description: "Devis, délais, prix, préparation du support, garanties, TVA : les réponses d'un carreleur annécien aux questions les plus fréquentes.",
  path: "/faq/",
});

export default async function FaqPage() {
  const [h, faqGroups] = await Promise.all([getPageHeader("faq"), getFaqGroups()]);
  const allFaq = faqGroups.flatMap((g) => g.items);
  return (
    <>
      <PageHero crumbs={[{ name: "Questions fréquentes", path: "/faq/" }]} title={h.title} lead={h.lead} />
      <Container className="mt-14 grid gap-16">
        {faqGroups.map((g) => (
          <section key={g.title} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)]">
            <h2 className="t-titre text-[clamp(1.6rem,1.15rem+1.4vw,2.2rem)]">{fr(g.title)}</h2>
            <FaqList items={g.items} withSchema={false} />
          </section>
        ))}
      </Container>
      <JsonLd data={faqLd(allFaq)} />
    </>
  );
}
