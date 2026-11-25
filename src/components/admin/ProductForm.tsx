"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { deleteProduct, saveProduct } from "@/app/actions/admin";
import type { ProductData } from "@/lib/catalog";
import { COLOR_SUGGESTIONS, FLOWER_SUGGESTIONS, SHAPE_SUGGESTIONS } from "@/lib/swatches";

const MAX_IMAGES = 8;
const MAX_SIDE = 1600;

type SizeRow = { key: string; id?: string; label: string; price: string };
type NewImage = { key: string; file: File; preview: string };

/** Réduit la photo dans le navigateur : une photo de téléphone passe de ~5 Mo à ~300 Ko. */
async function shrink(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("conversion impossible");
  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}

export function ProductForm({ product, currency }: { product?: ProductData; currency: string }) {
  const nextKey = useRef(0);
  const newKey = () => `new-${nextKey.current++}`;

  const [sizes, setSizes] = useState<SizeRow[]>(
    product?.sizes.map((size) => ({ key: size.id, id: size.id, label: size.label, price: String(size.price) })) ?? [
      { key: "first", label: "", price: "" },
    ],
  );
  const [kept, setKept] = useState(product?.images.map((image) => image.url) ?? []);
  const [added, setAdded] = useState<NewImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const imageCount = kept.length + added.length;

  async function addFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])].slice(0, MAX_IMAGES - imageCount);
    event.target.value = "";
    setError(null);
    for (const file of files) {
      try {
        const small = await shrink(file);
        setAdded((list) => [...list, { key: newKey(), file: small, preview: URL.createObjectURL(small) }]);
      } catch {
        setError(`« ${file.name} » n'a pas pu être lue. Utilisez une photo JPEG, PNG ou WebP.`);
      }
    }
  }

  function updateSize(key: string, patch: Partial<SizeRow>) {
    setSizes((rows) => rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.delete("picker");
    data.set(
      "sizes",
      JSON.stringify(sizes.map(({ id, label, price }) => ({ id, label, price: price === "" ? null : Number(price) }))),
    );
    data.set("keepImages", JSON.stringify(kept));
    for (const image of added) data.append("files", image.file);

    setError(null);
    startTransition(async () => {
      try {
        const result = await saveProduct(product?.id ?? null, data);
        if (result?.error) setError(result.error);
      } catch (cause) {
        // redirect() passe par une exception que Next doit recevoir.
        if (cause instanceof Error && cause.message.includes("NEXT_REDIRECT")) throw cause;
        setError("L'enregistrement a échoué. Vérifiez la taille des photos et réessayez.");
      }
    });
  }

  function remove() {
    if (!product) return;
    if (!window.confirm(`Supprimer définitivement « ${product.name} » ? Les commandes passées sont conservées.`)) return;
    startTransition(() => deleteProduct(product.id));
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <section className="card space-y-4 p-5">
          <div>
            <label htmlFor="name" className="field-label">
              Nom du bouquet
            </label>
            <input id="name" name="name" required maxLength={80} defaultValue={product?.name} className="field" />
          </div>
          <div>
            <label htmlFor="description" className="field-label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={5}
              maxLength={2000}
              defaultValue={product?.description}
              className="field"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="shape" className="field-label">
                Forme
              </label>
              <input id="shape" name="shape" list="shapes" required maxLength={40} defaultValue={product?.shape ?? "Dôme"} className="field" />
              <datalist id="shapes">
                {SHAPE_SUGGESTIONS.map((value) => (
                  <option key={value} value={value} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="color" className="field-label">
                Couleur
              </label>
              <input id="color" name="color" list="colors" required maxLength={40} defaultValue={product?.color} className="field" />
              <datalist id="colors">
                {COLOR_SUGGESTIONS.map((value) => (
                  <option key={value} value={value} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor="flowerType" className="field-label">
                Type de fleur
              </label>
              <input
                id="flowerType"
                name="flowerType"
                list="flowers"
                required
                maxLength={40}
                defaultValue={product?.flowerType}
                className="field"
              />
              <datalist id="flowers">
                {FLOWER_SUGGESTIONS.map((value) => (
                  <option key={value} value={value} />
                ))}
              </datalist>
            </div>
          </div>
        </section>

        <section className="card p-5" aria-labelledby="sizes-title">
          <h2 id="sizes-title" className="font-display text-xl">
            Tailles et prix
          </h2>
          <div className="mt-3 space-y-2">
            {sizes.map((row, index) => (
              <div key={row.key} className="flex items-center gap-2">
                <input
                  aria-label={`Taille ${index + 1}, nom`}
                  placeholder="Moyen · 12 fleurs"
                  required
                  maxLength={60}
                  value={row.label}
                  onChange={(event) => updateSize(row.key, { label: event.target.value })}
                  className="field min-w-0 flex-1"
                />
                <input
                  aria-label={`Taille ${index + 1}, prix en ${currency}`}
                  placeholder={`Prix (${currency})`}
                  type="number"
                  inputMode="numeric"
                  required
                  min={0}
                  step={1}
                  value={row.price}
                  onChange={(event) => updateSize(row.key, { price: event.target.value })}
                  className="field w-32 shrink-0"
                />
                <button
                  type="button"
                  disabled={sizes.length === 1}
                  onClick={() => setSizes((rows) => rows.filter((item) => item.key !== row.key))}
                  aria-label={`Retirer la taille ${index + 1}`}
                  className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-plum-soft hover:bg-wax-deep disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          {sizes.length < 8 && (
            <button
              type="button"
              onClick={() => setSizes((rows) => [...rows, { key: newKey(), label: "", price: "" }])}
              className="btn btn-outline btn-sm mt-3"
            >
              <Plus className="size-4" aria-hidden="true" />
              Ajouter une taille
            </button>
          )}
        </section>
      </div>

      <div className="space-y-6">
        <section className="card p-5" aria-labelledby="photos-title">
          <h2 id="photos-title" className="font-display text-xl">
            Photos
          </h2>
          <p className="text-sm text-plum-soft">La première photo sert de vignette.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {kept.map((url) => (
              <div key={url} className="relative aspect-[4/5] overflow-hidden rounded-lg bg-wax-deep">
                <Image src={url} alt="" fill sizes="120px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setKept((list) => list.filter((item) => item !== url))}
                  aria-label="Retirer cette photo"
                  className="absolute right-1 top-1 grid size-7 cursor-pointer place-items-center rounded-full bg-surface/90"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            ))}
            {added.map((image) => (
              <div key={image.key} className="relative aspect-[4/5] overflow-hidden rounded-lg bg-wax-deep">
                <Image src={image.preview} alt="" fill sizes="120px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setAdded((list) => list.filter((item) => item.key !== image.key))}
                  aria-label="Retirer cette photo"
                  className="absolute right-1 top-1 grid size-7 cursor-pointer place-items-center rounded-full bg-surface/90"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            ))}
            {imageCount < MAX_IMAGES && (
              <label className="grid aspect-[4/5] cursor-pointer place-items-center rounded-lg border border-dashed border-plum-soft text-center text-xs text-plum-soft hover:bg-wax-deep">
                <span className="grid justify-items-center gap-1">
                  <ImagePlus className="size-5" aria-hidden="true" />
                  Ajouter
                </span>
                <input
                  type="file"
                  name="picker"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={addFiles}
                  className="sr-only"
                />
              </label>
            )}
          </div>
        </section>

        <section className="card space-y-3 p-5" aria-label="Visibilité">
          <label className="flex items-center gap-3">
            <input type="checkbox" name="published" defaultChecked={product?.published ?? true} className="size-4 accent-plum" />
            Visible sur le site
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" name="inStock" defaultChecked={product?.inStock ?? true} className="size-4 accent-plum" />
            Disponible à la commande
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="size-4 accent-plum" />
            Mettre en avant sur l&apos;accueil
          </label>
        </section>

        {error && (
          <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={pending} className="btn btn-primary flex-1">
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
          <Link href="/admin/bouquets" className="btn btn-outline">
            Annuler
          </Link>
        </div>
        {product && (
          <button type="button" onClick={remove} disabled={pending} className="btn btn-danger btn-sm w-full">
            <Trash2 className="size-4" aria-hidden="true" />
            Supprimer ce bouquet
          </button>
        )}
      </div>
    </form>
  );
}
