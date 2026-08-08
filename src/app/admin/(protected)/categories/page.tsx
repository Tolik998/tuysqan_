import { SimpleAdmin } from "@/components/admin/simple-admin";
import { categories } from "@/data/menu";
import { requireAdmin } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";
export default async function CategoriesPage() {
  const { supabase } = await requireAdmin();
  const result = await supabase
    .from("categories")
    .select("*")
    .eq("is_archived", false)
    .order("sort_order");
  const rows = (
    result.data?.length
      ? result.data
      : categories.map((c) => ({
          id: c.id,
          slug: c.slug,
          name_ru: c.nameRu,
          name_kk: c.nameKk,
          sort_order: c.sortOrder,
          is_visible: c.isVisible,
        }))
  ).map((row) => ({
    id: row.id,
    name: row.name_ru,
    secondary: row.name_kk || undefined,
    active: row.is_visible,
    raw: row,
  }));
  return (
    <SimpleAdmin
      title="Категории"
      subtitle="Порядок и видимость разделов общего меню"
      resource="categories"
      kind="category"
      initialRows={rows}
    />
  );
}
