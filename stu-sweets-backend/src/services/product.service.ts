import prisma from "../prisma/client.js";
import { CreateProductDto, UpdateProductDto } from "../types/product.js";
import { HttpError } from "../utils/httpError.js";
import { Decimal } from "@prisma/client/runtime/library.js";

export async function getAllProducts() {
  return prisma.product.findMany({
  include: {category: true}
  });
}

export async function getProductById(id: number) {
  return prisma.product.findUnique({ 
    where: { id },
    include: {category: true}
   });
}

export async function createProduct(data: CreateProductDto) {
  const categoryIdInt = data.categoryId != null ? parseInt(data.categoryId as any, 10) : null;

  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: new Decimal(data.price),
      stock: data.stock ?? 0,
      categoryId: categoryIdInt,
    },
    include: { category: true },
  });
}

export async function updateProduct(id: number, data: UpdateProductDto) {
  const categoryIdInt = data.categoryId != null ? parseInt(data.categoryId as any, 10) : null;

  return prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price !== undefined ? new Decimal(data.price) : undefined,
      stock: data.stock,
      categoryId: categoryIdInt,
    },
    include: { category: true },
  });
}

export async function deleteProduct(id: number) {
  try {
    return await prisma.product.delete({ where: { id } });
  } catch (e: any) {
    if (e.code === "P2025") {
      throw new HttpError(404, "Product not found");
    }
    throw e;
  }
}