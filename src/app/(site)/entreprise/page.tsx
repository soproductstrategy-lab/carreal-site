import type { Metadata } from "next";
import { Pose } from "@/components/blocks";
import { GoogleMapFacade } from "@/components/GoogleMapFacade";
import { PageHero } from "@/components/PageHero";
import { Inline, RichText } from "@/components/RichText";
import { Carreau, Container, Preuves, Section, SectionHead } from "@/components/ui";
import { fillYears } from "@/content/pages";
import { getAbout, getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { fr } from "@/lib/typo";
import vanPhoto from "../../../../public/images/carreal-depot-pringy-utilitaire.webp";

export async function generateMetadata(): Promise<Metadata> {
  const [about, business] = await Promise.all([getAbout(), getSettings()]);
  return pageMetadata({
    title: fillYears(about.seo.title, business.foundingYear),
    description: fillYears(about.seo.description, business.foundingYear),
    path: "/entreprise/",
  });
}

export default async function Entreprise() {
  const [about, business] = await Promise.all([getAbout(), getSettings()]);
  const { legal } = business;
  const y = (s = "") => fr(fillYears(s, business.foundingYear));
  const photo = about.photo ?? { src: vanPhoto.src, width: vanPhoto.width, height: vanPhoto.height, alt: "Utilitaire Carreal floqué au logo rouge devant le dépôt de Pringy, route des Rutys" };

  return (
    <>
      <PageHero
        crumbs={[{ name: "L'entreprise", path: "/entreprise/" }]}
        title={y(about.header.title)}
        lead={y(about.header.lead)}
        aside={<Carreau img={photo} caption={about.photoCaption} eager className="max-w-[420px] lg:ml-auto" sizes="420px" />}
      >
        <Preuves className="mt-6" />
      </PageHero>

      <Container className="mt-14">
        <div id="histoire" className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.25fr)] lg:gap-14">
          <aside className="bg-anthracite p-7 text-white sm:p-9 lg:sticky lg:top-28">
            <div className="flex items-center gap-2.5">
              <span className="size-2.5 shrink-0 bg-rouge" aria-hidden="true" />
              <p className="t-etiquette tracking-[0.06em] text-gris-clair uppercase">À propos de Carreal</p>
            </div>
            <p className="t-titre mt-5 text-[clamp(1.4rem,1.05rem+1vw,1.95rem)] leading-[1.2] text-white">
              Bienvenue chez Carreal, expert en carrelage depuis {business.foundingYear} sur Annecy et ses environs. Nous sommes une équipe passionnée, dédiée à transformer vos espaces avec précision et esthétisme.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-[#3a3e43] pt-6 text-[0.9rem]">
              <div>
                <dt className="t-etiquette text-gris-clair">Fondation</dt>
                <dd className="tnum mt-1 font-[700] text-white">{business.foundingYear} · Annecy</dd>
              </div>
              <div>
                <dt className="t-etiquette text-gris-clair">Pose</dt>
                <dd className="mt-1 font-[700] text-white">Équipe salariée</dd>
              </div>
              <div className="col-span-2">
                <dt className="t-etiquette text-gris-clair">Valeurs</dt>
                <dd className="mt-1 font-[650] text-[#e6e7e4]">Passion, qualité et satisfaction durable</dd>
              </div>
            </dl>
          </aside>

          <div className="[&_.prose-carreal>h2:first-child]:mt-0">
            <RichText blocks={about.story} />
          </div>
        </div>
      </Container>

      <Section labelledBy="valeurs">
        <Container>
          <SectionHead id="valeurs" title={y(about.valuesTitle)} />
          <Pose as="div" className="mt-11">
            {about.values.map((v, i) => (
              <div key={v.title} className={`col-span-12 bg-blanc p-6 sm:col-span-6 ${i % 4 === 0 || i % 4 === 3 ? "lg:col-span-7" : "lg:col-span-5"}`}>
                <h3 className="text-[1.3rem] font-[720]">{fr(v.title)}</h3>
                <p className="mt-2 text-gris">{fr(v.text)}</p>
              </div>
            ))}
          </Pose>
        </Container>
      </Section>

      <Section id="assurances" labelledBy="assurances-t">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <SectionHead id="assurances-t" title={y(about.insuranceTitle)} />
          <div className="prose-carreal">
            <p>
              <Inline text={about.insuranceText} />
            </p>
            <ul>
              <li>
                Assureur : {legal.insurance.insurer}, {legal.insurance.address}
              </li>
              <li>Couverture géographique : {legal.insurance.coverage}</li>
              <li>Garantie de parfait achèvement (1 an), biennale (2 ans), décennale (10 ans)</li>
            </ul>
            <p className="text-[0.9rem] text-gris">
              {legal.form} au capital de {legal.capital}, SIRET {legal.siret}, {legal.rcs}, NAF {legal.naf}.
            </p>
          </div>
        </Container>
      </Section>

      <Section labelledBy="carte">
        <Container className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <SectionHead id="carte" title={`${business.address.street}, ${business.address.locality}`} intro="Le dépôt et les camions. On vient chez vous pour la visite." />
          <GoogleMapFacade business={business} />
        </Container>
      </Section>
    </>
  );
}
