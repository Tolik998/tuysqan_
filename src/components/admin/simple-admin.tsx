"use client";

import { Archive, ImagePlus, Pencil, Plus, X } from "lucide-react";
import { useState } from "react";
import { AdminPortal } from "@/components/admin/admin-portal";
import { AdminTitle } from "@/components/admin/menu-admin";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

type Row = {
  id: string;
  name: string;
  secondary?: string;
  active: boolean;
  meta?: string;
  raw: Record<string, unknown>;
};
export function SimpleAdmin({
  title,
  subtitle,
  resource,
  initialRows,
  kind,
}: {
  title: string;
  subtitle: string;
  resource: "categories" | "tables" | "promotions";
  initialRows: Row[];
  kind: "category" | "table" | "promotion";
}) {
  const [rows, setRows] = useState(initialRows);
  const [draft, setDraft] = useState<Row | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function save() {
    if (!draft?.name) return;
    setSaving(true);
    setError("");
    const isNew = !draft.raw._existing;
    const id = draft.id || `${kind}-${crypto.randomUUID()}`;
    const payload =
      kind === "category"
        ? {
            id,
            slug: String(draft.raw.slug || id),
            name_ru: draft.name,
            name_kk: draft.secondary || null,
            sort_order: Number(draft.raw.sort_order || rows.length + 1),
            is_visible: draft.active,
            is_archived: false,
          }
        : kind === "table"
          ? {
              id,
              label: draft.name,
              sort_order: Number(draft.raw.sort_order || rows.length + 1),
              is_active: draft.active,
              is_archived: false,
            }
          : {
              id,
              title_ru: draft.name,
              title_kk: draft.secondary || null,
              description_ru: String(draft.raw.description_ru || ""),
              description_kk: null,
              image_url: draft.raw.image_url || null,
              is_active: draft.active,
              status: draft.raw.status || "draft",
              minimum_order: draft.raw.minimum_order || null,
              promotion_type: draft.raw.promotion_type || "set",
              needs_review: Boolean(draft.raw.needs_review),
              start_date: draft.raw.start_date || null,
              end_date: draft.raw.end_date || null,
              is_archived: false,
            };
    const response = await fetch(`/api/admin/${resource}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isNew ? payload : { id, data: payload }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error);
      setSaving(false);
      return;
    }
    const mapped = mapSimple(result, kind);
    setRows((current) =>
      isNew
        ? [mapped, ...current]
        : current.map((row) => (row.id === id ? mapped : row)),
    );
    setDraft(null);
    setSaving(false);
  }
  async function archive(id: string) {
    if (!confirm("Архивировать запись?")) return;
    setError("");
    const response = await fetch(`/api/admin/${resource}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (response.ok) {
      setRows((current) => current.filter((row) => row.id !== id));
      return;
    }
    const result = await response.json().catch(() => ({}));
    setError(result.error || "Не удалось архивировать запись");
  }
  async function uploadPromotionImage(file: File) {
    if (!draft) return;
    setSaving(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: form,
    });
    const result = await response.json();
    if (response.ok) {
      setDraft((current) =>
        current
          ? { ...current, raw: { ...current.raw, image_url: result.url } }
          : current,
      );
    } else {
      setError(result.error || "Не удалось загрузить изображение");
    }
    setSaving(false);
  }
  return (
    <div>
      <AdminTitle
        title={title}
        subtitle={subtitle}
        action={
          <Button
            onClick={() =>
              setDraft({
                id: "",
                name: "",
                secondary: "",
                active: true,
                raw: {},
              })
            }
          >
            <Plus className="size-4" />
            Добавить
          </Button>
        }
      />
      {!draft && error && (
        <p className="mb-5 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800">
          {error}
        </p>
      )}
      <div className="grid gap-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center justify-between gap-4 border border-[#020D13]/10 bg-white p-4"
          >
            <div>
              <p className="font-bold">{row.name}</p>
              {row.secondary && (
                <p className="mt-1 text-sm text-[#020D13]/45">
                  {row.secondary}
                </p>
              )}
              {row.meta && (
                <p className="mt-1 text-xs font-semibold text-amber-700">
                  {row.meta}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${row.active ? "bg-emerald-50 text-emerald-700" : "bg-[#020D13]/6 text-[#020D13]/45"}`}
              >
                {row.active ? "Активно" : "Скрыто"}
              </span>
              <button
                onClick={() =>
                  setDraft({ ...row, raw: { ...row.raw, _existing: true } })
                }
                className="grid size-10 place-items-center"
                aria-label={`Редактировать ${row.name}`}
              >
                <Pencil className="size-4" />
              </button>
              <button
                onClick={() => archive(row.id)}
                className="grid size-10 place-items-center text-red-700"
                aria-label={`Архивировать ${row.name}`}
              >
                <Archive className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {draft && (
        <AdminPortal onClose={() => setDraft(null)}>
          <div
            className="fixed inset-0 z-50 grid place-items-center bg-[#020D13]/65 p-5"
            role="dialog"
            aria-modal="true"
            aria-label="Редактирование"
          >
            <div className="max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-xl bg-[#FFFBFC] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Редактирование</h2>
                <button onClick={() => setDraft(null)}>
                  <X />
                </button>
              </div>
              <div className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm font-bold">
                  {kind === "table" ? "Название стола" : "Название RU"}
                  <Input
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                </label>
                {kind !== "table" && (
                  <label className="grid gap-2 text-sm font-bold">
                    Название KZ
                    <Input
                      value={draft.secondary || ""}
                      onChange={(e) =>
                        setDraft({ ...draft, secondary: e.target.value })
                      }
                    />
                  </label>
                )}
                {kind !== "promotion" && (
                  <label className="grid gap-2 text-sm font-bold">
                    Порядок
                    <Input
                      type="number"
                      min="0"
                      value={String(draft.raw.sort_order ?? rows.length + 1)}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          raw: {
                            ...draft.raw,
                            sort_order: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </label>
                )}
                {kind === "promotion" && (
                  <>
                    <label className="grid gap-2 text-sm font-bold">
                      Описание
                      <Textarea
                        value={String(draft.raw.description_ru || "")}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            raw: {
                              ...draft.raw,
                              description_ru: e.target.value,
                            },
                          })
                        }
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-bold">
                      Статус
                      <select
                        className="h-12 rounded border bg-white px-3"
                        value={String(draft.raw.status || "draft")}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            raw: { ...draft.raw, status: e.target.value },
                          })
                        }
                      >
                        <option value="draft">Черновик</option>
                        <option value="active">Активна</option>
                        <option value="expired">Завершена</option>
                      </select>
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-bold">
                        Дата начала
                        <Input
                          type="date"
                          value={String(draft.raw.start_date || "")}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              raw: { ...draft.raw, start_date: e.target.value },
                            })
                          }
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-bold">
                        Дата окончания
                        <Input
                          type="date"
                          value={String(draft.raw.end_date || "")}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              raw: { ...draft.raw, end_date: e.target.value },
                            })
                          }
                        />
                      </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-bold">
                        Тип акции
                        <select
                          className="h-12 rounded border bg-white px-3"
                          value={String(draft.raw.promotion_type || "set")}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              raw: {
                                ...draft.raw,
                                promotion_type: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="set">Сет</option>
                          <option value="gift">Подарок</option>
                          <option value="discount">Скидка</option>
                          <option value="delivery">Доставка</option>
                        </select>
                      </label>
                      <label className="grid gap-2 text-sm font-bold">
                        Минимальная сумма, ₸
                        <Input
                          type="number"
                          min="0"
                          value={String(draft.raw.minimum_order || "")}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              raw: {
                                ...draft.raw,
                                minimum_order: e.target.value
                                  ? Number(e.target.value)
                                  : null,
                              },
                            })
                          }
                        />
                      </label>
                    </div>
                    <label className="grid gap-2 text-sm font-bold">
                      Изображение
                      <div className="flex flex-wrap items-center gap-3">
                        <Input
                          value={String(draft.raw.image_url || "")}
                          placeholder="URL изображения"
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              raw: { ...draft.raw, image_url: e.target.value },
                            })
                          }
                        />
                        <span className="text-xs font-normal text-[#020D13]/45">
                          либо
                        </span>
                        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-4 text-sm font-bold">
                          <ImagePlus className="size-4" /> Загрузить
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              e.target.files?.[0] &&
                              uploadPromotionImage(e.target.files[0])
                            }
                          />
                        </label>
                        {Boolean(draft.raw.image_url) && (
                          <button
                            type="button"
                            className="text-sm font-bold text-red-700"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                raw: { ...draft.raw, image_url: null },
                              })
                            }
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold">
                      <input
                        type="checkbox"
                        checked={Boolean(draft.raw.needs_review)}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            raw: {
                              ...draft.raw,
                              needs_review: e.target.checked,
                            },
                          })
                        }
                      />
                      Требует проверки
                    </label>
                  </>
                )}
                <label className="flex items-center gap-2 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(e) =>
                      setDraft({ ...draft, active: e.target.checked })
                    }
                  />
                  Активно
                </label>
                {error && <p className="text-sm text-red-700">{error}</p>}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setDraft(null)}>
                    Отмена
                  </Button>
                  <Button onClick={save} disabled={saving}>
                    Сохранить
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </AdminPortal>
      )}
    </div>
  );
}
function mapSimple(row: Record<string, unknown>, kind: string): Row {
  return kind === "category"
    ? {
        id: String(row.id),
        name: String(row.name_ru),
        secondary: row.name_kk ? String(row.name_kk) : undefined,
        active: Boolean(row.is_visible),
        raw: row,
      }
    : kind === "table"
      ? {
          id: String(row.id),
          name: String(row.label),
          active: Boolean(row.is_active),
          raw: row,
        }
      : {
          id: String(row.id),
          name: String(row.title_ru),
          secondary: row.title_kk ? String(row.title_kk) : undefined,
          active: Boolean(row.is_active),
          meta: Boolean(row.needs_review) ? "Требует проверки" : undefined,
          raw: row,
        };
}
