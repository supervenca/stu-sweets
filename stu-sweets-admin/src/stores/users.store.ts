import { create } from "zustand";
import api from "../api/httpClient";
import type { AxiosError } from "axios";

export interface User {
  id: number;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

interface UsersState {
  users: User[];
  loading: boolean;

  fetchUsers: () => Promise<void>;
  createUser: (data: {
    email: string;
    password: string;
    role: User["role"];
  }) => Promise<void>;
  updateUser: (
    id: number,
    data: Partial<{
      email: string;
      password: string;
      role: User["role"];
    }>
  ) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  loading: false,

  fetchUsers: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/internal/users");
      set({ users: res.data, loading: false });
    } catch {
      set({ loading: false });
      throw new Error("Failed to load users");
    }
  },

  createUser: async (data) => {
    try {
      await api.post("/internal/users", data);
      await useUsersStore.getState().fetchUsers();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      throw new Error(
        error?.response?.data?.message || "Failed to create user"
      );
    }
  },

  updateUser: async (id, data) => {
    try {
      await api.put(`/internal/users/${id}`, data);
      await useUsersStore.getState().fetchUsers();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      throw new Error(
        error?.response?.data?.message || "Failed to update user"
      );
    }
  },

  deleteUser: async (id) => {
    try {
      await api.delete(`/internal/users/${id}`);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
      }));
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      throw new Error(
        error?.response?.data?.message || "Failed to delete user"
      );
    }
  },
}));