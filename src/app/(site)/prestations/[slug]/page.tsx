import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqList, RealisationGrid, ServiceGrid, splitPrix } from "@/components/blocks";
import { PageHero } from "@/components/PageHero";
import { RichText } from "@/components/RichText";
import { AppelPatron, Button, Carreau, Container, Preuves, Section } from "@/components/ui";
import { getRealisations, getService, getServices, getSettings, getZones } from "@/lib/content";
import { abs, ids, JsonLd, pageMetadata } from "@/lib/seo";
import { fr } from "@/lib/typo";

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/prestations/[slug]">): Promise<Metadata> {
  const s = await getService((await params).slug);
  if (!s) return {};
  return pageMetadata({ title: s.title, description: s.metaDescription, path: `/prestations/${s.slug}/` });
}

export default async function ServicePage({ params }: PageProps<"/prestations/[slug]">) {
  const s = await getService((await params).slug);
  if (!s) notFound();
  const [services, zones, allReals, business] = await Promise.all([getServices(), getZones(), getRealisations(), getSettings()]);
  const reals = allReals.filter((r) => r.services.includes(s.slug));
  const related = s.related.map((r) => services.find((x) => x.slug === r)).filter((x) => x !== undefined);
  const prix = splitPrix(s.priceRange);

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Prestations", path: "/prestations/" },
          { name: s.short, path: `/prestations/${s.slug}/` },
        ]}
        title={s.h1}
        lead={s.lead}
        rond={!s.image}
        aside={s.image ? <Carreau img={s.image} caption="Photo d'illustration" eager sizes="(min-width: 1024px) 40vw, 100vw" /> : undefined}
      >
        <p className="mt-7 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <b className="t-format text-[clamp(3rem,2rem+3vw,4.6rem)]">{fr(s.format)}</b>
          <span className="text-gris">{fr(s.formatNote)}</span>
        </p>
        <Preuves className="mt-6" />
      </PageHero>

      <Container className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <article>
          <RichText blocks={s.body} />
          {reals.length > 0 && (
            <section className="mt-20" aria-labelledby="real-s">
              <h2 id="real-s" className="t-titre mb-6 text-[clamp(1.6rem,1.15rem+1.4vw,2.2rem)]">
                Chantiers : {s.short.toLowerCase()}
              </h2>
              <RealisationGrid items={reals} />
            </section>
          )}
          <section className="mt-20" aria-labelledby="faq-s">
            <h2 id="faq-s" className="t-titre mb-6 text-[clamp(1.6rem,1.15rem+1.4vw,2.2rem)]">
              Questions fréquentes
            </h2>
            <FaqList items={s.faq} />
          </section>
        </article>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="pose !grid-cols-1">
            <div className="bg-blanc p-6">
              <p className="t-etiquette text-gris">Prix constaté en 2026</p>
              <p className="tnum mt-2 text-[1.9rem] leading-tight font-[760] [font-stretch:100%]">{prix.main}</p>
              {prix.scope && <p className="text-gris">{prix.scope}</p>}
              <p className="mt-3 text-[0.85rem] text-gris">TTC. Seul le devis après visite fait foi.</p>
            </div>
            <div className="grid gap-5 bg-blanc p-6">
              <Button href={`/devis/?prestation=${s.slug}`}>Demander un devis</Button>
              <AppelPatron />
              <p className="text-[0.9rem] text-gris">{fr(business.responsePromise)}.</p>
            </div>
          </div>
          <nav aria-label="Secteurs" className="mt-8">
            <h2 className="mb-3 font-[700]">{s.short} près de chez vous</h2>
            <ul className="divide-y-2 divide-alu-2 border-y-2 border-alu-2">
              {zones.map((z) => (
                <li key={z.slug}>
                  <Link href={`/zones-intervention/${z.slug}/`} className="block py-2.5 decoration-2 underline-offset-4 hover:underline">
                    {z.name.split(" (")[0]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </Container>

      {related.length > 0 && (
        <Section labelledBy="related">
          <Container>
            <h2 id="related" className="t-titre text-[clamp(1.9rem,1.1rem+2.4vw,3.15rem)]">
              À voir aussi
            </h2>
            <ServiceGrid services={related} redFirst={false} className="mt-11" />
          </Container>
        </Section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          "@id": abs(`/prestations/${s.slug}/#service`),
          name: s.name,
          serviceType: s.name,
          description: s.lead,
          url: abs(`/prestations/${s.slug}/`),
          provider: { "@id": ids.business },
          areaServed: zones.map((z) => ({ "@type": "Place", name: z.name })),
          offers: { "@type": "Offer", priceCurrency: "EUR", description: s.priceRange },
          ...(s.image ? { image: s.image.src } : {}),
        }}
      />
    </>
  );
}
