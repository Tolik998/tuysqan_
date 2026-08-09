import { z } from "zod";

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1).max(128),
  itemNameSnapshot: z.string().min(1).max(180),
  priceSnapshot: z.number().int().nonnegative(),
  quantity: z.number().int().min(1).max(99),
  lineTotal: z.number().int().nonnegative(),
});

const deliveryOrderFieldsSchema = z.object({
  fulfillmentType: z.enum(["delivery", "pickup"]),
  paymentMethod: z.enum(["cash", "remote"]),
  customerName: z.string().trim().min(2, "Укажите имя").max(100),
  deliveryAddress: z.string().trim().max(300).optional(),
  entrance: z.string().trim().max(30).optional(),
  floor: z.string().trim().max(30).optional(),
  apartment: z.string().trim().max(50).optional(),
  comment: z.string().trim().max(500).optional(),
});

function validateDeliveryAddress(
  order: z.infer<typeof deliveryOrderFieldsSchema>,
  context: z.RefinementCtx,
) {
  if (
    order.fulfillmentType === "delivery" &&
    (!order.deliveryAddress || order.deliveryAddress.length < 5)
  ) {
    context.addIssue({
      code: "custom",
      path: ["deliveryAddress"],
      message: "Укажите адрес доставки",
    });
  }
}

export const deliveryOrderFormSchema = deliveryOrderFieldsSchema.superRefine(
  validateDeliveryAddress,
);

export const deliveryOrderSchema = deliveryOrderFieldsSchema
  .extend({
    items: z.array(orderItemSchema).min(1, "Корзина пуста").max(50),
    total: z.number().int().positive(),
  })
  .superRefine(validateDeliveryAddress);

export const dineInOrderSchema = z.object({
  tableId: z.string().min(1, "Выберите стол"),
  customerName: z.string().trim().max(100).optional(),
  comment: z.string().trim().max(500).optional(),
  items: z.array(orderItemSchema).min(1, "Корзина пуста").max(50),
  total: z.number().int().positive(),
});

export type DeliveryOrderInput = z.infer<typeof deliveryOrderSchema>;
export type DineInOrderInput = z.infer<typeof dineInOrderSchema>;
