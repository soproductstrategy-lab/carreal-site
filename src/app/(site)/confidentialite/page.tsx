import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
import { getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Politique de confidentialité | Carreal",
  description: "Comment Carreal traite les données transmises via le formulaire de devis : finalités, durée de conservation, droits.",
  path: "/confidentialite/",
});

export default async function Confidentialite() {
  const business = await getSettings();
  return (
    <>
      <PageHero crumbs={[{ name: "Confidentialité", path: "/confidentialite/" }]} title="Politique de confidentialité" />
      <Container className="mt-12">
        <div className="prose-carreal">
          <h2>Responsable du traitement</h2>
          <p>
            {business.legalName}, {business.address.street}, {business.address.postalCode} {business.address.city}. Contact : {business.email}.
          </p>
          <h2>Données collectées et finalités</h2>
          <ul>
            <li>
              <strong>Demande de devis</strong> : nom, téléphone, e-mail (facultatif), commune et description du projet, pour vous recontacter et
              établir un devis. Base légale : mesures précontractuelles.
            </li>
            <li>
              <strong>Mesure d&apos;audience</strong> : statistiques anonymes de fréquentation, sans cookie ni suivi d&apos;un site à l&apos;autre
              (outil exempté de consentement selon les recommandations de la CNIL).
            </li>
          </ul>
          <h2>Durée de conservation</h2>
          <p>Les demandes de devis sont conservées 3 ans après le dernier contact, puis supprimées.</p>
          <h2>Destinataires</h2>
          <p>
            Vos données ne sont ni vendues ni cédées. Elles sont transmises uniquement à nos prestataires techniques (hébergement du site, envoi
            d&apos;e-mails), dans le cadre de garanties conformes au RGPD.
          </p>
          <h2>Vos droits</h2>
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, d&apos;opposition et de limitation. Écrivez à{" "}
            {business.email}. Vous pouvez aussi saisir la CNIL (cnil.fr).
          </p>
          <h2>Cookies</h2>
          <p>
            Ce site n&apos;utilise aucun cookie publicitaire ni traceur soumis à consentement. Les polices sont hébergées sur notre serveur, et
            aucune carte ni vidéo tierce n&apos;est chargée sans action de votre part.
          </p>
        </div>
      </Container>
    </>
  );
}
