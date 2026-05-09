import { Router } from "express";
import * as controller from "../controllers/clients.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", controller.getClients);
router.patch("/:id/blacklist", controller.toggleBlacklist);

export default router;