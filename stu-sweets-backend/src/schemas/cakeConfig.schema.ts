import { z } from "zod";

export const cakeSizeSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().trim().min(1),
  multiplier: z.number().positive(),
});

export const updateCakeConfigSchema = z.object({
  flavor: z.array(z.string().trim().min(1)).default([]),
  color: z.array(z.string().trim().min(1)).default([]),
  messageColor: z.array(z.string().trim().min(1)).default([]),
  certificate: z.boolean().default(false),

  cakeSizes: z.array(cakeSizeSchema).optional(),
});