import { OrdersAdmin } from "@/components/admin/orders-admin";
import { requireAdmin } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";
export default async function OrdersPage() {
  const { supabase } = await requireAdmin();
  const result = await supabase
    .from("orders")
    .select(
      "*,tables(label),order_items(item_name_snapshot,quantity,line_total)",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  return <OrdersAdmin initialOrders={(result.data || []) as never[]} />;
}
