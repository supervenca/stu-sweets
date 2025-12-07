import type { Request, Response } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../services/product.service.js";

export async function getAllProductsController(req: Request, res: Response) {
  const products = await getAllProducts();
  res.json(products);
}

export async function getProductByIdController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const product = await getProductById(id);

  if (!product) return res.status(404).json({ error: "Product not found" });

  res.json(product);
}

export async function createProductController(req: Request, res: Response) {
  const { name, description, price, stock } = req.body;

  if (!name || !price) return res.status(400).json({ error: "name and price required" });

  const product = await createProduct({ name, description, price, stock: stock ?? 0 });
  res.status(201).json(product);
}

export async function updateProductController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = req.body;

  try {
    const updated = await updateProduct(id, data);
    res.json(updated);
  } catch (e: any) {
    res.status(404).json({ error: "Error" });
  }
}

export async function deleteProductController(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await deleteProduct(id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(404).json({ error: "Error" });
  }
}
