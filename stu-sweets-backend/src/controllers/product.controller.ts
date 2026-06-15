import type { Request, Response } from "express";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, setProductImage, removeProductImageURL } from "../services/product.service.js";
import { createProductSchema, updateProductSchema } from "../schemas/product.schema.js";
import { HttpError } from "../utils/httpError.js";
import { uploadFile } from "../services/file.service.js";

// Публичные GET
export async function getAllProductsPublicController(req: Request, res: Response) {
  const products = await getAllProducts();
  return res.json(products);
}

export async function getProductByIdPublicController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new HttpError(400, "Invalid product id");

  const product = await getProductById(id);
  if (!product) throw new HttpError(404, "Product not found");

  return res.json(product);
}

// Админские действия (CRUD)
export async function createProductController(req: Request, res: Response) {
  const parseResult = createProductSchema.safeParse(req.body);

  if (!parseResult.success) throw new HttpError(400, "Invalid input: " + parseResult.error.message);
  const product = await createProduct(parseResult.data);
  return res.status(201).json(product);
}

export async function updateProductController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new HttpError(400, "Invalid product id");

  const parseResult = updateProductSchema.safeParse(req.body);
  if (!parseResult.success) throw new HttpError(400, "Invalid input: " + parseResult.error.message);
  const updated = await updateProduct(id, parseResult.data);
  if (!updated) throw new HttpError(404, "Product not found");

  return res.json(updated);
}

export async function deleteProductController(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) throw new HttpError(400, "Invalid product id");

  const deleted = await deleteProduct(id);
  if (!deleted) throw new HttpError(404, "Product not found");

  return res.json({ success: true });
}

export async function setProductImageController(
  req: Request,
  res: Response
) {
  const productId = Number(req.params.id);

  if (Number.isNaN(productId)) {
    throw new HttpError(400, "Invalid product id");
  }

  if (!req.file) {
    throw new HttpError(400, "Image file is required");
  }

  const uploaded = await uploadFile(
    req.file,
    "product"
  );

  const product = await setProductImage(
    productId,
    uploaded.url
  );

  return res.json(product);
}

export async function deleteProductImageController(
  req: Request,
  res: Response
) {
  const productId = Number(req.params.id);

  if (Number.isNaN(productId)) {
    throw new HttpError(400, "Invalid product id");
  }

  await removeProductImageURL(productId);

  return res.json({
    success: true,
  });
}