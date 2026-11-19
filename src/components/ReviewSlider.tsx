"use client";

import { useEffect, useRef, useState } from "react";

export type SliderReview = {
  id: string;
  author: string;
  dateLabel: string;
  rating: number;
  text: string;
  highlight?: string;
  projectLabel?: string;
  source: string;
};

/**
 * Slider d'avis clients (DA Carreal) :
 * - Tous les avis restent dans le DOM (lisibles par Google et les moteurs IA).
 * - Navigation boutons ←/→, frise de carreaux cliquables, clavier, swipe tactile.
 * - Défilement automatique configurable dans Sanity, mis en pause au survol / focus / bouton Pause.
 */
export function ReviewSlider({
  items,
  autoplay = true,
  autoplaySeconds = 7,
}: {
  items: SliderReview[];
  autoplay?: boolean;
  autoplaySeconds?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const total = items.length;
  const safeIndex = total > 0 ? index % total : 0;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!autoplay || paused || hovering || reducedMotion || total <= 1) return;
    const delay = Math.max(3, Math.min(20, autoplaySeconds)) * 1000;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, delay);
    return () => window.clearInterval(id);
  }, [autoplay, autoplaySeconds, paused, hovering, reducedMotion, total]);

  if (!total) return null;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) next();
    else prev();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  };

  const pad = (n: number) => String(n + 1).padStart(2, "0");

  return (
    <div
      role="region"
      aria-roledescription="carrousel"
      aria-label="Témoignages clients Carreal"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHovering(false);
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="border-2 border-joint bg-blanc focus-visible:outline-3 focus-visible:outline-anthracite"
    >
      {/* Bandeau haut de carte : étoiles + compteur */}
      <div className="flex items-center justify-between gap-4 border-b-2 border-alu-2 px-6 py-4 sm:px-9">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex gap-0.5 text-rouge" aria-label={`${items[safeIndex].rating} étoiles sur 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} viewBox="0 0 20 20" className="size-4" aria-hidden="true">
                <path fill={i < items[safeIndex].rating ? "currentColor" : "none"} stroke="currentColor" d="M10 1.5l2.6 5.5 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L1.4 7.7l6-.7z" />
              </svg>
            ))}
          </span>
          <span className="t-etiquette text-gris">Avis {items[safeIndex].source}</span>
        </div>

        {total > 1 && (
          <div className="flex items-center gap-3">
            <span className="t-format tnum text-[1.35rem] text-anthracite" aria-live="polite">
              {pad(safeIndex)}
              <span className="text-gris-clair"> / {pad(total - 1)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Piste coulissante */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${safeIndex * 100}%)` }}
        >
          {items.map((r, i) => {
            const at = r.highlight ? r.text.indexOf(r.highlight) : -1;
            const isLong = r.text.length > 220;
            return (
              <figure
                key={r.id}
                aria-hidden={i !== safeIndex}
                className="flex min-h-[240px] w-full shrink-0 flex-col justify-between px-6 py-7 sm:min-h-[270px] sm:px-9 sm:py-8"
              >
                <blockquote
                  className={
                    isLong
                      ? "text-[clamp(1.15rem,0.95rem+0.85vw,1.55rem)] leading-[1.4] font-[430] tracking-[-0.005em]"
                      : "text-[clamp(1.3rem,1rem+1.1vw,1.9rem)] leading-[1.34] font-[430] tracking-[-0.005em]"
                  }
                >
                  «{"\u202f"}
                  {at >= 0 && r.highlight ? (
                    <>
                      {r.text.slice(0, at)}
                      <mark className="bg-transparent font-[640] text-inherit shadow-[inset_0_-0.16em_0_var(--rouge)]">{r.highlight}</mark>
                      {r.text.slice(at + r.highlight.length)}
                    </>
                  ) : (
                    r.text
                  )}
                  {"\u202f"}»
                </blockquote>

                <figcaption className="mt-7 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[0.95rem] text-gris">
                  <b className="font-[700] text-anthracite">{r.author}</b>
                  {r.projectLabel && (
                    <span className="t-etiquette bg-alu px-2 py-0.5 text-[0.82rem] text-anthracite">{r.projectLabel}</span>
                  )}
                  <span>{r.dateLabel}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>

      {/* Barre de navigation : frise de carreaux + flèches */}
      {total > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-alu-2 bg-alu/45 px-6 py-3.5 sm:px-9">
          <div className="flex items-center gap-2" role="tablist" aria-label="Choisir un témoignage">
            {items.map((r, i) => {
              const active = i === safeIndex;
              return (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-label={`Avis ${i + 1} sur ${total} : ${r.author}`}
                  onClick={() => setIndex(i)}
                  className={`h-3 cursor-pointer rounded-[1px] transition-all duration-200 ${
                    active ? "w-8 bg-rouge" : "w-3 bg-joint hover:bg-anthracite"
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {autoplay && !reducedMotion && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Relancer le défilement automatique" : "Mettre en pause le défilement automatique"}
                title={paused ? "Reprendre" : "Pause"}
                className="grid size-10 cursor-pointer place-items-center rounded-[2px] border-2 border-joint bg-blanc text-gris transition-colors hover:border-anthracite hover:text-anthracite"
              >
                {paused ? (
                  <svg viewBox="0 0 16 16" className="size-3.5 fill-current" aria-hidden="true">
                    <path d="M4.5 3.2 12.5 8l-8 4.8V3.2Z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" className="size-3.5 fill-current" aria-hidden="true">
                    <path d="M4 3h2.8v10H4V3Zm5.2 0H12v10H9.2V3Z" />
                  </svg>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={prev}
              aria-label="Avis précédent"
              className="grid size-10 cursor-pointer place-items-center rounded-[2px] border-2 border-anthracite bg-blanc text-anthracite transition-colors hover:bg-anthracite hover:text-white"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M10 3.5 5.5 8 10 12.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Avis suivant"
              className="grid size-10 cursor-pointer place-items-center rounded-[2px] border-2 border-anthracite bg-blanc text-anthracite transition-colors hover:bg-anthracite hover:text-white"
            >
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M6 3.5 10.5 8 6 12.5" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
