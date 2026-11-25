"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/admin";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});

  return (
    <form action={action} className="card mt-6 space-y-4 p-6">
      <div>
        <label htmlFor="email" className="field-label">
          E-mail
        </label>
        <input id="email" name="email" type="email" required autoComplete="username" defaultValue={state.email} className="field" />
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          Mot de passe
        </label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
