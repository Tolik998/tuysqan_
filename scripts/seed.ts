import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import {
  categories,
  defaultTables,
  menuItems,
  promotions,
  restaurantSettings,
  setItems,
} from "../src/data/menu";

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey)
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required",
  );
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

async function seed() {
  const categoryRows = categories.map((category) => ({
    id: category.id,
    slug: category.slug,
    name_ru: category.nameRu,
    name_kk: category.nameKk,
    sort_order: category.sortOrder,
    is_visible: category.isVisible,
  }));
  const itemRows = menuItems.map((item) => ({
    id: item.id,
    category_id: item.categoryId,
    slug: item.slug,
    name_ru: item.nameRu,
    name_kk: item.nameKk || null,
    description_ru: item.descriptionRu || null,
    description_kk: item.descriptionKk || null,
    price: item.price,
    image_url: item.imageUrl || null,
    sort_order: item.sortOrder,
    is_available: item.isAvailable,
    is_visible_public: item.isVisiblePublic,
    is_visible_dine_in: item.isVisibleDineIn,
    is_featured: item.isFeatured,
    is_spicy: item.isSpicy,
    is_new: item.isNew,
    is_archived: item.isArchived,
    needs_review: item.needsReview,
    piece_count: item.pieceCount || null,
    source: item.source,
  }));
  const tableRows = defaultTables.map((table) => ({
    id: table.id,
    label: table.label,
    sort_order: table.sortOrder,
    is_active: table.isActive,
  }));
  const promotionRows = promotions.map((promotion) => ({
    id: promotion.id,
    title_ru: promotion.titleRu,
    title_kk: promotion.titleKk || null,
    description_ru: promotion.descriptionRu,
    description_kk: promotion.descriptionKk || null,
    image_url: promotion.imageUrl || null,
    start_date: promotion.startDate || null,
    end_date: promotion.endDate || null,
    is_active: promotion.isActive,
    status: promotion.status,
    minimum_order: promotion.minimumOrder || null,
    promotion_type: promotion.type,
    needs_review: promotion.needsReview,
    is_archived: false,
  }));
  for (const [table, rows, key] of [
    ["categories", categoryRows, "id"],
    ["menu_items", itemRows, "id"],
    ["tables", tableRows, "id"],
    ["promotions", promotionRows, "id"],
  ] as const) {
    const result = await supabase
      .from(table)
      .upsert(rows as never, { onConflict: key });
    if (result.error) throw result.error;
  }
  await supabase.from("set_items").delete().neq("id", 0);
  const setResult = await supabase.from("set_items").insert(
    setItems.map((item) => ({
      set_id: item.setId,
      item_slug: item.itemSlug,
      quantity: item.quantity,
    })),
  );
  if (setResult.error) throw setResult.error;
  const settingsResult = await supabase.from("restaurant_settings").upsert(
    {
      id: "default",
      restaurant_name: restaurantSettings.name,
      city: restaurantSettings.city,
      address: restaurantSettings.address || null,
      phone: restaurantSettings.phone,
      whatsapp: restaurantSettings.whatsapp,
      instagram_url: restaurantSettings.instagramUrl,
      two_gis_url: restaurantSettings.twoGisUrl,
      working_hours: restaurantSettings.workingHours || null,
      delivery_minimum: restaurantSettings.deliveryMinimum,
      currency: restaurantSettings.currency,
      default_language: restaurantSettings.defaultLanguage,
    },
    { onConflict: "id" },
  );
  if (settingsResult.error) throw settingsResult.error;
  console.log(
    `Seeded ${categories.length} categories, ${menuItems.length} menu items, ${setItems.length} set links, ${promotions.length} promotions, and ${defaultTables.length} tables.`,
  );
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
