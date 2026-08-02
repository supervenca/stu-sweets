// инициализация WebSocket.Server
import { WebSocketServer } from "ws";
import http from "http";
import { verifyAdminToken } from "./wsAuth.js";
import { registerClient, unregisterClient } from "./wsBroadcast.js";

export function initWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ server, path: "/ws/admin" });

  wss.on("connection", (ws, req) => {
    const user = verifyAdminToken(req);
    if (!user) {
      //console.log("WS unauthorized");
      ws.close(4001, "Unauthorized");
      return;
    }
    registerClient(ws);
    ws.on("close", () => unregisterClient(ws));
  });

  return wss;
}

