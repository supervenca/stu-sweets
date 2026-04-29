import { create } from "zustand";
import api from "../api/httpClient";

export type Client = {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  blacklist: boolean;

  _count?: {
    orders: number;
  };
};

type Filter = "all" | "active" | "blacklisted";

type ClientsState = {
  clients: Client[];
  loading: boolean;
  error: string | null;

  filter: Filter;

  fetchClients: () => Promise<void>;
  toggleBlacklist: (id: number, blacklist: boolean) => Promise<void>;

  setFilter: (filter: Filter) => void;
};

export const useClientsStore = create<ClientsState>((set) => ({
  clients: [],
  loading: false,
  error: null,

  filter: "all",

  fetchClients: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/internal/clients");
      set({ clients: res.data, loading: false });
    } catch {
      set({ error: "Failed to load clients", loading: false });
    }
  },

  toggleBlacklist: async (id, blacklist) => {
    try {
      const res = await api.patch(
        `/internal/clients/${id}/blacklist`,
        { blacklist }
      );

      set((state) => ({
        clients: state.clients.map((c) =>
          c.id === id ? res.data : c
        ),
      }));
    } catch {
      set({ error: "Failed to update client" });
    }
  },

  setFilter: (filter) => set({ filter }),
}));