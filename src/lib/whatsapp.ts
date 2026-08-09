import type { OrderSnapshotItem } from "@/types/domain";
import { formatPrice } from "@/lib/utils";

export type WhatsAppOrder = {
  orderNumber: string;
  customerName: string;
  deliveryAddress: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  comment?: string;
  items: OrderSnapshotItem[];
  total: number;
};

export type WhatsAppDineInOrder = {
  tableLabel: string;
  customerName?: string;
  comment?: string;
  items: OrderSnapshotItem[];
  total: number;
};

function safe(value?: string) {
  return (value || "—").replace(/[\u0000-\u001f]/g, " ").trim();
}

export function formatWhatsAppOrder(order: WhatsAppOrder) {
  const addressDetails = [
    order.entrance && `подъезд ${safe(order.entrance)}`,
    order.floor && `этаж ${safe(order.floor)}`,
    order.apartment && `кв./офис ${safe(order.apartment)}`,
  ].filter(Boolean);

  const itemLines = order.items.map(
    (item) =>
      `${item.quantity} × ${safe(item.itemNameSnapshot)} — ${formatPrice(item.lineTotal)}`,
  );

  return [
    `Имя: ${safe(order.customerName)}`,
    `Адрес: ${safe(order.deliveryAddress)}${addressDetails.length ? ` (${addressDetails.join(", ")})` : ""}`,
    "",
    "Заказ:",
    ...itemLines,
    "",
    `Итого: ${formatPrice(order.total)}`,
    "",
    `Комментарий: ${safe(order.comment)}`,
  ].join("\n");
}

export function createWhatsAppUrl(phone: string, order: WhatsAppOrder) {
  const normalizedPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(formatWhatsAppOrder(order))}`;
}

export function formatWhatsAppDineInOrder(order: WhatsAppDineInOrder) {
  const itemLines = order.items.map(
    (item) =>
      `${item.quantity} × ${safe(item.itemNameSnapshot)} — ${formatPrice(item.lineTotal)}`,
  );

  return [
    `Стол: ${safe(order.tableLabel)}`,
    `Имя: ${safe(order.customerName)}`,
    "",
    "Заказ:",
    ...itemLines,
    "",
    `Итого: ${formatPrice(order.total)}`,
    "",
    `Комментарий: ${safe(order.comment)}`,
  ].join("\n");
}

export function createDineInWhatsAppUrl(
  phone: string,
  order: WhatsAppDineInOrder,
) {
  const normalizedPhone = phone.replace(/\D/g, "");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(formatWhatsAppDineInOrder(order))}`;
}
