"use client";

import { useSyncExternalStore } from "react";

export type CartItem = {
  productId: string;
  sizeId: string;
  slug: string;
  name: string;
  sizeLabel: string;
  scent?: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
};

/** Une même taille dans deux senteurs différentes donne deux lignes distinctes. */
export function lineKey(item: Pick<CartItem, "sizeId" | "scent">) {
  return `${item.sizeId}|${item.scent ?? ""}`;
}

const STORAGE_KEY = "kandili-cart";
const MAX_QUANTITY = 20;
const EMPTY: CartItem[] = [];

let items = EMPTY;
let loaded = false;
let drawerOpen = false;
const listeners = new Set<() => void>();

function read(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as CartItem[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

function commit(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Stockage indisponible : le panier reste valable pour cette visite.
  }
  emit();
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  items = read();
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function getItems() {
  if (!loaded) {
    loaded = true;
    items = read();
  }
  return items;
}

export function useCartItems() {
  return useSyncExternalStore(subscribe, getItems, () => EMPTY);
}

export function useCartDrawer() {
  return useSyncExternalStore(
    subscribe,
    () => drawerOpen,
    () => false,
  );
}

export function cartCount(list: CartItem[]) {
  return list.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotal(list: CartItem[]) {
  return list.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export const cart = {
  snapshot: getItems,
  add(item: CartItem) {
    const current = getItems();
    const existing = current.find((line) => lineKey(line) === lineKey(item));
    commit(
      existing
        ? current.map((line) =>
            line === existing
              ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + item.quantity) }
              : line,
          )
        : [...current, item],
    );
  },
  setQuantity(key: string, quantity: number) {
    commit(
      getItems().map((line) =>
        lineKey(line) === key
          ? { ...line, quantity: Math.max(1, Math.min(MAX_QUANTITY, quantity)) }
          : line,
      ),
    );
  },
  remove(key: string) {
    commit(getItems().filter((line) => lineKey(line) !== key));
  },
  replace(next: CartItem[]) {
    commit(next);
  },
  clear() {
    commit(EMPTY);
  },
  open() {
    drawerOpen = true;
    emit();
  },
  close() {
    drawerOpen = false;
    emit();
  },
};
