"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

const ctaBtnSm =
  "inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[2px] border-2 border-transparent bg-rouge px-4 text-[0.95rem] font-[680] whitespace-nowrap text-white transition-colors duration-150 hover:bg-rouge-fonce active:bg-rouge-nuit";
const ctaBtnMd =
  "inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[2px] border-2 border-transparent bg-rouge px-[22px] text-base font-[680] whitespace-nowrap text-white transition-colors duration-150 hover:bg-rouge-fonce active:bg-rouge-nuit";

export type NavService = {
  slug: string;
  short: string;
  name: string;
  format: string;
  priceMain: string;
};

export type NavZone = {
  slug: string;
  label: string;
  communes: string;
  travel: string;
};

export type NavGuide = {
  slug: string;
  title: string;
  category: string;
  readingMinutes: number;
};

export type NavBusiness = {
  phoneDisplay: string;
  telHref: string;
  founderName: string;
  addressShort: string;
  reviewLabel: string;
  foundingYear: number;
};

type MenuKey = "prestations" | "zones" | "conseils" | "entreprise" | null;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`size-3.5 shrink-0 transition-transform duration-150 ${open ? "rotate-180 text-rouge" : "text-gris"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <path d="M3.5 6 8 10.5 12.5 6" />
    </svg>
  );
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`size-3.5 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function HeaderNav({
  services,
  zones,
  guides,
  business,
}: {
  services: NavService[];
  zones: NavZone[];
  guides: NavGuide[];
  business: NavBusiness;
}) {
  const pathname = usePathname() ?? "/";
  const [menuState, setMenuState] = useState<{ key: MenuKey; path: string }>({ key: null, path: pathname });
  const [mobileState, setMobileState] = useState<{ open: boolean; section: "prestations" | "zones" | null; path: string }>({
    open: false,
    section: null,
    path: pathname,
  });
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileDrawerId = useId();

  // Les menus se ferment automatiquement dès que l'URL change (sans effet ni re-rendu en cascade)
  const openMenu: MenuKey = menuState.path === pathname ? menuState.key : null;
  const mobileOpen = mobileState.path === pathname && mobileState.open;
  const mobileSection = mobileState.path === pathname ? mobileState.section : null;

  const setOpenMenu = (key: MenuKey) => setMenuState({ key, path: pathname });
  const setMobileOpen = (open: boolean) => setMobileState((s) => ({ open, section: open ? s.section : null, path: pathname }));
  const toggleMobileSection = (sec: "prestations" | "zones") =>
    setMobileState((s) => ({ open: true, section: s.path === pathname && s.section === sec ? null : sec, path: pathname }));

  // Ferme au clic extérieur et à la touche Échap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuState({ key: null, path: "" });
        setMobileState({ open: false, section: null, path: "" });
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuState({ key: null, path: "" });
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  // Ombre légère sur le header sticky dès qu'on scrolle
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Bloque le scroll arrière-plan quand le menu mobile est ouvert
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setMenuState({ key: null, path: "" }), 160);
  };

  const enterMenu = (key: Exclude<MenuKey, null>) => {
    cancelClose();
    setOpenMenu(key);
  };

  const toggleMenu = (key: Exclude<MenuKey, null>) => {
    cancelClose();
    setOpenMenu(openMenu === key ? null : key);
  };

  const isActive = (prefix: string) => pathname === prefix || pathname.startsWith(prefix);
  const isEntrepriseActive = isActive("/entreprise/") || isActive("/avis/") || isActive("/faq/");

  const triggerClass = (active: boolean, open: boolean) =>
    `inline-flex cursor-pointer items-center gap-1.5 border-b-2 py-2 text-[0.96rem] font-[560] whitespace-nowrap transition-colors duration-150 ${
      active || open ? "border-rouge text-anthracite" : "border-transparent text-anthracite hover:border-anthracite"
    }`;

  const panelWrap = (open: boolean, centeredOnHeader = true) =>
    `absolute top-full z-50 pt-2 transition-[opacity,transform,visibility] duration-150 ${
      centeredOnHeader ? "left-1/2 -translate-x-1/2" : "right-0"
    } ${open ? "visible translate-y-0 opacity-100 pointer-events-auto" : "invisible -translate-y-1 opacity-0 pointer-events-none"}`;

  return (
    <div ref={navRef} className="contents">
      {/* Indicateur discret de scroll sur le header parent via bordure fixe en bas du sticky header */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-[75px] z-40 h-px transition-opacity duration-200 ${
          scrolled ? "bg-joint opacity-100 shadow-[0_1px_8px_rgba(31,33,36,0.06)]" : "opacity-0"
        }`}
      />

      {/* NAVIGATION DESKTOP */}
      <nav aria-label="Navigation principale" className="hidden lg:block">
        <ul className="flex items-center gap-4 xl:gap-6">
          {/* 1. PRESTATIONS */}
          <li onMouseEnter={() => enterMenu("prestations")} onMouseLeave={scheduleClose}>
            <button
              type="button"
              aria-expanded={openMenu === "prestations"}
              aria-haspopup="true"
              onClick={() => toggleMenu("prestations")}
              className={triggerClass(isActive("/prestations/"), openMenu === "prestations")}
            >
              Prestations
              <Chevron open={openMenu === "prestations"} />
            </button>

            <div
              className={`${panelWrap(openMenu === "prestations")} w-[min(calc(100vw-32px),58rem)]`}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="border-2 border-joint bg-alu shadow-[0_20px_48px_rgba(31,33,36,0.16)]">
                <div className="flex items-center justify-between gap-4 border-b-2 border-joint bg-alu px-5 py-3">
                  <span className="t-etiquette text-gris">Nos {services.length} prestations — pose seule TTC 2026</span>
                  <Link
                    href="/prestations/"
                    onClick={() => setOpenMenu(null)}
                    className="group inline-flex items-center gap-1.5 text-[0.9rem] font-[680] text-anthracite underline decoration-2 underline-offset-4 hover:text-rouge-fonce"
                  >
                    Toutes les prestations
                    <Arrow />
                  </Link>
                </div>

                <ul className="pose !border-0">
                  {services.map((s, i) => (
                    <li key={s.slug} className="col-span-4 flex">
                      <Link
                        href={`/prestations/${s.slug}/`}
                        onClick={() => setOpenMenu(null)}
                        className={`group cabochon flex flex-1 flex-col justify-between gap-2 px-4 py-3.5 transition-colors duration-150 ${
                          i === 0 ? "bg-blanc hover:bg-white" : "bg-blanc hover:bg-white"
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[0.96rem] leading-snug font-[680] text-anthracite decoration-2 underline-offset-4 group-hover:underline">
                            {s.short}
                          </span>
                          <span className="t-format shrink-0 text-[1.45rem] text-gris transition-colors group-hover:text-rouge">
                            {s.format}
                          </span>
                        </div>
                        <span className="tnum text-[0.82rem] text-gris">{s.priceMain}</span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-center justify-between gap-4 bg-anthracite px-5 py-3.5 text-[0.9rem] text-[#e6e7e4]">
                  <span>
                    Un doute sur le support ou le format ?{" "}
                    <a href={business.telHref} data-track="call" className="tnum font-[700] text-white underline decoration-rouge decoration-2 underline-offset-4 hover:text-rouge-clair">
                      Appelez {business.founderName} ({business.phoneDisplay})
                    </a>
                  </span>
                  <Link
                    href="/devis/"
                    onClick={() => setOpenMenu(null)}
                    className="group inline-flex items-center gap-1.5 font-[700] text-white hover:text-rouge-clair"
                  >
                    Demander un devis
                    <Arrow />
                  </Link>
                </div>
              </div>
            </div>
          </li>

          {/* 2. RÉALISATIONS */}
          <li>
            <Link
              href="/realisations/"
              className={triggerClass(isActive("/realisations/"), false)}
            >
              Réalisations
            </Link>
          </li>

          {/* 3. ZONES */}
          <li onMouseEnter={() => enterMenu("zones")} onMouseLeave={scheduleClose}>
            <button
              type="button"
              aria-expanded={openMenu === "zones"}
              aria-haspopup="true"
              onClick={() => toggleMenu("zones")}
              className={triggerClass(isActive("/zones-intervention/"), openMenu === "zones")}
            >
              Zones
              <Chevron open={openMenu === "zones"} />
            </button>

            <div
              className={`${panelWrap(openMenu === "zones")} w-[min(calc(100vw-32px),46rem)]`}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="border-2 border-joint bg-alu shadow-[0_20px_48px_rgba(31,33,36,0.16)]">
                <div className="flex items-center justify-between gap-4 border-b-2 border-joint px-5 py-3">
                  <span className="t-etiquette text-gris">Rayon 30 km autour du dépôt de Pringy</span>
                  <Link
                    href="/zones-intervention/"
                    onClick={() => setOpenMenu(null)}
                    className="group inline-flex items-center gap-1.5 text-[0.9rem] font-[680] text-anthracite underline decoration-2 underline-offset-4 hover:text-rouge-fonce"
                  >
                    Carte des secteurs
                    <Arrow />
                  </Link>
                </div>
                <ul className="pose !border-0">
                  {zones.map((z) => (
                    <li key={z.slug} className="col-span-6 flex">
                      <Link
                        href={`/zones-intervention/${z.slug}/`}
                        onClick={() => setOpenMenu(null)}
                        className="group cabochon flex flex-1 flex-col justify-between gap-1.5 bg-blanc px-4 py-3.5 hover:bg-white"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-[680] text-anthracite decoration-2 underline-offset-4 group-hover:underline">{z.label}</span>
                          <span className="shrink-0 text-[0.8rem] font-[600] text-rouge-fonce">{z.travel}</span>
                        </div>
                        <span className="line-clamp-1 text-[0.82rem] text-gris">{z.communes}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>

          {/* 4. PRIX ET CONSEILS */}
          <li onMouseEnter={() => enterMenu("conseils")} onMouseLeave={scheduleClose}>
            <button
              type="button"
              aria-expanded={openMenu === "conseils"}
              aria-haspopup="true"
              onClick={() => toggleMenu("conseils")}
              className={triggerClass(isActive("/conseils/"), openMenu === "conseils")}
            >
              Prix et conseils
              <Chevron open={openMenu === "conseils"} />
            </button>

            <div
              className={`${panelWrap(openMenu === "conseils")} w-[min(calc(100vw-32px),44rem)]`}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="border-2 border-joint bg-alu shadow-[0_20px_48px_rgba(31,33,36,0.16)]">
                <div className="flex items-center justify-between gap-4 border-b-2 border-joint px-5 py-3">
                  <span className="t-etiquette text-gris">Le carnet du carreleur</span>
                  <Link
                    href="/conseils/"
                    onClick={() => setOpenMenu(null)}
                    className="group inline-flex items-center gap-1.5 text-[0.9rem] font-[680] text-anthracite underline decoration-2 underline-offset-4 hover:text-rouge-fonce"
                  >
                    Tous les articles
                    <Arrow />
                  </Link>
                </div>
                <div className="pose !border-0">
                  <ul className="col-span-7 divide-y-2 divide-alu-2 bg-blanc">
                    {guides.map((g) => (
                      <li key={g.slug}>
                        <Link
                          href={`/conseils/${g.slug}/`}
                          onClick={() => setOpenMenu(null)}
                          className="group block px-4 py-3 hover:bg-white"
                        >
                          <span className="t-etiquette block text-[0.78rem] text-rouge-fonce">{g.category}</span>
                          <span className="mt-0.5 block text-[0.94rem] leading-snug font-[660] text-anthracite decoration-2 underline-offset-4 group-hover:underline">
                            {g.title}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="col-span-5 flex flex-col justify-between gap-4 bg-blanc p-4">
                    <div>
                      <p className="t-etiquette text-gris">Accès rapide</p>
                      <ul className="mt-2.5 divide-y-2 divide-alu-2 border-y-2 border-alu-2 text-[0.92rem]">
                        <li>
                          <Link href="/conseils/#prix" onClick={() => setOpenMenu(null)} className="block py-2 font-[620] hover:text-rouge-fonce">
                            Repères de prix 2026
                          </Link>
                        </li>
                        <li>
                          <Link href="/faq/" onClick={() => setOpenMenu(null)} className="block py-2 font-[620] hover:text-rouge-fonce">
                            Questions fréquentes (FAQ)
                          </Link>
                        </li>
                        <li>
                          <Link href="/devis/" onClick={() => setOpenMenu(null)} className="block py-2 font-[620] hover:text-rouge-fonce">
                            Estimer mon chantier
                          </Link>
                        </li>
                      </ul>
                    </div>
                    <p className="text-[0.82rem] leading-snug text-gris">Visite et devis gratuits sur tout le bassin annécien.</p>
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* 5. L'ENTREPRISE */}
          <li className="relative" onMouseEnter={() => enterMenu("entreprise")} onMouseLeave={scheduleClose}>
            <button
              type="button"
              aria-expanded={openMenu === "entreprise"}
              aria-haspopup="true"
              onClick={() => toggleMenu("entreprise")}
              className={triggerClass(isEntrepriseActive, openMenu === "entreprise")}
            >
              L&apos;entreprise
              <Chevron open={openMenu === "entreprise"} />
            </button>

            <div
              className={`${panelWrap(openMenu === "entreprise", false)} w-[min(calc(100vw-32px),32rem)]`}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="border-2 border-joint bg-alu shadow-[0_20px_48px_rgba(31,33,36,0.16)]">
                <ul className="pose !border-0">
                  <li className="col-span-6 flex">
                    <Link
                      href="/entreprise/"
                      onClick={() => setOpenMenu(null)}
                      className="group cabochon flex flex-1 flex-col gap-1 bg-blanc px-4 py-4 hover:bg-white"
                    >
                      <span className="font-[700] decoration-2 underline-offset-4 group-hover:underline">Histoire & savoir-faire</span>
                      <span className="text-[0.84rem] text-gris">Carreleur à Annecy depuis {business.foundingYear}</span>
                    </Link>
                  </li>
                  <li className="col-span-6 flex">
                    <Link
                      href="/avis/"
                      onClick={() => setOpenMenu(null)}
                      className="group cabochon flex flex-1 flex-col gap-1 bg-blanc px-4 py-4 hover:bg-white"
                    >
                      <span className="font-[700] decoration-2 underline-offset-4 group-hover:underline">Avis clients</span>
                      <span className="text-[0.84rem] text-rouge-fonce font-[620]">★★★★★ · {business.reviewLabel}</span>
                    </Link>
                  </li>
                  <li className="col-span-6 flex">
                    <Link
                      href="/entreprise/#assurances"
                      onClick={() => setOpenMenu(null)}
                      className="group cabochon flex flex-1 flex-col gap-1 bg-blanc px-4 py-4 hover:bg-white"
                    >
                      <span className="font-[700] decoration-2 underline-offset-4 group-hover:underline">Assurances & DTU</span>
                      <span className="text-[0.84rem] text-gris">Garantie décennale jointe au devis</span>
                    </Link>
                  </li>
                  <li className="col-span-6 flex">
                    <Link
                      href="/faq/"
                      onClick={() => setOpenMenu(null)}
                      className="group cabochon flex flex-1 flex-col gap-1 bg-blanc px-4 py-4 hover:bg-white"
                    >
                      <span className="font-[700] decoration-2 underline-offset-4 group-hover:underline">Questions fréquentes</span>
                      <span className="text-[0.84rem] text-gris">Devis, délais, préparation, joints</span>
                    </Link>
                  </li>
                </ul>
                <div className="border-t-2 border-joint bg-alu px-4 py-2.5 text-[0.82rem] text-gris">
                  Dépôt : <strong className="font-[650] text-anthracite">{business.addressShort}</strong>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>

      {/* ACTIONS DROITE + BOUTON MOBILE */}
      <div className="flex items-center gap-4 xl:gap-5">
        <a
          href={business.telHref}
          data-track="call"
          className="tnum hidden items-center gap-2 font-[720] whitespace-nowrap hover:text-rouge-fonce md:inline-flex lg:hidden xl:inline-flex"
        >
          <svg viewBox="0 0 24 24" className="size-4 text-rouge" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" />
          </svg>
          {business.phoneDisplay}
        </a>

        <span className="hidden md:block">
          <Link href="/devis/" className={ctaBtnSm}>
            Devis gratuit
          </Link>
        </span>

        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls={mobileDrawerId}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`grid size-12 cursor-pointer place-items-center rounded-[2px] border-2 transition-colors lg:hidden ${
            mobileOpen ? "border-anthracite bg-anthracite text-white" : "border-anthracite bg-transparent text-anthracite hover:bg-anthracite hover:text-white"
          }`}
        >
          {mobileOpen ? (
            <svg viewBox="0 0 24 24" className="size-[22px]" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-[22px]" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          )}
        </button>
      </div>

      {/* TIROIR MOBILE / TABLETTE */}
      <div
        id={mobileDrawerId}
        hidden={!mobileOpen}
        className="fixed inset-x-0 top-[76px] bottom-0 z-50 overflow-y-auto border-t-2 border-joint bg-alu px-[clamp(16px,4vw,56px)] pt-3 pb-32 lg:hidden"
      >
        <ul className="divide-y-2 divide-alu-2 border-b-2 border-alu-2">
          {/* Accordéon Prestations */}
          <li>
            <button
              type="button"
              aria-expanded={mobileSection === "prestations"}
              onClick={() => toggleMobileSection("prestations")}
              className="flex w-full cursor-pointer items-center justify-between py-4 text-left"
            >
              <span className={`t-titre text-[1.6rem] ${isActive("/prestations/") ? "text-rouge" : ""}`}>Prestations</span>
              <Chevron open={mobileSection === "prestations"} />
            </button>
            {mobileSection === "prestations" && (
              <div className="pb-5">
                <ul className="pose">
                  {services.map((s) => (
                    <li key={s.slug} className="col-span-6 flex">
                      <Link
                        href={`/prestations/${s.slug}/`}
                        onClick={() => setMobileOpen(false)}
                        className="flex flex-1 flex-col justify-between gap-1 bg-blanc px-3 py-3 text-[0.92rem]"
                      >
                        <span className="font-[680] leading-tight">{s.short}</span>
                        <span className="t-format text-[1.25rem] text-gris">{s.format}</span>
                      </Link>
                    </li>
                  ))}
                  <li className="col-span-12 flex">
                    <Link
                      href="/prestations/"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 bg-anthracite px-3 py-3 text-center text-[0.92rem] font-[680] text-white"
                    >
                      Voir les {services.length} prestations
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </li>

          <li>
            <Link
              href="/realisations/"
              onClick={() => setMobileOpen(false)}
              className={`t-titre block py-4 text-[1.6rem] ${isActive("/realisations/") ? "text-rouge" : ""}`}
            >
              Réalisations
            </Link>
          </li>

          {/* Accordéon Zones */}
          <li>
            <button
              type="button"
              aria-expanded={mobileSection === "zones"}
              onClick={() => toggleMobileSection("zones")}
              className="flex w-full cursor-pointer items-center justify-between py-4 text-left"
            >
              <span className={`t-titre text-[1.6rem] ${isActive("/zones-intervention/") ? "text-rouge" : ""}`}>Zones d&apos;intervention</span>
              <Chevron open={mobileSection === "zones"} />
            </button>
            {mobileSection === "zones" && (
              <div className="pb-5">
                <ul className="pose">
                  {zones.map((z) => (
                    <li key={z.slug} className="col-span-6 flex">
                      <Link
                        href={`/zones-intervention/${z.slug}/`}
                        onClick={() => setMobileOpen(false)}
                        className="flex flex-1 flex-col justify-between gap-1 bg-blanc px-3 py-3 text-[0.9rem]"
                      >
                        <span className="font-[680] leading-tight">{z.label}</span>
                        <span className="text-[0.78rem] text-rouge-fonce">{z.travel}</span>
                      </Link>
                    </li>
                  ))}
                  <li className="col-span-12 flex">
                    <Link
                      href="/zones-intervention/"
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 bg-anthracite px-3 py-3 text-center text-[0.92rem] font-[680] text-white"
                    >
                      Voir la carte des secteurs
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </li>

          <li>
            <Link
              href="/conseils/"
              onClick={() => setMobileOpen(false)}
              className={`t-titre block py-4 text-[1.6rem] ${isActive("/conseils/") ? "text-rouge" : ""}`}
            >
              Prix et conseils
            </Link>
          </li>
          <li>
            <Link
              href="/entreprise/"
              onClick={() => setMobileOpen(false)}
              className={`t-titre block py-4 text-[1.6rem] ${isActive("/entreprise/") ? "text-rouge" : ""}`}
            >
              L&apos;entreprise
            </Link>
          </li>
          <li>
            <Link
              href="/avis/"
              onClick={() => setMobileOpen(false)}
              className={`flex items-baseline justify-between py-4 ${isActive("/avis/") ? "text-rouge" : ""}`}
            >
              <span className="t-titre text-[1.6rem]">Avis clients</span>
              <span className="text-[0.88rem] font-[650] text-rouge">★★★★★ 5/5</span>
            </Link>
          </li>
          <li>
            <Link
              href="/faq/"
              onClick={() => setMobileOpen(false)}
              className={`t-titre block py-4 text-[1.6rem] ${isActive("/faq/") ? "text-rouge" : ""}`}
            >
              Questions fréquentes
            </Link>
          </li>
        </ul>

        <div className="mt-6 grid gap-3 bg-blanc p-5">
          <p className="text-[0.9rem] text-gris">
            <strong className="font-[680] text-anthracite">Dépôt Carreal</strong> · {business.addressShort}
          </p>
          <a href={business.telHref} data-track="call" className="tnum text-[1.45rem] font-[760] text-anthracite">
            {business.phoneDisplay}
          </a>
          <Link href="/devis/" onClick={() => setMobileOpen(false)} className={`${ctaBtnMd} w-full`}>
            Demander un devis gratuit
          </Link>
        </div>
      </div>
    </div>
  );
}
