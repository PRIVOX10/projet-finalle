import Link from "next/link";
import { House } from "lucide-react";
import { CartButton } from "@/components/shop/CartButton";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { whatsAppLink } from "@/lib/phone";
import { getSettings } from "@/lib/settings";

// Prix et disponibilités viennent de la base : pas de pages figées au build.
export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line/70 bg-wax/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
          <Link href="/" aria-label="Kandili, accueil">
            <Logo className="text-lg sm:text-2xl" />
          </Link>
          <nav className="flex items-center text-sm sm:gap-2 sm:text-[0.9375rem]">
            <Link
              href="/"
              aria-label="Accueil"
              className="flex items-center gap-1.5 rounded-full px-1 py-2 hover:bg-wax-deep sm:px-3"
            >
              <House className="size-[1.1rem] sm:hidden" aria-hidden="true" />
              <span className="hidden sm:inline">Accueil</span>
            </Link>
            <Link href="/bouquets" className="rounded-full px-1 py-2 hover:bg-wax-deep sm:px-3">
              Bouquets
            </Link>
            <Link href="/contact" className="rounded-full px-1 py-2 hover:bg-wax-deep sm:px-3">
              Contact
            </Link>
            <ThemeToggle />
            <CartButton />
          </nav>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="mt-20 border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <Logo className="text-xl" />
            <p className="mt-2 max-w-xs text-sm text-plum-soft">
              Bougies fleuries faites à la main. Livraison dans les 58 wilayas, paiement à la livraison.
            </p>
          </div>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/bouquets" className="hover:underline">
                Tous les bouquets
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact et questions
              </Link>
            </li>
            {settings.instagram && (
              <li>
                <a href={`https://instagram.com/${settings.instagram}`} rel="noopener" className="hover:underline">
                  Instagram
                </a>
              </li>
            )}
            {settings.whatsapp && (
              <li>
                <a href={whatsAppLink(settings.whatsapp)} rel="noopener" className="hover:underline">
                  WhatsApp
                </a>
              </li>
            )}
          </ul>
        </div>
      </footer>

      <CartDrawer currency={settings.currency} />
    </div>
  );
}
