import { Router } from "express";

import {
    getBookedCakesController,
    getPickupSlotByDateController,
    upsertPickupSlotController,
    getSettingsController,
    updateSettingsController
} from "../controllers/pickup.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(authMiddleware);

router.get("/booked-cakes", getBookedCakesController);
router.get("/slot/:date", getPickupSlotByDateController);
router.patch("/slot/:date", upsertPickupSlotController);
router.get("/settings", getSettingsController);
router.patch("/settings", updateSettingsController);

export default router;