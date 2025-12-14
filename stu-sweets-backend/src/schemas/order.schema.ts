import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.number().int(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

// Схема для создания заказа
export const createOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email"),
  customerPhone: z.string()
    .optional()
    .refine((val) => {
    if (val === undefined) return true; // поле не передано — ок
    if (val.trim() === "") return false; // пустая строка — ошибка
    if (!/^\+?\d+$/.test(val)) return false; // разрешаем + в начале, потом только цифры
    const digits = val.replace(/\D/g, "");
    return digits.length >= 10;
  }, "Phone must have at least 10 digits"),
  comment: z.string().optional(),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
});

// Схема для обновления заказа (например, изменение статуса)
export const updateOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name cannot be empty").optional(),
  customerEmail: z.string().email("Invalid email").optional(),
  customerPhone: z.string()
    .optional()
    .refine((val) => {
    if (val === undefined) return true; // поле не передано — ок
    if (val.trim() === "") return false; // пустая строка — ошибка
    if (!/^\+?\d+$/.test(val)) return false; // разрешаем + в начале, потом только цифры
    const digits = val.replace(/\D/g, "");
    return digits.length >= 10;
  }, "Phone must have at least 10 digits"),
  comment: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "PAID", "FULFILLED", "CANCELED"]).optional(),
  total: z.number().optional(),
});

