import { Router } from "express";
import { createCakeConfigController, updateCakeConfigController} from "../controllers/cakeConfig.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/:productId", createCakeConfigController);
router.patch("/:productId", updateCakeConfigController);

export default router;