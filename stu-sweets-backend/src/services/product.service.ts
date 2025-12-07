//work with DB (Prisma)
import prisma from "../prisma/client.js";
import { CreateProductDto, UpdateProductDto } from "../types/product.js";

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
  return prisma.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: number) {
  return prisma.product.delete({ where: { id } });
}