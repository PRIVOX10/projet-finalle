"use client";

import { useActionState } from "react";
import { changePassword, saveSettings, type FormState } from "@/app/actions/admin";

function Feedback({ state }: { state: FormState }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p role="status" className="rounded-xl bg-sage-soft px-3 py-2 text-sm text-sage">
        {state.success}
      </p>
    );
  }
  return null;
}

export type SettingsValues = {
  whatsapp: string;
  instagram: string;
  email: string;
  currency: string;
  deliveryFee: number;
  scents: string[];
};

export function ShopSettingsForm({ values }: { values: SettingsValues }) {
  const [state, action, pending] = useActionState(saveSettings, {});

  return (
    <form action={action} className="card space-y-4 p-5">
      <h2 className="font-display text-xl">Boutique</h2>
      <div>
        <label htmlFor="whatsapp" className="field-label">
          Numéro WhatsApp
        </label>
        <input id="whatsapp" name="whatsapp" type="tel" defaultValue={values.whatsapp} placeholder="05 55 12 34 56" className="field" />
        <p className="mt-1 text-sm text-plum-soft">Le bouton WhatsApp apparaît sur le site dès que ce champ est rempli.</p>
      </div>
      <div>
        <label htmlFor="instagram" className="field-label">
          Compte Instagram
        </label>
        <input id="instagram" name="instagram" defaultValue={values.instagram} className="field" />
      </div>
      <div>
        <label htmlFor="email" className="field-label">
          E-mail de contact <span className="font-normal text-plum-soft">(facultatif)</span>
        </label>
        <input id="email" name="email" type="email" defaultValue={values.email} className="field" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="currency" className="field-label">
            Devise affichée
          </label>
          <input id="currency" name="currency" required maxLength={6} defaultValue={values.currency} className="field" />
        </div>
        <div>
          <label htmlFor="deliveryFee" className="field-label">
            Frais de livraison
          </label>
          <input id="deliveryFee" name="deliveryFee" type="number" min={0} step={1} defaultValue={values.deliveryFee} className="field" />
          <p className="mt-1 text-sm text-plum-soft">À 0, le client voit « Confirmée par téléphone ».</p>
        </div>
      </div>
      <fieldset>
        <legend className="field-label">Senteurs proposées</legend>
        <p className="mb-2 text-sm text-plum-soft">Le client choisit l&apos;une de ces 5 senteurs pour chaque bouquet.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {values.scents.slice(0, 5).map((scent, index) => (
            <input
              key={index}
              name="scents"
              required
              maxLength={40}
              defaultValue={scent}
              aria-label={`Senteur ${index + 1}`}
              className="field"
            />
          ))}
        </div>
      </fieldset>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {});

  return (
    <form action={action} className="card space-y-4 p-5">
      <h2 className="font-display text-xl">Mot de passe</h2>
      <div>
        <label htmlFor="current" className="field-label">
          Mot de passe actuel
        </label>
        <input id="current" name="current" type="password" required autoComplete="current-password" className="field" />
      </div>
      <div>
        <label htmlFor="next" className="field-label">
          Nouveau mot de passe
        </label>
        <input id="next" name="next" type="password" required minLength={10} autoComplete="new-password" className="field" />
        <p className="mt-1 text-sm text-plum-soft">10 caractères minimum.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="field-label">
          Confirmer le nouveau mot de passe
        </label>
        <input id="confirm" name="confirm" type="password" required minLength={10} autoComplete="new-password" className="field" />
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className="btn btn-outline">
        {pending ? "Modification…" : "Modifier le mot de passe"}
      </button>
    </form>
  );
}
