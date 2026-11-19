import type { Metadata } from "next";
import type { BreadcrumbList, FAQPage, Graph, HomeAndConstructionBusiness, Thing, WithContext } from "schema-dts";
import { business as localBusiness, IS_NOINDEX, SITE_URL, type Business } from "@/content/business";
import type { Faq, Service, Zone } from "@/content/types";

export const abs = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export function pageMetadata({
  title,
  description,
  path,
  noindex,
  ogType = "website",
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogType?: "website" | "article";
}): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    robots: IS_NOINDEX
      ? { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } }
      : noindex
        ? { index: false, follow: true }
        : undefined,
    openGraph: {
      type: ogType,
      locale: "fr_FR",
      siteName: localBusiness.name,
      url: path,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const ids = {
  business: abs("/#entreprise"),
  website: abs("/#site"),
  founder: abs("/entreprise/#xavier-basso"),
};

export function businessNode(business: Business, services: Service[], zones: Zone[]): HomeAndConstructionBusiness {
  return {
    "@type": "HomeAndConstructionBusiness",
    "@id": ids.business,
    name: business.name,
    alternateName: ["Carréal", "Carreal SARL"],
    legalName: business.legalName,
    description: business.description,
    slogan: business.tagline,
    url: abs("/"),
    logo: { "@type": "ImageObject", url: abs("/logo-carreal.png"), width: "512", height: "512" },
    image: [abs("/opengraph-image")],
    telephone: business.phone.e164,
    email: business.email,
    foundingDate: String(business.foundingYear),
    founder: { "@id": ids.founder },
    vatID: business.legal.vat,
    taxID: business.legal.siren.replace(/\s/g, ""),
    identifier: [
      { "@type": "PropertyValue", propertyID: "SIRET", value: business.legal.siret.replace(/\s/g, "") },
      { "@type": "PropertyValue", propertyID: "NAF", value: "43.33Z" },
    ],
    numberOfEmployees: { "@type": "QuantitativeValue", minValue: 1, maxValue: 5 },
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: `${business.address.city} (${business.address.locality})`,
      postalCode: business.address.postalCode,
      addressRegion: business.address.region,
      addressCountry: business.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: business.geo.lat, longitude: business.geo.lng },
    hasMap: business.googleMapsUrl,
    openingHoursSpecification: business.hours.map((h) => ({
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: h.days.map((d) => `https://schema.org/${d}`) as never,
      opens: h.opens,
      closes: h.closes,
    })),
    priceRange: "€€",
    currenciesAccepted: "EUR",
    areaServed: [
      ...zones.flatMap((z) => z.communes).map((c) => ({ "@type": "City" as const, name: c })),
      { "@type": "AdministrativeArea", name: "Haute-Savoie", sameAs: "https://fr.wikipedia.org/wiki/Haute-Savoie" },
    ],
    knowsAbout: [
      "Pose de carrelage",
      "Faïence murale",
      "Douche à l'italienne",
      "Étanchéité sous carrelage (SPEC)",
      "Carrelage grand format",
      "Terrasse carrelée sur plots",
      "Pierre naturelle",
      "DTU 52.2",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Prestations de carrelage",
      itemListElement: services.map((s) => ({
        "@type": "Offer" as const,
        itemOffered: { "@type": "Service" as const, name: s.name, url: abs(`/prestations/${s.slug}/`) },
      })),
    },
    sameAs: [...business.sameAs],
  };
}

export function siteGraph(business: Business, services: Service[], zones: Zone[]): Graph {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": ids.website,
        url: abs("/"),
        name: business.name,
        inLanguage: "fr-FR",
        publisher: { "@id": ids.business },
      },
      businessNode(business, services, zones),
      {
        "@type": "Person",
        "@id": ids.founder,
        name: business.founder.name,
        jobTitle: "Artisan carreleur, gérant",
        worksFor: { "@id": ids.business },
      },
    ],
  } as Graph;
}

export function breadcrumbLd(items: { name: string; path: string }[]): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function faqLd(faq: Faq[]): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function JsonLd({ data }: { data: WithContext<Thing> | Graph | object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
