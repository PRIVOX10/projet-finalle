import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/shop/AddToCart";
import { Gallery } from "@/components/shop/Gallery";
import { ProductCard } from "@/components/shop/ProductCard";
import { getProductBySlug, getRelated } from "@/lib/catalog";
import { whatsAppLink } from "@/lib/phone";
import { getSettings } from "@/lib/settings";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Bouquet introuvable" };
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: { images: product.images[0] ? [product.images[0].url] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, settings] = await Promise.all([getRelated(product), getSettings()]);

  return (
    <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <nav aria-label="Fil d'Ariane" className="text-sm text-plum-soft">
        <Link href="/bouquets" className="hover:underline">
          Bouquets
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-12">
        <Gallery images={product.images} name={product.name} />
        <div>
          <p className="text-sm font-semibold text-rose">
            {product.shape} · {product.color}
          </p>
          <h1 className="mt-1 font-display text-4xl sm:text-5xl">{product.name}</h1>
          <div className="mt-4">
            <AddToCart product={product} currency={settings.currency} scents={settings.scents} />
          </div>
          <p className="mt-6 whitespace-pre-line leading-relaxed text-plum-soft">{product.description}</p>
          <ul className="mt-6 space-y-1 border-t border-line pt-4 text-sm">
            <li>Paiement à la livraison</li>
            {settings.whatsapp && (
              <li>
                <a
                  href={whatsAppLink(settings.whatsapp, `Bonjour, j'ai une question sur le bouquet ${product.name}.`)}
                  rel="noopener"
                  className="underline underline-offset-4"
                >
                  Poser une question sur WhatsApp
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16" aria-labelledby="related-title">
          <h2 id="related-title" className="font-display text-3xl">
            Vous aimerez aussi
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} currency={settings.currency} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
