"use client";

import Image from "next/image";
import { Archive, ImagePlus, Pencil, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import type { Category, MenuItem } from "@/types/domain";

const emptyDraft: Partial<MenuItem> = {
  nameRu: "",
  nameKk: "",
  descriptionRu: "",
  descriptionKk: "",
  price: 0,
  categoryId: "",
  isAvailable: true,
  isVisiblePublic: true,
  isVisibleDineIn: true,
  isFeatured: false,
  isSpicy: false,
  isNew: false,
  needsReview: false,
};

export function MenuAdmin({
  initialItems,
  categories,
}: {
  initialItems: MenuItem[];
  categories: Category[];
}) {
  const [items, setItems] = useState(initialItems);
  const [query, setQuery] = useState("");
  const [reviewOnly, setReviewOnly] = useState(false);
  const [draft, setDraft] = useState<Partial<MenuItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          (!reviewOnly || item.needsReview) &&
          [item.nameRu, item.nameKk].some((value) =>
            value?.toLowerCase().includes(query.toLowerCase()),
          ),
      ),
    [items, query, reviewOnly],
  );
  async function save() {
    if (!draft?.nameRu || !draft.categoryId || !draft.price)
      return setError("Заполните название, категорию и цену");
    setSaving(true);
    setError("");
    const isNew = !draft.id;
    const id = draft.id || `item-${crypto.randomUUID()}`;
    const slug =
      draft.slug ||
      draft.nameRu
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^a-zа-яё0-9]+/gi, "-")
        .replace(/^-|-$/g, "") + `-${Date.now().toString().slice(-4)}`;
    const payload = {
      id,
      category_id: draft.categoryId,
      slug,
      name_ru: draft.nameRu,
      name_kk: draft.nameKk || null,
      description_ru: draft.descriptionRu || null,
      description_kk: draft.descriptionKk || null,
      price: Number(draft.price),
      image_url: draft.imageUrl || null,
      sort_order: draft.sortOrder || items.length + 1,
      is_available: draft.isAvailable ?? true,
      is_visible_public: draft.isVisiblePublic ?? true,
      is_visible_dine_in: draft.isVisibleDineIn ?? true,
      is_featured: draft.isFeatured ?? false,
      is_spicy: draft.isSpicy ?? false,
      is_new: draft.isNew ?? false,
      is_archived: false,
      needs_review: draft.needsReview ?? false,
      source: draft.source || "menu_pdf",
    };
    const response = await fetch("/api/admin/menu_items", {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isNew ? payload : { id, data: payload }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Ошибка");
      setSaving(false);
      return;
    }
    const mapped = mapRow(result);
    setItems((current) =>
      isNew
        ? [mapped, ...current]
        : current.map((item) => (item.id === id ? mapped : item)),
    );
    setDraft(null);
    setSaving(false);
  }
  async function toggle(
    item: MenuItem,
    key: "is_available" | "is_visible_public" | "is_visible_dine_in",
  ) {
    const value =
      key === "is_available"
        ? !item.isAvailable
        : key === "is_visible_public"
          ? !item.isVisiblePublic
          : !item.isVisibleDineIn;
    const response = await fetch("/api/admin/menu_items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, data: { [key]: value } }),
    });
    if (response.ok)
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? {
                ...entry,
                [key === "is_available"
                  ? "isAvailable"
                  : key === "is_visible_public"
                    ? "isVisiblePublic"
                    : "isVisibleDineIn"]: value,
              }
            : entry,
        ),
      );
  }
  async function archive(id: string) {
    if (!confirm("Архивировать блюдо?")) return;
    const response = await fetch("/api/admin/menu_items", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (response.ok)
      setItems((current) => current.filter((item) => item.id !== id));
  }
  async function upload(file: File) {
    setSaving(true);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });
    const result = await response.json();
    if (response.ok)
      setDraft((current) => ({ ...current, imageUrl: result.url }));
    else setError(result.error);
    setSaving(false);
  }
  function removePhoto() {
    setDraft((current) => ({ ...current, imageUrl: undefined }));
  }
  return (
    <div>
      <AdminTitle
        title="Меню"
        subtitle={`${items.length} позиций · полный каталог Tuysqan`}
        action={
          <Button
            onClick={() =>
              setDraft({ ...emptyDraft, categoryId: categories[0]?.id })
            }
          >
            <Plus className="size-4" />
            Добавить блюдо
          </Button>
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#020D13]/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию"
            className="pl-11"
          />
        </label>
        <button
          onClick={() => setReviewOnly((v) => !v)}
          className={`min-h-12 rounded-md border px-4 text-sm font-bold ${reviewOnly ? "bg-amber-100 border-amber-300" : "bg-white border-[#020D13]/10"}`}
        >
          Требует проверки
        </button>
      </div>
      <div className="overflow-x-auto border border-[#020D13]/10 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#020D13]/4 text-xs uppercase tracking-wide text-[#020D13]/45">
            <tr>
              <th className="p-4">Блюдо</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Наличие</th>
              <th>Сайт</th>
              <th>QR</th>
              <th className="pr-4 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr key={item.id} className="border-t border-[#020D13]/8">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-12 overflow-hidden bg-[#020D13]">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="max-w-xs font-bold">{item.nameRu}</p>
                      {item.needsReview && (
                        <span className="text-[10px] font-bold uppercase text-amber-700">
                          Требует проверки
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  {categories.find((c) => c.id === item.categoryId)?.nameRu}
                </td>
                <td className="font-bold">{formatPrice(item.price)}</td>
                <td>
                  <Toggle
                    checked={item.isAvailable}
                    onClick={() => toggle(item, "is_available")}
                  />
                </td>
                <td>
                  <Toggle
                    checked={item.isVisiblePublic}
                    onClick={() => toggle(item, "is_visible_public")}
                  />
                </td>
                <td>
                  <Toggle
                    checked={item.isVisibleDineIn}
                    onClick={() => toggle(item, "is_visible_dine_in")}
                  />
                </td>
                <td className="pr-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setDraft(item)}
                      className="grid size-10 place-items-center rounded hover:bg-[#020D13]/5"
                      aria-label="Редактировать"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => archive(item.id)}
                      className="grid size-10 place-items-center rounded text-red-700 hover:bg-red-50"
                      aria-label="Архивировать"
                    >
                      <Archive className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {draft && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-[#020D13]/65 p-0 backdrop-blur-sm sm:place-items-center sm:p-5">
          <div className="max-h-[94dvh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-[#FFFBFC] p-5 sm:rounded-xl sm:p-7">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {draft.id ? "Редактировать блюдо" : "Новое блюдо"}
              </h2>
              <button
                onClick={() => setDraft(null)}
                className="grid size-10 place-items-center"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Название RU">
                <Input
                  value={draft.nameRu || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, nameRu: e.target.value })
                  }
                />
              </Field>
              <Field label="Название KZ">
                <Input
                  value={draft.nameKk || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, nameKk: e.target.value })
                  }
                />
              </Field>
              <Field label="Описание RU">
                <Textarea
                  value={draft.descriptionRu || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, descriptionRu: e.target.value })
                  }
                />
              </Field>
              <Field label="Описание KZ">
                <Textarea
                  value={draft.descriptionKk || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, descriptionKk: e.target.value })
                  }
                />
              </Field>
              <Field label="Цена">
                <Input
                  type="number"
                  min="0"
                  value={draft.price || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, price: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Категория">
                <select
                  value={draft.categoryId || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, categoryId: e.target.value })
                  }
                  className="h-12 rounded-md border bg-white px-4"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameRu}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Фото">
                  <div className="flex items-center gap-4">
                    {draft.imageUrl && (
                      <div className="relative size-20 overflow-hidden bg-[#020D13]">
                        <Image
                          src={draft.imageUrl}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-4 text-sm font-bold">
                      <ImagePlus className="size-4" />
                      Загрузить
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] && upload(e.target.files[0])
                        }
                      />
                    </label>
                    {draft.imageUrl && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="min-h-11 rounded-md border border-red-200 px-4 text-sm font-bold text-red-700"
                      >
                        Удалить фото
                      </button>
                    )}
                  </div>
                </Field>
              </div>
              <div className="sm:col-span-2 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["isAvailable", "В наличии"],
                  ["isVisiblePublic", "На сайте"],
                  ["isVisibleDineIn", "В QR"],
                  ["isFeatured", "Рекомендуем"],
                  ["isSpicy", "Острое"],
                  ["isNew", "Новинка"],
                  ["needsReview", "Проверить"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 rounded-md border bg-white p-3 text-xs font-bold"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(draft[key as keyof MenuItem])}
                      onChange={(e) =>
                        setDraft({ ...draft, [key]: e.target.checked })
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            {error && (
              <p className="mt-4 rounded bg-red-50 p-3 text-sm text-red-800">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDraft(null)}>
                Отмена
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "Сохранение…" : "Сохранить"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function mapRow(row: Record<string, unknown>): MenuItem {
  return {
    id: String(row.id),
    categoryId: String(row.category_id),
    slug: String(row.slug),
    nameRu: String(row.name_ru),
    nameKk: row.name_kk ? String(row.name_kk) : undefined,
    descriptionRu: row.description_ru ? String(row.description_ru) : undefined,
    descriptionKk: row.description_kk ? String(row.description_kk) : undefined,
    price: Number(row.price),
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    sortOrder: Number(row.sort_order),
    isAvailable: Boolean(row.is_available),
    isVisiblePublic: Boolean(row.is_visible_public),
    isVisibleDineIn: Boolean(row.is_visible_dine_in),
    isFeatured: Boolean(row.is_featured),
    isSpicy: Boolean(row.is_spicy),
    isNew: Boolean(row.is_new),
    isArchived: Boolean(row.is_archived),
    needsReview: Boolean(row.needs_review),
    pieceCount: row.piece_count ? Number(row.piece_count) : undefined,
    source: (row.source as MenuItem["source"]) || "menu_pdf",
  };
}
function Toggle({
  checked,
  onClick,
}: {
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-emerald-600" : "bg-[#020D13]/15"}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 size-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`}
      />
    </button>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      {children}
    </label>
  );
}
export function AdminTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-[#020D13]/50">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
