// src/services/auth.service.ts
import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Проверка email и пароля
export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return null;

  return user;
}

// Генерация JWT
export function generateToken(user: { id: number; email: string }) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// login
export async function login(email: string, password: string) {
  const user = await authenticateUser(email, password);
  if (!user) return null;

  const token = generateToken({ id: user.id, email: user.email });

  // Не отдаём пароль
  const { password: _, ...userSafe } = user;

  return { user: userSafe, token };
}

