import type { JwtPayload } from "../utils/jwt.js";

export interface AuthUser extends JwtPayload {
  id: number;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
export {};