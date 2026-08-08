import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin } from "@/lib/admin-auth";
import {
  consumeRateLimit,
  exceedsBodyLimit,
  isTrustedMutation,
  noStoreHeaders,
} from "@/lib/request-security";

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
const orderStatusValues = [
  "new",
  "accepted",
  "preparing",
  "ready",
  "served",
  "completed",
  "cancelled",
] as const;
const orderStatuses = new Set<string>(orderStatusValues);

const idSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/);
const slugSchema = z
  .string()
  .min(1)
  .max(180)
  .regex(/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u);
const shortText = z.string().trim().min(1).max(180);
const optionalText = z.string().trim().max(2_000).nullable();
const imageUrlSchema = z
  .string()
  .trim()
  .max(2_048)
  .refine((value) => {
    if (value.startsWith("/") && !value.startsWith("//")) return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  })
  .nullable();
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable();

const resourceSchemas: Record<Resource, z.ZodType<Record<string, unknown>>> = {
  menu_items: z
    .object({
      id: idSchema.optional(),
      category_id: idSchema.optional(),
      slug: slugSchema.optional(),
      name_ru: shortText.optional(),
      name_kk: z.string().trim().max(180).nullable().optional(),
      description_ru: optionalText.optional(),
      description_kk: optionalText.optional(),
      price: z.number().int().min(0).max(10_000_000).optional(),
      image_url: imageUrlSchema.optional(),
      sort_order: z.number().int().min(0).max(100_000).optional(),
      is_available: z.boolean().optional(),
      is_visible_public: z.boolean().optional(),
      is_visible_dine_in: z.boolean().optional(),
      is_featured: z.boolean().optional(),
      is_spicy: z.boolean().optional(),
      is_new: z.boolean().optional(),
      is_archived: z.boolean().optional(),
      needs_review: z.boolean().optional(),
      piece_count: z.number().int().min(1).max(1_000).nullable().optional(),
      source: z
        .enum(["menu_pdf", "sushi_graphic", "promotion_graphic"])
        .optional(),
    })
    .strict(),
  categories: z
    .object({
      id: idSchema.optional(),
      slug: slugSchema.optional(),
      name_ru: shortText.optional(),
      name_kk: z.string().trim().max(180).nullable().optional(),
      sort_order: z.number().int().min(0).max(100_000).optional(),
      is_visible: z.boolean().optional(),
      is_archived: z.boolean().optional(),
    })
    .strict(),
  tables: z
    .object({
      id: idSchema.optional(),
      label: shortText.optional(),
      sort_order: z.number().int().min(0).max(100_000).optional(),
      is_active: z.boolean().optional(),
      is_archived: z.boolean().optional(),
    })
    .strict(),
  promotions: z
    .object({
      id: idSchema.optional(),
      title_ru: shortText.optional(),
      title_kk: z.string().trim().max(180).nullable().optional(),
      description_ru: z.string().trim().min(1).max(2_000).optional(),
      description_kk: optionalText.optional(),
      image_url: imageUrlSchema.optional(),
      start_date: dateSchema.optional(),
      end_date: dateSchema.optional(),
      is_active: z.boolean().optional(),
      status: z.enum(["draft", "active", "expired"]).optional(),
      minimum_order: z
        .number()
        .int()
        .min(0)
        .max(10_000_000)
        .nullable()
        .optional(),
      promotion_type: z
        .enum(["gift", "discount", "delivery", "set"])
        .optional(),
      needs_review: z.boolean().optional(),
      is_archived: z.boolean().optional(),
    })
    .strict(),
  restaurant_settings: z
    .object({
      restaurant_name: shortText.optional(),
      city: shortText.optional(),
      address: z.string().trim().max(300).nullable().optional(),
      working_hours: z.string().trim().max(500).nullable().optional(),
      phone: z.string().trim().max(40).nullable().optional(),
      whatsapp: z
        .string()
        .trim()
        .max(32)
        .regex(/^\+?\d*$/)
        .nullable()
        .optional(),
      instagram_url: imageUrlSchema.optional(),
      two_gis_url: imageUrlSchema.optional(),
      delivery_minimum: z.number().int().min(0).max(10_000_000).optional(),
      delivery_text: z.string().trim().max(1_000).nullable().optional(),
      currency: z.string().trim().min(3).max(8).optional(),
      default_language: z.enum(["ru", "kk"]).optional(),
      notification_sound: z.boolean().optional(),
    })
    .strict(),
  orders: z.object({ status: z.enum(orderStatusValues) }).strict(),
};

const requiredOnCreate: Partial<Record<Resource, string[]>> = {
  menu_items: ["id", "category_id", "slug", "name_ru", "price"],
  categories: ["id", "slug", "name_ru"],
  tables: ["id", "label"],
  promotions: ["id", "title_ru", "description_ru", "promotion_type"],
};

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
  const parsed = resourceSchemas[table].safeParse(clean);
  if (!parsed.success) throw new Error("Некорректные данные");
  if (
    allowId &&
    requiredOnCreate[table]?.some(
      (key) => parsed.data[key] === undefined || parsed.data[key] === null,
    )
  ) {
    throw new Error("Заполнены не все обязательные поля");
  }
  return parsed.data;
}

function errorResponse(error: unknown, fallback: string) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: 400, headers: noStoreHeaders() },
  );
}

async function authorize(request: Request) {
  if (!isTrustedMutation(request)) return null;
  if (exceedsBodyLimit(request, 1_000_000)) return null;
  const admin = await verifyAdmin();
  if (!admin) return null;
  const rateLimit = consumeRateLimit(`admin:${admin.user.id}`, 180, 60_000);
  return rateLimit.allowed ? admin : null;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ resource: string }> },
) {
  const admin = await authorize(request);
  if (!admin)
    return NextResponse.json(
      { error: "Нет доступа" },
      { status: 403, headers: noStoreHeaders() },
    );
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
    const result = await admin.supabase
      .from(table)
      .insert(body as never)
      .select()
      .single();
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
  const admin = await authorize(request);
  if (!admin)
    return NextResponse.json(
      { error: "Нет доступа" },
      { status: 403, headers: noStoreHeaders() },
    );
  try {
    const { resource } = await context.params;
    const table = resourceName(resource);
    const body = objectBody(await request.json());
    const id = body.id;
    if (typeof id !== "string" || !id) throw new Error("id is required");
    const data = sanitize(table, body.data, false);
    const result = await admin.supabase
      .from(table)
      .update(data as never)
      .eq("id", id)
      .select()
      .single();
    if (result.error) throw result.error;
    if (table === "orders" && data.status && result.data.public_token) {
      const channel = admin.supabase.channel(
        `order-${result.data.public_token}`,
      );
      await channel.send({
        type: "broadcast",
        event: "status",
        payload: { status: data.status },
      });
      await admin.supabase.removeChannel(channel);
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
  const admin = await authorize(request);
  if (!admin)
    return NextResponse.json(
      { error: "Нет доступа" },
      { status: 403, headers: noStoreHeaders() },
    );
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
    const result = await admin.supabase
      .from(table)
      .update({ is_archived: true })
      .eq("id", id);
    if (result.error) throw result.error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Ошибка удаления");
  }
}
