import { Router } from "express";
import { getPickupCalendarController, getPickupCapacityController } from "../controllers/pickup.controller.js";

const router = Router();

router.get("/calendar", getPickupCalendarController);
router.get("/capacity", getPickupCapacityController);

export default router;