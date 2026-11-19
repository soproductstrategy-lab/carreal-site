/**
 * Logo Carreal redessiné d'après le flocage des camions : rond rouge, C blanc plein, puis « ARREAL ».
 * Le « C » du rond fait partie du mot, comme sur le camion.
 */
export const C_PATH = "M752.8 287.9A330 330 0 1 0 752.8 712.1L645.5 622.1A190 190 0 1 1 645.5 377.9Z";

export function LogoMark({ className = "size-9", outline = false }: { className?: string; outline?: boolean }) {
  return (
    <svg viewBox="0 0 1000 1000" className={className} aria-hidden="true">
      <circle cx="500" cy="500" r="500" fill="var(--rouge)" />
      {outline ? <path d={C_PATH} fill="none" stroke="#fff" strokeWidth="7" /> : <path d={C_PATH} fill="#fff" />}
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[2px] ${className}`}>
      <LogoMark className="size-9 shrink-0" />
      <span aria-hidden="true" className="text-[1.45rem] leading-none tracking-[0.01em] [font-stretch:125%] [font-weight:880]">
        ARREAL
      </span>
    </span>
  );
}
