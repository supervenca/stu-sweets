import { create } from "zustand";
import api from "../api/httpClient";

export type PickupDay = {
  date: string;
  capacity: number;
  booked: number;
  status: "AVAILABLE" | "FULL" | "UNAVAILABLE";
};

export type BakerySettings = {
  id: number;
  defaultDailyCakeCapacity: number;
  minPreparationDays: number;
};

type PickupState = {
  calendar: PickupDay[];
  settings: BakerySettings | null;

  loading: boolean;
  error: string | null;

  fetchCalendar: () => Promise<void>;

  updateSlot: (
    date: string,
    data: {
      isAvailable?: boolean;
      maxCakeQuantity?: number | null;
    }
  ) => Promise<void>;

  fetchSettings: () => Promise<void>;

  updateSettings: (
    data: {
      defaultDailyCakeCapacity: number;
      minPreparationDays: number;
    }
  ) => Promise<void>;
};

export const usePickupStore = create<PickupState>((set) => ({
  calendar: [],
  settings: null,

  loading: false,
  error: null,

  fetchCalendar: async () => {
    set({ loading: true });

    try {
      const res = await api.get("/pickup/calendar");

      const data =
        res.data?.result ??
        res.data?.calendar ??
        res.data?.data ??
        res.data;

      set({
        calendar: Array.isArray(data) ? data : [],
        loading: false,
      });
    } catch {
      set({
        error: "Failed to load calendar",
        loading: false,
      });
    }
  },

  updateSlot: async (date, data) => {
  try {
    await api.patch(`/internal/pickup/slot/${date}`, data);
    await usePickupStore.getState().fetchCalendar();
  } catch {
    set({ error: "Failed to update slot" });
  }
},

  fetchSettings: async () => {
    try {
      const res = await api.get(
        "/internal/pickup/settings"
      );

      set({
        settings: res.data,
      });
    } catch {
      set({
        error: "Failed to load settings",
      });
    }
  },

  updateSettings: async (data) => {
    try {
      const res = await api.patch(
        "/internal/pickup/settings",
        data
      );

      set({
        settings: res.data,
      });
    } catch {
      set({
        error: "Failed to update settings",
      });
    }
  },
}));