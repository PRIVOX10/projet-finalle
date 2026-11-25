import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-4xl">Page introuvable</h1>
      <p className="text-plum-soft">Cette page n&apos;existe pas ou plus.</p>
      <Link href="/bouquets" className="btn btn-primary">
        Voir les bouquets
      </Link>
    </main>
  );
}
