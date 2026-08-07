//проверка JWT при handshake
import jwt from "jsonwebtoken";
import type { IncomingMessage } from "http";
import { parseCookie } from "cookie";
import type { JwtPayload } from "../utils/jwt.js";

function getTokenFromCookies(req: IncomingMessage): string | null {
  const rawCookie = req.headers.cookie;
  if (!rawCookie) return null;

  const cookies = parseCookie(rawCookie);
  return cookies.token || null;
}

export function verifyAdminToken(req: IncomingMessage): JwtPayload | null {
  try {
    const token = getTokenFromCookies(req);
    if (!token) return null;

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    if (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}