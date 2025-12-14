import type { Request, Response } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product.service.js";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema.js";
import { HttpError } from "../utils/httpError.js";

// GET ALL
export async function getAllProductsController(req: Request, res: Response) {
  const products = await getAllProducts();
  return res.json(products);
}

// GET BY ID
export async function getProductByIdController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const product = await getProductById(id);

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  return res.json(product);
}

// CREATE
export async function createProductController(req: Request, res: Response) {
  const parseResult = createProductSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new HttpError(400, "Invalid input: " + parseResult.error.message);
  }

  const product = await createProduct(parseResult.data);
  return res.status(201).json(product);
}

// UPDATE
export async function updateProductController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const parseResult = updateProductSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new HttpError(400, "Invalid input: " + parseResult.error.message);
  }

  const updated = await updateProduct(id, parseResult.data);
  if (!updated) throw new HttpError(404, "Product not found");
  return res.json(updated);
}

// DELETE
export async function deleteProductController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const deleted = await deleteProduct(id);
  if (!deleted) throw new HttpError(404, "Product not found");
  return res.json({ success: true });
}
