import { create } from "zustand";
import api from "../api/httpClient";
import { toast } from "react-hot-toast";

export interface User {
  id: number;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;

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
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/internal/users");
      set({ users: res.data, loading: false });
    } catch (err) {
      console.error(err);
      set({ error: "Failed to load users", loading: false });
      toast.error("Failed to load users");
    }
  },

  createUser: async (data) => {
    try {
      await api.post("/internal/users", data);
      toast.success("User created");
      await useUsersStore.getState().fetchUsers(); // рефетч
    } catch (err) {
      console.error(err);
      toast.error("Failed to create user");
    }
  },

  updateUser: async (id, data) => {
    try {
      await api.put(`/internal/users/${id}`, data);
      toast.success("User updated");
      await useUsersStore.getState().fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update user");
    }
  },

  deleteUser: async (id) => {
    try {
      await api.delete(`/internal/users/${id}`);
      toast.success("User deleted");
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete user");
    }
  },
}));