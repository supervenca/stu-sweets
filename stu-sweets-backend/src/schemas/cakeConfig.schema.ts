import { z } from "zod";

export const createCakeConfigSchema = z.object({
  flavor: z.array(z.string().trim().min(1)).default([]),
  color: z.array(z.string().trim().min(1)).default([]),
  messageColor: z.array(z.string().trim().min(1)).default([]),

  smallMultiplier: z.number().positive().default(1),
  mediumMultiplier: z.number().positive().default(1.5),
  largeMultiplier: z.number().positive().default(2),
});

export const updateCakeConfigSchema = z.object({
  flavor: z.array(z.string().trim().min(1)).optional(),
  color: z.array(z.string().trim().min(1)).optional(),
  messageColor: z.array(z.string().trim().min(1)).optional(),

  smallMultiplier: z.number().positive().optional(),
  mediumMultiplier: z.number().positive().optional(),
  largeMultiplier: z.number().positive().optional(),
});