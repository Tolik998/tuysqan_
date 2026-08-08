"use client";

import Image from "next/image";
import {
  Flame,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { CartPanel } from "@/components/cart/cart-panel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cartQuantity, cartTotal, canOrder } from "@/lib/cart";
import { cn, formatPrice, localize } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useLocaleStore } from "@/store/locale-store";
import type { Category, MenuItem } from "@/types/domain";

const enlargedImageSlugs = new Set(["pizza-bolognese", "khachapuri-adjarian"]);
const enlargedTwentyPercentImageSlugs = new Set([
  "pepperoni",
  "pizza-kazy",
  "mexican",
  "margherita",
  "pizza-chicken-mushrooms",
]);
const rotatedImageClasses: Record<string, string> = {
  "noodles-meatballs": "rotate-[80deg] scale-[0.86]",
  "t-bone": "rotate-[270deg] scale-[1.15]",
};

function ProductCard({
  item,
  onOpen,
  eager = false,
}: {
  item: MenuItem;
  onOpen: () => void;
  eager?: boolean;
}) {
  const locale = useLocaleStore((state) => state.locale);
  const add = useCartStore((state) => state.add);
  const line = useCartStore((state) =>
    state.lines.find((entry) => entry.item.id === item.id),
  );
  const unavailable = !canOrder(item);
  return (
    <article className="group grid min-h-full grid-rows-[auto_1fr] overflow-hidden border border-[#020D13]/10 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_55px_rgba(2,13,19,.09)]">
      <button
        type="button"
        onClick={onOpen}
        className="relative aspect-[4/3] overflow-hidden bg-[#020D13] text-left"
        aria-label={`Открыть ${item.nameRu}`}
      >
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={localize(locale, item.nameRu, item.nameKk)}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            className={cn(
              "object-contain p-2 transition duration-300 group-hover:opacity-90",
              enlargedImageSlugs.has(item.slug) && "scale-[1.4]",
              enlargedTwentyPercentImageSlugs.has(item.slug) && "scale-[1.2]",
              rotatedImageClasses[item.slug],
            )}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,rgba(255,255,255,.08),transparent_58%)] text-xs font-bold uppercase tracking-[.25em] text-white/35">
            Tuysqan
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {item.isSpicy && (
            <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-1 text-[10px] font-bold">
              <Flame className="size-3 text-red-600" /> Острое
            </span>
          )}
          {item.isNew && (
            <span className="rounded bg-white px-2 py-1 text-[10px] font-bold">
              Новинка
            </span>
          )}
        </div>
        {unavailable && (
          <div className="absolute inset-0 grid place-items-center bg-[#020D13]/65">
            <span className="rounded bg-white px-3 py-2 text-xs font-bold">
              Нет в наличии
            </span>
          </div>
        )}
      </button>
      <div className="flex flex-col p-3.5 sm:p-5">
        <button type="button" onClick={onOpen} className="text-left">
          <h3 className="text-[15px] font-bold leading-snug sm:text-lg">
            {localize(locale, item.nameRu, item.nameKk)}
          </h3>
          {item.pieceCount && (
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#020D13]/45">
              {item.pieceCount} штук
            </p>
          )}
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#020D13]/55 sm:text-sm">
            {localize(locale, item.descriptionRu, item.descriptionKk) ||
              "Состав уточняйте у администратора."}
          </p>
        </button>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <strong className="whitespace-nowrap text-base sm:text-lg">
            {formatPrice(item.price)}
          </strong>
          {line ? (
            <div className="inline-flex items-center rounded-md border border-[#020D13]/15">
              <button
                onClick={() => useCartStore.getState().decrease(item.id)}
                className="grid size-10 place-items-center"
                aria-label="Уменьшить"
              >
                <Minus className="size-4" />
              </button>
              <span className="min-w-6 text-center text-sm font-bold">
                {line.quantity}
              </span>
              <button
                onClick={() => add(item)}
                className="grid size-10 place-items-center"
                aria-label="Увеличить"
              >
                <Plus className="size-4" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => add(item)}
              disabled={unavailable}
              aria-label={`Добавить ${item.nameRu}`}
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Добавить</span>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function ProductDialog({
  item,
  open,
  onOpenChange,
}: {
  item: MenuItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const locale = useLocaleStore((state) => state.locale);
  const add = useCartStore((state) => state.add);
  if (!item) return null;
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) setQuantity(1);
      }}
    >
      <DialogContent className="overflow-hidden p-0 md:grid md:grid-cols-[1.05fr_.95fr]">
        <div className="relative aspect-[4/3] bg-[#020D13] md:aspect-auto md:min-h-[470px]">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={localize(locale, item.nameRu, item.nameKk)}
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className={cn(
                "object-contain p-3",
                enlargedImageSlugs.has(item.slug) && "scale-[1.4]",
                enlargedTwentyPercentImageSlugs.has(item.slug) && "scale-[1.2]",
                rotatedImageClasses[item.slug],
              )}
              priority
            />
          ) : (
            <div className="grid h-full place-items-center text-white/30">
              Tuysqan
            </div>
          )}
        </div>
        <div className="flex flex-col p-5 md:p-7">
          <DialogTitle className="pr-10 text-2xl font-bold leading-tight">
            {localize(locale, item.nameRu, item.nameKk)}
          </DialogTitle>
          <DialogDescription className="mt-4 text-sm leading-6 text-[#020D13]/60">
            {localize(locale, item.descriptionRu, item.descriptionKk) ||
              "Состав можно уточнить у команды Tuysqan."}
          </DialogDescription>
          <div className="mt-5 flex flex-wrap gap-2">
            {item.isSpicy && (
              <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                <Flame className="size-3" />
                Острое
              </span>
            )}
            {item.pieceCount && (
              <span className="rounded bg-[#020D13]/6 px-2.5 py-1 text-xs font-bold">
                {item.pieceCount} штук
              </span>
            )}
          </div>
          <div className="mt-auto pt-8">
            <div className="mb-4 flex items-center justify-between">
              <strong className="text-2xl">
                {formatPrice(item.price * quantity)}
              </strong>
              <div className="inline-flex items-center rounded-md border border-[#020D13]/15">
                <button
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="grid size-11 place-items-center"
                  aria-label="Уменьшить"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((value) => value + 1)}
                  className="grid size-11 place-items-center"
                  aria-label="Увеличить"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                add(item, quantity);
                onOpenChange(false);
              }}
            >
              Добавить в корзину
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MenuExperience({
  categories,
  items,
  dineIn = false,
  preselectedTable,
  initialDishSlug,
}: {
  categories: Category[];
  items: MenuItem[];
  dineIn?: boolean;
  preselectedTable?: string;
  initialDishSlug?: string;
}) {
  const locale = useLocaleStore((state) => state.locale);
  const lines = useCartStore((state) => state.lines);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const [selected, setSelected] = useState<MenuItem | null>(() =>
    initialDishSlug
      ? items.find(
          (item) =>
            item.slug === initialDishSlug &&
            !item.isArchived &&
            (dineIn ? item.isVisibleDineIn : item.isVisiblePublic),
        ) || null
      : null,
  );
  const [cartOpen, setCartOpen] = useState(false);
  const normalized = query.trim().toLocaleLowerCase();
  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        if (dineIn ? !item.isVisibleDineIn : !item.isVisiblePublic)
          return false;
        if (item.isArchived) return false;
        if (normalized)
          return [
            item.nameRu,
            item.nameKk,
            item.descriptionRu,
            item.descriptionKk,
          ].some((value) => value?.toLocaleLowerCase().includes(normalized));
        return item.categoryId === activeCategory;
      }),
    [items, dineIn, normalized, activeCategory],
  );
  const active = categories.find((category) => category.id === activeCategory);
  const quantity = cartQuantity(lines);
  const total = cartTotal(lines);
  const dineInCheckoutHref = preselectedTable
    ? `/dine-in/cart?table=${encodeURIComponent(preselectedTable)}`
    : "/dine-in/cart";

  return (
    <div className="relative">
      <div className="sticky top-18 z-30 border-y border-[#020D13]/8 bg-[#FFFBFC]/95 backdrop-blur-md">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setActiveCategory(category.id);
                  setQuery("");
                }}
                className={`min-h-10 shrink-0 rounded-md px-4 text-xs font-bold transition ${activeCategory === category.id && !query ? "bg-[#020D13] text-white" : "border border-[#020D13]/12 bg-white"}`}
              >
                {localize(locale, category.nameRu, category.nameKk)}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#020D13]/45">
              <Sparkles className="size-3.5" />
              {dineIn ? "Заказ в ресторане" : "Меню Tuysqan"}
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {query
                ? "Результаты поиска"
                : localize(locale, active?.nameRu, active?.nameKk)}
            </h2>
          </div>
          <label className="relative block w-full sm:max-w-sm">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#020D13]/45" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Найти блюдо…"
              className="pl-11"
              aria-label="Поиск по меню"
            />
          </label>
        </div>
        {visibleItems.length ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {visibleItems.map((item, index) => (
              <ProductCard
                key={item.id}
                item={item}
                eager={index < 4}
                onOpen={() => setSelected(item)}
              />
            ))}
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center border border-dashed border-[#020D13]/20 bg-white p-8 text-center">
            <div>
              <Search className="mx-auto mb-3 size-8 text-[#020D13]/30" />
              <h3 className="text-xl font-bold">Ничего не найдено</h3>
              <p className="mt-2 text-sm text-[#020D13]/55">
                Попробуйте другое название на русском или казахском.
              </p>
            </div>
          </div>
        )}
      </div>
      <ProductDialog
        item={selected}
        open={!!selected}
        onOpenChange={(value) => !value && setSelected(null)}
      />
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent>
          <DialogTitle className="text-2xl font-bold">Корзина</DialogTitle>
          <DialogDescription className="mb-5 text-sm text-[#020D13]/55">
            Проверьте состав заказа.
          </DialogDescription>
          <CartPanel
            compact
            checkoutHref={dineIn ? dineInCheckoutHref : "/checkout"}
          />
        </DialogContent>
      </Dialog>
      {quantity > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#020D13] p-3 text-white shadow-2xl md:hidden">
          <button
            onClick={() => setCartOpen(true)}
            aria-label={`Открыть корзину: ${quantity}`}
            className="mx-auto flex min-h-12 w-full max-w-lg items-center justify-between rounded-md bg-white px-5 font-bold text-[#020D13]"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="size-4" />
              Корзина · {quantity}
            </span>
            <span>{formatPrice(total)}</span>
          </button>
        </div>
      )}
      {quantity > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          aria-label={`Открыть корзину: ${quantity}`}
          className="fixed bottom-6 right-6 z-40 hidden min-h-12 items-center gap-3 rounded-md bg-[#020D13] px-5 font-bold text-white shadow-xl md:flex"
        >
          <ShoppingBag className="size-5" />
          <span>
            {quantity} · {formatPrice(total)}
          </span>
        </button>
      )}
    </div>
  );
}
