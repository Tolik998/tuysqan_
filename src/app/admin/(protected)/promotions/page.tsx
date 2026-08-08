import { SimpleAdmin } from "@/components/admin/simple-admin";
import { promotions } from "@/data/menu";
import { requireAdmin } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";
export default async function PromotionsPage() {
  const { supabase } = await requireAdmin();
  const result = await supabase
    .from("promotions")
    .select("*")
    .eq("is_archived", false)
    .order("created_at", { ascending: false });
  const fallback = promotions.map((p) => ({
    id: p.id,
    title_ru: p.titleRu,
    title_kk: p.titleKk || null,
    description_ru: p.descriptionRu,
    is_active: p.isActive,
    status: p.status,
    needs_review: p.needsReview,
    promotion_type: p.type,
    is_archived: false,
  }));
  const rows = (result.data?.length ? result.data : fallback).map((row) => ({
    id: row.id,
    name: row.title_ru,
    secondary: row.title_kk || undefined,
    active: row.is_active,
    meta: row.needs_review ? "Требует проверки года/условий" : undefined,
    raw: row,
  }));
  return (
    <SimpleAdmin
      title="Акции"
      subtitle="Черновики с датами без года не публикуются автоматически"
      resource="promotions"
      kind="promotion"
      initialRows={rows}
    />
  );
}
