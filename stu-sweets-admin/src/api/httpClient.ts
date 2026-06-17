import axios from "axios";
import { ENV } from "../shared/config/env";

const api = axios.create({
  baseURL: ENV.API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
