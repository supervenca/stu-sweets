import { Router } from "express";
import {
  getAllOrdersPublicController,
  getOrderByIdPublicController,
  createOrderController,
  updateOrderController,
  deleteOrderController,
} from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", getAllOrdersPublicController);
router.get("/:id", getOrderByIdPublicController);
router.post("/", createOrderController);
router.put("/:id", updateOrderController);
router.delete("/:id", deleteOrderController);

export default router;
