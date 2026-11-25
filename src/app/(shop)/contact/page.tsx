import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { whatsAppLink } from "@/lib/phone";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez Kandili sur WhatsApp ou Instagram.",
};

const QUESTIONS = [
  {
    question: "Comment passer commande ?",
    answer:
      "Choisissez un bouquet et sa taille, ajoutez-le au panier puis laissez votre nom, votre téléphone et votre adresse.",
  },
  {
    question: "Comment se passe le paiement ?",
    answer: "Vous payez à la livraison, à la réception de votre bouquet. Il n'y a aucun paiement en ligne.",
  },
  {
    question: "Livrez-vous dans ma wilaya ?",
    answer: "La livraison est disponible dans les 58 wilayas.",
  },
  {
    question: "Comment suivre ma commande ?",
    answer:
      "Une page de suivi s'affiche après votre commande. Elle indique si votre bouquet est en préparation ou livré.",
  },
  {
    question: "Puis-je demander une composition sur mesure ?",
    answer: "Écrivez-nous avec vos couleurs et votre occasion, nous vous dirons ce qui est possible.",
  },
];

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <main className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
      <h1 className="font-display text-4xl sm:text-5xl">Parlons de votre bouquet</h1>
      <p className="mt-3 max-w-lg text-lg text-plum-soft">
        Une question sur un bouquet, une livraison ou une occasion particulière ? Écrivez-nous.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {settings.whatsapp && (
          <a
            href={whatsAppLink(settings.whatsapp, "Bonjour, j'ai une question.")}
            rel="noopener"
            className="btn btn-whatsapp"
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            Écrire sur WhatsApp
          </a>
        )}
        {settings.instagram && (
          <a href={`https://instagram.com/${settings.instagram}`} rel="noopener" className="btn btn-outline">
            Instagram @{settings.instagram}
          </a>
        )}
        {settings.email && (
          <a href={`mailto:${settings.email}`} className="btn btn-outline">
            {settings.email}
          </a>
        )}
      </div>

      <section className="mt-14" aria-labelledby="faq-title">
        <h2 id="faq-title" className="font-display text-3xl">
          Questions fréquentes
        </h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {QUESTIONS.map(({ question, answer }) => (
            <details key={question} className="group py-4">
              <summary className="cursor-pointer list-none font-semibold marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {question}
                  <span aria-hidden="true" className="text-xl text-rose transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-plum-soft">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
