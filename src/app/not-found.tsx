import { MobileBar } from "@/components/MobileBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="contenu">
        <Container className="pt-16 pb-8">
          <p className="t-format text-[clamp(4rem,3rem+5vw,8rem)]">404</p>
          <h1 className="t-titre mt-4 text-[clamp(2.2rem,1.2rem+3.4vw,4.2rem)]">Ce carreau n&apos;est pas à sa place</h1>
          <p className="mt-6 max-w-[36rem] text-[1.1875rem]">La page demandée n&apos;existe pas, ou elle a été déplacée.</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button href="/">Retour à l&apos;accueil</Button>
            <Button href="/devis/" variant="trait">
              Demander un devis
            </Button>
          </div>
        </Container>
      </main>
      <SiteFooter />
      <MobileBar />
    </>
  );
}
