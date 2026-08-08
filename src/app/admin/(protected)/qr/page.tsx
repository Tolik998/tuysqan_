import { QrAdmin } from "@/components/admin/qr-admin";
import { defaultTables } from "@/data/menu";
import { requireAdmin } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";
export default async function QrPage() {
  const { supabase } = await requireAdmin();
  const result = await supabase
    .from("tables")
    .select("id,label,sort_order,is_active")
    .eq("is_archived", false)
    .order("sort_order");
  const tables = result.data?.length
    ? result.data.map((t) => ({
        id: t.id,
        label: t.label,
        sortOrder: t.sort_order,
        isActive: t.is_active,
      }))
    : defaultTables;
  return <QrAdmin tables={tables} />;
}
