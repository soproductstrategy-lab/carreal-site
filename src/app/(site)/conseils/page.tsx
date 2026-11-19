import type { Metadata } from "next";
import Link from "next/link";
import { GuideList } from "@/components/blocks";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
import type { Guide } from "@/content/types";
import { getGuides, getPageHeader } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { fr } from "@/lib/typo";

export const metadata: Metadata = pageMetadata({
  title: "Prix et conseils carrelage – Le carnet du carreleur | Carreal",
  description:
    "Prix de pose au m² et de douche à l'italienne à Annecy, choix du format, joints noircis, carrelage fissuré : les guides pratiques de Carreal, carreleur depuis 2000.",
  path: "/conseils/",
});

const categories: { name: Guide["category"]; anchor: string }[] = [
  { name: "Prix", anchor: "prix" },
  { name: "Conseils techniques", anchor: "techniques" },
  { name: "Problèmes & réparations", anchor: "reparations" },
];

export default async function Conseils() {
  const [h, guides] = await Promise.all([getPageHeader("conseils"), getGuides()]);
  const featured = guides.find((g) => g.slug === "prix-pose-carrelage-m2-annecy") ?? guides[0];

  return (
    <>
      <PageHero crumbs={[{ name: "Prix et conseils", path: "/conseils/" }]} title={h.title} lead={h.lead}>
        <nav aria-label="Catégories" className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <a key={c.anchor} href={`#${c.anchor}`} className="rounded-[2px] border-2 border-anthracite px-4 py-2 text-[0.95rem] font-[650] hover:bg-anthracite hover:text-blanc">
              {c.name} ({guides.filter((g) => g.category === c.name).length})
            </a>
          ))}
        </nav>
      </PageHero>

      {featured && (
        <Container className="mt-12">
          <Link href={`/conseils/${featured.slug}/`} className="group cabochon grid gap-6 bg-rouge px-6 py-8 text-white hover:bg-rouge-fonce after:!bg-anthracite md:grid-cols-[auto_minmax(0,1fr)] md:items-center md:gap-12 md:px-10">
            <b className="t-format text-[clamp(3.4rem,2.2rem+4vw,6.4rem)]">45 à 75 €/m²</b>
            <span>
              <span className="t-etiquette block">À lire d&apos;abord</span>
              <span className="mt-1 block text-[clamp(1.4rem,1.1rem+1vw,2rem)] leading-tight font-[720] decoration-2 underline-offset-4 group-hover:underline">{fr(featured.title)}</span>
              <span className="mt-3 block max-w-[46rem] text-white/90">{fr(featured.lead)}</span>
            </span>
          </Link>
        </Container>
      )}

      {categories.map((c) => {
        const list = guides.filter((g) => g.category === c.name && g.slug !== featured?.slug);
        if (!list.length) return null;
        return (
          <section key={c.anchor} id={c.anchor} className="scroll-mt-24 pt-16" aria-labelledby={`h-${c.anchor}`}>
            <Container>
              <h2 id={`h-${c.anchor}`} className="t-titre mb-6 text-[clamp(1.6rem,1.15rem+1.4vw,2.4rem)]">
                {c.name}
              </h2>
              <GuideList guides={list} />
            </Container>
          </section>
        );
      })}
    </>
  );
}
