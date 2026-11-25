import "server-only";
import type { QueryFilter, SortOrder } from "mongoose";
import { connectDb } from "./db";
import { Product, type ProductDoc } from "./models";

/** Forme simple d'un bouquet, sérialisable vers les composants client. */
export type ProductData = {
  id: string;
  slug: string;
  name: string;
  description: string;
  color: string;
  flowerType: string;
  shape: string;
  basePrice: number;
  featured: boolean;
  published: boolean;
  inStock: boolean;
  sizes: { id: string; label: string; price: number }[];
  images: { url: string; uploadId: string | null }[];
};

export function toProductData(doc: ProductDoc): ProductData {
  return {
    id: String(doc._id),
    slug: doc.slug,
    name: doc.name,
    description: doc.description,
    color: doc.color,
    flowerType: doc.flowerType,
    shape: doc.shape ?? "Dôme",
    basePrice: doc.basePrice,
    featured: doc.featured,
    published: doc.published,
    inStock: doc.inStock,
    sizes: doc.sizes.map((size) => ({ id: String(size._id), label: size.label, price: size.price })),
    images: doc.images.map((image) => ({
      url: image.url,
      uploadId: image.uploadId ? String(image.uploadId) : null,
    })),
  };
}

export const SORTS = {
  recent: { label: "Nouveautés", field: "createdAt", direction: -1 },
  "prix-asc": { label: "Prix croissant", field: "basePrice", direction: 1 },
  "prix-desc": { label: "Prix décroissant", field: "basePrice", direction: -1 },
} as const satisfies Record<string, { label: string; field: string; direction: SortOrder }>;

export type SortKey = keyof typeof SORTS;

export type CatalogFilters = {
  colors: string[];
  flowers: string[];
  shapes: string[];
  min?: number;
  max?: number;
  sort: SortKey;
};

export async function getFeatured(limit = 4) {
  await connectDb();
  const docs = await Product.find({ published: true, featured: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<ProductDoc[]>();
  return docs.map(toProductData);
}

export async function getCatalog({ colors, flowers, shapes, min, max, sort }: CatalogFilters) {
  await connectDb();
  const filter: QueryFilter<ProductDoc> = { published: true };
  if (colors.length) filter.color = { $in: colors };
  if (flowers.length) filter.flowerType = { $in: flowers };
  if (shapes.length) filter.shape = { $in: shapes };
  if (min !== undefined || max !== undefined) {
    filter.basePrice = {
      ...(min !== undefined ? { $gte: min } : {}),
      ...(max !== undefined ? { $lte: max } : {}),
    };
  }
  const { field, direction } = SORTS[sort];
  const docs = await Product.find(filter)
    .sort({ inStock: -1, [field]: direction })
    .lean<ProductDoc[]>();
  return docs.map(toProductData);
}

async function countBy(field: "color" | "flowerType" | "shape") {
  const rows = await Product.aggregate<{ _id: string; count: number }>([
    { $match: { published: true } },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return rows.map((row) => ({ value: row._id, count: row.count }));
}

export async function getFacets() {
  await connectDb();
  const [colors, flowers, shapes, price] = await Promise.all([
    countBy("color"),
    countBy("flowerType"),
    countBy("shape"),
    Product.aggregate<{ min: number; max: number }>([
      { $match: { published: true } },
      { $group: { _id: null, min: { $min: "$basePrice" }, max: { $max: "$basePrice" } } },
    ]),
  ]);
  return { colors, flowers, shapes, minPrice: price[0]?.min ?? 0, maxPrice: price[0]?.max ?? 0 };
}

export async function getProductBySlug(slug: string) {
  await connectDb();
  const doc = await Product.findOne({ slug, published: true }).lean<ProductDoc>();
  return doc ? toProductData(doc) : null;
}

export async function getRelated(product: ProductData, limit = 4) {
  await connectDb();
  const docs = await Product.find({
    published: true,
    inStock: true,
    _id: { $ne: product.id },
    $or: [{ color: product.color }, { flowerType: product.flowerType }],
  })
    .limit(limit)
    .lean<ProductDoc[]>();
  return docs.map(toProductData);
}
