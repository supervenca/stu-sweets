import { z } from "zod";
import { updateCakeConfigSchema } from "../schemas/cakeConfig.schema.js";
export type UpdateCakeConfigDto = z.infer<typeof updateCakeConfigSchema>;

export type CreateCakeConfigDto = {
  productId: number;

  flavor: string[];
  color: string[];
  messageColor: string[];

  certificate: boolean;

  smallMultiplier?: number;
  mediumMultiplier?: number;
  largeMultiplier?: number;
};