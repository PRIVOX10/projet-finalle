import { describe, expect, it } from "vitest";
import { dayKey, formatPrice, normalizeLabel, slugify } from "@/lib/format";

describe("formatPrice", () => {
  it("sépare les milliers par une espace insécable visible", () => {
    expect(formatPrice(3500, "DA")).toBe("3 500 DA");
    expect(formatPrice(181900, "DA")).toBe("181 900 DA");
  });

  it("n'utilise jamais l'espace fine que la police n'affiche pas", () => {
    expect(formatPrice(1234567, "DA")).not.toContain(" ");
  });
});

describe("slugify", () => {
  it("retire accents, apostrophes et majuscules", () => {
    expect(slugify("Éclat d'Agrume")).toBe("eclat-d-agrume");
    expect(slugify("  Sable & Coquillage  ")).toBe("sable-coquillage");
  });
});

describe("normalizeLabel", () => {
  it("met une seule majuscule en tête pour éviter les doublons de filtres", () => {
    expect(normalizeLabel("rose  POUDRÉ")).toBe("Rose poudré");
    expect(normalizeLabel(" dôme ")).toBe("Dôme");
  });
});

describe("dayKey", () => {
  it("compte les jours à l'heure d'Alger, pas en UTC", () => {
    // 23 h 30 UTC = 0 h 30 à Alger : c'est déjà le lendemain pour la boutique.
    expect(dayKey(new Date("2026-11-22T23:30:00Z"))).toBe("2026-11-23");
    expect(dayKey(new Date("2026-11-22T22:30:00Z"))).toBe("2026-11-22");
  });
});
