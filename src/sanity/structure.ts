import type { DefaultDocumentNodeResolver, StructureBuilder, StructureResolver, ViewBuilder } from "sanity/structure";
import { AiAssistantView } from "./components/AiAssistantView";
import { SitePreviewPane } from "./components/SitePreviewPane";

const AI_ENABLED_TYPES = new Set(["realisation", "guide", "service", "zone", "homePage", "aboutPage"]);

function viewsFor(S: StructureBuilder, schemaType: string): ViewBuilder[] {
  const views: ViewBuilder[] = [S.view.form().id("editor").title("Éditer")];
  if (AI_ENABLED_TYPES.has(schemaType)) {
    views.push(S.view.component(AiAssistantView).id("ai-assistant").title("✨ Assistant IA"));
  }
  views.push(S.view.component(SitePreviewPane).id("site-preview").title("👁 Aperçu"));
  return views;
}

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) =>
  S.document().views(viewsFor(S, schemaType));

const singleton = (S: StructureBuilder, type: string, title: string) =>
  S.listItem()
    .id(type)
    .title(title)
    .child(S.document().schemaType(type).documentId(type).title(title).views(viewsFor(S, type)));

/** Studio pensé pour l'artisan : ce qu'il publie au quotidien en haut, les pages au milieu, les réglages en bas. */
export const structure: StructureResolver = (S) =>
  S.list()
    .id("siteCarreal")
    .title("Site Carreal")
    .items([
      S.listItem()
        .id("chantiers")
        .title("Chantiers (réalisations)")
        .schemaType("realisation")
        .child(
          S.documentTypeList("realisation")
            .id("realisation")
            .title("Chantiers")
            .defaultOrdering([{ field: "year", direction: "desc" }]),
        ),
      S.listItem()
        .id("conseils")
        .title("Prix & conseils")
        .schemaType("guide")
        .child(S.documentTypeList("guide").id("guide").title("Articles & conseils")),
      S.listItem()
        .id("avis")
        .title("Avis clients (slider)")
        .schemaType("review")
        .child(
          S.documentTypeList("review")
            .id("review")
            .title("Avis clients")
            .defaultOrdering([
              { field: "featured", direction: "desc" },
              { field: "order", direction: "asc" },
              { field: "date", direction: "desc" },
            ]),
        ),
      S.divider(),
      singleton(S, "homePage", "Page d'accueil"),
      singleton(S, "aboutPage", "Page « L'entreprise »"),
      singleton(S, "pageTexts", "Titres des autres pages"),
      S.listItem()
        .id("prestations")
        .title("Prestations")
        .schemaType("service")
        .child(S.documentTypeList("service").id("service").title("Prestations").defaultOrdering([{ field: "order", direction: "asc" }])),
      S.listItem()
        .id("zones")
        .title("Zones d'intervention")
        .schemaType("zone")
        .child(S.documentTypeList("zone").id("zone").title("Secteurs").defaultOrdering([{ field: "order", direction: "asc" }])),
      S.listItem()
        .id("faq")
        .title("Questions fréquentes")
        .schemaType("faqGroup")
        .child(S.documentTypeList("faqGroup").id("faqGroup").title("FAQ")),
      S.divider(),
      singleton(S, "settings", "Entreprise & coordonnées"),
    ]);
