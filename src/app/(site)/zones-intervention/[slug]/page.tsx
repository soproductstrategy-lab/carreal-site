import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AreaMap } from "@/components/AreaMap";
import { FaqList, RealisationGrid } from "@/components/blocks";
import { PageHero } from "@/components/PageHero";
import { RichText } from "@/components/RichText";
import { Container, Preuves } from "@/components/ui";
import { getRealisations, getServices, getZone, getZones } from "@/lib/content";
import { abs, ids, JsonLd, pageMetadata } from "@/lib/seo";
import { fr } from "@/lib/typo";

export async function generateStaticParams() {
  return (await getZones()).map((z) => ({ slug: z.slug }));
}

export async function generateMetadata({ params }: PageProps<"/zones-intervention/[slug]">): Promise<Metadata> {
  const z = await getZone((await params).slug);
  if (!z) return {};
  return pageMetadata({ title: z.title, description: z.metaDescription, path: `/zones-intervention/${z.slug}/` });
}

export default async function ZonePage({ params }: PageProps<"/zones-intervention/[slug]">) {
  const z = await getZone((await params).slug);
  if (!z) notFound();
  const [services, allReals, zones] = await Promise.all([getServices(), getRealisations(), getZones()]);
  const reals = allReals.filter((r) => r.zone === z.slug);
  const h2 = "t-titre mb-6 text-[clamp(1.6rem,1.15rem+1.4vw,2.2rem)]";

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Zones d'intervention", path: "/zones-intervention/" },
          { name: z.name.split(" (")[0], path: `/zones-intervention/${z.slug}/` },
        ]}
        title={z.h1}
        lead={z.lead}
      >
        <p className="mt-6 text-gris">
          <strong className="font-[650] text-anthracite">{fr(z.travel)}.</strong> Codes postaux {z.postalCodes.join(", ")}.
        </p>
        <Preuves className="mt-3" />
      </PageHero>

      <Container className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <article>
          <RichText blocks={z.body} />

          <section className="mt-16" aria-labelledby="z-services">
            <h2 id="z-services" className={h2}>
              Ce que nous posons à {z.communes[0]}
            </h2>
            <ul className="pose">
              {services.map((s) => (
                <li key={s.slug} className="col-span-12 flex sm:col-span-6">
                  <Link href={`/prestations/${s.slug}/`} className="group flex flex-1 items-baseline justify-between gap-3 bg-blanc px-4 py-3.5 hover:bg-white">
                    <span className="font-[650] decoration-2 underline-offset-4 group-hover:underline">{s.name}</span>
                    <span className="t-format text-[1.4rem] text-gris">{fr(s.format)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {reals.length > 0 && (
            <section className="mt-16" aria-labelledby="z-real">
              <h2 id="z-real" className={h2}>
                Chantiers dans le secteur
              </h2>
              <RealisationGrid items={reals} />
            </section>
          )}

          <section className="mt-16" aria-labelledby="z-faq">
            <h2 id="z-faq" className={h2}>
              Questions fréquentes
            </h2>
            <FaqList items={z.faq} />
          </section>
        </article>

        <aside className="grid content-start gap-6 lg:sticky lg:top-24">
          <AreaMap zones={zones.map(({ slug, name, communes }) => ({ slug, name, communes }))} active={z.slug} className="h-80" />
          <div>
            <h2 className="mb-2 font-[700]">Communes couvertes</h2>
            <p className="leading-relaxed text-gris">{z.communes.join(", ")}</p>
          </div>
        </aside>
      </Container>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": abs(`/zones-intervention/${z.slug}/`),
          name: z.h1,
          about: { "@id": ids.business },
          spatialCoverage: z.communes.map((c) => ({ "@type": "City", name: c })),
        }}
      />
    </>
  );
}
