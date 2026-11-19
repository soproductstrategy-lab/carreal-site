/** URL d'image redimensionnée : le CDN Sanity sert AVIF/WebP à la bonne taille (pas de coût d'optimisation côté hébergeur). */
export function imgSrc(src: string, w: number) {
  return src.includes("cdn.sanity.io") ? `${src}?w=${w}&auto=format&fit=max&q=78` : src;
}

export function imgSrcSet(src: string, widths = [480, 800, 1200, 1600]) {
  return src.includes("cdn.sanity.io") ? widths.map((w) => `${imgSrc(src, w)} ${w}w`).join(", ") : undefined;
}
