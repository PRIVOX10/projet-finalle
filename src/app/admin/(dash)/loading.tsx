import { Skeleton } from "@/components/Skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true">
      <p className="sr-only">Chargement…</p>
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-72" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-20" />
        ))}
      </div>
    </div>
  );
}
