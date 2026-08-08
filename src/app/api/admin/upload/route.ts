import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import {
  consumeRateLimit,
  isTrustedMutation,
  noStoreHeaders,
} from "@/lib/request-security";

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

function hasImageSignature(type: string, bytes: Uint8Array) {
  const startsWith = (signature: number[]) =>
    signature.every((value, index) => bytes[index] === value);
  if (type === "image/jpeg") return startsWith([0xff, 0xd8, 0xff]);
  if (type === "image/png")
    return startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ascii = (start: number, value: string) =>
    [...value].every(
      (character, index) => bytes[start + index] === character.charCodeAt(0),
    );
  if (type === "image/webp") return ascii(0, "RIFF") && ascii(8, "WEBP");
  if (type === "image/avif")
    return (
      ascii(4, "ftyp") && ["avif", "avis"].some((brand) => ascii(8, brand))
    );
  return false;
}

export async function POST(request: Request) {
  if (!isTrustedMutation(request))
    return NextResponse.json(
      { error: "Нет доступа" },
      { status: 403, headers: noStoreHeaders() },
    );
  const admin = await verifyAdmin();
  if (!admin)
    return NextResponse.json(
      { error: "Нет доступа" },
      { status: 403, headers: noStoreHeaders() },
    );
  const rateLimit = consumeRateLimit(
    `admin-upload:${admin.user.id}`,
    20,
    60_000,
  );
  if (!rateLimit.allowed)
    return NextResponse.json(
      { error: "Слишком много загрузок. Попробуйте позже." },
      {
        status: 429,
        headers: noStoreHeaders({
          "Retry-After": String(rateLimit.retryAfterSeconds),
        }),
      },
    );

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
      { status: 400, headers: noStoreHeaders() },
    );
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasImageSignature(file.type, bytes))
    return NextResponse.json(
      { error: "Содержимое файла не соответствует формату изображения" },
      { status: 400, headers: noStoreHeaders() },
    );

  const extension = file.type === "image/jpeg" ? "jpg" : file.type.slice(6);
  const path = `${crypto.randomUUID()}.${extension}`;
  const result = await admin.supabase.storage
    .from("menu-images")
    .upload(path, bytes, {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (result.error)
    return NextResponse.json(
      { error: "Не удалось загрузить изображение" },
      { status: 400, headers: noStoreHeaders() },
    );

  return NextResponse.json(
    {
      url: admin.supabase.storage.from("menu-images").getPublicUrl(path).data
        .publicUrl,
    },
    { headers: noStoreHeaders() },
  );
}
