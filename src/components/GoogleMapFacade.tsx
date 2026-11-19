"use client";

import { useState } from "react";
import type { Business } from "@/content/business";

/**
 * Google Maps en « façade » : l'iframe Google (qui dépose des cookies) n'est chargée qu'après un clic.
 * Avant : aucun appel à Google → pas de bannière de consentement, page plus rapide.
 * La requête cible la fiche Google Business Profile de Carreal (nom + adresse).
 */
export function GoogleMapFacade({ business, className = "" }: { business: Pick<Business, "name" | "address" | "googleMapsUrl">; className?: string }) {
  const [open, setOpen] = useState(false);
  const q = `${business.name}, ${business.address.street}, ${business.address.postalCode} ${business.address.locality}`;
  const src = `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=14&hl=fr&output=embed`;

  return (
    <div className={`relative aspect-[4/3] overflow-hidden bg-blanc sm:aspect-[16/9] ${className}`}>
      {open ? (
        <iframe
          src={src}
          title="Carreal sur Google Maps"
          className="absolute inset-0 size-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <svg viewBox="0 0 1000 1000" className="size-12" aria-hidden="true">
            <circle cx="500" cy="500" r="500" fill="var(--rouge)" />
            <path d="M752.8 287.9A330 330 0 1 0 752.8 712.1L645.5 622.1A190 190 0 1 1 645.5 377.9Z" fill="#fff" />
          </svg>
          <p className="font-semibold">
            {business.name}, {business.address.street}, {business.address.locality}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex min-h-[52px] items-center justify-center rounded-[2px] border-2 border-anthracite bg-anthracite px-[22px] font-[680] text-white hover:bg-black"
            >
              Afficher la carte Google
            </button>
            <a
              href={business.googleMapsUrl}
              rel="noopener"
              target="_blank"
              className="inline-flex min-h-[52px] items-center justify-center rounded-[2px] border-2 border-anthracite px-[22px] font-[680] hover:bg-anthracite hover:text-blanc"
            >
              Itinéraire
            </a>
          </div>
          <p className="max-w-sm text-[0.8rem] text-gris">En affichant la carte, vous acceptez le chargement de contenus Google (cookies tiers).</p>
        </div>
      )}
    </div>
  );
}
