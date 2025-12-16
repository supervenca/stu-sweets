import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils/httpError.js";
import type { JwtPayload } from "../utils/jwt.js";

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new HttpError(401, "Authorization header missing");
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    throw new HttpError(401, "Invalid authorization format");
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    req.user = payload;

    next();
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }
}
