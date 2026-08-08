import { describe, expect, it } from "vitest";
import { deliveryOrderSchema, dineInOrderSchema } from "@/lib/validation";
const item = {
  menuItemId: "item-1",
  itemNameSnapshot: "Блюдо",
  priceSnapshot: 1000,
  quantity: 1,
  lineTotal: 1000,
};
describe("order validation", () => {
  it("accepts delivery details without a customer phone", () =>
    expect(
      deliveryOrderSchema.safeParse({
        customerName: "Аян",
        deliveryAddress: "Улица Абая, 1",
        items: [item],
        total: 1000,
      }).success,
    ).toBe(true));
  it("requires a table for dine-in", () =>
    expect(
      dineInOrderSchema.safeParse({ tableId: "", items: [item], total: 1000 })
        .success,
    ).toBe(false));
  it("rejects an empty cart", () =>
    expect(
      deliveryOrderSchema.safeParse({
        customerName: "Аян",
        deliveryAddress: "Улица Абая, 1",
        items: [],
        total: 0,
      }).success,
    ).toBe(false));
});
