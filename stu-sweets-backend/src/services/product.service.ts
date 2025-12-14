//work with DB (Prisma)
import prisma from "../prisma/client.js";
import { CreateProductDto, UpdateProductDto } from "../types/product.js";
import { HttpError } from "../utils/httpError.js";

export async function getAllProducts() {
  return prisma.product.findMany();
}

export async function getProductById(id: number) {
  return prisma.product.findUnique({ where: { id } });
}

export async function createProduct(data: CreateProductDto) {
  return prisma.product.create({
    data: {
      ...data,
      stock: data.stock ?? 0,
    },
  });
}

export async function updateProduct(id: number, data: UpdateProductDto) {
  try {
    return await prisma.product.update({
      where: { id },
      data,
    });
  } catch (e: any) {
    if (e.code === "P2025") {
      throw new HttpError(404, "Product not found");
    }
    throw e;
  }
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