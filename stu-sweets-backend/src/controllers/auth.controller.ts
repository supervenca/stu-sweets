import type { Request, Response } from "express";
import { login } from "../services/auth.service.js";
import { HttpError } from "../utils/httpError.js";
import prisma from "../prisma/client.js";
import { loginSchema } from "../schemas/auth.schema.js";

const isProd = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 1000 * 60 * 60, // 1h
};

export async function loginController(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);

  const result = await login(email, password);

  if (!result) {
    throw new HttpError(401, "Invalid email or password");
  }

  res.cookie("token", result.token, authCookieOptions);

  return res.json({ user: result.user });
}

export async function logoutController(_req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });

  return res.json({ success: true });
}

export async function meController(req: Request, res: Response) {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new HttpError(401, "User not found");
  }

  return res.json(user);
}