"use client";

import { toggleTheme, useTheme } from "@/lib/theme";

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const dark = useTheme() === "dark";
  const label = dark ? "Rallumer la lumière" : "Éteindre la lumière";

  return (
    <button
      type="button"
      aria-pressed={dark}
      aria-label={showLabel ? undefined : `${label} : mode sombre aux bougies`}
      title={label}
      onClick={(event) => {
        const box = event.currentTarget.getBoundingClientRect();
        toggleTheme(box.left + box.width / 2, box.top + box.height / 2);
      }}
      className={
        showLabel
          ? "flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-wax-deep"
          : "grid size-11 cursor-pointer place-items-center rounded-full hover:bg-wax-deep"
      }
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className={showLabel ? "size-4" : "size-5"}>
        <rect x="8" y="11.5" width="8" height="10" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 11.5V9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path
          className="toggle-flame"
          d="M12 1c1.2 2.2 3 3.4 3 5.2A3 3 0 0 1 9 6.2C9 4.4 10.8 3.2 12 1Z"
        />
      </svg>
      {showLabel && label}
    </button>
  );
}
