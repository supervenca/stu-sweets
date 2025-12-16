import type { Request, Response } from "express";
import { login } from "../services/auth.service.js";
import { HttpError } from "../utils/httpError.js";

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
