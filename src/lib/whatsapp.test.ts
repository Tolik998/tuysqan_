import { describe, expect, it } from "vitest";
import { createWhatsAppUrl, formatWhatsAppOrder } from "@/lib/whatsapp";
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
    expect(text).toContain("TQ-20260808-001");
    expect(text).toContain("Без лука");
    expect(text).not.toContain("Телефон:");
  });
  it("normalizes phone and encodes the message", () => {
    const url = createWhatsAppUrl("+7 771 594 7903", order);
    expect(url.startsWith("https://wa.me/77715947903?text=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Новый заказ TUYSQAN");
  });
});
