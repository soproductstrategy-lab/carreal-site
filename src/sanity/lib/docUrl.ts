/** Mappe n'importe quel document Sanity vers son chemin public sur le site Carreal. */
export function resolveDocPath(type: string, slug?: string | null): string {
  switch (type) {
    case "homePage":
      return "/";
    case "aboutPage":
      return "/entreprise/";
    case "realisation":
      return slug ? `/realisations/${slug}/` : "/realisations/";
    case "service":
      return slug ? `/prestations/${slug}/` : "/prestations/";
    case "zone":
      return slug ? `/zones-intervention/${slug}/` : "/zones-intervention/";
    case "guide":
      return slug ? `/conseils/${slug}/` : "/conseils/";
    case "review":
      return "/avis/";
    case "faqGroup":
      return "/faq/";
    case "settings":
    case "pageTexts":
    default:
      return "/";
  }
}
