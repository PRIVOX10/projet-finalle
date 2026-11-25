import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { FilterPanel } from "@/components/shop/FilterPanel";
import { ProductCard } from "@/components/shop/ProductCard";
import { SortSelect } from "@/components/shop/SortSelect";
import { SORTS, getCatalog, getFacets, type SortKey } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { swatchFor } from "@/lib/swatches";

export const metadata: Metadata = {
  title: "Bouquets",
  description:
    "Tous les bouquets de bougies Kandili, à filtrer par couleur, type de fleur et prix.",
};

type Params = Record<string, string | string[] | undefined>;

const list = (value: string | string[] | undefined) =>
  value === undefined ? [] : Array.isArray(value) ? value : [value];

function amount(value: string | string[] | undefined) {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return value !== undefined &&
    value !== "" &&
    Number.isFinite(parsed) &&
    parsed >= 0
    ? parsed
    : undefined;
}

function toSearch(params: Params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    for (const item of list(value)) if (item) search.append(key, item);
  }
  const text = search.toString();
  return text ? `/bouquets?${text}` : "/bouquets";
}

/** Lien qui ajoute ou retire une valeur de filtre, en gardant les autres. */
function toggle(params: Params, key: string, value: string) {
  const current = list(params[key]);
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
  return toSearch({ ...params, [key]: next });
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const colors = list(params.couleur);
  const flowers = list(params.fleur);
  const shapes = list(params.forme);
  const min = amount(params.min);
  const max = amount(params.max);
  const sortParam = list(params.tri)[0];
  const sort: SortKey =
    sortParam && sortParam in SORTS ? (sortParam as SortKey) : "recent";

  const [products, facets, settings] = await Promise.all([
    getCatalog({ colors, flowers, shapes, min, max, sort }),
    getFacets(),
    getSettings(),
  ]);
  const activeCount =
    colors.length +
    flowers.length +
    shapes.length +
    (min !== undefined || max !== undefined ? 1 : 0);
  const filtered =
    colors.length > 0 ||
    flowers.length > 0 ||
    shapes.length > 0 ||
    min !== undefined ||
    max !== undefined;

  return (
    <main className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:max-w-none lg:px-8">
      <h1 className="font-display text-4xl sm:text-5xl">Tous les bouquets</h1>

      <div className="mt-6 lg:grid lg:grid-cols-[15rem_1fr] lg:items-start lg:gap-12">
        <FilterPanel activeCount={activeCount}>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Couleur</legend>
            <div className="flex flex-wrap gap-2">
              {facets.colors.map(({ value, count }) => (
                <Link
                  key={value}
                  href={toggle(params, "couleur", value)}
                  aria-current={colors.includes(value)}
                  scroll={false}
                  className="chip"
                >
                  <span
                    aria-hidden="true"
                    className="size-4 rounded-full border border-plum/15"
                    style={{ background: swatchFor(value) }}
                  />
                  {value}
                  <span className="opacity-60">{count}</span>
                </Link>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Forme</legend>
            <div className="flex flex-wrap gap-2">
              {facets.shapes.map(({ value, count }) => (
                <Link
                  key={value}
                  href={toggle(params, "forme", value)}
                  aria-current={shapes.includes(value)}
                  scroll={false}
                  className="chip"
                >
                  {value}
                  <span className="opacity-60">{count}</span>
                </Link>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">
              Type de fleur
            </legend>
            <div className="flex flex-wrap gap-2">
              {facets.flowers.map(({ value, count }) => (
                <Link
                  key={value}
                  href={toggle(params, "fleur", value)}
                  aria-current={flowers.includes(value)}
                  scroll={false}
                  className="chip"
                >
                  {value}
                  <span className="opacity-60">{count}</span>
                </Link>
              ))}
            </div>
          </fieldset>

          <Form
            action="/bouquets"
            scroll={false}
            className="flex flex-wrap items-end gap-3 lg:grid lg:grid-cols-2"
          >
            {colors.map((value) => (
              <input key={value} type="hidden" name="couleur" value={value} />
            ))}
            {flowers.map((value) => (
              <input key={value} type="hidden" name="fleur" value={value} />
            ))}
            {shapes.map((value) => (
              <input key={value} type="hidden" name="forme" value={value} />
            ))}
            <input type="hidden" name="tri" value={sort} />
            <label className="w-32 lg:w-auto">
              <span className="field-label">
                Prix min ({settings.currency})
              </span>
              <input
                name="min"
                type="number"
                min={0}
                step={100}
                inputMode="numeric"
                defaultValue={min}
                placeholder={String(facets.minPrice)}
                className="field"
              />
            </label>
            <label className="w-32 lg:w-auto">
              <span className="field-label">
                Prix max ({settings.currency})
              </span>
              <input
                name="max"
                type="number"
                min={0}
                step={100}
                inputMode="numeric"
                defaultValue={max}
                placeholder={String(facets.maxPrice)}
                className="field"
              />
            </label>
            <button type="submit" className="btn btn-outline lg:col-span-2">
              Appliquer
            </button>
            {filtered && (
              <Link
                href="/bouquets"
                scroll={false}
                className="self-center text-sm underline underline-offset-4 lg:col-span-2 lg:justify-self-center"
              >
                Effacer les filtres
              </Link>
            )}
          </Form>
        </FilterPanel>

        <section aria-label="Résultats" className="min-w-0">
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 lg:mt-0">
            <p className="text-sm text-plum-soft" aria-live="polite">
              {products.length} bouquet{products.length > 1 ? "s" : ""}
            </p>
            <SortSelect
              value={sort}
              options={Object.entries(SORTS).map(([value, { label }]) => ({
                value,
                label,
              }))}
            />
          </div>

          {products.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-plum-soft">
                Aucun bouquet ne correspond à ces filtres.
              </p>
              <Link href="/bouquets" className="btn btn-outline mt-4">
                Voir tous les bouquets
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currency={settings.currency}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
