import { create } from "zustand";
import api from "../api/httpClient";

export type Product = {
  id: number;
  name: string;
  price: number;
  categoryId: number | null;
  category?: {
    id: number;
    name: string;
  };
};

type CreateProductDto = {
  name: string;
  price: number;
  categoryId: number | null;
};

type ProductsState = {
  products: Product[];
  loading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  createProduct: (data: CreateProductDto) => Promise<void>;
  updateProduct: (id: number, data: CreateProductDto) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
};

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/products");
      set({ products: res.data, loading: false });
    } catch {
      set({ error: "Failed to load products", loading: false });
    }
  },

  createProduct: async (data) => {
    try {
      const res = await api.post("/internal/products", data);
      set((state) => ({
        products: [...state.products, res.data],
      }));
    } catch {
      set({ error: "Failed to create product" });
    }
  },

  updateProduct: async (id, data) => {
    try {
      const res = await api.patch(`/internal/products/${id}`, data);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? res.data : p
        ),
      }));
    } catch {
      set({ error: "Failed to update product" });
    }
  },

  deleteProduct: async (id) => {
    try {
      await api.delete(`/internal/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch {
      set({ error: "Failed to delete product" });
    }
  },
}));
