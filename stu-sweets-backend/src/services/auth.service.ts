import prisma from "../prisma/client.js";
import { $Enums } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "1h";

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
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
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

