/** Renvoie le numéro sans séparateurs, ou null s'il n'a pas une forme valide. */
export function normalizePhone(raw: string) {
  const compact = raw.replace(/[\s.\-()]/g, "");
  return /^(\+|00)?\d{9,15}$/.test(compact) ? compact : null;
}

/** Format international sans « + » attendu par wa.me. Numéros locaux : Algérie. */
export function toWhatsAppNumber(phone: string) {
  const compact = phone.replace(/[\s.\-()]/g, "");
  if (compact.startsWith("+")) return compact.slice(1);
  if (compact.startsWith("00")) return compact.slice(2);
  if (compact.startsWith("0")) return `213${compact.slice(1)}`;
  return compact;
}

export function whatsAppLink(phone: string, message?: string) {
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${toWhatsAppNumber(phone)}${query}`;
}

export function formatPhone(phone: string) {
  return /^0\d{9}$/.test(phone) ? phone.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4") : phone;
}
