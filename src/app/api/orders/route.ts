import { NextResponse } from "next/server";
import {
  clientIp,
  consumeRateLimit,
  exceedsBodyLimit,
  isTrustedMutation,
  noStoreHeaders,
} from "@/lib/request-security";
import { dineInOrderSchema, deliveryOrderSchema } from "@/lib/validation";
import { createAdminClient } from "@/lib/supabase/admin";

type MenuRow = {
  id: string;
  name_ru: string;
  price: number;
};

export async function POST(request: Request) {
  if (!isTrustedMutation(request))
    return NextResponse.json(
      { error: "Запрос отклонён" },
      { status: 403, headers: noStoreHeaders() },
    );
  if (exceedsBodyLimit(request, 100_000))
    return NextResponse.json(
      { error: "Запрос слишком большой" },
      { status: 413, headers: noStoreHeaders() },
    );
  const rateLimit = consumeRateLimit(
    `orders:${clientIp(request)}`,
    8,
    10 * 60_000,
  );
  if (!rateLimit.allowed)
    return NextResponse.json(
      { error: "Слишком много заказов. Попробуйте немного позже." },
      {
        status: 429,
        headers: noStoreHeaders({
          "Retry-After": String(rateLimit.retryAfterSeconds),
        }),
      },
    );
  try {
    const body = await request.json();
    const type = body.orderType === "dine_in" ? "dine_in" : "delivery";
    const parsed =
      type === "dine_in"
        ? dineInOrderSchema.safeParse(body)
        : deliveryOrderSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: "Проверьте поля заказа", details: parsed.error.flatten() },
        { status: 400 },
      );

    const supabase = createAdminClient();
    if (!supabase)
      return NextResponse.json(
        { error: "Подключение к системе заказов ещё не настроено" },
        { status: 503 },
      );

    const data = parsed.data;
    const isPickup =
      type === "delivery" &&
      "fulfillmentType" in data &&
      data.fulfillmentType === "pickup";
    const paymentLabel =
      type === "delivery" &&
      "paymentMethod" in data &&
      data.paymentMethod === "remote"
        ? "Удалённая оплата"
        : "Наличными";
    const storedComment =
      type === "delivery"
        ? [
            `Оплата: ${paymentLabel}`,
            data.comment ? `Комментарий: ${data.comment}` : null,
          ]
            .filter(Boolean)
            .join("\n")
        : data.comment || null;
    const itemIds = [...new Set(data.items.map((item) => item.menuItemId))];
    const visibilityField =
      type === "dine_in" ? "is_visible_dine_in" : "is_visible_public";
    const menuResult = await supabase
      .from("menu_items")
      .select("id,name_ru,price")
      .in("id", itemIds)
      .eq("is_archived", false)
      .eq("is_available", true)
      .eq(visibilityField, true);
    if (menuResult.error) throw menuResult.error;
    if (menuResult.data.length !== itemIds.length) {
      return NextResponse.json(
        {
          error:
            "Одна или несколько позиций больше недоступны. Обновите корзину.",
        },
        { status: 409 },
      );
    }

    if (type === "dine_in") {
      const tableResult = await supabase
        .from("tables")
        .select("id")
        .eq("id", "tableId" in data ? data.tableId : "")
        .eq("is_active", true)
        .eq("is_archived", false)
        .maybeSingle();
      if (tableResult.error || !tableResult.data) {
        return NextResponse.json(
          { error: "Выбранный стол недоступен" },
          { status: 409 },
        );
      }
    }

    const menuById = new Map(
      (menuResult.data as MenuRow[]).map((item) => [item.id, item]),
    );
    const snapshots = data.items.map((item) => {
      const menuItem = menuById.get(item.menuItemId)!;
      return {
        menu_item_id: menuItem.id,
        item_name_snapshot: menuItem.name_ru,
        price_snapshot: menuItem.price,
        quantity: item.quantity,
        line_total: menuItem.price * item.quantity,
      };
    });
    const total = snapshots.reduce((sum, item) => sum + item.line_total, 0);

    const numberResult = await supabase.rpc("next_order_number", {
      p_order_type: type,
    });
    if (numberResult.error || !numberResult.data)
      throw numberResult.error || new Error("Order number was not generated");
    const orderNumber = String(numberResult.data);
    const publicToken = type === "dine_in" ? crypto.randomUUID() : null;
    const orderInsert = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        order_type: type,
        status: "new",
        customer_name: data.customerName || null,
        customer_phone: null,
        delivery_address:
          "deliveryAddress" in data
            ? isPickup
              ? "Самовывоз"
              : data.deliveryAddress
            : null,
        entrance:
          "entrance" in data && !isPickup ? data.entrance || null : null,
        floor: "floor" in data && !isPickup ? data.floor || null : null,
        apartment:
          "apartment" in data && !isPickup ? data.apartment || null : null,
        table_id: "tableId" in data ? data.tableId : null,
        comment: storedComment,
        subtotal: total,
        total,
        public_token: publicToken,
      })
      .select("id, order_number")
      .single();
    if (orderInsert.error) throw orderInsert.error;

    const orderItems = snapshots.map((item) => ({
      order_id: orderInsert.data.id,
      ...item,
    }));
    const itemsInsert = await supabase.from("order_items").insert(orderItems);
    if (itemsInsert.error) {
      await supabase.from("orders").delete().eq("id", orderInsert.data.id);
      throw itemsInsert.error;
    }
    return NextResponse.json(
      {
        id: orderInsert.data.id,
        orderNumber,
        publicToken,
        total,
      },
      { headers: noStoreHeaders() },
    );
  } catch (error) {
    console.error("Order creation failed", error);
    return NextResponse.json(
      { error: "Не удалось отправить заказ. Попробуйте ещё раз." },
      { status: 500, headers: noStoreHeaders() },
    );
  }
}
