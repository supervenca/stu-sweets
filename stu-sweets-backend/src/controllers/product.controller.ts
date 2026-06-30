import type { Request, Response } from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  setProductImage,
  removeProductImageURL,
} from "../services/product.service.js";

import {
  createProductSchema,
  updateProductSchema,
} from "../schemas/product.schema.js";

import { HttpError } from "../utils/httpError.js";
import { parseId } from "../utils/parseId.js";
import { uploadFile } from "../services/file.service.js";


// PUBLIC

export async function getAllProductsPublicController(
  req: Request,
  res: Response
) {
  const products = await getAllProducts();
  return res.json(products);
}

export async function getProductByIdPublicController(
  req: Request,
  res: Response
) {
  const id = parseId(req.params.id, "product id");

  const product = await getProductById(id);
  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  return res.json(product);
}

// ADMIN CRUD

export async function createProductController(
  req: Request,
  res: Response
) {
  const parseResult = createProductSchema.safeParse(req.body);

  if (!parseResult.success) {
    throw new HttpError(
      400,
      "Invalid input: " + parseResult.error.message
    );
  }

  const product = await createProduct(parseResult.data);

  return res.status(201).json(product);
}

export async function updateProductController(
  req: Request,
  res: Response
) {
  const id = parseId(req.params.id, "product id");

  const parseResult = updateProductSchema.safeParse(req.body);

  if (!parseResult.success) {
    throw new HttpError(
      400,
      "Invalid input: " + parseResult.error.message
    );
  }

  const updated = await updateProduct(id, parseResult.data);

  if (!updated) {
    throw new HttpError(404, "Product not found");
  }

  return res.json(updated);
}

export async function deleteProductController(
  req: Request,
  res: Response
) {
  const id = parseId(req.params.id, "product id");

  await deleteProduct(id);

  return res.json({ success: true });
}

// IMAGE HANDLING

export async function setProductImageController(
  req: Request,
  res: Response
) {
  const productId = parseId(req.params.id, "product id");

  if (!req.file) {
    throw new HttpError(400, "Image file is required");
  }

  const uploaded = await uploadFile(req.file, "product");

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
  const productId = parseId(req.params.id, "product id");

  await removeProductImageURL(productId);

  return res.json({ success: true });
}