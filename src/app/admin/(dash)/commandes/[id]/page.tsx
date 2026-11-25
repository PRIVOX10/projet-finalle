import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { ArrowLeft, MessageCircle, Phone } from "lucide-react";
import { updateOrderStatus } from "@/app/actions/admin";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { formatDateTime, formatPrice } from "@/lib/format";
import { Order } from "@/lib/models";
import { ORDER_STATUSES, STATUS_LABELS, orderLabel } from "@/lib/order-status";
import { formatPhone, whatsAppLink } from "@/lib/phone";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Commande" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  await connectDb();
  const [order, { currency }] = await Promise.all([Order.findById(id).lean(), getSettings()]);
  if (!order) notFound();

  const reference = orderLabel(order.number);
  const message = `Bonjour ${order.customerName}, ici Kandili. Je vous contacte au sujet de votre commande ${reference}.`;

  return (
    <div>
      <Link href="/admin/commandes" className="inline-flex items-center gap-2 text-sm text-plum-soft hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Commandes
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">Commande {reference}</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="text-sm text-plum-soft">Reçue le {formatDateTime(order.createdAt)}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="card h-fit p-5" aria-labelledby="items-title">
          <h2 id="items-title" className="font-display text-xl">
            Bouquets
          </h2>
          <ul className="mt-2 divide-y divide-line">
            {order.items.map((item, index) => (
              <li key={index} className="flex items-center gap-3 py-3">
                <div className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-wax-deep">
                  {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="52px" className="object-cover" />}
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-plum-soft">
                    {item.sizeLabel} · {item.quantity} × {formatPrice(item.unitPrice, currency)}
                  </p>
                  {item.scent && (
                    <p className="mt-0.5 font-semibold text-rose">Senteur : {item.scent}</p>
                  )}
                </div>
                <p className="text-sm font-semibold">{formatPrice(item.unitPrice * item.quantity, currency)}</p>
              </li>
            ))}
          </ul>
          <dl className="space-y-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-plum-soft">Sous-total</dt>
              <dd>{formatPrice(order.subtotal, currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-plum-soft">Livraison</dt>
              <dd>{formatPrice(order.deliveryFee, currency)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <dt>À encaisser à la livraison</dt>
              <dd>{formatPrice(order.total, currency)}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-6">
          <section className="card p-5" aria-labelledby="customer-title">
            <h2 id="customer-title" className="font-display text-xl">
              Client
            </h2>
            <p className="mt-2 font-semibold">{order.customerName}</p>
            <p className="text-sm">{formatPhone(order.phone)}</p>
            <p className="mt-2 text-sm text-plum-soft">
              {order.address}
              <br />
              {order.city}
            </p>
            {order.note && (
              <p className="mt-3 whitespace-pre-line rounded-xl bg-wax-deep px-3 py-2 text-sm">{order.note}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:${order.phone}`} className="btn btn-outline btn-sm">
                <Phone className="size-4" aria-hidden="true" />
                Appeler
              </a>
              <a href={whatsAppLink(order.phone, message)} rel="noopener" className="btn btn-whatsapp btn-sm">
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp
              </a>
            </div>
          </section>

          <section className="card p-5" aria-labelledby="status-title">
            <h2 id="status-title" className="font-display text-xl">
              Statut
            </h2>
            <div className="mt-3 grid gap-2">
              {ORDER_STATUSES.map((status) => (
                <form key={status} action={updateOrderStatus.bind(null, String(order._id), status)}>
                  <button
                    type="submit"
                    disabled={order.status === status}
                    aria-current={order.status === status}
                    className="btn btn-sm btn-outline w-full aria-[current=true]:border-plum aria-[current=true]:bg-plum aria-[current=true]:text-wax aria-[current=true]:opacity-100"
                  >
                    {STATUS_LABELS[status]}
                  </button>
                </form>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
