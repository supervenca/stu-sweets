import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", loginController);
router.post("/logout", authMiddleware, logoutController);
router.get("/me", authMiddleware, meController);

export default router;
