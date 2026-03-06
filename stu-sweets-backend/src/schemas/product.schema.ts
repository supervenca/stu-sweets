import { z } from "zod";

// Схема для создания продукта
export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative().optional(),
  categoryId: z.coerce.number().int().positive().optional().nullable()
});

// Схема для обновления продукта
export const updateProductSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  categoryId: z.coerce.number().int().positive().optional().nullable()
});
