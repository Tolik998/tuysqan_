import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export async function POST(request: Request) {
  if (!(await verifyAdmin()))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  if (
    !(file instanceof File) ||
    !allowedImageTypes.has(file.type) ||
    file.size === 0 ||
    file.size > 8_000_000
  ) {
    return NextResponse.json(
      { error: "Нужно изображение JPG, PNG, WebP или AVIF размером до 8 МБ" },
      { status: 400 },
    );
  }

  const client = createAdminClient();
  if (!client)
    return NextResponse.json(
      { error: "Supabase не настроен" },
      { status: 503 },
    );

  const extension = file.type === "image/jpeg" ? "jpg" : file.type.slice(6);
  const path = `${crypto.randomUUID()}.${extension}`;
  const result = await client.storage.from("menu-images").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (result.error)
    return NextResponse.json({ error: result.error.message }, { status: 400 });

  return NextResponse.json({
    url: client.storage.from("menu-images").getPublicUrl(path).data.publicUrl,
  });
}
