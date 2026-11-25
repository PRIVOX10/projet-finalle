import { CheckCircle2, CircleDot, PackageOpen, XCircle } from "lucide-react";
import { STATUS_LABELS, type OrderStatus } from "@/lib/order-status";

const STYLES: Record<OrderStatus, { className: string; Icon: typeof CircleDot }> = {
  nouvelle: { className: "bg-rose-soft text-rose", Icon: CircleDot },
  preparation: { className: "bg-flame-soft text-flame-ink", Icon: PackageOpen },
  livree: { className: "bg-sage-soft text-sage", Icon: CheckCircle2 },
  annulee: { className: "bg-wax-deep text-plum-soft", Icon: XCircle },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { className, Icon } = STYLES[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      <Icon className="size-3.5" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
