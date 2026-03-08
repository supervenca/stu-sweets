import { Router } from "express";
import {
  getAllOrdersPublicController,
  getOrderByIdPublicController,
  createOrderController,
  updateOrderController,
  deleteOrderController,
    addOrderItemController,
    updateOrderItemController,
    deleteOrderItemController
} from "../controllers/order.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/", getAllOrdersPublicController);
router.get("/:id", getOrderByIdPublicController);
router.post("/", createOrderController);
router.put("/:id", updateOrderController);
router.delete("/:id", deleteOrderController);

router.post("/:orderId/items", addOrderItemController);
router.put("/:orderId/items/:itemId", updateOrderItemController);
router.delete("/:orderId/items/:itemId", deleteOrderItemController);

export default router;
