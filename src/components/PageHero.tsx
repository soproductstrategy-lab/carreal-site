import type { ReactNode } from "react";
import { fr } from "@/lib/typo";
import { LogoMark } from "./Logo";
import { Breadcrumbs, Container } from "./ui";

/**
 * En-tête des pages intérieures : fil d'Ariane, H1 en largeur 112 % (pas de capitales sur les longs titres),
 * chapeau, frise fine. Le petit rond (40vw, coupé en haut à droite) est réservé aux pages prestation.
 */
export function PageHero({
  crumbs,
  title,
  lead,
  rond = false,
  aside,
  children,
}: {
  crumbs: { name: string; path: string }[];
  title: ReactNode;
  lead?: ReactNode;
  rond?: boolean;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      {rond && (
        <div className="pointer-events-none absolute -top-[14vw] -right-[12vw] hidden w-[40vw] max-w-[620px] lg:block" aria-hidden="true">
          <LogoMark outline className="h-auto w-full" />
        </div>
      )}
      <Container className="relative pt-6 pb-12 lg:pt-8 lg:pb-16">
        <Breadcrumbs items={crumbs} />
        <div className={`mt-10 grid gap-10 ${aside ? "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end" : ""}`}>
          <div className="max-w-[52rem]">
            <h1 className="t-titre text-[clamp(2.2rem,1.2rem+3.4vw,4.2rem)]">{typeof title === "string" ? fr(title) : title}</h1>
            {lead && <p className="mt-6 max-w-[40rem] text-[1.1875rem] leading-normal">{typeof lead === "string" ? fr(lead) : lead}</p>}
            {children}
          </div>
          {aside && <div className="relative z-[1]">{aside}</div>}
        </div>
      </Container>
      <div className="frise-fine" aria-hidden="true" />
    </section>
  );
}
