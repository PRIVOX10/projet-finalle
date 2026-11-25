import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import type { QueryFilter } from "mongoose";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { formatDateTime, formatPrice } from "@/lib/format";
import { Order, type OrderDoc } from "@/lib/models";
import { ORDER_STATUSES, STATUS_LABELS, isOrderStatus, orderLabel } from "@/lib/order-status";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Commandes" };

const PAGE_SIZE = 20;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type Params = { statut?: string; q?: string; page?: string };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireAdmin();
  const params = await searchParams;
  const status = params.statut && isOrderStatus(params.statut) ? params.statut : undefined;
  const query = typeof params.q === "string" ? params.q.trim().slice(0, 60) : "";
  const page = Math.max(1, Number(params.page) || 1);

  const filter: QueryFilter<OrderDoc> = {};
  if (status) filter.status = status;
  if (query) {
    const pattern = new RegExp(escapeRegex(query), "i");
    const number = Number(query.replace(/^k-/i, ""));
    filter.$or = [
      { customerName: pattern },
      { phone: pattern },
      { city: pattern },
      ...(Number.isInteger(number) && number > 0 ? [{ number }] : []),
    ];
  }

  await connectDb();
  const [orders, total, counts, { currency }] = await Promise.all([
    Order.find(filter, { number: 1, customerName: 1, phone: 1, city: 1, total: 1, status: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Order.countDocuments(filter),
    Order.aggregate<{ _id: string; count: number }>([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    getSettings(),
  ]);
  const countFor = (key: string) => counts.find((row) => row._id === key)?.count ?? 0;
  const allCount = counts.reduce((sum, row) => sum + row.count, 0);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const href = (next: Params) => {
    const search = new URLSearchParams();
    const merged = { statut: status, q: query || undefined, ...next };
    for (const [key, value] of Object.entries(merged)) if (value) search.set(key, value);
    const text = search.toString();
    return text ? `/admin/commandes?${text}` : "/admin/commandes";
  };

  return (
    <div>
      <h1 className="font-display text-3xl">Commandes</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={href({ statut: undefined })} aria-current={!status} className="chip">
          Toutes <span className="opacity-60">{allCount}</span>
        </Link>
        {ORDER_STATUSES.map((key) => (
          <Link key={key} href={href({ statut: key })} aria-current={status === key} className="chip">
            {STATUS_LABELS[key]} <span className="opacity-60">{countFor(key)}</span>
          </Link>
        ))}
      </div>

      <Form action="/admin/commandes" className="mt-3 flex gap-2">
        {status && <input type="hidden" name="statut" value={status} />}
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Nom, téléphone, ville ou numéro"
          aria-label="Rechercher une commande"
          className="field max-w-sm"
        />
        <button type="submit" className="btn btn-outline">
          Chercher
        </button>
      </Form>

      {orders.length === 0 ? (
        <p className="card mt-4 p-8 text-center text-plum-soft">Aucune commande trouvée.</p>
      ) : (
        <ul className="card mt-4 divide-y divide-line">
          {orders.map((order) => (
            <li key={String(order._id)}>
              <Link
                href={`/admin/commandes/${order._id}`}
                className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-wax sm:grid-cols-[5rem_1fr_7rem_8rem_8rem]"
              >
                <span className="text-sm font-semibold">{orderLabel(order.number)}</span>
                <span className="order-3 min-w-0 sm:order-none">
                  <span className="block truncate text-sm font-semibold">{order.customerName}</span>
                  <span className="block truncate text-xs text-plum-soft">
                    {order.city} · {order.phone}
                  </span>
                </span>
                <span className="hidden text-xs text-plum-soft sm:block">{formatDateTime(order.createdAt)}</span>
                <span className="order-4 text-right text-sm font-semibold tabular-nums sm:order-none">
                  {formatPrice(order.total, currency)}
                </span>
                <span className="justify-self-end">
                  <StatusBadge status={order.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={href({ page: String(page - 1) })} className="btn btn-outline btn-sm">
              Précédent
            </Link>
          ) : (
            <span />
          )}
          <span className="text-plum-soft">
            Page {page} sur {pages}
          </span>
          {page < pages ? (
            <Link href={href({ page: String(page + 1) })} className="btn btn-outline btn-sm">
              Suivant
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
