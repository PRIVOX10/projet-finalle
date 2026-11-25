import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/Logo";
import { getAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-4 py-10">
      <Logo className="justify-center text-3xl" />
      <p className="mt-2 text-center text-plum-soft">Espace gérante</p>
      <LoginForm />
    </main>
  );
}
