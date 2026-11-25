import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CandleLight } from "@/components/shop/CandleLight";
import { ProductCard } from "@/components/shop/ProductCard";
import { getFeatured } from "@/lib/catalog";
import { whatsAppLink } from "@/lib/phone";
import { getSettings } from "@/lib/settings";

const HERO_IMAGE = "/bouquets/kandili/rose-poudree-1.jpg";

const STEPS = [
  { title: "Choisissez", text: "Parcourez les bouquets et sélectionnez la taille qui vous convient." },
  { title: "Commandez", text: "Laissez votre nom, votre téléphone et votre adresse. C'est tout." },
  { title: "Payez à la livraison", text: "Livraison dans les 58 wilayas. Vous réglez à la réception, sans paiement en ligne." },
];

export default async function HomePage() {
  const [featured, settings] = await Promise.all([getFeatured(4), getSettings()]);
  const contactHref = settings.whatsapp ? whatsAppLink(settings.whatsapp) : "/contact";

  return (
    <main className="overflow-x-clip">
      <section className="mx-auto grid max-w-6xl items-center gap-6 px-4 pb-10 pt-10 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:pt-14">
        <div>
          <p className="font-semibold text-rose">Bougies fleuries faites à la main</p>
          <h1 className="mt-3 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Des fleurs qui ne fanent pas. <span className="ignite-text">Elles s&apos;allument.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-plum-soft">
            Des bouquets de bougies à la senteur douce, pour une atmosphère chaleureuse. Livraison dans
            les 58 wilayas, paiement à la réception.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/bouquets" className="btn btn-primary">
              Voir les bouquets
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href="/contact" className="btn btn-outline">
              Nous écrire
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div aria-hidden="true" className="hero-glow absolute -inset-[6%] rounded-full" />
          <div className="candle-scene relative aspect-[4/5] overflow-hidden rounded-[50%_50%_1.5rem_1.5rem/40%_40%_1.5rem_1.5rem]">
            <Image
              src={HERO_IMAGE}
              alt="Bouquet de bougies en forme de roses, rose poudré et doré, avec de la gypsophile"
              fill
              priority
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover"
            />
            <CandleLight src={HERO_IMAGE} embers />
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6" aria-labelledby="featured-title">
          <div className="flex items-end justify-between gap-4">
            <h2 id="featured-title" className="font-display text-3xl sm:text-4xl">
              Nos coups de cœur
            </h2>
            <Link href="/bouquets" className="shrink-0 text-sm font-semibold underline underline-offset-4">
              Tout voir
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} currency={settings.currency} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6" aria-labelledby="steps-title">
        <h2 id="steps-title" className="font-display text-3xl sm:text-4xl">
          Commander, c&apos;est simple
        </h2>
        <ol className="mt-6 grid gap-6 border-t border-line pt-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <span className="font-display text-2xl text-rose">{index + 1}</span>
              <h3 className="mt-1 text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-plum-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
        <div className="band rounded-3xl bg-band px-6 py-10 text-band-ink sm:px-12 sm:py-14">
          <h2 className="max-w-lg font-display text-3xl sm:text-4xl">
            Une question ou une composition sur mesure ?
          </h2>
          <p className="mt-3 max-w-md text-band-ink/80">
            Écrivez-nous, nous vous répondons directement.
          </p>
          <a href={contactHref} className="btn mt-6 bg-band-ink text-band hover:opacity-90">
            Nous contacter
          </a>
        </div>
      </section>
    </main>
  );
}
