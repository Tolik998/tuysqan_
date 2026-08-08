import { NextResponse } from "next/server";
import { noStoreHeaders } from "@/lib/request-security";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const token = new URL(request.url).searchParams.get("token");
  if (!token)
    return NextResponse.json(
      { error: "Нет доступа" },
      { status: 403, headers: noStoreHeaders() },
    );
  const supabase = createAdminClient();
  if (!supabase)
    return NextResponse.json(
      { error: "Система заказов не настроена" },
      { status: 503, headers: noStoreHeaders() },
    );
  const result = await supabase
    .from("orders")
    .select(
      "id,order_number,status,total,created_at,tables(label),order_items(item_name_snapshot,price_snapshot,quantity,line_total)",
    )
    .eq("id", id)
    .eq("public_token", token)
    .single();
  if (result.error)
    return NextResponse.json(
      { error: "Заказ не найден" },
      { status: 404, headers: noStoreHeaders() },
    );
  return NextResponse.json(result.data, { headers: noStoreHeaders() });
}
