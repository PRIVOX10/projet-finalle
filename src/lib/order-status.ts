export const ORDER_STATUSES = ["nouvelle", "preparation", "livree", "annulee"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  nouvelle: "Nouvelle",
  preparation: "En préparation",
  livree: "Livrée",
  annulee: "Annulée",
};

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as readonly string[]).includes(value);
}

export function orderLabel(number: number) {
  return `K-${number}`;
}
