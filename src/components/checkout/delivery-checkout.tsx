"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { CartPanel } from "@/components/cart/cart-panel";
import { restaurantSettings } from "@/data/menu";
import { cartTotal, toOrderSnapshots } from "@/lib/cart";
import { createWhatsAppUrl } from "@/lib/whatsapp";
import {
  deliveryOrderFormSchema,
  type DeliveryOrderInput,
} from "@/lib/validation";
import { useCartStore } from "@/store/cart-store";

type FormValues = Omit<DeliveryOrderInput, "items" | "total">;

export function DeliveryCheckout() {
  const lines = useCartStore((state) => state.lines);
  const clear = useCartStore((state) => state.clear);
  const [serverError, setServerError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const form = useForm<FormValues>({
    resolver: zodResolver(deliveryOrderFormSchema),
    defaultValues: {
      fulfillmentType: "delivery",
      paymentMethod: "cash",
      customerName: "",
      deliveryAddress: "",
      entrance: "",
      floor: "",
      apartment: "",
      comment: "",
    },
  });
  const fulfillmentType = useWatch({
    control: form.control,
    name: "fulfillmentType",
  });
  const paymentMethod = useWatch({
    control: form.control,
    name: "paymentMethod",
  });

  async function submit(values: FormValues) {
    setServerError("");
    const items = toOrderSnapshots(lines);
    const total = cartTotal(lines);
    if (!items.length) return setServerError("Корзина пуста");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderType: "delivery",
          ...values,
          items,
          total,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Не удалось создать заказ");
      setOrderNumber(result.orderNumber);
      const preparedWhatsAppUrl = createWhatsAppUrl(restaurantSettings.whatsapp, {
        orderNumber: result.orderNumber,
        ...values,
        items,
        total,
      });
      setWhatsappUrl(preparedWhatsAppUrl);
      clear();
      window.location.assign(preparedWhatsAppUrl);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Не удалось создать заказ",
      );
    }
  }

  if (orderNumber)
    return (
      <div className="mx-auto max-w-xl border border-[#020D13]/10 bg-white p-8 text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-700" />
        <h1 className="mt-4 text-3xl font-bold">Заказ создан</h1>
        <p className="mt-3 text-[#020D13]/60">
          Номер {orderNumber}. WhatsApp открыт с готовым сообщением — отправьте
          его, чтобы ресторан подтвердил заказ.
        </p>
        <a
          href={whatsappUrl || `https://wa.me/${restaurantSettings.whatsapp}`}
          className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-md bg-[#020D13] px-5 font-bold text-white"
        >
          <MessageCircle className="size-5" />
          Открыть WhatsApp
        </a>
      </div>
    );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <section>
        <Link
          href="/menu"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold"
        >
          <ArrowLeft className="size-4" />
          Вернуться в меню
        </Link>
        <h1 className="text-3xl font-bold sm:text-4xl">Оформление заказа</h1>
        <p className="mt-3 text-sm leading-6 text-[#020D13]/55">
          Выберите получение и оплату. После сохранения откроется WhatsApp с
          готовым сообщением для Tuysqan.
        </p>
        <form
          onSubmit={form.handleSubmit(submit)}
          className="mt-8 grid gap-5 rounded-xl border border-[#020D13]/10 bg-white p-5 sm:p-7"
        >
          <fieldset className="grid gap-2">
            <legend className="text-sm font-bold">Способ получения</legend>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex min-h-12 cursor-pointer items-center justify-center rounded-md border px-4 text-sm font-bold transition ${fulfillmentType === "delivery" ? "border-[#020D13] bg-[#020D13] text-white" : "border-[#020D13]/15 bg-white"}`}
              >
                <input
                  type="radio"
                  value="delivery"
                  className="sr-only"
                  {...form.register("fulfillmentType")}
                />
                Доставка
              </label>
              <label
                className={`flex min-h-12 cursor-pointer items-center justify-center rounded-md border px-4 text-sm font-bold transition ${fulfillmentType === "pickup" ? "border-[#020D13] bg-[#020D13] text-white" : "border-[#020D13]/15 bg-white"}`}
              >
                <input
                  type="radio"
                  value="pickup"
                  className="sr-only"
                  {...form.register("fulfillmentType")}
                />
                Самовывоз
              </label>
            </div>
          </fieldset>
          <Field
            label="Имя"
            error={form.formState.errors.customerName?.message}
          >
            <Input {...form.register("customerName")} autoComplete="name" />
          </Field>
          {fulfillmentType === "delivery" && (
            <>
              <Field
                label="Адрес доставки"
                error={form.formState.errors.deliveryAddress?.message}
              >
                <Input
                  {...form.register("deliveryAddress")}
                  autoComplete="street-address"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Подъезд">
                  <Input {...form.register("entrance")} />
                </Field>
                <Field label="Этаж">
                  <Input {...form.register("floor")} />
                </Field>
                <Field label="Квартира / офис">
                  <Input {...form.register("apartment")} />
                </Field>
              </div>
            </>
          )}
          <fieldset className="grid gap-2">
            <legend className="text-sm font-bold">Способ оплаты</legend>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex min-h-12 cursor-pointer items-center justify-center rounded-md border px-4 text-center text-sm font-bold transition ${paymentMethod === "cash" ? "border-[#020D13] bg-[#020D13] text-white" : "border-[#020D13]/15 bg-white"}`}
              >
                <input
                  type="radio"
                  value="cash"
                  className="sr-only"
                  {...form.register("paymentMethod")}
                />
                Наличными
              </label>
              <label
                className={`flex min-h-12 cursor-pointer items-center justify-center rounded-md border px-4 text-center text-sm font-bold transition ${paymentMethod === "remote" ? "border-[#020D13] bg-[#020D13] text-white" : "border-[#020D13]/15 bg-white"}`}
              >
                <input
                  type="radio"
                  value="remote"
                  className="sr-only"
                  {...form.register("paymentMethod")}
                />
                Удалённая оплата
              </label>
            </div>
            {paymentMethod === "remote" && (
              <p className="text-xs text-[#020D13]/50">
                Ресторан отправит реквизиты для оплаты в WhatsApp.
              </p>
            )}
          </fieldset>
          <Field label="Комментарий">
            <Textarea
              {...form.register("comment")}
              placeholder="Например: без лука"
            />
          </Field>
          {serverError && (
            <p
              className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800"
              role="alert"
            >
              {serverError}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <MessageCircle className="size-5" />
            )}
            Создать заказ и перейти в WhatsApp
          </Button>
        </form>
      </section>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <h2 className="mb-4 text-xl font-bold">Ваш заказ</h2>
        <CartPanel compact showCheckoutAction={false} />
      </aside>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      {children}
      {error && (
        <span className="text-xs font-medium text-red-700">{error}</span>
      )}
    </label>
  );
}
