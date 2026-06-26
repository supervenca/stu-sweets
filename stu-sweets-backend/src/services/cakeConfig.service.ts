import prisma from "../prisma/client.js";
import { CreateCakeConfigDto, UpdateCakeConfigDto } from "../types/cakeConfig.types.js";

export async function getCakeConfig(
  productId: number
) {
  return prisma.cakeConfig.findUnique({
    where: {
      productId,
    },
  });
}

export async function createCakeConfig(
  data: CreateCakeConfigDto
) {
  const existing = await prisma.cakeConfig.findUnique({
    where: { productId: data.productId },
  });

  if (existing) {
    throw new Error("CakeConfig already exists for product");
  }

  return prisma.cakeConfig.create({
    data: {
      productId: data.productId,
      flavor: data.flavor,
      color: data.color,
      messageColor: data.messageColor,
      certificate: data.certificate,

      smallMultiplier: data.smallMultiplier ?? 1,
      mediumMultiplier: data.mediumMultiplier ?? 1.5,
      largeMultiplier: data.largeMultiplier ?? 2,
    }
  });
}

export async function updateCakeConfig(productId: number, data: UpdateCakeConfigDto) {
  const config = await prisma.cakeConfig.findUnique({
    where: { productId },
  });

  if (!config) {
    throw new Error("CakeConfig not found");
  }

  await prisma.cakeConfig.update({
    where: { productId },
    data: {
      ...(data.flavor && { flavor: data.flavor }),
      ...(data.color && { color: data.color }),
      ...(data.messageColor && { messageColor: data.messageColor }),
      ...(typeof data.certificate === "boolean" && { certificate: data.certificate }),

      ...(data.smallMultiplier !== undefined && { smallMultiplier: data.smallMultiplier }),
      ...(data.mediumMultiplier !== undefined && { mediumMultiplier: data.mediumMultiplier }),
      ...(data.largeMultiplier !== undefined && { largeMultiplier: data.largeMultiplier }),
    },
  });

  return prisma.cakeConfig.findUnique({
    where: { productId },
  });
}

export async function deleteCakeConfig(productId: number) {
  const config = await prisma.cakeConfig.findUnique({
    where: { productId },
  });

  if (!config) {
    throw new Error("CakeConfig not found");
  }

  return prisma.cakeConfig.delete({
    where: { productId },
  });
}