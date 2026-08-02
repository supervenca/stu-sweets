// функция broadcastNewOrder()
import type WebSocket from "ws";

export type WsEvent =
  | { event: "order.created"; payload: { orderId: number; createdAt: string } }
  | { event: "order.updated"; payload: { orderId: number; status: string } };

const clients = new Set<WebSocket>();

export function registerClient(ws: WebSocket) {
  clients.add(ws);
}

export function unregisterClient(ws: WebSocket) {
  clients.delete(ws);
}

export function broadcast(message: WsEvent) {
  const data = JSON.stringify(message);

  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
    } else {
      clients.delete(ws);
    }
  }
}

export function broadcastNewOrder(orderId: number, createdAt: Date) {
  broadcast({ 
    event: "order.created", 
    payload: { 
        orderId, 
        createdAt: createdAt.toISOString() 
    } 
  });
  //console.log("broadcastNewOrder:", orderId, createdAt);
}