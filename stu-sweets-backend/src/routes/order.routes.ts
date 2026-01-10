import { Router } from "express";
import {
  getAllOrdersPublicController,
  getOrderByIdPublicController,
} from "../controllers/order.controller.js";

const router = Router();

router.get("/", getAllOrdersPublicController);
router.get("/:id", getOrderByIdPublicController);

export default router;

//public routes