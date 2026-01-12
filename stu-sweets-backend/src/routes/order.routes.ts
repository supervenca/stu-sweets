import { Router } from "express";
import {
  createOrderController,
  getOrderByIdPublicController,
} from "../controllers/order.controller.js";

const router = Router();


router.get("/:id", getOrderByIdPublicController);
router.post("/", createOrderController);

export default router;

//public routes