import prisma from "../prisma/client.js";
import { CreateProductDto, UpdateProductDto } from "../types/product.types.js";
import { FileType } from "../types/file.types.js";
import { HttpError } from "../utils/httpError.js";
import { Decimal } from "@prisma/client/runtime/library.js";
import { diskStorage } from "./file.storage.js";
import { uploadFile } from "./file.service.js";

export async function getAllProducts() {
  return prisma.product.findMany({
  include: {
    category: true,
    subCategory: true
  }
  });
}

export async function getProductById(id: number) {
  return prisma.product.findUnique({ 
    where: { id },
    include: {
      category: true, 
      subCategory: true
    }
   });
}

export async function createProduct(data: CreateProductDto) {

  if (data.subCategoryId) {
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: data.subCategoryId },
    });

    if (!subCategory || subCategory.categoryId !== data.categoryId) {
      throw new Error("Invalid subcategory for selected category");
    }
  }
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: new Decimal(data.price),
      stock: data.stock ?? 0,
      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId
    },
    include: { 
      category: true,
      subCategory: true
    },
  });
}

export async function updateProduct(id: number, data: UpdateProductDto) {

  if (data.subCategoryId) {
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: data.subCategoryId },
    });
    if (!subCategory || subCategory.categoryId !== data.categoryId) {
      throw new Error("Invalid subcategory for selected category");
    }
  }

  return prisma.product.update({
    where: { id },
    data: {
  ...(data.name !== undefined && {
    name: data.name,
  }),

  ...(data.description !== undefined && {
    description: data.description,
  }),

  ...(data.price !== undefined && {
    price: new Decimal(data.price),
  }),

  ...(data.stock !== undefined && {
    stock: data.stock,
  }),

  ...(data.categoryId !== undefined && {
    categoryId: data.categoryId,
  }),

  ...(data.subCategoryId !== undefined && {
    subCategoryId: data.subCategoryId,
  }),

  ...(data.isBestseller !== undefined && {
    isBestseller: data.isBestseller,
  }),

  ...(data.isCartRecommendation !== undefined && {
    isCartRecommendation: data.isCartRecommendation,
  }),
},
    include: { category: true, subCategory: true },
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

//product images

export async function setProductImage(productId: number, url: string) {
  return prisma.product.update({
    where: { id: productId },
    data: { imageUrl: url },
  });
}

// export async function replaceProductImage(productId: number, newFile: FileType) {
//   const product = await prisma.product.findUnique({ where: { id: productId } });

//   if (product?.imageUrl) {
//     await diskStorage.delete(product.imageUrl);
//   }

//   const newUrl = await uploadFile(newFile, "product");

//   return setProductImage(productId, newUrl.url);
// }

export async function deleteProductImage(url: string) {
  await diskStorage.delete(url);
}

export async function removeProductImageURL(
  productId: number
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product?.imageUrl) return;

  await deleteProductImage(product.imageUrl);

  return prisma.product.update({
    where: { id: productId },
    data: {
      imageUrl: null,
    },
  });
}