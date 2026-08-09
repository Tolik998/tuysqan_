"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CartPanel } from "@/components/cart/cart-panel";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { cartTotal, toOrderSnapshots } from "@/lib/cart";
import { createDineInWhatsAppUrl } from "@/lib/whatsapp";
import { dineInOrderSchema, type DineInOrderInput } from "@/lib/validation";
import { useCartStore } from "@/store/cart-store";
import type { RestaurantTable } from "@/types/domain";

type FormValues = Omit<DineInOrderInput, "items" | "total">;

export function DineInCart({
  tables,
  whatsapp,
}: {
  tables: RestaurantTable[];
  whatsapp: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lines = useCartStore((state) => state.lines);
  const clear = useCartStore((state) => state.clear);
  const [serverError, setServerError] = useState("");
  const preselected = searchParams.get("table");
  const form = useForm<FormValues>({
    resolver: zodResolver(dineInOrderSchema.omit({ items: true, total: true })),
    defaultValues: {
      tableId:
        tables.find(
          (table) => table.id === preselected || table.label === preselected,
        )?.id || "",
      customerName: "",
      comment: "",
    },
  });

  useEffect(() => {
    const table = tables.find(
      (candidate) =>
        candidate.id === preselected || candidate.label === preselected,
    );
    if (table) form.setValue("tableId", table.id, { shouldValidate: true });
  }, [form, preselected, tables]);

  async function submit(values: FormValues) {
    setServerError("");
    const items = toOrderSnapshots(lines);
    const total = cartTotal(lines);
    if (!items.length) return setServerError("Корзина пуста");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderType: "dine_in", ...values, items, total }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Не удалось создать заказ");
      const tableLabel =
        tables.find((table) => table.id === values.tableId)?.label || "—";
      const whatsappUrl = createDineInWhatsAppUrl(whatsapp, {
        tableLabel,
        customerName: values.customerName,
        comment: values.comment,
        items,
        total: result.total,
      });
      clear();
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      router.push(`/dine-in/order/${result.id}?token=${result.publicToken}`);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Не удалось создать заказ",
      );
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <section>
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="size-4" />
          Заказ сохраняется и отправляется в WhatsApp
        </div>
        <h1 className="text-3xl font-bold">Подтверждение заказа</h1>
        <p className="mt-3 text-sm text-[#020D13]/55">
          Выберите свой столик. Номер можно изменить, даже если вы открыли меню
          по QR-коду стола.
        </p>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="mt-7 grid gap-5 border border-[#020D13]/10 bg-white p-5 sm:p-7"
        >
          <label className="grid gap-2 text-sm font-bold">
            Номер столика
            <select
              {...form.register("tableId")}
              className="h-12 rounded-md border border-[#020D13]/15 bg-white px-4 outline-none focus:border-[#020D13]"
            >
              <option value="">Выберите стол</option>
              {tables
                .filter((table) => table.isActive)
                .map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.label}
                  </option>
                ))}
            </select>
            {form.formState.errors.tableId && (
              <span className="text-xs text-red-700">
                {form.formState.errors.tableId.message}
              </span>
            )}
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Имя{" "}
            <span className="font-normal text-[#020D13]/45">необязательно</span>
            <Input {...form.register("customerName")} />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Комментарий{" "}
            <span className="font-normal text-[#020D13]/45">необязательно</span>
            <Textarea
              {...form.register("comment")}
              placeholder="Без лука, соус отдельно…"
            />
          </label>
          {serverError && (
            <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800">
              {serverError}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="size-5 animate-spin" />
            )}
            {form.formState.isSubmitting ? null : (
              <MessageCircle className="size-5" />
            )}
            Создать заказ и перейти в WhatsApp
          </Button>
        </form>
      </section>
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <h2 className="mb-4 text-xl font-bold">Ваш заказ</h2>
        <CartPanel compact checkoutHref="/dine-in/cart" />
      </aside>
    </div>
  );
}
