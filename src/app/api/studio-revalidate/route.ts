import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

const ALL_TAGS = ["homePage", "aboutPage", "pageTexts", "settings", "service", "zone", "realisation", "guide", "review", "faqGroup"];

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!origin || !host) return true;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/**
 * Permet au Studio intégré (/studio) de rafraîchir immédiatement le cache Next.js après publication
 * pour que l'aperçu et le site public reflètent les modifications sans attendre.
 */
export async function POST(req: NextRequest) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
  }

  let docType: string | undefined;
  let path: string | undefined;
  try {
    const body = (await req.json()) as { docType?: string; path?: string };
    docType = body.docType;
    path = body.path;
  } catch {
    // Revalidation globale si corps vide
  }

  if (docType && ALL_TAGS.includes(docType)) {
    revalidateTag(docType, "max");
  } else {
    for (const tag of ALL_TAGS) revalidateTag(tag, "max");
  }

  revalidatePath("/");
  if (path && path.startsWith("/")) revalidatePath(path);

  return NextResponse.json({ revalidated: true, docType: docType ?? "all", path: path ?? "/" });
}
