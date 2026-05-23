import { z } from "zod";

export const createCategorySchema = z
  .object({
    name: z.string().trim().min(1),
    requiresPickupSlot: z
      .boolean()
      .optional(),
  })
  .strict();

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    requiresPickupSlot: z.boolean().optional(),
  })
  .strict();