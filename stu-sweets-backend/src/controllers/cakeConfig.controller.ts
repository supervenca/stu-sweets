import type { Request, Response } from "express";
import { HttpError } from "../utils/httpError.js";

import {
  getCakeConfig,
  createCakeConfig,
  updateCakeConfig,
  deleteCakeConfig,
} from "../services/cakeConfig.service.js";

import {
  createCakeConfigSchema,
  updateCakeConfigSchema,
} from "../schemas/cakeConfig.schema.js";

export async function getCakeConfigController(req: Request, res: Response) {
  const productId = Number(req.params.productId);

  if (Number.isNaN(productId)) {
    throw new HttpError(400, "Invalid product id");
  }

  const config = await getCakeConfig(productId);

  if (!config) {
    throw new HttpError(404, "CakeConfig not found");
  }

  return res.json(config);
}

export async function createCakeConfigController(req: Request, res: Response) {
  const productId = Number(req.params.productId);

  if (Number.isNaN(productId)) {
    throw new HttpError(400, "Invalid product id");
  }

  const data = createCakeConfigSchema.parse(req.body);

  const config = await createCakeConfig({ productId, ...data });

  return res.status(201).json(config);
}

export async function updateCakeConfigController(req: Request, res: Response) {
  const productId = Number(req.params.productId);

  if (Number.isNaN(productId)) {
    throw new HttpError(400, "Invalid product id");
  }

  const data = updateCakeConfigSchema.parse(req.body);

  const updated = await updateCakeConfig(productId, data);

  return res.json(updated);
}

export async function deleteCakeConfigController(req: Request, res: Response) {
  const productId = Number(req.params.productId);

  if (Number.isNaN(productId)) {
    throw new HttpError(400, "Invalid product id");
  }

  await deleteCakeConfig(productId);

  return res.json({ success: true });
}