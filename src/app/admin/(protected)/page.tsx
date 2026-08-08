import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChefHat,
  EyeOff,
  ShoppingBag,
} from "lucide-react";
import { menuItems } from "@/data/menu";
import { requireAdmin } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  const { supabase } = await requireAdmin();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [orders, items] = await Promise.all([
    supabase
      .from("orders")
      .select("status,order_type")
      .gte("created_at", today.toISOString()),
    supabase
      .from("menu_items")
      .select("is_available,is_visible_public,is_archived"),
  ]);
  const orderRows = orders.data || [];
  const itemRows = items.data?.length
    ? items.data
    : menuItems.map((item) => ({
        is_available: item.isAvailable,
        is_visible_public: item.isVisiblePublic,
        is_archived: item.isArchived,
      }));
  const cards = [
    ["Заказов сегодня", orderRows.length, ShoppingBag],
    [
      "Новые",
      orderRows.filter((o) => o.status === "new").length,
      AlertTriangle,
    ],
    [
      "Готовятся",
      orderRows.filter((o) => o.status === "preparing").length,
      ChefHat,
    ],
    [
      "Завершены",
      orderRows.filter((o) => ["served", "completed"].includes(o.status))
        .length,
      CheckCircle2,
    ],
    ["Позиций меню", itemRows.filter((i) => !i.is_archived).length, BookOpen],
    [
      "Скрыто / нет",
      itemRows.filter((i) => !i.is_available || !i.is_visible_public).length,
      EyeOff,
    ],
  ] as const;
  return (
    <div>
      <h1 className="text-3xl font-bold">Обзор</h1>
      <p className="mt-2 text-sm text-[#020D13]/50">
        Оперативное состояние Tuysqan без выдуманной финансовой аналитики.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="border border-[#020D13]/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#020D13]/50">
                {label}
              </span>
              <Icon className="size-5 text-[#020D13]/35" />
            </div>
            <strong className="mt-6 block text-4xl">{value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
