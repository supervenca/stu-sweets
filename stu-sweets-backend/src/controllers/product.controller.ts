import type { Request, Response } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product.service.js";
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
  const { name, description, price, stock } = req.body;

  if (!name || price === undefined) {
    throw new HttpError(400, "name and price required");
  }

  const product = await createProduct({
    name,
    description,
    price,
    stock: stock ?? 0,
  });

  return res.status(201).json(product);
}

// UPDATE
export async function updateProductController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = req.body;

  const updated = await updateProduct(id, data);

  if (!updated) {
    throw new HttpError(404, "Product not found");
  }

  return res.json(updated);
}

// DELETE
export async function deleteProductController(req: Request, res: Response) {
  const id = Number(req.params.id);

  await deleteProduct(id);
  return res.json({ success: true });
}
