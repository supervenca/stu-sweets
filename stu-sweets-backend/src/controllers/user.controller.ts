import type { Request, Response } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../services/user.service.js";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema.js";
import { HttpError } from "../utils/httpError.js";

// Защита от выдачи пароля
function sanitizeUser(user: any) {
  const { password, ...safeUser } = user;
  return safeUser;
}

// Получить всех пользователей
export async function getAllUsersController(req: Request, res: Response) {
  const users = await getAllUsers();
  res.json(users.map(sanitizeUser));
}

// Получить пользователя по id
export async function getUserByIdController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const user = await getUserById(id);

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return res.json(sanitizeUser(user));
}

// Создать пользователя
export async function createUserController(req: Request, res: Response) {
  const parseResult = createUserSchema.safeParse(req.body);

  if (!parseResult.success) {
    // Если данные невалидные — выбрасываем ошибку
    throw new HttpError(400, "Invalid input: " + parseResult.error.message);
  }

  const { email, password, name } = parseResult.data;
  const user = await createUser({ email, password, name });

  res.status(201).json(sanitizeUser(user));
}


// Обновить пользователя
export async function updateUserController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const parseResult = updateUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    throw new HttpError(400, "Invalid input: " + parseResult.error.message);
  }

  const updated = await updateUser(id, parseResult.data);
  if (!updated) throw new HttpError(404, "User not found");
  return res.json(sanitizeUser(updated));
}

// Удалить пользователя
export async function deleteUserController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const deleted = await deleteUser(id);
  if (!deleted) throw new HttpError(404, "User not found");
  return res.json({ success: true });
}

