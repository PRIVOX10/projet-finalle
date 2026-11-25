import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/auth";
import { toProductData } from "@/lib/catalog";
import { connectDb } from "@/lib/db";
import { Product, type ProductDoc } from "@/lib/models";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Modifier le bouquet" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();

  await connectDb();
  const [doc, { currency }] = await Promise.all([Product.findById(id).lean<ProductDoc>(), getSettings()]);
  if (!doc) notFound();
  const product = toProductData(doc);

  return (
    <div>
      <h1 className="font-display text-3xl">{product.name}</h1>
      <ProductForm key={product.id} product={product} currency={currency} />
    </div>
  );
}
