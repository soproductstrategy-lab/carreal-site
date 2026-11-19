import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList } from "@/components/blocks";
import { PageHero } from "@/components/PageHero";
import { RichText } from "@/components/RichText";
import { AppelPatron, Button, Carreau, Container } from "@/components/ui";
import { getGuide, getGuides, getServices, getSettings } from "@/lib/content";
import { abs, ids, JsonLd, pageMetadata } from "@/lib/seo";
import { fr } from "@/lib/typo";

export async function generateStaticParams() {
  return (await getGuides()).map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/conseils/[slug]">): Promise<Metadata> {
  const g = await getGuide((await params).slug);
  if (!g) return {};
  return pageMetadata({ title: `${g.title} | Carreal`, description: g.metaDescription, path: `/conseils/${g.slug}/`, ogType: "article" });
}

const fmt = (d: string) => new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(d));

export default async function GuidePage({ params }: PageProps<"/conseils/[slug]">) {
  const g = await getGuide((await params).slug);
  if (!g) notFound();
  const [business, services] = await Promise.all([getSettings(), getServices()]);
  const svc = g.relatedServices.map((s) => services.find((x) => x.slug === s)).filter((x) => x !== undefined);

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Prix et conseils", path: "/conseils/" },
          { name: g.category, path: `/conseils/${g.slug}/` },
        ]}
        title={g.h1}
        aside={g.image ? <Carreau img={g.image} caption="Photo d'illustration" eager /> : undefined}
      >
        {/* Réponse directe en tête : le passage le plus cité par les moteurs IA */}
        <p className="mt-8 max-w-[44rem] border-l-[6px] border-rouge bg-blanc px-5 py-4 text-[1.1rem] leading-relaxed">
          <span className="t-etiquette mb-1 block text-rouge-fonce">La réponse courte</span>
          {fr(g.lead)}
        </p>
        <p className="mt-6 text-[0.95rem] text-gris">
          Par <strong className="font-[650] text-anthracite">{business.founder.name}</strong>, carreleur à Annecy depuis {business.foundingYear}. Mis à jour le {fmt(g.updated)}.{" "}
          {g.readingMinutes} min de lecture.
        </p>
      </PageHero>

      <Container className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article>
          <RichText blocks={g.body} />
          <section className="mt-16" aria-labelledby="g-faq">
            <h2 id="g-faq" className="t-titre mb-6 text-[clamp(1.6rem,1.15rem+1.4vw,2.2rem)]">
              Questions fréquentes
            </h2>
            <FaqList items={g.faq} />
          </section>
        </article>
        <aside className="grid content-start gap-8 lg:sticky lg:top-24">
          {svc.length > 0 && (
            <div>
              <h2 className="mb-3 font-[700]">Prestations liées</h2>
              <ul className="divide-y-2 divide-alu-2 border-y-2 border-alu-2">
                {svc.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/prestations/${s.slug}/`} className="block py-2.5 decoration-2 underline-offset-4 hover:underline">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid gap-5 bg-blanc p-6">
            <p className="font-[650]">Une question sur votre chantier ?</p>
            <Button href="/devis/">Demander un devis</Button>
            <AppelPatron />
          </div>
        </aside>
      </Container>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.h1,
          description: g.metaDescription,
          datePublished: g.published,
          dateModified: g.updated,
          inLanguage: "fr-FR",
          author: { "@id": ids.founder },
          publisher: { "@id": ids.business },
          mainEntityOfPage: abs(`/conseils/${g.slug}/`),
        }}
      />
    </>
  );
}
