import prisma from "../prisma/client.js";
import type { CreateUserDto, UpdateUserDto } from "../types/user.js";
import { HttpError } from "../utils/httpError.js";

export async function getAllUsers() {
  return prisma.user.findMany();
}

export async function getUserById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

export async function createUser(data: CreateUserDto) {
  return prisma.user.create({ data });
}

export async function updateUser(id: number, data: UpdateUserDto) {
  try {
    return await prisma.user.update({
      where: { id },
      data,
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
