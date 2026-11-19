import Link from "next/link";
import { tel } from "@/content/business";
import { getHome, getServices, getSettings, getZones } from "@/lib/content";
import { fr } from "@/lib/typo";
import { LogoMark } from "./Logo";
import { Inline } from "./RichText";
import { btnClass, Container } from "./ui";

const heure = (h: string) => h.replace(/^0/, "").replace(":00", " h").replace(":", " h ");

/** Pied de page = le flanc du camion : frise, appel final, lettrage CARREAL pleine largeur, coordonnées. */
export async function SiteFooter() {
  const [services, zones, business, home] = await Promise.all([getServices(), getZones(), getSettings(), getHome()]);
  const { address, legal } = business;
  return (
    <footer className="relative mt-[clamp(80px,10vw,144px)] overflow-hidden bg-anthracite pb-24 text-[#e6e7e4] lg:pb-0">
      <div className="frise-sombre" aria-hidden="true" />
      <Container>
        {/* Appel final */}
        <div className="grid items-end gap-x-12 gap-y-8 pt-[72px] md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <h2 className="t-titre max-w-[16ch] text-[clamp(1.9rem,1.1rem+2.6vw,3.4rem)] text-white">{fr(home.cta.title)}</h2>
            <p className="mt-4 max-w-[34rem] text-gris-clair">
              <Inline text={home.cta.text} />
            </p>
          </div>
          <div className="grid justify-items-start gap-3">
            <a href={tel(business)} data-track="call" className="tnum text-[clamp(1.9rem,1.3rem+1.6vw,2.8rem)] leading-none font-[780] text-white hover:text-rouge-clair">
              {business.phone.display}
            </a>
            <Link href="/devis/" className={btnClass("rouge")}>
              Demander un devis
            </Link>
          </div>
        </div>

        {/* Le flanc : lettrage du camion */}
        <p
          aria-hidden="true"
          className="mt-[72px] flex items-center gap-[0.06em] text-[clamp(3.1rem,0.4rem+12.6vw,12.4rem)] leading-[0.8] tracking-[0.005em] whitespace-nowrap text-white uppercase [font-stretch:125%] [font-weight:880]"
        >
          <LogoMark className="size-[0.86em] shrink-0" />
          ARREAL
        </p>

        <div className="grid gap-8 pt-14 pb-10 text-[0.975rem] sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="mb-3 font-[700] text-white">
              {business.name} {legal.form}
            </h3>
            {/* NAP : identique à la fiche Google Business Profile */}
            <address className="leading-relaxed text-[#d4d6d3] not-italic">
              {address.street}, {address.locality}
              <br />
              {address.postalCode} {address.city}
              <br />
              <a href={tel(business)} data-track="call" className="tnum font-[700] text-white hover:underline">
                {business.phone.display}
              </a>
              <br />
              <a href={`mailto:${business.email}`} className="hover:text-white hover:underline">
                {business.email}
              </a>
            </address>
            <dl className="tnum mt-3.5 grid grid-cols-[auto_auto] justify-start gap-x-[18px] gap-y-1 text-gris-clair">
              {business.hours.map((h) => (
                <div key={h.label} className="contents">
                  <dt>{h.label}</dt>
                  <dd>{fr(`${heure(h.opens)} à ${heure(h.closes)}`)}</dd>
                </div>
              ))}
              <dt>Dimanche</dt>
              <dd>Fermé</dd>
            </dl>
          </div>
          <FooterCol title="Prestations" links={services.map((s) => ({ href: `/prestations/${s.slug}/`, label: s.short }))} />
          <FooterCol title="Secteurs" links={zones.map((z) => ({ href: `/zones-intervention/${z.slug}/`, label: z.name.split(" (")[0] }))} />
          <FooterCol
            title="Carreal"
            links={[
              { href: "/realisations/", label: "Réalisations" },
              { href: "/entreprise/", label: "L'entreprise" },
              { href: "/avis/", label: "Avis clients" },
              { href: "/conseils/", label: "Prix et conseils" },
              { href: "/faq/", label: "Questions fréquentes" },
              { href: "/devis/", label: "Demander un devis" },
            ]}
          />
        </div>

        <div className="border-t border-[#3a3e43] pt-5 pb-8 text-[0.85rem] leading-relaxed text-gris-clair">
          <p>
            {business.legalName.replace(` ${legal.form}`, "")}, {legal.form} au capital de {legal.capital}, SIRET {legal.siret}, {legal.rcs}, TVA {legal.vat}.
          </p>
          <p className="mt-1">
            Assurance décennale : {legal.insurance.insurer}, couverture {legal.insurance.coverage}. Médiateur de la consommation : {legal.mediator.name}.
          </p>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/mentions-legales/" className="underline-offset-4 hover:text-white hover:underline">
              Mentions légales
            </Link>
            <Link href="/confidentialite/" className="underline-offset-4 hover:text-white hover:underline">
              Confidentialité
            </Link>
            <span>
              © {business.foundingYear}–2026 {business.name}
            </span>
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <h3 className="mb-3 font-[700] text-white">{title}</h3>
      <ul className="grid gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[#d4d6d3] underline-offset-[3px] hover:text-white hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
