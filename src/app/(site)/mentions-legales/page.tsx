import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
import { getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mentions légales | Carreal",
  description: "Mentions légales du site Carreal : éditeur, hébergeur, assurance décennale, médiateur de la consommation.",
  path: "/mentions-legales/",
});

export default async function MentionsLegales() {
  const business = await getSettings();
  const { legal, address } = business;
  return (
    <>
      <PageHero crumbs={[{ name: "Mentions légales", path: "/mentions-legales/" }]} title="Mentions légales" />
      <Container className="mt-12">
        <div className="prose-carreal">
          <h2>Éditeur du site</h2>
          <p>
            <strong>{business.legalName}</strong>, {legal.form} au capital de {legal.capital}
            <br />
            Siège : {address.street}, {address.locality}, {address.postalCode} {address.city}
            <br />
            SIREN {legal.siren}, SIRET {legal.siret}, {legal.rcs}
            <br />
            Inscription au Registre national des entreprises (RNE), NAF {legal.naf}
            <br />
            TVA intracommunautaire : {legal.vat}
            <br />
            Téléphone : {business.phone.display}, e-mail : {business.email}
            <br />
            Directeur de la publication : {legal.publicationDirector}
          </p>
          <h2>Assurance professionnelle</h2>
          <p>
            Assurance responsabilité civile décennale : {legal.insurance.insurer}, {legal.insurance.address}. Contrat n° {legal.insurance.policy}.
            Couverture géographique : {legal.insurance.coverage}.
          </p>
          <h2>Médiateur de la consommation</h2>
          <p>
            Conformément aux articles L.612-1 et suivants du Code de la consommation, le client consommateur peut recourir gratuitement au
            médiateur suivant : {legal.mediator.name}, {legal.mediator.address}
            {legal.mediator.url && ` (${legal.mediator.url})`}.
          </p>
          <h2>Hébergement</h2>
          <p>
            {legal.host.name}, {legal.host.address} ({legal.host.url}).
          </p>
          <h2>Propriété intellectuelle</h2>
          <p>Textes, photographies, plans de calepinage et logo sont la propriété de Carreal. Toute reproduction sans autorisation est interdite.</p>
          <h2>Avis clients</h2>
          <p>
            Les avis affichés proviennent de la fiche Google de Carreal. Ils sont reproduits sans modification ; Carreal ne les sélectionne pas
            et n&apos;offre aucune contrepartie pour leur publication. Les avis sont affichés avec la date de l&apos;expérience.
          </p>
        </div>
      </Container>
    </>
  );
}
