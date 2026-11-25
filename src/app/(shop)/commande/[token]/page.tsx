import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { connectDb } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/format";
import { Order } from "@/lib/models";
import { STATUS_LABELS, orderLabel } from "@/lib/order-status";
import { whatsAppLink } from "@/lib/phone";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Votre commande", robots: { index: false } };

const STEPS = ["nouvelle", "preparation", "livree"] as const;

export default async function OrderPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await connectDb();
  const [order, settings] = await Promise.all([
    Order.findOne({ publicToken: String(token) }).lean(),
    getSettings(),
  ]);
  if (!order) notFound();

  const reference = orderLabel(order.number);
  const cancelled = order.status === "annulee";
  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <main className="mx-auto max-w-2xl px-4 pt-10 sm:px-6">
      <p className="font-semibold text-rose">Commande {reference}</p>
      <h1 className="mt-1 font-display text-4xl sm:text-5xl">
        {cancelled ? "Commande annulée" : `Merci, ${order.customerName.split(" ")[0]} !`}
      </h1>
      {!cancelled && (
        <p className="mt-3 text-plum-soft">
          Votre commande est bien enregistrée. Nous vous appelons au {order.phone} pour confirmer la
          livraison. Gardez cette page : elle indique où en est votre bouquet.
        </p>
      )}

      {!cancelled && (
        <ol className="mt-8 grid grid-cols-3 gap-2">
          {STEPS.map((step, index) => {
            const done = index <= stepIndex;
            return (
              <li key={step} aria-current={index === stepIndex ? "step" : undefined}>
                <div className={`h-1.5 rounded-full ${done ? "bg-rose" : "bg-line"}`} />
                <p className={`mt-2 flex items-center gap-1 text-sm ${done ? "font-semibold" : "text-plum-soft"}`}>
                  {done && <Check className="size-4 shrink-0" aria-hidden="true" />}
                  {STATUS_LABELS[step]}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      <section className="card mt-8 p-5" aria-label="Détail de la commande">
        <ul className="divide-y divide-line">
          {order.items.map((item, index) => (
            <li key={index} className="flex gap-3 py-3 first:pt-0">
              <div className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-wax-deep">
                {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="52px" className="object-cover" />}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-semibold">
                  {item.productName} × {item.quantity}
                </p>
                <p className="text-plum-soft">
                  {item.sizeLabel}
                  {item.scent && ` · ${item.scent}`}
                </p>
              </div>
              <p className="text-sm font-semibold">{formatPrice(item.unitPrice * item.quantity, settings.currency)}</p>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-line pt-3 font-semibold">
          <span>Total à payer à la livraison</span>
          <span>{formatPrice(order.total, settings.currency)}</span>
        </div>
        <p className="mt-3 text-sm text-plum-soft">
          Passée le {formatDate(order.createdAt)}. Livraison : {order.address}, {order.city}.
        </p>
      </section>

      {settings.whatsapp && (
        <a
          href={whatsAppLink(settings.whatsapp, `Bonjour, je vous écris au sujet de ma commande ${reference}.`)}
          rel="noopener"
          className="btn btn-whatsapp mt-6"
        >
          Une question ? Écrivez-nous sur WhatsApp
        </a>
      )}
    </main>
  );
}
