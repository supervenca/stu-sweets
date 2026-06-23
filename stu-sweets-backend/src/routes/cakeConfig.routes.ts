import { Router } from "express";
import {getCakeConfigController } from "../controllers/cakeConfig.controller.js";

const router = Router();

router.get("/:productId", getCakeConfigController);

export default router;