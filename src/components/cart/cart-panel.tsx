"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cartQuantity, cartTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

export function CartPanel({
  compact = false,
  checkoutHref = "/checkout",
  showCheckoutAction = true,
}: {
  compact?: boolean;
  checkoutHref?: string;
  showCheckoutAction?: boolean;
}) {
  const { lines, add, decrease, remove, clear } = useCartStore();
  const total = cartTotal(lines);

  if (!lines.length) {
    return (
      <div className="grid min-h-64 place-items-center border border-dashed border-[#020D13]/20 bg-white p-8 text-center">
        <div>
          <ShoppingBag className="mx-auto mb-4 size-9 text-[#020D13]/35" />
          <h2 className="text-xl font-bold">Корзина пуста</h2>
          <p className="mt-2 text-sm text-[#020D13]/55">
            Добавьте блюда из меню — они останутся в корзине на этом устройстве.
          </p>
          <Link
            href="/menu"
            className="mt-6 inline-flex min-h-11 items-center rounded-md bg-[#020D13] px-5 text-sm font-bold text-white"
          >
            Перейти в меню
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-3">
        {lines.map(({ item, quantity }) => (
          <article
            key={item.id}
            className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-[#020D13]/10 pb-3"
          >
            <div className="relative size-16 overflow-hidden bg-[#020D13]">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-xl text-white/40">
                  TQ
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-bold">{item.nameRu}</h3>
              <p className="mt-1 text-sm text-[#020D13]/55">
                {formatPrice(item.price)}
              </p>
              <div className="mt-2 inline-flex items-center rounded-md border border-[#020D13]/15">
                <button
                  onClick={() => decrease(item.id)}
                  className="grid size-9 place-items-center"
                  aria-label="Уменьшить"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-7 text-center text-sm font-bold">
                  {quantity}
                </span>
                <button
                  onClick={() => add(item)}
                  className="grid size-9 place-items-center"
                  aria-label="Увеличить"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button
                onClick={() => remove(item.id)}
                className="grid size-9 place-items-center text-[#020D13]/35 hover:text-red-700"
                aria-label="Удалить"
              >
                <Trash2 className="size-4" />
              </button>
              <strong className="text-sm">
                {formatPrice(item.price * quantity)}
              </strong>
            </div>
          </article>
        ))}
      </div>
      <div className="border-t border-[#020D13]/15 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span>Блюд: {cartQuantity(lines)}</span>
          <strong className="text-xl">{formatPrice(total)}</strong>
        </div>
        {showCheckoutAction && (
          <Link
            href={checkoutHref}
            className="mt-4 flex min-h-13 items-center justify-center rounded-md bg-[#020D13] px-5 text-base font-bold text-white"
          >
            Оформить заказ
          </Link>
        )}
        {!compact && (
          <Button variant="ghost" className="mt-2 w-full" onClick={clear}>
            Очистить корзину
          </Button>
        )}
      </div>
    </div>
  );
}
