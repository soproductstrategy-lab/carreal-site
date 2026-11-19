/**
 * Typographie française : espaces insécables fines avant « ; : ! ? % » et à l'intérieur des guillemets,
 * espace insécable entre un nombre et son unité (7 h, 20 mm, 45 €). Appliqué au rendu du texte venant du CMS.
 */
const NNBSP = " ";
const NBSP = " ";

export function fr(s: string): string {
  if (!s) return s;
  return s
    .replace(/\s+([;:!?%»])/g, `${NNBSP}$1`)
    .replace(/«\s+/g, `«${NNBSP}`)
    .replace(/(\d)\s+(h|min|mm|cm|m²|m|km|€|°C|ans|jours?|semaines?|%)(?=[\s.,;:!?)/]|$)/g, `$1${NBSP}$2`)
    .replace(/(\d)\s+(\d{3})(?!\d)/g, `$1${NBSP}$2`);
}
