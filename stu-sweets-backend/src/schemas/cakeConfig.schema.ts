import { z } from "zod";

export const updateCakeConfigSchema = z.object({
  flavor: z.array(z.string().trim().min(1)).optional(),
  color: z.array(z.string().trim().min(1)).optional(),
  messageColor: z.array(z.string().trim().min(1)).optional(),

  smallMultiplier: z.number().positive().optional(),
  mediumMultiplier: z.number().positive().optional(),
  largeMultiplier: z.number().positive().optional(),
});