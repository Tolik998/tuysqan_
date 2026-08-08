"use client";

import { Bell, Clock3, MapPin, Utensils } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminTitle } from "@/components/admin/menu-admin";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

type Order = {
  id: string;
  order_number: string;
  order_type: string;
  status: string;
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: string;
  comment?: string;
  total: number;
  created_at: string;
  public_token?: string;
  tables?: { label: string } | null;
  order_items: Array<{
    item_name_snapshot: string;
    quantity: number;
    line_total: number;
  }>;
};
const tabs = [
  "new",
  "accepted",
  "preparing",
  "ready",
  "completed",
  "cancelled",
] as const;
const labels: Record<string, string> = {
  new: "Новые",
  accepted: "Приняты",
  preparing: "Готовятся",
  ready: "Готовы",
  served: "Поданы",
  completed: "Завершены",
  cancelled: "Отменены",
};
export function OrdersAdmin({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [tab, setTab] = useState<string>("new");
  const [error, setError] = useState("");
  useEffect(() => {
    const client = createClient();
    if (!client) return;
    const channel = client
      .channel("admin-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => location.reload(),
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, []);
  const visible = useMemo(
    () =>
      orders.filter((order) =>
        tab === "completed"
          ? ["served", "completed"].includes(order.status)
          : order.status === tab,
      ),
    [orders, tab],
  );
  async function update(id: string, status: string) {
    setError("");
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data: { status } }),
    });
    if (response.ok) {
      setOrders((current) =>
        current.map((order) =>
          order.id === id ? { ...order, status } : order,
        ),
      );
      return;
    }
    const result = await response.json().catch(() => ({}));
    setError(result.error || "Не удалось изменить статус заказа");
  }
  return (
    <div>
      <AdminTitle
        title="Заказы"
        subtitle="Доставка и заказы из QR-меню обновляются в реальном времени"
      />
      {error && (
        <p className="mb-5 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      )}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {tabs.map((value) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`min-h-10 shrink-0 rounded-md px-4 text-xs font-bold ${tab === value ? "bg-[#020D13] text-white" : "border border-[#020D13]/10 bg-white"}`}
          >
            {labels[value]} ·{" "}
            {
              orders.filter((o) =>
                value === "completed"
                  ? ["served", "completed"].includes(o.status)
                  : o.status === value,
              ).length
            }
          </button>
        ))}
      </div>
      {visible.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((order) => (
            <article
              key={order.id}
              className="border border-[#020D13]/10 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{order.order_number}</h2>
                    {order.status === "new" && (
                      <Bell className="size-4 text-amber-600" />
                    )}
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-[#020D13]/45">
                    <Clock3 className="size-3.5" />
                    {new Date(order.created_at).toLocaleString("ru-RU")}
                  </p>
                </div>
                <span className="rounded-full bg-[#020D13]/6 px-3 py-1 text-[10px] font-bold uppercase">
                  {order.order_type === "dine_in" ? "В ресторане" : "Доставка"}
                </span>
              </div>
              <div className="mt-4 grid gap-2 rounded-md bg-[#f7f5f1] p-3 text-sm">
                {order.tables?.label && (
                  <p className="flex items-center gap-2 font-bold">
                    <Utensils className="size-4" />
                    Стол {order.tables.label}
                  </p>
                )}
                {order.delivery_address && (
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0" />
                    {order.delivery_address}
                  </p>
                )}
                {order.customer_name && (
                  <p>
                    {order.customer_name}{" "}
                    {order.customer_phone && `· ${order.customer_phone}`}
                  </p>
                )}
                {order.comment && (
                  <p className="text-[#020D13]/60">
                    Комментарий: {order.comment}
                  </p>
                )}
              </div>
              <div className="mt-4 grid gap-2">
                {order.order_items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity} × {item.item_name_snapshot}
                    </span>
                    <strong>{formatPrice(item.line_total)}</strong>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between border-t pt-4">
                <strong className="text-lg">{formatPrice(order.total)}</strong>
                <select
                  value={order.status}
                  onChange={(e) => update(order.id, e.target.value)}
                  className="h-10 rounded-md border bg-white px-3 text-xs font-bold"
                >
                  <option value="new">Новый</option>
                  <option value="accepted">Принят</option>
                  <option value="preparing">Готовится</option>
                  <option value="ready">Готов</option>
                  <option value="served">Подан</option>
                  <option value="completed">Завершён</option>
                  <option value="cancelled">Отменён</option>
                </select>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-60 place-items-center border border-dashed border-[#020D13]/15 bg-white text-center">
          <div>
            <Utensils className="mx-auto mb-3 size-8 text-[#020D13]/25" />
            <p className="font-bold">Здесь пока нет заказов</p>
          </div>
        </div>
      )}
    </div>
  );
}
