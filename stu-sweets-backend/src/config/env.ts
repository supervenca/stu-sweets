import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 4000,
  CLIENT_URLS: [
    "http://localhost:3000", // фронт
    "http://localhost:5173", // админка
  ],
};