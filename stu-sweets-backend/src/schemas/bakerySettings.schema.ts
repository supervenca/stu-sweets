import { z } from "zod";

export const updateBakerySettingsSchema = z.object({
  defaultDailyCakeCapacity: z.number().int().positive(),
  minPreparationDays: z.number().int().min(0),
}).strict();