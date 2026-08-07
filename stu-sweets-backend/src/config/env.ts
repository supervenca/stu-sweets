import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not configured");
}

export const ENV = {
  PORT: Number(process.env.PORT || 4000),

  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h",

  CLIENT_URLS: [
    "http://localhost:3000",
    "http://localhost:5173",
  ],
};