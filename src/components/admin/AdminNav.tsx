"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flower2, LayoutDashboard, Settings, ShoppingBag } from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Accueil", Icon: LayoutDashboard },
  { href: "/admin/commandes", label: "Commandes", Icon: ShoppingBag },
  { href: "/admin/bouquets", label: "Bouquets", Icon: Flower2 },
  { href: "/admin/reglages", label: "Réglages", Icon: Settings },
];

export function AdminNav({ newOrders }: { newOrders: number }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Administration" className="grid grid-cols-4 gap-1 md:grid-cols-1">
      {LINKS.map(({ href, label, Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-[0.9375rem] ${
              active ? "bg-wax-deep text-plum" : "text-plum-soft hover:bg-wax-deep/60"
            }`}
          >
            <Icon className="size-5" aria-hidden="true" />
            {label}
            {href === "/admin/commandes" && newOrders > 0 && (
              <span className="absolute right-3 top-1 grid min-w-5 place-items-center rounded-full bg-rose px-1 text-xs font-semibold leading-5 text-on-rose md:static md:ml-auto">
                {newOrders}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
