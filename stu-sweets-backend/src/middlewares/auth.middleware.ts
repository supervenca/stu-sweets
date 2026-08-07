import type { Request, Response, NextFunction } from "express";
import { ENV } from "../config/env.js";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils/httpError.js";
import type { JwtPayload } from "../utils/jwt.js";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const cookieToken = req.cookies?.token;

  const authHeader = req.headers.authorization;
  let bearerToken: string | undefined;

  if (authHeader) {
    const [type, token] = authHeader.split(" ");

    if (type === "Bearer" && token) {
      bearerToken = token;
    }
  }

  const token = cookieToken || bearerToken;

  if (!token) {
    throw new HttpError(401, "Unauthorized");
  }

  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;

    req.user = payload;
    next();
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}