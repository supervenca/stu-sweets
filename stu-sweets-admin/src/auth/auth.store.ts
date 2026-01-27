import { create } from "zustand";
import httpClient from "../api/httpClient";

type User = {
  id: number;
  email: string;
  role: string;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  checkAuth: async () => {
    try {
      const res = await httpClient.get("/auth/me");
      set({ user: res.data, loading: false });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null });
  },
}));
