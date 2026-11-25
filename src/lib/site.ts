/**
 * Adresse publique du site. Render fournit RENDER_EXTERNAL_URL ; SITE_URL permet
 * d'imposer un nom de domaine personnalisé.
 */
export function siteUrl() {
  return (process.env.SITE_URL ?? process.env.RENDER_EXTERNAL_URL ?? process.env.URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}
