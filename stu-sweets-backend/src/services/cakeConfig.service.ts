import prisma from "../prisma/client.js";
import { CreateCakeConfigDto, UpdateCakeConfigDto } from "../types/cakeConfig.types.js";

export async function getCakeConfig(
  productId: number
) {
  return prisma.cakeConfig.findUnique({
    where: {
      productId,
    },
    include: {
      cakeSizes: true,
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
    data,
    include: {
      cakeSizes: true,
    },
  });
}

export async function updateCakeConfig(
  productId: number,
  data: UpdateCakeConfigDto
) {
  return prisma.$transaction(async (tx) => {
    // 1. получаем конфиг + текущие sizes
    const config = await tx.cakeConfig.findUnique({
      where: { productId },
      include: { cakeSizes: true },
    });

    if (!config) {
      throw new Error("CakeConfig not found");
    }

    // 2. обновляем простые поля
    await tx.cakeConfig.update({
      where: { productId },
      data: {
        ...(data.flavor && { flavor: data.flavor }),
        ...(data.color && { color: data.color }),
        ...(data.messageColor && { messageColor: data.messageColor }),
        ...(typeof data.certificate === "boolean" && { certificate: data.certificate }),
      }
    });

    // 3. если sizes пришли — синхронизируем
    if (data.cakeSizes !== undefined) {
      const incomingIds = data.cakeSizes
      .map((s) => s.id)
      .filter((id): id is number => id !== undefined);

      // 3.1 update + create
      for (const size of data.cakeSizes) {
        if (size.id) {
          await tx.cakeSize.update({
            where: { id: size.id },
            data: {
              name: size.name,
              multiplier: size.multiplier,
            },
          });
        } else {
          await tx.cakeSize.create({
            data: {
              name: size.name,
              multiplier: size.multiplier,
              cakeConfigId: config.id,
            },
          });
        }
      }

      // 3.2 delete missing
      await tx.cakeSize.deleteMany({
        where: {
          cakeConfigId: config.id,
          id: {
            notIn: incomingIds.length ? incomingIds : [-1],
          },
        },
      });
    }

    // 4. возвращаем актуальный конфиг
    return tx.cakeConfig.findUnique({
      where: { productId },
      include: { cakeSizes: true },
    });
  });
}

export async function createCakeSize(
  cakeConfigId: number,
  data: {
    name: string;
    multiplier: number;
  }
) {
  return prisma.cakeSize.create({
    data: {
      ...data,
      cakeConfigId,
    },
  });
}

export async function updateCakeSize(
  id: number,
  data: {
    name?: string;
    multiplier?: number;
  }
) {
  return prisma.cakeSize.update({
    where: { id },
    data,
  });
}

export async function deleteCakeSize(
  id: number
) {
  return prisma.cakeSize.delete({
    where: { id },
  });
}