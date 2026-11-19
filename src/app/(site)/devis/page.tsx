import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { AppelPatron, Container, Preuves } from "@/components/ui";
import { whatsapp } from "@/content/business";
import { getPageHeader, getServices, getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { QuoteForm } from "./QuoteForm";

export const metadata: Metadata = pageMetadata({
  title: "Devis carrelage gratuit à Annecy – Réponse sous 48 h | Carreal",
  description: "Décrivez votre projet de carrelage en une minute : Carreal vous rappelle sous 48 h ouvrées pour une visite et un devis gratuits dans le bassin annécien.",
  path: "/devis/",
});

export default async function Devis() {
  const [h, services, business] = await Promise.all([getPageHeader("devis"), getServices(), getSettings()]);
  return (
    <>
      <PageHero crumbs={[{ name: "Devis gratuit", path: "/devis/" }]} title={h.title} lead={h.lead} />
      <Container className="mt-12 grid items-start gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <QuoteForm prestations={services.map((s) => ({ value: s.slug, label: s.short }))} />
        <aside className="grid gap-8">
          <div>
            <h2 className="mb-2 font-[700]">Vous préférez parler ?</h2>
            <AppelPatron />
            <p className="mt-2 text-[0.95rem] text-gris">Lundi au vendredi de 7 h à 19 h, samedi de 9 h à 12 h 30.</p>
          </div>
          <div>
            <h2 className="mb-2 font-[700]">Des photos à montrer ?</h2>
            <p className="text-gris">Une photo de la pièce et du sol actuel nous aide à préparer la visite.</p>
            <a
              href={whatsapp(business, "Bonjour, voici des photos de mon projet de carrelage :")}
              data-track="whatsapp"
              rel="noopener"
              className="mt-4 inline-flex min-h-[52px] items-center rounded-[2px] border-2 border-anthracite px-[22px] font-[680] hover:bg-anthracite hover:text-blanc"
            >
              Envoyer sur WhatsApp
            </a>
          </div>
          <div>
            <h2 className="mb-2 font-[700]">Ensuite</h2>
            <ol className="grid gap-1.5 text-gris">
              <li>On vous rappelle sous 48 h ouvrées.</li>
              <li>Visite gratuite : mesures et contrôle du support.</li>
              <li>Devis détaillé, attestation décennale jointe.</li>
            </ol>
          </div>
          <Preuves />
        </aside>
      </Container>
    </>
  );
}
