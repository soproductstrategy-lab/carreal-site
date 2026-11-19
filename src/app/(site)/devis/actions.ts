"use server";

import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSettings } from "@/lib/content";

const schema = z.object({
  prestation: z.string().min(1, "Choisissez un type de travaux."),
  commune: z.string().trim().min(2, "Indiquez la commune du chantier.").max(80),
  surface: z.string().max(40).optional().default(""),
  delai: z.string().max(40).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
  nom: z.string().trim().min(2, "Indiquez votre nom.").max(80),
  telephone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s.\-()]{8,19}$/, "Numéro de téléphone invalide."),
  email: z.union([z.literal(""), z.email("Adresse e-mail invalide.")]).optional().default(""),
  source: z.string().max(200).optional().default(""),
});

export type QuoteState = { ok: false; errors?: Partial<Record<keyof z.infer<typeof schema> | "form", string>> } | null;

export async function submitQuote(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  // Anti-spam sans cookie ni reCAPTCHA : champ piège + délai minimal de remplissage.
  if (formData.get("site_web")) redirect("/merci/");
  const started = Number(formData.get("t") ?? 0);
  if (started && Date.now() - started < 3000) return { ok: false, errors: { form: "Merci de vérifier le formulaire avant l'envoi." } };

  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, errors };
  }
  const lead = { ...parsed.data, receivedAt: new Date().toISOString() };

  try {
    await deliver(lead);
  } catch (e) {
    console.error("[devis] échec d'envoi", e);
    const business = await getSettings();
    return { ok: false, errors: { form: `L'envoi a échoué. Appelez-nous au ${business.phone.display}, nous répondons rapidement.` } };
  }
  redirect("/merci/");
}

async function deliver(lead: Record<string, string>) {
  const business = await getSettings();
  const lines = [
    `Nouvelle demande de devis — ${lead.prestation}`,
    "",
    `Nom : ${lead.nom}`,
    `Téléphone : ${lead.telephone}`,
    `E-mail : ${lead.email || "—"}`,
    `Commune : ${lead.commune}`,
    `Surface : ${lead.surface || "—"}`,
    `Délai : ${lead.delai || "—"}`,
    "",
    lead.message || "(pas de message)",
    "",
    `Page d'origine : ${lead.source || "—"}`,
  ].join("\n");

  // Production : envoi par Resend (clé dans RESEND_API_KEY). Remplaçable par Brevo.
  if (process.env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.QUOTE_FROM ?? "Site Carreal <devis@carreal.fr>",
        to: [process.env.QUOTE_TO ?? business.email],
        reply_to: lead.email || undefined,
        subject: `Devis ${lead.prestation} — ${lead.commune} — ${lead.nom}`,
        text: lines,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    return;
  }

  // Démo hébergée sur Vercel sans clé Resend : le système de fichiers est en lecture seule, on journalise dans les logs Vercel.
  if (process.env.VERCEL) {
    console.info("[devis] (démo Vercel sans RESEND_API_KEY) demande reçue :\n" + lines);
    return;
  }

  // Développement local : on journalise dans .leads/leads.jsonl (ignoré par git).
  const dir = path.join(process.cwd(), ".leads");
  await mkdir(dir, { recursive: true });
  await appendFile(path.join(dir, "leads.jsonl"), JSON.stringify(lead) + "\n", "utf8");
  console.info("[devis] (dev) demande enregistrée dans .leads/leads.jsonl\n" + lines);
}
