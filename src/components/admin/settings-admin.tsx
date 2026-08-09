"use client";

import { Check, Save } from "lucide-react";
import { useState } from "react";
import { AdminTitle } from "@/components/admin/menu-admin";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export function SettingsAdmin({
  initial,
}: {
  initial: Record<string, unknown>;
}) {
  const [data, setData] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch("/api/admin/restaurant_settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "default", data }),
    });
    if (response.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      const result = await response.json().catch(() => null);
      setError(result?.error || "Не удалось сохранить настройки");
    }
    setSaving(false);
  }
  const fields = [
    ["restaurant_name", "Название"],
    ["city", "Город"],
    ["address", "Адрес"],
    ["phone", "Телефон"],
    ["whatsapp", "WhatsApp"],
    ["instagram_url", "Instagram URL"],
    ["two_gis_url", "2GIS URL"],
    ["working_hours", "Часы работы"],
    ["delivery_minimum", "Минимум для доставки"],
    ["currency", "Валюта"],
    ["default_language", "Язык по умолчанию"],
  ];
  return (
    <div>
      <AdminTitle
        title="Настройки"
        subtitle="Данные ресторана без правок в коде"
      />
      <form
        onSubmit={submit}
        className="grid max-w-3xl gap-5 border border-[#020D13]/10 bg-white p-5 sm:grid-cols-2 sm:p-7"
      >
        {fields.map(([key, label]) => (
          <label key={key} className="grid gap-2 text-sm font-bold">
            {label}
            <Input
              type={key === "delivery_minimum" ? "number" : "text"}
              value={String(data[key] ?? "")}
              onChange={(e) =>
                setData({
                  ...data,
                  [key]:
                    key === "delivery_minimum"
                      ? Number(e.target.value)
                      : e.target.value,
                })
              }
            />
          </label>
        ))}
        <label className="grid gap-2 text-sm font-bold sm:col-span-2">
          Текст доставки
          <Textarea
            value={String(data.delivery_text ?? "")}
            onChange={(e) =>
              setData({ ...data, delivery_text: e.target.value })
            }
          />
        </label>
        <div className="sm:col-span-2">
          {error && (
            <p className="mb-3 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800">
              {error}
            </p>
          )}
          <Button type="submit" disabled={saving}>
            {saved ? <Check className="size-4" /> : <Save className="size-4" />}
            {saved
              ? "Сохранено"
              : saving
                ? "Сохранение…"
                : "Сохранить настройки"}
          </Button>
        </div>
      </form>
    </div>
  );
}
