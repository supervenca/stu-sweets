import { Router } from "express";
import {
  getAllProductsController,
  getProductByIdController,
  createProductController,
  updateProductController,
  deleteProductController,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", getAllProductsController);
router.get("/:id", getProductByIdController);
router.post("/", createProductController);
router.put("/:id", updateProductController);
router.delete("/:id", deleteProductController);

export default router;
