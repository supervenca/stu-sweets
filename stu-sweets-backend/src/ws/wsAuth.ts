//проверка JWT при handshake
import jwt from "jsonwebtoken";
import type { IncomingMessage } from "http";
import type { JwtPayload } from "../utils/jwt.js";

function getTokenFromRequest(req: IncomingMessage): string | null {
  if (!req.url) return null;

  const queryIndex = req.url.indexOf("?");
  if (queryIndex === -1) return null;

  const searchParams = new URLSearchParams(req.url.slice(queryIndex));
  return searchParams.get("token");
}

export function verifyAdminToken(req: IncomingMessage): JwtPayload | null {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return null;

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}