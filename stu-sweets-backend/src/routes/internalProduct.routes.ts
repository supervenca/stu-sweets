import { Router } from "express";
import {
  getAllProductsPublicController,
  getProductByIdPublicController,
  createProductController,
  updateProductController,
  deleteProductController,
} from "../controllers/product.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", getAllProductsPublicController);
router.get("/:id", getProductByIdPublicController);
router.post("/", createProductController);
router.put("/:id", updateProductController);
router.delete("/:id", deleteProductController);

export default router;
