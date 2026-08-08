"use client";

import { Check, ChefHat, Clock3, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

type OrderView = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  tables: { label: string } | null;
  order_items: Array<{
    item_name_snapshot: string;
    quantity: number;
    line_total: number;
  }>;
};

const statusLabels: Record<string, string> = {
  new: "Новый",
  accepted: "Принят",
  preparing: "Готовится",
  ready: "Готов",
  served: "Подан",
  completed: "Завершён",
  cancelled: "Отменён",
};
const steps = ["new", "accepted", "preparing", "ready", "served"];

export function OrderStatus({ id, token }: { id: string; token: string }) {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`/api/orders/${id}?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setOrder(data);
      })
      .catch((reason) => setError(reason.message || "Заказ не найден"));
    const supabase = createClient();
    if (!supabase) return;
    const channel = supabase
      .channel(`order-${token}`)
      .on("broadcast", { event: "status" }, ({ payload }) =>
        setOrder((current) =>
          current ? { ...current, status: payload.status } : current,
        ),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [id, token]);

  if (error)
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center font-semibold text-red-800">
        {error}
      </div>
    );
  if (!order)
    return (
      <div className="grid min-h-64 place-items-center">
        <Clock3 className="size-8 animate-pulse" />
      </div>
    );
  const currentStep = Math.max(0, steps.indexOf(order.status));
  return (
    <div className="mx-auto max-w-2xl">
      <div className="text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-800">
          <Check className="size-8" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-[#020D13]/45">
          Заказ принят
        </p>
        <h1 className="mt-2 text-4xl font-bold">{order.order_number}</h1>
        <p className="mt-3 text-lg font-semibold">
          Стол {order.tables?.label || "—"}
        </p>
      </div>
      <div className="mt-10 grid grid-cols-5 gap-1">
        {steps.map((step, index) => (
          <div key={step} className="text-center">
            <div
              className={`mx-auto mb-2 h-1.5 rounded ${index <= currentStep ? "bg-[#020D13]" : "bg-[#020D13]/12"}`}
            />
            <span className="text-[10px] font-bold sm:text-xs">
              {statusLabels[step]}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-9 border border-[#020D13]/10 bg-white p-5 sm:p-7">
        <div className="mb-4 flex items-center gap-2">
          <ChefHat className="size-5" />
          <h2 className="text-xl font-bold">{statusLabels[order.status]}</h2>
        </div>
        <div className="grid gap-3">
          {order.order_items.map((item, index) => (
            <div
              key={`${item.item_name_snapshot}-${index}`}
              className="flex justify-between gap-4 border-b border-[#020D13]/8 pb-3 text-sm"
            >
              <span>
                {item.quantity} × {item.item_name_snapshot}
              </span>
              <strong>{formatPrice(item.line_total)}</strong>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between text-lg">
          <span>Итого</span>
          <strong>{formatPrice(order.total)}</strong>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2 text-center text-sm text-[#020D13]/50">
        <UtensilsCrossed className="size-4" />
        Статус обновится автоматически
      </div>
    </div>
  );
}
