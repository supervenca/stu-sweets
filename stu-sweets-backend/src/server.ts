import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.get("/", (_, res) => res.send("Stu Sweets backend is running!"));

// Use routes
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/auth", authRoutes);

app.use(errorMiddleware);

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
