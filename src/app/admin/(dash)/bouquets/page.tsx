import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { toProductData } from "@/lib/catalog";
import { connectDb } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { Product, type ProductDoc } from "@/lib/models";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Bouquets" };

export default async function AdminProductsPage() {
  await requireAdmin();
  await connectDb();
  const [docs, { currency }] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).lean<ProductDoc[]>(),
    getSettings(),
  ]);
  const products = docs.map(toProductData);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">Bouquets</h1>
        <Link href="/admin/bouquets/nouveau" className="btn btn-primary btn-sm">
          <Plus className="size-4" aria-hidden="true" />
          Ajouter un bouquet
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="card mt-4 p-8 text-center text-plum-soft">
          Aucun bouquet. Ajoutez le premier pour remplir votre boutique.
        </p>
      ) : (
        <ul className="card mt-4 divide-y divide-line">
          {products.map((product) => (
            <li key={product.id}>
              <Link href={`/admin/bouquets/${product.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-wax">
                <div className="relative h-16 w-13 shrink-0 overflow-hidden rounded-lg bg-wax-deep">
                  {product.images[0] && (
                    <Image src={product.images[0].url} alt="" fill sizes="52px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{product.name}</p>
                  <p className="truncate text-sm text-plum-soft">
                    {product.flowerType} · {product.color} · dès {formatPrice(product.basePrice, currency)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs font-semibold sm:flex-row sm:items-center">
                  {product.featured && <span className="rounded-full bg-rose-soft px-2.5 py-1 text-rose">Mis en avant</span>}
                  {!product.inStock && <span className="rounded-full bg-flame-soft px-2.5 py-1 text-flame-ink">Épuisé</span>}
                  {!product.published && <span className="rounded-full bg-wax-deep px-2.5 py-1 text-plum-soft">Masqué</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
