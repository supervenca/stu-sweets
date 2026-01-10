import prisma from "../prisma/client.js";
import { $Enums } from "@prisma/client";
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
export function generateToken(user: {
  id: number;
  email: string;
  role: $Enums.UserRole;
}) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// login
export async function login(email: string, password: string) {
  const user = await authenticateUser(email, password);
  if (!user) return null;

  const token = generateToken({ 
    id: user.id, 
    email: user.email,
    role: user.role
  });

  // Не отдаём пароль
  const { password: _, ...userSafe } = user;

  return { user: userSafe, token };
}

