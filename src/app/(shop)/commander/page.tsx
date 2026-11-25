import type { Metadata } from "next";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Commander", robots: { index: false } };

export default async function CheckoutPage() {
  const { currency, deliveryFee } = await getSettings();

  return (
    <main className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
      <h1 className="font-display text-4xl sm:text-5xl">Votre commande</h1>
      <p className="mt-2 text-plum-soft">
        Aucun paiement en ligne : vous réglez à la réception de votre bouquet.
      </p>
      <CheckoutForm currency={currency} deliveryFee={deliveryFee} />
    </main>
  );
}
