import { describe, expect, it } from "vitest";
import { cartSchema, customerSchema, linesSubtotal } from "@/lib/orders";
import { cartCount, cartSubtotal, lineKey, type CartItem } from "@/lib/cart-store";
import { isOrderStatus, orderLabel } from "@/lib/order-status";

const ID = "6aec396c7ddb7073b0d9a150";

const customer = {
  customerName: "Amina Test",
  phone: "0555 12 34 56",
  address: "12 rue des Roses",
  city: "Annaba",
};

describe("customerSchema", () => {
  it("accepte une commande complète et normalise le téléphone", () => {
    const result = customerSchema.parse(customer);
    expect(result.phone).toBe("0555123456");
  });

  it("refuse un téléphone invalide avec un message en français", () => {
    const result = customerSchema.safeParse({ ...customer, phone: "12" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Ce numéro de téléphone n'est pas valide.");
  });

  it("refuse une adresse trop courte", () => {
    const result = customerSchema.safeParse({ ...customer, address: "ici" });
    expect(result.success).toBe(false);
  });

  it("retire les espaces autour des champs", () => {
    expect(customerSchema.parse({ ...customer, city: "  Oran  " }).city).toBe("Oran");
  });
});

describe("cartSchema", () => {
  it("accepte des lignes avec des identifiants valides", () => {
    expect(cartSchema.safeParse([{ productId: ID, sizeId: ID, quantity: 2 }]).success).toBe(true);
  });

  it("accepte une senteur, ou son absence pour les anciens paniers", () => {
    expect(cartSchema.safeParse([{ productId: ID, sizeId: ID, quantity: 1, scent: "Vanille" }]).success).toBe(true);
    expect(cartSchema.parse([{ productId: ID, sizeId: ID, quantity: 1 }])[0].scent).toBeUndefined();
  });

  it("refuse une senteur vide ou démesurée", () => {
    expect(cartSchema.safeParse([{ productId: ID, sizeId: ID, quantity: 1, scent: "  " }]).success).toBe(false);
    expect(cartSchema.safeParse([{ productId: ID, sizeId: ID, quantity: 1, scent: "x".repeat(41) }]).success).toBe(false);
  });

  it("refuse un panier vide", () => {
    expect(cartSchema.safeParse([]).success).toBe(false);
  });

  it("refuse les identifiants qui ne sont pas des ObjectId (injection)", () => {
    const attack = [{ productId: { $ne: null }, sizeId: ID, quantity: 1 }];
    expect(cartSchema.safeParse(attack).success).toBe(false);
    expect(cartSchema.safeParse([{ productId: "abc", sizeId: ID, quantity: 1 }]).success).toBe(false);
  });

  it("refuse les quantités nulles, décimales ou excessives", () => {
    for (const quantity of [0, 1.5, 21, -1]) {
      expect(cartSchema.safeParse([{ productId: ID, sizeId: ID, quantity }]).success).toBe(false);
    }
  });
});

describe("totaux", () => {
  const lines = [
    { unitPrice: 3500, quantity: 2 },
    { unitPrice: 2900, quantity: 1 },
  ];

  it("calcule le sous-total côté serveur", () => {
    expect(linesSubtotal(lines)).toBe(9900);
    expect(linesSubtotal([])).toBe(0);
  });

  it("calcule le même total dans le panier du navigateur", () => {
    const items = lines.map((line, index) => ({ ...line, sizeId: String(index) })) as CartItem[];
    expect(cartSubtotal(items)).toBe(9900);
    expect(cartCount(items)).toBe(3);
  });
});

describe("lignes du panier", () => {
  it("sépare une même taille commandée dans deux senteurs", () => {
    expect(lineKey({ sizeId: "a", scent: "Rose" })).not.toBe(lineKey({ sizeId: "a", scent: "Jasmin" }));
    expect(lineKey({ sizeId: "a", scent: "Rose" })).toBe(lineKey({ sizeId: "a", scent: "Rose" }));
  });
});

describe("statuts de commande", () => {
  it("reconnaît uniquement les quatre statuts prévus", () => {
    expect(isOrderStatus("livree")).toBe(true);
    expect(isOrderStatus("expediee")).toBe(false);
  });

  it("affiche le numéro de commande avec son préfixe", () => {
    expect(orderLabel(1047)).toBe("K-1047");
  });
});
