import { ArchivedMenuAdmin } from "@/components/admin/archived-menu-admin";
import { categories as fallbackCategories } from "@/data/menu";
import { requireAdmin } from "@/lib/admin-auth";
import { mapCategoryRow, mapMenuRow } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminArchivePage() {
  const { supabase } = await requireAdmin();
  const [categoryResult, itemResult] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase
      .from("menu_items")
      .select("*")
      .eq("is_archived", true)
      .order("sort_order"),
  ]);

  const categories = categoryResult.error
    ? fallbackCategories
    : categoryResult.data.map(mapCategoryRow);
  const items = itemResult.error ? [] : itemResult.data.map(mapMenuRow);

  return (
    <ArchivedMenuAdmin
      initialItems={items}
      categories={categories}
      loadError={itemResult.error ? "Не удалось загрузить архив" : ""}
    />
  );
}
