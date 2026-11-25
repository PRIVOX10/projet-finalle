"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "./theme-script";

export type Theme = "light" | "dark";

const REVEAL_MS = 800;

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(listener: () => void) {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function useTheme() {
  return useSyncExternalStore<Theme>(subscribe, readTheme, () => "light");
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Stockage indisponible : le thème reste valable pour cette visite.
  }
}

/** Change de thème en faisant s'étendre la nouvelle ambiance depuis le point (x, y). */
export function toggleTheme(x: number, y: number) {
  const next: Theme = readTheme() === "dark" ? "light" : "dark";
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (calm || !document.startViewTransition) {
    apply(next);
    return;
  }

  const transition = document.startViewTransition(() => apply(next));
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: REVEAL_MS, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {
      // Transition interrompue : le thème est appliqué quand même.
    });
}
