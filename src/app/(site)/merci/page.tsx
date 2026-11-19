import type { Metadata } from "next";
import { Button, Container } from "@/components/ui";
import { tel } from "@/content/business";
import { getSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Demande envoyée",
  robots: { index: false, follow: false },
};

export default async function Merci() {
  const business = await getSettings();
  return (
    <Container className="pt-16 pb-8">
      <h1 className="t-camion text-[clamp(2.3rem,0.7rem+5.6vw,5.4rem)]">
        <span className="block">C&apos;est noté,</span>
        <span className="block">merci</span>
      </h1>
      <p className="mt-8 max-w-[36rem] text-[1.1875rem]">
        {business.founder.name} vous rappelle sous 48 h ouvrées pour fixer la visite. Si c&apos;est urgent, appelez le{" "}
        <a href={tel(business)} className="tnum font-[700] underline decoration-2 underline-offset-4">
          {business.phone.display}
        </a>
        .
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button href="/realisations/">Voir des chantiers</Button>
        <Button href="/conseils/" variant="trait">
          Lire les prix et conseils
        </Button>
      </div>
    </Container>
  );
}
