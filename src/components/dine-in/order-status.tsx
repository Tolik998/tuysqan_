"use client";

import { Loader2, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { createDineInWhatsAppUrl } from "@/lib/whatsapp";

type OrderView = {
  total: number;
  customer_name: string | null;
  comment: string | null;
  tables: { label: string } | null;
  order_items: Array<{
    item_name_snapshot: string;
    price_snapshot: number;
    quantity: number;
    line_total: number;
  }>;
};

export function OrderStatus({
  id,
  token,
  whatsapp,
}: {
  id: string;
  token: string;
  whatsapp: string;
}) {
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const storageKey = `dine-in-whatsapp:${id}`;
    const cachedUrl = window.sessionStorage.getItem(storageKey);

    if (cachedUrl) {
      const redirectTimer = window.setTimeout(() => {
        if (cancelled) return;
        setWhatsappUrl(cachedUrl);
        window.location.assign(cachedUrl);
      }, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(redirectTimer);
      };
    }

    fetch(`/api/orders/${id}?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = (await response.json()) as OrderView & { error?: string };
        if (!response.ok) throw new Error(data.error || "Заказ не найден");
        return data;
      })
      .then((order) => {
        if (cancelled) return;
        const url = createDineInWhatsAppUrl(whatsapp, {
          tableLabel: order.tables?.label || "—",
          customerName: order.customer_name || "",
          comment: order.comment || "",
          items: order.order_items.map((item) => ({
            menuItemId: "",
            itemNameSnapshot: item.item_name_snapshot,
            priceSnapshot: item.price_snapshot,
            quantity: item.quantity,
            lineTotal: item.line_total,
          })),
          total: order.total,
        });
        window.sessionStorage.setItem(storageKey, url);
        setWhatsappUrl(url);
        window.location.assign(url);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(
            reason instanceof Error ? reason.message : "Не удалось открыть WhatsApp",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, token, whatsapp]);

  return (
    <div className="mx-auto grid min-h-[55vh] max-w-xl place-items-center text-center">
      <div className="w-full border border-[#020D13]/10 bg-white p-7 sm:p-10">
        {whatsappUrl ? (
          <>
            <p className="mb-5 text-sm leading-6 text-[#020D13]/60">
              Ресторан получит заказ только после того, как вы отправите
              подготовленное сообщение в WhatsApp. Если WhatsApp не открылся
              автоматически, нажмите кнопку.
            </p>
            <a
              href={whatsappUrl}
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-md bg-[#020D13] px-6 text-base font-bold text-white"
            >
              <MessageCircle className="size-5" />
              Отправить сообщение в WhatsApp
            </a>
          </>
        ) : error ? (
          <p className="rounded-md bg-red-50 p-4 text-sm font-semibold text-red-800">
            {error}
          </p>
        ) : (
          <div className="flex items-center justify-center gap-3 text-sm font-semibold">
            <Loader2 className="size-5 animate-spin" />
            Открываем WhatsApp…
          </div>
        )}
      </div>
    </div>
  );
}
