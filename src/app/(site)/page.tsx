import type { Metadata } from "next";
import Link from "next/link";
import { AreaMap } from "@/components/AreaMap";
import { Avis, FaqList, GuideList, Pose, RealisationGrid, ServiceGrid } from "@/components/blocks";
import { ClientLogos } from "@/components/ClientLogos";
import { LogoMark } from "@/components/Logo";
import { Inline } from "@/components/RichText";
import { AppelPatron, Button, Carreau, Container, GoogleHeroBadge, Section, SectionHead, ToutVoir } from "@/components/ui";
import { fillYears } from "@/content/pages";
import { getFaqGroups, getGuides, getHome, getRealisations, getServices, getSettings, getZones } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { fr } from "@/lib/typo";
import depotIllustration from "../../../public/images/carreal-depot-pringy-bd.jpg";

export async function generateMetadata(): Promise<Metadata> {
  const [home, business] = await Promise.all([getHome(), getSettings()]);
  return pageMetadata({ title: fillYears(home.seo.title, business.foundingYear), description: fillYears(home.seo.description, business.foundingYear), path: "/" });
}

export default async function Home() {
  const [home, business, services, zones, realisations, guides, faqGroups] = await Promise.all([
    getHome(),
    getSettings(),
    getServices(),
    getZones(),
    getRealisations(),
    getGuides(),
    getFaqGroups(),
  ]);
  const y = (s = "") => fr(fillYears(s, business.foundingYear));
  const allFaq = faqGroups.flatMap((g) => g.items);
  const heroImg = home.heroPhoto ?? {
    src: depotIllustration.src,
    width: depotIllustration.width,
    height: depotIllustration.height,
    alt: "Illustration ligne claire du dépôt Carreal à Pringy, route des Rutys : les utilitaires floqués Carreal partent vers Annecy à 7 h du matin face aux montagnes",
  };

  return (
    <>
      {/* HERO : le grand rond du camion, coupé par le bord de l'écran */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute top-[18rem] -right-[36vw] z-[1] aspect-square w-[78vw] md:top-[52px] md:right-[max(-18vw,-260px)] md:w-[min(60vw,860px)]"
          aria-hidden="true"
        >
          <LogoMark outline className="size-full" />
        </div>
        <Container className="relative z-[2] grid items-start gap-x-10 pt-3 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:pt-[clamp(28px,4.5vw,64px)]">
          <h1 className="t-camion text-[clamp(2.3rem,0.7rem+5.2vw,5.8rem)] md:col-span-2">
            {home.hero.title.split("\n").map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </h1>
          <div>
            <GoogleHeroBadge className="mt-6" />
            <p className="mt-5 max-w-[34rem] text-[1.1875rem] leading-normal">{y(home.hero.intro)}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-[26px] gap-y-3.5">
              <Button href="/devis/">Demander un devis</Button>
              <AppelPatron />
            </div>
            <p className="mt-7 max-w-[32rem] text-[0.975rem] text-gris [&_strong]:font-[650] [&_strong]:text-anthracite">
              <Inline text={y(home.hero.proof)} />
            </p>
          </div>
          <Carreau
            img={heroImg}
            badge="07 h 00 · Pringy"
            caption={home.hero.photoCaption}
            eager
            className="relative z-[3] mt-10 w-full max-w-[440px] self-start shadow-[0_18px_40px_rgba(31,33,36,0.16)] ring-2 ring-anthracite/10 md:mt-5 md:ml-auto lg:max-w-[490px]"
            sizes="(min-width: 1024px) 490px, (min-width: 768px) 44vw, 92vw"
          />
        </Container>
        <div className="frise relative z-[2] mt-9 md:mt-[clamp(40px,5.5vw,76px)]" aria-hidden="true" />
      </section>

      {/* NOS CLIENTS — bandeau de preuve sociale sous le hero */}
      <ClientLogos />

      {/* PRESTATIONS */}
      <Section labelledBy="prestations">
        <Container>
          <SectionHead id="prestations" title={y(home.services.title)} intro={y(home.services.intro)} link={{ href: "/prestations/", label: `Les ${services.length === 9 ? "neuf" : services.length} prestations` }} />
          <ServiceGrid services={services} className="mt-11" />
        </Container>
      </Section>

      {/* MÉTHODE */}
      <Section labelledBy="methode">
        <Container>
          <SectionHead id="methode" title={y(home.method.title)} intro={y(home.method.intro)} />
          <Pose as="ol" className="etapes mt-11">
            {home.method.steps.map((m, i) => (
              <li key={m.title} className={`col-span-12 flex flex-col gap-3 bg-blanc px-6 py-6 sm:col-span-6 ${i < 3 ? "lg:col-span-4" : i === 3 ? "lg:col-span-5" : i === 4 ? "lg:col-span-4" : "lg:col-span-3"}`}>
                <h3 className="text-[1.25rem] leading-tight font-[720]">{fr(m.title)}</h3>
                <p className="text-[0.975rem] text-gris">{fr(m.text)}</p>
              </li>
            ))}
          </Pose>
        </Container>
      </Section>

      {/* RÉALISATIONS */}
      {realisations.length > 0 && (
        <Section labelledBy="realisations">
          <Container>
            <SectionHead id="realisations" title={y(home.realisations.title)} intro={y(home.realisations.intro)} link={{ href: "/realisations/", label: "Tous les chantiers" }} />
            <div className="mt-11">
              <RealisationGrid items={realisations.slice(0, 4)} />
            </div>
          </Container>
        </Section>
      )}

      {/* AVIS */}
      <Section labelledBy="avis">
        <Container>
          <Avis title={y(home.reviews.title)} intro={y(home.reviews.intro)} sliderConfig={home.reviews} />
        </Container>
      </Section>

      {/* ZONES */}
      <Section labelledBy="zones">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div>
              <SectionHead id="zones" title={y(home.zones.title)} intro={y(home.zones.intro)} />
              <ul className="mt-8 divide-y-2 divide-alu-2 border-y-2 border-alu-2">
                {zones.map((z) => (
                  <li key={z.slug}>
                    <Link href={`/zones-intervention/${z.slug}/`} className="group flex items-baseline justify-between gap-4 py-3.5">
                      <span className="font-[650] decoration-2 underline-offset-4 group-hover:underline">{z.name.split(" (")[0]}</span>
                      <span className="shrink-0 text-[0.95rem] text-gris">{fr(z.travel.replace("depuis notre dépôt de Pringy", "de Pringy").replace("depuis Pringy", "de Pringy"))}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <AreaMap zones={zones.map(({ slug, name, communes }) => ({ slug, name, communes }))} className="h-[26rem] lg:h-[34rem]" />
          </div>
        </Container>
      </Section>

      {/* CONSEILS */}
      <Section labelledBy="conseils">
        <Container>
          <SectionHead id="conseils" title={y(home.guides.title)} intro={y(home.guides.intro)} link={{ href: "/conseils/", label: "Tous les articles" }} />
          <div className="mt-11">
            <GuideList guides={guides.slice(0, 5)} />
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section labelledBy="faq">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div>
            <h2 id="faq" className="t-titre max-w-[14ch] text-[clamp(1.9rem,1.1rem+2.4vw,3.15rem)]">
              {y(home.faq.title)}
            </h2>
            <ToutVoir href="/faq/" className="mt-6 inline-block">
              Toutes les questions
            </ToutVoir>
          </div>
          <FaqList items={allFaq.slice(0, 6)} />
        </Container>
      </Section>
    </>
  );
}
