"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitQuote, type QuoteState } from "./actions";

type Opt = { value: string; label: string };

const surfaces = ["Moins de 10 m²", "10 à 30 m²", "30 à 60 m²", "Plus de 60 m²", "Je ne sais pas"];
const delais = ["Dès que possible", "Dans 1 à 3 mois", "Dans 3 à 6 mois", "Je me renseigne"];
const etapes = ["vos travaux", "votre chantier", "vos coordonnées"];

const field =
  "min-h-[52px] w-full rounded-[2px] border-2 border-bord-champ bg-blanc px-3.5 text-base focus:border-anthracite focus:outline-3 focus:outline-anthracite/20 aria-[invalid]:border-rouge-fonce";

/**
 * Formulaire de devis en 3 étapes. Sans JavaScript, les 3 étapes s'affichent ensemble et le formulaire fonctionne.
 */
export function QuoteForm({ prestations }: { prestations: Opt[] }) {
  const [state, action, pending] = useActionState<QuoteState, FormData>(submitQuote, null);
  const [step, setStep] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const [t, setT] = useState("");
  const [preset, setPreset] = useState("");
  const [source, setSource] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state?.errors ?? {};

  useEffect(() => {
    // Hydratation : mode pas à pas, heure de début (anti-robot), prestation passée en URL.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnhanced(true);
    setT(String(Date.now()));
    const p = new URLSearchParams(window.location.search).get("prestation");
    if (p) setPreset(p);
    setSource(document.referrer || "");
  }, []);

  useEffect(() => {
    if (!state?.errors) return;
    const first = Object.keys(state.errors)[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (first === "prestation") setStep(0);
    else if (["commune", "surface", "delai", "message"].includes(first)) setStep(1);
    else setStep(2);
  }, [state]);

  const show = (i: number) => !enhanced || step === i;

  const next = (i: number) => {
    const fs = formRef.current?.querySelectorAll<HTMLFieldSetElement>("fieldset")[i];
    const invalid = fs?.querySelector<HTMLInputElement>(":invalid");
    if (invalid) {
      invalid.reportValidity();
      return;
    }
    setStep(i + 1);
  };

  return (
    <form ref={formRef} action={action} className="bg-blanc p-5 sm:p-8">
      {enhanced && (
        <div className="mb-7" aria-live="polite">
          <p className="t-etiquette text-gris">
            Étape {step + 1} sur 3 : {etapes[step]}
          </p>
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {etapes.map((e, i) => (
              <span key={e} className={`size-4 ${i < step ? "bg-rouge" : i === step ? "bg-anthracite" : "bg-joint"}`} />
            ))}
          </div>
        </div>
      )}

      {errors.form && (
        <p role="alert" className="mb-6 border-l-[6px] border-rouge-fonce bg-alu px-4 py-3 font-[600]">
          {errors.form}
        </p>
      )}

      <fieldset hidden={!show(0)}>
        <legend className="t-titre mb-5 text-[1.75rem]">Quels travaux ?</legend>
        <div className="pose">
          {[...prestations, { value: "autre", label: "Autre ou plusieurs travaux" }].map((p) => (
            <label
              key={p.value}
              className="cabochon col-span-12 flex min-h-14 cursor-pointer items-center gap-3 bg-blanc px-4 py-3 has-[:checked]:shadow-[inset_0_0_0_2px_var(--anthracite)] has-[:checked]:after:scale-100 sm:col-span-6"
            >
              <input type="radio" name="prestation" value={p.value} required defaultChecked={preset === p.value} key={preset} className="size-4 accent-[var(--anthracite)]" />
              <span className="font-[600]">{p.label}</span>
            </label>
          ))}
        </div>
        <FieldError msg={errors.prestation} />
        {enhanced && (
          <div className="mt-6 flex justify-end">
            <StepButton onClick={() => next(0)}>Continuer</StepButton>
          </div>
        )}
      </fieldset>

      <fieldset hidden={!show(1)} className={`grid gap-6 ${!enhanced ? "mt-12" : ""}`}>
        <legend className="t-titre mb-5 text-[1.75rem]">Où et quand ?</legend>
        <Field label="Commune du chantier" name="commune" required autoComplete="address-level2" hint="Annecy, Seynod, Sévrier…" error={errors.commune} />
        <Choice label="Surface approximative" name="surface" options={surfaces} />
        <Choice label="Quand ?" name="delai" options={delais} />
        <div>
          <label htmlFor="message" className="mb-1.5 block text-[0.975rem] font-[650]">
            Votre projet en quelques mots <span className="font-[450] text-gris">(facultatif)</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={2000}
            className={`${field} py-3`}
            placeholder="Ex. : remplacer la baignoire par une douche à l'italienne, carrelage déjà choisi"
          />
        </div>
        {enhanced && (
          <div className="flex items-center justify-between">
            <BackButton onClick={() => setStep(0)} />
            <StepButton onClick={() => next(1)}>Continuer</StepButton>
          </div>
        )}
      </fieldset>

      <fieldset hidden={!show(2)} className={`grid gap-6 ${!enhanced ? "mt-12" : ""}`}>
        <legend className="t-titre mb-5 text-[1.75rem]">Comment vous joindre ?</legend>
        <Field label="Nom" name="nom" required autoComplete="name" error={errors.nom} />
        <Field label="Téléphone" name="telephone" type="tel" required autoComplete="tel" inputMode="tel" error={errors.telephone} />
        <Field label="E-mail" name="email" type="email" autoComplete="email" hint="Facultatif" error={errors.email} />

        {/* Piège à robots : invisible pour les humains */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Site web <input type="text" name="site_web" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <input type="hidden" name="t" value={t} />
        <input type="hidden" name="source" value={source} />

        <p className="text-[0.85rem] leading-relaxed text-gris">
          Vos coordonnées servent uniquement à répondre à votre demande. Elles ne sont jamais revendues et sont gardées 3 ans au plus.{" "}
          <a href="/confidentialite/" className="underline decoration-2 underline-offset-2">
            Confidentialité
          </a>
          .
        </p>
        <div className="flex items-center justify-between gap-4">
          {enhanced ? <BackButton onClick={() => setStep(1)} /> : <span />}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[52px] items-center justify-center rounded-[2px] bg-rouge px-[22px] text-base font-[680] text-white hover:bg-rouge-fonce disabled:opacity-60"
          >
            {pending ? "Envoi…" : "Envoyer ma demande"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

function StepButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex min-h-[52px] items-center rounded-[2px] bg-anthracite px-[22px] font-[680] text-white hover:bg-black">
      {children}
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="font-[650] underline decoration-2 underline-offset-4 hover:text-rouge-fonce">
      Retour
    </button>
  );
}

function FieldError({ msg, id }: { msg?: string; id?: string }) {
  if (!msg) return null;
  return (
    <p id={id} className="mt-1.5 text-[0.95rem] font-[600] text-rouge-fonce">
      {msg}
    </p>
  );
}

function Field({ label, name, error, hint, ...rest }: { label: string; name: string; error?: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[0.975rem] font-[650]">
        {label} {hint && <span className="font-[450] text-gris">({hint})</span>}
      </label>
      <input id={name} name={name} aria-invalid={error ? true : undefined} aria-describedby={error ? `${name}-err` : undefined} className={field} {...rest} />
      <FieldError msg={error} id={`${name}-err`} />
    </div>
  );
}

function Choice({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <div role="radiogroup" aria-label={label}>
      <p className="mb-2 text-[0.975rem] font-[650]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o}
            className="cursor-pointer rounded-[2px] border-2 border-bord-champ px-4 py-2 text-[0.95rem] has-[:checked]:border-anthracite has-[:checked]:bg-anthracite has-[:checked]:text-white has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-anthracite"
          >
            <input type="radio" name={name} value={o} className="sr-only" />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}
