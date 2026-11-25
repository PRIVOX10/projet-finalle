"use client";

import { useState } from "react";
import type { ProductData } from "@/lib/catalog";
import { cart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { QuantityStepper } from "./QuantityStepper";

export function AddToCart({
  product,
  currency,
  scents,
}: {
  product: ProductData;
  currency: string;
  scents: string[];
}) {
  const [sizeId, setSizeId] = useState(product.sizes[0]?.id);
  const [scent, setScent] = useState(scents[0]);
  const [quantity, setQuantity] = useState(1);
  const size = product.sizes.find((candidate) => candidate.id === sizeId) ?? product.sizes[0];

  if (!size) return null;

  return (
    <div>
      <p className="text-2xl font-semibold">{formatPrice(size.price, currency)}</p>

      <fieldset className="mt-6">
        <legend className="mb-2 text-sm font-semibold">Taille</legend>
        <div className="grid gap-2">
          {product.sizes.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 has-[:checked]:border-plum has-[:checked]:ring-1 has-[:checked]:ring-plum"
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="size"
                  value={option.id}
                  checked={option.id === size.id}
                  onChange={() => setSizeId(option.id)}
                  className="accent-plum"
                />
                {option.label}
              </span>
              <span className="text-sm text-plum-soft">{formatPrice(option.price, currency)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="mb-2 text-sm font-semibold">Senteur</legend>
        <div className="flex flex-wrap gap-2">
          {scents.map((option) => (
            <label key={option} className="chip cursor-pointer has-[:checked]:border-plum has-[:checked]:bg-plum has-[:checked]:text-wax has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-rose">
              <input
                type="radio"
                name="scent"
                value={option}
                checked={option === scent}
                onChange={() => setScent(option)}
                className="sr-only"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      {product.inStock ? (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <QuantityStepper label="Quantité" value={quantity} onChange={setQuantity} />
          <button
            type="button"
            className="btn btn-primary flex-1"
            onClick={() => {
              cart.add({
                productId: product.id,
                sizeId: size.id,
                slug: product.slug,
                name: product.name,
                sizeLabel: size.label,
                scent,
                imageUrl: product.images[0]?.url ?? null,
                unitPrice: size.price,
                quantity,
              });
              cart.open();
            }}
          >
            Ajouter au panier
          </button>
        </div>
      ) : (
        <p className="mt-6 rounded-xl bg-wax-deep px-4 py-3 font-semibold">
          Ce bouquet est épuisé pour le moment.
        </p>
      )}
    </div>
  );
}
