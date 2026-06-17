import { ENV } from "../config/env.js";

export const getImageUrl = (path?: string | null) => {
  if (!path) return "";
  return `${ENV.API_URL}/${path}`;
};