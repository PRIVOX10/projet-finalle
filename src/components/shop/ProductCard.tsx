import Image from "next/image";
import Link from "next/link";
import { CandleLight } from "@/components/shop/CandleLight";
import type { ProductData } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product, currency }: { product: ProductData; currency: string }) {
  const image = product.images[0];
  const severalSizes = product.sizes.length > 1;

  return (
    <Link href={`/bouquets/${product.slug}`} className="group block">
      <div className="candle-scene relative aspect-[4/5] overflow-hidden rounded-2xl bg-wax-deep">
        {image && (
          <>
            <Image
              src={image.url}
              alt={`Bouquet ${product.name}`}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            {product.inStock && <CandleLight src={image.url} />}
          </>
        )}
        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-surface px-3 py-1 text-xs font-semibold">
            Épuisé
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-lg leading-snug">{product.name}</h3>
      <p className="text-sm text-plum-soft">
        {severalSizes ? "À partir de " : ""}
        {formatPrice(product.basePrice, currency)}
      </p>
    </Link>
  );
}
