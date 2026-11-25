import { ProductCardSkeleton, Skeleton } from "@/components/Skeleton";

export default function CatalogLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:max-w-none lg:px-8" aria-busy="true">
      <h1 className="font-display text-4xl sm:text-5xl">Tous les bouquets</h1>
      <p className="sr-only">Chargement des bouquets…</p>
      <div className="mt-6 lg:grid lg:grid-cols-[15rem_1fr] lg:items-start lg:gap-12">
        <div className="hidden gap-5 lg:grid">
          {[5, 2, 4].map((count, group) => (
            <div key={group}>
              <Skeleton className="mb-3 h-4 w-20" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: count }, (_, index) => (
                  <Skeleton key={index} className="h-9 w-20 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div>
          <Skeleton className="h-12 w-full rounded-full lg:hidden" />
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 lg:mt-14 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
