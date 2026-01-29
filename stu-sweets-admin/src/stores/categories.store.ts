import { create } from "zustand";
import api from "../api/httpClient";

export type Category = {
  id: number;
  name: string;
};

type CategoriesState = {
  categories: Category[];
  loading: boolean;
  error: string | null;

  fetchCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<void>;
  updateCategory: (id: number, name: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
};

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/categories");
      set({ categories: res.data, loading: false });
    } catch {
      set({ error: "Failed to load categories", loading: false });
    }
  },

  createCategory: async (name: string) => {
    try {
      const res = await api.post("/internal/categories", { name });
      set((state) => ({
        categories: [...state.categories, res.data],
      }));
    } catch {
      set({ error: "Failed to create category" });
    }
  },

  updateCategory: async (id: number, name: string) => {
    try {
      const res = await api.patch(`/internal/categories/${id}`, { name });
      set((state) => ({
        categories: state.categories.map((c) =>
          c.id === id ? res.data : c
        ),
      }));
    } catch {
      set({ error: "Failed to update category" });
    }
  },

  deleteCategory: async (id: number) => {
    try {
      await api.delete(`/internal/categories/${id}`);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
    } catch {
      set({ error: "Failed to delete category" });
    }
  },
}));
