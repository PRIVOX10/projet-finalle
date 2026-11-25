import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Nouveau bouquet" };

export default async function NewProductPage() {
  await requireAdmin();
  const { currency } = await getSettings();

  return (
    <div>
      <h1 className="font-display text-3xl">Nouveau bouquet</h1>
      <ProductForm currency={currency} />
    </div>
  );
}
