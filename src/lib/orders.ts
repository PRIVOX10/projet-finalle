import "server-only";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { connectDb } from "./db";
import { Counter, Order, Product, type ProductDoc } from "./models";
import { normalizePhone } from "./phone";
import { getSettings } from "./settings";

// Les numéros de commande démarrent à 1001.
const ORDER_NUMBER_OFFSET = 1000;

const objectId = z.string().regex(/^[a-f\d]{24}$/i);

const lineSchema = z.object({
  productId: objectId,
  sizeId: objectId,
  quantity: z.number().int().min(1).max(20),
  // Absente des paniers créés avant l'ajout des senteurs : la première est alors retenue.
  scent: z.string().trim().min(1).max(40).optional(),
});

export const cartSchema = z.array(lineSchema).min(1).max(30);

export type CartLineInput = z.infer<typeof lineSchema>;

export const customerSchema = z.object({
  customerName: z.string().trim().min(2, "Indiquez votre nom complet.").max(80),
  phone: z
    .string()
    .trim()
    .transform((value, ctx) => {
      const phone = normalizePhone(value);
      if (!phone) {
        ctx.addIssue({ code: "custom", message: "Ce numéro de téléphone n'est pas valide." });
        return z.NEVER;
      }
      return phone;
    }),
  address: z.string().trim().min(5, "Indiquez une adresse de livraison complète.").max(200),
  city: z.string().trim().min(2, "Indiquez votre ville ou wilaya.").max(80),
  note: z.string().trim().max(500, "500 caractères maximum.").optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export type PricedLine = {
  productId: string;
  sizeId: string;
  slug: string;
  name: string;
  sizeLabel: string;
  scent: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
};

/**
 * Relit prix et disponibilité en base. Le contenu du panier vient du navigateur :
 * seuls les identifiants et quantités en sont conservés.
 */
export async function priceLines(lines: CartLineInput[]) {
  await connectDb();
  const { scents } = await getSettings();
  const products = await Product.find({
    _id: { $in: lines.map((line) => line.productId) },
    published: true,
    inStock: true,
  }).lean<ProductDoc[]>();
  const byId = new Map(products.map((product) => [String(product._id), product]));

  const priced: PricedLine[] = [];
  for (const line of lines) {
    const product = byId.get(line.productId);
    const size = product?.sizes.find((candidate) => String(candidate._id) === line.sizeId);
    const scent = line.scent ?? scents[0];
    // Une senteur retirée de la liste entre-temps invalide la ligne.
    if (!product || !size || !scents.includes(scent)) continue;
    priced.push({
      productId: line.productId,
      sizeId: line.sizeId,
      slug: product.slug,
      name: product.name,
      sizeLabel: size.label,
      scent,
      imageUrl: product.images[0]?.url ?? null,
      unitPrice: size.price,
      quantity: line.quantity,
    });
  }
  return priced;
}

export function linesSubtotal(lines: { unitPrice: number; quantity: number }[]) {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
}

async function nextOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { _id: "order" },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  ).lean();
  return ORDER_NUMBER_OFFSET + (counter?.seq ?? 1);
}

export async function createOrder(customer: CustomerInput, lines: PricedLine[]) {
  await connectDb();
  const { deliveryFee } = await getSettings();
  const subtotal = linesSubtotal(lines);

  return Order.create({
    ...customer,
    note: customer.note || null,
    number: await nextOrderNumber(),
    publicToken: randomBytes(18).toString("base64url"),
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    items: lines.map((line) => ({
      productId: line.productId,
      sizeId: line.sizeId,
      productName: line.name,
      sizeLabel: line.sizeLabel,
      scent: line.scent,
      imageUrl: line.imageUrl,
      unitPrice: line.unitPrice,
      quantity: line.quantity,
    })),
  });
}
