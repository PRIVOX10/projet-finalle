import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { connectDb } from "@/lib/db";
import { Product } from "@/lib/models";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  await connectDb();
  const products = await Product.find({ published: true }, { slug: 1, updatedAt: 1 }).lean();
  return [
    { url: base },
    { url: `${base}/bouquets` },
    { url: `${base}/contact` },
    ...products.map((product) => ({
      url: `${base}/bouquets/${product.slug}`,
      lastModified: product.updatedAt,
    })),
  ];
}
