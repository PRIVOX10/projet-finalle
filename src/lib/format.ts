const number = new Intl.NumberFormat("fr-FR");

export const SHOP_TIMEZONE = "Africa/Algiers";

export function formatPrice(amount: number, currency: string) {
  // fr-FR sépare les milliers par une espace fine que la police n'affiche pas.
  return `${number.format(amount).replace(/ /g, " ")} ${currency}`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: SHOP_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: SHOP_TIMEZONE,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/** Clé AAAA-MM-JJ du jour, à l'heure de la boutique. */
export function dayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SHOP_TIMEZONE }).format(date);
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** « rose poudré » → « Rose poudré » : évite les doublons dans les filtres. */
export function normalizeLabel(value: string) {
  const clean = value.trim().replace(/\s+/g, " ");
  return clean.charAt(0).toLocaleUpperCase("fr-FR") + clean.slice(1).toLocaleLowerCase("fr-FR");
}
