import { z } from "zod";

export const upsertPickupSlotSchema = z.object({
  isAvailable: z.boolean().optional(),
  maxCakeQuantity: z.number().int().nonnegative().nullable().optional(),
}).strict();