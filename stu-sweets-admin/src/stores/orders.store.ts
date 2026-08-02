import { create } from "zustand";
import api from "../api/httpClient";

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  certificate: boolean;
  product?: {
    id: number;
    name: string;
    price: number;
    category?: {
      id: number;
      name: string;
      requiresCakeOptions: boolean;
    };
  };
  cakeConfig?: {
    size?: "SMALL" | "MEDIUM" | "LARGE";
    flavor?: string;
    color?: string;
    message?: string;
    messageColor?: string;
  };
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  comment?: string;
  status: "PENDING" | "CONFIRMED" | "PAID" | "FULFILLED";
  total: number;
  createdAt: string;
  items: OrderItem[];
  pickupSlot?: {
    id: number;
    date: string;
  } | null;
}

type OrdersState = {
  orders: Order[];
  loading: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;
  updateOrder: (id: number, data: Partial<Order>) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;
  connectOrdersSocket: () => void;
  disconnectOrdersSocket: () => void;
};

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let manualClose = false;

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });

    try {
      const res = await api.get("/internal/orders");

      const sorted = res.data
        .map((o: Order) => ({
          ...o,
        }))
        .sort((a: Order, b: Order) => a.id - b.id);

      set({
        orders: sorted,
        loading: false,
      });
    } catch (err) {
      console.error(err);
      set({
        error: "Failed to load orders",
        loading: false,
      });
    }
  },

  updateOrder: async (id, data) => {
    try {
      await api.put(`/internal/orders/${id}`, data);

      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
      }));
    } catch (err) {
      console.error(err);
      set({ error: "Failed to update order" });
    }
  },

  deleteOrder: async (id) => {
    try {
      await api.delete(`/internal/orders/${id}`);

      set((state) => ({
        orders: state.orders.filter((o) => o.id !== id),
      }));
    } catch (err) {
      console.error(err);
      set({ error: "Failed to delete order" });
    }
  },

  connectOrdersSocket: () => {
    if (socket && socket.readyState === WebSocket.OPEN) return;
    manualClose = false;

    const wsBaseUrl = import.meta.env.VITE_WS_URL;
    socket = new WebSocket(`${wsBaseUrl}/ws/admin`);

    socket.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.event === "order.created") {
          await get().fetchOrders();
        }
      } catch (err) {
        console.error("Invalid WS message", err);
      }
    };

    socket.onclose = () => {
      if (manualClose) return;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      reconnectTimer = setTimeout(() => {
        get().connectOrdersSocket();
      }, 3000);
    };

    socket.onerror = () => {
      socket?.close();
    };
  },

  disconnectOrdersSocket: () => {
    manualClose = true;

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (socket) {
      socket.close();
      socket = null;
    }
  },
}));