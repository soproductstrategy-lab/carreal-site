import Link from "next/link";
import { tel, whatsapp } from "@/content/business";
import { getSettings } from "@/lib/content";

/** Barre mobile : trois carreaux jointés. Appeler, envoyer des photos (WhatsApp), devis. */
export async function MobileBar() {
  const business = await getSettings();
  const tile = "flex min-h-14 items-center justify-center gap-2 text-[0.975rem] font-[680]";
  return (
    <nav aria-label="Contact rapide" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-[1fr_1fr_1.35fr] gap-1 bg-joint p-1 pb-[max(4px,env(safe-area-inset-bottom))] lg:hidden">
      <a href={tel(business)} data-track="call" className={`${tile} bg-blanc`}>
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" />
        </svg>
        Appeler
      </a>
      <a
        href={whatsapp(business, "Bonjour, voici des photos de mon projet de carrelage :")}
        data-track="whatsapp"
        rel="noopener"
        aria-label="Envoyer des photos sur WhatsApp"
        className={`${tile} bg-blanc`}
      >
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 7h3l2-3h6l2 3h3v12H4z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
        Photos
      </a>
      <Link href="/devis/" className={`${tile} bg-rouge text-white`}>
        Devis gratuit
      </Link>
    </nav>
  );
}
