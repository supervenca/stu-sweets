import { create } from "zustand";
import api from "../api/httpClient";

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    name: string;
    price: number;
  };
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  comment?: string;
  status: "PENDING" | "CONFIRMED" | "PAID" | "FULFILLED" | "CANCELED";
  total: number;
  createdAt: string;
  items: OrderItem[];
}

type OrdersState = {
  orders: Order[];
  loading: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;
  updateOrder: (id: number, data: Partial<Order>) => Promise<void>;
  deleteOrder: (id: number) => Promise<void>;

  addItem: (
    orderId: number,
    item: { productId: number; quantity: number }
  ) => Promise<void>;

  updateItem: (
    orderId: number,
    itemId: number,
    data: { quantity?: number }
  ) => Promise<void>;

  deleteItem: (orderId: number, itemId: number) => Promise<void>;
};

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
        orders: state.orders.map((o) =>
          o.id === id ? { ...o, ...data } : o
        ),
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

  addItem: async (orderId, item) => {
    try {
      await api.post(`/internal/orders/${orderId}/items`, item);

      await get().fetchOrders();
    } catch (err) {
      console.error(err);
      set({ error: "Failed to add item" });
    }
  },

  updateItem: async (orderId, itemId, data) => {
    try {
      await api.put(
        `/internal/orders/${orderId}/items/${itemId}`,
        data
      );

      await get().fetchOrders();
    } catch (err) {
      console.error(err);
      set({ error: "Failed to update item" });
    }
  },

  deleteItem: async (orderId, itemId) => {
    try {
      await api.delete(
        `/internal/orders/${orderId}/items/${itemId}`
      );

      await get().fetchOrders();
    } catch (err) {
      console.error(err);
      set({ error: "Failed to delete item" });
    }
  },
}));