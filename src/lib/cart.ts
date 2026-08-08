import type { CartLine, MenuItem, OrderSnapshotItem } from "@/types/domain";

export function cartQuantity(lines: CartLine[]) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function cartTotal(lines: CartLine[]) {
  return lines.reduce(
    (total, line) => total + line.item.price * line.quantity,
    0,
  );
}

export function toOrderSnapshots(lines: CartLine[]): OrderSnapshotItem[] {
  return lines.map(({ item, quantity }) => ({
    menuItemId: item.id,
    itemNameSnapshot: item.nameRu,
    priceSnapshot: item.price,
    quantity,
    lineTotal: item.price * quantity,
  }));
}

export function canOrder(item: MenuItem) {
  return item.isAvailable && !item.isArchived;
}
