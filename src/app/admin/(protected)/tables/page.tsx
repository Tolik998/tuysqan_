import { SimpleAdmin } from "@/components/admin/simple-admin";
import { defaultTables } from "@/data/menu";
import { requireAdmin } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";
export default async function TablesPage() {
  const { supabase } = await requireAdmin();
  const result = await supabase
    .from("tables")
    .select("*")
    .eq("is_archived", false)
    .order("sort_order");
  const rows = (
    result.data?.length
      ? result.data
      : defaultTables.map((t) => ({
          id: t.id,
          label: t.label,
          sort_order: t.sortOrder,
          is_active: t.isActive,
        }))
  ).map((row) => ({
    id: row.id,
    name: row.label,
    active: row.is_active,
    raw: row,
  }));
  return (
    <SimpleAdmin
      title="Столы"
      subtitle="Этот список используется гостями в QR-заказе"
      resource="tables"
      kind="table"
      initialRows={rows}
    />
  );
}
