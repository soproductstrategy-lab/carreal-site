import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pose } from "@/components/blocks";
import { Calepinage } from "@/components/Calepinage";
import { RichText } from "@/components/RichText";
import { Breadcrumbs, Button, Carreau, Container } from "@/components/ui";
import { getRealisation, getRealisations, getServices, getZone } from "@/lib/content";
import { abs, ids, JsonLd, pageMetadata } from "@/lib/seo";
import { fr } from "@/lib/typo";

export async function generateStaticParams() {
  const list = await getRealisations();
  // Cache Components exige au moins un paramètre : page 404 si aucune réalisation.
  return list.length ? list.map((r) => ({ slug: r.slug })) : [{ slug: "aucune" }];
}

export async function generateMetadata({ params }: PageProps<"/realisations/[slug]">): Promise<Metadata> {
  const r = await getRealisation((await params).slug);
  if (!r) return {};
  return pageMetadata({
    title: `${r.title} à ${r.commune} (${r.year}) – Réalisation Carreal`,
    description: `${r.surface} de ${r.material.toLowerCase()} ${r.format} posés à ${r.commune} : ${r.summary}`.slice(0, 158),
    path: `/realisations/${r.slug}/`,
    noindex: r.demo,
    ogType: "article",
  });
}

export default async function RealisationPage({ params }: PageProps<"/realisations/[slug]">) {
  const r = await getRealisation((await params).slug);
  if (!r) notFound();
  const [zone, services] = await Promise.all([getZone(r.zone), getServices()]);
  const svc = r.services.map((s) => services.find((x) => x.slug === s)).filter((x) => x !== undefined);
  const facts = [
    { label: "Commune", value: r.commune },
    { label: "Pièce", value: r.room },
    { label: "Matériau", value: r.material },
    { label: "Format", value: r.format },
    { label: "Pose", value: r.layout },
    { label: "Joint", value: r.joint },
    { label: "Surface", value: r.surface },
    { label: "Durée", value: r.duration },
  ].filter((f) => f.value);
  const [first, ...more] = r.images;

  return (
    <>
      <section>
        <Container className="pt-6 pb-12">
          <Breadcrumbs
            items={[
              { name: "Réalisations", path: "/realisations/" },
              { name: r.commune, path: `/realisations/${r.slug}/` },
            ]}
          />
          {r.demo && (
            <p className="mt-6 inline-block bg-anthracite px-3 py-1.5 text-[0.9rem] text-white">
              Exemple : les photos sont des illustrations. Cette fiche montre la forme d&apos;un chantier documenté.
            </p>
          )}
          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end">
            <div>
              <p className="t-format text-[clamp(3rem,2rem+3vw,4.6rem)]">{fr(r.format.split(" · ")[0])}</p>
              <h1 className="t-titre mt-4 text-[clamp(2.2rem,1.2rem+3.4vw,4.2rem)]">{fr(r.title)}</h1>
              <p className="mt-6 max-w-[40rem] text-[1.1875rem] leading-normal">{fr(r.summary)}</p>
            </div>
            {first ? (
              <Carreau img={first} eager sizes="(min-width: 1024px) 50vw, 100vw" />
            ) : (
              <figure className="bg-blanc p-2">
                <div className="relative aspect-[4/3]">
                  <Calepinage pattern={r.pattern} className="absolute inset-0 size-full" label={`Schéma de pose : ${r.layout}, ${r.format}`} />
                </div>
                <figcaption className="px-0.5 pt-2.5 pb-1 text-[0.85rem] text-gris">Schéma de pose (photo à venir)</figcaption>
              </figure>
            )}
          </div>
        </Container>
        <div className="frise-fine" aria-hidden="true" />
      </section>

      <Container className="mt-12">
        {/* Fiche technique : liste structurée facile à extraire pour les moteurs IA */}
        <dl className="pose">
          {facts.map((f) => (
            <div key={f.label} className="col-span-6 bg-blanc px-4 py-3 md:col-span-3">
              <dt className="t-etiquette text-gris">{f.label}</dt>
              <dd className="mt-1 font-[650]">{fr(f.value)}</dd>
            </div>
          ))}
        </dl>
      </Container>

      {more.length > 0 && (
        <Container className="mt-12">
          {more.length === 1 ? (
            <Carreau
              img={more[0]}
              caption={more[0].alt.replace(/\s*\((?:photo d')?illustration\)\s*$/i, "")}
              className="max-w-3xl"
              sizes="(min-width: 1024px) 768px, 100vw"
            />
          ) : (
            <Pose>
              {more.map((img, i) => (
                <li key={img.src} className={`col-span-12 md:col-span-6 ${i % 2 === 0 ? "lg:col-span-7" : "lg:col-span-5"}`}>
                  <Carreau img={img} className="!p-0" sizes="(min-width: 1024px) 50vw, 100vw" />
                </li>
              ))}
            </Pose>
          )}
        </Container>
      )}

      <Container className="mt-14 grid gap-14 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <RichText blocks={r.body} />
        <aside className="grid content-start gap-8">
          {svc.length > 0 && (
            <div>
              <h2 className="mb-3 font-[700]">Prestations</h2>
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
          {zone && (
            <div>
              <h2 className="mb-3 font-[700]">Secteur</h2>
              <Link href={`/zones-intervention/${zone.slug}/`} className="underline decoration-2 underline-offset-4 hover:text-rouge-fonce">
                Carreleur, {zone.name.split(" (")[0]}
              </Link>
            </div>
          )}
          <Button href="/devis/">Un projet du même genre ?</Button>
        </aside>
      </Container>

      {!r.demo && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: r.title,
            description: r.summary,
            datePublished: `${r.year}-01-01`,
            author: { "@id": ids.business },
            publisher: { "@id": ids.business },
            contentLocation: { "@type": "Place", name: r.commune },
            image: r.images.map((i) => i.src),
            mainEntityOfPage: abs(`/realisations/${r.slug}/`),
          }}
        />
      )}
    </>
  );
}
