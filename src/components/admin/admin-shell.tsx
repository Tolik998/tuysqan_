"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Archive,
  BookOpen,
  FolderTree,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  QrCode,
  Settings,
  ShoppingBag,
  Table2,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/client";

const nav = [
  ["/admin", "Обзор", LayoutDashboard],
  ["/admin/orders", "Заказы", ShoppingBag],
  ["/admin/menu", "Меню", BookOpen],
  ["/admin/archive", "Архив", Archive],
  ["/admin/categories", "Категории", FolderTree],
  ["/admin/tables", "Столы", Table2],
  ["/admin/promotions", "Акции", ImageIcon],
  ["/admin/qr", "QR-коды", QrCode],
  ["/admin/settings", "Настройки", Settings],
] as const;

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  async function signOut() {
    const client = createClient();
    await client?.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }
  return (
    <div className="min-h-screen bg-[#f4f2ee]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#020D13]/10 bg-white p-5 lg:block">
        <Logo />
        <nav className="mt-10 grid gap-1">
          {nav.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold ${pathname === href ? "bg-[#020D13] text-white" : "text-[#020D13]/65 hover:bg-[#020D13]/5"}`}
              aria-current={pathname === href ? "page" : undefined}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-5 bottom-5">
          <p className="truncate text-xs text-[#020D13]/45">{email}</p>
          <button
            onClick={signOut}
            className="mt-3 flex min-h-10 w-full items-center gap-2 rounded-md text-sm font-bold text-red-700"
          >
            <LogOut className="size-4" />
            Выйти
          </button>
        </div>
      </aside>
      <header className="sticky top-0 z-30 border-b border-[#020D13]/10 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between">
          <Logo />
          <select
            value={pathname}
            onChange={(e) => router.push(e.target.value)}
            className="h-10 rounded-md border px-3 text-sm font-bold"
            aria-label="Раздел админ-панели"
          >
            {nav.map(([href, label]) => (
              <option key={href} value={href}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </header>
      <main className="px-4 py-7 sm:px-7 lg:ml-64 lg:px-10 lg:py-10">
        <div key={pathname} className="admin-page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
