import Link from "next/link";
import { tel } from "@/content/business";
import { getGuides, getReviews, getServices, getSettings, getZones } from "@/lib/content";
import { fr } from "@/lib/typo";
import { splitPrix } from "./blocks";
import { HeaderNav } from "./HeaderNav";
import { Logo } from "./Logo";
import { Container, enLettres, majuscule } from "./ui";

export const nav = [
  { href: "/prestations/", label: "Prestations" },
  { href: "/realisations/", label: "Réalisations" },
  { href: "/zones-intervention/", label: "Zones" },
  { href: "/conseils/", label: "Prix et conseils" },
  { href: "/entreprise/", label: "L'entreprise" },
];

export async function SiteHeader() {
  const [services, zones, guides, reviews, business] = await Promise.all([
    getServices(),
    getZones(),
    getGuides(),
    getReviews(),
    getSettings(),
  ]);

  const navServices = services.map((s) => ({
    slug: s.slug,
    short: s.short,
    name: s.name,
    format: fr(s.format || s.short),
    priceMain: splitPrix(s.priceRange).main,
  }));

  const navZones = zones.map((z) => ({
    slug: z.slug,
    label: z.name.split(" (")[0],
    communes: z.communes.slice(0, 4).join(", "),
    travel: fr(z.travel.replace("depuis notre dépôt de Pringy", "").replace("depuis Pringy", "").trim()),
  }));

  const navGuides = guides.slice(0, 4).map((g) => ({
    slug: g.slug,
    title: fr(g.title),
    category: g.category,
    readingMinutes: g.readingMinutes,
  }));

  const tous5 = reviews.list.length > 0 && reviews.list.every((r) => r.rating === 5);

  return (
    <header className="sticky top-0 z-50 bg-alu/95 backdrop-blur-sm">
      <Container className="flex h-[76px] items-center justify-between gap-6">
        <Link href="/" aria-label="Carreal — Accueil" className="shrink-0">
          <Logo />
        </Link>

        <HeaderNav
          services={navServices}
          zones={navZones}
          guides={navGuides}
          business={{
            phoneDisplay: business.phone.display,
            telHref: tel(business),
            founderName: business.founder.name,
            addressShort: `${business.address.street}, ${business.address.locality}`,
            reviewLabel: `${majuscule(enLettres(reviews.count))} avis${tous5 ? ", 5/5" : ""}`,
            foundingYear: business.foundingYear,
          }}
        />
      </Container>
    </header>
  );
}
