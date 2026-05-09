import { create } from "zustand";
import api from "../api/httpClient";

export type SubCategory = {
  id: number;
  name: string;
  categoryId: number;
  category?: {
    id: number;
    name: string;
  };
};

type SubCategoriesState = {
  subCategories: SubCategory[];
  loading: boolean;
  error: string | null;

  fetchSubCategories: () => Promise<void>;
  createSubCategory: (name: string, categoryId: number) => Promise<void>;
  updateSubCategory: (
        id: number,
        data: {
            name?: string;
            categoryId?: number;
        }
        ) => Promise<void>;
  deleteSubCategory: (id: number) => Promise<void>;
};

export const useSubCategoriesStore = create<SubCategoriesState>((set) => ({
  subCategories: [],
  loading: false,
  error: null,

  fetchSubCategories: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/sub-categories`);
      set({ subCategories: res.data, loading: false });
    } catch {
      set({ error: "Failed to load sub-categories", loading: false });
    }
  },

  createSubCategory: async (name, categoryId) => {
    try {
      const res = await api.post("/internal/sub-categories", { name, categoryId });
      set((state) => ({
        subCategories: [...state.subCategories, res.data],
      }));
    } catch {
      set({ error: "Failed to create sub-category" });
    }
  },

  updateSubCategory: async (id, data) => {
    try {
      const res = await api.patch(
        `/internal/sub-categories/${id}`,
        data
      );

      set((state) => ({
        subCategories: state.subCategories.map((sc) =>
          sc.id === id ? res.data : sc
        ),
      }));
    } catch {
      set({ error: "Failed to update sub-category" });
    }
  },

  deleteSubCategory: async (id) => {
    try {
      await api.delete(`/internal/sub-categories/${id}`);
      set((state) => ({
        subCategories: state.subCategories.filter((sc) => sc.id !== id),
      }));
    } catch {
      set({ error: "Failed to delete sub-category" });
    }
  },
}));