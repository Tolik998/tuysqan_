import { Suspense } from "react";
import { DineInCart } from "@/components/dine-in/dine-in-cart";
import { defaultTables } from "@/data/menu";
import { createClient } from "@/lib/supabase/server";

async function tables() {
  const supabase = await createClient();
  if (!supabase) return defaultTables;
  const result = await supabase
    .from("tables")
    .select("id,label,sort_order,is_active")
    .eq("is_archived", false)
    .order("sort_order");
  if (result.error || !result.data.length) return defaultTables;
  return result.data.map((table) => ({
    id: table.id,
    label: table.label,
    sortOrder: table.sort_order,
    isActive: table.is_active,
  }));
}
export default async function DineInCartPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
      <Suspense>
        <DineInCart tables={await tables()} />
      </Suspense>
    </main>
  );
}
