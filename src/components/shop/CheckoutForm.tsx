"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { placeOrder, syncCart } from "@/app/actions/order";
import { cart, cartSubtotal, lineKey, useCartItems } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

type FieldErrors = Record<string, string[] | undefined>;

function Field({
  name,
  label,
  errors,
  ...input
}: {
  name: string;
  label: string;
  errors: FieldErrors;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const error = errors[name]?.[0];
  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        required
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className="field"
        {...input}
      />
      {error && (
        <p id={`${name}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function CheckoutForm({ currency, deliveryFee }: { currency: string; deliveryFee: number }) {
  const router = useRouter();
  const items = useCartItems();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [placed, setPlaced] = useState(false);

  const subtotal = cartSubtotal(items);
  const total = subtotal + deliveryFee;

  // Le panier peut dater : on affiche d'emblée les prix actuels.
  const cartKey = items.map(lineKey).join(",");
  useEffect(() => {
    if (!cartKey) return;
    const current = cart.snapshot();
    syncCart(current.map(({ productId, sizeId, quantity, scent }) => ({ productId, sizeId, quantity, scent })))
      .then((fresh) => {
        const changed =
          fresh.length !== current.length ||
          fresh.some(
            (line, index) => line.unitPrice !== current[index]?.unitPrice || line.scent !== current[index]?.scent,
          );
        if (changed) cart.replace(fresh);
      })
      .catch(() => {
        // Le serveur revérifie de toute façon à la confirmation.
      });
  }, [cartKey]);

  if (items.length === 0 && !placed) {
    return (
      <div className="py-16 text-center">
        <p className="text-plum-soft">Votre panier est vide.</p>
        <Link href="/bouquets" className="btn btn-primary mt-4">
          Voir les bouquets
        </Link>
      </div>
    );
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      try {
        const result = await placeOrder({
          customer: {
            customerName: data.get("customerName"),
            phone: data.get("phone"),
            address: data.get("address"),
            city: data.get("city"),
            note: data.get("note") || undefined,
          },
          lines: items.map(({ productId, sizeId, quantity, scent }) => ({ productId, sizeId, quantity, scent })),
          expectedTotal: total,
          website: data.get("website") || undefined,
        });

        if (result.ok) {
          setPlaced(true);
          router.push(`/commande/${result.token}`);
          cart.clear();
          return;
        }
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        if (result.lines) cart.replace(result.lines);
      } catch {
        setError("La commande n'a pas pu être envoyée. Vérifiez votre connexion et réessayez.");
      }
    });
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:gap-12">
      <div className="grid content-start gap-4">
        <Field name="customerName" label="Nom complet" autoComplete="name" errors={fieldErrors} />
        <Field name="phone" label="Téléphone" type="tel" autoComplete="tel" placeholder="05 55 12 34 56" errors={fieldErrors} />
        <Field name="address" label="Adresse de livraison" autoComplete="street-address" errors={fieldErrors} />
        <Field name="city" label="Ville ou wilaya" autoComplete="address-level2" errors={fieldErrors} />
        <div>
          <label htmlFor="note" className="field-label">
            Message <span className="font-normal text-plum-soft">(facultatif)</span>
          </label>
          <textarea id="note" name="note" rows={3} maxLength={500} className="field" />
        </div>
        {/* Piège à robots, invisible pour les visiteurs. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      </div>

      <aside className="card h-fit p-5" aria-label="Récapitulatif">
        <h2 className="font-display text-xl">Récapitulatif</h2>
        <ul className="mt-3 divide-y divide-line">
          {items.map((item) => (
            <li key={lineKey(item)} className="flex gap-3 py-3">
              <div className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-wax-deep">
                {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="52px" className="object-cover" />}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold">
                  {item.name} × {item.quantity}
                </p>
                <p className="text-plum-soft">
                  {item.sizeLabel}
                  {item.scent && ` · ${item.scent}`}
                </p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(item.unitPrice * item.quantity, currency)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-2 space-y-1 border-t border-line pt-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-plum-soft">Sous-total</dt>
            <dd>{formatPrice(subtotal, currency)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-plum-soft">Livraison</dt>
            <dd>{deliveryFee > 0 ? formatPrice(deliveryFee, currency) : "Confirmée par téléphone"}</dd>
          </div>
          <div className="flex justify-between pt-1 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(total, currency)}</dd>
          </div>
        </dl>
        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn btn-primary mt-4 w-full">
          {pending ? "Envoi en cours…" : "Confirmer la commande"}
        </button>
        <p className="mt-2 text-center text-sm text-plum-soft">Vous payez à la livraison.</p>
      </aside>
    </form>
  );
}
