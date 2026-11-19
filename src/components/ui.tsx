import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { tel, yearsSince } from "@/content/business";
import type { Img } from "@/content/types";
import { getReviews, getSettings } from "@/lib/content";
import { imgSrc, imgSrcSet } from "@/lib/img";
import { breadcrumbLd, JsonLd } from "@/lib/seo";
import { Inline } from "./RichText";

export function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`mx-auto w-full max-w-[1360px] px-[clamp(16px,4vw,56px)] ${className}`}>{children}</div>;
}

type BtnProps = ComponentProps<typeof Link> & { variant?: "rouge" | "trait" | "trait-clair"; size?: "md" | "sm" };

const btnBase =
  "inline-flex items-center justify-center gap-2.5 rounded-[2px] border-2 border-transparent font-[680] whitespace-nowrap transition-colors duration-150";
const btnVariants = {
  rouge: "bg-rouge text-white hover:bg-rouge-fonce active:bg-rouge-nuit",
  trait: "border-anthracite text-anthracite hover:bg-anthracite hover:text-blanc",
  "trait-clair": "border-[#e6e7e4] text-white hover:bg-white hover:text-anthracite",
};
const btnSizes = { md: "min-h-[52px] px-[22px] text-base", sm: "min-h-11 px-4 text-[0.95rem]" };

export const btnClass = (variant: keyof typeof btnVariants = "rouge", size: keyof typeof btnSizes = "md") =>
  `${btnBase} ${btnVariants[variant]} ${btnSizes[size]}`;

export function Button({ variant = "rouge", size = "md", className = "", ...props }: BtnProps) {
  return <Link {...props} className={`${btnClass(variant, size)} ${className}`} />;
}

/** Le téléphone n'est pas un bouton : c'est une personne. */
export async function AppelPatron({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  const business = await getSettings();
  return (
    <a href={tel(business)} data-track="call" className={`group grid gap-0.5 ${className}`}>
      <small className={`text-[0.9rem] font-[450] ${dark ? "text-gris-clair" : "text-gris"}`}>ou appelez {business.founder.name}</small>
      <strong className={`tnum text-[1.6rem] leading-[1.1] font-[760] ${dark ? "text-white group-hover:text-rouge-clair" : "group-hover:text-rouge-fonce"}`}>
        {business.phone.display}
      </strong>
    </a>
  );
}

export function Stars({ n = 5, className = "" }: { n?: number; className?: string }) {
  return (
    <span role="img" className={`inline-flex gap-[3px] text-rouge ${className}`} aria-label={`${n} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="size-[18px]" aria-hidden="true">
          <path fill={i < n ? "currentColor" : "none"} stroke="currentColor" d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L1.4 7.7l6-.7z" />
        </svg>
      ))}
    </span>
  );
}

/** Badge avis Google 5 étoiles placé dans le hero : preuve sociale locale immédiate, reliée aux avis. */
export async function GoogleHeroBadge({ className = "" }: { className?: string }) {
  const reviews = await getReviews();
  const avg = reviews.average > 0 ? reviews.average.toFixed(1).replace(".", ",") : "5,0";
  const count = reviews.count || 4;
  return (
    <Link
      href="/avis/"
      className={`group inline-flex flex-wrap items-center gap-x-3 gap-y-1.5 border-2 border-joint bg-blanc px-3.5 py-2 transition-colors duration-150 hover:border-anthracite hover:bg-white ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-[18px] shrink-0" aria-hidden="true">
        <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82Z" />
        <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24Z" />
        <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09Z" />
        <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z" />
      </svg>
      <span className="inline-flex gap-0.5 text-[#f59e0b]" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} viewBox="0 0 20 20" className="size-4 fill-current">
            <path d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L1.4 7.7l6-.7z" />
          </svg>
        ))}
      </span>
      <span className="tnum text-[0.92rem] font-[740] text-anthracite">{avg} / 5</span>
      <span className="text-[0.88rem] text-gris">
        Avis Google ({count})
      </span>
      <span aria-hidden="true" className="text-[0.85rem] font-[700] text-gris transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-rouge">
        →
      </span>
    </Link>
  );
}

const nombres = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"];
export const enLettres = (n: number) => (n <= 10 ? nombres[n] : String(n));
export const majuscule = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Preuves en une phrase honnête (pas de « 5,0/5 » en gros chiffre avec quatre avis). */
export async function Preuves({ className = "" }: { className?: string }) {
  const [business, reviews] = await Promise.all([getSettings(), getReviews()]);
  const tous5 = reviews.list.length > 0 && reviews.list.every((r) => r.rating === 5);
  return (
    <p className={`max-w-[34rem] text-[0.975rem] text-gris ${className}`}>
      <strong className="font-[650] text-anthracite">{yearsSince(business.foundingYear)} ans de chantiers.</strong>{" "}
      {majuscule(enLettres(reviews.count))} avis Google{tous5 ? ", tous à 5 sur 5" : ""}. Assurée en décennale.
    </p>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Accueil", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Fil d'Ariane" className="text-[0.875rem] text-gris">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((it, i) => (
            <li key={it.path} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {i < all.length - 1 ? (
                <Link href={it.path} className="hover:text-anthracite hover:underline hover:decoration-2 hover:underline-offset-4">
                  {it.name}
                </Link>
              ) : (
                <span aria-current="page" className="font-semibold text-anthracite">
                  {it.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(all)} />
    </>
  );
}

/** Lien « tout voir » : souligné, sans flèche. */
export function ToutVoir({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={`font-[650] whitespace-nowrap underline decoration-2 underline-offset-[5px] hover:text-rouge-fonce ${className}`}>
      {children}
    </Link>
  );
}

export function SectionHead({
  title,
  intro,
  link,
  className = "",
  id,
}: {
  title: ReactNode;
  intro?: ReactNode;
  link?: { href: string; label: string };
  className?: string;
  id?: string;
}) {
  return (
    <div className={`grid items-end gap-x-10 gap-y-4 md:grid-cols-[minmax(0,1fr)_auto] ${className}`}>
      <h2 id={id} className="t-titre max-w-[18ch] text-[clamp(1.9rem,1.1rem+2.4vw,3.15rem)]">
        {title}
      </h2>
      {link && (
        <ToutVoir href={link.href} className="justify-self-start md:col-start-2 md:row-span-2 md:row-start-1 md:self-end">
          {link.label}
        </ToutVoir>
      )}
      {intro && <p className="max-w-[40rem] text-gris md:col-start-1">{typeof intro === "string" ? <Inline text={intro} /> : intro}</p>}
    </div>
  );
}

export function Section({ children, className = "", id, labelledBy }: { children: ReactNode; className?: string; id?: string; labelledBy?: string }) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`pt-[clamp(64px,9vw,128px)] ${className}`}>
      {children}
    </section>
  );
}

/** Photo dans un « carreau » : fond blanc, 8 px de marge, légende dans le cadre. */
export function Carreau({
  img,
  caption,
  badge,
  className = "",
  sizes = "(min-width: 1024px) 40vw, 90vw",
  eager = false,
  ratio = "aspect-[4/3]",
}: {
  img: Img;
  caption?: string;
  badge?: string;
  className?: string;
  sizes?: string;
  eager?: boolean;
  ratio?: string;
}) {
  return (
    <figure className={`bg-blanc px-2 pt-2 ${caption ? "" : "pb-2"} ${className}`}>
      <div className="relative overflow-hidden bg-alu-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc(img.src, 1200)}
          srcSet={imgSrcSet(img.src)}
          sizes={sizes}
          alt={img.alt}
          width={img.width}
          height={img.height}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          className={`${ratio} h-auto w-full object-cover`}
        />
        {badge && (
          <span className="t-etiquette absolute top-2.5 left-2.5 bg-anthracite/90 px-2.5 py-1 text-[0.78rem] tracking-[0.04em] text-white uppercase backdrop-blur-[2px]">
            {badge}
          </span>
        )}
      </div>
      {caption && (
        <figcaption className="px-0.5 pt-2.5 pb-3 text-[0.85rem] leading-[1.35] text-gris [&_strong]:font-[650] [&_strong]:text-anthracite">
          <Inline text={caption} />
        </figcaption>
      )}
    </figure>
  );
}
