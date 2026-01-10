import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/httpError.js";

export function superAdminMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== "SUPER_ADMIN") {
    throw new HttpError(403, "Super admin access required");
  }

  next();
}
