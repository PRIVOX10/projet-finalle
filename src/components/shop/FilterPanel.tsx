"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

/**
 * Colonne de filtres. Sur ordinateur elle est toujours visible ; sur téléphone
 * elle se replie derrière un bouton pour laisser les bouquets en premier.
 */
export function FilterPanel({ activeCount, children }: { activeCount: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <aside
      aria-label="Filtres"
      className="border-y border-line py-3 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:border-y-0 lg:py-0 lg:pr-2"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="filter-content"
        className="flex w-full cursor-pointer items-center justify-between gap-3 py-2 font-semibold lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtres
          {activeCount > 0 && (
            <span className="grid min-w-5 place-items-center rounded-full bg-rose px-1.5 text-xs leading-5 text-on-rose">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <div id="filter-content" className={`${open ? "grid" : "hidden"} gap-5 pb-2 pt-3 lg:grid lg:p-0`}>
        {children}
      </div>
    </aside>
  );
}
