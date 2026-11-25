"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, X } from "lucide-react";
import { cart, cartSubtotal, lineKey, useCartDrawer, useCartItems } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { QuantityStepper } from "./QuantityStepper";

export function CartDrawer({ currency }: { currency: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const open = useCartDrawer();
  const items = useCartItems();

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      aria-label="Panier"
      onClose={cart.close}
      onClick={(event) => {
        if (event.target === dialog.current) cart.close();
      }}
      className="fixed inset-y-0 left-auto right-0 m-0 h-dvh max-h-none w-full max-w-md bg-surface text-plum"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-xl">Votre panier</h2>
          <button
            type="button"
            onClick={cart.close}
            aria-label="Fermer le panier"
            className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-wax-deep"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="text-plum-soft">Votre panier est vide pour le moment.</p>
            <Link href="/bouquets" onClick={cart.close} className="btn btn-primary">
              Voir les bouquets
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((item) => (
                <li key={lineKey(item)} className="flex gap-4 py-4">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-wax-deep">
                    {item.imageUrl && (
                      <Image src={item.imageUrl} alt="" fill sizes="80px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/bouquets/${item.slug}`}
                      onClick={cart.close}
                      className="font-display text-base hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-plum-soft">
                      {item.sizeLabel}
                      {item.scent && ` · ${item.scent}`}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold">
                      {formatPrice(item.unitPrice * item.quantity, currency)}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <QuantityStepper
                        label={`Quantité de ${item.name}`}
                        value={item.quantity}
                        onChange={(next) => cart.setQuantity(lineKey(item), next)}
                      />
                      <button
                        type="button"
                        onClick={() => cart.remove(lineKey(item))}
                        aria-label={`Retirer ${item.name} du panier`}
                        className="grid size-10 cursor-pointer place-items-center rounded-full text-plum-soft hover:bg-wax-deep"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="border-t border-line px-5 py-4">
              <div className="mb-3 flex items-baseline justify-between">
                <span className="text-plum-soft">Sous-total</span>
                <span className="text-lg font-semibold">{formatPrice(cartSubtotal(items), currency)}</span>
              </div>
              <Link href="/commander" onClick={cart.close} className="btn btn-primary w-full">
                Commander
              </Link>
              <p className="mt-2 text-center text-sm text-plum-soft">Paiement à la livraison</p>
            </footer>
          </>
        )}
      </div>
    </dialog>
  );
}
