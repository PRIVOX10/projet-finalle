"use client";

import { ShoppingBag } from "lucide-react";
import { cart, cartCount, useCartItems } from "@/lib/cart-store";

export function CartButton() {
  const count = cartCount(useCartItems());

  return (
    <button
      type="button"
      onClick={cart.open}
      aria-label={count ? `Ouvrir le panier, ${count} article${count > 1 ? "s" : ""}` : "Ouvrir le panier"}
      className="relative grid size-11 cursor-pointer place-items-center rounded-full hover:bg-wax-deep"
    >
      <ShoppingBag className="size-5" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 grid min-w-5 place-items-center rounded-full bg-rose px-1 text-xs font-semibold leading-5 text-on-rose">
          {count}
        </span>
      )}
    </button>
  );
}
