import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Webhook Sanity → régénère les pages concernées dès qu'un contenu est publié.
 * À configurer dans sanity.io/manage → API → Webhooks :
 *   URL : https://www.<domaine>/api/revalidate · Trigger : create, update, delete
 *   Projection : {_type, "slug": slug.current} · Secret : SANITY_REVALIDATE_SECRET
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return NextResponse.json({ message: "Secret non configuré" }, { status: 500 });

  const { isValidSignature, body } = await parseBody<{ _type?: string; slug?: string }>(req, secret);
  if (!isValidSignature) return NextResponse.json({ message: "Signature invalide" }, { status: 401 });
  if (!body?._type) return NextResponse.json({ message: "Type manquant" }, { status: 400 });

  revalidateTag(body._type, "max");
  // Les prestations et zones apparaissent dans le menu / pied de page de toutes les pages.
  return NextResponse.json({ revalidated: body._type, slug: body.slug ?? null });
}
