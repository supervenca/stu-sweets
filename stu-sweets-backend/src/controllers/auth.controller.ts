import type { Request, Response } from "express";
import { login } from "../services/auth.service.js";
import { HttpError } from "../utils/httpError.js";
import prisma from "../prisma/client.js";

export async function loginController(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new HttpError(400, "Email and password are required");
  }

  const result = await login(email, password);

  if (!result) {
    throw new HttpError(401, "Invalid email or password");
  }

  return res.json(result);
}

export async function meController(req: Request, res: Response) {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
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