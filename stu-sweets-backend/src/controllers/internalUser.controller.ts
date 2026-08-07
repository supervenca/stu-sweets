import type { Request, Response } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../services/user.service.js";
import { HttpError } from "../utils/httpError.js";
import prisma from "../prisma/client.js";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema.js";

// Убираем пароль из ответа
function sanitizeUser(user: any) {
  const { password, ...safeUser } = user;
  return safeUser;
}

// GET ALL USERS
export async function getAllUsersController(req: Request, res: Response) {
  const users = await getAllUsers();
  res.json(users.map(sanitizeUser));
}

// GET USER BY ID
export async function getUserByIdController(req: Request, res: Response) {
  const id = Number(req.params.id);

  const user = await getUserById(id);
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  res.json(sanitizeUser(user));
}

// CREATE USER with role
export async function createUserController(req: Request, res: Response) {
  const data = createUserSchema.parse(req.body);

  const user = await createUser(data);

  res.status(201).json(sanitizeUser(user));
}

// UPDATE USER
export async function updateUserController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = updateUserSchema.parse(req.body);
  const { role } = data;

  // cannot change your own role
  if (
    req.user!.id === id &&
    role &&
    role !== "SUPER_ADMIN"
  ) {
    throw new HttpError(400, "You cannot change your own role");
  }

  const updated = await updateUser(id, data);

  if (!updated) {
    throw new HttpError(404, "User not found");
  }

  res.json(sanitizeUser(updated));
}

// DELETE USER
export async function deleteUserController(req: Request, res: Response) {
  const id = Number(req.params.id);

  // cannot delete yourself
  if (req.user!.id === id) {
    throw new HttpError(400, "You cannot delete yourself");
  }

  const user = await getUserById(id);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  // cannot delete the last SUPER_ADMIN
  if (user.role === "SUPER_ADMIN") {
    const superAdminsCount = await prisma.user.count({
      where: { role: "SUPER_ADMIN" },
    });

    if (superAdminsCount <= 1) {
      throw new HttpError(400, "At least one SUPER_ADMIN must exist");
    }
  }

  await deleteUser(id);

  res.json({ success: true });
}