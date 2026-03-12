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

  addItem: (orderId: number, item: { productId: number; quantity: number }) => Promise<void>;
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
      await toast.promise(api.put(`internal/orders/${id}`, data), {
        loading: "Saving order...",
        success: "Order updated!",
        error: "Failed to update order",
      });

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

  addItem: async (orderId, item) => {
  try {
    await toast.promise(
      api.post(`internal/orders/${orderId}/items`, item),
      {
        loading: "Adding product...",
        success: "Product added!",
        error: "Failed to add product",
      }
    );

    // обновляем заказы с сервера
    await get().fetchOrders();

  } catch (err) {
    console.error(err);
    set({ error: "Failed to add item" });
  }
},

  updateItem: async (orderId, itemId, data) => {
  try {
    await toast.promise(
      api.put(`internal/orders/${orderId}/items/${itemId}`, data),
      {
        loading: "Updating item...",
        success: "Item updated!",
        error: "Failed to update item",
      }
    );

    await get().fetchOrders();

  } catch (err) {
    console.error(err);
    set({ error: "Failed to update item" });
  }
},

  deleteItem: async (orderId, itemId) => {
  try {
    await toast.promise(
      api.delete(`internal/orders/${orderId}/items/${itemId}`),
      {
        loading: "Deleting item...",
        success: "Item removed!",
        error: "Failed to delete item",
      }
    );

    await get().fetchOrders();

  } catch (err) {
    console.error(err);
    set({ error: "Failed to delete item" });
  }
},
}));