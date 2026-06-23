import type { Request, Response } from "express";
import { HttpError } from "../utils/httpError.js";

import {
  getCakeConfig,
  createCakeConfig,
  updateCakeConfig,
} from "../services/cakeConfig.service.js";

import {
  updateCakeConfigSchema,
} from "../schemas/cakeConfig.schema.js";

import type { CreateCakeConfigDto } from "../types/cakeConfig.types.js";

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

  const data: CreateCakeConfigDto = {
    productId,
    flavor: req.body.flavor ?? [],
    color: req.body.color ?? [],
    messageColor: req.body.messageColor ?? [],
    certificate: req.body.certificate ?? false,
  };

  const config = await createCakeConfig(data);

  return res.status(201).json(config);
}

export async function updateCakeConfigController(req: Request, res: Response) {
  const productId = Number(req.params.productId);

  if (Number.isNaN(productId)) {
    throw new HttpError(400, "Invalid product id");
  }

  const parsed = updateCakeConfigSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new HttpError(
      400,
      "Invalid input: " + parsed.error.message
    );
  }

  const updated = await updateCakeConfig(productId, parsed.data);

  return res.json(updated);
}