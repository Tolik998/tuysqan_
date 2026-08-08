"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, MenuItem } from "@/types/domain";

type CartState = {
  lines: CartLine[];
  add: (item: MenuItem, quantity?: number) => void;
  decrease: (itemId: string) => void;
  remove: (itemId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((line) => line.item.id === item.id);
          return existing
            ? {
                lines: state.lines.map((line) =>
                  line.item.id === item.id
                    ? { ...line, quantity: line.quantity + quantity }
                    : line,
                ),
              }
            : { lines: [...state.lines, { item, quantity }] };
        }),
      decrease: (itemId) =>
        set((state) => ({
          lines: state.lines
            .map((line) =>
              line.item.id === itemId
                ? { ...line, quantity: line.quantity - 1 }
                : line,
            )
            .filter((line) => line.quantity > 0),
        })),
      remove: (itemId) =>
        set((state) => ({
          lines: state.lines.filter((line) => line.item.id !== itemId),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "tuysqan-cart", version: 1 },
  ),
);
