import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError.js";

export function adminMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.user) {
    throw new HttpError(401, "Unauthorized");
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "SUPER_ADMIN") {
    throw new HttpError(403, "Admin access required");
  }

  next();
}
