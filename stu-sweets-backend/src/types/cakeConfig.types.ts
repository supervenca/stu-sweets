import { z } from "zod";
import { updateCakeConfigSchema, cakeSizeSchema } from "../schemas/cakeConfig.schema.js";

export type CakeSizeDto = z.infer<typeof cakeSizeSchema>;
export type UpdateCakeConfigDto = z.infer<typeof updateCakeConfigSchema>;

export type CreateCakeConfigDto = {
  productId: number;

  flavor: string[];
  color: string[];
  messageColor: string[];

  certificate: boolean;
};