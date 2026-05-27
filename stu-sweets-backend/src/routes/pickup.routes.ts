import { Router } from "express";
import { 
    getPickupCalendarController, 
    getPickupCapacityController, 
    getRemainingPickupCapacityController 
} from "../controllers/pickup.controller.js";

const router = Router();

router.get("/calendar", getPickupCalendarController);
router.get("/capacity", getPickupCapacityController);
router.get("/remaining-capacity", getRemainingPickupCapacityController);

export default router;