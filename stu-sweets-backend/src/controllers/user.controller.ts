import type { Request, Response } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../services/user.service.js";
import { HttpError } from "../utils/httpError.js";

// Получить всех пользователей
export async function getAllUsersController(req: Request, res: Response) {
  const users = await getAllUsers();
  res.json(users);
}

// Получить пользователя по id
export async function getUserByIdController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const user = await getUserById(id);

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return res.json(user);
}

// Создать пользователя
export async function createUserController(req: Request, res: Response) {
  const { email, password, name } = req.body;

  if (!email || !password) {
    throw new HttpError(400, "email and password required");
  }

  const user = await createUser({ email, password, name });
  return res.status(201).json(user);
}


// Обновить пользователя
export async function updateUserController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const data = req.body;

  try {
    const updated = await updateUser(id, data);
    res.json(updated);
  } catch (e: any) {
    res.status(404).json({ error: "User not found" });
  }
}

// Удалить пользователя
export async function deleteUserController(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await deleteUser(id);
    res.json({ success: true });
  } catch (e: any) {
    res.status(404).json({ error: "User not found" });
  }
}

