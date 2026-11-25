import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { logout } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { requireAdmin } from "@/lib/auth";
import { Order } from "@/lib/models";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Tableau de bord", template: "%s · Admin Kandili" },
  robots: { index: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const newOrders = await Order.countDocuments({ status: "nouvelle" });

  return (
    <div className="min-h-dvh pb-20 md:grid md:grid-cols-[15rem_1fr] md:pb-0">
      <aside className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface p-1.5 md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:border-r md:border-t-0 md:p-4">
        <Link href="/admin" className="mb-6 hidden px-3 pt-1 md:block" aria-label="Tableau de bord">
          <Logo className="text-2xl" />
        </Link>
        <AdminNav newOrders={newOrders} />
        <div className="mt-auto hidden border-t border-line pt-3 md:block">
          <p className="truncate px-3 pb-2 text-sm text-plum-soft">{admin.email}</p>
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-wax-deep">
            <ExternalLink className="size-4" aria-hidden="true" />
            Voir le site
          </Link>
          <ThemeToggle showLabel />
          <form action={logout}>
            <button type="submit" className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-wax-deep">
              <LogOut className="size-4" aria-hidden="true" />
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
          <Logo className="text-xl" />
          <div className="flex items-center">
            <ThemeToggle />
            <form action={logout}>
              <button type="submit" aria-label="Se déconnecter" className="grid size-10 cursor-pointer place-items-center rounded-full hover:bg-wax-deep">
                <LogOut className="size-5" aria-hidden="true" />
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:py-8">{children}</main>
      </div>
    </div>
  );
}
