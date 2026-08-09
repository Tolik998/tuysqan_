"use client";

import Image from "next/image";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminTitle } from "@/components/admin/menu-admin";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { Category, MenuItem } from "@/types/domain";

export function ArchivedMenuAdmin({
  initialItems,
  categories,
  loadError,
}: {
  initialItems: MenuItem[];
  categories: Category[];
  loadError: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState(loadError);

  async function restore(item: MenuItem) {
    setBusyId(item.id);
    setError("");
    const response = await fetch("/api/admin/menu_items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, data: { is_archived: false } }),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } else {
      setError(result.error || "Не удалось восстановить блюдо");
    }
    setBusyId("");
  }

  async function removePermanently(item: MenuItem) {
    if (
      !confirm(
        `Удалить «${item.nameRu}» навсегда? Это действие нельзя отменить.`,
      )
    )
      return;
    setBusyId(item.id);
    setError("");
    const response = await fetch("/api/admin/menu_items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, permanent: true }),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok) {
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } else {
      setError(result.error || "Не удалось удалить блюдо");
    }
    setBusyId("");
  }

  return (
    <div>
      <AdminTitle
        title="Архив"
        subtitle="Архивные блюда не показываются гостям, но их можно восстановить"
      />
      {error && (
        <p className="mb-5 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      )}
      {items.length ? (
        <div className="overflow-hidden border border-[#020D13]/10 bg-white">
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 border-b border-[#020D13]/8 p-4 last:border-b-0 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden bg-[#020D13]">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain p-1"
                    />
                  ) : (
                    <Archive className="absolute inset-0 m-auto size-5 text-white/45" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-bold">{item.nameRu}</h2>
                  <p className="mt-1 text-xs text-[#020D13]/50">
                    {categories.find((entry) => entry.id === item.categoryId)
                      ?.nameRu || "Категория недоступна"}
                    {" · "}
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  onClick={() => restore(item)}
                  disabled={busyId === item.id}
                  title="Вернуть блюдо в меню"
                >
                  <RotateCcw className="size-4" />
                  Восстановить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => removePermanently(item)}
                  disabled={busyId === item.id}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  title="Удалить без возможности восстановления"
                >
                  <Trash2 className="size-4" />
                  Удалить навсегда
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-64 place-items-center border border-dashed border-[#020D13]/15 bg-white p-8 text-center">
          <div>
            <Archive className="mx-auto size-9 text-[#020D13]/25" />
            <h2 className="mt-4 text-lg font-bold">Архив пуст</h2>
            <p className="mt-2 text-sm text-[#020D13]/50">
              Архивированные блюда появятся здесь.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
