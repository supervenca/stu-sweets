import prisma from "../prisma/client.js";
import type { CreateUserDto, UpdateUserDto } from "../types/user.js";

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
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({ where: { id } });
}

