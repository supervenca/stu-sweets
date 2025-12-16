import prisma from "../prisma/client.js";
import type { CreateUserDto, UpdateUserDto } from "../types/user.js";
import { HttpError } from "../utils/httpError.js";
import bcrypt from "bcrypt";

export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
      // password не возвращаем
    },
  });
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true
      // password не возвращаем
    },
  });
}

export async function createUser(data: CreateUserDto) {
  // Хешируем пароль
  const hashedPassword = await bcrypt.hash(data.password, 10); // 10 — это соль
  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  });
}

export async function updateUser(id: number, data: UpdateUserDto) {
  try {
    const updateData: UpdateUserDto = { ...data };

    return await prisma.user.update({
      where: { id },
      data: updateData,
    });
  } catch (e: any) {
    if (e.code === "P2025") {
      throw new HttpError(404, "User not found");
    }
    throw e;
  }
}

export async function deleteUser(id: number) {
  try {
    return await prisma.user.delete({ where: { id } });
  } catch (e: any) {
    if (e.code === "P2025") {
      throw new HttpError(404, "User not found");
    }
    throw e;
  }
}
