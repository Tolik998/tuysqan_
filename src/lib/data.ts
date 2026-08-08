import "server-only";

import {
  categories as fallbackCategories,
  menuItems as fallbackItems,
  promotions as fallbackPromotions,
  restaurantSettings,
} from "@/data/menu";
import { createClient } from "@/lib/supabase/server";
import type { Category, MenuItem, Promotion } from "@/types/domain";

type CategoryRow = {
  id: string;
  slug: string;
  name_ru: string;
  name_kk: string | null;
  sort_order: number;
  is_visible: boolean;
};

type MenuRow = {
  id: string;
  category_id: string;
  slug: string;
  name_ru: string;
  name_kk: string | null;
  description_ru: string | null;
  description_kk: string | null;
  price: number;
  image_url: string | null;
  sort_order: number;
  is_available: boolean;
  is_visible_public: boolean;
  is_visible_dine_in: boolean;
  is_featured: boolean;
  is_spicy: boolean;
  is_new: boolean;
  is_archived: boolean;
  needs_review: boolean;
  piece_count: number | null;
  source: MenuItem["source"];
};

export function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    nameRu: row.name_ru,
    nameKk: row.name_kk || "",
    sortOrder: row.sort_order,
    isVisible: row.is_visible,
  };
}

export function mapMenuRow(row: MenuRow): MenuItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    slug: row.slug,
    nameRu: row.name_ru,
    nameKk: row.name_kk || undefined,
    descriptionRu: row.description_ru || undefined,
    descriptionKk: row.description_kk || undefined,
    price: row.price,
    imageUrl: row.image_url || undefined,
    sortOrder: row.sort_order,
    isAvailable: row.is_available,
    isVisiblePublic: row.is_visible_public,
    isVisibleDineIn: row.is_visible_dine_in,
    isFeatured: row.is_featured,
    isSpicy: row.is_spicy,
    isNew: row.is_new,
    isArchived: row.is_archived,
    needsReview: row.needs_review,
    pieceCount: row.piece_count || undefined,
    source: row.source,
  };
}

export async function getMenuData(
  mode: "public" | "dine_in" = "public",
): Promise<{
  categories: Category[];
  items: MenuItem[];
}> {
  const supabase = await createClient();
  if (!supabase)
    return { categories: fallbackCategories, items: fallbackItems };
  const visibilityField =
    mode === "dine_in" ? "is_visible_dine_in" : "is_visible_public";
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
      .eq(visibilityField, true)
      .order("sort_order"),
  ]);
  if (
    categoryResult.error ||
    itemResult.error ||
    !categoryResult.data?.length ||
    !itemResult.data?.length
  )
    return { categories: fallbackCategories, items: fallbackItems };
  const categories = (categoryResult.data as CategoryRow[]).map(mapCategoryRow);
  const visibleCategoryIds = new Set(categories.map((category) => category.id));
  const items = (itemResult.data as MenuRow[]).map(mapMenuRow);

  return {
    categories,
    items: items.filter((item) => visibleCategoryIds.has(item.categoryId)),
  };
}

export async function getActivePromotions(): Promise<Promotion[]> {
  const supabase = await createClient();
  if (!supabase) return fallbackPromotions.filter((item) => item.isActive);
  const result = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .eq("status", "active")
    .eq("is_archived", false);
  if (result.error) return fallbackPromotions.filter((item) => item.isActive);
  return result.data.map((row) => ({
    id: row.id,
    titleRu: row.title_ru,
    titleKk: row.title_kk || undefined,
    descriptionRu: row.description_ru || "",
    descriptionKk: row.description_kk || undefined,
    imageUrl: row.image_url || undefined,
    startDate: row.start_date || undefined,
    endDate: row.end_date || undefined,
    isActive: row.is_active,
    status: row.status,
    minimumOrder: row.minimum_order || undefined,
    type: row.promotion_type,
    needsReview: row.needs_review,
  })) as Promotion[];
}

export async function getRestaurantSettings() {
  const supabase = await createClient();
  if (!supabase) return restaurantSettings;
  const result = await supabase
    .from("restaurant_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  if (result.error || !result.data) return restaurantSettings;
  return {
    name: result.data.restaurant_name,
    city: result.data.city,
    address: result.data.address || "",
    workingHours: result.data.working_hours || "",
    phone: result.data.phone || restaurantSettings.phone,
    whatsapp: result.data.whatsapp || restaurantSettings.whatsapp,
    instagramUrl: result.data.instagram_url || restaurantSettings.instagramUrl,
    twoGisUrl: result.data.two_gis_url || restaurantSettings.twoGisUrl,
    deliveryMinimum: result.data.delivery_minimum,
    currency: result.data.currency,
    defaultLanguage: result.data.default_language,
  };
}
