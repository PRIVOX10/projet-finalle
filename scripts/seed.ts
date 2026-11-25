import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDb } from "../src/lib/db";
import { Admin, Counter, Order, Product, type ProductDoc } from "../src/lib/models";
import type { OrderStatus } from "../src/lib/order-status";

type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  color: string;
  flowerType: string;
  shape?: string;
  sizes: [string, number][];
  photos: string[];
  featured?: boolean;
};

const three = (small: number, medium: number, large: number): [string, number][] => [
  ["Petit", small],
  ["Moyen", medium],
  ["Grand", large],
];

// Modèles d'exposition : les photos viennent du compte Instagram @kandili._.
// Les noms, tailles et prix sont provisoires, à remplacer par les vrais.
const PRODUCTS: SeedProduct[] = [
  {
    slug: "rose-poudree",
    name: "Rose Poudrée",
    description:
      "Un dôme généreux de roses de cire rose poudré et ivoire, relevé de gypsophile rose et de sphères dorées. Au centre, une grande rose et un cœur en cire.",
    color: "Rose",
    flowerType: "Rose",
    sizes: three(3500, 5500, 7900),
    photos: ["rose-poudree-1"],
    featured: true,
  },
  {
    slug: "nuit-mauve",
    name: "Nuit Mauve",
    description:
      "Une rose mauve filetée d'or entourée de pivoines, d'un cœur ivoire et d'un coquillage en cire. La gypsophile violette et les sphères dorées lui donnent un air de fête.",
    color: "Mauve",
    flowerType: "Rose",
    sizes: three(3500, 5500, 7900),
    photos: ["nuit-mauve-1", "nuit-mauve-2"],
    featured: true,
  },
  {
    slug: "bleu-celeste",
    name: "Bleu Céleste",
    description:
      "Des roses bleu ciel et ivoire, un cœur en cire et des sphères argentées, sur un nuage de gypsophile bleu nuit. Une composition rare et apaisante.",
    color: "Bleu",
    flowerType: "Rose",
    sizes: three(3500, 5500, 7900),
    photos: ["bleu-celeste-1"],
    featured: true,
  },
  {
    slug: "eclat-agrume",
    name: "Éclat d'Agrume",
    description:
      "Des roses et des dahlias orange vif mêlés à l'ivoire, avec un grand cœur en cire et des touches de fleurs séchées. Le bouquet qui réchauffe une pièce.",
    color: "Orange",
    flowerType: "Dahlia",
    sizes: three(3500, 5500, 7900),
    photos: ["eclat-agrume-1"],
    featured: true,
  },
  {
    slug: "nuage-rose",
    name: "Nuage Rosé",
    description:
      "Une grande rose vieux rose au centre, entourée de roses ivoire, de perles et de sphères dorées. Une composition douce et élégante.",
    color: "Rose",
    flowerType: "Rose",
    sizes: three(3200, 5000, 7200),
    photos: ["nuage-rose-1"],
  },
  {
    slug: "perle-de-rose",
    name: "Perle de Rose",
    description:
      "Roses, pivoines et coquillage en cire dans des tons rose et crème, ponctués de gypsophile fuchsia et de grandes sphères dorées.",
    color: "Rose",
    flowerType: "Pivoine",
    sizes: three(3500, 5500, 7900),
    photos: ["perle-de-rose-1"],
  },
  {
    slug: "jardin-rose",
    name: "Jardin Rose",
    description:
      "Un dôme de roses tendres et de gypsophile rose, à poser au centre d'une table. Il se présente aussi emballé, prêt à offrir.",
    color: "Rose",
    flowerType: "Rose",
    sizes: three(3500, 5500, 7900),
    photos: ["jardin-rose-1", "jardin-rose-2"],
  },
  {
    slug: "douceur-nude",
    name: "Douceur Nude",
    description:
      "Des roses et pivoines couleur nude, un cœur en cire et des épis dorés. Une palette sobre et lumineuse, très facile à offrir.",
    color: "Beige",
    flowerType: "Pivoine",
    sizes: three(3200, 5000, 7200),
    photos: ["douceur-nude-1"],
  },
  {
    slug: "sable-coquillage",
    name: "Sable & Coquillage",
    description:
      "Des fleurs taupe et crème rehaussées d'or, un coquillage en cire et de la gypsophile naturelle, dans une coupe assortie.",
    color: "Taupe",
    flowerType: "Succulente",
    sizes: three(3200, 5000, 7200),
    photos: ["sable-coquillage-1"],
  },
  {
    slug: "coupe-doree",
    name: "Coupe Dorée",
    description:
      "Une coupe dorée coulée de cire crème, couronnée de petites fleurs roses et de deux mèches en bois.",
    color: "Or",
    flowerType: "Mixte",
    shape: "Coupe",
    sizes: [["Modèle unique", 2900]],
    photos: ["coupe-doree-1"],
  },
];

const DEMO_CUSTOMERS = [
  ["Client Démo A", "Alger"],
  ["Client Démo B", "Annaba"],
  ["Client Démo C", "Oran"],
  ["Client Démo D", "Constantine"],
  ["Client Démo E", "Sétif"],
  ["Client Démo F", "Blida"],
];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD sont requis dans .env");
  if (await Admin.exists({ email })) return;
  await Admin.create({ email, passwordHash: await bcrypt.hash(password, 12) });
  console.log(`Compte gérante créé : ${email}`);
}

async function seedProducts() {
  if ((await Product.countDocuments()) > 0) return false;
  for (const [index, product] of PRODUCTS.entries()) {
    const { sizes, photos, ...fields } = product;
    await Product.create({
      ...fields,
      basePrice: Math.min(...sizes.map(([, price]) => price)),
      // Écarte les dates pour que le tri « Nouveautés » soit stable.
      createdAt: new Date(Date.now() - index * 86_400_000),
      sizes: sizes.map(([label, price]) => ({ label, price })),
      images: photos.map((photo) => ({
        url: `/bouquets/${photo.includes("/") ? photo : `kandili/${photo}`}.jpg`,
      })),
    });
  }
  console.log(`${PRODUCTS.length} modèles d'exposition créés`);
  return true;
}

async function seedOrders() {
  if ((await Order.countDocuments()) > 0) return;
  const products = await Product.find({ inStock: true }).lean<ProductDoc[]>();

  let state = 42;
  const rand = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];

  const total = 46;
  for (let i = 0; i < total; i++) {
    const daysAgo = Math.floor(((total - i) / total) * 30 * (0.75 + rand() * 0.25));
    const createdAt = new Date(Date.now() - daysAgo * 86_400_000 - rand() * 36_000_000);
    const status: OrderStatus =
      daysAgo <= 1
        ? "nouvelle"
        : daysAgo <= 4
          ? pick<OrderStatus>(["preparation", "preparation", "livree"])
          : pick<OrderStatus>(["livree", "livree", "livree", "livree", "annulee"]);

    const items = Array.from({ length: rand() > 0.7 ? 2 : 1 }, () => {
      const product = pick(products);
      const size = pick(product.sizes);
      return {
        productId: product._id,
        sizeId: size._id,
        productName: product.name,
        sizeLabel: size.label,
        scent: pick(["Vanille", "Rose", "Jasmin", "Fleur d'oranger", "Musc blanc"]),
        imageUrl: product.images[0]?.url,
        unitPrice: size.price,
        quantity: rand() > 0.85 ? 2 : 1,
      };
    });
    const subtotal = items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
    const [customerName, city] = pick(DEMO_CUSTOMERS);

    await Order.create({
      number: 1001 + i,
      publicToken: randomBytes(18).toString("base64url"),
      customerName,
      phone: `05550000${String(i % 100).padStart(2, "0")}`,
      address: "Adresse de démonstration",
      city,
      status,
      subtotal,
      total: subtotal,
      items,
      createdAt,
    });
  }
  await Counter.updateOne({ _id: "order" }, { $set: { seq: total } }, { upsert: true });
  console.log(`${total} commandes de démonstration créées`);
}

async function main() {
  await connectDb();
  await seedAdmin();
  const created = await seedProducts();
  // SEED_DEMO_ORDERS=false pour une base de production sans commandes fictives.
  if (created && process.env.SEED_DEMO_ORDERS !== "false") await seedOrders();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
