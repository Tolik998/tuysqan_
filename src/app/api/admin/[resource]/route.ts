import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Resource =
  | "menu_items"
  | "categories"
  | "tables"
  | "promotions"
  | "restaurant_settings"
  | "orders";

const writableColumns: Record<Resource, ReadonlySet<string>> = {
  menu_items: new Set([
    "id",
    "category_id",
    "slug",
    "name_ru",
    "name_kk",
    "description_ru",
    "description_kk",
    "price",
    "image_url",
    "sort_order",
    "is_available",
    "is_visible_public",
    "is_visible_dine_in",
    "is_featured",
    "is_spicy",
    "is_new",
    "is_archived",
    "needs_review",
    "piece_count",
    "source",
  ]),
  categories: new Set([
    "id",
    "slug",
    "name_ru",
    "name_kk",
    "sort_order",
    "is_visible",
    "is_archived",
  ]),
  tables: new Set(["id", "label", "sort_order", "is_active", "is_archived"]),
  promotions: new Set([
    "id",
    "title_ru",
    "title_kk",
    "description_ru",
    "description_kk",
    "image_url",
    "start_date",
    "end_date",
    "is_active",
    "status",
    "minimum_order",
    "promotion_type",
    "needs_review",
    "is_archived",
  ]),
  restaurant_settings: new Set([
    "restaurant_name",
    "city",
    "address",
    "working_hours",
    "phone",
    "whatsapp",
    "instagram_url",
    "two_gis_url",
    "delivery_minimum",
    "delivery_text",
    "currency",
    "default_language",
    "notification_sound",
  ]),
  orders: new Set(["status"]),
};

const creatableResources = new Set<Resource>([
  "menu_items",
  "categories",
  "tables",
  "promotions",
]);
const archivableResources = new Set<Resource>([
  "menu_items",
  "categories",
  "tables",
  "promotions",
]);
const orderStatuses = new Set([
  "new",
  "accepted",
  "preparing",
  "ready",
  "served",
  "completed",
  "cancelled",
]);

function resourceName(value: string): Resource {
  if (!(value in writableColumns)) throw new Error("Unsupported resource");
  return value as Resource;
}

function objectBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("JSON object is required");
  }
  return value as Record<string, unknown>;
}

function sanitize(
  table: Resource,
  value: unknown,
  allowId: boolean,
): Record<string, unknown> {
  const body = objectBody(value);
  const allowed = writableColumns[table];
  const clean = Object.fromEntries(
    Object.entries(body).filter(
      ([key]) => allowed.has(key) && (allowId || key !== "id"),
    ),
  );
  if (!Object.keys(clean).length)
    throw new Error("No writable fields supplied");
  if (
    table === "orders" &&
    (typeof clean.status !== "string" || !orderStatuses.has(clean.status))
  ) {
    throw new Error("Unsupported order status");
  }
  return clean;
}

function errorResponse(error: unknown, fallback: string) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: 400 },
  );
}

export async function POST(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  if (!(await verifyAdmin()))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  try {
    const { resource } = await context.params;
    const table = resourceName(resource);
    if (!creatableResources.has(table)) {
      return NextResponse.json(
        { error: "Создание для этого раздела запрещено" },
        { status: 405 },
      );
    }
    const body = sanitize(table, await request.json(), true);
    const client = createAdminClient();
    if (!client) throw new Error("Supabase not configured");
    const result = await client.from(table).insert(body).select().single();
    if (result.error) throw result.error;
    return NextResponse.json(result.data);
  } catch (error) {
    return errorResponse(error, "Ошибка сохранения");
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  if (!(await verifyAdmin()))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  try {
    const { resource } = await context.params;
    const table = resourceName(resource);
    const body = objectBody(await request.json());
    const id = body.id;
    if (typeof id !== "string" || !id) throw new Error("id is required");
    const data = sanitize(table, body.data, false);
    const client = createAdminClient();
    if (!client) throw new Error("Supabase not configured");
    const result = await client
      .from(table)
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (result.error) throw result.error;
    if (table === "orders" && data.status && result.data.public_token) {
      const channel = client.channel(`order-${result.data.public_token}`);
      await channel.send({
        type: "broadcast",
        event: "status",
        payload: { status: data.status },
      });
      await client.removeChannel(channel);
    }
    return NextResponse.json(result.data);
  } catch (error) {
    return errorResponse(error, "Ошибка сохранения");
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  if (!(await verifyAdmin()))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  try {
    const { resource } = await context.params;
    const table = resourceName(resource);
    if (!archivableResources.has(table)) {
      return NextResponse.json(
        { error: "Удаление для этого раздела запрещено" },
        { status: 405 },
      );
    }
    const { id } = objectBody(await request.json());
    if (typeof id !== "string" || !id) throw new Error("id is required");
    const client = createAdminClient();
    if (!client) throw new Error("Supabase not configured");
    const result = await client
      .from(table)
      .update({ is_archived: true })
      .eq("id", id);
    if (result.error) throw result.error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Ошибка удаления");
  }
}
