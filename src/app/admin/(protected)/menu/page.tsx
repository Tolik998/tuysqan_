import { MenuAdmin } from "@/components/admin/menu-admin";
import { categories as fallbackCategories, menuItems } from "@/data/menu";
import { requireAdmin } from "@/lib/admin-auth";
import { mapCategoryRow, mapMenuRow } from "@/lib/data";
export const dynamic = "force-dynamic";
export default async function AdminMenuPage() {
  const { supabase } = await requireAdmin();
  const [categoryResult, itemResult] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("is_archived", false)
      .order("sort_order"),
    supabase
      .from("menu_items")
      .select("*")
      .eq("is_archived", false)
      .order("sort_order"),
  ]);
  const categories = categoryResult.error
    ? fallbackCategories
    : categoryResult.data.map(mapCategoryRow);
  const items = itemResult.error ? menuItems : itemResult.data.map(mapMenuRow);
  return <MenuAdmin initialItems={items} categories={categories} />;
}
