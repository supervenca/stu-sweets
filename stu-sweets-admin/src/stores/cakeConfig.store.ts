import { create } from "zustand";

import {
  getCakeConfig,
  createCakeConfig,
  updateCakeConfig,
  deleteCakeConfig,
} from "../api/cakeConfig.api";

import type {
  CakeConfig,
  CakeConfigPayload,
} from "../types/cakeConfig.types";


type CakeConfigState = {
  cakeConfig: CakeConfig | null;
  loading: boolean;

  fetchCakeConfig: (
    productId: number
  ) => Promise<void>;

  saveCakeConfig: (
    productId: number,
    data: Partial<CakeConfigPayload>
  ) => Promise<void>;

  removeCakeConfig: (
    productId: number
  ) => Promise<void>;
};


export const useCakeConfigStore = create<CakeConfigState>(
  (set) => ({

    cakeConfig: null,
    loading: false,


    fetchCakeConfig: async (productId) => {

      set({ loading: true });

      try {

        const data = await getCakeConfig(productId);

        set({
          cakeConfig: data,
        });

      } finally {

        set({
          loading: false,
        });

      }
    },


    saveCakeConfig: async (productId, data) => {

      const existing = await getCakeConfig(productId);

      let result: CakeConfig;

      if (existing) {

        result = await updateCakeConfig(
          productId,
          data
        );

      } else {

        result = await createCakeConfig(
          productId,
          data as CakeConfigPayload
        );

      }

      set({
        cakeConfig: result,
      });
    },


    removeCakeConfig: async (productId) => {

      await deleteCakeConfig(productId);

      set({
        cakeConfig: null,
      });
    },

  })
);