"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  cartSchema,
  createOrder,
  customerSchema,
  linesSubtotal,
  priceLines,
  type PricedLine,
} from "@/lib/orders";
import { clientIp, consumeLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/settings";

const HOUR = 60 * 60 * 1000;

/** Remet le panier du navigateur à jour : prix actuels, articles encore disponibles. */
export async function syncCart(raw: unknown): Promise<PricedLine[]> {
  const parsed = cartSchema.safeParse(raw);
  return parsed.success ? priceLines(parsed.data) : [];
}

export type PlaceOrderResult =
  | { ok: true; token: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
      lines?: PricedLine[];
    };

const orderSchema = z.object({
  customer: customerSchema,
  lines: cartSchema,
  expectedTotal: z.number().int().nonnegative(),
  // Champ invisible : seul un robot le remplit.
  website: z.string().max(0).optional(),
});

export async function placeOrder(raw: unknown): Promise<PlaceOrderResult> {
  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) {
    const customerErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "customer" && typeof issue.path[1] === "string") {
        (customerErrors[issue.path[1]] ??= []).push(issue.message);
      }
    }
    return {
      ok: false,
      error: "Vérifiez les champs signalés.",
      fieldErrors: customerErrors,
    };
  }

  const ip = await clientIp();
  if (!(await consumeLimit(`order:${ip}`, 10, HOUR))) {
    return {
      ok: false,
      error: "Trop de commandes en peu de temps. Réessayez plus tard ou contactez-nous.",
    };
  }

  const { customer, lines, expectedTotal } = parsed.data;
  const priced = await priceLines(lines);
  const { deliveryFee } = await getSettings();
  const total = linesSubtotal(priced) + deliveryFee;

  if (priced.length !== lines.length || total !== expectedTotal) {
    return {
      ok: false,
      error: "Votre panier a changé (prix ou disponibilité). Vérifiez-le avant de confirmer.",
      lines: priced,
    };
  }

  const order = await createOrder(customer, priced);
  revalidatePath("/admin", "layout");
  return { ok: true, token: order.publicToken };
}
