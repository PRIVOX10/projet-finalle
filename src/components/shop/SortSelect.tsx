"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function SortSelect({
  value,
  options,
}: {
  value: string;
  options: { value: string; label: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-plum-soft">Trier par</span>
      <select
        value={value}
        onChange={(event) => {
          const next = new URLSearchParams(params);
          next.set("tri", event.target.value);
          router.replace(`${pathname}?${next}`, { scroll: false });
        }}
        className="rounded-full border border-line bg-surface px-3 py-2"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
