import Link from "next/link";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { getDashboard } from "@/lib/dashboard";
import { formatDateTime, formatPrice } from "@/lib/format";
import { orderLabel } from "@/lib/order-status";
import { getSettings } from "@/lib/settings";

function Stat({ label, value, href }: { label: string; value: string; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-plum-soft">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </>
  );
  return href ? (
    <Link href={href} className="card block p-4 hover:border-plum-soft">
      {body}
    </Link>
  ) : (
    <div className="card p-4">{body}</div>
  );
}

export default async function DashboardPage() {
  await requireAdmin();
  const [data, settings] = await Promise.all([getDashboard(), getSettings()]);
  const { currency } = settings;
  const topRevenue = data.topProducts[0]?.revenue ?? 1;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Tableau de bord</h1>

      {!settings.whatsapp && (
        <p className="rounded-xl bg-flame-soft px-4 py-3 text-sm">
          Le bouton WhatsApp est masqué sur le site tant que votre numéro n&apos;est pas renseigné.{" "}
          <Link href="/admin/reglages" className="font-semibold underline underline-offset-2">
            Ajouter mon numéro
          </Link>
        </p>
      )}

      <section className="card p-5" aria-labelledby="sales-title">
        <h2 id="sales-title" className="text-sm text-plum-soft">
          Ventes des 30 derniers jours
        </h2>
        <p className="mt-1 text-5xl font-semibold tracking-tight">{formatPrice(data.revenue, currency)}</p>
        {data.change !== null && (
          <p className="mt-1 text-sm text-plum-soft">
            {data.change >= 0 ? "+" : "−"}
            {Math.abs(Math.round(data.change * 100))} % par rapport aux 30 jours précédents
          </p>
        )}
        <p className="mb-5 mt-1 text-sm text-plum-soft">Commandes annulées non comptées.</p>
        <RevenueChart points={data.series} currency={currency} />
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Chiffres clés">
        <Stat label="À traiter" value={String(data.statusCounts.nouvelle)} href="/admin/commandes?statut=nouvelle" />
        <Stat label="En préparation" value={String(data.statusCounts.preparation)} href="/admin/commandes?statut=preparation" />
        <Stat label="Commandes (30 j)" value={String(data.count)} />
        <Stat label="Panier moyen" value={formatPrice(data.average, currency)} />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section className="card p-5" aria-labelledby="recent-title">
          <div className="flex items-center justify-between">
            <h2 id="recent-title" className="font-display text-xl">
              Dernières commandes
            </h2>
            <Link href="/admin/commandes" className="text-sm underline underline-offset-4">
              Tout voir
            </Link>
          </div>
          {data.recent.length === 0 ? (
            <p className="mt-4 text-sm text-plum-soft">Aucune commande pour l&apos;instant.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {data.recent.map((order) => (
                <li key={String(order._id)}>
                  <Link href={`/admin/commandes/${order._id}`} className="flex items-center justify-between gap-3 py-3 hover:opacity-75">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {orderLabel(order.number)} · {order.customerName}
                      </p>
                      <p className="text-xs text-plum-soft">
                        {order.city} · {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm font-semibold">{formatPrice(order.total, currency)}</span>
                      <StatusBadge status={order.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5" aria-labelledby="top-title">
          <h2 id="top-title" className="font-display text-xl">
            Meilleures ventes
          </h2>
          <p className="text-sm text-plum-soft">Sur 30 jours</p>
          {data.topProducts.length === 0 ? (
            <p className="mt-4 text-sm text-plum-soft">Pas encore de ventes sur la période.</p>
          ) : (
            <ol className="mt-4 space-y-4">
              {data.topProducts.map((product) => (
                <li key={product.name}>
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="truncate">{product.name}</span>
                    <span className="shrink-0 font-semibold">{formatPrice(product.revenue, currency)}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-wax-deep">
                    <div
                      className="h-2 rounded-full bg-rose"
                      style={{ width: `${(product.revenue / topRevenue) * 100}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-plum-soft">
                    {product.quantity} vendu{product.quantity > 1 ? "s" : ""}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
