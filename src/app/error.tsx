"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-4xl">Un problème est survenu</h1>
      <p className="text-plum-soft">La page n&apos;a pas pu se charger. Réessayez dans un instant.</p>
      <button type="button" onClick={reset} className="btn btn-primary">
        Réessayer
      </button>
    </main>
  );
}
