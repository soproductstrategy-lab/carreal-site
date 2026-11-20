import Link from "next/link";
import type { ReactNode } from "react";
import type { Faq, Guide, Realisation, Review, Service } from "@/content/types";
import { getReviews } from "@/lib/content";
import { imgSrc, imgSrcSet } from "@/lib/img";
import { faqLd, JsonLd } from "@/lib/seo";
import { fr } from "@/lib/typo";
import { Calepinage } from "./Calepinage";
import { ReviewSlider } from "./ReviewSlider";
import { Inline } from "./RichText";
import { enLettres, majuscule, Stars, ToutVoir } from "./ui";

/* ---------- Calepinage décalé : largeurs des carreaux pour que les joints ne s'alignent jamais ---------- */

const LG: Record<number, string> = {
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  12: "lg:col-span-12",
};
const ROWS = [[7, 5], [4, 8], [5, 4, 3], [6, 6], [3, 5, 4], [8, 4]];
const LAST: Record<number, number[]> = { 1: [12], 2: [5, 7], 3: [4, 5, 3] };

/** Pour n carreaux : mobile 12, tablette 6/6 puis 12, desktop en pavé décalé (joints jamais alignés). */
export function spans(n: number): string[] {
  const lg: number[] = [];
  let r = 0;
  while (lg.length < n) {
    const left = n - lg.length;
    const row = ROWS[r % ROWS.length];
    lg.push(...(left >= row.length && !(left - row.length === 1 && row.length === 3) ? row : LAST[Math.min(left, 3)] ?? row));
    r++;
  }
  return lg.slice(0, n).map((w, i) => {
    const md = i % 3 === 2 || (i === n - 1 && i % 3 === 0) ? "md:col-span-12" : "md:col-span-6";
    return `col-span-12 ${md} ${LG[w] ?? "lg:col-span-6"}`;
  });
}

export function Pose({ children, className = "", as: As = "ul" }: { children: ReactNode; className?: string; as?: "ul" | "div" | "ol" }) {
  return <As className={`pose ${className}`}>{children}</As>;
}

/* ---------- Prix ---------- */

export function splitPrix(s: string) {
  const m = s.match(/^(.*?)\s*\((.*)\)\s*$/);
  const main = (m ? m[1] : s).replace(/\s*–\s*/g, " à ").replace(/€\s*\/\s*m²/g, "€/m²");
  return { main: fr(main), scope: m ? m[2] : "" };
}

/* ---------- Prestations ---------- */

export function ServiceTile({ s, red = false, span = "" }: { s: Service; red?: boolean; span?: string }) {
  const prix = splitPrix(s.priceRange);
  return (
    <li className={`flex ${span}`}>
      <Link
        href={`/prestations/${s.slug}/`}
        className={`group cabochon relative grid flex-1 grid-rows-[auto_1fr_auto] gap-5 px-6 py-[22px] transition-colors duration-150 md:min-h-[276px] ${
          red ? "bg-rouge text-white after:!bg-anthracite hover:bg-rouge-fonce" : "bg-blanc hover:bg-white"
        }`}
      >
        {/* Motif architectural de calepinage en filigrane dans le coin supérieur droit */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <span
            className={`absolute -top-2 -right-2 h-[70%] w-[56%] transition-opacity duration-200 [mask-image:radial-gradient(ellipse_at_top_right,black_18%,transparent_78%)] ${
              red ? "opacity-45 group-hover:opacity-75" : "opacity-40 group-hover:opacity-70"
            }`}
          >
            <Calepinage pattern={s.pattern} tone={red ? "dark" : "light"} className="size-full" />
          </span>
        </span>

        <div className="relative z-[1] flex items-start justify-between gap-4">
          <h3 className="max-w-[22ch] text-[1.28rem] leading-[1.15] font-[740] tracking-[-0.01em] decoration-2 underline-offset-4 group-hover:underline">
            {s.name}
          </h3>
          <span
            aria-hidden="true"
            className={`grid size-8 shrink-0 place-items-center rounded-[2px] border-2 transition-colors duration-150 ${
              red
                ? "border-white/40 text-white group-hover:border-white group-hover:bg-white group-hover:text-rouge"
                : "border-alu-2 bg-blanc/80 text-gris group-hover:border-anthracite group-hover:bg-anthracite group-hover:text-white"
            }`}
          >
            <svg viewBox="0 0 16 16" className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" />
            </svg>
          </span>
        </div>

        <p className="relative z-[1] flex flex-wrap items-baseline gap-x-3 gap-y-1 self-center">
          <b className="t-format text-[clamp(3.3rem,2.2rem+2.9vw,5.2rem)]">{fr(s.format || s.short)}</b>
          {s.formatNote && <span className={`max-w-[26ch] text-[0.95rem] leading-snug ${red ? "text-white/95" : "text-gris"}`}>{fr(s.formatNote)}</span>}
        </p>

        <p className={`relative z-[1] flex items-baseline justify-between gap-3 border-t-2 pt-3.5 text-[0.95rem] ${red ? "border-white/35" : "border-alu-2"}`}>
          <b className="tnum font-[700] whitespace-nowrap">{prix.main}</b>
          {prix.scope && <span className={`text-right ${red ? "text-white/90" : "text-gris"}`}>{prix.scope}</span>}
        </p>
      </Link>
    </li>
  );
}

export function ServiceGrid({ services, redFirst = true, className = "" }: { services: Service[]; redFirst?: boolean; className?: string }) {
  const sp = spans(services.length);
  return (
    <Pose className={className}>
      {services.map((s, i) => (
        <ServiceTile key={s.slug} s={s} red={redFirst && i === 0} span={sp[i]} />
      ))}
    </Pose>
  );
}

/* ---------- Réalisations ---------- */

export function RealisationTile({ r, span = "" }: { r: Realisation; span?: string }) {
  const img = r.images[0];
  const detail = [r.layout, r.joint && `joint ${r.joint}`].filter(Boolean).join(", ");
  const meta = [r.surface, r.duration].filter(Boolean).join(" · ");
  return (
    <li className={`flex ${span}`}>
      <Link href={`/realisations/${r.slug}/`} className="group cabochon flex flex-1 flex-col bg-blanc transition-colors duration-150 hover:bg-white">
        <div className="relative aspect-[4/3] overflow-hidden bg-alu-2 lg:aspect-auto lg:h-[23rem]">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgSrc(img.src, 1200)}
              srcSet={imgSrcSet(img.src, [480, 800, 1200, 1600])}
              sizes="(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 100vw"
              alt={img.alt}
              width={img.width}
              height={img.height}
              loading="lazy"
              className="size-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <>
              <Calepinage pattern={r.pattern} className="absolute inset-0 size-full" />
              <span className="t-etiquette absolute right-3 bottom-3 bg-blanc px-2 py-1 text-gris">Schéma de pose (photo à venir)</span>
            </>
          )}
          {r.demo && <span className="t-etiquette absolute top-3 left-3 bg-anthracite/85 px-2.5 py-1 text-[0.8rem] text-white backdrop-blur-[2px]">Illustration</span>}
          {r.commune && (
            <span className="t-etiquette absolute right-3 bottom-3 bg-blanc/92 px-2.5 py-1 text-[0.82rem] text-anthracite backdrop-blur-[2px]">
              {r.commune}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 px-5 pt-4 pb-5">
          <div className="flex items-baseline justify-between gap-3">
            {r.format && <b className="t-format text-[2.25rem]">{fr(r.format.split(" · ")[0])}</b>}
            {meta && <span className="tnum shrink-0 text-[0.88rem] font-[600] text-gris">{fr(meta)}</span>}
          </div>
          <h3 className="text-[1.18rem] leading-snug font-[720] decoration-2 underline-offset-4 group-hover:underline">
            {[r.room, r.commune].filter(Boolean).join(", ")}
          </h3>
          {detail && <p className="mt-auto text-[0.94rem] text-gris">{fr(majuscule(detail))}</p>}
        </div>
      </Link>
    </li>
  );
}

export function RealisationGrid({ items }: { items: Realisation[] }) {
  return (
    <Pose>
      {items.map((r, i) => (
        <RealisationTile
          key={r.slug}
          r={r}
          span={`col-span-12 md:col-span-6 ${items.length >= 3 ? (i % 4 === 0 || i % 4 === 3 ? "lg:col-span-7" : "lg:col-span-5") : "lg:col-span-6"}`}
        />
      ))}
    </Pose>
  );
}

/* ---------- Guides (liste, pas de grille) ---------- */

export function GuideList({ guides }: { guides: Guide[] }) {
  return (
    <Pose>
      {guides.map((g) => (
        <li key={g.slug} className="col-span-12 flex">
          <Link
            href={`/conseils/${g.slug}/`}
            className={`group cabochon grid flex-1 items-center gap-4 bg-blanc px-6 py-5 hover:bg-white md:gap-7 ${
              g.image
                ? "md:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1.25fr)_auto]"
                : "md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]"
            }`}
          >
            {g.image && (
              <span className="block aspect-[4/3] w-full overflow-hidden bg-alu-2 md:w-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgSrc(g.image.src, 480)}
                  srcSet={imgSrcSet(g.image.src, [320, 480, 800])}
                  sizes="(min-width: 768px) 176px, 92vw"
                  alt={g.image.alt}
                  width={g.image.width}
                  height={g.image.height}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                />
              </span>
            )}
            <span>
              <span className="t-etiquette block text-rouge-fonce">{g.category}</span>
              <span className="mt-1 block text-[1.25rem] leading-snug font-[700] decoration-2 underline-offset-4 group-hover:underline">{fr(g.title)}</span>
            </span>
            <span className="line-clamp-2 text-[0.975rem] text-gris">{fr(g.lead)}</span>
            <span className="text-[0.9rem] whitespace-nowrap text-gris">{g.readingMinutes} min de lecture</span>
          </Link>
        </li>
      ))}
    </Pose>
  );
}

/* ---------- FAQ ---------- */

export function FaqList({ items, withSchema = true }: { items: Faq[]; withSchema?: boolean }) {
  return (
    <>
      <div className="divide-y-2 divide-alu-2 border-y-2 border-alu-2">
        {items.map((f, i) => (
          <details key={i} className="group" name="faq">
            <summary className="flex items-start justify-between gap-6 py-4">
              <h3 className="text-[1.1rem] leading-snug font-[700]">{fr(f.q)}</h3>
              <span className="relative mt-0.5 grid size-7 shrink-0 place-items-center rounded-[2px] border-2 border-anthracite group-open:bg-anthracite" aria-hidden="true">
                <span className="absolute h-[2px] w-3 bg-anthracite group-open:bg-white" />
                <span className="absolute h-3 w-[2px] bg-anthracite group-open:hidden" />
              </span>
            </summary>
            <p className="max-w-3xl pb-5 leading-relaxed text-gris">
              <Inline text={f.a} />
            </p>
          </details>
        ))}
      </div>
      {/* Plus de rich results FAQ chez Google (mai 2026), mais le balisage reste lu par les moteurs IA. */}
      {withSchema && <JsonLd data={faqLd(items)} />}
    </>
  );
}

/* ---------- Avis ---------- */

function Quote({ r, big = false }: { r: Review; big?: boolean }) {
  const text = fr(r.text);
  const hl = r.highlight ? fr(r.highlight) : "";
  const at = hl ? text.indexOf(hl) : -1;
  return (
    <figure className={`flex-1 bg-blanc ${big ? "px-6 py-8 sm:px-9 sm:pt-[34px] sm:pb-8" : "px-6 py-6"}`}>
      <blockquote className={big ? "text-[clamp(1.3rem,0.95rem+1.2vw,2rem)] leading-[1.32] font-[430] tracking-[-0.005em]" : "text-[1.05rem] leading-relaxed"}>
        «{" "}
        {at >= 0 ? (
          <>
            {text.slice(0, at)}
            <mark className="bg-transparent font-[640] text-inherit shadow-[inset_0_-0.16em_0_var(--rouge)]">{hl}</mark>
            {text.slice(at + hl.length)}
          </>
        ) : (
          text
        )}
        {" "}»
      </blockquote>
      <figcaption className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem] text-gris">
        <b className="font-[680] text-anthracite">{r.author}</b>
        <span>
          Avis {r.source}, {r.dateLabel}
        </span>
      </figcaption>
    </figure>
  );
}

/** Bloc avis : titre et compte honnête à gauche, slider interactif à droite sur l'accueil (ou liste complète sur /avis/). */
export async function Avis({
  title,
  intro,
  all = false,
  headingId = "avis",
  asH1 = false,
  sliderConfig,
}: {
  title: string;
  intro?: string;
  all?: boolean;
  headingId?: string;
  asH1?: boolean;
  sliderConfig?: { autoplay?: boolean; autoplaySeconds?: number; sliderIds?: string[] };
}) {
  const reviews = await getReviews();
  const [first, ...rest] = reviews.list;
  if (!first) return null;
  const tous5 = reviews.list.every((r) => r.rating === 5);
  const H = asH1 ? "h1" : "h2";

  // Sélection des avis du slider : liste explicite Sanity si définie, sinon tous les avis cochés « showInSlider »
  const selectedForSlider = (() => {
    if (sliderConfig?.sliderIds?.length) {
      const byId = new Map(reviews.list.map((r) => [r.id, r]));
      const picked = sliderConfig.sliderIds.map((id) => byId.get(id)).filter((x): x is Review => Boolean(x));
      if (picked.length) return picked;
    }
    const filtered = reviews.list.filter((r) => r.showInSlider !== false);
    return filtered.length ? filtered : reviews.list;
  })();

  const sliderItems = selectedForSlider.map((r, i) => ({
    id: r.id ?? `review-${i + 1}`,
    author: r.author,
    dateLabel: r.dateLabel,
    rating: r.rating,
    text: fr(r.text),
    highlight: r.highlight ? fr(r.highlight) : undefined,
    projectLabel: r.projectLabel ? fr(r.projectLabel) : undefined,
    source: r.source,
  }));

  return (
    <div>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div className="grid gap-3.5">
          <H id={headingId} className="t-titre text-[clamp(1.9rem,1.1rem+2.4vw,3.15rem)]">
            {title}
          </H>
          <Stars n={tous5 ? 5 : Math.round(reviews.average)} />
          <p className="max-w-[22rem] text-gris">
            {majuscule(enLettres(reviews.count))} avis sur Google{tous5 ? ", tous à 5 sur 5" : ""}. {intro}
          </p>
          {!all && <ToutVoir href="/avis/">Lire les {enLettres(reviews.count)} avis</ToutVoir>}
        </div>
        {all ? (
          <Quote r={first} big />
        ) : (
          <ReviewSlider
            items={sliderItems}
            autoplay={sliderConfig?.autoplay ?? true}
            autoplaySeconds={sliderConfig?.autoplaySeconds ?? 7}
          />
        )}
      </div>
      {all && rest.length > 0 && (
        <Pose className="mt-11">
          {rest.map((r, i) => (
            <li key={i} className={`col-span-12 flex ${rest.length > 1 ? (i % 2 === 0 ? "md:col-span-7" : "md:col-span-5") : ""}`}>
              <Quote r={r} />
            </li>
          ))}
        </Pose>
      )}
      <p className="mt-3 text-[0.8rem] text-gris">{reviews.notice}</p>
    </div>
  );
}
