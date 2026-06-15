import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
//import userRoutes from "./routes/user.routes.js";
import internalUserRoutes from "./routes/user.internal.routes.js";
import productRoutes from "./routes/product.routes.js";
import internalProductRoutes from "./routes/product.internal.routes.js";
import orderRoutes from "./routes/order.routes.js";
import internalOrderRoutes from "./routes/order.internal.routes.js";
//import internalInvoiceRoutes from "./routes/internalInvoice.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import categoriesInternalRoutes from "./routes/categories.internal.routes.js";
import subCategoriesRoutes from "./routes/subCategories.routes.js";
import subCategoriesInternalRoutes from "./routes/subCategories.internal.routes.js";
import clientsRoutes from "./routes/clients.routes.js";
import internalPickupRoutes from "./routes/pickup.internal.routes.js";
import pickupRoutes from "./routes/pickup.routes.js";

import authRoutes from "./routes/auth.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

app.use(express.json());
app.use(cors({
  origin: [
      "http://localhost:3000", // фронт
      "http://localhost:5173", // админка
    ],
  credentials: true,
}));

app.get("/", (_, res) => res.send("Stu Sweets backend is running!"));

// Use routes
// app.use("/users", userRoutes); - temporarily disabled as not needed (may be needed later if we introduce user roles and have user-clients)
app.use("/internal/users", internalUserRoutes);
app.use("/products", productRoutes);
app.use("/internal/products", internalProductRoutes);
app.use("/orders", orderRoutes);
app.use("/internal/orders", internalOrderRoutes);
//app.use("/internal/invoices", internalInvoiceRoutes);
app.use("/categories", categoriesRoutes);
app.use("/internal/categories", categoriesInternalRoutes);
app.use("/sub-categories", subCategoriesRoutes);
app.use("/internal/sub-categories", subCategoriesInternalRoutes);
app.use("/internal/clients", clientsRoutes);
app.use("/internal/pickup", internalPickupRoutes);
app.use("/pickup", pickupRoutes);
app.use("/auth", authRoutes);

app.use(
  "/uploads",
  express.static("uploads")
);

app.use(errorMiddleware);

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
