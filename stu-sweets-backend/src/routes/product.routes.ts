import { Router } from "express";
import {
  getAllProductsPublicController,
  getProductByIdPublicController,
} from "../controllers/product.controller.js";

const router = Router();

router.get("/", getAllProductsPublicController);
router.get("/:id", getProductByIdPublicController);

export default router;

//public routes