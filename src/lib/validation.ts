import { z } from "zod";

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1).max(128),
  itemNameSnapshot: z.string().min(1).max(180),
  priceSnapshot: z.number().int().nonnegative(),
  quantity: z.number().int().min(1).max(99),
  lineTotal: z.number().int().nonnegative(),
});

export const deliveryOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Укажите имя").max(100),
  deliveryAddress: z.string().trim().min(5, "Укажите адрес доставки").max(300),
  entrance: z.string().trim().max(30).optional(),
  floor: z.string().trim().max(30).optional(),
  apartment: z.string().trim().max(50).optional(),
  comment: z.string().trim().max(500).optional(),
  items: z.array(orderItemSchema).min(1, "Корзина пуста").max(50),
  total: z.number().int().positive(),
});

export const dineInOrderSchema = z.object({
  tableId: z.string().min(1, "Выберите стол"),
  customerName: z.string().trim().max(100).optional(),
  comment: z.string().trim().max(500).optional(),
  items: z.array(orderItemSchema).min(1, "Корзина пуста").max(50),
  total: z.number().int().positive(),
});

export type DeliveryOrderInput = z.infer<typeof deliveryOrderSchema>;
export type DineInOrderInput = z.infer<typeof dineInOrderSchema>;
