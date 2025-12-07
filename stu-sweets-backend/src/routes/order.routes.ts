import { Router } from "express";
import {
  getAllOrdersController,
  getOrderByIdController,
  createOrderController,
  updateOrderController,
  deleteOrderController,
} from "../controllers/order.controller.js";

const router = Router();

router.get("/", getAllOrdersController);
router.get("/:id", getOrderByIdController);
router.post("/", createOrderController);
router.put("/:id", updateOrderController);
router.delete("/:id", deleteOrderController);

export default router;
