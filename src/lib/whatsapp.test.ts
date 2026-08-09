import { describe, expect, it } from "vitest";
import {
  createDineInWhatsAppUrl,
  createWhatsAppUrl,
  formatWhatsAppDineInOrder,
  formatWhatsAppOrder,
} from "@/lib/whatsapp";
const order = {
  orderNumber: "TQ-20260808-001",
  customerName: "Тлеген",
  deliveryAddress: "Улица 1",
  comment: "Без лука",
  items: [
    {
      menuItemId: "1",
      itemNameSnapshot: "Шакшука",
      priceSnapshot: 2290,
      quantity: 2,
      lineTotal: 4580,
    },
  ],
  total: 4580,
};
describe("WhatsApp formatter", () => {
  it("includes snapshots and total", () => {
    const text = formatWhatsAppOrder(order);
    expect(text).toContain("2 × Шакшука — 4 580 ₸");
    expect(text).toContain("Без лука");
    expect(text).toContain("Получение: Доставка");
    expect(text).toContain("Оплата: Наличными");
    expect(text).not.toContain("Новый заказ TUYSQAN");
    expect(text).not.toContain("TQ-20260808-001");
    expect(text).not.toContain("Отправлено с сайта Tuysqan");
    expect(text).not.toContain("Телефон:");
  });
  it("normalizes phone and encodes the message", () => {
    const url = createWhatsAppUrl("+7 771 594 7903", order);
    expect(url.startsWith("https://wa.me/77715947903?text=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Имя: Тлеген");
  });

  it("formats a dine-in order with its table", () => {
    const dineInOrder = {
      tableLabel: "7",
      customerName: "Алия",
      comment: "Без лука",
      items: order.items,
      total: order.total,
    };
    const text = formatWhatsAppDineInOrder(dineInOrder);
    const url = createDineInWhatsAppUrl("+7 771 594 7903", dineInOrder);

    expect(text).toContain("Стол: 7");
    expect(text).toContain("Имя: Алия");
    expect(text).toContain("2 × Шакшука — 4 580 ₸");
    expect(text).toContain("Комментарий: Без лука");
    expect(url.startsWith("https://wa.me/77715947903?text=")).toBe(true);
  });

  it("formats pickup and remote payment without an address", () => {
    const text = formatWhatsAppOrder({
      ...order,
      fulfillmentType: "pickup",
      paymentMethod: "remote",
      deliveryAddress: undefined,
    });

    expect(text).toContain("Получение: Самовывоз");
    expect(text).toContain("Оплата: Удалённая оплата");
    expect(text).not.toContain("Адрес:");
  });
});
