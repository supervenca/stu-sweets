import type { Request, Response } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../services/user.service.js";

// Получить всех пользователей
export async function getAllUsersController(req: Request, res: Response) {
  const users = await getAllUsers();
  res.json(users);
}

// Получить пользователя по id
export async function getUserByIdController(req: Request, res: Response) {
  const id = Number(req.params.id);
  const user = await getUserById(id);

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(user);
}

// Создать пользователя
export async function createUserController(req: Request, res: Response) {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  try {
    const user = await createUser({ email, password, name });
    res.status(201).json(user);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
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

