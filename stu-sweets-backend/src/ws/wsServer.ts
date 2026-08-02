// инициализация WebSocket.Server
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { verifyAdminToken } from "./wsAuth.js";
import { registerClient, unregisterClient } from "./wsBroadcast.js";
import type { JwtPayload } from "../utils/jwt.js";

type AuthedWebSocket = WebSocket & {
  user?: JwtPayload;
};

export function initWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ server, path: "/ws/admin" });

  wss.on("connection", (ws: AuthedWebSocket, req) => {
    const user = verifyAdminToken(req);

    if (!user) {
      ws.close(4001, "Unauthorized");
      return;
    }

    ws.user = user;

    registerClient(ws);
    ws.on("close", () => unregisterClient(ws));
  });

  return wss;
}

