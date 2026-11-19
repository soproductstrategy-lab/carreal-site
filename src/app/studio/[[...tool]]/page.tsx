import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

// Studio Sanity embarqué : https://www.carreal.fr/studio (connexion Sanity obligatoire, page non indexée).
import type { Metadata } from "next";
import { metadata as studioMetadata } from "next-sanity/studio";

export { viewport } from "next-sanity/studio";
export const metadata: Metadata = { ...studioMetadata, title: { absolute: "Studio · Carreal" } };

export function generateStaticParams() {
  return [{ tool: [] as string[] }];
}

export default function StudioPage() {
  return <NextStudio config={config} />;
}
