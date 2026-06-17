import { create } from "zustand";
import api from "../api/httpClient";

export type Product = {
  id: number;
  name: string;
  price: number;
  stock?: number;
  description: string;
  imageUrl?: string | null;
  categoryId: number | null;
  category?: {
    id: number;
    name: string;
  };
  subCategoryId?: number | null;
  subCategory?: {
    id: number;
    name: string;
  };
  isBestseller?: boolean;
  isCartRecommendation?: boolean;
};

type CreateProductDto = {
  name: string;
  price: number;
  stock?: number;
  description: string;
  imageUrl?: string | null;
  categoryId: number | null;
  subCategoryId?: number | null;
  isBestseller?: boolean;
  isCartRecommendation?: boolean;
  };

type ProductsState = {
  products: Product[];
  loading: boolean;
  error: string | null;

  fetchProducts: () => Promise<void>;
  createProduct: (data: CreateProductDto) => Promise<void>;
  updateProduct: (id: number, data: CreateProductDto) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  toggleBestseller: (id: number, value: boolean) => Promise<void>;
  toggleRecommendation: (id: number, value: boolean) => Promise<void>;
};

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/internal/products");
      console.log("Fetched products:", res.data);
      set({ products: res.data, loading: false });
    } catch {
      set({ error: "Failed to load products", loading: false });
    }
  },

  createProduct: async (data) => {
    console.log("Creating product with data:", data);
    try {
      const res = await api.post("/internal/products", data);
      console.log("Response from server:", res.data);
      set((state) => ({
        products: [...state.products, res.data],
      }));
    } catch {
      set({ error: "Failed to create product" });
    }
  },

  updateProduct: async (id, data) => {
    console.log("Updating product", id, "with data:", data);
    try {
      const res = await api.patch(`/internal/products/${id}`, data);
      console.log("Response from server:", res.data);
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? res.data : p
        ),
      }));
    } catch {
      set({ error: "Failed to update product" });
    }
  },

  toggleBestseller: async (id: number, value: boolean) => {
  try {
    const res = await api.patch(
      `/internal/products/${id}`,
      {
        isBestseller: value,
      }
    );

    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? res.data : p
      ),
    }));
  } catch {
    set({ error: "Failed to update bestseller" });
  }
},

  toggleRecommendation: async (id: number, value: boolean) => {
    try {
      const res = await api.patch(
        `/internal/products/${id}`,
        {
          isCartRecommendation: value,
        }
      );

      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? res.data : p
        ),
      }));
    } catch {
      set({
        error: "Failed to update recommendation",
      });
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
