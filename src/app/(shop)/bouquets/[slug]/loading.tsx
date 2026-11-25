import { Skeleton } from "@/components/Skeleton";

export default function ProductLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6" aria-busy="true">
      <p className="sr-only">Chargement du bouquet…</p>
      <Skeleton className="h-4 w-40" />
      <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-12">
        <Skeleton className="aspect-[4/5] rounded-3xl" />
        <div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-12 w-3/4" />
          <Skeleton className="mt-5 h-8 w-32" />
          <div className="mt-6 grid gap-2">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-12" />
            ))}
          </div>
          <Skeleton className="mt-6 h-12 rounded-full" />
          <Skeleton className="mt-6 h-20" />
        </div>
      </div>
    </main>
  );
}
