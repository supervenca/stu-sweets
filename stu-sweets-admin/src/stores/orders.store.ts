import { create } from "zustand";
import api from "../api/httpClient";
import toast from "react-hot-toast";

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
};

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("internal/orders");
      console.log("Fetched orders:", res.data);
      set({ orders: res.data, loading: false });
    } catch (err) {
      console.error(err);
      set({ error: "Failed to load orders", loading: false });
    }
  },

  updateOrder: async (id, data) => {
    try {
      await toast.promise(
        api.put(`internal/orders/${id}`, data),
        {
          loading: "Saving order...",
          success: "Order updated!",
          error: "Failed to update order",
        }
      );
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
    const confirmed = confirm("Are you sure you want to delete this order?");
    if (!confirmed) return;

    try {
      await toast.promise(api.delete(`internal/orders/${id}`), {
        loading: "Deleting order...",
        success: "Order deleted!",
        error: "Failed to delete order",
      });
      set((state) => ({
        orders: state.orders.filter((o) => o.id !== id),
      }));
    } catch (err) {
      console.error(err);
      set({ error: "Failed to delete order" });
    }
  },
}));