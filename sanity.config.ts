"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { CarrealStudioIcon, StudioDashboardTool } from "./src/sanity/components/StudioDashboardTool";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { resolve } from "./src/sanity/presentation/resolve";
import { schemaTypes, singletonTypes } from "./src/sanity/schemaTypes";
import { defaultDocumentNode, structure } from "./src/sanity/structure";

export default defineConfig({
  name: "carreal",
  title: "Carreal · Espace client",
  icon: CarrealStudioIcon,
  basePath: "/studio",
  projectId: projectId || "missing",
  dataset,
  schema: {
    types: schemaTypes,
    // Les pages uniques (accueil, entreprise…) ne peuvent pas être créées en double.
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  tools: (prev) => [
    {
      name: "accueil",
      title: "Accueil",
      component: StudioDashboardTool,
    },
    ...prev,
  ],
  plugins: [
    structureTool({ structure, defaultDocumentNode, title: "Contenu" }),
    presentationTool({
      title: "Visuel",
      resolve,
      previewUrl: {
        initial: "/",
      },
    }),
    ...(process.env.NODE_ENV === "development" ? [visionTool({ defaultApiVersion: apiVersion, title: "Requêtes (dev)" })] : []),
  ],
  document: {
    // Pas de « dupliquer » ni « supprimer » sur les pages uniques.
    actions: (input, context) =>
      singletonTypes.has(context.schemaType) ? input.filter(({ action }) => action && ["publish", "discardChanges", "restore"].includes(action)) : input,
    // Raccourci « Nouveau » : uniquement ce que l'artisan crée réellement.
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global" ? prev.filter((t) => ["realisation", "guide", "review"].includes(t.templateId)) : prev,
  },
});
