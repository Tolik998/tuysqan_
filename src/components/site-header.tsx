"use client";

import Link from "next/link";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cartQuantity } from "@/lib/cart";
import { useCartStore } from "@/store/cart-store";

const links = [
  ["/", "Главная"],
  ["/menu", "Меню"],
  ["/about", "О нас"],
  ["/#contacts", "Контакты"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const count = useCartStore((state) => cartQuantity(state.lines));
  const orderHref = count > 0 ? "/checkout" : "/menu";

  return (
    <header className="sticky top-0 z-40 border-b border-[#020D13]/8 bg-[#FFFBFC]/95 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Logo />
        <nav
          className="hidden items-center gap-7 lg:flex"
          aria-label="Основная навигация"
        >
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-semibold text-[#020D13]/70 transition hover:text-[#020D13]"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/cart"
            className="relative hidden min-h-11 items-center gap-2 rounded-md border border-[#020D13]/15 px-4 text-sm font-bold sm:flex"
          >
            <ShoppingBag className="size-4" /> Корзина
            {count > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-[#020D13] text-[10px] text-white">
                {count}
              </span>
            )}
          </Link>
          <Link
            href={orderHref}
            className="hidden min-h-11 items-center rounded-md bg-[#020D13] px-5 text-sm font-bold text-white sm:flex"
          >
            Заказать
          </Link>
          <button
            className="grid size-11 place-items-center rounded-md border border-[#020D13]/15 lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Меню"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          className="border-t border-[#020D13]/8 bg-[#FFFBFC] px-4 py-4 lg:hidden"
          aria-label="Мобильная навигация"
        >
          <div className="mx-auto grid max-w-[1440px] gap-1">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center border-b border-[#020D13]/8 text-base font-bold"
              >
                {label}
              </Link>
            ))}
            <Link
              href="/cart"
              className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#020D13] text-sm font-bold text-white"
            >
              <ShoppingBag className="size-4" />
              Корзина · {count}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
