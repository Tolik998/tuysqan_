import { describe, expect, it } from "vitest";
import {
  canOrder,
  cartQuantity,
  cartTotal,
  toOrderSnapshots,
} from "@/lib/cart";
import { menuItems } from "@/data/menu";

describe("cart business logic", () => {
  const item = menuItems[0];
  it("calculates quantity and total", () => {
    const lines = [{ item, quantity: 2 }];
    expect(cartQuantity(lines)).toBe(2);
    expect(cartTotal(lines)).toBe(item.price * 2);
  });
  it("creates immutable order snapshots", () => {
    const snapshot = toOrderSnapshots([{ item, quantity: 3 }])[0];
    expect(snapshot).toEqual({
      menuItemId: item.id,
      itemNameSnapshot: item.nameRu,
      priceSnapshot: item.price,
      quantity: 3,
      lineTotal: item.price * 3,
    });
  });
  it("blocks unavailable or archived products", () => {
    expect(canOrder(item)).toBe(true);
    expect(canOrder({ ...item, isAvailable: false })).toBe(false);
    expect(canOrder({ ...item, isArchived: true })).toBe(false);
  });
});
