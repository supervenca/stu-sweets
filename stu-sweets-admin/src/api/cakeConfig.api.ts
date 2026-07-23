import api from "./httpClient";
import axios from "axios";

import type {
  CakeConfig,
  CakeConfigPayload,
} from "../types/cakeConfig.types";


export const getCakeConfig = async (
  productId: number
): Promise<CakeConfig | null> => {
    try {
  const res = await api.get(
    `/cake-config/${productId}`
  );

  return res.data;
} catch (error) {

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
};


export const createCakeConfig = async (
  productId: number,
  data: CakeConfigPayload
): Promise<CakeConfig> => {
  const res = await api.post(
    `/internal/cake-config/${productId}`,
    data
  );

  return res.data;
};


export const updateCakeConfig = async (
  productId: number,
  data: Partial<CakeConfigPayload>
): Promise<CakeConfig> => {
  const res = await api.patch(
    `/internal/cake-config/${productId}`,
    data
  );

  return res.data;
};


export const deleteCakeConfig = async (
  productId: number
): Promise<void> => {
  await api.delete(
    `/internal/cake-config/${productId}`
  );
};